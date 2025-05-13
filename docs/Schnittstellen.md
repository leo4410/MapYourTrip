---
layout: default
title: MapYourTrip
---

## Schnittstellen

Die Webapplikation MapYourTrip verwendet neben dem eigenen FastAPI Backend und dem Geoserver eine externe Schnittstelle zum OpenRouteService.

### OpenRouteService

Über den OpenRouteService wird die Routenoptimierung durchgeführt. Dabei werden Segmentinformationen (Start und Endpunkt) sowie das Verkehrsmitel dem Service geliefert und es wird eine dem Strassennetz angepaste Route wiedergegeben. Diese Route wird in die Datenbank gespeichert und ersetzt das alte Linienstück.
In der aktuellen Version der Webaplikation ist der service direcctions implementiert. Bei einer Erweiterung kann man die Funktionalität der elevation sowie pois implementieren. Mittels dem Service elevation ist angedacht ein Höhenprofil zu erstellen. Mittels dem Service pois kann man Interessante Punkte in der Nähe der Route visualisieren.

#### OpenRouteService Aufbau

Die nachfolgenden Beispiele zeigen Abfragen an den OpenRouteService. Weitere Details finden sich auf der offiziellen Webseite [https://openrouteservice.org/services/](https://openrouteservice.org/services/).

```https://api.openrouteservice.org/v2/{service}/{profile}?api_key=your-api-key&start=8.681495,49.41461&end=8.687872,49.420318```

- {service}: /directions, /elevation, /pois
- {profile}: /Verkehrsmittel, /line or point, point
