var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./databaseChiffres.db");
var util = require("util");
var event = require('events');
var ev = new event.EventEmitter();


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
	var jour = 0;
	var output = {};
    var stmt = "SELECT MAX(date) FROM databaseChiffres";
    db.each(stmt, function (e, r) {
	jour = r['MAX(date)'];
	jour = parseInt(jour);
	jour = new Date(jour);
	output.date=jour;
    });
	stmt = "SELECT value FROM databaseChiffres ";
    db.each(stmt, function (e, r) {
	a.push(r.value);
	}, function () {
		output.valeurs=a;
		console.log(util.inspect(output));
		that[fonc](output);
	});
};

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
