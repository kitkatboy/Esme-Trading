var util = require('util');
var https = require('https');
var fs = require('fs');
var db = require('./database.js');
var EventEmitter = require('events').EventEmitter;
var evnts = new EventEmitter();



var recuperation=function(){
	//LE FICHIER TEMPORAIRE VA NOUS PERMETTRE DE SAVOIR SI ON PEUT LIRE LA DATABASE OU SI ELLE EST OCCUPE//
	fs.writeFile("tmpFile", "hello", function(err){ 
		if(err) throw err;
		console.log('on a creer le fichier temporaire');
		});
		
	Today= new Date();
	if(Today.getHours()>8 && Today.getHours()<20 && Today.getDay()!=6 && Today.getDay()!=0) // heure de démarrage de la bourse 9 H
		{
			var b="";
			var api="https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22https%3A%2F%2Ffr.finance.yahoo.com%2Fq%3Fs%3D%255EFCHI%22&format=json&diagnostics=true&callback=";
			https.get(api, function (r) {	
				if(r.statusCode==200)
				{
					r.on("data", function (d) {
					 b+=d.toString();		
					});
					r.on("end", function() {
					b = JSON.parse(b);
					evnts.emit("save", b);
					});
					r.on("error", function(e) { 
						util.log("ERROR - Data transfert HTTPS : " + e);
					});
				}
			});
		
		}else{
		console.log("la bourse est fermee pour le moment...");
		}
};		
		
		
evnts.on("save", function(b){
	if(b.query.results)
	{
		var tmp=b.query.results.body.div[2].div.div[2].div[1].div.div.div[1].div.span[0].span.content;
		tmp=tmp.replace(",", ".");
		tmp=tmp.replace(" ", ""); // on supprime les espace entre les chiffres
		fs.unlinkSync('/tmpFile') // on supprime le fichier temporaire pour dire qu'on ecrit dans la database (non utilisable)
		console.log('successfull delete OF /tmpFile');	
		db.insert({"valeur" : tmp.toString()});
		fs.writeFile("tmpFile", "hello", function(err){ 
			if(err) throw err;
			console.log('on a creer le fichier temporaire');
			}); 
		
	}
});	
//////////////////////////////CREATION DE LA BASE DE DONNEES EN UTILISANT UN ECOUTEUR QUI ECOUTE UNE SEUL FOIS//////////////////////////////////////////
 evnts.once('creation_serveur', function (stream) {
  db.create();
});
evnts.emit('creation_serveur');
//////////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function (){ 
	recuperation();
	//globale.i++;	
},10000);	
///////////////////////////////////////////////////////////////////////////////////////////////////////

/*reponse(that, fonc){
fs.exists('tmpFile', function(exist){															
	if(exist)	// si le fichier n'existe pas on passe a l'entreprise suivante 					
		{
			db.readWeek(that, fonc);
		}
});
});			
*/
			