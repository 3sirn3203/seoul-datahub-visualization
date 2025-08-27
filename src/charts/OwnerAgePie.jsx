// src/charts/OwnerAgePie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/owner_age.xlsx"; // public/data/owner_age.xlsx

// 색상 팔레트 (연령대별)
const COLORS = [
    "#60A5FA", // 20대 이하
    "#34D399", // 30대
    "#FBBF24", // 40대
    "#F472B6", // 50대
    "#6366F1", // 60대 이상
];

export default function OwnerAgePie() {
    const [rows, setRows] = useState([]); // [{ name, value }...]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // 1행은 헤더 → 2행부터
                for (let r = range.s.r + 1; r <= range.e.r; r++) {
                    const ageCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]; // A열
                    const valCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B열
                    const age = ageCell?.v?.toString().trim();
                    const raw = valCell?.v;

                    if (!age) continue;
                    const value = Number(String(raw).replace(/[^\d.-]/g, ""));
                    if (!Number.isFinite(value)) continue;

                    out.push({ name: age, value });
                }
                setRows(out);
            } catch (e) {
                console.error("엑셀 로드 오류:", e);
                setRows([]);
            }
        })();
    }, []);

    // 총합
    const total = useMemo(
        () => rows.reduce((s, d) => s + (d.value || 0), 0),
        [rows]
    );

    return (
        <section className="card p-4">
            <div className="mb-3">
                <h3 className="font-medium text-title">연령대별 반려동물 인구</h3>
                <p className="text-sm text-muted">
                    연령대별 반려동물 인구 수 분포
                </p>
            </div>

            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                    <PieChart>
                        {/* 중앙 총합 */}
                        <text
                            x="50%"
                            y="46%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-700"
                            style={{ fontSize: 18, fontWeight: 600 }}
                        >
                            {total ? total.toLocaleString() : "—"} 명
                        </text>

                        <Pie
                            data={rows}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            label={(p) => {
                                const pct = total ? (p.value / total) * 100 : 0;
                                return `${p.name} ${pct.toFixed(1)}%`;
                            }}
                            isAnimationActive={false}
                        >
                            {rows.map((d, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value, name) => {
                                const v = Number(value) || 0;
                                const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
                                return [`${v.toLocaleString()} 명`, `${name} (${pct}%)`];
                            }}
                        />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}