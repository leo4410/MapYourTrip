# GDI_Project

Server Client Projekt für eine Geodateninfrastruktur Webportal im Rahmen des Moduls 4230

- **Frontend:** React.js, OpenLayers und MUI
- **Backend:** FastAPI, GeoServer

GitHub Pages: [https://leo4410.github.io/MapYourTrip/](https://leo4410.github.io/MapYourTrip/)

Getestet mit Node version 22.14.0, openlayers 9.1.0, mapliber 5.1.0, react 18.3.1

## Requirements

- [Git](https://git-scm.com/)
- IDE wie [Visual Studio Code](https://code.visualstudio.com/)
- [Anaconda Distribution](https://www.anaconda.com/products/distribution) oder [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
- Node.js und npm ([https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

## Repository lokal klonen

Mit Git in einem Terminal das GitHub Repository _Geoharvester_ in ein lokales Verzeichnis klonen.

```shell
cd /path/to/workspace
# Clone Repository
git clone https://github.com/314a/GDI_Project.git
```

### Git Projekt mit Visual Studio Code lokal klonen

Öffne ein neues Visual Studio Code Fenster und wähle unter Start _Clone Git Repository_. Alternativ öffne die Command Palette in VS Code `CTRL+Shift+P` (_View / Command Palette_) und wähle `Git: clone`.
Füge die Git web URL `https://github.com/314a/GDI_Project.git` ein und bestätige die Eingabe mit Enter. Wähle einen Ordner in welchen das Repository _geklont_ werden soll.

## Frontend installieren

Öffne ein Terminal (Command Prompt in VS Code) und wechsle in den _client_ Ordner in diesem Projekt

```shell
cd client
# aktiviere node.js (falls nvm genutzt wird)
# nvm use 22.14.0
# install all the node.js dependencies
npm install
# node Projekt ausführen

# npm run start ist in package.json definiert und startet die App
npm run start
```

## Backend installieren

Öffne die Anaconda Prompt und wechsle in den _server_ Ordner.

1. Conda Umgebung für Python mit allen Packages aus der `requirements.txt` Datei aufsetzen.

```shell
cd server
conda create -n mapyourtrip -c conda-forge python=3.13.0 --file requirements.txt --yes

```

2. Backend ausführen in der Conda Umgebung starten. Öffne http://localhost:8000/ im Browser und verifiziere, ob das Backend läuft.

```shell
cd server
# aktiviere die conda umgebung gdiproject
conda activate mapyourtrip
# start server auf localhost aus dem Ordner "server"
uvicorn app.main:app --reload
# Öffne die angegebene URL im Browser und verifiziere, ob das Backend läuft.
```

## API Dokumentation

Fast API kommt mit vorinstallierter Swagger UI. Wenn der Fast API Backen Server läuft, kann auf die Dokumentation der API über Swagger UI auf http://localhost:8000/docs verfügbar.
