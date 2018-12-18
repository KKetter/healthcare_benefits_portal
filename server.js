'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// DATABASE CONFIG
const PORT = process.env.PORT || 3001;
const app = express(); // TODO: add pg URL
const dbaddress = process.env.DATABASE_URL;
const client = new pg.Client(dbaddress);

// CONNECT TO DB
client.connect();
client.on('error', err => console.error(err));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(cors());

// SETUP VIEW ENGINE
app.set('view engine', 'ejs');

// ROUTES
app.get('/', getIndex);
app.get('/location', getLocation);

// INDEX LOGIC
function getIndex(req, res) {
  res.render('index');
}

// LOCATION LOGIC
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.formatted_address;
  this.latitude = res.geometry.location.lat;
  this.longitude = res.geometry.location.lng;
}

function getLocation(req, res) {
  const handler = {
    location: req.query.data,
    cacheHit: (results) => {
      console.log('Got data from SQL', results);
      res.send(results.rows[0]);
    },
    cacheMiss: () => {
      Location.fetchLocation(req.query.data)
        .then(data => res.send(data))
        .catch(error => errorHandler(error));
    }
  };
  Location.lookupLocation(handler);
}

Location.lookupLocation = el => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const vals = [el.query];
  return client.query(SQL, vals)
    .then(results => {
      if (results.rowCount > 0) {
        el.cacheHit(results);
      } else {
        el.cacheMiss();
      }
    })
    .catch(error => errorHandler(error));
};

Location.fetchLocation = query => {
  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(_URL)
    .then(data => {
      console.log('Got data from API');
      if (!data.body.results.length) {
        throw 'No Data';
      } else {
        let geoLocation = new Location(query, data.body.results[0]);
        return geoLocation.save()
          .then(result => {
            geoLocation.id = result.rows[0].id;
            return geoLocation;
          });
      }
    });
};

Location.prototype.save = function () {
  let SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4) RETURNING id;`;
  let values = Object.values(this);
  return client.query(SQL, values);
};

// DB GARBAGE COLLECTION
// function clearDB(table, city) {
//   const clearTableData = `DELETE from ${table} WHERE location_id=${city};`;
//   return client.query(clearTableData);
// }

// ERROR MANAGEMENT
app.get('*', (req, res) => res.status(404).send('Not Found'));

function errorHandler(err, res) {
  console.log(err);
  if (res) res.status(500).send('ERROR. Please try again.');
}

// PORT CONFIRMATION
app.listen(PORT, () => {
  console.log(`listening port ${PORT}`);
});
