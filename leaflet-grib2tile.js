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

		this._origin = options.bounds.getNorthWest();
		this._tileBounds = options.bounds;
		this._tnx = options.tileSize.x;
		this._tny = options.tileSize.y;

		this._tiles = {};
	},

	getWindField: function (bounds, zoom, callback){
		this._getField("wind", bounds, zoom, callback);
	},

	getField: function (element, bounds, zoom, callback){
		this._getField(element, bounds, zoom, callback);
	},

	getVector: function (latlon){
		return this._getVector(latlon);
	},

	getValue: function (latlon){

	},


	/*
	 * @private get grib values
	 *
	 */
	_getVector: function (latlng) {
		var lat = latlng.lat,
			lng = latlng.lng;

		if (!this._tileBounds.contains(latlng)){
			return [ null, null ];
		}

		var nz = Math.pow(2, this._tileZoom),
			tlat = this._tileBoundsLat / nz,
			tlon = this._tileBoundsLon / nz,
			dlat = tlat / this._tny,
			dlon = tlon / this._tnx;

		// tile coords
		var tx = Math.floor((lng - this._origin.lng) / tlon);
		var ty = Math.floor((this._origin.lat - lat) / tlat);

		// tile origin
		var tox = this._origin.lng + tlon * tx;
		var toy = this._origin.lat - tlat * ty;

		// tile grid point
		var x = Math.floor((lng - tox) / dlon);
		var y = Math.floor((toy - lat) / dlat);

		// tile grid relative position
		var dx = (lng - (tox + dlon * x)) / dlon;
		var dy = ((toy - dlat * y) - lat) / dlat;

		// key to grib2tile data
		var ukey = this._tileCoordsToKey({ x:tx, y:ty, z:this._tileZoom, e:"UGRD" });
		var vkey = this._tileCoordsToKey({ x:tx, y:ty, z:this._tileZoom, e:"VGRD" });

		// util to access grid wind data
		var _this = this;
		function v (x, y) {
			var n = _this._tnx * y + x;
			return [ _this._tiles[ukey].data[n], _this._tiles[vkey].data[n] ];
		}

		return this._bilinearInterpolateVector(
			dx, dy,
			v(x, y), v(x+1, y), v(x, y+1), v(x+1, y+1)
		);
	},

	_bilinearInterpolateVector: function (x, y, p00, p10, p01, p11) {
		var rx = (1 - x);
		var ry = (1 - y);
		var a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
		var u = p00[0] * a + p10[0] * b + p01[0] * c + p11[0] * d;
		var v = p00[1] * a + p10[1] * b + p01[1] * c + p11[1] * d;
		return [ u, v ];
	},


	/*
	 * @private wrapper to grib2tiles
	 *
	 */
	_getTileUrl: function (coords) {
		return L.Util.template(this._url, coords);
	},

	_getTileZoom: function (mapZoom) {
		// TODO
		return 2;
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


	_getField: function (element, mapBounds, mapZoom, callback) {
		if (!mapBounds || !mapZoom) return;

		var tileZoom = this._getTileZoom(mapZoom),
			tileRange = this._getTileRange(mapBounds, tileZoom);
		this._queue = [];

		for (var key in this._tiles){
			this._tiles[key].current = false;
		}

		// create tile load queue
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++){
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++){
				if (element == "wind"){
					this._enqueue({ x:i, y:j, z:tileZoom, e:"UGRD" });
					this._enqueue({ x:i, y:j, z:tileZoom, e:"VGRD" });

				}else{
					this._enqueue({ x:i, y:j, z:tileZoom, e:element });
				}
			}
		}

		this._tileZoom = tileZoom;
		this._callback = callback;

		console.time("load tiles");
		if (this._queue.length !== 0){
			this._getTiles(this._queue);

		}else{
			this._doneLoadingTiles();
		}
	},

	_enqueue: function (coords) {
		var tile = this._tiles[this._tileCoordsToKey(coords)];
		if (tile){
			tile.current = true;
		}else{
			this._queue.push(coords);
		}
	},

	_doneLoadingTiles: function () {
		console.timeEnd("load tiles");
		this._callback(this);
	},

	_getTiles: function (queue) {
		for (var i = 0; i < queue.length; i++){
			this._getTile(queue[i], L.bind(this._tileReady, this, queue[i]));
		}
	},

	_getTile: function (coords, done) {
		var key = this._tileCoordsToKey(coords),
			url = this._getTileUrl(coords);

		var gt = new Grib2tile(url, this._tnx, this._tny);
		this._tiles[key] = gt;
		console.log("get tile:", key);
		gt.get(function(){
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
		return coords.e + ':' + coords.x + ':' + coords.y + ':' + coords.z;
	}
});

