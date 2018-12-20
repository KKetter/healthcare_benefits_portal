DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS providers;

CREATE TABLE locations
(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(8, 6),
  longitude NUMERIC(9, 6)
);

CREATE TABLE providers
(
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  title VARCHAR(24),
  image VARCHAR(255),
  practice_name VARCHAR(255),
  street_address VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(3),
  zip VARCHAR(10),
  insurance VARCHAR(255),
  phone VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

INSERT INTO providers
  (id, first_name, last_name, title, image, practice_name, street_address, city, state, zip, insurance, phone, location_id)
VALUES
  ('001', 'Leo', 'Spaceman', 'Medical Doctor', image, 'Family Practice', '111 East Pike Street', 'Seattle', 'WA', '98102', 'Aetna', '206-444-1234', '0001');