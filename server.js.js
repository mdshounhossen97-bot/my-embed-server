const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/play', async (req, res) => {
    const { id, type } = req.query;
    if (!id) return res.status(400).send('ID is required');

    // আপনার বের করা মেইন এপিআই লিঙ্ক
    const targetUrl = `https://123movienow.cc/spa/videoPlayPage/${type === '2' ? 'tv' : 'movies'}/play?id=${id}&type=${type || 1}&lang=en&host=moviebox.ph`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.moviebox.ph/',
                'Origin': 'https://www.moviebox.ph'
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching data from MovieBox');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});