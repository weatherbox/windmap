/**
 * Wind Data API 
 *  Author Yuta Tachibana  
 *
 *  @return: jsonp
 *  @params:
 *      bounds: p1.lat, p1.lng, p2.lat, p2.lng  (required)  p1:NW p2:SE corner
 *      forecastTime: 0 - 39 (default:0)
 *      zoom: 5 - 13 (default:9)
 */


var express = require('express');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

var app = express();
app.set('port', (process.env.PORT || 5000));

// for debug
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.use(function(err, req, res, next) {
	console.log(err);
	res.jsonp(500, {error: err});
});


// MSM header Constants -------------------------------------------------------
var nx = 481;
var ny = 505;
var lo1 = 120;
var la1 = 47.599998474121094;
var dx = 0.0625;
var dy = 0.05000000074505806;


// root -----------------------------------------------------------------------
app.get('/', function(req, res) {
	res.render("index");
});


// API ------------------------------------------------------------------------
app.get('/wind', function(req, res) {
	// check param
	var bounds_query = req.query.bounds; 
	var forecastTime = req.query.forecastTime;
	var zoom         = req.query.zoom;
	
	var bounds = bounds_query.split(",").map(function(d){
		return parseFloat(d);
	});

	forecastTime = ( forecastTime == null ) ? 0 : parseInt(forecastTime);
	if ( forecastTime < 0 || forecastTime > 15 ){
		res.jsonp(500, { error: "No Data" });
	}

	zoom = ( zoom == null ) ? 9 : parseInt(zoom);


	// get data form MongoDB
	MongoClient.connect(process.env.MONGO_URI, function(err, db){
		if (err) res.jsonp(500, { error: "db error:" + err });
		var col_u = db.collection("surface_wind_u");
		var col_v = db.collection("surface_wind_v");

		// grid point
		var xy1 = {
			x: range(Math.floor((bounds[1]-lo1) / dx), 0, nx-1),
			y: range(Math.floor((la1-bounds[0]) / dy), 0, ny-1)
		};
		var xy2 = {
			x: range(Math.ceil((bounds[3]-lo1) / dx), 0, nx-1),
			y: range(Math.ceil((la1-bounds[2]) / dy), 0, ny-1)
		};


		// get Grid Point Value in bounds
		if (zoom >= 9){

			extractData(col_u, 0, xy1, xy2, function(wind_u){
				extractData(col_v, 0, xy1, xy2, function(wind_v){
					res.jsonp({
						header: {
							la1: la1 - dy * xy1.y,
							lo1: lo1 + dx * xy1.x,
							la2: la1 - dy * xy2.y,
							lo2: lo1 + dx * xy2.x,
							dx: dx,
							dy: dy,
							nx: xy2.x - xy1.x + 1,
							ny: xy2.y - xy1.y + 1
						},
						wind_u: wind_u,
						wind_v: wind_v
					});
				});
			});
			
		// get Grid Point Value in bounds (thinout)	
		}else{
			if (zoom<5) zoom = 5;
			var thinout = Math.pow(2, 9-zoom);
			var t_nx = Math.ceil( (xy2.x-xy1.x) / thinout );
			var t_ny = Math.ceil( (xy2.y-xy1.y) / thinout );
				
			if ( xy1.x + thinout * t_nx >= nx ) t_nx--;
			if ( xy1.y + thinout * t_ny >= ny ) t_ny--;
			var xy3 = {
				x: xy1.x + thinout * t_nx,
				y: xy1.y + thinout * t_ny
			};


			extractDataThinout(col_u, 0, xy1, xy3, thinout, function(wind_u){
				extractDataThinout(col_v, 0, xy1, xy3, thinout, function(wind_v){
					res.jsonp({
						header: {
							la1: la1 - dy * xy1.y,
							lo1: lo1 + dx * xy1.x,
							la2: la1 - dy * xy3.y,
							lo2: lo1 + dx * xy3.x,
							dx: dx * thinout,
							dy: dy * thinout,
							nx: t_nx + 1,
							ny: t_ny + 1
						},
						wind_u: wind_u,
						wind_v: wind_v
					});
				});
			});
		}
	});
});




function extractData(col, forecastTime, p1, p2, callback) {
	var data = [];
	var push = Array.prototype.push;

	col.find({
		t: forecastTime,
		r: { $gte: p1.y, $lte: p2.y }
	}).toArray(function(err, doc) {
		_.each(doc, function(row){
			push.apply(data, row.d.slice(p1.x-1, p2.x));
		});
		callback(data);
	});
}


function extractDataThinout(col, forecastTime, p1, p2, thinout, callback) {
	var data = [];
	var remainder_y = p1.y % thinout;

	col.find({
		t: forecastTime,
		r: { $gte: p1.y, $lte: p2.y, $mod: [thinout, remainder_y] }
	}).toArray(function(err, doc) {
		_.each(doc, function(row){
			for (var x = p1.x-1; x < p2.x; x += thinout ){
				data.push(row.d[x]);
			}
		});
		callback(data);
	});
}

// utility function -----------------------------------------------------------
function range(t, min, max) {
	if ( t < min ){
		return min;
	}else if ( t > max ){
		return max;
	}else{
		return t;
	}
}




// start app ------------------------------------------------------------------
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

