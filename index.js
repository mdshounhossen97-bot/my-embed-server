const express = require('express');
const cors = require('cors');
const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');

const app = express();
app.use(cors()); // এটি আপনার ব্লগারে লিঙ্কটি কাজ করতে সাহায্য করবে

const port = process.env.PORT || 3000;

// Scraper Engine Setup
const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  target: targets.NATIVE,
});

app.get('/', (req, res) => {
  res.send('Shawonflix Universal Scraper is Online!');
});

app.get('/get-link', async (req, res) => {
  const { id, type } = req.query; // id = TMDB ID, type = 'movie' or 'tv'

  if (!id) {
    return res.status(400).json({ success: false, message: "Please provide a TMDB ID" });
  }

  try {
    const mediaType = type === 'tv' ? 'show' : 'movie';
    
    const output = await providers.runAll({
      media: {
        type: mediaType,
        tmdbId: id,
      }
    });

    if (output && output.stream) {
      // ডিরেক্ট ভিডিও ফাইল লিঙ্ক এবং সাবটাইটেল পাঠানো হচ্ছে
      res.json({ 
        success: true, 
        title: "Link Found",
        stream: output.stream,
        captions: output.stream.captions || [] 
      });
    } else {
      res.status(404).json({ success: false, message: "No Direct Link Found on any server" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Scraper Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Shawonflix API is live on port ${port}`);
});
