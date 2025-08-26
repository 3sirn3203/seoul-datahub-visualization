# count_pet_hospitals_by_gu.py
import json
import re
from collections import Counter
from pathlib import Path

import pandas as pd

# === 설정 ===
# JSON 파일 경로
JSON_PATH = Path("./data/seoul_pet_pharmacy.json")  # 필요 시 절대/상대경로 수정
# 결과 엑셀 경로
OUT_XLSX = Path("./public/data/pet_pharmacy.xlsx")

# 서울 25개 자치구(출력 시 빠진 구는 0으로 채움)
SEOUL_GU_25 = [
    "종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구",
    "노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구",
    "관악구","서초구","강남구","송파구","강동구"
]

# "서울특별시 ○○구 ..." 형태에서 구 추출 정규식
GU_REGEX = re.compile(r"^서울특별시\s+([가-힣]+구)\b")

def extract_gu(addr: str) -> str | None:
    """주소 문자열에서 '○○구' 추출 (없으면 None)"""
    if not addr:
        return None
    m = GU_REGEX.search(addr.strip())
    return m.group(1) if m else None

def main():
    # JSON 로드
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        obj = json.load(f)

    rows = obj.get("DATA", [])  # 실제 데이터는 DATA 배열에 존재

    # 1) 상세영업상태명 '정상'만 필터
    normal = (r for r in rows if (r.get("dtlstatenm") == "정상"))

    # 2) 지번주소(sitewhladdr)에서 '○○구' 추출
    #    (sitewhladdr가 비어 있으면 rdnwhladdr(도로명주소)로 보조 추출)
    counts = Counter()
    for r in normal:
        gu = extract_gu(r.get("sitewhladdr")) or extract_gu(r.get("rdnwhladdr"))
        if gu:
            counts[gu] += 1

    # 3) 25개 구 모두 포함한 DataFrame 생성 (없는 구는 0 채움)
    data = [{"구": gu, "동물약국_수": counts.get(gu, 0)} for gu in SEOUL_GU_25]
    df = pd.DataFrame(data)

    # 4) 엑셀 저장
    with pd.ExcelWriter(OUT_XLSX, engine="openpyxl") as xw:
        df.to_excel(xw, index=False, sheet_name="병원수")

    print(f"완료: {OUT_XLSX.resolve()}")
    print(df.to_string(index=False))

if __name__ == "__main__":
    main()