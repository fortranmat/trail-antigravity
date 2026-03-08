#!/bin/bash
VERSES_FILE="/config/sri_chakra_verses.txt"
TAMIL_FILE="/config/current_tamil.txt"
ENGLISH_FILE="/config/current_english.txt"
INTERVAL=30

mapfile -t TAMIL_LINES < <(grep -E "^[0-9]+\|[^a-zA-Z]*[அ-ஹ]" "$VERSES_FILE")
mapfile -t ENGLISH_LINES < <(grep -E "^[0-9]+\|[a-zA-Z]" "$VERSES_FILE")
TOTAL=${#TAMIL_LINES[@]}

echo "${TAMIL_LINES[0]#*|}" > "$TAMIL_FILE"
echo "${ENGLISH_LINES[0]#*|}" > "$ENGLISH_FILE"

INDEX=0
while true; do
  TAMIL_TEXT="${TAMIL_LINES[$INDEX]#*|}"
  ENGLISH_TEXT="${ENGLISH_LINES[$INDEX]#*|}"
  echo "$TAMIL_TEXT" > "${TAMIL_FILE}.tmp" && mv "${TAMIL_FILE}.tmp" "$TAMIL_FILE"
  echo "$ENGLISH_TEXT" > "${ENGLISH_FILE}.tmp" && mv "${ENGLISH_FILE}.tmp" "$ENGLISH_FILE"
  echo "[$(date '+%H:%M:%S')] Avarana $((INDEX+1)): $ENGLISH_TEXT"
  sleep $INTERVAL
  INDEX=$(( (INDEX + 1) % TOTAL ))
done
