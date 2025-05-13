---
layout: default
title: MapYourTrip
---


## MapYourTrip Server

Der Server besteht aus einer PostgreSQL Datenbank, einem FastAPI Backend und einem Geoserver.

### PostGIS Database

Die PostgreSQL Datenbank mit der PostGIS Erweiterung speichert die Daten in verschiedenen Tabellen. Für das Projekt sind die nachfolgenden Tabellen von zentralen Bedeutung. 

- ```location``` speichert Punktdaten, die aus Polarsteps exportiert wurden
- ```segment``` speichert Liniendaten, welche die Punkte aus Polarsteps miteinander verbindet
- ```trip``` ordnet Punkt- und Linien einer Reise aus Polarsteps zu

Die weiteren Tabellen haben momentan keinen Einfluss auf das Projekt und können bei einer allfälligen Erweiterung der Applikation zur Speicherung der entsprechenden Daten genutzt werden. Im nachfolgenden Datenabnkschema sind alle Beziehungen abgebildet.

<img src="bilder/db_schema.png" alt="Datenbankschema" height="600">

### FastAPI Backend

Das Backend stellt die folgenden API Endpunkte zur Verfügung.

- ```location/{location_id}```    als GET Abfrage einer Location
- ```segment/{segment_id}``` als GET Abfrage eines Segments
- ```segment/{segment_id}/route``` als POST Abfrage zur neuen Routenberechnung und Speicherung eines Segments
- ```trips``` als GET Abfrage aller Trips
- ```upload/zip``` als POST Abfrage zum Upload einer ZIP Datei


Eine detaillierte API Dokumentation ist nach dem Starten des Backends gemäss Installationsanleitung unter [http://localhost:8000/docs](http://localhost:8000/docs) einsehbar.

### Geoserver

Der Geoserver wird genutzt, um die Punkt- und Liniendaten der Segmente bereitzustellen. Eine beispielhafte Abfrage von Segmenten des Trips mit der Id 3 sieht so aus. 
```http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=MapYourTrip:segment&outputFormat=application/json&srsname=EPSG:4326&CQL_FILTER=fk_trip_id=2```
