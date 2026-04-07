const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/watch', (req, res) => {
    const movieId = req.query.id; // TMDB ID (যেমন: 762441)
    const s = req.query.s || '1';

    if (!movieId) return res.status(400).send("Movie ID is required");

    let embedUrl = "";

    // এগুলো হলো আসল এম্বেড এপিআই যা যেকোনো প্লেয়ারে কাজ করে
    const sources = {
        '1': `https://vidsrc.me/embed/movie?tmdb=${movieId}`, // গ্লোবাল সোর্স ১
        '2': `https://vidsrc.to/embed/movie/${movieId}`,    // গ্লোবাল সোর্স ২
        '3': `https://autoembed.to/movie/tmdb/${movieId}`,   // গ্লোবাল সোর্স ৩
        '4': `https://embed.su/embed/movie/${movieId}`       // গ্লোবাল সোর্স ৪
    };

    embedUrl = sources[s] || sources['1'];

    // এটি সরাসরি এম্বেড প্লেয়ার ওপেন করবে যা আপনার ব্লগে সাপোর্ট করবে
    res.redirect(embedUrl);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
