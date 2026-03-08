# Antigravity Instructions — Sri Chakra Stream Setup

## Step 1 — Create folder structure

Create the following folders in the project root if they do not exist:
- `config/`
- `logs/`

---

## Step 2 — Create `config/sri_chakra_verses.txt`

Create file at `./config/sri_chakra_verses.txt` with this exact content:

```
1|த்ரைலோக்ய மோஹன சக்கரம் | பூபுர | ப்ரகட யோகினி | ஐம் ஹ்ரீம் ஸ்ரீம்
1|Trailokya Mohana Chakra | Bhupura | Prakata Yoginis | Aim Hrim Srim
2|சர்வாஷா பரிபூரக சக்கரம் | 16 இதழ் | குப்த யோகினி | க்லீம்
2|Sarvaasha Paripuraka Chakra | 16 Petals | Gupta Yoginis | Klim
3|சர்வ சங்க்ஷோபண சக்கரம் | 8 இதழ் | குப்த தார யோகினி | ஹ்ரீம்
3|Sarva Sankshobhana Chakra | 8 Petals | Gupta Tara Yoginis | Hrim
4|சர்வ சௌபாக்யதாயக சக்கரம் | 14 முக்கோணம் | சாம்ப்ரதாய யோகினி | ஸ்ரீம்
4|Sarva Saubhagyadayaka Chakra | 14 Triangles | Sampradaya Yoginis | Srim
5|சர்வார்த்த சாதக சக்கரம் | 10 வெளி முக்கோணம் | குலோத்தீர்ண யோகினி | க ஏ ஈ ல ஹ்ரீம்
5|Sarvartha Sadhaka Chakra | 10 Outer Triangles | Kulotteerna Yoginis | Ka E I La Hrim
6|சர்வ ரக்ஷாகர சக்கரம் | 10 உள் முக்கோணம் | நிகர்ப யோகினி | ஹ்ஸ்ரைம்
6|Sarva Rakshakara Chakra | 10 Inner Triangles | Nigarbha Yoginis | Hsraim
7|சர்வ ரோகஹர சக்கரம் | 8 முக்கோணம் | ரஹஸ்ய யோகினி | ஹ்ரீம் க்லீம் ஐம்
7|Sarva Rogahara Chakra | 8 Triangles | Rahasya Yoginis | Hrim Klim Aim
8|சர்வ சித்திப்ரத சக்கரம் | மத்திய முக்கோணம் | அதி ரஹஸ்ய யோகினி | க ஏ ஈ ல ஹ்ரீம்
8|Sarva Siddhiprada Chakra | Central Triangle | Ati Rahasya Yoginis | Ka E I La Hrim
9|சர்வானந்தமய சக்கரம் | பிந்து | பர ரஹஸ்ய யோகினி | ஹ்ரீம் - மஹா சோடசி
9|Sarvanandamaya Chakra | Bindu | Para Rahasya Yogini | Hrim - Maha Shodashi
```

---

## Step 3 — Create `config/verse_rotator.sh`

Create file at `./config/verse_rotator.sh` with this exact content:

```bash
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
```

---

## Step 4 — Review and update `docker-compose.yml`

Open the existing `docker-compose.yml` and make these changes:

### 4a — Add `verse-rotator` service (add this service block):

```yaml
  verse-rotator:
    image: bash:5
    container_name: verse_rotator
    restart: always
    volumes:
      - ./config:/config
    command: ["bash", "/config/verse_rotator.sh"]
```

### 4b — Update `ffmpeg-streamer` service:

Review and ensure these fields are exactly as below:

**volumes** — confirm these 4 mounts exist:
```yaml
    volumes:
      - ./images:/images:ro
      - ./config:/config:ro
      - ./fonts:/fonts:ro
      - ./logs:/logs
```

**environment** — confirm these exist (values come from .env):
```yaml
    environment:
      - STREAM_KEY=${STREAM_KEY}
      - LOCAL_RTMP=${LOCAL_RTMP}
```

**resource limits** — confirm or add:
```yaml
    cpus: '2.0'
    mem_limit: 1g
```

**entrypoint** — replace existing ffmpeg arguments entirely with:
```yaml
    entrypoint: >
      ffmpeg
        -re
        -loop 1
        -framerate 30
        -i /images/background.png
        -f lavfi
        -i anullsrc=r=44100:cl=stereo
        -c:v libx264
        -preset veryfast
        -b:v 3000k
        -minrate 3000k
        -maxrate 3000k
        -bufsize 3000k
        -pix_fmt yuv420p
        -r 30
        -g 60
        -keyint_min 60
        -sc_threshold 0
        -vf "drawtext=text='ஸ்ரீ சக்கரம் | Sri Chakram':fontfile=/fonts/NotoSansTamil-Regular.ttf:fontsize=56:fontcolor=gold:shadowcolor=black:shadowx=3:shadowy=3:x=(w-text_w)/2:y=40,
             drawtext=textfile=/config/current_tamil.txt:reload=1:fontfile=/fonts/NotoSansTamil-Regular.ttf:fontsize=48:fontcolor=gold:shadowcolor=black:shadowx=2:shadowy=2:x=w-mod(t*80\\,w+tw):y=h-120,
             drawtext=textfile=/config/current_english.txt:reload=1:fontfile=/fonts/NotoSans-Regular.ttf:fontsize=36:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2:x=w-mod(t*80\\,w+tw+200):y=h-65"
        -c:a aac
        -b:a 128k
        -ar 44100
        -map 0:v
        -map 1:a
        -f tee
        "[f=flv]${LOCAL_RTMP}|[f=flv:onfail=ignore]rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}"
```

---

## Notes:
- Do NOT modify `.env` values
- Do NOT touch anything inside `./fonts/`
- Do NOT touch anything inside `./images/`
- `current_tamil.txt` and `current_english.txt` inside `./config/` are auto-generated at runtime by `verse_rotator.sh` — do not create them manually
- Save all files with UTF-8 encoding to preserve Tamil characters correctly
