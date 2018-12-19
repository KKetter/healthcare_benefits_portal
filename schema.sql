DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS providers;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(8, 6),
  longitude NUMERIC(9, 6)
);

CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  practices VARCHAR(255),
  site VARCHAR(255),
  new_patients BOOLEAN,
  image VARCHAR(255),
  hours VARCHAR(255),
  phone VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);