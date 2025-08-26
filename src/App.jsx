import React from "react";
import Header from "./components/Header";
import SectionTitle from "./components/SectionTitle";
import ChartCard from "./components/ChartCard";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* 상단 헤더 */}
            <Header
                title="서울시 반려동물 대시보드 (가제)"
                subtitle="서울 데이터 허브 기반 인사이트 · Mock 데이터 (초안)"
            />

            {/* 본문 */}
            <main className="w-full px-0 md:px-6 py-8 bg-gray-50">
                {/* 섹션: 개요 */}
                <section>
                    <SectionTitle
                        title="개요"
                        description="서울시 반려동물 등록 현황, 시설 분포, 민원·안전 데이터 등을 통합 시각화합니다."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ChartCard title="등록 반려동물 수 (누적)" kpi="—" note="데이터 연결 전" />
                        <ChartCard title="자치구 평균 등록률" kpi="—" note="데이터 연결 전" />
                        <ChartCard title="유기·입양 비율" kpi="—" note="데이터 연결 전" />
                    </div>
                </section>

                {/* 섹션: 차트 placeholder (나중에 각 차트를 컴포넌트로) */}
                <section className="space-y-4">
                    <SectionTitle
                        title="세부 분석"
                        description="차트 컴포넌트를 분리해 유지보수성과 재사용성을 높입니다."
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 예: charts/PetsByDistrict.jsx 로 분리 예정 */}
                        <ChartCard title="자치구별 반려동물 등록 현황 (예정)">
                            <div className="h-[260px] flex items-center justify-center text-gray-400">
                                (BarChart 자리)
                            </div>
                        </ChartCard>

                        {/* 예: charts/RegistrationTrend.jsx 로 분리 예정 */}
                        <ChartCard title="연도별 등록 추세 (예정)">
                            <div className="h-[260px] flex items-center justify-center text-gray-400">
                                (LineChart 자리)
                            </div>
                        </ChartCard>

                        {/* 예: charts/PetFacilitiesMap.jsx 로 분리 예정 */}
                        <ChartCard title="반려동물 관련 시설 분포 (예정)">
                            <div className="h-[320px] flex items-center justify-center text-gray-400">
                                (지도/Scatter 자리)
                            </div>
                        </ChartCard>

                        <ChartCard title="민원/안전 관련 지표 (예정)">
                            <div className="h-[320px] flex items-center justify-center text-gray-400">
                                (Pie/Heatmap 자리)
                            </div>
                        </ChartCard>
                    </div>
                </section>

                {/* 하단 주석 */}
                <footer className="text-xs text-gray-500 pt-8 pb-10">
                    * 현재는 목업 단계입니다. CSV/API 연결 후 실제 데이터로 대체합니다.
                </footer>
            </main>
        </div>
    );
}