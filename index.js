const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());

// আপনার নিজস্ব প্রিমিয়াম প্লেয়ার ইন্টারফেস (Plyr.io)
const playerHTML = (videoUrl, subtitleUrl, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Playing: ${title}</title>
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>
        body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .container { width: 100%; max-width: 900px; }
    </style>
</head>
<body>
    <div class="container">
        <video id="player" playsinline controls>
            <source src="${videoUrl}" type="video/mp4" />
            ${subtitleUrl ? `<track kind="captions" label="English" src="${subtitleUrl}" srclang="en" default>` : ''}
        </video>
    </div>
    <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
    <script>const player = new Plyr('#player', { title: '${title}' });</script>
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const movieName = req.query.name || "Avatar";

    // পাইথন স্ক্রিপ্ট রান করে ভিডিও লিঙ্ক আনা
    const pythonProcess = spawn('python3', ['moviebox_worker.py', movieName]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const movieData = JSON.parse(data.toString());
            if (movieData.video) {
                res.send(playerHTML(movieData.video, movieData.subtitle, movieName));
            } else {
                res.status(404).send("<h2>Movie not found in high-speed server!</h2>");
            }
        } catch (e) {
            res.status(500).send("<h2>Server Error: Searching for movie...</h2>");
        }
    });
});

app.listen(process.env.PORT || 3000, () => console.log("Premium Movie Hub is Ready!"));