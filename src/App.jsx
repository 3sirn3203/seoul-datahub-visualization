import React from 'react'
import Header from './components/Header'
import SectionTitle from './components/SectionTitle'
import PetRateTimeseries from './charts/PetRateTimeseries'
import SeoulChoropleth from './charts/SeoulChoropleth'
import HousingTypePie from './charts/HousingTypePie'
import HousingMemWithPetType from './charts/HousingMemWithPetType'
import PetTypePie from './charts/PetTypePie'
import RegionBreedBar from './charts/RegionBreedBar'
import AdoptionTypePie from './charts/AdoptionTypePie'
import OwnerGenderPie from './charts/OwnerGenderPie'
import OwnerAgePie from './charts/OwnerAgePie'

export default function App() {
    return (
        <div className="min-h-screen bg-surface text-title font-sans">
            <Header
                title="우리 동네 반려동물 정보 한눈에 보기"
                subtitle="Team 동물의숲 (김대영 김우진 이재용)"
                styleType="bg"
            />

            <main className="w-full py-8">
                <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-8">
                    <section className="space-y-4 mt-16">
                        <SectionTitle title="반려동물과 함께하는 가구"/>
                        <div className="relative mb-12">
                            <PetRateTimeseries />
                            <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                [데이터 출처]: 서울시 가구원수별 가구 - 시군구 통계, 서울시 반려동물 유무 및 취득 경로 통계
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 mt-12">
                        <SectionTitle title="서울시 지도로 살펴보는 유기동물 및 반려동물 인프라 현황"/>
                        <div className="relative mb-8">
                            <SeoulChoropleth />
                            <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                [데이터 출처]: 서울시 반려동물 유무 및 취득 경로 통계, 서울시 유기동물보호 현황 통계,
                                서울시 동물병원 인허가 정보, 서울시 동물약국 인허가 정보
                            </div>
                        </div>

                    </section>

                    <section className="space-y-4 mt-12">
                        <SectionTitle title="가구 형태와 함께 살펴보는 반려동물 통계"/>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="relative mb-12">
                                <AdoptionTypePie />
                                <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                    [데이터 출처]: 서울시 반려동물 유무 및 취득 경로 통계
                                </div>
                            </div>
                            <div className="relative mb-12">
                                <HousingMemWithPetType />
                                <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                    [데이터 출처]: 가구원수별/반려동물 보유 유형별가구
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="relative mb-12">
                                <HousingTypePie />
                                <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                    [데이터 출처]: 거처의종류별/반려동물보유유형별가구
                                </div>
                            </div>
                            <div className="relative mb-12">
                                <OwnerGenderPie />
                                <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                    [데이터 출처]: 서울시 반려동물 유무 및 취득 경로 통계, 서울시 등록인구 통계
                                </div>
                            </div>
                            <div className="relative mb-12">
                                <OwnerAgePie />
                                <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                    [데이터 출처]: 서울시 반려동물 유무 및 취득 경로 통계, 서울시 등록인구(연령별/동별) 통계
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 mt-2">
                        <SectionTitle title="품종으로 살펴보는 반려동물 통계"/>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <div className="relative mb-12">
                                    <PetTypePie />
                                    <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                        [데이터 출처]: 지역별 품종 통계 (농림축산식품부 공공데이터포털)
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="relative mb-12">
                                    <RegionBreedBar />
                                    <div className="absolute top-full right-0 mt-2 text-xs text-muted pointer-events-none">
                                        [데이터 출처]: 지역별 품종 통계 (농림축산식품부 공공데이터포털)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}