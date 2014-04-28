var database = require('./database.js');
var lecture_articles = require('./lecture_articles.js');
var databaseChiffres = require('./databaseChiffres.js');

exports.postReq = function(paquets, req, resp) {
	console.log("Reception paquets : " + JSON.stringify(paquets));
	var traitement_post = new constr_post_acceuil(paquets, req, resp);
	
	if (paquets.act == "identification") {
		traitement_post.log();
	} else if (paquets.act == "inscription") {
		traitement_post.create();
	} else if (paquets.act == "deconnect") {
		traitement_post.deconnect();
	} else if (paquets.act == "chargement_articles") {
		traitement_post.check_log();
	} else if (paquets.act == "chargement_entreprises") {
		traitement_post.check_log();
	} else if (paquets.act == "chargement_courbe") {
		traitement_post.check_log();
	} else {
		traitement_post.reponse("Un problème est survenu lors du traitement de la requête");
	}

	traitement_post = null;
};

/* Constructeur POST page acceuil*/
constr_post_acceuil = function (paquets, req, resp) {
	console.log("Appel du constructeur POST")
	if(paquets && req && resp) {
		this.req = req;
		this.resp = resp
		this.mail = paquets.mail;
		this.id = paquets.id;
		this.mdp = paquets.mdp;
		this.log_temp = paquets.log_temp;
		this.act = paquets.act;
		this.search = paquets.search;
	} else {
		console.log("ERROR - L'\objet POST n\'a pas pu etre construit.");
		return;
	}

};

constr_post_acceuil.prototype = {


// Check login temporaire ------------------------------------------------------
check_log:
	function () {
		database.checkDatabase(this, this.act, "log_invalid");
	},
	
log_invalid:
	function () {
		this.reponse("log out");
	},
//-------------------------------------------------------------------------------


log:
	function () {
		console.log("Debut traitement du POST identification");
		database.verifLogin(this, "reponse");
	},
	
create:
	function () {
		console.log("Debut traitement du POST inscription");
		database.verifMail(this, "reponse");
	},
	
deconnect:
	function () {
		console.log("Deconnexion client : " + this.log_temp);
		database.erase_log(this, "reponse");
	},
	
chargement_articles:
	function () {
		console.log("Chargement des donnees d'actualites : " + this.search);
		lecture_articles.start(this, "reponse", this.search);
	},
	
chargement_entreprises:
	function () {
		console.log("Chargement des noms d'entreprises : "/* + this.search*/); //TO DO--------------
		databaseChiffres.getName(this, "reponse"/*, this.search*/);
	},
	
chargement_courbe:
	function () {
		console.log("Chargement de la courbe : "/* + this.search*/); //TO DO--------------
		databaseChiffres.readAll(this, "reponse"/*, this.search*/);
	},

reponse:
	function (output, arg) {
		console.log("Envoi de l'objet au navigateur client");
		if (arg) {
			this.resp.writeHead(200, {"Content-Type": "application/json", "set-cookie":arg});//--------
		} else {
			this.resp.writeHead(200, {"Content-Type": "application/json"});
		}
		// Conversion d'une valeur en JSON -> ex:{"resp" : "Id ok"}
		this.resp.write(JSON.stringify({resp: output}));
		this.resp.end();
	},
};