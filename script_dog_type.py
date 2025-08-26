# breed_pivot_top10.py
import pandas as pd
from pathlib import Path

# ====== 경로 설정 ======
IN_XLSX  = Path("./data/region_with_pet_type.xlsx")   # 원본 파일 경로로 바꿔주세요
OUT_XLSX = Path("./public/data/region_with_cat_type.xlsx")
OUT_XLSX.parent.mkdir(parents=True, exist_ok=True)

# ====== 로드 & 전처리 ======
df = pd.read_excel(IN_XLSX, dtype=str)

def to_int(x):
    if pd.isna(x):
        return 0
    x = str(x).replace(",", "").strip()
    return int(x) if x.isdigit() or (x.startswith("-") and x[1:].isdigit()) else 0

df["CNT"] = df["CNT"].map(to_int)

for col in ["LVSTCK_KND", "SGG", "SPCS"]:
    df[col] = df[col].fillna("").astype(str).str.strip()

# ====== 1) 개만 필터 ======
dogs = df[df["LVSTCK_KND"] == "고양이"].copy()

# (선택) 자치구 표기 통일
dogs["SGG"] = dogs["SGG"].str.replace(r"\s*구$", "구", regex=True)

# ====== 2) 품종 전체 합 기준 TOP10 선정 ======
breed_totals = (
    dogs.groupby("SPCS", as_index=False)["CNT"].sum()
    .sort_values("CNT", ascending=False)
)
top10 = breed_totals.head(10)["SPCS"].tolist()

# ====== 3) TOP10 외는 '기타'로 묶기 ======
dogs["SPCS_TOP"] = dogs["SPCS"].where(dogs["SPCS"].isin(top10), "기타")

# ====== 4) 피벗 테이블 (행: SGG, 열: 품종, 값: CNT 합) ======
pivot = pd.pivot_table(
    dogs,
    index="SGG",
    columns="SPCS_TOP",
    values="CNT",
    aggfunc="sum",
    fill_value=0,
)

# 열 정렬: TOP10 순서 + 기타
ordered_cols = [c for c in top10 if c in pivot.columns] + (["기타"] if "기타" in pivot.columns else [])
pivot = pivot.reindex(columns=ordered_cols)

# ▼ 여기부터: 행 순서 고정 ------------------------------------
ORDERED_SGG = [
    "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
    "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구",
    "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
    "서초구", "강남구", "송파구", "강동구",
]
# pivot의 인덱스를 Categorical로 지정하여 정렬
pivot.index = pd.Categorical(pivot.index, categories=ORDERED_SGG, ordered=True)
pivot = pivot.sort_index()
# 만약 ORDERED_SGG에 없던 자치구가 있으면(오타/누락) 뒤쪽에 붙이려면:
if pivot.index.isna().any():
    # NaN 인덱스(순서 목록에 없는 구)만 따로 빼서 원래 이름을 복원
    extra = pivot[pd.isna(pivot.index)].copy()
    extra.index = dogs.loc[dogs["SGG"].isin(extra.index.astype(str)), "SGG"].unique()
    # 위 라인이 상황에 따라 맞지 않을 수 있으니, 간단히 reindex로 처리하는 방법:
    pivot = pivot.reset_index()  # Categorical -> 문자열
    pivot = pivot.set_index("SGG")
    pivot = pivot.reindex(ORDERED_SGG + [idx for idx in pivot.index if idx not in ORDERED_SGG])
# ------------------------------------------------------------

# (선택) 총합 열/행 추가
pivot["합계"] = pivot.sum(axis=1)
total_row = pivot.sum(axis=0).to_frame().T
total_row.index = ["합계"]
result = pd.concat([pivot, total_row], axis=0)

# ====== 저장 ======
with pd.ExcelWriter(OUT_XLSX, engine="openpyxl") as xw:
    result.to_excel(xw, sheet_name="피벗", index=True)

print(f"✅ 저장 완료: {OUT_XLSX.resolve()}")