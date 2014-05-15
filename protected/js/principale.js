var pri = {};
pri.tps = 0;
pri.name_ent = "CAC 40";
pri.donnes_courbe = [];
pri.mem_portefeuille = "";
pri.date = "";
pri.interv_search;


/* Script sur action "click" */
pri.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", pri.on_click);
    // document.addEventListener("keypress", pri.on_key_press);
	pri.load_art();
	pri.load_ents();
	pri.load_courbe();
	pri.logique();
	pri.portefeuille();
	
	// Recherche dynamique par chaîne de caractères dans les articles
	document.getElementById("search").onfocus = function (){pri.interv_search = setInterval(pri.search, 10);};
	document.getElementById("search").onkeypress = function (ev){if (ev.keyCode == 13) {return false;}};
	document.getElementById("search").onblur = function () {clearInterval(pri.interv_search);};
};

pri.on_click = function (ev) {
	// .target désigne la cible(le noeud DOM) concerné par le chang. d'état sur événement "click"
	var src = ev.target;
	if (src.has_class("post1")) {
		// bouton deconnexion
		pri.send_post1();
	} else if (src.has_class("courbe_societe")) {
		// appel des informations par société
		pri.name_ent = src.innerHTML;
		pri.search(pri.name_ent);
		pri.load_courbe();
		
		if (pri.name_ent) {
			pri.logique();
		}
	} else if (src.has_class("raf_actu")) {
		// Rafraichissement du flux d'actualité
		pri.load_art()
	} else if (src.has_class("tps_courbe")) {
		pri.tps_courbe(src.innerHTML);
	} else if (src.has_class("création")) {
		// Création du portefeuille d'actions
		pri.portefeuille("création");
	} else if (src.has_class("achat_ok")) {
		// Acheter des actions
		pri.portefeuille("achat", src.id);
	} else if (src.has_class("vente_ok")) {
		// Vendre des actions
		pri.portefeuille("vente", src.id);
	}
};

pri.send_post1 = function() {
	// Récupération des données dans les balises de la classe associée
    var a = document.cookie;
	//alert("Valeurs : " + a);
	
    var data = {log_temp: a, act: "deconnect"};
	client.post(data, pri.post1_back);
};

pri.post1_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		window.location.assign("/acceuil.html");
	}
};

pri.search = function (click_ent) {
	var i = 0;
	var cpt = 0;
	var mem_ent = "";
	var sup = "SA S.A. SE REG NV GROUP CAC 40";
	var ext = "Liquide Paribas Agricole Générale";
	var entreprise, ent_temp = "";
	var ent_save = new Array();
	var article = document.getElementById("article"+i);
	
	if (click_ent) {
		if (click_ent == "Compagnie de Saint-Gobain") {
			entreprise = click_ent.toLowerCase();
		} else if (click_ent == "Electricité de France S.A.") {
			entreprise = "edf";
		} else {
			ent_save = click_ent.split(" ");
			// console.log("1 - " + ent_save);
			
			for (var j = 0; j < 2; j++) {
				
				if (sup.indexOf(ent_save[j]) >= 0) {
					ent_save[j] = "";
				}
			}
			
			if (ext.indexOf(ent_save[0]) >= 0 || ext.indexOf(ent_save[1]) >= 0) {
				entreprise = ent_save[0] + " " + ent_save[1];
			} else {
				entreprise = ent_save[0]
			}
		
			entreprise = entreprise.toLowerCase();
		}
	} else {
		entreprise = document.getElementsByClassName("entreprise")[0].value.toLowerCase();
		
		var reg = new RegExp("é", "g");
		entreprise = entreprise.replace(reg, "e");
	}
	
	// console.log(" - " + entreprise);
	while (article) {
		if (entreprise) {
			article = document.getElementById("article"+i);
			
			if (!article)
				break;
			cpt++;
			article = article.innerHTML.toLowerCase();
			// console.log(article);
			// var reg = new RegExp("é", "g");
			// article = article.replace(reg, "e");
			
			if (article.indexOf(entreprise) < 0) {
				document.getElementById("article"+i).classList.add("hidden");
				cpt--;
			} else {
				document.getElementById("article"+i).className = "col-xs-12";
			}
		} else {
			article = document.getElementById("article"+i);
			
			if (!article)
				break;
			article = article.className;
			
			if (article.indexOf("hidden") >= 0) {
				document.getElementById("article"+i).className = "col-xs-12";
				cpt--;
			}
		}
		i++;
		// console.log(cpt);
		
		if (entreprise != mem_ent) {
			if (cpt == 0) {
				document.getElementById("article_fin").className = "col-xs-12";
			} else {
				document.getElementById("article_fin").classList.add("hidden");
			}
		}
	}
	entreprise = mem_ent;
}

pri.load_art = function () {
	// Création d'un objet contenant les données
    var data = {act: "chargement_articles"};
	client.post(data, pri.load_articles_back);
};

pri.load_articles_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		var articles = JSON.parse(this.responseText);
		var output = "";
		var color = "";
		articles = articles.resp;
		if (typeof articles == "object") {
			for(i in articles){
				if (articles[i].note >= 1) {
					color = 'positif';
				} else if (articles[i].note <= (-1)) {
					color = 'negatif';
				} else {
					color = 'alert-active';
				}
				
				if (articles[i].image) {
					image = articles[i].image.url;
				} else if (!(articles[i].image)) {
					image = "../images/NotFound.jpg";
				}
				
				output +=	'<div id="article'+i+'" class="col-xs-12" style="padding-right:0px;">' +
								'<div class="hidden">'+(articles[i].societe).toLowerCase()+'</div>'+
								'<div class="row accordion-toggle '+color+'" data-toggle="collapse" data-target="#collapse'+i+'" style="margin:0px;">'+
									'<div class="col-xs-3" style="width:80px; padding:0px; margin:15px; margin-right:-15px;"><img src="'+image+'" width=50 height=50></div>'+
									'<div class="col-xs-9" style="padding:0px; margin-top:10px; margin-right:10px;"><small><font color="MediumBlue">'+articles[i].titre+'</font></small></div>' +
								'</div>' +
								'<hr/ style="margin:0px;">' +
								'<div class="row">'+
									'<div id="collapse'+i+'" class="col-xs-12 accordian-body collapse container-fluid" style="text-align:justify; margin:5px; padding-right:30px; padding-left:20px;" onmouseover="this.style.cursor=\'default\'">'+
										'<small><font color="#AAA">'+(articles[i].date).substring(0,10)+
										'</font><br/>'+articles[i].description+'<br/>'+
										'<a href="'+articles[i].lien+'" target="_blank" onmouseover="this.style.cursor=\'pointer\'"><font color="Orchid">Lire l\'article</font></a></small>'+
										'<hr/ style="margin-top:6px; margin-bottom:-5px;">' +
									'</div>'+
								'</div>' +
							'</div>';
			}
			
			output += '<div class="hidden" id="article_fin" class="col-xs-12" style="margin:10px;" onmouseover="this.style.cursor=\'default\'">' +
							'<div style="margin:0px;">'+
								'<div class="col-xs-12" style="padding:0px; margin-top:10px; margin-right:10px;"><small>Aucun article correspondant</small></div>' +
							'</div>' +
						'</div>';
			
			document.getElementById('articles').innerHTML = output;
		} else if (articles == "log out") {
			window.location.assign("/acceuil.html");
		} else if (articles == "no result") {
			alert("Aucun article correspondant");
		} else {
			alert("Les articles n'ont pas pu être rafraichis");
		}
		pri.background_color();
	}
};

/* Propriété CSS */
pri.background_color = function () {
	var success = document.getElementsByClassName("positif");
	for (a in success) {
		success[a].onmouseover = function () { this.style.background  = "#b2dba1";};
		success[a].onmouseout = function () { this.style.background  = "#d6e9c6";};
	}
	var danger = document.getElementsByClassName("negatif");
	for (a in danger) {
		danger[a].onmouseover = function () { this.style.background  = "#e7c3c3";};
		danger[a].onmouseout = function () { this.style.background  = "#f2dede";};
	}
	var active = document.getElementsByClassName("alert-active");
	for (a in active) {
		active[a].onmouseover = function () { this.style.background  = "#d9edf7";};
		active[a].onmouseout = function () { this.style.background  = "#fff";};
	}
};

pri.load_ents = function() {
	// Création d'un objet contenant les données
    var data = {act: "chargement_entreprises"};
	client.post(data, pri.load_ents_back);
};

pri.load_ents_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		// alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		var tab = [];
		for (i in r.resp.nom) {
			tab[i] = (r.resp.nom[i].name);
		}
		tab = tab.sort();
		var output = "";
		if (r.resp) {
			output += '<span onmouseover="this.style.cursor=\'pointer\'"><big><font color="SteelBlue"><li class="courbe_societe" style="line-height:15px;">CAC 40</li></font></big></span><br/>';
			for(i in tab) {
				output += '<span onmouseover="this.style.cursor=\'pointer\'"><small><font color="SteelBlue"><li class="courbe_societe" style="line-height:15px;">'+tab[i]+'</li></font></small></span><br/>';
			}
			
			document.getElementById('aff_ents').innerHTML = output;
		} else {
			alert("Les entreprises n'ont pas pu être chargées");
		}
	}
};

pri.load_courbe = function() {
	// console.log("----" + pri.name_ent);
	var data = {};
	
	if (pri.name_ent == "CAC 40") {
		data = {act: "chargement_courbe"};
	} else {
		// Création d'un objet contenant les données
		data = {act: "chargement_courbe", search: pri.name_ent};
	}
	client.post(data, pri.load_courbe_back);
};

/* Fonction d'affichage de la courbe */
pri.load_courbe_back = function() {
	if (this.readyState == 4 && this.status == 200) {
		//alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		
		// console.log(r.resp);
		
		if (typeof r.resp == "object") {
			pri.donnes_courbe = r.resp;
			pri.tps = pri.donnes_courbe.output.length - 1;
			pri.affichage_courbe();
			pri.affichage_chiffres();
		} else if (r.resp == "log out") {
			window.location.assign("/acceuil.html");
		} else {
			pri.load_courbe();
			console.log("Les chiffres n'ont pas pu être chargés");
		}
	}
};

pri.affichage_chiffres = function () {
	var output = "";
	var color = "";
	var signe = "";
	var date = "";
	var variation = parseFloat(pri.donnes_courbe.variation);
	
	variation = Math.round(variation * 100)/100;
				
	if (variation >= 0) {
		variation = variation.toString().substring(0,4);
		color = 'LimeGreen';
		signe = '+ ';
	} else {
		variation = variation.toString().substring(1,5);
		color = 'rgb(244, 91, 91)';
		signe = '- ';
	}
	
	variation = variation.toString().substring(0,4);
	
	if (variation.length == 3) {
		variation += '0';
	} else if (variation.length == 1) {
		variation += '.00';
	}
	
	output ='<span style="padding:20px;"><strong>'+pri.date+'</strong></span>' +
			'<hr style="margin-top:10px"/>' +
				'<strong>Cours<big class="pull-right" style="margin-top:-2px;">'+pri.donnes_courbe.coursActuel+'</big></strong><br/><br/>' +
				'<strong>Variation<big class="pull-right"  style="margin-top:-2px; color:'+color+';">'+signe+variation+'%</big></strong><br/>' +
			'<hr/>' +
			'<span>Ouverture<span class="pull-right">'+pri.donnes_courbe.ouverture+'</span></span><br/>' +
			'<span>+ HAUT<span class="pull-right"><font color="MediumSeaGreen">'+pri.donnes_courbe.plusHaut+'</font></span></span><br/>' +
			'<span>+ BAS<span class="pull-right"><font color="Tomato">'+pri.donnes_courbe.plusBas+'</font></span></span><br/>' +
			'<span>Clôture préc.<span class="pull-right">'+pri.donnes_courbe.cloture+'</span></span>';
			
	document.getElementById('aff_chiffres').innerHTML = output;
};

pri.tps_courbe = function(demande) {
	if (demande == "Jour") {
		pri.tps = pri.donnes_courbe.output.length - 1;
	} else if (demande == "Semaine") {
		pri.tps = pri.donnes_courbe.output.length - 5;
	} else {
		pri.tps = pri.donnes_courbe.output.length - 23;
	}
	pri.affichage_courbe();
};

pri.affichage_courbe = function () {
	var output = {};
	output.name = "Cours";
	output.data = new Array();
	var date = [];
	var cpt = 0;
	
	if (pri.tps < 0) {
		pri.tps = 0;
	}
	
	// Traitement affichage courbe
	for (i = pri.tps; i < pri.donnes_courbe.output.length; i++) {
		var tempo = JSON.parse(pri.donnes_courbe.output[i]);
		
		for (j in tempo) {
			var tempo2 = tempo[j];
			var tmp = new Date(tempo2[0]);
			
			if (tmp.getMinutes() < 10) {
				date.push((tmp.toDateString()).substring(0,3)+" "+tmp.getDate()+" "+tmp.getHours()+":0"+tmp.getMinutes());
			} else {
				date.push((tmp.toDateString()).substring(0,3)+" "+tmp.getDate()+" "+tmp.getHours()+":"+tmp.getMinutes());
			}
			output.data.push(tempo2[1]);	
		}
	}
	
	pri.date = date[date.length - 1];

	$(function () {
		var highchartsOptions = Highcharts.setOptions(Highcharts.theme1);
		var chart = new Highcharts.Chart(Highcharts.merge(theme1, {
			chart: {
				renderTo: 'courbe',
				type : 'area',
				zoomType : 'x'
			},
			title: {
				text: pri.name_ent
			},
			subtitle: {
				text: document.ontouchstart === undefined ?
					'Cliquez et glissez pour zoomer' :
					'Pincez pour zoomer'
			},
			xAxis: {
				lineColor: 'transparent',
				labels: {
					enabled: false
				},
				tickLength: 0,
				tickInterval:10000000,
				categories : date
			},
			yAxis: {
				title: {
					text: 'Cours'
				}
			},
			tooltip: {
				shared: true
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				area: {
					fillColor: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
						stops: [
							[0, Highcharts.getOptions().colors[0]],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					lineWidth: 1,
					marker: {
						enabled: false
					},
					shadow: false,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				}
			},	 
			series: [output]
		}))
	});
};
	
pri.logique = function() {
	if (pri.name_ent != "CAC 40") {
		// Création d'un objet contenant les données
		var data = {act: "logique_flou", search: pri.name_ent};
		client.post(data, pri.logique_back);
	} else if (pri.name_ent == "CAC 40" || pri.name_ent == ""){ //-----------------------------------------------------------------------------------------------------
		var data = {act: "logique_flou", search: "Alstom SA"};
		client.post(data, pri.logique_back);
	}
};

pri.logique_back = function() {
	if (this.readyState == 4 && this.status == 200) {
		// alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		
		var prev_mont = "";
		var tps = "Journée";
		// var traitment = r.resp;
		var output = "";
		var tmp = 0;
		
		 // console.log(r.resp);
		// console.log(r.resp.jour);
		// console.log(r.resp.semaine);
		
		if (r.resp) {
			for (j in r.resp) {
			 // console.log(j);
				traitment = r.resp[j].r.jour;
				output +='<div class="col-xs-12" style="padding:0px; padding-bottom:5px;">' +
							'<div class="col-xs-3" style="padding-right:0px;"><small><strong><font color="blue">'+j+'</font></strong></small></div>'+
							'<div class="col-xs-5">';

				// console.log(r.resp[j].r.jour);
				// console.log(r.resp[j].r.semaine);
				
				for (var i = 0; i < 2; i++) {
					// console.log(typeof traitment.s);
					if (traitment.s == 1) {
						prev_mont = '<strong><font color="green">Croissance</font></strong>';
					} else if (traitment.s == -1) {
						prev_mont = '<strong><font color="red">Déroissance</font></strong>';
					} else {
						prev_mont = '<strong><font color="blue">Stabilité</font></strong>';
					}
					
					tmp = Math.round((traitment.p * 100) / 100);
					
					output += '<small>'+tps+' : '+prev_mont+" certitude "+tmp+'%.</small><br/>';
					
					traitment = r.resp[j].r.semaine;
					tps = "Semaine";
				}
				
				output += '</div>' +
								'<div id="investir1'+j+'" class="btn-group col-xs-2" style="padding:0px; padding-top:14px;">' +
									'<div class="btn btn-default btn-xs dropdown-toggle pull-left" type="button" data-toggle="dropdown">' +
										'Acheter <span class="caret"></span>' +
									'</div>' +
									'<ul class="dropdown-menu" style="padding:0px;">' +
										'<div style="padding:5px;">' +
											'<div class="input-group">' +
											  '<input id="cache_achat_'+j+'" class="form-control"  placeholder="nbr de titres" onkeyup="this.value=this.value.replace(/[^0-9]/ig, \'\');">' +
											  '<span class="input-group-btn">' +
												'<div id="'+j+'" class="achat_ok btn btn-default">Ok</div>' +
											  '</span>' +
											'</div>' +
										'</div>' +
									'</ul>' +
								'</div>' +
								'<div id="investir2'+j+'" class="btn-group col-xs-2" style="padding:0px; padding-top:14px;">' +
									'<div class="btn btn-default btn-xs dropdown-toggle pull-left" type="button" data-toggle="dropdown">' +
										'Vendre <span class="caret"></span>' +
									'</div>' +
									'<ul class="dropdown-menu" style="padding:0px;">' +
										'<div style="padding:5px;">' +
											'<div class="input-group">' +
											  '<input id="cache_vente_'+j+'" class="form-control"  placeholder="nbr de titres" onkeyup="this.value=this.value.replace(/[^0-9]/ig, \'\');">' +
											  '<span class="input-group-btn">' +
												'<div id="'+j+'" class="vente_ok btn btn-default">Ok</div>' +
											  '</span>' +
											'</div>' +
										'</div>' +
									'</ul>' +
								'</div>' +
						'</div><hr/ style="margin-top:10px; margin-bottom:0px;"><hr/>';
			}

			document.getElementById('logique').innerHTML = output;
			
			for (k in r.resp) {
				if (pri.mem_portefeuille == "not exist") {
					document.getElementById("investir1"+k).classList.add("hidden");
					document.getElementById("investir2"+k).classList.add("hidden");
				} else {
					document.getElementById("cache_achat_"+k).onclick = function (ev) {ev.stopPropagation();};
					document.getElementById("cache_vente_"+k).onclick = function (ev) {ev.stopPropagation();};
				}
			}
		} else {
			output = '<p>Affichage des suggestions impossible</p>'
		}
	}
};

pri.portefeuille = function (action, entreprise) {
	var data = {};
	var b = "";
	
	if (action == "achat") {
		b = document.getElementById("cache_achat_"+entreprise).value;
	} else if (action == "vente") {
		b = document.getElementById("cache_vente_"+entreprise).value;
	}
	
	data = {act: "ecriture_portefeuille", search: action, ent: entreprise, quant: b};
	client.post(data, pri.portefeuille_back);
};

pri.portefeuille_back = function() {
	if (this.readyState == 4 && this.status == 200) {
		// alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		
		if (typeof r.resp == "object") {
			var output = "";
			var output2 = "";
			pri.mem_portefeuille = r.resp.info;
		
			// console.log(r.resp);
			// console.log(r.resp.value);
			// console.log(typeof r.resp.value.entreprise["Gemalto"][1])
			
			if (pri.mem_portefeuille == "exist") {
				if (r.resp.value.entreprise) {
					var data = [];
				
					output = '<table class="table table-hover" style="margin-top:-5px;">' +
								'<tr onmouseover="this.style.cursor=\'default\'">' +
									'<th><small>Société</small></th>' +
									'<th title="Votre nombre d\'actions dans cette société"><small>Actions</small></th>' +
									'<th title="Cotation actuelle du titre"><small>Valeur</small></th>' +
									'<th title="Votre investissement, bénéfices des actions vendues déduits"><small>Coût</small></th>' +
									'<th class="text-right"><small>Profits / Pertes</small></th>' +
								'</tr>';
								
					for(i in r.resp.value.entreprise) {
						if (parseFloat(r.resp.value.entreprise[i][1]) > 0) {
							var temp = [];
							var profit = Math.round(((parseFloat(r.resp.value.entreprise[i][1]) * parseFloat(r.resp.value.entreprise[i][2])) - parseFloat(r.resp.value.entreprise[i][3])) * 100)/100;
							
							output +='<tr>' +
										'<td><small><font color="blue">'+r.resp.value.entreprise[i][0]+'</font></small></td>' +
										'<td><small>'+r.resp.value.entreprise[i][1]+'</small></td>' +
										'<td><small>'+r.resp.value.entreprise[i][2]+'</small></td>' +
										'<td><small>'+r.resp.value.entreprise[i][3]+'</small></td>' +
										'<td class="text-right"><strong><small>'+profit+'</small></strong></td>' +
									'</tr>';
									
							temp = [r.resp.value.entreprise[i][0], parseFloat(r.resp.value.entreprise[i][3])];
							data.push(temp);
						}
					}
					
					output += '</table>';
								
					output2 = '<div style="margin-left:10px;">' +
									'<br/><br/><strong><small>Argent non placé : '+r.resp.value.argent+' euros</small></strong><br/><br/>' +
								'</div>';
								
					// Appel cammenbert
					pri.cammenbert(data);
					
				} else {
					output2 ='<div style="margin-left:10px;">' +
								'<br/><br/><strong><small>Argent non placé : '+r.resp.value.argent+' euros</small></strong><br/><br/>' +
							'</div>';
				}
						
			} else if (pri.mem_portefeuille == "create") {
				alert("Votre portefeuille d'actions est créer et un budget de 20000 euros vous est alloué. Bon jeu!");
				window.location.assign("/principale.html");
			} else {
				output = '<div class="création btn btn-primary btn-sm" style="margin-top:-151px; margin-left:222px;">Je créer mon portefeuille</div>';
			}
			
			document.getElementById("portefeuille").innerHTML = output;
			document.getElementById("argent").innerHTML = output2;
		
		} else if (r.resp == "pas possible") {
			alert("Vous ne disposez pas d'autant de titres dans cette société");
		} else if (r.resp == "pas assez d'argent") {
			alert("Vous ne disposez pas d'autant d'argent");
		} else if (r.resp == "log out") {
			window.location.assign("/acceuil.html");
		} else {
			alert("Un problème est survenu lors du chargement du portefeuille");
		}
		
	}
};

/* Fonction d'affichage cammembert Portefeuille */
pri.cammenbert = function (donnees) {
	$(function () {
		var chart;
		
		$(document).ready(function () {
			
			// Build the chart
			$('#cammenbert').highcharts({
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				title: {
					text:''
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				plotOptions: {
					pie: {
						cursor: 'default',
						dataLabels: {
							enabled: false
						},
					}
				},
				series: [{
					type: 'pie',
					name: 'Argent placé',
					data: donnees
				}]
			});
		});   
	});
};


window.onload = function () {
    setTimeout(pri.init, 1);
};
