import React from 'react'

export default function SectionTitle({ title }) {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-8 py-2 mx-4 bg-gray-700 text-white text-xl font-bold rounded">
                {title}
            </span>
            <div className="flex-grow border-t border-gray-400"></div>
        </div>
    )
}