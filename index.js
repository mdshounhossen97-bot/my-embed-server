const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

// এই HTML ফাইলটি আপনার নিজস্ব প্রিমিয়াম প্লেয়ার তৈরি করবে
const premiumPlayerHTML = (movieId, type, season, episode) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Premium Player</title>
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>
        body { margin: 0; background: #000; height: 100vh; overflow: hidden; font-family: sans-serif; }
        .player-wrapper { width: 100%; height: 100%; position: relative; }
        /* সার্ভার সিলেকশন মেনু ডিজাইন */
        .server-menu {
            position: absolute; top: 10px; right: 10px; z-index: 10;
            background: rgba(0,0,0,0.6); padding: 5px; border-radius: 5px;
        }
        select { background: #333; color: #fff; border: 1px solid #555; padding: 5px; cursor: pointer; }
    </style>
</head>
<body>

<div class="player-wrapper">
    <div class="server-menu">
        <select id="serverSelect" onchange="changeServer()">
            <option value="1">Server 1 (Global)</option>
            <option value="2">Server 2 (Dual Audio)</option>
            <option value="3">Server 3 (Multi Quality)</option>
            <option value="4">Server 4 (Backup)</option>
        </select>
    </div>

    <iframe id="mainPlayer" 
        src="https://vidsrc.me/embed/${type}?tmdb=${movieId}${type === 'tv' ? '&sea='+season+'&epi='+episode : ''}" 
        width="100%" height="100%" frameborder="0" 
        allowfullscreen sandbox="allow-forms allow-scripts allow-same-origin">
    </iframe>
</div>

<script>
    function changeServer() {
        const server = document.getElementById('serverSelect').value;
        const iframe = document.getElementById('mainPlayer');
        let baseUrl = "";

        if (server === "1") baseUrl = "https://vidsrc.me/embed/";
        else if (server === "2") baseUrl = "https://vidapi.ru/embed/";
        else if (server === "3") baseUrl = "https://autoembed.to/";
        else baseUrl = "https://embed.su/embed/";

        let finalUrl = "";
        if("${type}" === "movie") {
            finalUrl = (server === "3") ? baseUrl + "movie/tmdb/${movieId}" : baseUrl + "movie/${movieId}";
        } else {
            finalUrl = (server === "3") ? baseUrl + "tv/tmdb/${movieId}/${season}/${episode}" : baseUrl + "tv/${movieId}/${season}/${episode}";
        }
        
        iframe.src = finalUrl;
    }
</script>
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const id = req.query.id;
    const type = req.query.type || 'movie';
    const season = req.query.season || '1';
    const episode = req.query.episode || '1';

    if (!id) return res.status(400).send("ID Required");

    res.send(premiumPlayerHTML(id, type, season, episode));
});

app.listen(PORT, () => console.log("Premium Player is Live!"));
