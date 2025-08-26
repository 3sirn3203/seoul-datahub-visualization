// src/charts/SeoulChoropleth.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import * as XLSX from "xlsx";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";

// 지도/엑셀 위치 (public/ 아래 경로)
const GEOJSON_URL = "/data/seoul_municipalities_geo.json";
const DATASETS = {
    petHouseholds: {
        label: "반려동물 가구 비율",
        file: "/data/house_pet_ratio.xlsx",
        nameCol: 0,   // A열
        valueCol: 1,  // B열
        startRow: 1,  // 2행부터 데이터
    },
    abandoned: {
        label: "유기동물",
        file: "/data/abandoned_pet.xlsx",
        nameCol: 0,
        valueCol: 1,
        startRow: 1,
    },
    hospitals: {
        label: "동물병원",
        file: "/data/pet_hospital.xlsx",
        nameCol: 0,
        valueCol: 1,
        startRow: 1,
    },
    pharmacies: {
        label: "동물약국",
        file: "/data/pet_pharmacy.xlsx",
        nameCol: 0,
        valueCol: 1,
        startRow: 1,
    },
};

// 서울 25개 자치구 리스트
const SEOUL_GU = [
    "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구",
    "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구",
    "관악구", "서초구", "강남구", "송파구", "강동구"
];

const subtitleMap = {
    "반려동물 가구 비율": "2024년 기준 자치구별 반려동물 보유 가구 비율 현황",
    "유기동물": "2023년 기준 서울시 자치구별 유기동물 발생 현황",
    "동물병원": "2025년 8월 기준 서울시 자치구별 운영 중인 동물병원 현황",
    "동물약국": "2025년 8월 기준 서울시 자치구별 운영 중인 동물약국 현황",
};

// 구 이름 정규화
function normalizeGuName(raw) {
    if (!raw) return "";
    let s = String(raw).trim();
    // "서울특별시 강남 구" 같은 케이스 처리
    s = s.replace(/^서울특별시\s*/, "").replace(/\s*구$/, "구");
    return s;
}

// 공통 파서: A열=자치구명, B열=값, startRow=2행
function parseExcelToMap(ws, { nameCol = 0, valueCol = 1, startRow = 1 } = {}) {
    const map = new Map();
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let r = Math.max(startRow, range.s.r); r <= range.e.r; r++) {
        const nameCell = ws[XLSX.utils.encode_cell({ r, c: nameCol })];
        const valCell = ws[XLSX.utils.encode_cell({ r, c: valueCol })];

        const nameRaw = nameCell?.v;
        const valRaw = valCell?.v;

        if (!nameRaw && !valRaw) continue;

        const name = normalizeGuName(nameRaw);
        const value = Number(String(valRaw).replace(/[^\d.-]/g, ""));

        if (!Number.isFinite(value)) continue;
        if (!SEOUL_GU.includes(name)) continue;

        map.set(name, value);
    }
    return map;
}

export default function SeoulChoropleth() {
    const [geo, setGeo] = useState(null);
    const [metric, setMetric] = useState("petHouseholds");
    const [valueMap, setValueMap] = useState(new Map());
    const [hoverInfo, setHoverInfo] = useState(null); // {name, value, x, y}

    const isPercentMetric = DATASETS[metric].label === "반려동물 가구 비율";
    const isAnimalCnt = DATASETS[metric].label === "유기동물";
    const formatValue = (v) =>
        isPercentMetric ? `${Number(v).toFixed(1)}%` : Number(v).toLocaleString();

    // 1) 지도 로드
    useEffect(() => {
        fetch(GEOJSON_URL)
            .then(res => res.json())
            .then(setGeo)
            .catch(e => console.error("GeoJSON load error:", e));
    }, []);

    // 2) 지표(버튼) 변경 시 엑셀 로드
    useEffect(() => {
        const load = async () => {
            try {
                const config = DATASETS[metric];
                const ab = await (await fetch(config.file)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                setValueMap(parseExcelToMap(ws, config));
            } catch (e) {
                console.error("Excel parse error:", e);
                setValueMap(new Map());
            }
        };
        load();
    }, [metric]);

    // 3) 색상 스케일
    const colorScale = useMemo(() => {
        const vals = Array.from(valueMap.values()).filter(v => Number.isFinite(v));
        const min = Math.min(...vals, 0);
        const max = Math.max(...vals, 1);
        const domainMax = max <= 0 ? 1 : max;
        return scaleSequential(interpolateBlues).domain([min, domainMax]);
    }, [valueMap]);

    // 버튼 컴포넌트
    const MetricButton = ({ id }) => (
        <button
            onClick={() => setMetric(id)}
            className={`rounded-full px-4 py-2 border ${metric === id
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-title border-subtle"
                } shadow-sm hover:shadow transition`}
        >
            {DATASETS[id].label}
        </button>
    );

    return (
        <section className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-medium text-title">서울시 자치구별 지표 히트맵</h3>
                    <p className="text-sm text-muted">
                        {subtitleMap[DATASETS[metric].label] || "2024년 기준 서울시 현황"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <MetricButton id="petHouseholds" />
                    <MetricButton id="abandoned" />
                    <MetricButton id="hospitals" />
                    <MetricButton id="pharmacies" />
                </div>
            </div>

            <div className="w-full h-[480px] md:h-[600px] lg:h-[600px] bg-white rounded-xl">
                {geo ? (
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [127.0, 37.56], scale: 72000 }}
                        width={980}
                        height={600}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <Geographies geography={geo}>
                            {({ geographies, projection }) => (
                                <>
                                    {/* 1) 구 경계 도형 */}
                                    {geographies.map((g) => {
                                        const name =
                                            g.properties?.name ||
                                            g.properties?.SIG_KOR_NM ||
                                            g.properties?.adm_nm;

                                        const v = valueMap.get(name) ?? 0;
                                        const fill = colorScale(v);

                                        return (
                                            <Geography
                                                key={g.rsmKey}
                                                geography={g}
                                                fill={fill}
                                                stroke="#fff"
                                                strokeWidth={0.8}
                                                onMouseEnter={(evt) =>
                                                    setHoverInfo({ name, value: v, x: evt.clientX, y: evt.clientY })
                                                }
                                                onMouseLeave={() => setHoverInfo(null)}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { outline: "none", filter: "brightness(1.05)" },
                                                    pressed: { outline: "none" },
                                                }}
                                            />
                                        );
                                    })}

                                    {/* 2) 구 이름 라벨 */}
                                    {geographies.map((g) => {
                                        const name =
                                            g.properties?.name ||
                                            g.properties?.SIG_KOR_NM ||
                                            g.properties?.adm_nm;

                                        // 중심점 계산 (경도/위도)
                                        const [lon, lat] = geoCentroid(g);

                                        // 위치 보정 (필요한 구만 살짝 이동)
                                        const tweak = ({
                                            종로구: { dx: 0, dy: -4 },
                                            중구: { dx: 0, dy: 8 },
                                            용산구: { dx: 0, dy: 6 },
                                        })[name] || { dx: 0, dy: 0 };

                                        // 해당 구의 값과 라벨 텍스트
                                        const v = valueMap.get(name) ?? 0;
                                        const valueText = isPercentMetric
                                            ? `${Number(v).toFixed(1)}%`
                                            : isAnimalCnt ? `${Number(v).toLocaleString()}마리` : `${Number(v).toLocaleString()}개`;

                                        return (
                                            <Marker key={`${g.rsmKey}-label`} coordinates={[lon, lat]}>
                                                {/* ① 구 이름 */}
                                                <text
                                                    textAnchor="middle"
                                                    x={tweak.dx}
                                                    y={tweak.dy - 4}   // 이름은 조금 위
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                        paintOrder: "stroke",
                                                        stroke: "white",
                                                        strokeWidth: 3,
                                                        fill: "#0f172a",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {name}
                                                </text>

                                                {/* ② 값 라벨 (이름 아래) */}
                                                <text
                                                    textAnchor="middle"
                                                    x={tweak.dx}
                                                    y={tweak.dy + 12}   // 값은 이름보다 아래
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                        paintOrder: "stroke",
                                                        stroke: "white",
                                                        strokeWidth: 3,
                                                        fill: "#0f172a",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {valueText}
                                                </text>
                                            </Marker>
                                        );
                                    })}
                                </>
                            )}
                        </Geographies>
                    </ComposableMap>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted">
                        지도를 불러오는 중…
                    </div>
                )}
            </div>

            {/* 간단 툴팁 */}
            {hoverInfo && (
                <div
                    className="pointer-events-none fixed z-50 rounded-md bg-black/80 text-white text-sm px-2 py-1"
                    style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
                >
                    <div className="font-medium">{hoverInfo.name}</div>
                    <div className="opacity-90">
                        {DATASETS[metric].label}: {formatValue(hoverInfo.value)}
                    </div>
                </div>
            )}
        </section>
    );
}