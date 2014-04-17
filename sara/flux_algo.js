var util = require('util');
var http = require('http');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var savePoids = new EventEmitter();
var server ={};
server.nbr=0;
server.i=0;
server.path = "./";
server.cac_40={"entreprise": []};

server.calcul= function(num_entreprise)
{ 
	fs.exists(server.path+'entreprises_cac40.js', function(exist){						
	if(exist)	// si le fichier n'existe pas on passe a l'entreprise suivante 					
		{  
			fs.readFile(server.path+'entreprises_cac40.js', 'utf-8', 'r+', function (err, d) {
			if (err) throw err;
			d = JSON.parse(d);
			var nom= d.nom[num_entreprise].nom;
			console.log(nom);
			fs.exists(server.path+''+nom, function(exist){
				if(exist) // on ouvre le fichier que si il existe
				{
					fs.readFile(server.path+''+nom, 'utf-8', 'r+', function (err, data) {
						if (err) throw err;
						data = JSON.parse(data);					
						if(data)
						{
							server.calcul_droites(data, num_entreprise);
							
						}
					});
				}
			});
			
			
		});
		
		}
	});	

};	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
server.calcul_droites=function(data, num_entreprise){
	var nbr_valeure_semaine = 5 * data.jour[data.jour.length-2].heure.length; 
	var derniere_valeure_semaine =data.jour[data.jour.length-2].heure[data.jour[data.jour.length-2].heure.length-1].valeure;
	derniere_valeure_semaine=derniere_valeure_semaine.replace(",", ".");           
	var premiere_valeure_semaine=data.jour[data.jour.length-6].heure[0].valeure
	premiere_valeure_semaine=premiere_valeure_semaine.replace(",", ".");
	var coef_dirrecteur_semaine = 0;
	coef_dirrecteur_semaine = ((+derniere_valeure_semaine)- (+premiere_valeure_semaine) )/(+nbr_valeure_semaine) ;//
	var nbr_valeure_jour = data.jour[data.jour.length-2].heure.length; 
	var derniere_valeure_jour =data.jour[data.jour.length-1].heure[data.jour[data.jour.length-1].heure.length-1].valeure;
	derniere_valeure_jour=derniere_valeure_jour.replace(",", ".");
	var premiere_valeure_jour=data.jour[data.jour.length-1].heure[0].valeure
	premiere_valeure_jour=premiere_valeure_jour.replace(",", ".");
	var coef_dirrecteur_jour =0;
	coef_dirrecteur_jour = (+derniere_valeure_jour -(+premiere_valeure_jour)) /(+nbr_valeure_jour) ; //
	
	var droite_semaine ={};
	var droite_jour={};

	droite_semaine.coef_dirrecteur=coef_dirrecteur_semaine;
	droite_semaine.valeure_origine=premiere_valeure_semaine;
	droite_semaine.nbr_valeure_semaine=nbr_valeure_semaine;

	droite_jour.coef_dirrecteur=coef_dirrecteur_jour;
	droite_jour.valeure_origine=premiere_valeure_jour;
	droite_jour.nbr_valeure_jour=nbr_valeure_jour;

	
	if(droite_semaine && droite_jour)
		{
			event.emit("vecteur", data, droite_semaine, droite_jour, num_entreprise);
		}

};	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
event.on("vecteur", function(data, droite_semaine, droite_jour, num_entreprise){
var vecteur_semaine ={"valeure" : []};
var vecteur_jour={"valeure" :[]};


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
		event.emit("compare", data, vecteur_semaine, vecteur_jour, num_entreprise);
	}
	
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
event.on("compare", function(data, vecteur_semaine, vecteur_jour, num_entreprise){
var nbr_jours_semaine= data.jour.length-2;
var nbr_valeur_jour= data.jour[data.jour.length-2].heure.length;// todo peu poser probleme si le nombre de val n'est pas constant
var val_courrante_semaine;
var val_courrante_jour=0;
var variance_semaine = 0;
var poids_semaine=0;
var variance_jour = 0;
var poids_jour=0;
var val=0;
var tmp=0;
var json={};


for(i=0; i< nbr_jours_semaine; i++)
	{
		for(j=0; j< nbr_valeur_jour; j++)
		{
			if(data.jour[i].heure[j] != null)
			{
				val_courante=data.jour[i].heure[j].valeure;
				val_courante = val_courante.replace(",", ".");
				variance_semaine += Math.pow((+val_courante - vecteur_semaine.valeure[val]), 2);
				
				val++;
				if(data.jour[i].heure[j+1] && data.jour[i].heure[j+1] != undefined)
					{
						tmp = data.jour[i].heure[j+1].valeure;
						tmp=tmp.replace(",", ".");
						poids_semaine += tmp - val_courante;
					}
			
			}else{
				val++;
			}
						
		}
		
	}
	variance_semaine=(+1/nbr_jours_semaine) * variance_semaine;

	for(i=0; i<data.jour[data.jour.length-1].heure.length; i++) // parcours des valeurs du jour courrant 
	{ 
		if(data.jour[data.jour.length-1].heure[i])
		{
			val_courrante_jour=data.jour[data.jour.length-1].heure[i].valeure;
			val_courrante_jour=val_courrante_jour.replace(",", ".");
			variance_jour += Math.pow(+val_courrante_jour - vecteur_jour.valeure[i], 2);
			
			if(data.jour[data.jour.length-1].heure[i+1] && data.jour[data.jour.length-1].heure[i+1] != undefined)
			{
				tmp = data.jour[data.jour.length-1].heure[i+1].valeure;
				tmp=tmp.replace(",", ".");
				poids_jour= tmp- val_courrante_jour;
			}
		}else{
				i++;
			}
	
	}
	variance_jour = (+1/nbr_valeur_jour) * variance_jour;
	
	
	
	// remplissage du json 
	json.poids_semaine=poids_semaine;
	json.variance_semaine=variance_semaine;
	json.poids_jour=poids_jour;
	json.variance_jour=variance_jour;
	json.nom_entreprise=data.nom_entreprise;
	server.cac_40.entreprise[num_entreprise] = json;
	
	if(server.cac_40.entreprise)
	{
		event.emit("enregistrement", server.cac_40);
	}
	
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			

event.on("enregistrement", function(cac_40){
	fs.writeFile("cac_40.js", JSON.stringify(cac_40), 'utf8', 'a+', function(err){
		if(err) throw err;
		console.log('we just saved the buffer in a file');
		server.calcul(server.nbr++);
		}); 
					
	}); 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


var start=function()
{
	server.calcul(server.nbr++);

}
//start();
exports.traitement= start;