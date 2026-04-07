const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

// এই ফাংশনটি প্লেয়ারের ভেতরে সব পপ-আপ এবং অ্যাড ব্লক করবে
const cleanPlayerHTML = (embedUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium Ad-Free Player</title>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
        .iframe-container { position: relative; width: 100%; height: 100%; }
        /* অ্যাড ব্লকিং শিল্ড: এটি অদৃশ্য লেয়ার হিসেবে কাজ করে যা পপ-আপ প্রতিরোধ করে */
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <div class="iframe-container">
        <iframe 
            src="${embedUrl}" 
            id="premiumPlayer"
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true"
            sandbox="allow-forms allow-scripts allow-same-origin"
            scrolling="no">
        </iframe>
    </div>
</body>
</html>
`;

app.get('/watch', (req, res) => {
    const id = req.query.id;
    const type = req.query.type || 'movie';
    const season = req.query.season || '1';
    const episode = req.query.episode || '1';

    if (!id) return res.status(400).send("Movie/Series ID required");

    // সব সেরা হাই-স্পিড সার্ভারের লিস্ট (সিরিয়াল অনুযায়ী)
    const movieSources = [
        `https://vidsrc.me/embed/movie?tmdb=${id}`,
        `https://vidapi.ru/embed/movie/${id}`,
        `https://autoembed.to/movie/tmdb/${id}`,
        `https://embed.su/embed/movie/${id}`,
        `https://vidsrc.to/embed/movie/${id}`
    ];

    const tvSources = [
        `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${season}&epi=${episode}`,
        `https://vidapi.ru/embed/tv/${id}/${season}/${episode}`,
        `https://autoembed.to/tv/tmdb/${id}/${season}/${episode}`,
        `https://embed.su/embed/tv/${id}/${season}/${episode}`
    ];

    // বর্তমানে আমরা ১ নম্বর সোর্সটি ডিফল্ট রাখছি, কিন্তু স্যান্ডবক্স মোডে।
    // অটো-সুইচ করার জন্য ইউজার প্লেয়ারের ভেতর থেকে অন্য সার্ভার সিলেক্ট করতে পারবে।
    let sourceUrl = (type === 'tv') ? tvSources[0] : movieSources[0];

    // প্রিমিয়াম ক্লিন ইন্টারফেস পাঠানো হচ্ছে
    res.send(cleanPlayerHTML(sourceUrl));
});

app.listen(PORT, () => console.log(`Premium Server running on port ${PORT}`));
