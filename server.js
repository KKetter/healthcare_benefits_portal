'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();
// DATABASE CONFIG
const app = express(); // TODO: add pg URL
const PORT = process.env.PORT || 3001;

const dbaddress = process.env.DATABASE_URL;
const client = new pg.Client(dbaddress);
// const bodyParser = require('body-parser');
// CONNECT TO DB
client.connect();
client.on('error', err => console.error(err));
// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.json());
app.use(cors());
// app.use(bodyParser);
// SETUP VIEW ENGINE
app.set('view engine', 'ejs');
// ROUTES
app.get('/', getIndex);
app.get('/location', getLocation);
app.get('/doctors', getProviders);
//finder.ejs appearance after button click ***
app.get('/results', showResults);

let currentLoc = [];
// INDEX LOGIC
function getIndex(req, res) {
  res.render('index');
}

function renderFinder(req, res) {
  res.render('/views/pages/finder.ejs')

}
// OBJECT CONSTRUCTOR
function Location(query, data) {
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

// LOCATION LOGIC

Location.prototype.save = function () {
  let SQL = `
    INSERT INTO locations
      (search_query, formatted_query, latitude, longitude) 
      VALUES($1, $2, $3, $4) 
      RETURNING id;
  `;
  let values = Object.values(this);
  return client.query(SQL, values);
};

function getLocation(req, res) {
  const handler = {
    query: req.query.data,
    cacheHit: (results) => {
      res.send(results.rows[0]);
      currentLoc.push(results.rows[0]);
      console.log('info we need cacheHit:', currentLoc)
    },
    cacheMiss: () => {
      Location.fetchLocation(req.query.data)
        .then((data) => {
          res.send(data);
          currentLoc.push(data);
          console.log('info we need cacheMiss:', currentLoc);
        }).catch(error => handleError(error));
    },
  };
  Location.lookupLocation(handler);
}

Location.fetchLocation = (query) => {
  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent(_URL).then(data => {
    console.log('Got location data from the API', data.body.results);
    if (!data.body.results.length) { throw 'NO DATA'; }
    else {
      let location = new Location(query, data.body.results[0]);
      return location.save().then(result => {
        location.id = result.rows[0].id;
        return location;
      });
      return location;
    }
  });
};

Location.lookupLocation = (handler) => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [handler.query];
  return client.query(SQL, values)
    .then(results => {
      console.log('rowCount results:', results.rowCount)
      if (results.rowCount > 0) {
        handler.cacheHit(results);
      } else {
        handler.cacheMiss();
      }
    }).catch(error => handleError(error));
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

function getProviders(req, res) {
  const handler = {
    location: req.query.data,
    cacheHit: (result) => {
      currentLoc.push(result);
      res.send(result.rows);
    },
    cacheMIss: () => {
      Providers.fetchProviders(req.query.data)
        .then(results => res.send(results))
        .catch(error => handleError(error));
    },
  };
  Providers.lookUpProviders(handler);
}

Providers.fetchProviders = function () {
  const _URL = `https://api.betterdoctor.com/2016-03-01/doctors?location=${currentLoc[0].latitude}%2C${currentLoc[0].longitude}%2C100&skip=0&limit=10&user_key=${process.env.BETTERDOCTOR_API_KEY}`;

  return superagent.get(_URL)
    .then(result => {
      const providerDetails = result.body.data.map(doctor => {
        const details = new Providers(doctor);
        console.log(details);
        details.save();
        return details;
      });
      return providerDetails;
    }).catch(error => handleError(error));

};
Providers.lookUpProviders = function (handler) {
  const SQL = `SELECT * FROM providers WHERE location_id=$1;`;
  console.log('client query', handler.location_id);
  client.query(SQL, [handler.location.id])
  .then(result => {
    console.log('result stuff', result.rowCount);
      if (result.rowCount > 0) {
        console.log('got provider data from SQL', result.rowCount);
        handler.cacheHit(result);
      } else {
        console.log('got provider data from API', result.rowCount);
        Providers.fetchProviders();
      }
    })
    .catch(error => handleError(error));
}
Providers.prototype.save = function () {
  const SQL = `INSERT INTO providers (first_name, last_name, title, image, practice_name, street_address, city, state, zip, phone)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
  const values = Object.values(this);
  return client.query(SQL, values);
}
// DB GARBAGE COLLECTION
Providers.clearDB = clearDB;

// DB GARBAGE COLLECTION FUNCTION
function clearDB(table, city) {
  const clearTableData = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(clearTableData);
}
// ERROR MANAGEMENT
app.get('*', (req, res) => res.status(404).send('Not Found'));

function handleError(err, res) {
  console.log(err);
  if (res) res.status(500).send('ERROR. Please try again.');
}
// PORT CONFIRMATION
app.listen(PORT, () => {
  console.log(`listening port ${PORT}`);
});
