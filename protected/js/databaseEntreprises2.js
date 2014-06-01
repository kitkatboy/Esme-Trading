var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("../protected/databaseEntreprises.db");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var fs = require('./readwrite.js');
var server = {};

exports.create = function () {
	db.run("CREATE TABLE databaseEntreprises (id TEXT, name TEXT, value TEXT, day TEXT, date TEXT)");
	console.log("database creer");
};
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
exports.insert = function (obj) {
var new_date = new Date();
	db.serialize( function () {
		var stmt = db.prepare("INSERT INTO databaseEntreprises VALUES (?,?,?,?,?)");
		stmt.run(obj.id, obj.nom, obj.valeur, obj.jour, new_date.valueOf());
		stmt.finalize();
		console.log("Enregistrement dans la base de donee");
	});
};
//------------------------------------------------------------------------------------------------------------------
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
	
	if (nom.indexOf("'") >= 0) {
		nom = nom.replace("'", "''");
	} else {
		nom = nom;
	}
//------------------------------------------------------------------------------------------------------------------	

    var stmt = "SELECT day FROM databaseEntreprises WHERE name ="+"'"+nom+"'";
    readwrite.each(db,stmt, function (e, r) {
		for(i in r){
			a.push(+r[i].day);
		}
		dernier_jour = Math.max.apply(null, a);
	//	console.log("dernier jour "+dernier_jour);
	
//------------------------------------------------------------------------------------------------------------------	
		var smtt = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
		readwrite.each(db,smtt, function (e, r) {
			
			for(i in r){
				b.push(+r[i].id);
			}
			output.premier_id_jour = Math.min.apply(null, b);
			output.dernier_id_jour = Math.max.apply(null, b);
//------------------------------------------------------------------------------------------------------------------	
			var avant_dernier_jour = dernier_jour - 1;
			var sttm = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+avant_dernier_jour+"'"+" AND name ="+"'"+nom+"'";
			readwrite.each(db,sttm, function (e, r) {
				for(i in r){
					c.push(+r[i].id);
				}
				output.dernier_id_semaine = Math.max.apply(null, c);
//------------------------------------------------------------------------------------------------------------------	
				var avant_dernier_jours = dernier_jour - 5;
				var sttm = "SELECT id FROM databaseEntreprises WHERE day ="+"'"+avant_dernier_jours+"'"+" AND name ="+"'"+nom+"'";
				readwrite.each(db,sttm, function (e, r) {
					for(i in r){
						c.push(+r[i].id);
					}
					output.premier_id_semaine = Math.min.apply(null, c);		
//------------------------------------------------------------------------------------------------------------------
					var avant_dernier_jour = dernier_jour - 1;
					var tsmt = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+output.dernier_id_semaine+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+avant_dernier_jour+"'";
					readwrite.each(db,tsmt, function (e, r) {
						for(i in r){
							output.derniere_valeure_semaine = r[i].value;
						}
				
//------------------------------------------------------------------------------------------------------------------
						var avant_dernier_jours = dernier_jour - 5;
						var stmtr = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+output.premier_id_semaine+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+avant_dernier_jours+"'";
						readwrite.each(db,stmtr, function (e, r) {
						for(i in r)
							output.premiere_valeure_semaine = r[i].value;
						}
				
//------------------------------------------------------------------------------------------------------------------	
							var tsmt = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+dernier_id_jour+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+dernier_jour+"'";
							readwrite.each(db,tsmt, function (e, r) {
							for(i in r){
								output.derniere_valeure_jour = r[i].value;
							}

//------------------------------------------------------------------------------------------------------------------	
								var dernier_jour_semaine = dernier_jour - 1;
								var premier_jour_semaine = dernier_jour - 5;
								var stmtr = "SELECT value FROM databaseEntreprises WHERE id ="+"'"+premier_id_jour+"'"+" AND name ="+"'"+nom+"'"+" AND day ="+"'"+dernier_jour+"'";
								readwrite.each(db,stmtr, function (e, r) {
								for(i in r){
									output.premiere_valeure_jour = r[i].value;
								}

//------------------------------------------------------------------------------------------------------------------	
									var stmtr = "SELECT value FROM databaseEntreprises WHERE day BETWEEN"+"'"+premier_jour_semaine+"'"+" AND "+"'"+dernier_jour_semaine+"'"+" AND name ="+"'"+nom+"'";
									readwrite.each(db,stmtr, function (e, r) {
									for(i in r){
										nbr++;
									}
									 
									
										output.nbr_valeure_semaine = nbr;
//------------------------------------------------------------------------------------------------------------------	
										var stmtr = "SELECT value FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
										readwrite.each(db,stmtr, function (e, r) {
										for(i in r){
											cpt++;
										}
										 
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
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
exports.readWeek = function (obj, fonction, nom, data, vecteur_semaine, vecteur_jour, num_entreprise) { 

	var jour = new Array();
	var semaine = new Array();
	var a = new Array;
	var vecteur = {};
	var stmt = "SELECT day FROM databaseEntreprises WHERE name ="+"'"+nom+"'";
    readwrite.each(db,stmt, function (e, r) {
	for(i in r){
		a.push(+r[i].day);
	}
		var dernier_jour = Math.max.apply(null, a);
		var dernier_jour_semaine = dernier_jour - 1;
		var premier_jour_semaine = dernier_jour - 5;
//---------------------------------------------------------------------------------------------------------
		var sttm = "SELECT value FROM databaseEntreprises WHERE day BETWEEN"+"'"+premier_jour_semaine+"'"+"AND"+"'"+dernier_jour_semaine+"'"+"AND name ="+"'"+nom+"'";
		readwrite.each(db,sttm, function (e, r) {
		for(i in r){
			semaine.push(r[i].value);		
		}				
//---------------------------------------------------------------------------------------------------------	
			var tsmt = "SELECT value FROM databaseEntreprises WHERE day ="+"'"+dernier_jour+"'"+" AND name ="+"'"+nom+"'";
			readwrite.each(db,tsmt, function (e, r) {
			for(i in r){
				jour.push(r[i].value);		
			}
				vecteur.semaine = semaine;
				vecteur.jour = jour;
				//console.log(vecteur);
				obj[fonction](vecteur, data, vecteur_semaine, vecteur_jour, num_entreprise);
			});	
		});
	});
	
}; 
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------	
exports.readAll = function (that, fonc, nom) {
	var output =[];
	var outputs ={};
	var c = new Array();
	var nbr = 0;
	var day = 0;
	var j = 0;
	var k = 0;
	var day = 0;
	var maxDay =0;
	
	readbase.readFile('../protected/entreprises_cac40.json', 'utf-8', function (err, data) {
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
	
		if (nom.indexOf("'") >= 0) {
			nom = nom.replace("'", "''");
		}
	//-----------------------------------------------------------------------------------------
		db.get("SELECT MAX(day), day, value FROM databaseEntreprises WHERE name = "+"'"+nom+"'", function (e, r){
			res = new Array();
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				maxDay = r.day;
				var lastDay = maxDay -1;
				db.get("SELECT MAX(date), value FROM databaseEntreprises WHERE day ="+"'"+lastDay+"'"+"AND name = "+"'"+nom+"'", function (e, r){
					res = new Array();
					if (e) {
						util.log("ERROR : " + e);
					} else if (r) {
						var cloture = parseFloat(r.value);
						outputs.cloture = cloture;	
					}
				});
			}
			
	//-----------------------------------------------------------------------------------------	
	db.get("SELECT MAX(date), value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"AND day = "+"'"+maxDay+"'", function (e, r){
		res = new Array();
		if (e) {
			util.log("ERROR : " + e);
		} else if (r) {
			var coursActuel = parseFloat(r.value);
			outputs.coursActuel = coursActuel;	
		}
		
	//-----------------------------------------------------------------------------------------	
		db.get("SELECT MIN(date), value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"AND day = "+"'"+maxDay+"'", function (e, r){
			res = new Array();
			if (e) {
				util.log("ERROR : " + e);
			} else if (r) {
				var ouverture = parseFloat(r.value);
				// console.log(ouverture);
				outputs.ouverture = ouverture;
			}
		
	//-----------------------------------------------------------------------------------------	
			db.get("SELECT MAX(value), value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"AND day = "+"'"+maxDay+"'", function (e, r){
				res = new Array();
				if (e) {
					util.log("ERROR : " + e);
				} else if (r) {
					var plusHaut = parseFloat(r.value);
					// console.log(plusHaut+ "  plusHaut");
					outputs.plusHaut = plusHaut;
				}	
	//-----------------------------------------------------------------------------------------	
				db.get("SELECT MIN(value), value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"AND day = "+"'"+maxDay+"'", function (e, r){
					res = new Array();
					if (e) {
						util.log("ERROR : " + e);
					} else if (r) {
						var plusBas = parseFloat(r.value);
						// console.log(plusBas+ "  plusbas");
						outputs.plusBas = plusBas;
					}
			
					outputs.variation = (((+outputs.coursActuel)*100)/(+outputs.cloture))-100;
	//-----------------------------------------------------------------------------------------		
					stmt = "SELECT date, value FROM databaseEntreprises WHERE name = "+"'"+nom+"'"+"ORDER BY date";
					db.each(stmt, function (e, r) {
						if (e) {
							util.log("ERROR : " + e);
						} else if (r) {
							c.push(parseFloat(r.date));
							c.push(parseFloat(r.value));
							nbr++;
					}}, function () {
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
						 outputs.output = output;
						  // console.log(outputs);
						 that[fonc](outputs);
							});
						});
					});	
				});
			});
		});
	});
};

exports.readStock = function () {
	var name = "";
	var name2 = "";
	var symb = "";
	// var json = {};
	var tmp = [];
	var tmp2 = [];
	var cpt = 0;
	// var cpt2 = 0;
	
	db.each("SELECT DISTINCT name FROM databaseEntreprises", function (e, r){
		if (e) {
			util.log("ERROR1 : " + e);
		} else if (r) {
			// cpt2++;
			// On remplace s'il y a une apostrophe dans le nom pr assurer la requête SQL
			if (r.name.indexOf("'") >= 0) {
				name = r.name.replace("'", "''");
			} else {
				name = r.name;
			}
			// --------------------------------------------- Pr entreprises_cac40.js --------------------------------------
			// name2 = r.name.split("(");
			// symb = name2[1].substring(0, name2[1].length - 1);
			// name2 = name2[0].substring(0, name2[0].length - 1);
			
			// tmp.push({name: name2, symbole: symb, nom: r.name});
			// -------------------------------------------------------------------------------------------------------------- 
			db.get("SELECT value FROM databaseEntreprises WHERE name = '"+name+"' ORDER BY date DESC", function (e, d) {
				if (e) {
					util.log("ERROR2 - " + e);
				} else if (d) {
					cpt++;
					name2 = r.name.split("(");
					name2 = name2[0].substring(0, name2[0].length - 1);
					
					tmp2.push({name: name2, value: d.value});
					
					if (cpt == tmp.length) {
						// console.log(cpt)
						// console.log(tmp2);
						
						// TO DO fichier stock.json
						fs.writeFile("../protected/stock.json", JSON.stringify(tmp2), "UTF-8",function (e){
							if (e) {
								util.log("ERROR - Ecriture " + _this.nom_json + " : " + e);
							}
						});
						
					}
				}
			});
		}
	});
};