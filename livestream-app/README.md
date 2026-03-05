# LiveStream Pro - Mockup

This is a functional mockup of the LiveStream Pro application designed for a 24/7 video loop. It includes a basic frontend interface and a backend RTMP/HLS streaming server powered by NGINX and FFmpeg in Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/) installed.
- A video file you want to loop (e.g., meditation, relaxing music).

## Getting Started on your VPS

### 1. Upload the Project
Use an FTP client (like WinSCP or FileZilla) to upload this entire `livestream-app` folder to your VPS (e.g., to `/root/livestream-app`).

### 2. Prepare your Video
1. Place your long video file into the `livestream-app/videos/` folder.
2. Ensure the video file is named exactly `stream.mp4`.

*(A small sample video has been provided by default for testing. This line was updated to test GitHub Actions deployment).*

### 3. Start the Server
SSH into your VPS, navigate to the project directory, and start the Docker containers in the background:

```bash
cd /path/to/livestream-app
docker compose up -d
```
*(Note: FFmpeg will automatically start looping your `stream.mp4` video directly to the NGINX server without needing OBS studio).*

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

**To update the video:**
If you want to change the playing video, overwrite `/videos/stream.mp4` with a new file and restart just the FFmpeg container:
```bash
docker compose restart ffmpeg-streamer
```

**To stop everything:**
When you are done testing, you can stop and remove the containers with:
```bash
docker compose down
```
