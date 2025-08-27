// src/charts/RegionBreedBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * 기대 엑셀 구조(각 파일 첫번째 시트):
 *  - 행: SGG (자치구명)
 *  - 열: 품종명 (예: 시츄, 요크셔테리어, ...)
 *  - 값: CNT 합
 * 예시)
 * | SGG  | 시츄 | 요크셔테리어 | ... | 기타 |
 * | 종로구 | 10  | 5          | ... | 2   |
 */
const FILES = {
  dog: "/data/region_with_dog_type.xlsx",
  cat: "/data/region_with_cat_type.xlsx",
};

const SPECIES_LABEL = {
  dog: "개",
  cat: "고양이",
};

// 숫자 변환 유틸("1,234" -> 1234)
function toNumber(v) {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// 워크북(첫 시트) -> { districts: string[], breeds: string[], table: Map<district, Map<breed, number>> }
function parseWorkbook(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws["!ref"]);
  if (!range) return { districts: [], breeds: [], table: new Map() };

  // 헤더(품종) 추출: 1행(A1=행헤더, B1~ = 품종)
  const breeds = [];
  for (let c = range.s.c + 1; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
    const header = cell?.v?.toString().trim();
    if (header) breeds.push(header);
  }

  const table = new Map();
  const districts = [];

  // 데이터 행
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const nameCell = ws[XLSX.utils.encode_cell({ r, c: range.s.c })];
    const district = nameCell?.v?.toString().trim();
    if (!district) continue;
    districts.push(district);

    const breedMap = new Map();
    for (let j = 0; j < breeds.length; j++) {
      const c = range.s.c + 1 + j;
      const vcell = ws[XLSX.utils.encode_cell({ r, c })];
      breedMap.set(breeds[j], toNumber(vcell?.v));
    }
    table.set(district, breedMap);
  }

  return { districts, breeds, table };
}

export default function RegionBreedBar() {
  const [wbDog, setWbDog] = useState(null);
  const [wbCat, setWbCat] = useState(null);

  // UI 상태
  const [species, setSpecies] = useState(""); // "dog" | "cat"
  const [district, setDistrict] = useState(""); // "종로구" 등
  const [chartData, setChartData] = useState([]); // [{breed, value}]
  const [loading, setLoading] = useState(false);

  // 엑셀 로드
  useEffect(() => {
    (async () => {
      try {
        const [abDog, abCat] = await Promise.all([
          fetch(FILES.dog).then((r) => r.arrayBuffer()),
          fetch(FILES.cat).then((r) => r.arrayBuffer()),
        ]);
        setWbDog(XLSX.read(abDog, { type: "array" }));
        setWbCat(XLSX.read(abCat, { type: "array" }));
      } catch (e) {
        console.error("엑셀 로드 실패:", e);
      }
    })();
  }, []);

  // 파싱된 구조 메모
  const dogParsed = useMemo(() => (wbDog ? parseWorkbook(wbDog) : null), [wbDog]);
  const catParsed = useMemo(() => (wbCat ? parseWorkbook(wbCat) : null), [wbCat]);

  // 선택 가능한 자치구 목록(두 파일 합집합)
  const districtOptions = useMemo(() => {
    const set = new Set();
    dogParsed?.districts.forEach((d) => set.add(d));
    catParsed?.districts.forEach((d) => set.add(d));
    return Array.from(set);
  }, [dogParsed, catParsed]);

  const canQuery = species && district;

  function handleQuery() {
    setLoading(true);
    try {
      const parsed = species === "dog" ? dogParsed : catParsed;
      if (!parsed) {
        setChartData([]);
        setLoading(false);
        return;
      }
      const breedMap = parsed.table.get(district);
      if (!breedMap) {
        setChartData([]);
        setLoading(false);
        return;
      }

      // [{ breed, value }] 생성 후 값 기준 내림차순 정렬, 상위 20개 표시 (너무 많으면 가독성↓)
      const rows = Array.from(breedMap.entries()).map(([breed, value]) => ({
        breed,
        value,
      }));
      rows.sort((a, b) => b.value - a.value);

      // 0인 항목은 제거
      const filtered = rows.filter((d) => d.value > 0);

      setChartData(filtered.slice(0, 20));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="chart-title">우리 동네 품종 분포</h3>
          <p className="text-sm text-muted pl-8">
            2025년 인식표 신고 기준 자치구별 품종 분포 현황
          </p>
        </div>

        {/* 컨트롤 영역 */}
        <div className="flex items-center gap-2">
          <select
            className="min-w-[120px] h-10 px-3 rounded-lg border border-subtle bg-white text-base leading-none"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="">대상 선택</option>
            <option value="dog">개</option>
            <option value="cat">고양이</option>
          </select>

          <select
            className="min-w-[140px] h-10 px-3 rounded-lg border border-subtle bg-white text-base leading-none"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">자치구 선택</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleQuery}
            disabled={!canQuery || loading}
            className={`h-10 px-4 rounded-lg border ${
              canQuery && !loading
                ? "bg-brand-primary text-white border-brand-primary hover:opacity-90"
                : "bg-gray-100 text-gray-400 border-subtle cursor-not-allowed"
            }`}
          >
            {loading ? "조회 중…" : "조회"}
          </button>
        </div>
      </div>

      {/* 차트 */}
      <div style={{ width: "100%", height: 340 }}>
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted">
            {canQuery ? "조회 버튼을 눌러 결과를 확인하세요." : "대상과 자치구를 선택하세요."}
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 24, bottom: 12, left: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="breed"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip
                formatter={(v) => Number(v).toLocaleString()}
                labelFormatter={(name) => `품종: ${name}`}
              />
              <Legend />
              <Bar
                dataKey="value"
                name={`${SPECIES_LABEL[species]} (${district})`}
                fill="#1F5EEE"
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}