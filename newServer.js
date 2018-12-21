'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
const cors = require('cors');
const pg = require('pg');
const bodyparser = require('body-parser');
const PORT = process.env.PORT || 3000;

require('dotenv').config();

console.log('im in the right file');

const dbaddress = process.env.DATABASE_URL;
const client = new pg.Client(dbaddress);

client.connect();
client.on('error', err => console.error(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.use(cors());

app.set('view engine', 'ejs');

app.get('/', getIndex);
app.post('/finder', getProviders);

function getIndex(req, res) {
  res.render('index');
}

function getProviders(req, res) {
  res.render('./pages/finder');
}

app.get('/finder', getProviders);

app.post('/location', (req, res) => {
  console.log(req.body.citysearch);
  searchToLatLong(req.body.citysearch)
    .then(location => {
      const _URL = `https://api.betterdoctor.com/2016-03-01/doctors?location=${location.latitude}%2C${location.longitude}%2C100&skip=0&limit=10&user_key=${process.env.BETTERDOCTOR_API_KEY}`;
      return superagent.get(_URL).then(result => {
        console.log(result.body);
        res.render('pages/finder', {doctor: result.body.data});
      });
    })
    .catch(error => handleError(error, res));
});

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent
    .get(url)
    .then(res => {
      return new Location(query, res);
    })
    .catch(error => handleError(error));
}

function Providers(data) {
  this.first_name = data.profile.first_name;
  this.last_name = data.profile.last_name;
  this.title = data.profile.title;
  this.image = data.profile.image_url;
  this.practice_name = data.practices[0].name;
  this.street_address = data.practices[0].visit_address.street;
  this.city = data.practices[0].visit_address.city;
  this.state = data.practices[0].visit_address.state;
  this.zip = data.practices[0].visit_address.zip;
  this.phone = data.practices[0].phones[0].number;
}

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('sorry, something broke');
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
