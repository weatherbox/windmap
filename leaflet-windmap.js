/*
 * @class L.Windmap
 * @inherits L.Class
 * @author Yuta Tachibana
 *
 * for leaflet v1.0
 *
 * requirements:
 *   leaflet-streamline.js
 *   streamline.js
 *   jQuery
 */

L.Windmap = L.Class.extend({
	options: {
		tileJson: "http://msm-tiles.s3-website-ap-northeast-1.amazonaws.com/tiles/tile.json"
	},

	initialize: function (map, options) {
		this._map = map;
		L.setOptions(this, options);

		this.createLoading();
		var self = this;
		this._getTileJson(function (data) {
			self._tileData = data;
			var valid_time = self._tileData.surface.valid_time[0];
			var url = self._tileData.url.replace("{valid_time}", valid_time);
			url = url.replace("{level}", "surface");
			self._initStreamline(url);	
		});
	},

	_initStreamline: function (url){
		this._grib2tile = new L.Grib2tile(url);

		this._streamline = new L.Streamline(this._grib2tile);
		this._streamline.onUpdate = function () { this._showLoading };
		this._streamline.onUpdated = function () { this._hideLoading };
		this._streamline.addTo(this._map);
	},

	_getTileJson: function (callback) {
		$.getJSON(this.options.tileJson, function (data) {
			callback(data);
		});
	},

	// loading animation by sonic.js
	createLoading: function () {
		var sonic = new Sonic(SonicLoader);
		this._loading = $("#loading");
		this._loading.append(sonic.canvas);
		sonic.play();
	},
	showLoading: function () {
		this._loading.show();
	},
	hideLoading: function () {
		this._loading.hide();
	},
	
	
});

