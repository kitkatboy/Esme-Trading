var util = require("util");
var fs = require("fs");

exports.traitement = function (id, obj) {
	var portefeuille = new constr_portefeuille(id, obj);
	
	portefeuille.recup_cotes_ents(); //Appel de la methode de traitement
    portefeuille = null; // Suppression de l'objet temporaire portefeuille
	
}

/* Constructeur portefeuille client*/
constr_portefeuille = function (id, obj) {
	// util.log("Appel du constructeur Portefeuille")
	if(id && obj) {
		this.resp = obj.resp;
		this.nom_json = "../protected/portefeuille\\"+id+".json";
		this.compte = {};
		this.output = {};
		this.act = obj.search;
		this.ent = obj.ent;
		this.quant = parseInt(obj.quant);
		
		// util.log(util.inspect(obj));
	} else {
		util.log("ERROR - L'\objet Portefeuille client n\'a pas pu etre construit.");
		return;
	}
};

constr_portefeuille.prototype = {

recup_cotes_ents:
	function () {
		var _this = this;
		var resultat = [];
		var cotation = {};
		
		fs.readFile('../protected/stock.json',"UTF-8", function(e,d){
			if(e) {
				util.log("ERROR - Lecture fichier stock.json " + e);
			} else if (d) {
				resultat = JSON.parse(d); // Chargement des cotations des entreprises dans une variable
				
				for (var i = 0; i < resultat.length; i++) {
					// util.log(resultat[i].name);
					// util.log(resultat[i].value);
					cotation[resultat[i].name] = parseFloat(resultat[i].value);
				}
				// util.log(util.inspect(cotation));
				_this.ecriture(cotation);
			}
		});
	},

ecriture:
	function (cotation) {
		var _this = this;
		var total = _this.quant * cotation[_this.ent];
		
		// util.log(util.inspect(cotation));
		
		fs.exists(this.nom_json, function (exist) {
			if (exist) {
				if (_this.act == "achat" || _this.act == "vente") {
					fs.readFile(_this.nom_json,"UTF-8", function(e,d){
						if(e) {
							util.log("ERROR - Lecture2 " + _this.nom_json + " : " + e);
						} else if (d) {
							_this.compte = JSON.parse(d); // Chargement du portefeuille dans une variable
							// util.log("Contenu : " + util.inspect(_this.compte));
							
							// Partie calculs
							if (_this.compte.entreprise[_this.ent]) {
								var quant_prec = parseFloat(_this.compte.entreprise[_this.ent][1]);
								var tot_prec = Math.round((parseFloat(_this.compte.entreprise[_this.ent][3])) * 100)/100;
								
								/* 
								* portefeuille d'actions -> _this.compte.entreprise[]
								* [0] -> Nom de l'entreprise
								* [1] -> Total d'actions
								* [2] -> Cotation actuelle du titre
								* [3] -> Coût investi par le client pour l'achat du total d'actions
								*/
								
								if (_this.act == "achat") {
									if (_this.compte.argent >= total) {
										_this.compte.argent = Math.round((_this.compte.argent - total) * 100)/100;
										_this.compte.entreprise[_this.ent] = [_this.ent, quant_prec + _this.quant, cotation[_this.ent]];
										_this.compte.entreprise[_this.ent][3] = Math.round((tot_prec + total) * 100)/100;
									} else {
										// util.log("coucou1");
										_this.reponse("pas assez d'argent");
									}
								} else if (_this.act == "vente" && quant_prec >= _this.quant) {
									_this.compte.argent = Math.round((_this.compte.argent + total) * 100)/100;
									_this.compte.entreprise[_this.ent] = [_this.ent, quant_prec - _this.quant, cotation[_this.ent]];
									
									tot_prec -= total;
									
									if (tot_prec < 0) {
										_this.compte.entreprise[_this.ent][3] = 0;
									} else {
										_this.compte.entreprise[_this.ent][3] = Math.round((tot_prec) * 100)/100;
									}
									
								} else {
									_this.reponse("pas possible");
								}
							} else if (_this.act != "vente") {
								if (_this.compte.argent >= total) {
									_this.compte.argent = Math.round((_this.compte.argent - total) * 100)/100;
									_this.compte.entreprise[_this.ent] = [_this.ent, _this.quant, cotation[_this.ent]];
									_this.compte.entreprise[_this.ent][3] = Math.round((total) * 100)/100;
								} else {
									// util.log("coucou2");
									_this.reponse("pas assez d'argent");
								}
							} else {
								_this.reponse("pas possible");
							}
							
							// Ecriture du portefeuille modifié
							fs.writeFile(_this.nom_json, JSON.stringify(_this.compte), "UTF-8",function (e){
								if (e) {
									util.log("ERROR - Ecriture1 " + _this.nom_json + " : " + e);
								} else {
									// util.log("Ecriture portefeuille " + _this.nom_json);
									_this.lecture();
								}
							});
						}
					});
				} else {
					_this.lecture();
				}			
			} else if (_this.act == "création") {
				_this.creation();
			} else {
				_this.output.info = "not exist";
				_this.reponse(_this.output);
			}
		});
	},

creation:
	function () {
		var _this = this;
		
		fs.writeFile(_this.nom_json, JSON.stringify({argent: 20000, entreprise:{}}), "UTF-8",function (e){
			if (e) {
				util.log("ERROR - Ecriture1 " + _this.nom_json + " : " + e);
			} else {
				// util.log("Ecriture portefeuille " + _this.nom_json);
			}
		});
		_this.output.info = "create";
		_this.reponse(_this.output);
	},

lecture:
	function () {
		var _this = this;
		
		fs.readFile(_this.nom_json,"UTF-8", function(e,d){
			if(e) {
				util.log("ERROR - Lecture1 " + _this.nom_json + " : " + e);
			} else if (d) {
				// util.log("Lecture portefeuille : " + _this.nom_json);
				_this.compte = JSON.parse(d); // Chargement du portefeuille dans une variable
				_this.output.info = "exist";
				_this.output.value = _this.compte;
				_this.reponse(_this.output);
			}
		});
	},
	
reponse:
	function (output) {
		var _this = this;
		
		// util.log("Envoi de l'objet au navigateur client");
		this.resp.writeHead(200, {"Content-Type": "application/json"});
		// Conversion d'une valeur en JSON -> ex:{"resp" : "Id ok"}
		this.resp.write(JSON.stringify({resp: output}));
		this.resp.end();
	}
};