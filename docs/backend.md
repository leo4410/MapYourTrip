---
layout: default
title: MapYourTrip
---


# MapYourTrip Backend

## PostGIS Database

## FastAPI Backend

Das Backend stellt die folgenden API Endpunkte zur Verfügung.

- ```location/{location_id}```    als GET Abfrage einer Location
- ```segment/{segment_id}``` als GET Abfrage eines Segments
- ```segment/{segment_id}/route``` als POST Abfrage zur neuen Routenberechnung und Speicherung eines Segments
- ```trips``` als GET Abfrage aller Trips
- ```upload/zip``` als POST Abfrage zum Upload einer ZIP Datei


Eine detaillierte API Dokumentation ist nach dem Starten des Backends gemäss Installationsanleitung unter [http://localhost:8000/docs](http://localhost:8000/docs) einsehbar.

## Geoserver

