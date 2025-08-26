// src/components/PetRateTimeseries.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/** 엑셀 파일 경로 (public/) */
const EXCEL_URL = "/data/pet_household_rate.xlsx";

/** 엑셀 열 번호 -> A1 열 문자로 (1->A, 2->B, 27->AA ...) */
function colToLetter(col) {
    let s = "";
    while (col > 0) {
        const mod = (col - 1) % 26;
        s = String.fromCharCode(65 + mod) + s;
        col = Math.floor((col - 1) / 26);
    }
    return s;
}
const cell = (col, row) => `${colToLetter(col)}${row}`;

/** 숫자·퍼센트 문자열 -> number */
function toNumber(v) {
    if (v == null) return NaN;
    const s = String(v).replace(/[^\d.-]/g, ""); // %, 공백, 콤마 제거
    const num = Number(s);
    return Number.isFinite(num) ? num : NaN;
}

const LAYOUT = {
    yearIndex: { col: 3, row: 1 },  // C1
    districtIndex: { col: 2, row: 9 }, // B9
    dataTopLeft: { col: 3, row: 9 },  // C9 : (첫 연도, 첫 자치구) 교차점
};

/** 시트에서 한 방향(가로/세로)으로 인덱스 읽기 */
function readIndex(ws, startCol, startRow, direction /* "right" | "down" */, valueToNumber = false) {
    const out = [];
    let r = startRow, c = startCol;
    for (let i = 0; i < 1000; i++) { // 안전상 한계치
        const addr = cell(c, r);
        const v = ws[addr]?.v;
        if (v == null || v === "") break;
        out.push(valueToNumber ? toNumber(v) : String(v).trim());
        if (direction === "right") c++;
        else r++;
    }
    return out;
}

function readYearsSmart(ws, startCol, startRow) {
    const horiz = readIndex(ws, startCol, startRow, "right", true).filter(Number.isFinite);
    return { list: horiz, direction: "right" };
}

/** 자치구 인덱스는 세로로만 읽음 */
function readDistricts(ws, startCol, startRow) {
    return readIndex(ws, startCol, startRow, "down", false).filter(s => s);
}

/** 데이터 매트릭스 읽기: dataTopLeft 기준으로 [row][col] 순회 */
function readMatrix(ws, topLeftCol, topLeftRow, nRows, nCols) {
    const rows = [];
    for (let i = 0; i < nRows; i++) {
        const arr = [];
        for (let j = 0; j < nCols; j++) {
            const v = ws[cell(topLeftCol + j, topLeftRow + i)]?.v;
            arr.push(toNumber(v)); // 퍼센트/문자 포함 가능
        }
        rows.push(arr);
    }
    return rows;
}

export default function PetRateTimeseries() {
    const [districts, setDistricts] = useState([]);
    const [years, setYears] = useState([]);
    const [direction, setDirection] = useState("right"); // 연도 진행 방향
    const [matrix, setMatrix] = useState([]);      // [row(district)][col(year)] => number
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(EXCEL_URL);
                if (!res.ok) throw new Error(`엑셀 로딩 실패: ${res.status}`);
                const ab = await res.arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];

                // 1) 인덱스 읽기
                const { list: yearList, direction: yearDir } =
                    readYearsSmart(ws, LAYOUT.yearIndex.col, LAYOUT.yearIndex.row);
                const districtList = readDistricts(ws, LAYOUT.districtIndex.col, LAYOUT.districtIndex.row);

                if (!yearList.length || !districtList.length) {
                    throw new Error("연도/자치구 인덱스가 비어있습니다. LAYOUT 상수를 확인하세요.");
                }

                // 2) 데이터 매트릭스 읽기
                let data = [];
                if (yearDir === "right") {
                    // top-left에서 (행: 자치구 수, 열: 연도 수)
                    data = readMatrix(ws, LAYOUT.dataTopLeft.col, LAYOUT.dataTopLeft.row, districtList.length, yearList.length);
                } else {
                    const tmp = readMatrix(ws, LAYOUT.dataTopLeft.col, LAYOUT.dataTopLeft.row, yearList.length, districtList.length);
                    // 전치
                    const transposed = Array.from({ length: districtList.length }, (_, i) =>
                        Array.from({ length: yearList.length }, (_, j) => tmp[j][i])
                    );
                    data = transposed;
                }

                setYears(yearList);
                setDirection(yearDir);
                setDistricts(districtList);
                setMatrix(data);
                setSelected(districtList[0] ?? "");
            } catch (e) {
                console.error(e);
                alert(e.message || "엑셀 파싱 오류가 발생했습니다. LAYOUT 좌표를 확인하세요.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 선택 자치구의 시계열
    const series = useMemo(() => {
        if (!selected || !districts.length || !years.length || !matrix.length) return [];
        const rowIdx = districts.indexOf(selected);
        if (rowIdx < 0) return [];
        return years.map((y, i) => ({ year: y, rate: matrix[rowIdx][i] })).filter(d => Number.isFinite(d.rate));
    }, [selected, districts, years, matrix]);

    return (
        <section className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-medium text-title">자치구별 반려동물 보유 가구 비율 (2014–2024)</h3>
                    <p className="text-sm text-muted">
                        *2015, 2018년 데이터 부재로 평균값으로 대체
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="min-w-[120px] h-10 px-3 rounded-lg border border-subtle bg-white text-base leading-none"
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                    >
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ width: "100%", height: 360 }}>
                <ResponsiveContainer>
                    <BarChart data={series} margin={{ top: 12, right: 36, bottom: 24, left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            type="category"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={v => String(v)}
                            padding={{ left: 8, right: 16 }}
                            tickMargin={8}
                        />
                        <YAxis
                            domain={[
                                (dataMin) => dataMin * 0.9,
                                (dataMax) => dataMax * 1.1
                            ]}
                            tickFormatter={v => `${v.toFixed(2)}%`}
                            tickMargin={8}
                        />
                        <Tooltip formatter={(v) => `${v.toFixed(2)}%`} labelFormatter={(l) => `${l}년`} />
                        <Legend />
                        <Bar
                            dataKey="rate"
                            name={`${selected} 보유 비율`}
                            fill="#1F5EEE"
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {loading && <div className="mt-2 text-sm text-muted">로딩 중…</div>}
            {!loading && selected && series.length === 0 && (
                <div className="mt-2 text-sm text-muted">해당 자치구의 데이터가 없습니다. LAYOUT 좌표를 확인하세요.</div>
            )}
        </section>
    );
}