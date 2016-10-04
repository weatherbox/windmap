/*
 * @class L.Grib2tile
 * @inherits L.GridLayer
 * @author Yuta Tachibana
 *
 * requirements:
 * 		leaflet.js v1.0
 * 		grib2tile.js
 *
 */

L.Grib2tile = L.GridLayer.extend({
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

	getValue: function (latlon){

	},

	abort: function () {
		if (this._loadingTile) this._abortLoading();
	},

	/*
	 * @private get grib values
	 *
	 */
	getVector: function (latlng) {

		if (!this._fieldLatLngBounds.contains(latlng)){
			return [ null, null ];
		}

		var lat = latlng.lat,
			lng = latlng.lng;

		var p0 = this._p0,
			dlat = this._dlat,
			dlng = this._dlng;
		
		var x = Math.floor((lng - p0.lng) / dlng);
		var y = Math.floor((p0.lat - lat) / dlat);
		var dx = (lng - (p0.lng + dlng * x)) / dlng;
		var dy = ((p0.lat - dlat * y) - lat) / dlat;

		// util to access grid wind data
		var _this = this;
		function v (x, y) {
			var n = _this._fnx * y + x;
			return [ _this._ufield[n], _this._vfield[n] ];
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


	_createField: function () {
		console.time("create field");
		var nz = Math.pow(2, this._tileZoom),
			tlat = this._tileBoundsLat / nz,
			tlon = this._tileBoundsLon / nz,
			dlat = tlat / this._tny,
			dlon = tlon / this._tnx,
			tnx = this._tnx,
			tny = this._tny,
			origin = this._origin;
				
		function getFieldPoint (latlng, plus) {
			// tile coords
			var tx = Math.floor((latlng.lng - origin.lng) / tlon);
			var ty = Math.floor((origin.lat - latlng.lat) / tlat);

			// tile origin
			var tox = origin.lng + tlon * tx;
			var toy = origin.lat - tlat * ty;

			// tile grid point
			var x = Math.floor((latlng.lng - tox) / dlon);
			var y = Math.floor((toy - latlng.lat) / dlat);

			if (plus){
				if (x + 1 < tnx){
					x += 1;
				}else{
					tx += 1;
					x = 1;
				}

				if (y + 1 < tny){
					y += 1;
				}else{
					ty += 1;
					y = 1;
				}
			}

			var p = new L.Point(x, y);
			p.tx = tx;
			p.ty = ty;

			return p;
		}

		function fieldPointToLatLng (p) {
			return new L.latLng([
				origin.lat - tlat * p.ty - dlat * p.y,
				origin.lng + tlon * p.tx + dlon * p.x
			]);
		}

		var p1 = this._checkBounds(getFieldPoint(this._bounds.getNorthWest()));
		var p2 = this._checkBounds(getFieldPoint(this._bounds.getSouthEast(), true));

		this._fieldLatLngBounds = new L.latLngBounds(
			fieldPointToLatLng(p1),
			fieldPointToLatLng(p2)
		);
		this._p0 = fieldPointToLatLng(p1);

		this._dlat = dlat;
		this._dlng = dlon;
		this._fnx = (p2.tx - p1.tx) * (this._tnx - 1) - p1.x + p2.x + 2;
		this._fny = (p2.ty - p1.ty) * (this._tny - 1) - p1.y + p2.y + 2;
		var length = this._fnx * this._fny;

		this._ufield = new Float32Array(length);
		this._vfield = new Float32Array(length);

		// insert to field from tile
		for (var ity = p1.ty; ity <= p2.ty; ity++){
			for (var itx = p1.tx; itx <= p2.tx; itx++){
				var ukey = this._tileCoordsToKey({ x:itx, y:ity, z:this._tileZoom, e:"UGRD" });
				var vkey = this._tileCoordsToKey({ x:itx, y:ity, z:this._tileZoom, e:"VGRD" });

				var iy1 = (ity == p1.ty) ? p1.y : 0;
				var iy2 = (ity == p2.ty) ? p2.y : this._tny - 1;
				var ix1 = (itx == p1.tx) ? p1.x : 0;
				var ix2 = (itx == p2.tx) ? p2.x : this._tnx - 1;
				var ifx = (itx == p1.tx) ? 0 : (itx - p1.tx) * (this._tnx - 1) - p1.x + 1;
				var ify = (ity == p1.ty) ? 0 : (ity - p1.ty) * (this._tny - 1) - p1.y + 1;
				var offset, offset_f, u,v;

				for (var iy = iy1; iy <= iy2; iy++){
					offset = this._tnx * iy;
					u = this._tiles[ukey].data.subarray(offset + ix1, offset + ix2 + 1);
					v = this._tiles[vkey].data.subarray(offset + ix1, offset + ix2 + 1);

					offset_f = ifx + this._fnx * (ify + iy - iy1);
					this._ufield.set(u, offset_f);
					this._vfield.set(v, offset_f);
				}
			}
		}

		// done
		console.timeEnd("create field");
		this._callback(this);
	},
		
	_checkBounds: function (p) {
		var nz = Math.pow(2, this._tileZoom);

		if (p.tx < 0){
			p.tx = 0;
			p.x = 0;

		}else if (p.tx >= nz){
			p.tx = nz - 1;
			p.x = this._tnx - 1;
		}
		
		if (p.ty < 0){
			p.ty = 0;
			p.y = 0;

		}else if (p.ty >= nz){
			p.ty = nz - 1;
			p.y = this._tny - 1;
		}

		return p;
	},

	/*
	 * @private wrapper to grib2tiles
	 *
	 */
	_getTileUrl: function (coords) {
		return L.Util.template(this._url, coords);
	},

	// use less than 4 tiles
	_getTileZoom: function (mapZoom, mapBounds) {
		var mapBoundsLat = mapBounds.getNorth() - mapBounds.getSouth(),
			mapBoundsLon = mapBounds.getEast() - mapBounds.getWest();

		for (var i = this.options.tileZoom.length - 1; i >= 0; i--) {
			var z = this.options.tileZoom[i];
			var nz = Math.pow(2, z);

			var u = mapBoundsLon / (this._tileBoundsLon / nz),
				v = mapBoundsLat / (this._tileBoundsLat / nz);

			if (u * v <= 4) {
				return z;
			}
		}
		return z;
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
		if (this._loadingTiles) this._abortLoading();
		if (!mapBounds || !mapZoom) return;

		var tileZoom = this._getTileZoom(mapZoom, mapBounds),
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

		this._bounds = mapBounds;
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
		this._createField();
	},

	_getTiles: function (queue) {
		this._loadingTiles = true;
		for (var i = 0; i < queue.length; i++){
			this._getTile(queue[i], L.bind(this._tileReady, this, queue[i]));
		}
	},

	_getTile: function (coords, done) {
		var key = this._tileCoordsToKey(coords),
			url = this._getTileUrl(coords);

		var gt = new Grib2tile(url, this._tnx, this._tny);
		gt.coords = coords;
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
			this._loadingTiles = false;
			this._doneLoadingTiles();
			setTimeout(L.bind(this._pruneTiles, this), 250);
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
	},

	_abortLoading: function () {
		for (var key in this._tiles) {
			if (!this._tiles[key].loaded) {
			   this._tiles[key]._req.abort();
			}
		}
	}
});

