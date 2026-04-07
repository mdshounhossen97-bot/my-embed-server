const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());

const playerHTML = (videoUrl, subtitleUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; }</style>
</head>
<body>
    <video id="player" playsinline controls crossorigin>
        <source src="${videoUrl}" type="video/mp4" />
        ${subtitleUrl ? `<track kind="captions" label="English" src="${subtitleUrl}" srclang="en" default>` : ''}
    </video>
    <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
    <script>const player = new Plyr('#player');</script>
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const id = req.query.id;
    const type = req.query.type || 'movie';

    if (!id) return res.send("<h2>Error: No TMDB ID provided!</h2>");

    const pythonProcess = spawn('python3', ['moviebox_worker.py', id, type]);
    let pythonData = "";

    pythonProcess.stdout.on('data', (data) => { pythonData += data.toString(); });
    pythonProcess.on('close', () => {
        try {
            const result = JSON.parse(pythonData);
            if (result.video) {
                res.send(playerHTML(result.video, result.subtitle));
            } else {
                res.send("<h2>Movie Not Found on Moviebox Servers.</h2>");
            }
        } catch (e) {
            res.send("<h2>Server is processing... Please refresh.</h2>");
        }
    });
});

app.listen(process.env.PORT || 3000);