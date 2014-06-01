var util = require('util');
var http = require('http');
var fs = require('./readwrite.js');
var EventEmitter = require('events').EventEmitter;
var evenement = new EventEmitter();
var server = {}; // creation d'un objet qui va contenir des variables et des fonction 
server.j=0;
server.entreprises={"nom": []};
// server.path = "../";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


evenement.on("debut", function(){
server.url="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22https%3A%2F%2Ffr.finance.yahoo.com%2Fq%2Fcp%3Fs%3D%255EFCHI%22&format=json&diagnostics=true&callback=";
	http.get(server.url, function (r) {
			var b = "";
			r.on("data", function (d) { // evenement qui se declanche lors de l'arrivée de donnée 
				b += d; // recuperation des données par 
			});
			r.on("end", function() { // fin de la recuperation 
			b = JSON.parse(b); // formatage du buffer en json 
			for(i=1; i<41; i++)
				{
					evenement.emit("symbole", b, i); // declanche ment d'un evenement qui va servir au stockage des données utiles		
				}
			});
		});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
evenement.on("symbole", function(b, i){

	if(b.query.results)
		{  
			var symbole ="";
			var nom ="";
			var name="";
			var entreprise={};
			entreprise.name =b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[1].tr.td.table.tr[i].td[1].p;
			entreprise.symbole =b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[1].tr.td.table.tr[i].td[0].strong.a.content;
			entreprise.nom = entreprise.name + " ("+entreprise.symbole+")";
			
			//evenement.emit("construction", entreprise)
			server.entreprises.nom[i-1]=entreprise;
			if(server.entreprises.nom.length==40)
				{
					// console.log(server.entreprises);
					evenement.emit("entregistreDansJson", server.entreprises);
				}
	}
		
});	

/////////////////////////////////////////////////////////////////////////////////////////////////
evenement.on("entregistreDansJson", function(entreprises){
// entregistrement des données 
	fs.writeFile("../protected/entreprises_cac40.json", JSON.stringify(entreprises), 'utf8', function(err){ //TODO
		if(err)
		{
			util.log(err);
		}
		else{
			console.log('on a enregister le buffer dans un fichier');
		}
	}); 


});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
evenement.emit("debut");
exports.demarrage=server.on;
