var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database.db");
var util = require("util");
var event = require('events');
var ev = new event.EventEmitter();

exports.create = function () {
	db.run("CREATE TABLE database (value TEXT, date TEXT)");
};

exports.insert = function (obj) {
var new_date = new Date();
	console.log("Enregistrement de la valeur");
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO database VALUES (?,?)");
		stmt.run(obj.valeur, new_date.valueOf());
		stmt.finalize();
	});
	
};

exports.readAll = function () {
    var stmt = "SELECT * FROM database";
    db.each(stmt, function (e, r) {
        console.log(util.inspect(r));
    });
};

exports.readWeek = function (that, fonc) { // renvoie les valeurs sur une semaine
a= new Date();
aujourdhui = a.valueOf();
semaine= aujourdhui-604800000;
aujourdhui = "'"+aujourdhui+"'";
semaine= "'"+semaine+"'";
console.log(aujourdhui);
console.log(semaine);
    var stmt = "SELECT value FROM database WHERE date BETWEEN"+ semaine +"AND"+ aujourdhui;
    db.each(stmt, function (e, r) {
     console.log(util.inspect(r));
	 event.emit("go", r, that, fonc);
    });
};

event.on("go", function(r, that, fonc))
{
	that[fonc](JSON.stringify(r));
}

//create();
//exports.insert({"valeur" : "45"});
//exports.read();
//exports.readWeek();
