const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const path = require('path');
const app = express();
const apiKey = process.env.APIKEY;
const weatherAPI = process.env.WEATHERAPIKEY;
const port = 3000;

app.use(express.static(path.join(__dirname, 'styles')));
app.set('views', path.join(__dirname, 'templates'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/weather', (req, res) => {
    res.render('weather');
});

app.get('/api/weather', (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).send('City is required');
    }

    const encodedCity = encodeURIComponent(city);
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${weatherAPI}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching data');
        });
});

app.get('/stocks', (req, res) => {
    res.render('stocks');
});

app.get('/api/stocks', (req, res) => {
    const stock = req.query.stock;
    if (!stock) {
        return res.status(400).send('Stock is required');
    }

    const encodedStock = encodeURIComponent(stock);
    const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${encodedStock}/prev?adjusted=true&apiKey=${apiKey}`;
    console.log(apiUrl);
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const results = data.results[0];
                res.json({
                    ticker: results.T,
                    open: results.o,
                    close: results.c
                });
            } else {
                res.send('No data found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching data');
        });
});

app.get('/api/tickers', (req, res) => {
    const apiUrl = `https://api.polygon.io/v3/reference/tickers?apiKey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tickers = data.results.map(ticker => ({
                label: `${ticker.name} (${ticker.ticker})`,
                value: ticker.ticker
            }));
            res.json(tickers);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching tickers');
        });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});