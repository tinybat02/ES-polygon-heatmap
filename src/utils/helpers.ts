import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill } from 'ol/style';
import { Frame, GeoJSON } from '../types';

const percentageToHsl = (percentage: number) => {
  const hue = percentage * -80 + 100;
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
  const heatValues: number[] = [];
  const stores: string[] = [];
  const assignValueToStore: { [key: string]: number } = {};

  series.map(item => {
    heatValues.push(item.fields[0].values.buffer[0]);
    if (item.name) {
      stores.push(item.name);
      assignValueToStore[item.name] = item.fields[0].values.buffer[0];
    }
  });

  const max = Math.max(...heatValues);
  const min = Math.min(...heatValues);
  const range = max - min;

  const polygons: Feature[] = [];

  geojson.features.map(feature => {
    if (feature.properties && feature.properties.name && stores.includes(feature.properties.name)) {
      const percentage = (assignValueToStore[feature.properties.name] - min) / range;
      polygons.push(createPolygon(feature.geometry.coordinates, percentageToHsl(percentage)));
    }
  });

  return new VectorLayer({
    source: new VectorSource({
      features: polygons,
    }),
    zIndex: 2,
  });
};
