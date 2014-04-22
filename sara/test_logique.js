var util = require('util');
var http = require('http');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter();
var server = {};
server.borneSup = 5;
server.borneInf = -5;
server.centreGauss = 0;
server.ecart_type = 9;


var logiqueFloue = function(nom){
	var prevision={};
	prevision.nom_entreprise=nom;
	prevision.prevision_semaine;
	prevision.prevision_jour;
	fs.exists('cac_40.js', function(exist){														
		if(exist)
			{
				fs.exists('tmp', function(ex){														
					if(ex)						
					{
						fs.readFile('cac_40.js', 'utf-8', 'r+', function (err, data) { // LE FICHIER PEUT EXISTER ET ETRE VIDE ! 
						if(err) throw err;
						data = JSON.parse(data);
						//console.log(data);
						for(i in data.entreprise)
						{
							if(data.entreprise[i].nom_entreprise == nom)
							{
								
								var  variance_semaine = +(data.entreprise[i].variance_semaine);
								var res_variance_semaine = gauss(server.ecart_type, server.centreGauss, variance_semaine);
								var  poids_semaine = (data.entreprise[i].poids_semaine)*res_variance_semaine;
								prevision.prevision_semaine = triAnsemble(server.borneInf, server.borneSup, poids_semaine);
								var  variance_jour = +(data.entreprise[i].variance_jour);
								var res_variance_jour = gauss(server.ecart_type, server.centreGauss, variance_jour);
								var  poids_jour = (data.entreprise[i].poids_jour) * res_variance_jour;
								prevision.prevision_jour = triAnsemble(server.borneInf, server.borneSup, poids_jour);
								//console.log(prevision);	
								ev.emit("saving", prevision);
							}
						}
						
						});
					}
				});
			}
	});		
};
logiqueFloue("Accor SA (AC.PA)");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ev.on("saving", function(prevision){
	var obj={"entreprise" : []};
	
	fs.exists('prevision_cac4.js', function(e){						
											
		if(e)	// si le fichier n'existe pas on passe a l'entreprise suivante 					
			{						
				fs.readFile('prevision_cac4.js', 'utf-8', 'r+', function (err, data) { 
				if(err) throw err;
				data = JSON.parse(data);
				data.entreprise[data.entreprise.length]=prevision;
				fs.writeFile('prevision_cac4.js', JSON.stringify(data), function(err){ 
				if(err) throw err;
				console.log('on a enregiste la nouvelle donné dans un fichier');
				});
				});
			}else {	
				obj.entreprise[0] = prevision;
				console.log(obj);
				fs.writeFile('prevision_cac4.js', JSON.stringify(obj), function(err){ 
				if(err) throw err;
				console.log('on a enregiste la donné dans un fichier');
				});
			}
	});		
});
// fonction d'appartenance de type GAUSSIENNE v1 = varrience , m1 = moyenne/////////////////////////////////////////////
var gauss  = function(v1, m1, x){

if (v1 <= 0 ) {
    throw new Error('la VARIANCE doit etre positive');
  }
var y = 0;  
y = Math.exp(- 1/2 *(Math.pow(x - m1, 2) / (Math.pow(v1, 2))));
return y;
};

//console.log(gauss(5, 0, 4));

//fonctions d'appartenance de type (trois triangles)/////////////////////////////////////////////////////////////

var triAnsemble = function(borne1, borne2, val){

var res = {};
var borne0 = (borne2+borne1)/2;
var coef_dirrecteur1 = -1/(borne0-borne1);
var coef_dirrecteur2 = 1/(borne0-borne1);
var coef_dirrecteur3 = -1/(borne2-borne0);
var coef_dirrecteur4 = 1/(borne2-borne0);

if(val <= borne1){

	res.e2 =0;
	res.e1=1;
	res.e3 = 0;
}else if(val > borne1 && val < borne0){

res.e1 = val*(coef_dirrecteur1);
res.e2 = val*(coef_dirrecteur2)+1;
res.e3 = 0;
}else if(val > borne0 && val < borne2){

res.e1 = 0;
res.e2 = val*(coef_dirrecteur3)+1;
res.e3 = val*(coef_dirrecteur4);
}else if(val >= borne2){

res.e1 = 0;
res.e2 = 0;
res.e3 = 1;
}else if(val == borne0){

res.e1 = 0;
res.e2 = 1;
res.e3 = 0;
}
return res;
}

//console.log(triAnsemble(-5, 5, 2));