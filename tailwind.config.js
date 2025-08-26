/** @type {import('tailwindcss').Config} */
export default {
    // 토큰 우선 적용이 안 먹을 때는 아래 주석 해제 (특이성 ↑)
    // important: '#root',
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#1F5EEE',
                    secondary: '#16A34A',
                    accent: '#F59E0B',
                    muted: '#64748B',
                    bg: '#F8FAFC',
                    card: '#FFFFFF',
                    border: '#E5E7EB',
                },
            },
            fontFamily: {
                sans: ['Pretendard', 'ui-sans-serif', 'system-ui'],
            },
            boxShadow: {
                card: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
            },
            borderRadius: {
                xl: '14px',
                '2xl': '16px',
            },
        },
    },
    plugins: [],
}