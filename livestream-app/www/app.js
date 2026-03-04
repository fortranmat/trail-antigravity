document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video-player');
    const videoSrc = '/hls/test.m3u8';
    const chatMessages = document.getElementById('chat-messages');

    // Simple chat simulation
    const fakeMessages = [
        "This is so relaxing! ✨",
        "Where is this playing from?",
        "Love the vibes here",
        "Can't stop watching this...",
        "Perfect background stream",
        "Hello from Brazil! 🇧🇷",
        "Amazing quality",
        "Anyone here?",
        "So peaceful 🧘‍♀️"
    ];

    const fakeUsers = ["User_992", "ChillVibes", "Alex", "Guest", "StreamFan", "Zoe", "MusicLover"];

    function addSystemMessage(text) {
        const msgEl = document.createElement('div');
        msgEl.className = 'message system';
        msgEl.innerHTML = `<em>${text}</em>`;
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addChatMessage() {
        const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const msg = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
        
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        msgEl.innerHTML = `<span class="user">${user}:</span> ${msg}`;
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Schedule next random message between 5 and 15 seconds
        setTimeout(addChatMessage, Math.random() * 10000 + 5000);
    }

    addSystemMessage("Attempting to connect to livestream...");

    function initPlayer() {
        if (Hls.isSupported()) {
            const hls = new Hls({
                maxLiveSyncPlaybackRate: 1.5,
            });
            
            // Re-attempt loading on error
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("fatal network error encountered, try to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("fatal media error encountered, try to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

            hls.loadSource(videoSrc);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                addSystemMessage("Connected to live broadcast! 🔴");
                video.play().catch(e => console.log("Auto-play prevented by browser."));
                setTimeout(addChatMessage, 4000);
            });
            
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Apple Native Support
            video.src = videoSrc;
            video.addEventListener('loadedmetadata', function () {
                addSystemMessage("Connected to live broadcast! 🔴");
                video.play().catch(e => console.log("Auto-play prevented by browser."));
                setTimeout(addChatMessage, 4000);
            });
        }
    }

    // Try starting the player
    // Note: FFmpeg takes ~10 seconds to generate the first .m3u8 chunk.
    // We retry connecting over an interval if it fails immediately.
    let attempts = 0;
    const attemptInterval = setInterval(() => {
        fetch(videoSrc, { method: 'HEAD' })
            .then(res => {
                if (res.ok) {
                    clearInterval(attemptInterval);
                    initPlayer();
                } else {
                    throw new Error("Not exact yet");
                }
            })
            .catch(() => {
                attempts++;
                if (attempts === 1) addSystemMessage("Waiting for streamer to start broadcasting...");
                if (attempts > 10) {
                    clearInterval(attemptInterval);
                    addSystemMessage("Could not connect to stream. Please refresh the page later.");
                }
            });
    }, 2000);
});
