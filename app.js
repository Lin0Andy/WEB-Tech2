const express = require("express")
const https = require("https")
const path = require("path")
const bodyParser = require('body-parser')
const fs = require("fs")
const axios = require('axios')
const cheerio = require('cheerio')
const pug = require('pug')
const dotenv = require('dotenv')
dotenv.config();

const request = require('request');


const app = express()
const PORT = process.env.PORT || 3000;
const mapToken = process.env.GEOCODE_KEY;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('img'));
app.set('view engine', 'pug');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/news', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'news.html'))
});

app.get('/third', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'third.html'));
});

app.post('/third', function(req, res){
    let city = 'london';
    request.get({
        url: 'https://api.api-ninjas.com/v1/airquality?city=' + city,
        headers: {
            'X-Api-Key': process.env.THIRD_API_KEY
        },
    }, function(error, response, body) {
        if(error) return console.error('Request failed:', error);
        else if(response.statusCode !== 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
        else {
            const airQualityData = JSON.parse(body);

            const aqiLevels = {
                'Good': '0-50',
                'Moderate': '51-100',
                'Unhealthy for Sensitive Groups': '101-150',
                'Unhealthy': '151-200',
                'Very Unhealthy': '201-300',
                'Hazardous': '301-500'
            };

            const pollutants = Object.keys(airQualityData)
                .filter(key => key !== 'overall_aqi')
                .map(key => ({
                    name: key,
                    concentration: airQualityData[key].concentration,
                    aqi: airQualityData[key].aqi,
                }));

            const overall_aqi = airQualityData.overall_aqi;
            const aqiLevel = getAqiLevel(airQualityData.overall_aqi);

            res.render('third', { pollutants, overall_aqi, aqiLevel, aqiLevels });
        }
    });
});

function getAqiLevel(aqi) {
    if (aqi >= 0 && aqi <= 50) return 'Good';
    else if (aqi >= 51 && aqi <= 100) return 'Moderate';
    else if (aqi >= 101 && aqi <= 150) return 'Unhealthy for Sensitive Groups';
    else if (aqi >= 151 && aqi <= 200) return 'Unhealthy';
    else if (aqi >= 201 && aqi <= 300) return 'Very Unhealthy';
    else if (aqi >= 301 && aqi <= 500) return 'Hazardous';
    else return 'Unknown';
}



app.post('/news', function(req, res){
    const sort = req.body.sorting
    const date = req.body.sorting ? req.body.sorting: '2024-01-19'
    const endpoint = '/v2/everything'

    const url = 'https://newsapi.org' + endpoint + '?q=Apple&from=' + date + '&sortBy=' + sort + '&apiKey=' + process.env.NEWS_API_KEY


    https.get(url, function (response) {
        let data = '';

        response.on("data", function (chunk) {
            data += chunk;
        });

        response.on("end", function () {
            try {
                const newsData = JSON.parse(data);

                if (newsData.articles && newsData.articles.length > 0) {
                    const articles = [];

                    // Limit the loop to a maximum of 10 articles
                    const arr_length = Math.min(newsData.articles.length, 10);

                    for (let i = 0; i < arr_length; i++) {
                        const article = {
                            author: newsData.articles[i].author,
                            title: newsData.articles[i].title,
                            description: newsData.articles[i].description,
                            url: newsData.articles[i].url,
                            publishedAt: newsData.articles[i].publishedAt,
                            content: newsData.articles[i].content
                        };

                        articles.push(article);
                    }

                    res.render('news', { articles, url });

                } else if (newsData.status === "error") {
                    res.render('error', { url });

                } else {
                    res.render('noarticles', { url });

                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).send('Error parsing JSON');
            }
        });
    });
});

app.post('/weather',  function(req, res){
    const city = req.body.city;
    const zoom = req.body.zoom ? req.body.zoom : '9';
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + '&appid=' + process.env.WEATHER_API + '&units=metric'


    https.get (url,  function(response){
        response.on ("data",  function (data) {
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const feels_like = weatherData.main.feels_like;
            const temp_min = weatherData.main.temp_min;
            const temp_max = weatherData.main.temp_max;
            const condition = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const pressure = weatherData.main.pressure;
            const humidity = weatherData.main.humidity;
            const lon = weatherData.coord.lon;
            const lat = weatherData.coord.lat;
            const wind_speed = weatherData.wind.speed;
            const country_code = weatherData.sys.country;
            const id = weatherData.weather[0].icon;
            let icon_cond = '';
            if (icon === '') {
                icon_cond = 'sun'
            } else if (icon === '') {
                icon_cond = 'rain';
            } else if (icon === '50n') {
                icon_cond = 'mist';
            } else if (icon === '') {
                icon_cond = 'clouds';
            } else if (icon === '') {
                icon_cond = 'cloudy';
            } else if (icon === '') {
                icon_cond = 'low_temp';
            } else if (icon === '10n') {
                icon_cond = 'weak_rain';
            } else if (icon === '') {
                icon_cond = 'high_temp';
            } else if (icon === '') {
                icon_cond = 'lightning';
            } else if (icon === '') {
                icon_cond = 'rain_and_sun';
            } else if (icon === '') {
                icon_cond = 'snow';
            } else if (icon === '') {
                icon_cond = 'windy';
            } else {
                icon_cond = 'unregistered';
            }


            const templatePath = path.join(__dirname, 'public', 'index.html');
            const template = fs.readFileSync(templatePath, 'utf-8');
            const location = lon + ',' + lat;
            const mapUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/' + location + ',' + zoom + ',0,0/' + '400x200' + '?access_token=' + mapToken;


            const modifiedHtml = template.replace(/{{city}}/g, city)
                .replace(/{{id}}/g, id)
                .replace(/{{temp}}/g, temp)
                .replace(/{{feels_like}}/g, feels_like)
                .replace(/{{temp_min}}/g, temp_min)
                .replace(/{{temp_max}}/g, temp_max)
                .replace(/{{condition}}/g, condition)
                .replace(/{{icon_cond}}/g, icon_cond)
                .replace(/{{pressure}}/g, pressure)
                .replace(/{{humidity}}/g, humidity)
                .replace(/{{lon}}/g, lon)
                .replace(/{{lat}}/g, lat)
                .replace(/{{map}}/g, `<img src="${mapUrl}" alt=mMap">`)
                .replace(/{{zoom}}/g, zoom)
                .replace(/{{wind_speed}}/g, wind_speed)
                .replace(/{{country_code}}/g, country_code)
                .replace(/{{rain}}/g, (weatherData.weather[0].main === 'Rain' ? (weatherData.rain ? weatherData.rain['1h'] : 0) + ' mm' : '0 mm'));

            res.send(modifiedHtml);
        })
    })
})

app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
