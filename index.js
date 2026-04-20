const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Shawonflix Hybrid Player is Online!');
});

app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shawonflix Player</title>
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <style>
        body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .container { width: 100%; height: 100%; }
        #player { width: 100%; height: 100%; }
        :root { --plyr-color-main: #E50914; }
        #loader { color: white; font-family: sans-serif; position: absolute; }
      </style>
    </head>
    <body>
      <div id="loader">Fetching High Quality Stream...</div>
      <div class="container">
        <video id="player" playsinline controls></video>
      </div>

      <script type="module">
        import { makeProviders, makeStandardFetcher, targets } from 'https://cdn.skypack.dev/@movie-web/providers';

        const video = document.querySelector('#player');
        const loader = document.getElementById('loader');

        async function initScraper() {
          try {
            // ইউজারের ব্রাউজার থেকে সরাসরি স্ক্র্যাপ করা হচ্ছে
            const providers = makeProviders({
              fetcher: makeStandardFetcher(fetch),
              target: targets.BROWSER
            });

            const output = await providers.runAll({
              media: {
                type: "${type}" === "tv" ? "show" : "movie",
                tmdbId: "${id}"
              }
            });

            if (output && output.stream) {
              loader.style.display = 'none';
              const stream = output.stream;
              const sourceUrl = stream.playlist || (stream.qualities && Object.values(stream.qualities)[0].url);

              renderPlayer(sourceUrl);
            } else {
              loader.innerText = "No direct link found. Try another movie.";
            }
          } catch (err) {
            console.error(err);
            loader.innerText = "Connection Error. Please refresh.";
          }
        }

        function renderPlayer(url) {
          if (url.includes('m3u8')) {
            import('https://cdn.jsdelivr.net/npm/hls.js@latest').then((Hls) => {
              if (Hls.default.isSupported()) {
                const hls = new Hls.default();
                hls.loadSource(url);
                hls.attachMedia(video);
              }
            });
          } else {
            video.src = url;
          }
          
          import('https://cdn.plyr.io/3.7.8/plyr.js').then((Plyr) => {
            new Plyr.default(video);
          });
        }

        initScraper();
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => console.log('Client-side Scraper Server running!'));
