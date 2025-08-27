// src/charts/AdoptionSourcePie.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/** 엑셀 경로 (public/ 아래) */
const EXCEL_URL = "/data/adoption_type.xlsx";
/**
 * 스크린샷 구조 가정
 *  A1: (빈칸/지역명 라벨),  B1..H1: 항목명,  A2: "서울시",  B2..H2: 값
 *  -> B열부터 끝 열까지 1행(라벨), 2행(값)만 읽는다.
 */
const COLORS = [
    "#2563EB", // 동물판매업소
    "#F97316", // 지인 유상 입양
    "#10B981", // 지인 무상 입양
    "#A78BFA", // 인터넷
    "#06B6D4", // 유기동물 입양
    "#F59E0B", // 반려동물 2세
];

export default function AdoptionTypePie() {
    const [rows, setRows] = useState([]); // [{name,value}...]

    useEffect(() => {
        (async () => {
            try {
                const ab = await (await fetch(EXCEL_URL)).arrayBuffer();
                const wb = XLSX.read(ab, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                const out = [];
                // B열(=c=1)부터 마지막 열까지: 1행 라벨, 2행 값
                for (let c = Math.max(1, range.s.c); c <= range.e.c; c++) {
                    const labelCell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];     // 1행
                    const valueCell = ws[XLSX.utils.encode_cell({ r: range.s.r + 1, c })]; // 2행
                    const name = labelCell?.v ? String(labelCell.v).trim() : "";
                    const raw = valueCell?.v;
                    if (!name) continue;
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

    const total = useMemo(
        () => rows.reduce((s, d) => s + (d.value || 0), 0),
        [rows]
    );

    // 툴팁: 값 + 퍼센트
    const tooltipFormatter = (value, _name, ctx) => {
        const pct = total ? (Number(value) / total) * 100 : 0;
        return [
            `${Number(value).toLocaleString()} ( ${pct.toFixed(1)}% )`,
            ctx?.payload?.name ?? "",
        ];
    };

    return (
        <section className="card p-4">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-medium text-title">반려동물 입양 경로 구성</h3>
                    <p className="text-sm text-muted">
                        서울시 기준, 입양 경로별 비중(%)을 파이 차트로 나타냅니다.
                    </p>
                </div>
            </div>

            {/* 차트 + 우측 범례 레이아웃 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* 파이 (구멍 없는 형태) */}
                <div className="col-span-3" style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer>
                        <PieChart margin={{ top: 12, right: 60, bottom: 24, left: 36 }}>
                            <Pie
                                data={rows}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={120}
                                // 파이 라벨: 바깥에 퍼센트만 간결하게
                                label={({ name, value }) => {
                                    const pct = total ? (value / total) * 100 : 0;
                                    return `${name} ${pct.toFixed(1)}%`;
                                }}
                                labelLine
                            >
                                {rows.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={tooltipFormatter} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 커스텀 범례 (우측) */}
                <div className="col-span-1">
                    <ul className="space-y-2">
                        {rows.map((d, i) => {
                            const pct = total ? (d.value / total) * 100 : 0;
                            return (
                                <li key={d.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="text-sm">{d.name}</span>
                                    </div>
                                    <span className="text-sm text-muted">
                                        {pct.toFixed(1)}%
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {/* 총합(선택) */}
                    {total > 0 && (
                        <div className="mt-4 text-xs text-muted">
                            합계: {total.toLocaleString()}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}