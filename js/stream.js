/**
 *   Stream - vector field visualization using canvas
 *
 *   NOTE: stream.setField(field, projection);
 *		field: require getVector method
 *			get vector at any point(x,y) on canvas
 *		projection: require unproject method
 *			project canvas point(x,y) to field point(cf. latlng)
 */
function Stream(bound, streamCtx, maskCtx) {

	var PARTICLE_MULTIPLIER = 7;
	var PARTICLE_LINE_WIDTH = 1.0;
	var MAX_PARTICLE_AGE = 100;
	var MASK_ALPHA = Math.floor(0.3*255);
	var FRAME_RATE = 40;
	var NULL_VECTOR = [NaN, NaN, null];
	var TRANSPARENT_BLACK = [0,0,0,0];

	bound.width  = bound.x[1] - bound.x[0];
	bound.height = bound.y[1] - bound.y[0];

	var timer;  // frame rate timer
	var mask = Mask();
	
	/**
	 *	Grid - canvasと同じ大きさのベクトル集合
	 *		fieldから生成
	 *   	xy
	 *   	vector: [u, v, m]
	 */
	var Grid = function(){
		var rows = [];

		function set(field, projection, scale) {
			if ( !scale ) scale = 1;
			rows = [];
			for (var y = bound.y[0]; y < bound.y[1]; y+=2){
				interpolateRow(y);
			}

			function interpolateRow(y) {
				var row = [];
				for (var x = bound.x[0]; x < bound.x[1]; x+=2){
					var latlng = projection.unproject(x, y);
					var v = field.getVector(latlng);
					var wind = (v[0] == null) ? NULL_VECTOR : [ v[0]*scale, v[1]*-1*scale, Math.sqrt(v[0]*v[0] + v[1]*v[1]) ];
					row[x] = row[x+1] = wind;

					var color = (v[0] == null) ? TRANSPARENT_BLACK : extendedSinebowColor(Math.min(wind[2], 100) / 100, MASK_ALPHA);
					mask.set(x,   y,   color)
						.set(x+1, y,   color)
						.set(x,   y+1, color)
						.set(x+1, y+1, color);
				}
				rows[y] = rows[y+1] = row;
			}
		}

		function get(x, y) {
			var row = rows[Math.round(y)];
			return row && row[Math.round(x)] || NULL_VECTOR;
		}

		function isDefined(x, y){
			return get(x, y)[2] !== null;
		}

		function release() {
			rows = [];
		}

		function randomize(o) {
			var x, y;
			var safetyNet = 0;
			do {
				x = Math.round(_.random(bound.x[0], bound.x[1]));
				y = Math.round(_.random(bound.y[0], bound.y[1]));
			} while (!isDefined(x, y) && safetyNet++ < 30);
			o.x = x;
			o.y = y;
			return o;
		};

		return {
			set: set,
			get: get,
			isDefined: isDefined,
			release: release,
			randomize: randomize
		};
	}();


	function Mask(){
		maskCtx.fillStyle = "rgba(255,0,0,1)";
		maskCtx.fill();

		var imageData = maskCtx.getImageData(0, 0, bound.width, bound.height);
		var data = imageData.data;

		return {
			imageData: imageData,
			isVisible: function(x, y) {
				return data[(y*bound.width + x)*4 + 3] > 0;
			},
			set: function(x, y, rgba) {
				var i = (y * bound.width + x) * 4;
				data[ i ] = rgba[0];
				data[i+1] = rgba[1];
				data[i+2] = rgba[2];
				data[i+3] = rgba[3];
				return this;
			}
		};
	}

	
	// colors
	function colorInterpolator(start, end) {
		var r = start[0], g = start[1], b = start[2];
		var dr = end[0] - r, dg = end[1] - g, db = end[2] - b;
		return function(i, a) {
			return [Math.floor(r + i * dr), Math.floor(g + i * dg), Math.floor(b + i * db), a];
		};
	}

	function sinebowColor(hue, a) {
		// Map hue [0, 1] to radians [0, 5/6τ]. Don't allow a full rotation because that keeps hue == 0 and
		// hue == 1 from mapping to the same color.
		var rad = hue * 2 * Math.PI * 5/6;
		rad *= 0.75;  // increase frequency to 2/3 cycle per rad

		var s = Math.sin(rad);
		var c = Math.cos(rad);
		var r = Math.floor(Math.max(0, -c) * 255);
		var g = Math.floor(Math.max(s, 0) * 255);
		var b = Math.floor(Math.max(c, 0, -s) * 255);
		return [r, g, b, a];
	}

	var BOUNDARY = 0.45;
	var fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]);
	function extendedSinebowColor(i, a) {
		return i <= BOUNDARY ?
			sinebowColor(i / BOUNDARY, a) :
			fadeToWhite((i - BOUNDARY) / (1 - BOUNDARY), a);
	}

	function colorScale(step, maxWind){
		function asColorStyle(r, g, b, a) {
			return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
		}

		var result = [];
		for (var j = 85; j <= 255; j += step) {
			result.push(asColorStyle(j, j, j, 1.0));
		}
		result.indexFor = function(m) {
			return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
		};
		return result;
	}


	function setField(field, projection, scale){
		if (timer) clearTimeout(timer);
		Grid.release();
		Grid.set(field, projection, scale);
	}




	/**
	 *   animate stream
	 *		require canvas context
	 */
	function animate(density){
		var color = colorScale(10, 17);
		var fadeFillStyle = "rgba(0, 0, 0, 0.97)";
		var buckets = color.map(function(){ return []; });
		if ( !density ) density = 1;
		var particleCount = Math.round(bound.width * PARTICLE_MULTIPLIER * density);
		console.log("particles:" + particleCount)
		var particles = [];
		for (var i = 0; i < particleCount; i++) {
			particles.push(Grid.randomize({age: _.random(0, MAX_PARTICLE_AGE)}));
		}

		function evolve() {
			buckets.forEach(function(bucket){ bucket.length = 0; });
			particles.forEach(function(particle){
				if ( particle.age > MAX_PARTICLE_AGE ){
					Grid.randomize(particle).age = 0;
				}

				var x = particle.x;
				var y = particle.y;
				var v = Grid.get(x, y);
				var m = v[2];
				if ( m === null ){
					particle.age = MAX_PARTICLE_AGE;

				}else{
					var xt = x + v[0];
					var yt = y + v[1];
					if ( Grid.isDefined(xt, yt) ){
						particle.xt = xt;
						particle.yt = yt;
						buckets[color.indexFor(m)].push(particle);

					}else{
						particle.x = xt;
						particle.y = yt;
					}
				}
				particle.age++;
			});
		}

		streamCtx.lineWidth = PARTICLE_LINE_WIDTH;
		streamCtx.fillStyle = fadeFillStyle;

		function draw() {
			function fade(){
            	var prev = streamCtx.globalCompositeOperation;
            	streamCtx.globalCompositeOperation = "destination-in";
            	streamCtx.fillRect(bound.x[0], bound.y[0], bound.width, bound.height);
            	streamCtx.globalCompositeOperation = prev;
			}

			fade();
			buckets.forEach(function(bucket, i) {
				if ( bucket.length > 0 ){
					streamCtx.beginPath();
					streamCtx.strokeStyle = color[i];
					bucket.forEach(function(particle) {
						streamCtx.moveTo(particle.x, particle.y);
						streamCtx.lineTo(particle.xt, particle.yt);
						particle.x = particle.xt;
						particle.y = particle.yt;
					});
					streamCtx.stroke();
				}
			});
		}

		maskCtx.putImageData(mask.imageData, 0, 0);
		(function frame() {
			try {
				evolve();
				draw();
				timer = setTimeout(frame, FRAME_RATE);

			} catch(e) {
				console.log(e);
			}
		})();
	}

	return {
		setField: setField, 
		animate: animate
	};
}


/**
 *	GribWind - wind data.grib2
 *
 */
function GribWind(data) {
	var u_data = data.wind_u;
	var v_data = data.wind_v;
	var h = data.header;

	var nlng = h.nx;  // number of grids
	var nlat = h.ny;
	var p0 = [h.la1, h.lo1];      // grid start point [lat, lng]
	var p1 = [h.la2, h.lo2];      // grid end point
	var dlng = h.dx;
	var dlat = h.dy;

	function v(x, y){
		var n = nlng * y + x;
		return [ u_data[n], v_data[n] ];
	}

	function isDefined(latlng) {
		var lat = latlng[0], lng = latlng[1];
		return (p0[0] >= lat && lat >= p1[0] )
			&& (p0[1] <= lng && lng <= p1[1] );
	}

	function getGridVector(latlng) {
		var lat = latlng[0], lng = latlng[1];
		if ( isDefined(latlng) ){
			var x = Math.floor((lng - (p0[1] - dlng/2)) / dlng);
			var y = Math.floor(((p0[0] + dlat/2) - lat) / dlat);
			return v(x, y);

		}else{
			return [ null, null ];
		}
	}

	function getVector(latlng) {
		var lat = latlng[0], lng = latlng[1];
		if ( isDefined(latlng) ){
			var x = Math.floor((lng - p0[1]) / dlng);
			var y = Math.floor((p0[0] - lat) / dlat);
			var dx = (lng - (p0[1] + dlng * x)) / dlng;
			var dy = ((p0[0] - dlat * y) - lat) / dlat;
			return bilinearInterpolateVector(dx, dy, v(x, y), v(x+1, y), v(x, y+1), v(x+1, y+1));

		}else{
			return [ null, null ];
		}
	}

	function bilinearInterpolateVector(x, y, p00, p10, p01, p11) {
		var rx = (1 - x);
		var ry = (1 - y);
		var a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
		var u = p00[0] * a + p10[0] * b + p01[0] * c + p11[0] * d;
		var v = p00[1] * a + p10[1] * b + p01[1] * c + p11[1] * d;
		return [ u, v ];
	}

	return {
		getGridVector: getGridVector,
		getVector: getVector
	};
}


function SimpleProjection(p0, p1){
	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;
	var dlat = p1.lat - p0.lat;
	var dlng = p1.lng - p0.lng;

	function project(latlng) {
		var x = dx/dlng * (latlng[1] - p0.lng) + p0.x;
		var y = dy/dlat * (p0.lat - latlng[0]) + p0.y;
		return [x, y];
	}

	function unproject(x, y) {
		var lat = dlat/dy * (y - p0.y) + p0.lat;
		var lng = dlng/dx * (x - p0.x) + p0.lng;
		return [lat, lng];
	}

	return {
		project: project,
		unproject: unproject
	};
}
