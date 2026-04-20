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

// ১. এটি এপিআই হিসেবে কাজ করবে (ডাটা পাওয়ার জন্য)
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

// ২. এটি সরাসরি প্লেয়ার পেজ হিসেবে কাজ করবে (এমবেড করার জন্য)
app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  // এই HTML টি সরাসরি ব্রাউজারে সুন্দর একটি প্লেয়ার দেখাবে
  const playerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <style>
        body { margin: 0; background: #000; overflow: hidden; }
        .container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        #player { width: 100%; height: 100%; }
        :root { --plyr-color-main: #E50914; }
      </style>
    </head>
    <body>
      <div class="container">
        <video id="player" playsinline controls></video>
      </div>
      <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
      <script>
        const player = new Plyr('#player');
        fetch('/api?id=${id}&type=${type}')
          .then(res => res.json())
          .then(data => {
            const streamUrl = data.playlist || (data.qualities && Object.values(data.qualities)[0].url);
            if (streamUrl) {
              player.source = {
                type: 'video',
                sources: [{ src: streamUrl, type: streamUrl.includes('m3u8') ? 'application/x-mpegURL' : 'video/mp4' }]
              };
            }
          })
          .catch(() => alert('Movie Source Not Found!'));
      </script>
    </body>
    </html>
  `;
  res.send(playerHTML);
});

app.listen(port, () => console.log('Shawonflix Hybrid Server Ready!'));
