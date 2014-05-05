var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/databaseEntreprises.db");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var fs = require('fs');
var server = {};
server.path = "./";

exports.create = function () {
	db.run("CREATE TABLE databaseEntreprises (id TEXT, name TEXT, value TEXT, day TEXT, date TEXT)");
	console.log("database creer");
};

exports.insert = function (obj) {
var new_date = new Date();
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO databaseEntreprises VALUES (?,?,?,?,?)");
		stmt.run(obj.id, obj.nom, obj.valeur, obj.jour, new_date.valueOf());
		stmt.finalize();
		console.log("Enregistrement dans la base de donee");
	});
};

//----------------------------------------------------------------------------------------------------------------
exports.readAlgo = function (nom, objet, fonction, num_entreprise) {
	var a = new Array();
	var b = new Array();
	var c = new Array();
	var res = new Array();
	var output = {};
	var nbr = 0;
	var cpt = 0;
	var dernier_jour = 0;
	var premier_id_semaine = 0;
	var premier_id_jour = 0;
	var dernier_id_semaine = 0;
	var dernier_id_jour = 0;
	var avant_dernier_jours = 0;
//------------------------------------------------------------------------------------------------------------------	
    var stmt = "SELECT day FROM databaseEntreprises WHERE name ="+"'"+nom+"'";
    db.each(stmt, function (e, r) {
	a.push(+r.day);
	}, function () {
		dernier_jour = Math.max.apply(null, a);
	//	console.log("dernier jour "+dernier_jour);
	
//------------------------------------------------------------------------------------------------------------------	
	var smtt = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
    db.each(smtt, function (e, r) {
	b.push(+r.id);
	}, function () {
		output.premier_id_jour = Math.min.apply(null, b);
		output.dernier_id_jour = Math.max.apply(null, b);
//------------------------------------------------------------------------------------------------------------------	
	var avant_dernier_jour = dernier_jour - 1;
	var sttm = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+avant_dernier_jour+"'"+" AND name ="+"'"+nom+"'";
    db.each(sttm, function (e, r) {
	c.push(+r.id);
	}, function () {
		output.dernier_id_semaine = Math.max.apply(null, c);
//------------------------------------------------------------------------------------------------------------------	
	var avant_dernier_jours = dernier_jour - 5;
	var sttm = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+avant_dernier_jours+"'"+" AND name ="+"'"+nom+"'";
    db.each(sttm, function (e, r) {
	c.push(+r.id);
	}, function () {
		output.premier_id_semaine = Math.min.apply(null, c);		
//------------------------------------------------------------------------------------------------------------------
	var avant_dernier_jour = dernier_jour - 1;
	var tsmt = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+output.dernier_id_semaine+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+avant_dernier_jour+"'";
    db.each(tsmt, function (e, r) {
	output.derniere_valeure_semaine = r.value;
	}, function () {
	
//------------------------------------------------------------------------------------------------------------------
	var avant_dernier_jours = dernier_jour - 5;
	var stmtr = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+output.premier_id_semaine+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+avant_dernier_jours+"'";
    db.each(stmtr, function (e, r) {
	output.premiere_valeure_semaine = r.value;
	}, function () {
	
//------------------------------------------------------------------------------------------------------------------	
	var tsmt = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+dernier_id_jour+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+dernier_jour+"'";
    db.each(tsmt, function (e, r) {
	output.derniere_valeure_jour = r.value;
	}, function () {

//------------------------------------------------------------------------------------------------------------------	
	var dernier_jour_semaine = dernier_jour - 1;
	var premier_jour_semaine = dernier_jour - 5;
	var stmtr = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+premier_id_jour+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+dernier_jour+"'";
    db.each(stmtr, function (e, r) {
	output.premiere_valeure_jour = r.value;
	}, function () {

//------------------------------------------------------------------------------------------------------------------	
	var stmtr = "SELECT value FROM databaseEntreprises WHERE day BETWEEN"+"'"+premier_jour_semaine+"'"+" AND "+"'"+dernier_jour_semaine+"'"+" AND name ="+"'"+nom+"'";
    db.each(stmtr, function (e, r) {
	 nbr++;
	}, function () {
	output.nbr_valeure_semaine = nbr;
//------------------------------------------------------------------------------------------------------------------	
	var stmtr = "SELECT value FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
    db.each(stmtr, function (e, r) {
	 cpt++;
	}, function () {
	output.nbr_valeure_jour = cpt;
	output.nom=nom;
	//console.log(output);
	objet[fonction](output, num_entreprise); //TODO 
	});
	});
	});
	});
	});
	});
	});
	});
	});
	});
};
//------------------------------------------------------------------------------------------------------------------------
exports.readWeek = function (obj, fonction, nom, data, vecteur_semaine, vecteur_jour, num_entreprise) { 

	var jour = new Array();
	var semaine = new Array();
	var a = new Array;
	var vecteur = {};
	var stmt = "SELECT day FROM databaseEntreprises WHERE name ="+"'"+nom+"'";
    db.each(stmt, function (e, r) {
	a.push(+r.day);
	}, function () {
		var dernier_jour = Math.max.apply(null, a);
		var dernier_jour_semaine = dernier_jour - 1;
		var premier_jour_semaine = dernier_jour - 5;
//---------------------------------------------------------------------------------------------------------
		var sttm = "SELECT value FROM databaseEntreprises WHERE day BETWEEN"+"'"+premier_jour_semaine+"'"+"AND"+"'"+dernier_jour_semaine+"'"+"AND name ="+"'"+nom+"'";
		db.each(sttm, function (e, r) {
			semaine.push(r.value);		
		}, function () {				
//---------------------------------------------------------------------------------------------------------	
		var tsmt = "SELECT value FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
		db.each(tsmt, function (e, r) {
			jour.push(r.value);		
		}, function () {
	vecteur.semaine = semaine;
	vecteur.jour = jour;
	//console.log(vecteur);
	obj[fonction](vecteur, data, vecteur_semaine, vecteur_jour, num_entreprise);
	});	
	});
	});
	
}; 

//------------------------------------------------------------------------------------------------------------------	
exports.readAll = function (that, fonc, nom) {
	
	var output =[];
	var c = new Array();
	var nbr = 0;
	var day = 0;
	var j = 0;
	var k = 0;
	var day = 0;
	fs.readFile('../protected/entreprises_cac40.json', 'utf-8', function (err, data) {
			if(err) {
				console.log(err);
			} else if (data) {
			data = JSON.parse(data);
				 for(i=0; i<data.nom.length; i++) {
					 if(data.nom[i].name == nom){
						 nom = data.nom[i].nom;
					}
				} 
			}
	stmt = "SELECT date, value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"ORDER BY date";
	
    db.each(stmt, function (e, r) {
		if (e) {
			util.log("ERROR : " + e);
		} else if (r) {
			c.push(parseFloat(r.date));
			c.push(parseFloat(r.value));
			nbr++;
		}}, 
		function () {
		var b = "";
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
		});
	 });
};
//--------------------------------------------------------------------------------------------
/*
exports.stock = function (user, stocks, objet, fonction, nbr) {
	b = "";
	var c = 0;
	var save = "";
	
	fs.readFile(server.path+'entreprises_cac40.js', 'utf-8', function (err, data) {
			if(err) {
				console.log(err);
			} else if (data) {
			data = JSON.parse(data);
			for (i=0; i<stocks.length; i++){
				 for(j=0; j<data.nom.length; j++) {
					 if(data.nom[j].name == stocks[i]){
						 nom = data.nom[i].nom; 
						console.log(nom);
						 
						 stmt = "SELECT MAX(date), value FROM databaseEntreprises WHERE name = "+"'"+nom+"'";
						db.each(stmt, function (e, r) {
						if (e) {
						util.log("ERROR : " + e);
						} else if (r) {
							c = parseFloat(r.value);
						}}, 
						function () {
						});	
						 	miseParScociete = c * nbr;
							val = c;
						}
					}
				}
			user.
				
			}
	});
};
*/
// exports.stock(null, ['Essilor International SA', 'Accor SA'], null, null);
//------------------------------------------------------------------------------------------------------------------
//exports.readWeek(null, null,'Essilor International SA (EI.PA)', null, null, null, null);
//exports.create();
//exports.insert({"id" : 2, "nom" : "ALTRAN", "valeur" : 54, "jour": 1});
// exports.readAll(null, null,'Essilor International SA');
//exports.readAlgo('Essilor International SA (EI.PA)', null, null, null);

/*	
	fs.readFile(server.path+'entreprises_cac40.js', 'utf-8', function (err, data) {
			if(err) {
				console.log(err);
			} else if (data) {
			data = JSON.parse(data);
				 for(i=0; i<data.nom.length; i++) {
					 if(data.nom[i].name == nom){
						 nom = data.nom[i].nom;
						 console.log(nom);
					}
				} 
			}
	});
*/	
