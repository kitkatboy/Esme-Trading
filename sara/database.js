var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database.db");
var util = require("util");
var event = require('events');
var ev = new event.EventEmitter();

exports.create = function () {
	db.run("CREATE TABLE database (value TEXT, date TEXT, id TEXT)");
};

exports.insert = function (obj) {
var new_date = new Date();
	console.log("Enregistrement de la valeur");
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO database VALUES (?,?,?)");
		stmt.run(obj.valeur, new_date.valueOf(), );
		util.log("DATA : " + data.i);
		stmt.finalize();
	});
};

exports.readAll = function () {
    var stmt = "SELECT * FROM database";
    db.each(stmt, function (e, r) {
		if (e) {
			util.log(e);
		} else if (r) {
			console.log(util.inspect(r));
		}
    });
};

exports.readWeek = function (/*that, fonc*/) { // renvoie les valeurs sur une semaine
a= new Date();
aujourdhui = a.valueOf();
semaine= aujourdhui-604800000;
aujourdhui = "'"+aujourdhui+"'";
semaine= "'"+semaine+"'";
//console.log("ajd " + aujourdhui);
//console.log("sem " +  semaine);
    var stmt = "SELECT id FROM database WHERE date BETWEEN"+ semaine +"AND"+ aujourdhui;
	var a = new Array();
    db.each(stmt, function (e, r) {
		if (e) {
			util.log(e);
		} else if (r) {
			//console.log(util.inspect(r));
			a.push(r.value);
		}
    }, function () {
	util.log("Reponse : " + a);
		//ev.emit("go", a, that, fonc);
	});
	
};
/*
ev.on("go", function(r, that, fonc)
{
	//console.log("====> " + JSON.stringify(r));
	that[fonc](JSON.stringify(r));
});
*/
//exports.create();
exports.insert({"valeur" : "45"});
//exports.readWeek();
//exports.readWeek();