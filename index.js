const express = require('express');
const cors = require('cors');
const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// এই প্রক্সিটি রেন্ডারের আইপি মাস্ক করে রিকোয়েস্ট পাঠাবে
const PROXY_URL = 'https://corsproxy.io/?'; 

const providers = makeProviders({
  fetcher: makeStandardFetcher((url, options) => {
    // শুধুমাত্র মুভি সোর্স রিকোয়েস্টগুলোর জন্য প্রক্সি ব্যবহার করা হবে
    return fetch(PROXY_URL + encodeURIComponent(url), options);
  }),
  target: targets.NATIVE,
});

app.get('/', (req, res) => {
  res.send('Shawonflix Pro-Scraper is Online!');
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
    res.status(404).json({ success: false, message: "Server busy or link not found" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/embed', (req, res) => {
  const { id, type } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <style>
        body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { width: 100%; height: 100%; }
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
        const video = document.querySelector('#player');
        const player = new Plyr(video);

        async function start() {
          try {
            const res = await fetch('/api/scrape?id=${id}&type=${type}');
            const data = await res.json();
            if (data.success) {
              const url = data.stream.playlist || data.stream.qualities["1080"].url || data.stream.qualities["720"].url;
              if (url.includes('m3u8')) {
                if (Hls.isSupported()) {
                  const hls = new Hls();
                  hls.loadSource(url);
                  hls.attachMedia(video);
                } else { video.src = url; }
              } else { video.src = url; }
            } else {
              document.body.innerHTML = "<h3 style='color:white;text-align:center;'>Searching on other servers... Please wait.</h3>";
              // এখানে আপনি চাইলে অন্য কোনো ব্যাকআপ সোর্স কল করতে পারেন
            }
          } catch (e) { console.error(e); }
        }
        start();
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => console.log('Proxy Scraper Server Active!'));
