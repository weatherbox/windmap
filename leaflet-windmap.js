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
			self.data = data;

			self.time = self.data.surface.valid_time[0];
			self.level = 'surface';

			self._initStreamline();	
		});

		// set click event
		//map.on("click", this.showPointWind, this);
	},
	
	setTime: function (time){
		this.time = time;
		this._update();
	},


	_initGrib2tile: function (){
		var url = this.data.url.replace("{valid_time}", this.time)
			.replace("{level}", this.level);

		this._grib2tile = new L.Grib2tile(url);
	},

	_initStreamline: function (){
		this._initGrib2tile();

		this._streamline = new L.Streamline(this._grib2tile, {
			onUpdate: function (){ $("#loading").show(); },
			onUpdated: function (){ $("#loading").hide(); }
		});
		this._streamline.addTo(this._map);
	},

	_update: function (){
		this._initGrib2tile();
		this._streamline.setWindData(this._grib2tile);
	},
	
	_getTileJson: function (callback) {
		$.getJSON(this.options.tileJson, function (data) {
			callback(data);
		});
	},

	// loading animation by sonic.js
	createLoading: function () {
		var loading = $("#loading");
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

