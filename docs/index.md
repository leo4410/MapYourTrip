---
layout: default
title: MapYourTrip
---

## MapYourTrip
<div align="center">
  <img src="bilder/Logo.png" height="200" alt="MapYourTrip Logo">
</div>

MapYourTrip ist Ihre individuelle Reiseverwaltung für Polarsteps-Daten.
Mit der Web­applikation können Sie Ihre exportierten Reise-Logs ganz nach Ihren Wünschen filtern, in einer eigenen Datenbank ablegen und übersichtlich visualisieren. Nutzen Sie die interaktive Kartenansicht um die Karten nach Ihren wünschen zu visualisieren und für ein Fotoalbum zu exportieren.

<div align="center">
        <video width="900"   controls>
    <source src="videos/Home_video.mp4" type="video/mp4">
    </video>
</div>

### Architektur der Webapplikation
<div align="center">
  <img src="bilder/Architekturdiagramm.png" height="400" alt="MapYourTrip Logo">
</div>


    

Die Webaplikation bestehet aus einer Frontendkomponente, Backendkomponente inklusive Datenbank sowie einigen Schnittstellen.

#### Funktionalitäten
Im Reiter Funktionalitäten ist pro Arbeitsschritt / Funktionalität ein Kurzvideo ersichtlich. Diese dienen als Kurzanleitung und übersicht der möglichkeiten der Webappliaktion.

#### Server
Im Reiter Server ist die Datebbankstrukctur in der Postgis Datenbank erläutert sowie das FastAPI Backend für die Datenbank abfragen und der Geoserver als Schnittstelle von dem Backend zu dem Frontend.  

#### Client
Im Reiter Client werden die Komponenten / Pages des Frontend dokumentiert sowie die verwendeten Bausteine für den Aufbau des Frontends (React, Node Package Manager und Opne Layers).

#### Schnittstellen
Unter Schnittstellen ist die externe Schnittstelle zum OpenRouteService dokumentiert.

### Github Repository und README

Das GitHub Repository dient dem Bezug des original Programmcodes. In der zugehörigen README Datei ist eine Installationsanleitung für das Backend und für das Frontend abgelegt.

- GitHub Repository: [https://github.com/leo4410/MapYourTrip](https://github.com/leo4410/MapYourTrip)
- README: [https://github.com/leo4410/MapYourTrip/blob/main/README.md](https://github.com/leo4410/MapYourTrip/blob/main/README.md)

### Quellen der Hintergrundkarten

Die Hintergrundkarten wurden von folgenden Quellen bezogen. 

- OpenSteetMap [OSM](https://www.openstreetmap.org/about)
- Weltluftbildkarte von [Arcgis](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9)
- Kartendarstellung in Wasserfarben Optik von [maps.stamen.com](https://maps.stamen.com/watercolor/#12/37.7706/-122.3782)
- Kartendarstellung mit Terrain im natürlichen Farben von [maps.stamen.com](https://maps.stamen.com/terrain/#12/37.7706/-122.3782r)
- Mnimalistische Basis Kartendarstellungen von [CARTO](https://carto.com)

### Authoren

© 2025 Leonardo Seminatore, Marco Stampfli, Janis Kramer
