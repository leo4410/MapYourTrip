-- Insert Testdata into Profile Table
INSERT INTO Profile (email, username, password, firstname, lastname, unit_mile, temperature_farenheit)
VALUES
  ('Vornamen.Nachname@example.com', 'VornamenNachname', 'password', 'Vornamen', 'Nachname', FALSE, FALSE);

-- Insert Testdata into Cover Table
INSERT INTO Cover (path, small_thumbnail_path, large_thumbnail_path)
VALUES
  ('/images/cover.jpg', '/images/cover_small.jpg', '/images/cover_large.jpg');

-- Insert Testdata into Timezone Table
INSERT INTO Timezone (name)
VALUES
  ('Europe/Berlin');
