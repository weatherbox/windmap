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

		var self = this;
		this._getTileJson(function (data) {
			self.data = data;

			// init time
			var valid_time = data.surface.valid_time;
			self.start_time = self.utc(valid_time[0]);
			self.end_time = self.utc(valid_time[valid_time.length - 1]);

			// show last o-clock
			var now = Math.floor(Date.now() / (3600 * 1000)) * 3600 * 1000;
			self.time = Math.max(self.start_time, Math.min(self.end_time, now));

			// init windmap elements
			self.level = 'surface';
			self.element = 'wind';

			self._initStreamline();

			window.windmapUI.setTimeSlider(self.start_time, self.end_time, self.time);
		});

		// set click event
		//map.on("click", this.showPointWind, this);
	},
	
	setTime: function (utc){
		this.time = utc;
		this._update();
	},
	
	setLevel: function (level){
		if (level != this.level){

			// surface <-> upper
			if (this.level == 'surface' && level != 'surface'){
				var time_3h = Math.round(this.time / (3 * 3600 * 1000)) * 3 * 3600 * 1000
				window.windmapUI.changeTimeSliderInterval('3h')
				window.windmapUI.changeTimeSliderTime(time_3h)

				this.time = time_3h;

			}else if (this.level != 'surface' && level == 'surface'){
				window.windmapUI.changeTimeSliderInterval('1h');
			}

			this.level = level;
			this._update();
		}
	},

	_initGrib2tile: function (){
		var url = this.data.url
			.replace("{valid_time}", this.dateString(this.time))
			.replace("{level}", this.level);

		var tileZoom = (this.level == 'surface') ? [1, 2] : [1];

		this._grib2tile = new L.Grib2tile(url, { tileZoom: tileZoom });
	},

	_initStreamline: function (){
		this._initGrib2tile();

		this._streamline = new L.Streamline(this._grib2tile, {
			onUpdate: window.windmapUI.showLoading,
			onUpdated: window.windmapUI.hideLoading
		});
		this._streamline.addTo(this._map);
	},

	_update: function (){
		this._grib2tile.abort();
		this._initGrib2tile();
		this._streamline.setWindData(this._grib2tile);
	},
	
	_getTileJson: function (callback) {
		$.getJSON(this.options.tileJson, function (data) {
			callback(data);
		});
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
	},

	utc: function (dateString){
		return Date.UTC(
			dateString.substr(0, 4),
			dateString.substr(4, 2) - 1,
			dateString.substr(6, 2),
			dateString.substr(8, 2),
			dateString.substr(10, 2)
		);
	},

	dateString: function (utc){
		let date = new Date(utc);
		let year = date.getUTCFullYear();
		let MM = ('0' + (date.getUTCMonth() + 1)).slice(-2);
		let dd = ('0' + date.getUTCDate()).slice(-2);
		let hh = ('0' + date.getUTCHours()).slice(-2);
		let mm = ('0' + date.getUTCMinutes()).slice(-2);
		return year + MM + dd + hh + mm
	}

});

