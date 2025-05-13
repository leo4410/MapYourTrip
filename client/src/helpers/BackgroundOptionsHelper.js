import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import StadiaMaps from "ol/source/StadiaMaps.js";

export const backgroundMaps = [
  {
    name: "OSM",
    source: new OSM({ crossOrigin: "anonymous" }),
    previewUrl: "https://a.tile.openstreetmap.org/10/511/340.png",
  },
  {
    name: "Luftbild",
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    }),
    previewUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/511/340",
  },
  {
    name: "Wasserfarbe",
    source: new StadiaMaps({ layer: "stamen_watercolor" }),
    previewUrl:
      "https://stamen-tiles.a.ssl.fastly.net/watercolor/10/541/349.jpg",
  },
  {
    name: "Terrain",
    source: new StadiaMaps({ layer: "stamen_terrain" }),
    previewUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/541/349.jpg",
  },
  {
    name: "CartoDB Positron",
    source: new XYZ({
      url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      crossOrigin: "anonymous",
    }),
    previewUrl:
      "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/10/511/340.png",
  },
];
