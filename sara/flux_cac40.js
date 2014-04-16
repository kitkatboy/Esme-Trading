var util = require('util');
var http = require('http');
var demarrage = require('./flux_json.js');
var fin=require('./flux_algo.js');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var emetteur = new EventEmitter();
var server = {}; // creation d'un objet qui va contenir des variables et des fonction 
server.Today= new Date;
server.Jours=server.Today.getDate();
server.Mois=server.Today.getMonth();
server.Heure=server.Today.getHours();
server.Annee=server.Today.getFullYear();
server.i=0; // compteur d'entreprise 
server.jour=0;
server.heure=-1;
server.requettes=-1; // nombre de requette pour recuperer les données courantes 
 if(server.Mois.length == 1) {
        server.Mois = '0' + server.Mois;
		 
    }
server.path = "../";
server.compteur=0; // mon semaphore
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
//////////////////////////////////////////////////////FONCTION QUI SE DECLANCHE APRES L4EVENEMNT DE DEMANDE DE RAFRAICHISSEMENT DES DONN2ES DOURSIERE COT2 CLIENT//////////////////////////////////////////////////////////////////////
emetteur.on('rafraichissement', function(){ 
	server.extractionDonees(0); // appel a la fonction qui exctrai les données de l'entreprise i
	//server.requettes+=1; // on incremente le nombres de requette effectuée corresponds au nombres de 5 min
	server.i=0; // on remet le COMPTEUR d'entreprise a 0 a chaque nouvelle requette 
});

////////////////////////////////////////////////////////fonction qui recupere les flux html des données journaliere DE L4ENTREPRISE PASS2 EN ARGUMENT///////////////////////////////////
server.extractionDonees=function(i){
var symboles="";
var nom="";
 //lecture du json contenue dans le fichier pour acceder aux données qu'il contiens 
		fs.readFile(server.path+'entreprises_cac40.js', 'utf-8', 'r+', function (err, data) {
		if (err) throw err;
		data = JSON.parse(data);
		symboles = data.nom[i].symbole;
		var nom = data.nom[i].nom//ADD
		console.log(i);
		console.log(symboles);
				
        server.api = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Ffr.finance.yahoo.com%2Fq%2Fhp%3Fs%3D"+symboles+"%26b%3D10%26a%3D02%26c%3D2014%26e%3D"+server.Jours+"%26d%3D"+server.Mois+"%26f%3D"+server.Annee+"%26g%3Dd%22&format=json&diagnostics=true&callback=";
		if(server.api);
			{   
				emetteur.emit("getBuffer", nom);//ADD
				server.compteur++; // TODO 
				
			}		
		});
	
}; ////////////////////////////////////////////////////FIN FONCTION RECUPERATION DONN2ES JOURNALIERE//////////////////////////////////////////
	
//////////////////////////////////////////////////////fonction qui recupere le resultat de la requette dans le buffeur et le met dans un json /////////////////////////////////////////	
emetteur.on("getBuffer", function(nom) {
		var b = ""; // variable qui va contenir les données resultante de la requette
		http.get(server.api, function (r) {
		console.log(r.statusCode+"ssssssssssssssssssss");
	if(r.statusCode==200)
	{
        r.on("data", function (d) {
            b += d;
			
        });
        r.on("end", function() {
        b = JSON.parse(b);
		emetteur.emit("json", b, nom); // une fois l'extration finie on declanche l'evenement qui enregistre les données utiles dans un json 	
		});
	}else {	
	server.compteur--;
	emetteur.emit('recuperation');	
	}
		});
	
});
///////////////////////////////////////enregistrement des données dans une varriable  json /////////////////////////////////////////////////////////////////////////////////////////////
emetteur.on("json", function(b, nom){
		var jour;
		var heure;
		var action_entreprise = {"jour":[]};
		var actions = {"heure":[]};
		var action_tmps_reel ={};
	if(b.query.results)
	{
		if(b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[2].span.span)// car souvants des erreurs
			{	console.log(server.jour+"jouuuuuuur");
				console.log(server.heure+"heure");
				nom = b.query.results.body.div[3].div[3].div[0].div.div.div.div[0].div.h2;
				//action_tmps_reel.time = b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[2].span.span.content; // derniere heure a laquelle la donnée a été mise a jour
				action_tmps_reel.time=new Date;
				action_tmps_reel.valeure = b.query.results.body.div[3].div[3].div[0].div.div.div.div[1].div.span[0].span.content; //  donnée courante 
				actions.heure[server.heure]=action_tmps_reel;
				//actions.heure=action_tmps_reel;
				actions.date= server.Today;
				console.log(actions);
				action_entreprise.jour[server.jour]= actions;
				action_entreprise.nom_entreprise=nom;
				//action_entreprise.jour= actions;
				console.log(action_entreprise);
					if(action_entreprise.jour[server.jour].heure[server.heure]) // si la recuperation de donnnée est fini ( non équale a nulll)
						{
						
							emetteur.emit("enregistrement", action_entreprise, nom);
						}
					else{
						emetteur.emit('recuperation');		
						server.compteur--;
					}
			}
		else {
			emetteur.emit('recuperation');		
			server.compteur--;
		}
	}	
	else {
		emetteur.emit('recuperation');		
		server.compteur--;
	}

});
	
//////////////////////////////////////////////FONCTION QUI ENREGISTRE LES DONN2ES dans un fichier json ////////////////////////////////////////////////////////
emetteur.on("enregistrement", function(action_entreprise, nom){
												
fs.exists(nom, function(exist){						
										
	if(exist)	// si le fichier n'existe pas on passe a l'entreprise suivante 					
		{						
			fs.readFile(nom, 'utf-8', 'r+', function (err, data) { // LE FICHIER PEUT EXISTER ET ETRE VIDE ! 
			if(err) throw err;
			data = JSON.parse(data);
				if(data.jour[server.jour])
				{
					data.jour[server.jour].heure[server.heure]=action_entreprise.jour[server.jour].heure[server.heure];
					fs.writeFile(""+nom, JSON.stringify(data), 'utf8', 'a+', function(err){
					if(err) throw err;
					console.log(nom);
					console.log('on a enregiste le buffer dans un fichier');
					//server.compteur--;// semaphore
					emetteur.emit('recuperation');// DECLANCHEMENT D4UN EVENEMENT POUR PASS2 A L4ENTREPRISE SUIVANTE
					}); 
				}else{
					data.jour[server.jour]=action_entreprise.jour[server.jour];
					fs.writeFile(""+nom, JSON.stringify(data), 'utf8', 'a+', function(err){
					if(err) throw err;
					console.log(nom);
					console.log('on a enregiste le buffer dans un fichier');
					//server.compteur--; //semaphore
					emetteur.emit('recuperation');// DECLANCHEMENT D4UN EVENEMENT POUR PASS2 A L4ENTREPRISE SUIVANTE
					});	
				}	
			});						
			
		}else{
			fs.writeFile(nom, JSON.stringify(action_entreprise), function(err){ 
			if(err) throw err;
			console.log(nom+" furst time");
			console.log('on a enregiste le buffer dans un fichier');
			//server.compteur --; // semaphore
			emetteur.emit('recuperation');
			}); 
		}
			
		
});	if(!--server.compteur)
{
	console.log("---------------------c'est fini");
	//fin.traitement();
}
});	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
emetteur.on('recuperation', function(){
	while(server.i<40)
	{   
		server.extractionDonees((server.i)++); // appel a la fonction qui exctrai les données de l'entreprise i +1
	}

});

//------------------------------------------

emetteur.on('debut',function(){
server.Today= new Date;
if(server.Today.getHours()>8 && server.Today.getHours()<18 && server.Today.getDay()!=6 && server.Today.getDay()!=0) // heure de démarrage de la bourse 9 H
	{
			emetteur.emit('rafraichissement'); // lancement de la recuperation des chiffres du cac 40 toute les 5 min 
			server.heure++;
	}else if(server.Today.getHours()==19 && server.Today.getMinutes()>0 && server.Today.getMinutes()<6 )
	{
		server.jour++;
	}
	else{
		util.log(server.Today.getHours()+"h"+server.Today.getMinutes()+"min");
		util.log("c'est pas l'heure");
	}
});

setInterval(function (){ 
	emetteur.emit("debut");
	},30000);

	
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////