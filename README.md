---
layout: default
title: MapYourTrip
---

# Map Your Trip

Server Client Projekt für die Projektarbeit Map Your Trip im Modul 4230. Die zugehörige Dokumentation ist in den zugehörigen GitHub Pages unter [https://leo4410.github.io/MapYourTrip/](https://leo4410.github.io/MapYourTrip/) dokumentiert.

- **Backend:** FastAPI, GeoServer
- **Frontend:** React.js, OpenLayers und MUI



Getestet mit Node version 22.14.0, openlayers 9.1.0, mapliber 5.1.0, react 18.3.1

## Requirements

- [Git Version Control](https://git-scm.com/)
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html) 
- [Node.js und npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- [Visual Studio Code](https://code.visualstudio.com/) oder ähnlich

## Repository lokal klonen

Das Projekt über die Git Bash in ein lokales Verzeichnis klonen. Die Git Bash kann in einem beliebigen Verzeichnis mit einem Rechtsklick und daraufhin ```Git Bash Here``` geöffnet werden.

```shell
git clone git@github.com:leo4410/MapYourTrip.git
cd MapYourTrip
```

## Datenbank installieren

Für dieses Projekt wird ein funktionsfähiger PostgreSQL Server vorausgesetzt. Dieser kann gegebenenfalls gemäss [IGEO Installationsanleitung](documents/Installationsanleitung_PostgreSQL_PostGIS_PGAdmin_IGEO.pdf) aufgesetzt und lokal betrieben werden. Die Verbindnung zum Datenbankserver wird über pgAdmin hergestellt und ist nachfolgend beispielhaft beschrieben.

<img src="docs/docs/bilder/setup/db_1.png" alt="alt text" height="200"> <img src="docs/docs/bilder/setup/db_2.png" alt="alt text" height="200"> <img src="docs/docs/bilder/setup/db_3.png" alt="alt text" height="200">

Sobald eine Verbindung zu einem Datenabnkserver besteht, kann die Projektdatenbank aufgesetzt werden. 

1. Erstellen einer Datenabank für das Projekt

<img src="docs/docs/bilder/setup/db_4.png" alt="alt text" height="300"> <img src="docs/bilder/setup/db_5.png" alt="alt text" height="300">

2. Erstellen des Datenbank Schemas durch das Ausführen von [db_schema.sql](database/db_schema.sql)
3. Generieren der notwendigen Testdaten durch das Ausführen von [db_insert.sql](database/db_insert.sql)


## Backend installieren

Das Backend des Projekts besteht aus einem FastAPI Backend, als auch einem Geoserver zur Bereitstellung eines WFS. 

### FastAPI Backend

Damit das FastAPI Backend ordnungsgemäss betrieben werden kann, muss im Verzeichnis ```server``` eine Datei mit dem Titel ```config.json``` erstellt werden. Die Datei enthält die Konfigurationsparameter für die Datenbankverbindung. 

```shell
{
  "dbname": "mapyourtrip",
  "user": "postgres",
  "password": "postgres",
  "host": "localhost",
  "port": 5432
}
```

1. Conda Umgebung für das Projekt mit allen notwendigen Packages aus der [requirements.txt](server/requirements.txt) Datei aufsetzen. Dafür muss eine Anaconda Prompt im geklonten Verzeichnis geöffnet werden

```shell
cd server
conda create -n mapyourtrip_env -c conda-forge python=3.13.0 --file requirements.txt --yes
```

2. Backend in der Conda Umgebung starten und im Browser unter [http://localhost:8000/](http://localhost:8000/) verifizieren

```shell
conda activate mapyourtrip_env
uvicorn app.main:app --reload
```

### Geoserver

Bevor der Geoserver für das Projekt konfiguriert werden kann, muss eine laufende Instanz verfügbar sein. Das Aufsetzen eines Geoservers ist in der [Installationsanleitung von Pia Bereuter](documents/4230_E03_Geoserver.pdf) beschrieben. In dieser Anleitung wird der Geoserver lokal betrieben. 

1. Aufrufen von [http://localhost:8080/geoserver/web/?2](http://localhost:8080/geoserver/web/?2) und anmelden auf dem Geoserver

<img src="docs/bilder/setup/gs_1.png" alt="alt text" height="200"> 

2. Erstellen eines Arbeitsbereiches für das Projekt mit Angabe der folgenden Parameter 

<img src="docs/bilder/setup/gs_2.png" alt="alt text" height="200"> <img src="docs/bilder/setup/gs_3.png" alt="alt text" height="200">

3. Hinzufügen eines PostGIS Datenspeichers mit Angabe der folgenden Parameter

<img src="docs/bilder/setup/gs_4.png" alt="alt text" height="200"> <img src="docs/bilder/setup/gs_5.png" alt="alt text" height="200"> <img src="docs/bilder/setup/gs_6.png" alt="alt text" height="200">

4. Hinzufügen der Layer Location und Segment zum Geoserver. Beim Publizieren sind die folgenden Parameter anzupassen und das begrenzte Rechteck ist aus den Daten zu berechnen

<img src="docs/bilder/setup/gs_7.png" alt="alt text" height="200"> <img src="docs/bilder/setup/gs_8.png" alt="alt text" height="200"> <img src="docs/bilder/setup/gs_9.png" alt="alt text" height="200">

## Frontend installieren

Das Frontend kann gestartet werden, sobald alle notwendigen Node Packages installiert wurden. 

```shell
cd ../client
npm install
npm run start
```

Vor dem Start müssen in der Datei ```src/App.js``` gegebenenfalls die Backend URIs, als auch der WFS Type (Arbeitsbereich auf dem Geoserver) angepasst werden. 
