// src/components/ChartCard.jsx
import React from 'react';

export default function ChartCard({
    title,
    kpi,
    note,
    children,
    className = '',
    headerRight = null,
    bodyClassName = 'h-[300px]',
    bodyStyle = {},
}) {
    return (
        <section className={`card ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-title">{title}</h3>
                {headerRight}
            </div>

            {kpi !== undefined && (
                <div className="text-2xl font-semibold text-title mt-2 mb-3">{kpi}</div>
            )}

            {/* ✅ 차트 영역은 명확한 높이를 갖도록 */}
            <div className={`w-full ${bodyClassName}`} style={bodyStyle}>
                {children}
            </div>

            {note && <div className="text-xs text-muted mt-3">{note}</div>}
        </section>
    );
}