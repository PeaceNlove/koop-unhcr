var request = require('request');
var pg = require('pg');
var config = require('./config.js');
var Unhcr = function( koop ){

  var unhcr = {};
  unhcr.__proto__ = koop.BaseModel( koop );
  unhcr.client = new pg.Client(config.unhcrdb);
  unhcr.client.connect(function(err) {
    if(err) {
      console.error('could not connect to postgres', err);
    }
  });
  // adds a service to the Cache.db
  // needs a host, generates an id 
  unhcr.register = function (id, host, callback) {
    var type = 'unhcr';
    koop.Cache.db.serviceCount( type, function (error, count) {
      id = id || count++;
      koop.Cache.db.serviceRegister( type, {'id': id, 'host': host},  function (err, success) {
        callback( err, id );
      });
    });
  };
  // get service by id, no id == return all
  unhcr.find = function( id, options,callback ){
	  var isNumber = /^\d+$/;
	  var options = options;
    koop.Cache.db.serviceGet( 'unhcr', parseInt(id) || id, function(err, res){
		
      if (err){
        callback('No service table found for that id. Try POSTing {"id":"arcgis", "host":"http://www.arcgis.com"} to /jsonurl', null);
      } else {
		  var url = res.host;
			var query = 'SELECT *, ST_AsGeoJson(ST_Transform(geom,4326)) as geometry from "country_points"';   
			unhcr.client.query(query, function(err, result) {			
			  if(err) {
				callback( err, null);
			  } else {
				    request.get(url, function(e, res){
						debugger;
					var text = res.body
					var lines = text.split("\n");
					var parsedData = [];
					var geojson = {type: 'FeatureCollection', features: []};
					for (var i = 4; i< lines.length; i++){						
						var line  = unhcr.parseline(lines[i]);
						var dest = line[0];
						var origin  = line[1];
						var month = line[3];
						var year = line[2];
						var amount = isNumber.test(line[4])? parseInt(line[4]):-1;
						var originPoint = null;
						var destPoint = null;
						result.rows.forEach(function(row){
							if (row.country===origin){
								originPoint = JSON.parse(row.geometry);
							}
							if (row.country===dest){
								destPoint = JSON.parse(row.geometry);
							}
						});
						if(originPoint!==null &&destPoint!==null){						
							var feature = {
								"type": "Feature",
								"geometry": { 
									"type": "LineString",
									"coordinates": [ [destPoint.coordinates[0], destPoint.coordinates[1]], [originPoint.coordinates[0], originPoint.coordinates[1] ]]
								},
								"properties": {
									"CountryOfAsylum": dest,
									"Origin": origin,
									"Year": year,
									"Month": month,								
									"Amount":amount
								}
							};
							geojson.features.push(feature);
						}
					}					
					callback( null, [geojson] );
					
				  });
			  }
		  });
        
      }
    });
  };
  unhcr.parseline = function(line){
	var lineArray  = line.split(',');
	while (lineArray.length>5){
		for (var j = 0; j< lineArray.length; j++){
			if (lineArray[j].indexOf('"') ===0&&lineArray[j].lastIndexOf('"')!==lineArray[j].length-1 ){				
				lineArray[j] = lineArray[j] +","+lineArray[j+1];
				lineArray[j] = lineArray[j].replace('"',"");
				lineArray.splice(j+1,1 );				
			}
		}
	}
	return lineArray;
	};
  

  
  
  return unhcr;

};

module.exports = Unhcr;
