const express = require('express');
const cors = require('cors');
const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  target: targets.NATIVE,
});

app.get('/api', async (req, res) => {
  const { id, type } = req.query;
  try {
    const output = await providers.runAll({
      media: { type: type === 'tv' ? 'show' : 'movie', tmdbId: id }
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <style>
        body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .container { width: 100%; height: 100%; }
        video { width: 100%; height: 100%; }
        :root { --plyr-color-main: #E50914; }
      </style>
    </head>
    <body>
      <div class="container">
        <video id="player" playsinline controls></video>
      </div>
      <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const video = document.querySelector('#player');
          const player = new Plyr(video);

          fetch('/api?id=${id}&type=${type}')
            .then(res => res.json())
            .then(data => {
              const streamUrl = data.playlist || (data.qualities && Object.values(data.qualities)[0].url);
              
              if (!streamUrl) {
                alert("Movie not found on any server!");
                return;
              }

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
            })
            .catch(err => console.error("Error loading stream:", err));
        });
      </script>
    </body>
    </html>
  `;
  res.send(playerHTML);
});

app.listen(port, () => console.log('Server Fixed & Running!'));
