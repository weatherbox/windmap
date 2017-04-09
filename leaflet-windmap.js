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
 */

L.Windmap = L.Class.extend({
	options: {
		tileJson: "http://msm-tiles.s3-website-ap-northeast-1.amazonaws.com/tiles/tile.json"
	},

	initialize: function (map, options) {
		this._map = map;
		L.setOptions(this, options);

		var self = this;
		this._getJSON(this.options.tileJson, function (data) {
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
		this._onSingleClick();
	},
	
	setTime: function (utc){
		this.time = utc;
		this._update();
	},

	setElement: function (element){
		console.log(element);
		var code = {
			wind: "wind",
			temp: "TMP",
			humidity: "RH",
			cloud: "TCDC",
			rain: "APCP",
			press: "PRMSL"
		};
		this.element = code[element];

		if (this.element == "wind"){
			this._maskGrib = null;
			this._streamline.setMaskData(null);

		}else{
			this._maskGrib = this._initGrib2tile(this.element);
			this._streamline.setMaskData(this._maskGrib, this._maskColor(this.element));
		}
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

	_initGrib2tile: function (element){
		var level = (!element || element == "TMP" || element == "RH") ? this.level : "surface";
		var url = this.data.url
			.replace("{valid_time}", this.dateString(this.time))
			.replace("{level}", level);

		if (element) url = url.replace("{e}", element);

		var tileZoom = (level == "surface") ? [0, 1] : [0];

		return new L.Grib2tile(url, element, { tileZoom: tileZoom });
	},

	_initStreamline: function (){
		var self = this;
		this._windGrib = this._initGrib2tile();

		this._streamline = new L.Streamline(this._windGrib, {
			onUpdate: window.windmapUI.showLoading,
			onUpdated: function () {
				window.windmapUI.hideLoading();
				if (self._pointMarker) self.updatePointValue();
			}
		});

		if (this.element != "wind"){
			this._maskGrib = this._initGrib2tile(this.element);
			this._streamline.setMaskData(this._maskGrib, this._maskColor(this.element));
		}

		this._streamline.addTo(this._map);
	},

	_updateWindGrib: function (){
		this._windGrib.abort();
		this._windGrib = this._initGrib2tile();
		this._streamline.setWindData(this._windGrib);
	},

	_updateMaskGrib: function (){
		this._maskGrib.abort();
		this._maskGrib = this._initGrib2tile(this.element);
		this._streamline.setMaskData(this._maskGrib, this._maskColor(this.element));
	},

	_update: function (){
		this._updateWindGrib();
		if (this._maskGrib) this._updateMaskGrib();
		this._streamline._update();
	},
	
	// substitute $.getJSON
	_getJSON: function (url, callback){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if ((xhr.readyState === 4) && (xhr.status === 200)) {
				var data = JSON.parse(xhr.responseText);
				callback(data);
			}
		}
		xhr.open("GET", url, true);
		xhr.send(null);	
	},


	/*
	 * PointValue - marker on map
     *
	 */
	showPointValue: function (e) {
		var latlng = e.latlng;

		if (this.element == "wind"){
			var v = this._windGrib.getVector(latlng);
			if (v[0] != null) this._initPointValue(v, latlng);

		}else{
			var v = this._maskGrib.getValue(latlng);
			if (v != null) this._initPointValue(v, latlng);
		}
	},

	// ignore dblclick event
	_onSingleClick: function (){
		var self = this;
		this._clickTimer = null;
		this._dblclickTime = 0;

		this._map.on('click', function (e){
			// avoid click with dblclick
			if ((Date.now() - self._dblclickTime) < 100) return;

			self._clickTimer = setTimeout(function(){
				self.showPointValue(e);
			}, 300);
		});

		this._map.on('dblclick', function (e){
			self._dblclickTime = Date.now();
			if (self._clickTimer){
				clearTimeout(self._clickTimer);
				self._clickTimer = null;
			}
		});
	},

	updatePointValue: function () {
		var latlng = this._pointMarker.getLatLng();

		if (this.element == "wind"){
			var v = this._windGrib.getVector(latlng);
			if (v[0] != null) this._updatePointValue(v, latlng);

		}else{
			var v = this._maskGrib.getValue(latlng);
			if (v != null) this._updatePointValue(v, latlng);
		}
	},

	_updatePointValue: function (v, latlng) {
		var icon = this._createPointIcon(v);
		this._pointMarker.setIcon(icon);
		window.windmapUI.changePointDetail(latlng.lat, latlng.lng);
	},

	_pointText: function (v) {
		if (this.element == "wind"){
			var speed = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
			var ang = Math.acos(v[1] / speed) / Math.PI * 180 + 180;
			if (v[0] < 0) ang = 360 - ang;

			return Math.round(ang) + "° "  + speed.toFixed(1) + "m/s";

		}else if (this.element == "TMP"){
			return (v - 273.15).toFixed(1) + "℃";

		}else if (this.element == "RH"){
			return v.toFixed(0) + "%";

		}else if (this.element == "TCDC"){
			return v.toFixed(0) + "%";

		}else if (this.element == "APCP"){
			return v.toFixed(1) + "mm/h";

		}else if (this.element == "PRMSL"){
			return (v / 100).toFixed(0) + "hPa";

		}else{
			return v.toFixed(1);
		}
	},

	_initPointValue: function (v, latlng){
		var icon = this._createPointIcon(v);

		if (this._pointMarker) {
			this._pointMarker.setLatLng(latlng);
			this._pointMarker.setIcon(icon);
			window.windmapUI.changePointDetail(latlng.lat, latlng.lng);

		}else{
			this._pointMarker = L.marker(
				latlng, 
				{ icon:icon, draggable:true }
			).addTo(this._map);

			this._pointMarker.on('dragend', this.updatePointValue, this);
			this._pointMarker.on('click', this.showPointDetail, this);
		}
	},
	
	_createPointIcon: function (value) {
		var text = this._pointText(value);

		return new L.divIcon({
			iconSize: [10, 60],
			iconAnchor: [0, 60],
			className: 'leaflet-point-icon',
			html: '<div class="point-flag">' +
				'<a class="flag-text" id="flag-text">' + text + '</a>' +
				'<div class="flag-pole"></div>' +
				'<div class="flag-draggable-square"></div>' +
				'<div class="flag-anchor"></div>' +
				'</div>'
		});
	},

	showPointDetail: function (e){
		var ep = e.originalEvent;
		var p = this._pointMarker.getLatLng();
		window.windmapUI.showPointDetail(p.lat, p.lng);
	},
	
	hidePointValue: function() {
		if (this._pointMarker) this._map.removeLayer(this._pointMarker);
		this._pointMarker = null;
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
	},

	_maskColor: function (element){
		// function (v) -> return [R, G, B, A]
		let MASK_ALPHA = Streamline.prototype.MASK_ALPHA;

		if (element == 'TMP'){  // temperture
			let tempColorScale = SegmentedColorScale([
				[193,     [37, 4, 42]],
				[206,     [41, 10, 130]],
				[219,     [81, 40, 40]],
				[233.15,  [192, 37, 149]],  // -40 C/F
				[255.372, [70, 215, 215]],  // 0 F
				[273.15,  [21, 84, 187]],   // 0 C
				[275.15,  [24, 132, 14]],   // just above 0 C
				[291,     [247, 251, 59]],
				[298,     [235, 167, 21]],
				[311,     [230, 71, 39]],
				[328,     [88, 27, 67]]
			]);

			return function (v){
				return tempColorScale(v, MASK_ALPHA);
			}

		}else if (element == 'RH'){  // relative humidity
			let presColorScale = chroma.scale('RdYlBu').domain([0,1]);

			return function (v){
				let c = presColorScale(v/100).rgb();
				return [c[0], c[1], c[2], MASK_ALPHA];
			}

		}else if (element == 'TCDC'){  // total cloud cover
			let cloudColorScale = chroma.scale(['black', 'white']).domain([0,100]);

			return function (v){
				let c = cloudColorScale(v).rgb();
				let alpha = MASK_ALPHA * v / 100;
				return [c[0], c[1], c[2], alpha];
			}

		}else if (element == 'APCP'){  // rain
			let rainColorScale = chroma.scale(['008ae5', 'yellow', '#fa0080'])
    			.domain([0, 0.3, 1])
				.mode('lch');

			return function (v){
				let c = rainColorScale(Math.min(v / 100, 1)).rgb();
				let alpha = (v < 0.1) ? 0 : (v < 1) ? MASK_ALPHA * v : MASK_ALPHA;
				return [c[0], c[1], c[2], alpha];
			}

		}else if (element == 'PRMSL'){  // pressure
			let presColorScale = chroma.scale('RdYlBu').domain([1,0]);

			return function (v){
				let vh = (v / 100).toFixed(0); // quantize 1hPa
				let vd = Math.min(Math.max((vh - 993)/40, 0), 1)
				let c = presColorScale(vd).rgb();
				return [c[0], c[1], c[2], MASK_ALPHA];
			}
		}
	}

});

