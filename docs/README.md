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

Für dieses Projekt wird ein funktionsfähiger PostgreSQL Server vorausgesetzt. Dieser kann gegebenenfalls gemäss IGEO Installationsanleitung aufgesetzt und lokal betrieben werden. Die Verbindnung zum Datenbankserver wird über pgAdmin hergestellt und ist nachfolgend beispielhaft beschrieben.

<img src="docs/bilder/setup/db_1.png" alt="alt text" height="200"> <img src="docs/bilder/setup/db_2.png" alt="alt text" height="200"> <img src="docs/bilder/setup/db_3.png" alt="alt text" height="200">

Sobald eine Verbindung zu einem Datenabnkserver besteht, kann die Projektdatenbank aufgesetzt werden. 

1. Erstellen einer Datenabank für das Projekt

<img src="docs/bilder/setup/db_4.png" alt="alt text" height="300"> <img src="docs/bilder/setup/db_5.png" alt="alt text" height="300">

2. Erstellen des Datenbank Schemas durch das Ausführen von [db_schema.sql](database/db_schema.sql)
3. Generieren der notwendigen Testdaten durch das Ausführen von [db_insert.sql](database/db_insert.sql)


## Backend installieren

Das Backend des Projekts besteht aus einem FastAPI Backend, als auch einem Geoserver zur Bereitstellung eines WFS. 

1. Conda Umgebung für das Projekt mit allen notwendigen Packages aus der [requirements.txt](server/requirements.txt) Datei aufsetzen

```shell
cd server
conda create -n mapyourtrip_env -c conda-forge python=3.13.0 --file requirements.txt --yes
```

2. Backend in der Conda Umgebung starten und im Browser unter [http://localhost:8000/](http://localhost:8000/) verifizieren

```shell
conda activate mapyourtrip_env
uvicorn app.main:app --reload
```

## Frontend installieren

Das Frontend kann gestartet werden, sobald alle notwendigen Node Packages installiert wurden. 

```shell
cd ../client
npm install
npm run start
```
