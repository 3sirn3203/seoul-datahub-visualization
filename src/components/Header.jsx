import React from 'react'

export default function Header({ title, subtitle }) {
    return (
        <header className="w-full bg-surface border-b border-subtle">
            <div className="w-full px-4 md:px-6 py-6">
                <h1 className="text-3xl font-bold text-title">{title}</h1>
                <p className="text-muted mt-1">{subtitle}</p>
            </div>
        </header>
    )
}