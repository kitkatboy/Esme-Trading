var sqlite3 = require("sqlite3").verbose();
// var exdb = new sqlite3.Database("../protected/databaseChiffres.db");
var db = "../protected/databaseChiffre.db";
var util = require("util");
var EventEmitter = require('events').EventEmitter;
exports.event = new EventEmitter();
var readwrite = require('./readwrite.js');


exports.create = function () {
	db.run("CREATE TABLE databaseChiffre(id TEXT, day TEXT, value TEXT, date TEXT)");
	console.log("databaseChiffre creer");
};
//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
exports.insert = function (obj) {
var new_date = new Date();
	readwrite.dbwrite4(db,"INSERT INTO databaseChiffre VALUES (?,?,?,?)",obj.id, obj.day, obj.valeur, new_date.valueOf(),function(){});
	// db.serialize( function () {
		// var stmt = db.prepare("INSERT INTO databaseChiffre VALUES (?,?,?,?)");
		// stmt.run(obj.id, obj.day, obj.value, obj.date); // todo effacher cette ligne tmp une fois la nouvelle database transposé
		// stmt.run(obj.id, obj.day, obj.valeur, new_date.valueOf());
		// stmt.finalize();
		console.log("---Enregistrement de la valeur---");
	// });
};
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
exports.readAll = function (that, fonc) {
	var b = "";
	var outputs ={};
	var output =[];
	var c = new Array();
	var nbr = 0;
	var day = 0;
	var j = 0;
	var k = 0;
	var day = 0;
	var maxDay = 0;
	//-----------------------------------------------------------------------------------------
	readwrite.get(db,"SELECT MAX(day),day FROM databaseChiffre", function (e, r){
		res = new Array();
		if (e) {
			util.log("ERROR : " + e);
		} else if (r) {
			var maxDay = r.day;
			// console.log("-------------------------"+maxDay);		
		}		
		var lastDay = maxDay -1;
		readwrite.get(db,"SELECT MAX(date), value FROM databaseChiffre WHERE day ="+"'"+lastDay+"'", function (e, r){
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var cloture = parseFloat(r.value);
				outputs.cloture = cloture;	
			}
					
			
	//-----------------------------------------------------------------------------------------	
			readwrite.get(db,"SELECT MAX(date), value FROM databaseChiffre", function (e, r){
				if (e) {
					util.log("ERROR : " + e);
				} else if (r) {
					var coursActuel = parseFloat(r.value);
					// console.log("-----"+parseFloat(r.value));
					outputs.coursActuel = coursActuel;	
				}
				
	//-----------------------------------------------------------------------------------------	
				readwrite.get(db,"SELECT MIN(date), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
					if (e) {
						util.log("ERROR : " + e);
					} else if (r) {
						var ouverture = parseFloat(r.value);
						// console.log(ouverture);
						outputs.ouverture = ouverture;
					}
		
	//-----------------------------------------------------------------------------------------	
					readwrite.get(db,"SELECT MAX(value), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
						if (e) {
							util.log("ERROR : " + e);
						} else if (r) {
							var plusHaut = parseFloat(r.value);
							// console.log(plusHaut+ "  plusHaut");
							outputs.plusHaut = plusHaut;
						}	
	//-----------------------------------------------------------------------------------------	
						readwrite.get(db,"SELECT MIN(value), value FROM databaseChiffre WHERE day ="+"'"+maxDay+"'", function (e, r){
							res = new Array();
							if (e) {
								util.log("ERROR : " + e);
							} else if (r) {
								var plusBas = parseFloat(r.value);
								outputs.plusBas = plusBas;
							}
								
							outputs.variation = (((+outputs.coursActuel)*100)/(+outputs.cloture))-100;
						
	//-----------------------------------------------------------------------------------------
							stmt = "SELECT date, value FROM databaseChiffre ORDER BY date";
							readwrite.each(db,stmt, function (e, r) {
								if (e) {
									util.log("ERROR : " + e);
								} else if (r) {
								// util.log(util.inspect(r));
									for(k in r){
										c.push(parseFloat(r[k].date));
										c.push(parseFloat(r[k].value));
									}
									
									nbr = r.length;
								var b ="";
								for(var i=0; i < 2*nbr; i++) 
								{
									b+= "["+c[i]+",  "+c[i+1]+"], "; //todo enlever le new date 
									j++;
									if((c[i+2]- c[i]) > 10*60*60*1000){ //TODO 
										b = b.substring(0,  b.length-2);	
										output[day]= "["+b+"]";
										day++;
										var b ="";		
									}
									i++;
								}
								b = b.substring(0,  b.length-2);
								output[day]="["+b+"]";
								outputs.output = output;
								// console.log(outputs);
								
								that[fonc](outputs);
								}
							});	
						});
					});
				});
			});
		});
	});
};
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------
exports.getName=function(that, fonc){
	var output = "";
	readwrite.readFile('../protected/entreprises_cac40.json', 'utf-8', function(err, data) {
		if(err) {
			util.log(err);
		} else if (data) {
			data = JSON.parse(data);
			that[fonc](data);
		} else {
			that[fonc]("no result");	
		}	
		
	});
};
