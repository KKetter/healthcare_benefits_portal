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
app.get('/providers', getProviders);

// INDEX LOGIC
function getIndex(req, res) {
  res.render('index');
}

// OBJECT CONSTRUCTOR
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.formatted_address;
  this.latitude = res.geometry.location.lat;
  this.longitude = res.geometry.location.lng;
}

function Providers(data) {
  this.practices = data.practices.name;
  this.site = data.practices.website;
  this.new_patients = data.practices.accepts_new_patients;
  this.image = data.practices.media.versions.thumbnail;
  this.hours = data.practices.office_hours;
  this.phone = data.practices.phones.number;
  this.table = 'providers';
  this.created_time = new Date(data.time * 1000).toDateString();
}

// LOCATION LOGIC
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
Providers.clearDB = clearDB;

// PROVIDERS LOGIC
function getProviders(req, res) {
  console.log('getProviders console', req.body);
  let handler = {
    location: req.query.data,
    cacheHit: function (result) {
      let dataAge = (Date.now() - result.rows[0].created_at) / (1000 * 60);
      if (dataAge > 10080) {
        Providers.clearDB(Providers.table, req.query.data.id);
        console.log('delete SQL data');
        Providers.fetchProviders(req.query.data)
          .then(results => res.send(results))
          .catch(error => errorHandler(error));
      } else {
        res.send(result.rows);
      }
    },
    cacheMiss: function () {
      Providers.fetchProviders(req.query.data)
        .then(results => res.send(results))
        .catch(error => errorHandler(error));
    }
  };
  Providers.providerLookup(handler);
}

Providers.providerLookup = function (handler) {
  const SQL = `SELECT * FROM providers WHERE location_id=$1;`;
  const vals = [handler.location.id];
  client.query(SQL, vals)
    .then(result => {
      if (result.rowCount > 0) {
        console.log('Got data from SQL');
        handler.cacheHit(result);
      } else {
        console.log('Got data from API');
        handler.cacheMiss();
      }
    })
    .catch(error => errorHandler(error));
};

Providers.fetchProviders = function (location) {
  const providers_URL = `https://api.betterdoctor.com/2016-03-01/doctors?location=${location.latitude}%2C${location.longitude}%2C100&user_location=${location.latitude}%2C${location.longitude}&skip=0&limit=10&${process.env.BETTERDOCTOR_API_KEY}`;
  return superagent.get(providers_URL)
    .then(result => {
      console.log('myAPIcall', result);
      const providersSummary = result.body.data.map(docs => {
        const pSummary = new Providers(docs);
        pSummary.save(location.id);
        return pSummary;
      });
      return providersSummary;
    });
};

Providers.prototype.save = function (id) {
  const SQL = `INSERT INTO providers (practices, site, new_patients, image, hours, phone, created_time, location_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`;
  const values = Object.values(this);
  values.push(id);
  client.query(SQL, values);
};

// DB GARBAGE COLLECTION FUNCTION
function clearDB(table, city) {
  const clearTableData = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(clearTableData);
}

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
