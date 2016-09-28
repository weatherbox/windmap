/*
 * @class L.Grib2tile
 * @author Yuta Tachibana
 *
 * requirements:
 * 		leaflet.js v1.0
 * 		grib2tile.js
 *
 */

L.Grib2tile = L.Class.extend({
	options: {
		bounds: new L.latLngBounds([22.4, 120.0], [47.6, 150.0]),
		tileZoom: [1, 2],
		tileSize: new L.Point(121, 127)
	},

	initialize: function (url, options) {
		this._url = url;
		options = L.setOptions(this, options);

		// tile bounds lat / lon
		this._tileBoundsLat = options.bounds.getNorth() - options.bounds.getSouth();
		this._tileBoundsLon = options.bounds.getEast() - options.bounds.getWest();
	},

	getWindField: function (bounds, zoom){

	},

	getField: function (bounds, zoom){

	},

	getWindVector: function (lat, lon){

	},

	getValue: function (lat, lon){

	},


	/*
	 * @private wrapper to grib2tiles
	 *
	 */
	_getTileUrl: function (coords) {
		return L.Util.template(this._url, {
			x: coords.x,
			y: coords.y,
			z: coords.z	
		});
	},

	_getTileZoom: function (mapZoom) {
		// TODO
		return 1;
	},

	_getTileRange: function (mapBounds, tileZoom) {
		var tileBounds = this.options.bounds,
		tileOrigin = tileBounds.getNorthWest();

		var nTiles = Math.pow(2, tileZoom),
			maxT = nTiles - 1,
			tileLat = this._tileBoundsLat / nTiles,
			tileLon = this._tileBoundsLon / nTiles;

		var N = Math.floor((tileOrigin.lat - mapBounds.getNorth()) / tileLat),
			W = Math.floor((mapBounds.getWest() - tileOrigin.lng) / tileLon),
			S = Math.floor((tileOrigin.lat - mapBounds.getSouth()) / tileLat),
			E = Math.floor((mapBounds.getEast() - tileOrigin.lng) / tileLon);

		return new L.Bounds(
			[Math.max(Math.min(W, maxT), 0), Math.max(Math.min(N, maxT), 0)],
			[Math.max(Math.min(E, maxT), 0), Math.max(Math.min(S, maxT), 0)]
		);
	},


	_getField: function (mapBounds, mapZoom, callback) {
		if (!mapBounds || !mapZoom) return;

		var tileZoom = this._getTileZoom(mapZoom),
			tileRange = this._getTileRange(mapBounds, tileZoom),
			queue = [];

		for (var key in this._tiles){
			this._tiles[key].current = false;
		}

		for (var j = tileRange.min.y; j <= tileRange.max.y; j++){
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++){
				var coords = new L.Point(i, j);
				coords.z = tileZoom;

				var tile = this._tiles[this._tileCoordsToKey(coords)];
				if (tile){
					tile.current = true;
				}else{
					queue.push(coords);
				}
			}
		}

		this._callback = callback;

		if (queue.length !== 0){
			this._getTiles(queue);

		}else{
			this._doneLoadingTiles();
		}
	},

	_doneLoadingTiles: function () {
		this._callback(this);
	},

	_getTiles: function (queue) {
		for (var i = 0; i < queue.length; i++){
			this._getTile(queue[i], L.bind(this._tileReady, this, coords));
		}
	},

	_getTile: function (coords, done) {
		var key = this._tileCoordsToKey(coords),
			url = this._getTileUrl(coords),
			_this = this;

		var gt = new Grib2tile(url, this.options.tileSize.x, this.options.tileSize.y);
		gt.get(function(){
			_this.tiles[key] = gt;
			done();
		});
	},

	_tileReady: function (coords) {
		var key = this._tileCoordsToKey(coords);

		tile = this._tiles[key];
		if (!tile) return;
		tile.loaded = +new Date();

		if (this._noTilesToLoad()){
			this._doneLoadingTiles();
			//TODO setTimeout(L.bind(this._pruneTiles, this), 250);
		}
	},

	_noTilesToLoad: function () {
		for (var key in this._tiles) {
			if (!this._tiles[key].loaded) { return false; }
		}
		return true;
	},

	_tileCoordsToKey: function (coords) {
		return coords.x + ':' + coords.y + ':' + coords.z;
	}
});


