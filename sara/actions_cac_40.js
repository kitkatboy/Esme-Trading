var util = require('util');
var http = require('http');
var fs = require('fs');
var server = {}; // creation d'un objet
server.api = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Ffr.finance.yahoo.com%2Fq%2Fhp%3Fs%3DAC.PA%26b%3D5%26a%3D02%26c%3D2014%26e%3D12%26d%3D02%26f%3D2014%26g%3Dd%22&format=json&diagnostics=true&callback=";//&callback=";
 
 server.get = function() {
    var b = ""; // variable qui va contenir les données resultante de la requette
    http.get(server.api, function (r) {
        r.on("data", function (d) {
            b += d;
        });
        r.on("end", function() {
        b = JSON.parse(b);
		
		server.extraction_donnes(b);
			
        });
    });
};

// fonction qui recupere les articles et les stock dans un json 
server.extraction_donnes= function (b) {
			
	action_entreprise = { "jour" : [], "cours_acctuel" : []};
	
	var j=0;
	var tmp=0;
	var tps=0;
	// EXTRACTION DES DONN2ES d'une entreprise relatif a tous les jours sauf le jour courant /////////////////////////////////////////////////////////////////////////////
	//action_entreprise.nom_entrepris = b.query.results.body.div[3].div[3].div[0].div.div.div.div[0].div.h2; // premier champ : nom action
	//for(var i=5; i>0; i--)
	//{   
	//var entreprise = {};
	
	//	entreprise.date = b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[3].tr.td.table.tr[i].td[0].p ;

	//	entreprise.prix_ouverture = b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[3].tr.td.table.tr[i].td[1].p ;
		
	//	entreprise.prix_haut = b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[3].tr.td.table.tr[i].td[2].p;
		
	//	entreprise.prix_bas = b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[3].tr.td.table.tr[i].td[3].p;
	
	//	entreprise.prix_cloture = b.query.results.body.div[3].div[3].table[1].tr.td.table.tr.td[0].table[3].tr.td.table.tr[i].td[4].p;
		
			// remplissage du json 
	
	//   action_entreprise.jour[j] = entreprise; // deuxieme champs 

	//	util.log(util.inspect(action_entreprise));
	
	//	j++; 
	
	//}
	
	
	setInterval(function(tps){
	
			var action_tmps_reel = {};
	// lecture du json contenue dans le fichier pour acceder aux données qu'il contiens 
	//		fs.readFile('Mesvaleurs.js', 'utf-8', 'r+', function (err, data) {
	//		if (err) throw err;
	//			data = JSON.parse(data);
	//			console.log(data);
				// entregistrement des donnees temps reel 
				
			//	data.cours_acctuel[tps] = tps;
				action_tmps_reel.heure = b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[2].span.span.content;
				action_tmps_reel.valeure = b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[0].span.content;
				
					// on enregistre les resultats dans le json 
				//data.cours_acctuel[tps] = action_tmps_reel; 
				
				action_entreprise.cours_acctuel[tps] = action_tmps_reel;
				tps++;
				console.log(action_entreprise);
				
				/////////////////////////////entregistrement dans un fichier toute les 5 min ///////////////////////////////////////////////////////////
				fs.writeFile('Mesvaleurs.js', JSON.stringify(action_entreprise), function(err){
				if(err) throw err;
				console.log('on a enregister le buffer dans un fichier');
				}); 

			
			//});
		},300000);
	};
	/////////////////////////////entregistrement dans un fichier toute les 5 min ///////////////////////////////////////////////////////////
	//fs.writeFile('Mesvaleurs.js', JSON.stringify(action_entreprise), function(err){
	//	if(err) throw err;
	//	console.log('on a enregister le buffer dans un fichier');
	//}); 

	

// creation de notre serveur  et appel aux fonctions 
http.createServer(function (req, res) {
    server.get(); // appel a la fonction principale 
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

util.log('Server running at http://127.0.0.1:1337/');