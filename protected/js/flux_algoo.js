var util = require('util');
var http = require('http');
var db = require('./databaseEntreprises.js');
var fs = require('./readwrite.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var savePoids = new EventEmitter();
var server ={};
server.nbr=0;
server.i=0;
// server.path = "./";
server.cac_40={"entreprise": []};

server.calcul= function(num_entreprise)
{ 
	if(num_entreprise<40)
	{
				fs.readFile('../protected/entreprises_cac40.json', 'utf-8', function (err, d) {
				if (err) util.log(err);
				d = JSON.parse(d);
				var nom= d.nom[num_entreprise].nom;
				console.log(nom);
				db.readAlgo(nom, server, "calcul_droites", num_entreprise);			
				});			
	}else{
					// fs.writeFile("../protected/tmpFichier.json", "hello", function(err){ 
					// if(err) throw err;
					// console.log('fin du traitement ...');
					// console.log('on a creer le fichier temporaire tmpFichier'); // pour dire qu'on peut lire librement dans la databaseEntreprises ( voir fonction readALL de databaseEntreprises)
					server.nbr=0;
					// });
	}
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
server.calcul_droites=function(data, num_entreprise){
		console.log("le fichier existe");
		console.log(data);
		var derniere_valeure_semaine = 0;
		var premiere_valeure_semaine = 0;
		var derniere_valeure_jour = 0;
		var premiere_valeure_jour = 0;
	if(	data.derniere_valeure_semaine && data.premiere_valeure_semaine && data.derniere_valeure_jour && data.premiere_valeure_jour)
	{
		var nbr_valeure_semaine = data.nbr_valeure_semaine;
		derniere_valeure_semaine = data.derniere_valeure_semaine.replace(",", "."); 	
		premiere_valeure_semaine = data.premiere_valeure_semaine.replace(",", ".");
		var coef_dirrecteur_semaine = 0;
		coef_dirrecteur_semaine = ((+derniere_valeure_semaine)- (+premiere_valeure_semaine) )/(+nbr_valeure_semaine) ;//
		var nbr_valeure_jour = data.nbr_valeure_jour;
		derniere_valeure_jour = data.derniere_valeure_jour.replace(",", ".");
		premiere_valeure_jour = data.premiere_valeure_jour.replace(",", ".");
		var coef_dirrecteur_jour =0;
		coef_dirrecteur_jour = (+derniere_valeure_jour -(+premiere_valeure_jour)) /(+nbr_valeure_jour) ; //
		
		var droite_semaine ={};
		var droite_jour={};
		droite_semaine.coef_dirrecteur = coef_dirrecteur_semaine;
		droite_semaine.valeure_origine = premiere_valeure_semaine;
		droite_semaine.nbr_valeure_semaine = nbr_valeure_semaine;

		droite_jour.coef_dirrecteur = coef_dirrecteur_jour;
		droite_jour.valeure_origine = premiere_valeure_jour;
		droite_jour.nbr_valeure_jour = nbr_valeure_jour;

		
		if(droite_semaine && droite_jour)
			{
				event.emit("vecteur", data, droite_semaine, droite_jour, num_entreprise);
			}
	}else{
		server.calcul(server.nbr++);
	}
};	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
event.on("vecteur", function(data, droite_semaine, droite_jour, num_entreprise){

var vecteur_semaine ={"valeure" :[]};
var vecteur_jour = {"valeure" :[]};


	for(val=0; val<droite_semaine.nbr_valeure_semaine; val++)
	{
		vecteur_semaine.valeure[val] = +(droite_semaine.coef_dirrecteur) * (val) + Number(droite_semaine.valeure_origine);	
			
	}
	for(tps=0; tps<droite_jour.nbr_valeure_jour; tps++)
	{
		vecteur_jour.valeure[tps]= +(droite_jour.coef_dirrecteur) * (5*tps) + Number(droite_jour.valeure_origine);
	}
		
	if(vecteur_semaine.valeure && vecteur_jour.valeure)
	{
		db.readWeek(server, "compare", data.nom, data, vecteur_semaine, vecteur_jour, num_entreprise);
						
	}

	
});
/////----------------------------------------------------------------------------------------------------------------

server.compare = function(output, data, vecteur_semaine, vecteur_jour, num_entreprise){
	var nbr_jours_semaine= 5;
	var nbr_valeur_jour = data.nbr_valeure_jour;// todo peu poser probleme si le nombre de val n'est pas constant
	var nbr_valeur_semaine = data.nbr_valeure_semaine;
	var val_courrante_semaine;
	var val_courrante_jour=0;
	var variance_semaine = 0;
	var poids_semaine = 0;
	var variance_jour = 0;
	var poids_jour=0;
	var val=0;
	var tmp=0;
	var json={};
	// server.path="./"
	console.log("-----------------------------ok---------------");
	for(i= 0; i < output.semaine.length ;i++)
	{	
		if(output.semaine[i+1]){
			output.semaine[i+1] = output.semaine[i+1].replace(",", ".");
			output.semaine[i] = output.semaine[i].replace(",", ".");
			
			poids_semaine += +output.semaine[i+1] - (+output.semaine[i]);
			console.log(poids_semaine);
		}
		variance_semaine += Math.pow((+output.semaine[i] - (+vecteur_semaine.valeure[i])), 2);
	}
	variance_semaine=((1/(nbr_valeur_semaine)) * variance_semaine);
	
	for(i= 0; i < output.jour.length ;i++)
	{
		output.jour[i] = output.jour[i].replace(",", ".");
		if(output.jour[i+1]){
			poids_jour += output.jour[i+1] - output.jour[i];
		}
		variance_jour += Math.pow((+output.jour[i] - (+vecteur_jour.valeure[i])), 2);
	}
	variance_jour=(+1/nbr_valeur_jour) * variance_semaine;
	
		// remplissage du json 
		json.poids_semaine=poids_semaine;
		json.variance_semaine=variance_semaine;
		json.poids_jour=poids_jour;
		json.variance_jour=variance_jour;
		json.nom_entreprise=data.nom;
		server.cac_40.entreprise[num_entreprise] = json;
		
		if(server.cac_40.entreprise)
		{
			event.emit("enregistrement", server.cac_40);
		}
		
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

event.on("enregistrement", function(cac_40){

	fs.writeFile("../protected/cac_40.json", JSON.stringify(cac_40), 'utf8', function(err){
		if(err) util.log( err);
		console.log('we just saved the buffer in a file');
		server.calcul(server.nbr++);
		}); 
					
	}); 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


exports.traitement=function()
{
// fs.exists('../protected/tmpFichier.json', function (exist) {
    // if (exist) {
			// fs.unlinkSync('../protected/tmpFichier.json') // on supprime le fichier temporaire 
			// console.log('successfull delete OF /tmpFichier');
			server.calcul(server.nbr++);
    // } else {
			// console.log("le fichier n'existe pas encore");
			// server.calcul(server.nbr++);	
			
		// }
	// });
	
}
// exports.traitement();