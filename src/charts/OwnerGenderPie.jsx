// src/charts/OwnerGenderPie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/owner_gender.xlsx"; // public/data/owner_gender.xlsx

// 색상: 남/여
const COLORS = {
    남성: "#3B82F6",   // 블루
    여성: "#F472B6",   // 핑크
};

export default function OwnerGenderPie() {
    const [rows, setRows] = useState([]); // [{ name:'남성', value:836213 }, { name:'여성', value:1169691 }]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // 1행 헤더 → 2행부터 끝까지 스캔
                for (let r = range.s.r + 1; r <= range.e.r; r++) {
                    const nameCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]; // A열
                    const valCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B열
                    const name = nameCell?.v ? String(nameCell.v).trim() : "";
                    const raw = valCell?.v;
                    if (!name) continue;

                    // "1,169,691" → 1169691
                    const value = Number(String(raw).replace(/[^\d.-]/g, ""));
                    if (!Number.isFinite(value)) continue;

                    out.push({ name, value });
                }

                // 보기 좋게 남성 → 여성 순으로 정렬(선택)
                out.sort((a, b) => (a.name === "남성" ? -1 : 1));
                setRows(out);
            } catch (e) {
                console.error("엑셀 로드/파싱 오류:", e);
                setRows([]);
            }
        })();
    }, []);

    const total = useMemo(
        () => rows.reduce((s, d) => s + (d.value || 0), 0),
        [rows]
    );

    const getColor = (name) => COLORS[name] || "#94A3B8";

    return (
        <section className="card p-4">
            <div className="mb-3">
                <h3 className="chart-title">우리 주인님/집사님의 성별은?</h3>
                <p className="text-sm text-muted pl-8">
                    2023년 기준 성별별 반려동물 인구 현황
                </p>
            </div>

            <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                    <PieChart>
                        {/* 도넛 중앙 총합 (살짝 위로) */}
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
                            // 라벨 선을 줄이고 싶으면 다음 줄을 활성화 (혹은 false로 완전 제거)
                            // labelLine={false}
                            isAnimationActive={false}
                        >
                            {rows.map((d, i) => (
                                <Cell key={i} fill={getColor(d.name)} />
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