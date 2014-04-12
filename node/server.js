var http = require("http");
var util = require("util");

var recup_articles = require("../protected/recuperation_articles.js");
var router = require("../protected/router.js");

/* Création d'un objet serveur stockant les variables et methodes */
var server = {};
server.port = 1337;
server.address = "127.0.0.1";

server.receive_request = function (request, response) {
    router.route(request, response);
};

http.createServer(server.receive_request).listen(server.port, server.address);
		
util.log("INFO - Demarrage du serveur, listening " + server.address + " : " + server.port);

/* Appel des fonctions de récupération des données *//*
setInterval(function () {
	recup_articles.start()
}, 1*60*1000)*/