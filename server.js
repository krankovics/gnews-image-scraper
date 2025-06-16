const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/image', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const initial = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });

        const finalUrl = initial.headers.location || initial.request.res.responseUrl;
        if (!finalUrl) throw new Error('Redirect target not found');

        const realPage = await axios.get(finalUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 3
        });

        const $ = cheerio.load(realPage.data);
        const image = $('meta[property="og:image"]').attr('content') || null;
        const canonical = $('link[rel="canonical"]').attr('href') || finalUrl;

        res.json({
            image,
            final_url: canonical
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve or parse', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
