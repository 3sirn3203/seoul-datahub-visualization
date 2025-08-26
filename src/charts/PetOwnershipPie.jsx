// src/charts/PetOwnershipPie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const EXCEL_URL = "/data/house_type_pet.xlsx"; // public/data/house_type_pet.xlsx
const COLORS = ["#1F5EEE", "#CBD5E1"]; // 보유(파랑) / 미보유(회색)

// B열: 전체 가구수, C열: 반려동물 보유 가구수, D열: 반려동물 미보유 가구수
// 행 번호 매핑 (엑셀 시트 구조에 맞게 필요시 수정)
const HOUSEHOLD_TYPES = [
    { label: "전체", row: 3 },
    { label: "1인가구", row: 4 },
    { label: "2인가구", row: 5 },
    { label: "3인가구", row: 6 },
    { label: "4인가구", row: 7 },
    { label: "5인가구", row: 8 },
    { label: "6인가구", row: 9 },
    { label: "7인이상가구", row: 10 },
];

export default function PetOwnershipPie() {
    const [ws, setWs] = useState(null);
    const [selected, setSelected] = useState(HOUSEHOLD_TYPES[0].label);

    useEffect(() => {
        (async () => {
            const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
            const wb = XLSX.read(ab, { type: "array" });
            setWs(wb.Sheets[wb.SheetNames[0]]);
        })();
    }, []);

    // 선택된 가구유형 -> 파이 데이터
    const data = useMemo(() => {
        if (!ws) return [];
        const hit = HOUSEHOLD_TYPES.find((t) => t.label === selected);
        if (!hit) return [];

        const r = hit.row;
        const own = Number(ws[`C${r}`]?.v ?? 0);     // 보유 가구수
        const not = Number(ws[`D${r}`]?.v ?? 0);     // 미보유 가구수

        return [
            { name: "반려동물 보유", value: own },
            { name: "미보유", value: not },
        ];
    }, [ws, selected]);

    // 합계 대비 보유 비율(%) 계산 (도넛 중앙 표시용)
    const ratioText = useMemo(() => {
        const total = data.reduce((s, d) => s + d.value, 0);
        if (!total) return "—";
        const pct = (data[0].value / total) * 100;
        return `${pct.toFixed(1)}%`;
    }, [data]);

    return (
        <section className="card p-4">
            {/* 헤더: 제목 + 우상단 셀렉트 */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-title">가구 유형 별 반려동물 보유 비율</h3>

                <select
                    className="min-w-[120px] h-10 px-3 rounded-lg border border-subtle bg-white text-base leading-none"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                >
                    {HOUSEHOLD_TYPES.map((t) => (
                        <option key={t.label} value={t.label}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 차트: 카드 안에서 균형 잡힌 높이 유지 */}
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        {/* 중앙에 보유 비율 텍스트 (도넛 중앙) */}
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-700"
                            style={{ fontSize: 20, fontWeight: 600 }}
                        >
                            {ratioText}
                        </text>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={2}
                            labelLine={false}
                            // 라벨은 겹침 방지를 위해 숨김 — 툴팁/범례로 정보 제공
                            label={false}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(v, n) => [Number(v).toLocaleString(), n]}
                            labelFormatter={() => selected}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: 8 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}