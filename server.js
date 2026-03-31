const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('My Embed Server is running!');
});

// মুভি Proxy → সরাসরি iframe ফেরত দেবে
app.get('/embed/movie/:id', (req, res) => {
  const id = req.params.id;
  const iframe = `
    <iframe src="https://123movienow.cc/player/${id}" 
            width="100%" height="500" frameborder="0" allowfullscreen>
    </iframe>`;
  res.send(iframe);
});

// টিভি Proxy → সরাসরি iframe ফেরত দেবে
app.get('/embed/tv/:id/:s/:e', (req, res) => {
  const { id, s, e } = req.params;
  const iframe = `
    <iframe src="https://123movienow.cc/player/${id}?s=${s}&e=${e}" 
            width="100%" height="500" frameborder="0" allowfullscreen>
    </iframe>`;
  res.send(iframe);
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
