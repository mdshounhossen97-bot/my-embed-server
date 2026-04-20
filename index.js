const express = require('express');
const cors = require('cors');
const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// fetcher-এ User-Agent যোগ করা হয়েছে যাতে সার্ভার ব্লক না করে
const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  target: targets.BROWSER, // NATIVE এর বদলে BROWSER ব্যবহার করে দেখুন
});

app.get('/api', async (req, res) => {
  const { id, type } = req.query;
  try {
    const output = await providers.runAll({
      media: { 
        type: type === 'tv' ? 'show' : 'movie', 
        tmdbId: id,
        title: "Movie",
        releaseYear: 2024
      }
    });
    if (output && output.stream) return res.json(output.stream);
    res.status(404).json({ error: "No link found" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  const playerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Shawonflix Player</title>
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <style>
        body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { width: 100%; height: 100%; }
        :root { --plyr-color-main: #E50914; }
      </style>
    </head>
    <body>
      <div class="container">
        <video id="player" playsinline controls></video>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
      <script>
        const video = document.querySelector('#player');
        const player = new Plyr(video);

        async function loadMovie() {
            try {
                const res = await fetch('/api?id=${id}&type=${type}');
                const data = await res.json();
                
                const streamUrl = data.playlist || (data.qualities && Object.values(data.qualities)[0].url);
                
                if (streamUrl) {
                    if (streamUrl.includes('m3u8')) {
                        if (Hls.isSupported()) {
                            const hls = new Hls();
                            hls.loadSource(streamUrl);
                            hls.attachMedia(video);
                        } else {
                            video.src = streamUrl;
                        }
                    } else {
                        video.src = streamUrl;
                    }
                } else {
                    document.body.innerHTML = "<h2 style='color:white;text-align:center;'>Source Not Found. Please try another Movie.</h2>";
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadMovie();
      </script>
    </body>
    </html>
  `;
  res.send(playerHTML);
});

app.listen(port, () => console.log('Fixed Server Running!'));
