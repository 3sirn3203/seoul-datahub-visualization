import React from 'react'
import Header from './components/Header'
import SectionTitle from './components/SectionTitle'
import ChartCard from './components/ChartCard'
import PetRateTimeseries from './charts/PetRateTimeseries'
import SeoulChoropleth from './charts/SeoulChoropleth'

export default function App() {
    return (
        <div className="min-h-screen bg-surface text-title font-sans">
            <Header
                title="서울시 반려동물 대시보드 (가제)"
                subtitle="Team 김대영 김우진 이재용"
            />

            <main className="w-full py-8">
                <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-8">
                    <div className="mb-8">
                        <PetRateTimeseries />
                    </div>

                    <div className="mb-8">
                        <SeoulChoropleth />
                    </div>

                    <section className="space-y-4">
                        <SectionTitle
                            title="세부 분석"
                            description="차트 컴포넌트를 분리해 유지보수성과 재사용성을 높입니다."
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <ChartCard title="자치구별 반려동물 등록 현황 (예정)">
                                <div className="h-[260px] flex items-center justify-center text-muted">(BarChart 자리)</div>
                            </ChartCard>

                            <ChartCard title="연도별 등록 추세 (예정)">
                                <div className="h-[260px] flex items-center justify-center text-muted">(LineChart 자리)</div>
                            </ChartCard>

                            <ChartCard title="반려동물 관련 시설 분포 (예정)">
                                <div className="h-[320px] flex items-center justify-center text-muted">(지도/Scatter 자리)</div>
                            </ChartCard>

                            <ChartCard title="민원/안전 관련 지표 (예정)">
                                <div className="h-[320px] flex items-center justify-center text-muted">(Pie/Heatmap 자리)</div>
                            </ChartCard>
                        </div>
                    </section>

                    <footer className="text-xs text-muted pt-8 pb-10">
                        * 현재는 목업 단계입니다. CSV/API 연결 후 실제 데이터로 대체합니다.
                    </footer>
                </div>
            </main>
        </div>
    )
}