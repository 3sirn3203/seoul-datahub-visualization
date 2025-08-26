import pandas as pd

# 입력 파일 경로
INPUT_FILE = "./data/region_with_pet_type.xlsx"   # 원본 파일 이름으로 변경
OUTPUT_FILE = "./public/data/pet_counts.xlsx"

def main():
    # 엑셀 읽기
    df = pd.read_excel(INPUT_FILE)

    # 필요한 컬럼만 선택
    if "LVSTCK_KND" not in df.columns or "CNT" not in df.columns:
        raise ValueError("엑셀에 'LVSTCK_KND'와 'CNT' 컬럼이 존재하지 않습니다.")

    # '개'와 '고양이'만 필터링
    df_filtered = df[df["LVSTCK_KND"].isin(["개", "고양이"])]

    # 그룹별 합계 계산
    result = df_filtered.groupby("LVSTCK_KND")["CNT"].sum().reset_index()

    # 결과 엑셀로 저장
    result.to_excel(OUTPUT_FILE, index=False)

    print("✅ 집계 완료! 결과가", OUTPUT_FILE, "로 저장되었습니다.")
    print(result)

if __name__ == "__main__":
    main()