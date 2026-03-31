const express = require('express');
const axios = require('axios');
const app = express();

// মুভি Proxy
app.get('/embed/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await axios.get(`https://moviebox.ph/embed/movie/${movieId}`);
    res.send(response.data); 
  } catch (err) {
    res.status(500).send("Failed to fetch movie");
  }
});

// সিরিজ Proxy
app.get('/embed/tv/:id/:s/:e', async (req, res) => {
  const { id, s, e } = req.params;
  try {
    const response = await axios.get(`https://moviebox.ph/embed/tv/${id}&s=${s}&e=${e}`);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Failed to fetch tv episode");
  }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
