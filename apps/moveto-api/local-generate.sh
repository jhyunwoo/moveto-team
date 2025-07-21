#!/bin/bash

# 적용 내역을 저장할 파일
LOG_FILE="applied_sql_files.txt"
DB_NAME="moveto-api"
SQL_DIR="./drizzle"

# 파일이 없으면 생성
touch "$LOG_FILE"

# drizzle 폴더의 모든 .sql 파일에 대해 반복
for sql_file in "$SQL_DIR"/*.sql; do
  # 파일 이름만 추출
  file_name=$(basename "$sql_file")

  # 로그 파일에 존재하지 않으면 실행
  if ! grep -Fxq "$file_name" "$LOG_FILE"; then
    echo "Applying: $file_name"
    npx wrangler d1 execute "$DB_NAME" --local --file="$sql_file" -e dev

    # 성공적으로 실행되었을 경우에만 로그에 기록
    if [ $? -eq 0 ]; then
      echo "$file_name" >> "$LOG_FILE"
    else
      echo "❌ Failed to apply $file_name"
    fi
  else
    echo "✅ Already applied: $file_name"
  fi
done