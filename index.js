const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

const playerHTML = (videoUrl, isEmbed = false) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>
        body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { width: 100%; height: 100%; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <div class="container">
        ${isEmbed ? 
            `<iframe src="${videoUrl}" allowfullscreen sandbox="allow-forms allow-scripts allow-same-origin"></iframe>` : 
            `<video id="player" playsinline controls><source src="${videoUrl}" type="video/mp4" /></video>`
        }
    </div>
    ${isEmbed ? '' : `<script src="https://cdn.plyr.io/3.7.8/plyr.js"></script><script>const player = new Plyr('#player');</script>`}
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const tmdbId = req.query.id; // ব্লগের মুভি আইডি
    const type = req.query.type || 'movie';

    if (!tmdbId) return res.send("<h2>Error: No Movie ID provided!</h2>");

    // পাইথন স্ক্রিপ্টে TMDB ID পাঠানো হচ্ছে
    const pythonProcess = spawn('python3', ['moviebox_worker.py', tmdbId]);

    let pythonData = "";
    pythonProcess.stdout.on('data', (data) => { pythonData += data.toString(); });

    pythonProcess.on('close', (code) => {
        try {
            const movieData = JSON.parse(pythonData);
            if (movieData.video && movieData.video.startsWith('http')) {
                // মুভিবক্স সোর্সে পাওয়া গেছে
                return res.send(playerHTML(movieData.video, false));
            } else {
                throw new Error("Fallback to Global Server");
            }
        } catch (e) {
            // যদি মুভিবক্স এ না পাওয়া যায়, তবে Vidsrc সোর্সটি লোড হবে (যা TMDB ID তে বেস্ট)
            const fallbackUrl = type === 'tv' 
                ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&sea=${req.query.s || 1}&epi=${req.query.e || 1}`
                : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
            
            res.send(playerHTML(fallbackUrl, true));
        }
    });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
