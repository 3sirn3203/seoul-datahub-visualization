// src/components/Header.jsx
import React from 'react';

export default function Header({
    title,
    subtitle,
    styleType = 'bottom', // 'bg' | 'bottom'
    imageSrc = '/images/title-background.jpg',
}) {
    if (styleType === 'bg') {
        // 1) 배경형 헤더
        return (
            <header className="relative w-full h-[240px] bg-surface border-b border-subtle">
                {/* 배경 이미지 */}
                <div
                    className="absolute inset-0 bg-cover bg-right md:bg-center"
                    style={{ backgroundImage: `url('${imageSrc}')` }}
                    aria-hidden="true"
                />
                {/* 가독성용 그라디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/80" aria-hidden="true" />

                <div className="relative mx-auto max-w-screen-2xl w-full h-full flex flex-col items-center justify-center px-4 md:px-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 drop-shadow-sm text-center">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-slate-600 text-center">{subtitle}</p>
                    )}
                </div>
            </header>
        );
    }

    // 2) 하단 장식형 헤더 (기본)
    return (
        <header className="w-full border-b border-subtle bg-surface">
            <div className="mx-auto max-w-screen-2xl w-full px-4 md:px-6 pt-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-title">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted mt-1">{subtitle}</p>
                )}
            </div>

            {/* 장식 이미지: 텍스트 아래에 귀여운 배너처럼 */}
            <div className="mx-auto max-w-screen-2xl w-full px-4 md:px-6 pb-4">
                <img
                    src={imageSrc}
                    alt=""
                    className="
            mt-3 h-28 md:h-36 w-full
            object-contain object-center select-none pointer-events-none
            [mask-image:linear-gradient(to_top,black,transparent_20%)]   /* 위쪽을 자연스럽게 페이드아웃 */
          "
                />
            </div>
        </header>
    );
}