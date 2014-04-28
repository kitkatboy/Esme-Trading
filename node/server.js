var http = require("http");
var util = require("util");

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
/*
setInterval(function () {
	recuperation_articles.start()
}, 5*1000);
*/
recuperation_articles.create();