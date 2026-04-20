const express = require('express');
const cors = require('cors');
const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// এই fetcher-টি প্রক্সি ব্যবহার করবে যাতে মুভি সাইটগুলো Render IP ব্লক না করতে পারে
const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  target: targets.NATIVE,
});

app.get('/api/scrape', async (req, res) => {
  const { id, type } = req.query;
  try {
    const output = await providers.runAll({
      media: { 
        type: type === 'tv' ? 'show' : 'movie', 
        tmdbId: id 
      }
    });

    if (output && output.stream) {
      return res.json({ success: true, stream: output.stream });
    }
    res.status(404).json({ success: false, message: "Link not found by scraper" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  const playerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
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
      <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
      <script>
        const video = document.querySelector('#player');
        const player = new Plyr(video);

        async function startStreaming() {
          try {
            const response = await fetch('/api/scrape?id=${id}&type=${type}');
            const data = await response.json();

            if (data.success) {
              const stream = data.stream;
              const streamUrl = stream.playlist || (stream.qualities && Object.values(stream.qualities)[0].url);
              
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
              alert("Scraper could not find a direct link.");
            }
          } catch (err) {
            console.error("Scraping failed:", err);
          }
        }
        startStreaming();
      </script>
    </body>
    </html>
  `;
  res.send(playerHTML);
});

app.listen(port, () => console.log('Scraper Server Active!'));
