var util = require('util');
var http = require('http');
var net = require('net');
// var demarrage = require('./flux_json.js');
var db = require('./databaseEntreprises.js');
var fin=require('./flux_algoo.js');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var emetteur = new EventEmitter();
var server = {}; // creation d'un objet qui va contenir des variables et des fonction 
server.Today= new Date;
server.Jours=server.Today.getDate();
server.Mois=server.Today.getMonth();
server.Heure=server.Today.getHours();
server.Annee=server.Today.getFullYear();
server.i=0; // compteur d'entreprise TODO jour initaliser a 0 ou au jour ou on arrete la db 
server.jour=8; // TODO jour initaliser a 0 ou au jour ou on arrete la db 
server.heure=-1;
 if(server.Mois.length == 1) {
        server.Mois = '0' + server.Mois;
		 
    }
// server.path = "./";
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
var socket =new net.Socket();
socket.setKeepAlive(true);

////////////////////////////////////////////////////////fonction qui recupere les flux html des données journaliere DE L'ENTREPRISE PASSEE EN ARGUMENT///////////////////////////////////
server.extractionDonees=function(i){
var symboles="";
var nom="";
 //lecture du json contenue dans le fichier pour acceder aux données qu'il contiens 
		fs.readFile('../protected/entreprises_cac40.json', 'utf-8', 'r+', function (err, data) { //----------------------------------------------------------GREG
			if (err) {
				console.log("ERROR - " + err);
			} else if (data) {
				data = JSON.parse(data);
				if(i < 40){
					var symboles = data.nom[i].symbole;
					var nom = data.nom[i].nom//ADD
					console.log(i);
					console.log(symboles);		
					server.api = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Ffr.finance.yahoo.com%2Fq%2Fhp%3Fs%3D"+symboles+"%26b%3D10%26a%3D02%26c%3D2014%26e%3D"+server.Jours+"%26d%3D"+server.Mois+"%26f%3D"+server.Annee+"%26g%3Dd%22&format=json&diagnostics=true&callback=";  
					emetteur.emit("getBuffer", nom);
				}else{
					if(server.jour>4){
						fin.traitement();
						db.readStock();
					}				
				}	
			}
		});
	
}; ////////////////////////////////////////////////////FIN FONCTION RECUPERATION DONN2ES JOURNALIERE//////////////////////////////////////////
	
//////////////////////////////////////////////////////fonction qui recupere le resultat de la requette dans le buffeur et le met dans un json /////////////////////////////////////////	
emetteur.on("getBuffer", function(nom) {
	var b = ""; 
	http.get(server.api, function (r) {
	
	if(r.statusCode==200) {
			console.log("statue code :"+r.statusCode);
		
			r.on("data", function (d) {
				b += d;	
			});
			r.on("end", function() {
			b = JSON.parse(b);
			emetteur.emit("json", b, nom); // une fois l'extration finie on declanche l'evenement qui enregistre les données utiles dans un json 	
			});
			r.on("socket", function (socket) { //ADD
			socket.emit("agentRemove");//ADD
			console.log("erreur socket");
			});//ADD
			r.on("error", function (e) { //ADD
			console.log("une erreure c produite + e");//ADD
			});//ADD
		}else {	
			console.log("une erreur");
			server.extractionDonees((server.i)++);	
		}
	});	
});
///////////////////////////////////////enregistrement des données dans une varriable  json /////////////////////////////////////////////////////////////////////////////////////////////
emetteur.on("json", function(b, nom){
		var jour;
		var id;
		var valeur;
		var nom;
		if(b.query.results){
			if(b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[0].span.content && b.query.results.body.div[3].div[3].div[0].div.div.div.div[0].div.h2){
				console.log("jour :"+server.jour);
				console.log("enregistrement numero :"+server.heure);
				jour = server.jour;
				id = server.heure;
				nom = b.query.results.body.div[3].div[3].div[0].div.div.div.div[0].div.h2;
				valeur = b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[0].span.content; //  donnée courante
				valeur=valeur.replace(",", ".");
				db.insert({"id" : id, "nom" : nom, "valeur" : valeur, "jour": jour});
				server.extractionDonees((server.i)++);
			}	
		} else {
			server.extractionDonees((server.i)++);
		}
});
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

emetteur.on('debut',function(){
	
	server.Today= new Date;
	if(server.Today.getHours()>8 && server.Today.getHours()<18 && server.Today.getDay()!=6 && server.Today.getDay()!=0){// heure de démarrage de la bourse 9 H todo		
		server.i=0
		server.heure++;	
		server.extractionDonees((server.i)++);			
	}else if(server.Today.getHours()==19 && server.Today.getMinutes()>0 && server.Today.getMinutes()<6 ){
		console.log("on passes au jour suivant ");
		server.jour++;
	}
	else{
		util.log("c'est pas l'heure");
	}
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
emetteur.once('creation_database', function (stream) {
	db.create();
});
// emetteur.emit('creation_database'); 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function (){ 
	emetteur.emit("debut");
},300000);