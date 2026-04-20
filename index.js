const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Shawonflix High-Speed Server is Live!');
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
        .container { width: 100%; height: 100%; position: relative; }
        #player { width: 100%; height: 100%; }
        :root { --plyr-color-main: #E50914; }
        .error-msg { color: white; text-align: center; font-family: sans-serif; display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <video id="player" playsinline controls crossorigin></video>
        <div id="error" class="error-msg">Failed to load stream. Try another ID.</div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
      
      <script>
        const video = document.querySelector('#player');
        const errorMsg = document.getElementById('error');
        const type = "${type}" === "tv" ? "tv" : "movie";
        const tmdbId = "${id}";

        // ২০২৬ সালের লেটেস্ট গেটওয়ে লিঙ্ক
        const streamSource = "https://vidsrc.xyz/embed/" + type + "/" + tmdbId;

        // প্লেয়ার সেটআপ
        const player = new Plyr(video, {
            captions: { active: true, update: true, language: 'en' }
        });

        async function loadStream() {
            try {
                // আমরা সরাসরি গেটওয়ে থেকে স্ট্রীম লিঙ্কটি ধরার চেষ্টা করবো
                // যদি সোর্স সরাসরি ফাইল দেয় তবে সেটি Plyr এ চলবে
                // অন্যথায় আমরা একটি ক্লিন এমবেড লোড করবো যা দেখতে আপনার প্লেয়ারের মতোই
                
                const response = await fetch(streamSource);
                if (response.ok) {
                    // যেহেতু আমরা সরাসরি ডিরেক্ট লিঙ্ক স্ক্র্যাপ করতে পারছি না, 
                    // আমরা এই গেটওয়েটিকে একটি স্যান্ডবক্স আইফ্রেমের মাধ্যমে লোড করবো 
                    // যাতে আপনার সাইটে কোনো পপ-আপ অ্যাড না আসে।
                    
                    document.querySelector('.container').innerHTML = \`
                        <iframe 
                            src="\${streamSource}" 
                            width="100%" 
                            height="100%" 
                            frameborder="0" 
                            scrolling="no" 
                            allowfullscreen 
                            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation">
                        </iframe>\`;
                } else {
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                errorMsg.style.display = 'block';
            }
        }

        loadStream();
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => console.log('Final Gateway Server Running!'));
