import React from 'react'

export default function ChartCard({ title, kpi, note, children, className = '' }) {
    return (
        <section className={`card ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-title">{title}</h3>
            </div>

            {kpi !== undefined && (
                <div className="text-2xl font-semibold text-title mt-2 mb-3">{kpi}</div>
            )}

            {children}

            {note && <div className="text-xs text-muted mt-3">{note}</div>}
        </section>
    )
}