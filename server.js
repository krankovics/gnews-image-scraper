app.get('/image', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // Kövesd le a redirectet, szerezz valós oldalcímet
        const initial = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400 // fontos: ne dobjon hibát redirectre!
        });

        const finalUrl = initial.headers.location || initial.request.res.responseUrl;
        if (!finalUrl) throw new Error('Redirect target not found');

        // Második kérés: OG image lekérése a redirect célról
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
