# Map Your Trip

Einleitung zum Projekt

---

Server Client Projekt für die Projektarbeit Map Your Trip im Modul 4230. Die zugehörige Dokumentation ist in den zugehörigen GitHub Pages unter [https://leo4410.github.io/MapYourTrip/](https://leo4410.github.io/MapYourTrip/) dokumentiert.

- **Backend:** FastAPI, GeoServer
- **Frontend:** React.js, OpenLayers und MUI

Getestet mit Node version 22.14.0, openlayers 9.1.0, mapliber 5.1.0, react 18.3.1

## Requirements

- [Git Version Control](https://git-scm.com/)
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
- [Node.js und npm](<https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)>)
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
- [Node.js und npm](<https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)>)
- [Visual Studio Code](https://code.visualstudio.com/) oder ähnlich

## Repository lokal klonen

Das Projekt über die Git Bash in ein lokales Verzeichnis klonen. Die Git Bash kann in einem beliebigen Verzeichnis mit einem Rechtsklick und daraufhin `Git Bash Here` geöffnet werden.

```shell
git clone git@github.com:leo4410/MapYourTrip.git
cd MapYourTrip
```

## Datenbank installieren

Für dieses Projekt wird ein funktionsfähiger PostgreSQL Server vorausgesetzt. Dieser kann installiert und aufgesetzt und lokal betrieben werden. Unter folgenden link [Postgres](https://www.postgresql.org/download/) downloaden. Wenn noch nicht vorhanden folgende Schritte beachten:

Im Installationsprozess diese Komponenten installieren lassen:

- PostgreSQL Server
- pgAdmin 4
- Stack Builder
- Command Line Tool

Definition von `Password` und `Port` im Postgres-Installation notieren.

Installieren von `PostGIS` in Stackbilder.

## Datenbank erstellen

Die Verbindnung zum Datenbankserver wird über pgAdmin hergestellt und ist nachfolgend beispielhaft beschrieben.

<img src="./docs/bilder/setup/db_1_2_3.png" height="500">

Sobald eine Verbindung zum Datenabankserver besteht, kann die Projektdatenbank aufgesetzt werden.

1. Erstellen einer Datenabank für das Projekt mit pgAdmin

<img src="docs/bilder/setup/db_5.png" height="400">

Aufbau der Struktur der Datenbank

1. Erstellen des Datenbank Schemas durch das Ausführen von [db_schema.sql](database/db_schema.sql)
2. Generieren der notwendigen Testdaten durch das Ausführen von [db_insert.sql](database/db_insert.sql)

## Backend installieren

Das Backend des Projekts besteht aus einem FastAPI Backend, als auch einem Geoserver zur Bereitstellung eines WFS.

### FastAPI Backend

---

Damit das FastAPI Backend ordnungsgemäss betrieben werden kann, muss im Verzeichnis `server` eine Datei mit dem Titel `config.json` erstellt werden. Die Datei enthält die Konfigurationsparameter für die Datenbankverbindung.

```shell
{
  "dbname": "mapyourtrip",
  "user": "postgres",
  "password": "postgres",
  "host": "localhost",
  "port": 5432
}
```

**1. Conda Umgebung** für das Projekt mit allen notwendigen Packages aus der [requirements.txt](server/requirements.txt) Datei aufsetzen. Dafür muss eine Anaconda Prompt im geklonten Verzeichnis geöffnet werden

```shell
cd server
conda create -n mapyourtrip_env -c conda-forge python=3.13.0 --file requirements.txt --yes
```

**2. Backend** in der Conda Umgebung **starten** und im Browser unter [http://localhost:8000/](http://localhost:8000/) verifizieren

```shell
conda activate mapyourtrip_env
uvicorn app.main:app --reload
```

### Geoserver

---

Der Geoverver kann unter [Geoserver.com](https://geoserver.org/download/) heruntergeladen werden und eine allgemeine Dokumentation ist hier verfügbar [Link Manual](https://docs.geoserver.org/stable/en/user/index.html).
Bevor der Geoserver für das Projekt konfiguriert werden kann, muss eine laufende Instanz verfügbar sein. Das Aufsetzen eines Geoservers ist in der [Installationsseite](https://docs.geoserver.org/latest/en/user/) beschrieben. In dieser Anleitung wird der Geoserver lokal betrieben.

Die Folgenden Schritte werden hier bei [Dokumentation von Geoserver.com](https://docs.geoserver.org/stable/en/user/data/webadmin/index.html) beschrieben und sind als zusätzliche Unterstützung gedacht zu den Screenshots.

1. Aufrufen von [http://localhost:8080/geoserver/web/?2](http://localhost:8080/geoserver/web/?2) und anmelden auf dem Geoserver

<img src="docs/bilder/setup/gs_1.png" height="300">

2. Erstellen eines Arbeitsbereiches für das Projekt mit Angabe der folgenden Parameter

<img src="docs/bilder/setup/gs_2und3.png" height="300">

```shell
# Name Arbeitsbereich
MapYourTrip
# Namensraum URI
http://localhost:8080/MapYourTrip

```

3. Hinzufügen eines PostGIS Datenspeichers mit Angabe der folgenden Parameter

<img src="docs/bilder/setup/gs_4_5_6.png" height="500">

```shell
# Zusammenfassung der Parameter
# Name Arbeitsbereich
MapYourTrip
# Name Datenquelle
MapYourTrip
# Server
localhost
# Port pgAdmin
<port> # in Postgres definiert
# Datenbankname
mapyourtrip
# Datenbankschema
public # or other
# Benutzer pgAdmin
<username> # bsp postgres
# Passwort pgAdmin
<password> # bsp postgres
```

1. Hinzufügen der Layer Location und Segment zum Geoserver. Beim Publizieren sind die folgenden Parameter anzupassen und das begrenzte Rechteck ist aus den Daten zu berechnen

<img src="docs/bilder/setup/gs_7_8_9.png" height="500">

## Frontend installieren

Das Frontend kann gestartet werden, sobald alle notwendigen Node Packages installiert wurden.

```shell
cd ../client
npm install
npm run start
```

Vor dem Start müssen in der Datei `src/App.js` gegebenenfalls die Backend URIs angepasst werden.

## API-Key Openrouteservice

Über folgendende Homepage kann der API-Key bezogen werden: [OpenRouteService](https://openrouteservice.org/dev/#/api-docs)

Im folgenden Bild ist das Video noch verlinkt:

[![Demo-Video](.\docs\bilder\ORS_API_KEY_VideoFrame.png)](./docs/videos/ORS_API_key.mp4)
