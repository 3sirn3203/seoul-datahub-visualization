import React from "react";

export default function ChartCard({ title, kpi, note, children }) {
    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{title}</h3>
                {/* 필요 시 우측 토글/필터 자리 */}
            </div>
            {typeof kpi !== "undefined" && (
                <div className="text-2xl font-semibold mt-2 mb-3">{kpi}</div>
            )}
            {children}
            {note && <div className="text-xs text-gray-400 mt-3">{note}</div>}
        </div>
    );
}