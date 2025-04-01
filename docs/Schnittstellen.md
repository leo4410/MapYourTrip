# Schnittstellen
Einleitung zu den implementierten Schnittstellen und deren Funktionen

**Schnittstelle Fast-API:**
- Import der Userdaten
- Abfragen der DB
- weitere...

**Schnittstelle Datenprozessing:**
- Inputdaten Prozessieren

**OpenRouteService:** 
- *Openrouteservice’s directions:* Routen optimieren 
- *Openelevationservice:* Punkte 2D abfragen und 3D bekommen
- *Openpoiservice:* Abfragen zu POI's im Umkreis von einem Punkt

## OpenRouteService
{service}: /directions, /elevation, /pois

{profile}: /Verkehrsmittel, /line or point, point

https://api.openrouteservice.org/v2/{service}/{profile}?api_key=your-api-key&start=8.681495,49.41461&end=8.687872,49.420318

### 1. RouteService

#### Aufbau vom Service
baseurl =  https://api.openrouteservice.org/v2

*GET-Abfrage:* {baseurl}/directions/driving-car?api_key = your-api-key& start = 8.681495,49.41461& end = 8.687872,49.420318

*QueryParameters:* api_key, start, end 

*PathParameter:* profile

#### Codebeispiel Beispiel in JavaScrpit

``` shell

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

``` shell

import requests

headers = {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
}
call = requests.get('https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62480bd839bf8084480dac4bf416bd48a88a&start=8.681495,49.41461&end=8.687872,49.420318', headers=headers)

print(call.status_code, call.reason)
print(call.text)

```

### 2. EvationService

#### Aufbau vom Service
*GET-Abfrage:* 

*QueryParameters:* 

*PathParameter:* 

#### Codebeispiel

### 3. PoiService

#### Aufbau vom Service
*GET-Abfrage:* 

*QueryParameters:*

*PathParameter:* 

#### Codebeispiel
