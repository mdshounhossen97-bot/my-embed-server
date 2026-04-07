const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

// আপনার নিজস্ব কাস্টম প্লেয়ারের ডিজাইন (HTML + CSS + JS)
const customPlayerHTML = (videoSource) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Premium Player</title>
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>
        body { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
        .video-container { width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center; }
        video { width: 100%; height: 100%; }
        /* প্লেয়ারের রঙ নিজের মতো কাস্টমাইজ করা যায় */
        :root { --plyr-color-main: #ff0000; } 
    </style>
</head>
<body>
    <div class="video-container">
        <video id="player" playsinline controls crossorigin>
            <source src="${videoSource}" type="application/x-mpegURL" />
            <source src="${videoSource}" type="video/mp4" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const video = document.querySelector('video');
            const source = video.getElementsByTagName('source')[0].src;
            
            const defaultOptions = {};

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                window.hls = hls;
            }

            const player = new Plyr(video, defaultOptions);
        });
    </script>
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const id = req.query.id;
    const type = req.query.type || 'movie';
    const s = req.query.s || '1';

    if (!id) return res.status(400).send("ID is required");

    // এখানে আমরা সরাসরি ভিডিও স্ট্রিমিং সোর্সগুলো ব্যবহার করছি
    // এই লিঙ্কগুলো সাধারণত অ্যাড ছাড়াই ভিডিও স্ট্রিম পাঠায়
    const sources = {
        '1': `https://vidsrc.me/embed/movie?tmdb=${id}`, // Primary
        '2': `https://autoembed.to/movie/tmdb/${id}`,   // Secondary
        '3': `https://vidapi.ru/embed/movie/${id}`      // Global/Hindi
    };

    const targetUrl = sources[s] || sources['1'];

    // আসল ম্যাজিক: আমরা সরাসরি সাইটে না পাঠিয়ে একটি আইফ্রেম মোডে আমাদের প্লেয়ারে পাঠাবো
    // তবে সম্পূর্ণ অ্যাড ব্লক করতে হলে আমাদের প্রক্সি সার্ভার লাগে। 
    // আপাতত আমরা আপনার নিজের প্লেয়ারে এই সোর্সটি এম্বেড করছি।
    
    res.send(`
        <body style="margin:0; background:#000;">
            <iframe src="${targetUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>
        </body>
    `);
});

app.listen(PORT, () => console.log(`Custom Player Server running on port ${PORT}`));
