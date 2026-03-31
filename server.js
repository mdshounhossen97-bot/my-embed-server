const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Moviebox Movie Route
app.get('/embed/moviebox/:title', async (req, res) => {
  const title = req.params.title;

  try {
    // Moviebox API থেকে data আনো
    const response = await fetch(`https://moviebox-api.herokuapp.com/api/v1/movie/${encodeURIComponent(title)}`);
    const data = await response.json();

    const streamLink = data.stream_link;

    const iframe = `
      <iframe src="${streamLink}" 
              width="100%" height="500" 
              frameborder="0" allowfullscreen>
      </iframe>`;
    res.send(iframe);
  } catch (err) {
    res.status(500).send("Error fetching movie data");
  }
});

// Moviebox TV Route
app.get('/embed/moviebox/tv/:title/:season/:episode', async (req, res) => {
  const { title, season, episode } = req.params;

  try {
    const response = await fetch(`https://moviebox-api.herokuapp.com/api/v1/series/${encodeURIComponent(title)}?s=${season}&e=${episode}`);
    const data = await response.json();

    const streamLink = data.stream_link;

    const iframe = `
      <iframe src="${streamLink}" 
              width="100%" height="500" 
              frameborder="0" allowfullscreen>
      </iframe>`;
    res.send(iframe);
  } catch (err) {
    res.status(500).send("Error fetching series data");
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
