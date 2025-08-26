// src/charts/PetCountsPie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/pet_counts.xlsx"; // public/data/pet_counts.xlsx

// 색상 (개/고양이)
const COLORS = ["#1F5EEE", "#F97316"]; // 개(파랑), 고양이(주황)

export default function PetTypePie() {
    const [rows, setRows] = useState([]); // [{ name: "개", value: 653972 }, { name: "고양이", value: 15859 }]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // 1행은 헤더라고 가정 → 2행부터 끝까지 스캔
                for (let r = range.s.r + 1; r <= range.e.r; r++) {
                    const nameCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]; // A열
                    const valCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B열
                    const rawName = nameCell?.v;
                    const rawVal = valCell?.v;

                    if (!rawName && !rawVal) continue;

                    const name = String(rawName).trim();                    // "개" | "고양이"
                    const value = Number(String(rawVal).replace(/[^\d.-]/g, "")); // "653,972" → 653972
                    if (!name || !Number.isFinite(value)) continue;

                    out.push({ name, value });
                }

                // "개", "고양이" 순서로 정렬(선택)
                out.sort((a, b) => (a.name === "개" ? -1 : 1));
                setRows(out);
            } catch (e) {
                console.error("엑셀 로드/파싱 오류:", e);
                setRows([]);
            }
        })();
    }, []);

    // 총합(중앙 표시/퍼센트 계산에 사용)
    const total = useMemo(
        () => rows.reduce((s, d) => s + (d.value || 0), 0),
        [rows]
    );

    // 툴팁 퍼센트 NaN 방지: payload/value/total로 직접 계산
    const tooltipFormatter = (value, _name, ctx) => {
        const pct = total ? ((Number(value) / total) * 100) : 0;
        return [
            `${Number(value).toLocaleString()} 마리`,
            `${ctx?.payload?.name ?? ""} (${pct.toFixed(1)}%)`,
        ];
    };

    return (
        <section className="card p-4 h-full flex flex-col">
            <div className="mb-3">
                <div>
                    <h3 className="font-medium text-title">개 vs 고양이</h3>
                    <p className="text-sm text-muted">
                        2025년 인식표 신고 기준 개 vs 고양이 비교
                    </p>
                </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <PieChart>
                        {/* 중앙 총합 */}
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-700"
                            style={{ fontSize: 18, fontWeight: 600 }}
                        >
                            {total ? total.toLocaleString() : "—"} 마리
                        </text>

                        <Pie
                            data={rows}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            // 라벨: 각 조각의 퍼센트를 안전하게 계산
                            label={(p) => {
                                const pct = total ? (p.value / total) * 100 : 0;
                                return `${p.name} ${pct.toFixed(1)}%`;
                            }}
                        >
                            {rows.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip formatter={tooltipFormatter} />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}