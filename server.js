const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/fetch-movie', (req, res) => {
    const tmdbId = req.query.id;
    if (!tmdbId) return res.json({ success: false });

    // Moviebox এবং বড় সাইটগুলো এই ধরণের মাল্টি-সার্ভার এপিআই ব্যবহার করে
    const servers = [
        { name: "SuperServer 1", url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
        { name: "SuperServer 2", url: `https://vidsrc.to/embed/movie/${tmdbId}` },
        { name: "SuperServer 3", url: `https://2embed.org/e.php?id=${tmdbId}` }
    ];

    res.json({ success: true, servers: servers });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Moviebox Engine Live...'));
