// src/charts/HousingTypePie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/house_type.xlsx"; // public/data/...

// 파스텔 톤 파레트 (원하면 교체)
const COLORS = [
    "#1F5EEE", "#60A5FA", "#93C5FD", "#A78BFA",
    "#F59E0B", "#34D399", "#F97316", "#FB7185",
];

export default function HousingTypePie() {
    const [rows, setRows] = useState([]); // [{name, value}...]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // 헤더는 1행이라고 가정 → 2행부터 스캔
                for (let r = range.s.r + 1; r <= range.e.r; r++) {
                    const nameCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]; // A열
                    const valCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B열
                    const name = nameCell?.v?.toString().trim();
                    const raw = valCell?.v;

                    if (!name) continue;
                    // "1,713,267" 같은 문자열도 허용
                    const value = Number(String(raw).replace(/[^\d.-]/g, ""));
                    if (!Number.isFinite(value)) continue;

                    out.push({ name, value });
                }
                setRows(out);
            } catch (e) {
                console.error("엑셀 로드/파싱 오류:", e);
                setRows([]);
            }
        })();
    }, []);

    // ✅ 총합을 메모이제이션 (툴팁 퍼센트 계산에 사용)
    const total = useMemo(
        () => rows.reduce((s, d) => s + (d.value || 0), 0),
        [rows]
    );

    const data = rows;

    return (
        <section className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="chart-title">동물들은 이곳에 살고 있어요</h3>
                    <p className="text-sm text-muted mt-0.5 pl-8">
                        2020년 기준 거처의 형태별 반려동물 가구 수 현황
                    </p>
                </div>
            </div>
            

            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                    <PieChart>
                        {/* 가운데 총합 */}
                        <text
                            x="50%"
                            y="42%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-700"
                            style={{ fontSize: 18, fontWeight: 600 }}
                        >
                            {total ? total.toLocaleString() : "—"} 가구
                        </text>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            labelLine={false}
                            label={false}
                            isAnimationActive={false}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>

                        {/* ✅ Tooltip: total로 직접 퍼센트 계산 → NaN% 방지 */}
                        <Tooltip
                            formatter={(value, name) => {
                                const v = Number(value) || 0;
                                const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
                                return [`${v.toLocaleString()} 가구`, `${name} (${pct}%)`];
                            }}
                        />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}