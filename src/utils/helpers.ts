import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill } from 'ol/style';
import { Frame, GeoJSON } from '../types';

const percentageToHsl = (percentage: number) => {
  const hue = percentage * -120 + 120;
  return 'hsla(' + hue + ', 100%, 50%, 0.3)';
};

const createPolygon = (coordinates: number[][][], color: string) => {
  const polygonFeature = new Feature({
    type: 'Polygon',
    geometry: new Polygon(coordinates).transform('EPSG:4326', 'EPSG:3857'),
  });
  polygonFeature.setStyle(
    new Style({
      fill: new Fill({
        color: color,
      }),
    })
  );
  return polygonFeature;
};

export const createHeatLayer = (series: Frame[], geojson: GeoJSON) => {
  // const heatValues: number[] = [];
  const stores: string[] = [];
  const assignValueToStore: { [key: string]: number } = {};
  const assignValueToStoreCurrentFloor: { [key: string]: number } = {};
  const assignPolygonToStore: { [key: string]: number[][][] } = {};

  // series.map(item => {
  //   const sumValue = item.fields[0].values.buffer.reduce((sum, elm) => sum + elm, 0);
  //   heatValues.push(sumValue);
  //   if (item.name) {
  //     stores.push(item.name);
  //     assignValueToStore[item.name] = sumValue;
  //   }
  // });

  // const max = Math.max(...heatValues);
  // const min = Math.min(...heatValues);
  // const range = max - min;

  // const polygons: Feature[] = [];

  // geojson.features.map(feature => {
  //   if (feature.properties && feature.properties.name && stores.includes(feature.properties.name)) {
  //     const percentage = (assignValueToStore[feature.properties.name] - min) / range;
  //     polygons.push(createPolygon(feature.geometry.coordinates, percentageToHsl(percentage)));
  //   }
  // });

  series.map(item => {
    const sumValue = item.fields[0].values.buffer.reduce((sum, elm) => sum + elm, 0);
    if (item.name) {
      stores.push(item.name);
      assignValueToStore[item.name] = sumValue;
    }
  });

  geojson.features.map(feature => {
    if (feature.properties && feature.properties.name && stores.includes(feature.properties.name)) {
      assignValueToStoreCurrentFloor[feature.properties.name] = assignValueToStore[feature.properties.name];
      assignPolygonToStore[feature.properties.name] = feature.geometry.coordinates;
    }
  });

  const heatValues = Object.values(assignValueToStoreCurrentFloor);

  const max = Math.max(...heatValues);
  const min = Math.min(...heatValues);
  const range = max - min;

  const polygons: Feature[] = [];

  Object.keys(assignValueToStoreCurrentFloor).map(storeName => {
    const percentage = (assignValueToStoreCurrentFloor[storeName] - min) / range;
    console.log('debug ', assignValueToStoreCurrentFloor[storeName], percentage);
    polygons.push(createPolygon(assignPolygonToStore[storeName], percentageToHsl(percentage)));
  });

  return new VectorLayer({
    source: new VectorSource({
      features: polygons,
    }),
    zIndex: 2,
  });
};
