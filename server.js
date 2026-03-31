const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('My Embed Server is running!');
});

// মুভি Proxy
app.get('/embed/movie/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await axios.get(`https://123movienow.cc/spa/videoPlayPage/movies/${slug}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });
    res.send(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch movie");
  }
});

// টিভি Proxy
app.get('/embed/tv/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await axios.get(`https://123movienow.cc/spa/videoPlayPage/tv/${slug}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });
    res.send(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch tv episode");
  }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
