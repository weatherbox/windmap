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
			self._setDate(self._tileData.ref_time);

			var valid_time = self._tileData.surface.valid_time[0];
			var url = self._tileData.url.replace("{valid_time}", valid_time);
			url = url.replace("{level}", "surface");
			self._initStreamline(url);	
		});

		// set click event
		map.on("click", this.showPointWind, this);
	},

	_initStreamline: function (url){
		this._grib2tile = new L.Grib2tile(url);

		this._streamline = new L.Streamline(this._grib2tile, {
			onUpdate: function (){ $("#loading").show(); },
			onUpdated: function (){ $("#loading").hide(); }
		});
		this._streamline.addTo(this._map);
	},

	_setDate: function (t) {
		var date = new Date(Date.UTC(t.substr(0, 4), t.substr(4, 2), t.substr(6, 2), t.substr(8, 2)));
		$("h1").text(date.toString() + " / Surface / MSM");
	},

	_getTileJson: function (callback) {
		$.getJSON(this.options.tileJson, function (data) {
			callback(data);
		});
	},

	// loading animation by sonic.js
	createLoading: function () {
		var sonic = new Sonic(SonicLoader);
		var loading = $("#loading");
		loading.append(sonic.canvas);
		sonic.play();
	},

	showPointWind: function (e) {
		var latlng = e.latlng;
		var v = this._grib2tile.getVector(latlng);
		if (v[0] != null){
			var speed = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
			var ang = Math.acos(v[1]/speed) / Math.PI * 180;
			if (v[0] < 0) ang = 360 - ang;
			$("#wind-dialog").text(Math.round(ang) + "° "  +Math.round(speed*10)/10 + "m/s");
			if (this._pointMarker) {
				this._pointMarker.setLatLng(latlng);
			}else{
				var circleIcon = L.divIcon({
					iconSize: [20, 20],
					iconAnchor: [10, 10],
					className: "",
					html: '<svg width="20" height="20"><circle cx="10" cy="10" r="6" fill="none"   stroke="#3aff3a" stroke-width="2.5"/></svg>'
				});
				this._pointMarker = L.marker(latlng, {icon:circleIcon}).addTo(this._map);
			}
		}
	},
	
	hidePointWind: function() {
		if (this._pointMarker) this._map.removeLayer(this._pointMarker);
		this._pointMarker = null;
		$("#wind-dialog").text("");
	}
});

