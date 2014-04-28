var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/database.db");
var util = require("util");
var event = require('events');
var ev = new event.EventEmitter();

create = function () {
	db.run("CREATE TABLE database (mail TEXT, id TEXT, mdp TEXT, log_temp TEXT, date TEXT)");
    db.close();
};

insert = function (obj, fonction) {
var new_date = new Date();
	console.log("Enregistrement du compte");
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO database VALUES (?,?,?,?,?)");
		stmt.run(obj.mail, obj.id, obj.mdp, "null", new_date.valueOf());
		stmt.finalize();
	});
	obj[fonction]("Votre compte est créé");
};

exports.verifMail = function (obj, fonction) {
	var stmt = "SELECT mail FROM database WHERE mail = \'" + obj.mail + "\'";
	db.get(stmt, function (e, r) {
		if(e) {
			console.log("ERROR");
		} else if(r) {
			console.log("Adresse mail deja enregistree");
			obj[fonction]("Cette adresse est déjà enregistrée");
		} else {
			console.log("Adresse mail disponible");
			ev.emit("GO_1", obj, fonction);
		}
	});
};

verifId = function (obj, fonction) {
	var stmt = "SELECT id FROM database WHERE id = \'" + obj.id + "\'";
	db.get(stmt, function (e, r) {
		if(e) {
			console.log("ERROR");
		} else if(r) {
			console.log("Identifiant deja utilise");
			obj[fonction]("Cette identifiant est déjà utilisé");
		} else {
			console.log("Identifiant disponible");
			ev.emit("GO_2", obj, fonction);
		}
	});
};

exports.verifLogin = function (obj, fonction) {
	var new_log_temp = /*obj.id.substring(0,3)+*/Math.floor(Math.random()*1000000000);
	var new_date = new Date();
	console.log("Variables : " + new_log_temp + " " + new_date);
	var stmt = "SELECT id FROM database WHERE id=\'" + obj.id + "\' AND mdp=\'" + obj.mdp + "\'";
	db.get(stmt, function (e, r) {
		if(e) {
			console.log("ERROR");
		} else if(r){
			console.log("Connexion etablie");
			var stmt2 = db.prepare("UPDATE database SET log_temp = \'"+new_log_temp+"\', date = "+new_date.valueOf()+" WHERE id = \'" + obj.id + "\'");
			stmt2.run();
			stmt2.finalize();
			obj[fonction]("Login ok", new_log_temp);
		} else {
			console.log("Identifiant ou mot de passe invalide");
			obj[fonction]("Ce compte n'existe pas");
		}
	});	
};

exports.checkDatabase = function (obj, function1, function2) {
	var log_temp = obj.req.headers.cookie;
	console.log("Identifiant temporaire : " + log_temp);	
	db.serialize(function () {
		var new_date = new Date();
		var stmt = "SELECT * FROM database WHERE log_temp = " + log_temp;
		db.get(stmt, function (e, r) {
			//console.log("-----------------------" + util.inspect(r));
			if (r) {
				if (((new_date.valueOf() - r.date)/(1000)) < 3*60) {
					util.log("Actualisation de la date du login temporaire");
					var stmt2 = db.prepare("UPDATE database SET date = "+new_date.valueOf()+" WHERE log_temp = " + log_temp);
					stmt2.run();
					stmt2.finalize();
					obj[function1]();
				} else {
					util.log("La date de l'identifiant temporaire n'est plus valide");
					obj[function2]();
				}
			} else {
				util.log("Identifiant temporaire inconnu");
				obj[function2]();
			}
		});
	});
};

exports.erase_log = function (obj, fonction) {
	var new_log = "NonConnecté";
	console.log("Effacement loggin temporaire dans la base de donnée");
	var stmt = db.prepare("UPDATE database SET log_temp = \'"+new_log+"\' WHERE log_temp = \'" +obj.log_temp+ "\'")
	stmt.run();
	stmt.finalize();
	obj[fonction]("Deconnexion");
};

read = function () {
    var stmt = "SELECT * FROM database";
    db.each(stmt, function (e, r) {
        console.log(util.inspect(r));
    });
    db.close();
};

/* Ecouteurs */
ev.on("GO_1", verifId);
ev.on("GO_2", insert);

//create();
//read();


