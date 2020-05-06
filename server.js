const express = require('express');
const app = express();
const data = require('./src/mock/mock-data.json');
const { PORT = 3000 } = process.env;

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const generateAdId = () => `${+new Date()}-${random(0, 1000)}`;

//get random ad from mock data
const getAd = (type = '') => {
  const ads = type
    ? data.filter(ad => ad.type === type || !ad.success)
    : data;

  const ad = ads[random(0, ads.length)];
  return {
    ...ad,
    id: generateAdId()
  };
};

const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  next();
};

app.use(cors);

//api endpoint
app.get('/ads', (req, res) => {
  /**
   * type: requested ad type
   */
  const { type = '' } = req.query;
  res.send(getAd(type.toUpperCase()));
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}!`);
});
