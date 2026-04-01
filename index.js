const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// সাইট লিস্ট এবং তাদের বেস ইউআরএল
const SITES = {
    FZMOVIES: 'https://fzmovies.net',
    KATMOVIE: 'https://katmoviehd.nz', // ডোমেইন পরিবর্তন হতে পারে
    MOVIESCOUNTER: 'https://moviescounter.se'
};

// ১. FzMovies স্ক্র্যাপার (সহজ ডাউনলোড লিংকের জন্য)
app.get('/api/fzmovies', async (req, res) => {
    const query = req.query.q;
    try {
        const searchUrl = `${SITES.FZMOVIES}/csearch.php?searchname=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        
        let results = [];
        $('.main-video-box').each((i, el) => {
            results.push({
                title: $(el).find('a').attr('title'),
                url: SITES.FZMOVIES + '/' + $(el).find('a').attr('href'),
                img: SITES.FZMOVIES + '/' + $(el).find('img').attr('src')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "FzMovies access failed" });
    }
});

// ২. KatMovieHD স্ক্র্যাপার (এশিয়ান ড্রামা ও ডুয়াল অডিওর জন্য)
app.get('/api/katmovie', async (req, res) => {
    const query = req.query.q;
    try {
        const { data } = await axios.get(`${SITES.KATMOVIE}/?s=${encodeURIComponent(query)}`);
        const $ = cheerio.load(data);
        
        let results = [];
        $('.post-column').each((i, el) => {
            results.push({
                title: $(el).find('h2 a').text().trim(),
                url: $(el).find('h2 a').attr('href'),
                img: $(el).find('img').attr('src')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "KatMovieHD access failed" });
    }
});

// ৩. 1337x (টরেন্ট ম্যাগনেট লিংকের জন্য)
app.get('/api/1337x', async (req, res) => {
    const query = req.query.q;
    try {
        const url = `https://1337x.to/search/${encodeURIComponent(query)}/1/`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let results = [];
        $('table.table-list tbody tr').each((i, el) => {
            results.push({
                name: $(el).find('.name').text().trim(),
                seeds: $(el).find('.seeds').text(),
                url: 'https://1337x.to' + $(el).find('.name a:nth-child(2)').attr('href')
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "1337x access failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));