# MapYourTrip Frontend

- Das Frontend besteht aus den 3 Seiten:
  http://localhost:3000/ -> client\src\pages\HomePage.js
  http://localhost:3000/map -> client\src\pages\MapPage.js
  http://localhost:3000/stats -> client\src\pages\StatsPage.js
- und einer Komponente die auf allen Seiten zu finden ist:
  Header -> client\src\components\NavigationBar.js

# Verbindung DB und Geoserver mit Frontend

### 1. Bennenung der DB

---

**Name** -> MapYourTrip
Aufbau der DB gemäss backend

### 2. Erstellung eins neuen Arbeitsbereiches auf dem Geoserver

---

**Name:** -> MapYourTrip

**Namensraum URI:** -> http://localhost:8080/MapYourTrip

### 3. Erstellen eines Neuen Datenspeicher

---

**Arbeitsbereich** -> MapYourTrip

**Name der Datenquelle** -> MapYourTrip

**database** -> MapYourTrip

**user & Passwort** -> gemäss Lokaler DB

### 4. Neue Layer hinzufügen

---

Aus MapYourTrip die Layer **MapYourTrip:location** und **MapYourTrip:segment** Publizieren auf dem Geoserver

### 5. Kontrolle der Layer

---

Kontrolle der Publizierten Layer (Koordinatensystem und Bounding Box)
