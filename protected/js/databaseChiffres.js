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
	var a = new Array();
	var date = {};
	var jour = 0;
	var mois = 0;
	var annee = 0;
	var dd;
	var mm;
	var yyyy;
	var output = {};
    var stmt = "SELECT MAX(date) FROM databaseChiffres";
    db.each(stmt, function (e, r) {
		if (e) {
			util.log("ERROR : " + e);
		}else if (r) {
			jour = r['MAX(date)'];
			jour = parseInt(jour);
			jour = new Date(jour);
			mm = jour.getMonth();
			dd = jour.getDay();
			yyyy = jour.getFullYear();
			date.annee = yyyy;
			date.mois = mm;
			date.jour = dd;
			output.date=date;
		}
    });
	stmt = "SELECT value FROM databaseChiffres ";
    db.each(stmt, function (e, r) {
		if (e) {
			util.log("ERROR : " + e);
		} else if (r) {
			a.push(parseFloat(r.value));
		}}, 
		function () {
			output.valeurs=a;
			that[fonc](output);
		});
};


exports.getName=function(that, fonc){
	var output = "";
	fs.readFile('../protected/js/entreprises_cac40.js', 'utf-8', function (err, data) {
		if(err) {
			console.log(err);
		} else if (data) {
		data = JSON.parse(data);
			for(i=0; i<data.nom.length-1; i++) {
				output += '<a href="#"><small><font color="SteelBlue"><li style="line-height:15px;">'+data.nom[i].name+'</li></font></small></a><br/>';
			} 
		} else {
			that[fonc]("no result");	
		}	
		that[fonc](output);
	});
}
//exports.getName(null, null);
//exports.readAll(null, null);
/*exports.readWeek = function (that, fonc) { // renvoie les valeurs sur une semaine
a= new Date();
aujourdhui = a.valueOf();
semaine= aujourdhui-604800000;
aujourdhui = "'"+aujourdhui+"'";
semaine= "'"+semaine+"'";
console.log("ajd " + aujourdhui);
console.log("sem " +  semaine);
    var stmt = "SELECT value FROM databaseChiffres WHERE date BETWEEN"+ semaine +"AND"+ aujourdhui;
	var a = new Array();
    db.each(stmt, function (e, r) {
		//console.log(util.inspect(r));
		a.push(r.value);
		
    }, function () {
		//ev.emit("go", a, that, fonc);
		console.log(util.inspect(a));
	});
	
}; */

//exports.create();
//exports.insert({"valeur" : "46"});
//exports.readAll(null, null);
