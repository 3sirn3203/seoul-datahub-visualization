import React from "react";

export default function Header({ title, subtitle }) {
    return (
        <header className="w-full bg-gray-50 border-b">
            <div className="w-full px-0 md:px-6 py-6">     {/* 좌우 여백 없애기 */}
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-gray-500 mt-1">{subtitle}</p>
            </div>
        </header>
    );
}