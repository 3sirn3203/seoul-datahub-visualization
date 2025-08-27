// src/charts/HouseholdSizePetBars.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/house_mem_with_pet_type.xlsx";

const COLORS = {
    dog: "#4F46E5",   // 개
    cat: "#F97316",   // 고양이
    other: "#06B6D4", // 기타
};

function toNumber(v) {
    const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

export default function HousingMemWithPetType() {
    const [rows, setRows] = useState([]); // [{type, dog, cat, other}...]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // 1행 헤더 → 2행부터 스캔
                for (let r = range.s.r + 1; r <= range.e.r; r++) {
                    const typeCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]; // A: 1인가구 ...
                    const dogCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B: 개
                    const catCell = ws[XLSX.utils.encode_cell({ r, c: 2 })]; // C: 고양이
                    const otherCell = ws[XLSX.utils.encode_cell({ r, c: 3 })]; // D: 기타

                    const type = typeCell?.v?.toString().trim();
                    if (!type) continue;

                    out.push({
                        type,
                        dog: toNumber(dogCell?.v),
                        cat: toNumber(catCell?.v),
                        other: toNumber(otherCell?.v),
                    });
                }
                setRows(out);
            } catch (e) {
                console.error("엑셀 로드/파싱 오류:", e);
                setRows([]);
            }
        })();
    }, []);

    // Y 도메인 살짝 여유
    const [yMin, yMax] = useMemo(() => {
        const vals = rows.flatMap(d => [d.dog, d.cat, d.other]);
        const min = Math.min(...vals, 0);
        const max = Math.max(...vals, 1);
        return [0, Math.ceil(max * 1.1)];
    }, [rows]);

    return (
        <section className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="chart-title">어떤 가구가 어떤 동물과 살까</h3>
                    <p className="text-sm text-muted pl-8">
                        2020년 기준 가구 형태와 반려동물 유형의 관계
                    </p>
                </div>
            </div>

            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={rows}
                        margin={{ top: 12, right: 24, bottom: 24, left: 24 }}
                        barCategoryGap="24%"   // 묶음 사이
                        barGap={6}             // 묶음 내부 막대 사이
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="type"
                            tickMargin={8}
                        />
                        <YAxis
                            domain={[yMin, yMax]}
                            tickFormatter={(v) => v.toLocaleString()}
                            tickMargin={8}
                        />
                        <Tooltip
                            formatter={(v, n) => [`${Number(v).toLocaleString()} 가구`, n]}
                            labelFormatter={(l) => l}
                        />
                        <Legend />

                        {/* 묶음(그룹) 막대: 같은 X에 나란히 표시 */}
                        <Bar dataKey="dog" name="개" fill={COLORS.dog} />
                        <Bar dataKey="cat" name="고양이" fill={COLORS.cat} />
                        <Bar dataKey="other" name="기타" fill={COLORS.other} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}