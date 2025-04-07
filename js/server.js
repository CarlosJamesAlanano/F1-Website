const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/news', async (req, res) => {
    const response = await fetch(`https://newsapi.org/v2/everything?q=formula+1&sortBy=publishedAt&apiKey=${process.env.API_KEY}`);
    const text = await response.text(); // Get the response as text
    console.log(text); // Log the raw response
    try {
        const data = JSON.parse(text); // Try to parse the JSON
        res.json(data);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Failed to parse JSON response', rawResponse: text });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
