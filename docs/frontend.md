---
layout: default
title: MapYourTrip
---

# MapYourTrip Frontend

React wird genutzt, um die Benutzeroberfläche aufzubauen und zu steuern, während npm dabei hilft, alle notwendigen Pakete und Abhängigkeiten zu verwalten. OpenLayers bindet die Kartendaten ein und bietet die Funktionalität für interaktive Kartennavigation an.

- Das Frontend besteht aus den 3 Seiten und dazugehörigen CSS-Stildateien:

  **Verwaltung:** http://localhost:3000/

  - client\src\pages\HomePage.js

  - client\src\pages\HomePage.css

  **Kartenbereich:** http://localhost:3000/map

  - client\src\pages\MapPage.js

  - client\src\pages\MapPage.css

  **Statistik:** http://localhost:3000/stats

  - client\src\pages\StatsPage.js

- und einer **Komponente** die auf allen Seiten zu finden ist:

  **Header-Bar**

  - client\src\components\NavigationBar.js

  - client\src\components\NavigationBar.css

## **React**

React ermöglicht es Entwicklern, wiederverwendbare UI-Komponenten zu erstellen, die den Zustand der Anwendung effizient verwalten können. React wird verwendet, um eine reaktive, benutzerfreundliche Oberfläche zu schaffen, die sich dynamisch an die Interaktionen des Benutzers anpasst.

## **Node package manager (npm)**

npm erleichtert das Installieren, Aktualisieren und Verwalten von Softwarepaketen, die für die Entwicklung des Frontends, einschliesslich React und OpenLayers, benötigt werden. npm verwaltet Abhängigkeiten für Node.js-Anwendungen.

## **Open Layers**

OpenLayers wird eingesetzt, um die geografischen Daten in einer interaktiven Karte darzustellen, die Benutzerinteraktionen wie Zoomen, Verschieben und Klicken auf Elemente unterstützt. OpenLayers kann über seine umfangreichen Quellenoptionen direkt auf den Geoserver zugreifen, um räumliche Daten zu laden und anzuzeigen. Durch die Verwendung von WMS (Web Map Service) oder WFS (Web Feature Service), ermöglicht OpenLayers das Abrufen der bereitgestellten Geodaten auf dem Geoserver. Dazu wurden auf dem Geoserver die Layers **MapYourTrip:location** und **MapYourTrip:segment** publiziert.
