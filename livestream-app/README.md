# LiveStream Pro - Mockup

This is a functional mockup of the LiveStream Pro application designed for a 24/7 video loop. It includes a basic frontend interface and a backend RTMP/HLS streaming server powered by NGINX and FFmpeg in Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/) installed.
- A video file you want to loop (e.g., meditation, relaxing music).

## Getting Started on your VPS

### 1. Upload the Project
Use an FTP client (like WinSCP or FileZilla) to upload this entire `livestream-app` folder to your VPS (e.g., to `/root/livestream-app`).

### 2. Prepare your Media
1. Place a single image file into the `livestream-app/images/` folder and name it exactly `background.png`.
2. Place a single audio file into the `livestream-app/audio/` folder and name it exactly `music.ogg`.

*(The streaming container will automatically loop this image and audio file continuously).*

### 3. Start the Server (via CI/CD)
This application is connected to the VPS via CI/CD. Whenever you push an update to Git here, the VPS Docker environment will automatically get updated.

If you need to manually restart or forcefully apply changes on the VPS, you can run:

```bash
cd /path/to/livestream-app
docker compose up -d --force-recreate
```
*(Note: FFmpeg will automatically start looping your image and audio directly to the NGINX server without needing OBS studio).*

### 4. Access the Web App
Open your web browser and navigate to:
```text
http://<YOUR_VPS_IP>:8081
```
It usually takes ~10-15 seconds to buffer the very first HLS stream snippet and start playing automatically on the page.

### 5. Push to YouTube Live (Production Setup)

To push the incoming 24/7 stream directly to YouTube Live to increase global watch hours:

1. Open `nginx.conf`
2. Locate the following commented-out line under the `application live` block:
   ```nginx
   # push rtmp://a.rtmp.youtube.com/live2/YOUR-YOUTUBE-STREAM-KEY;
   ```
3. Uncomment it by removing the `#` and replace `YOUR-YOUTUBE-STREAM-KEY` with your actual YouTube live stream key.
4. Restart the NGINX container to apply the changes:
   ```bash
   docker compose restart rtmp-server
   ```

## Managing the Stream

**To update the media:**
If you want to change the playing image or audio, overwrite `/images/background.png` or `/audio/music.ogg` with new files and restart just the FFmpeg container:
```bash
docker compose restart ffmpeg-streamer
```

**To stop everything:**
When you are done testing, you can stop and remove the containers with:
```bash
docker compose down
```

## Troubleshooting (No Video Render/HLS Issues)
If you see the error: `"Could not connect to stream. Please refresh the page later."`, there is likely an issue with FFmpeg or NGINX generating the stream fragments.

**Run these commands on your VPS and check the output:**

1. **Check FFmpeg Logs**: Look for any errors with the image/audio or RTMP connection.
   ```bash
   docker compose logs --tail=50 ffmpeg-streamer
   ```
2. **Check NGINX RTMP Logs**: Look for any errors regarding HLS fragment generation.
   ```bash
   docker compose logs --tail=50 rtmp-server
   ```
3. **Check if HLS Files are Generating**: The stream segments (`.ts` and `.m3u8` files) should be actively generated in the NGINX container's `/tmp/hls` directory.
   ```bash
   docker exec -it livestream-rtmp ls -la /tmp/hls
   ```
   *(If this directory is empty or missing, FFmpeg is failing to send the stream to NGINX!)*
