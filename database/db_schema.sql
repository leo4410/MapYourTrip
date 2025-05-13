CREATE EXTENSION postgis;

CREATE TABLE Profile (
    id SERIAL PRIMARY KEY,
    email VARCHAR(127) NOT NULL,
    username VARCHAR(63) UNIQUE NOT NULL,
    password VARCHAR(63) NOT NULL,
    firstname VARCHAR(63),
    lastname VARCHAR(63),
    unit_mile BOOLEAN,
    temperature_farenheit BOOLEAN
);

CREATE TABLE Cover (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    small_thumbnail_path VARCHAR(255),
    large_thumbnail_path VARCHAR(255)
);

CREATE TABLE Timezone (
    id SERIAL PRIMARY KEY,
    name VARCHAR(127) NOT NULL
);

CREATE TABLE Trip (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL,
    fk_cover_id INT REFERENCES Cover(id) ON DELETE RESTRICT,
    name VARCHAR(63) NOT NULL,
    summary TEXT,
    fk_profile_id INT REFERENCES Profile(id) ON DELETE RESTRICT NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    creation_time TIMESTAMP,
    fk_timezone_id INT REFERENCES Timezone(id) ON DELETE RESTRICT
);

CREATE TABLE Location (
    id SERIAL PRIMARY KEY,
    location_geom GEOMETRY,
    time TIMESTAMP,
    fk_trip_id INT REFERENCES Trip(id) ON DELETE RESTRICT NOT NULL,
    fk_timezone_id INT REFERENCES Timezone(id) ON DELETE RESTRICT -- evtl. weglassen
);

-- Vererbung: Waypoint erbt von Location
CREATE TABLE Waypoint (
    uuid UUID NOT NULL,
    name VARCHAR(63) NOT NULL,
    description TEXT,
    weather_condition VARCHAR(127),
    weather_temperature NUMERIC
) INHERITS (Location);

CREATE TABLE Segment (
    id SERIAL PRIMARY KEY,
    fk_trip_id INT REFERENCES Trip(id) ON DELETE RESTRICT NOT NULL,
    fk_location_id_a INT REFERENCES Location(id) ON DELETE RESTRICT NOT NULL,
    fk_location_id_b INT REFERENCES Location(id) ON DELETE RESTRICT NOT NULL,
    segment_geom GEOMETRY
);

CREATE TABLE Photo (
    id SERIAL PRIMARY KEY,
    fk_location_id INT REFERENCES Location(id) ON DELETE RESTRICT NOT NULL,
    photo_data BYTEA
);
