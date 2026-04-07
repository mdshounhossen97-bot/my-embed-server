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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    if (!id) return res.send("<h2>Please provide a Movie ID!</h2>");

    const pythonProcess = spawn('python3', ['moviebox_worker.py', id]);
    let pythonData = "";
    
    // ২০ সেকেন্ড পর যদি মুভি না পায় তবে এরর দিবে
    const timer = setTimeout(() => {
        pythonProcess.kill();
        res.send("<h2>Movie Server Timeout. Please try another movie!</h2>");
    }, 25000);

    pythonProcess.stdout.on('data', (data) => { pythonData += data.toString(); });
    
    pythonProcess.on('close', () => {
        clearTimeout(timer);
        try {
            const result = JSON.parse(pythonData);
            if (result.video) {
                res.send(playerHTML(result.video, result.subtitle));
            } else {
                res.send("<h2>Movie not found in Moviebox database.</h2>");
            }
        } catch (e) {
            res.send("<h2>Server is busy. Try again after 1 minute!</h2>");
        }
    });
});

app.listen(process.env.PORT || 3000);
