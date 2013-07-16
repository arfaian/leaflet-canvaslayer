L.CanvasLayer = L.Class.extend({
  includes: L.Mixin.Events,

  options: {},

  initialize: function(options) {
    L.Util.extend(this, options);
  },

  onAdd: function(map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    map._panes.overlayPane.appendChild(this._canvas);

    map.on('zoomend', this._repositionCanvas, this);
    map.on('viewreset', this._resize, this);
    map.on('move', this._repositionCanvas, this);

    this._resize();
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('zoomend', this._repositionCanvas, this);
    map.off('viewreset', this._resize, this);
    map.off('move', this._repositionCanvas, this);
  },

  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  bringToFront: function() {
    if (this._canvas) {
      this._map._panes.overlayPane.appendChild(this._canvas);
    }

    return this;
  },

  bringToBack: function() {
    var pane = this._map._panes.overlayPane;
    if (this._canvas)  {
      pane.insertBefore(this._canvas, pane.firstChild);
    }
  },

  getCanvas: function() {
    return this._canvas;
  },

  _initCanvas: function() {
    this._canvas = L.DomUtil.create('canvas', 'canvaslayer');
    this._canvas.style.position = 'absolute';
    this._canvas.style.top = 0;
    this._canvas.style.left = 0;
    this._canvas.style.pointerEvents = 'none';

    this._glCtx = this._canvas.getContext("webgl");

    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      //L.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated');
      L.DomUtil.addClass(this._canvas, 'leaflet-zoom-hide');
    } else {
      L.DomUtil.addClass(this._canvas, 'leaflet-zoom-hide');
    }

    L.extend(this._canvas, {
      onselectstart: L.Util.falseFn,
      onmousemove: L.Util.falseFn
    });
  },

  getContext: function() {
    return this._glCtx;
  },

  _repositionCanvas: function() {
    var map = this._map;
    var origin = map.latLngToLayerPoint(map.getBounds().getNorthWest());

    this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(origin);

    this.updateHandler(this._glCtx, map.getZoom());
  },

  _resize: function() {
    var map = this._map,
        canvas = this._canvas,
        width = map.getContainer().offsetWidth,
        height = map.getContainer().offsetHeight;

    if (canvas.width != width && canvas.heigh != height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = map.getContainer().offsetWidth + 'px';
      canvas.style.height = map.getContainer().offsetHeight + 'px';

      this.resizeHandler(this._glCtx, width, height);
    }
  }
});

L.canvasLayer = function(options) {
  return new L.CanvasLayer(options);
};
