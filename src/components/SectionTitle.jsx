import React from "react";

export default function SectionTitle({ title, description }) {
    return (
        <div className="mb-2">
            <h2 className="text-lg font-medium">{title}</h2>
            {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
}