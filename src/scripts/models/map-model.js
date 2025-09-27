export class MapModel {
  constructor() {
    this.mapInstance = null;
  }

  createMap(containerId, options = {}) {
    if (!window.L) {
      throw new Error('Leaflet library not loaded');
    }

    const defaultOptions = {
      center: [-2.5, 118],
      zoom: 4.5,
      ...options
    };

    this.mapInstance = L.map(containerId, defaultOptions);
    return this.mapInstance;
  }

  addTileLayer(map, url, options = {}) {
    if (!window.L) {
      throw new Error('Leaflet library not loaded');
    }

    const defaultOptions = {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
      ...options
    };

    return L.tileLayer(url, defaultOptions);
  }

  addMarker(map, latlng, popupContent = null) {
    if (!window.L) {
      throw new Error('Leaflet library not loaded');
    }

    const marker = L.marker(latlng).addTo(map);
    if (popupContent) {
      marker.bindPopup(popupContent);
    }
    return marker;
  }

  addLayerGroup(map) {
    if (!window.L) {
      throw new Error('Leaflet library not loaded');
    }

    return L.layerGroup().addTo(map);
  }

  addLayerControl(map, baseLayers, overlayLayers, options = {}) {
    if (!window.L) {
      throw new Error('Leaflet library not loaded');
    }

    const defaultOptions = {
      collapsed: false,
      ...options
    };

    return L.control.layers(baseLayers, overlayLayers, defaultOptions).addTo(map);
  }

  destroyMap() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  getMapInstance() {
    return this.mapInstance;
  }
}



