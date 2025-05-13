---
layout: default
title: MapYourTrip
---


# Schnittstellen

Die Webseite MapYourTrip verwendet eine Fast-API, den Geoserver, Datenprozessing sowie die OpenRouteService Schnitstelle

**Schnittstelle Fast-API:**

Über Fast-API wird vom Frontend mit der Datenbank komuniziert. Dabei werden Userdaten in die Datenbank gespeichert sowie Abfragen an der Datenbank getätigt.

**Schnittstelle Datenprozessing:**

Über das Datenprozessing werden die Daten von Polarsteps aufbereitet sodass eine Speicherung in der Datenbank ermöglicht wird.

**Geoserver**

Der Geoserver stellt eine Verbindung von der Datenbank zu dem Frontend her. Es stellt die gespeicherten Elemente als WFS dem Frontend zur verfügung.

**OpenRouteService:**

Über den Service OpenRouteService wird die Routenoptimierung durchgeführt. Dabei werden Segmentinformationen (Start und Endpunkt) sowie das Verkehrsmitel dem Service geliefert und es wird eine dem Strassennetz angepaste Route wiedergegeben. Diese Route wird in die Datenbank gespeichert und ersetzt das alte Linienstück.
In der aktuellen Version der Webaplikation ist der service direcctions implementiert. Bei einer Erweiterung kann man die Funktionalität der elevation sowie pois implementieren. Mittels dem Service elevation ist angedacht ein Höhenprofil zu erstellen. Mittels dem Service pois kann man Interessante Punkte in der Nähe der Route visualisieren.

#### OpenRouteService Aufbau:

{service}: /directions, /elevation, /pois

{profile}: /Verkehrsmittel, /line or point, point

https://api.openrouteservice.org/v2/{service}/{profile}?api_key=your-api-key&start=8.681495,49.41461&end=8.687872,49.420318

baseurl = https://api.openrouteservice.org/v2

_GET-Abfrage:_ {baseurl}/directions/driving-car?api_key = your-api-key& start = 8.681495,49.41461& end = 8.687872,49.420318

