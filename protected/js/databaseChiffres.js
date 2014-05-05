var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/databaseChiffres.db");
var util = require("util");
var event = require('events');
var ev = new event.EventEmitter();
var fs = require('fs');

exports.create = function () {
	db.run("CREATE TABLE databaseChiffres (value TEXT, date TEXT)");
	console.log("database creer");
};

exports.insert = function (obj) {
var new_date = new Date();
	console.log("Enregistrement de la valeur");
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO databaseChiffres VALUES (?,?)");
		stmt.run(obj.valeur, new_date.valueOf());
		stmt.finalize();
	});
};

exports.readAll = function (that, fonc) {
	var b = "";
	var output =[];
	var c = new Array();
	var nbr = 0;
	var day = 0;
	// var save = [];
	var j = 0;
	var k = 0;
	var day = 0;
	stmt = "SELECT date, value FROM databaseChiffres ORDER BY date";
    db.each(stmt, function (e, r) {
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				c.push(parseFloat(r.date) + 2*60*60*1000);
				c.push(parseFloat(r.value));
				nbr++;
			}
		}, 
		function () {
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
			// console.log(JSON.parse(output[0]));
			that[fonc](output);
		}
	);	
};


exports.getName=function(that, fonc){
	var output = "";
	fs.readFile('../protected/entreprises_cac40.json', 'utf-8', function (err, data) {
		if(err) {
			console.log(err);
		} else if (data) {
			data = JSON.parse(data); 
		} else {
			that[fonc]("no result");	
		}	
		that[fonc](data);
	});
};
//exports.getName(null, null);
//exports.readAll(null, null);

/*
exports.readWeek = function () { // renvoie les valeurs sur une semaine
    var stmt = "SELECT date FROM databaseChiffres" ;
	var a = new Array();
    db.each(stmt, function (e, r) {
		//console.log(util.inspect(r));
		a.push(parseFloat(r.date));
		
    }, function () {
		//ev.emit("go", a, that, fonc);
		console.log(new Date(a[0]));
		console.log(new Date(a[a.length - 1]));
	})
	
};*/
//exports.readWeek(); 
//exports.create();
//exports.insert({"valeur" : "46"});
//exports.readAll(null, null);
