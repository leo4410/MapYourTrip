# Schnittstellen

Einleitung zu den implementierten Schnittstellen und deren Funktionen

**Schnittstelle Fast-API:**

- Import der Userdaten
- Abfragen der DB
- weitere...

**Schnittstelle Datenprozessing:**

- Inputdaten Prozessieren

**OpenRouteService:**

- _Openrouteservice’s directions:_ Routen optimieren
- _Openelevationservice:_ Punkte 2D abfragen und 3D bekommen
- _Openpoiservice:_ Abfragen zu POI's im Umkreis von einem Punkt

## OpenRouteService

{service}: /directions, /elevation, /pois

{profile}: /Verkehrsmittel, /line or point, point

https://api.openrouteservice.org/v2/{service}/{profile}?api_key=your-api-key&start=8.681495,49.41461&end=8.687872,49.420318

#### Aufbau vom Service

baseurl = https://api.openrouteservice.org/v2

_GET-Abfrage:_ {baseurl}/directions/driving-car?api_key = your-api-key& start = 8.681495,49.41461& end = 8.687872,49.420318

_QueryParameters:_ api_key, start, end

_PathParameter:_ profile

#### Codebeispiel Beispiel in JavaScrpit

```shell

var request = new XMLHttpRequest();

request.open('GET', 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a&start=8.681495,49.41461&end=8.687872,49.420318');

request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log('Status:', this.status);
    console.log('Headers:', this.getAllResponseHeaders());
    console.log('Body:', this.responseText);
  }
};

request.send();

```

#### Codebeispiel Beispiel in Python

```shell

import requests

headers = {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
}
call = requests.get('https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a&start=8.681495,49.41461&end=8.687872,49.420318', headers=headers)

print(call.status_code, call.reason)
print(call.text)

```

![Zugriffe auf ORS-Servics](bilder\ORS_API_Screenshot.png)
