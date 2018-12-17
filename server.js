'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pg = require('pg');

// DATABASE CONFIG
const dbaddress = process.env.DATABASE_URL;
const client = new pg.Client(dbaddress);
const PORT = process.env.PORT || 3000;
const app = express(); // TODO: add pg URL

// CONNECT TO DB
client.connect();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// SETUP VIEW ENGINE
app.set('view engine', 'ejs');

// ERROR MANAGEMENT
app.get('*', (req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => {
  console.log(`listening port ${PORT}`);
});
