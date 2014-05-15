var http = require("http");
var util = require("util");
// var databaseEntreprises = require('../protected/js/databaseEntreprises.js');
// var flux_algoo = require('../protected/js/flux_algoo.js');
// var flux_cac400 = require('../protected/js/flux_cac400.js');
// var flux_globale = require('../protected/js/flux_globale.js');
// var recuperation_articles = require('../protected/js/recuperation_articles.js');


var recuperation_articles = require("../protected/js/recuperation_articles.js");
var router = require("../protected/js/router.js");

/* Création d'un objet serveur stockant les variables et methodes */
var server = {};
server.port = 1337;
server.address = "127.0.0.1";

server.receive_request = function (request, response) {
    router.route(request, response);
};

http.createServer(server.receive_request).listen(server.port, server.address);
		
util.log("INFO - Demarrage du serveur, listening " + server.address + " : " + server.port);

/* Appel des fonctions de récupération des données */
/* Listeners */
//recuperation_articles.evx.on("go", recuperation_articles.start());
/*
setInterval(function () {
	recuperation_articles.evx.emit("go");
}, 5*1000);
*/
//recuperation_articles.read();

// databaseEntreprises.readStock();
// databaseEntreprises.read();
// databaseEntreprises.readStock();
// flux_algoo.traitement()


// recuperation_articles.start()

// setInterval(function () {
	// recuperation_articles.start()
// }, 10*60*1000);