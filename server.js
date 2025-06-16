const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/image', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            maxRedirects: 5
        });

        const $ = cheerio.load(response.data);
        const image = $('meta[property="og:image"]').attr('content') || null;
        const canonical = $('link[rel="canonical"]').attr('href') || response.request.res.responseUrl;

        res.json({
            image,
            final_url: canonical
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch and parse', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('✅ AI News Redirect Image Resolver');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
