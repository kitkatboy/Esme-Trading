var util = require('util');
var http = require('http');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var evnt = new EventEmitter();
var server={};
server.json;
var sortie = "[";

server.miseenforme = function(that, nom, fonc){
var outPut = {};
fs.exists(nom, function(exist){															
	if(exist){	// si le fichier n'existe pas on passe a l'entreprise suivante 					
		
		fs.readFile(nom, 'utf-8', 'r+', function (err, data) {
		if (err) throw err;
		server.json= JSON.parse(data);
		outPut.date = server.json.jour[0].heure[0].valeure;	
		for(var i=server.json.jour.length-6;i<server.json.jour.length ; i++){ 
			for(j in server.json.jour[i].heure){
				
					if(server.json.jour[i].heure[j] != null){
						sortie += server.json.jour[i].heure[j].valeure+",";
					}
				}
			}
			sortie = sortie.substring(0,(sortie.length -1));
			sortie += "]";
			console.log(sortie);
			outPut.valeurs
			that[fonc](outPut);
		});	
		}
		
});
};
	
var getChiffres= function(that, nom, fonc){ 
fs.exists('tmpFichier', function(exist){									
	if(exist)	// si le fichier n'existe pas on passe a l'entreprise suivante 					
		{
			server.miseenforme(that, nom, fonc);
		}
});
};			

	
//getChiffres(null, "Accor SA (AC.PA)", null);