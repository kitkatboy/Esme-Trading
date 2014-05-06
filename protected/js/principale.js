var pri = {};
pri.tps = 0;
pri.name_ent = "CAC 40";
pri.donnes_courbe = [];
pri.interv_search;


/* Script sur action "click" */
pri.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", pri.on_click);
	pri.load_art();
	pri.load_ents();
	pri.load_courbe();
	
	// Recherche dynamique par chaîne de caractères dans les articles
	document.getElementById("search").onfocus = function (){pri.interv_search = setInterval(pri.search, 10);};
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
		pri.load_courbe();
		
		if (pri.name_ent) {
			pri.logique();
		}
	} else if (src.has_class("raf_actu")) {
		// Rafraichissement du flux d'actualité
		pri.load_art()
	} else if (src.has_class("tps_courbe")) {
		pri.tps_courbe(src.innerHTML);
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

pri.search = function () {
	var i = 0;
	var entreprise = document.getElementsByClassName("entreprise")[0].value.toLowerCase();
	var article = document.getElementById("article"+i);
	// setInterval(console.log(entreprise),1);
	
	while (article) {
		if (entreprise) {
			article = document.getElementById("article"+i);
			
			if (!article)
				break;
			article = article.innerHTML.toLowerCase();
			
			if (article.indexOf(entreprise) < 0) {
				document.getElementById("article"+i).classList.add("hidden");
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
			}
		}
		i++
	}
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
				
				output +=	'<div id="article'+i+'" class="col-xs-12" style="padding-right:0px";>' +
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
			document.getElementById('articles').innerHTML = output;
		} else if (articles == "log out") {
			window.location.assign("/acceuil.html");
		} else if (articles == "no result") {
			alert("Aucun article correspondant");
		} else {
			alert("Les articles n'ont pas pu être rafraichis");
		}
		background_color();
	}
};

/* Propriété CSS */
var background_color = function () {
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
		// console.log(r.resp.nom[0]);
		for (i in r.resp.nom) {
			// console.log(r.resp.nom[i].name);
			tab[i] = (r.resp.nom[i].name);
		}
		tab = tab.sort();
		console.log(tab);
		var output = "";
		// var tmp = "";
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
		
		if (typeof r.resp == "object") {
			pri.donnes_courbe = r.resp;
			pri.tps = 1;
			pri.affichage_courbe();
		} else if (r.resp == "log out") {
			window.location.assign("/acceuil.html");
		} else {
			pri.load_courbe();
			console.log("Les chiffres n'ont pas pu être chargés");
		}
	}
};

pri.tps_courbe = function(demande) {
	if (demande == "Jour") {
		pri.tps = 1;
	} else if (demande == "Semaine") {
		pri.tps = 7;
	} else {
		pri.tps = 30;
	}
	pri.affichage_courbe();
};

pri.affichage_courbe = function () {
	var output = [];
	
	if (pri.tps >= pri.donnes_courbe.length) {
		pri.tps = pri.donnes_courbe.length;
	}
	
	for(var i = 0; i < pri.tps; i++)
	{
		output[i] = {};
		output[i].type = 'area';
		output[i].data = new Array();
		tmp = JSON.parse(pri.donnes_courbe[i]);
		for (j in tmp) {
			output[i].data.push(tmp[j]);
		}
	}
	
	$(function () {
		var highchartsOptions = Highcharts.setOptions(Highcharts.theme1);
		$('#courbe').highcharts({
			chart: {
				zoomType: 'x',
				spacingRight: 20
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
				type: 'datetime',
				maxZoom: 5 * 60 * 1000, // cinq minutes
				title: {
					text: null
				}
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

			series: output
		});
	});
};

pri.logique = function() {
	if (pri.name_ent != "CAC 40") {
		// Création d'un objet contenant les données
		var data = {act: "logique_flou", search: pri.name_ent};
		client.post(data, pri.logique_back);
	}
};

pri.logique_back = function() {
	if (this.readyState == 4 && this.status == 200) {
		// alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		console.log(r.resp.jour);
		console.log(r.resp.semaine);
		
		/*
		<p><font color="green">pri.name_ent : </font></p>
		<p><font color="blue">Prévision à la journée : </font>Investissez dans cette société.</p>
		<p><font color="blue">Prévision à la semaine : </font>Vendez vos actions de cette société.</p>
			*/		
					
					
		/*
		var output = "";
		var tmp = "";
		if (r.resp) {
			for(i in r.resp.nom) {
				output += '<span onmouseover="this.style.cursor=\'pointer\'"><small><font color="SteelBlue"><li class="courbe_societe" style="line-height:15px;">'+r.resp.nom[i].name+'</li></font></small></span><br/>';
			}
			
			document.getElementById('logique').innerHTML = output;
		} else {
			alert("Les entreprises n'ont pas pu être chargées");
		}*/
	}
};

/* Fonction d'affichage cammembert Portefeuille */
$(function () {
    	
	// Make monochrome colors and set them as default for all pies
	Highcharts.getOptions().plotOptions.pie.colors = (function () {
		var colors = [],
			base = Highcharts.getOptions().colors[0],
			i

		for (i = 0; i < 10; i++) {
			// Start out with a darkened base color (negative brighten), and end
			// up with a much brighter color
			colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
		}
		return colors;
	}());
	
	// Build the chart
	$('#cammembert').highcharts({
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false
		},
		title: {
			text: ''
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					}
				}
			}
		},
		series: [{
			type: 'pie',
			name: 'Browser share',
			data: [
				['Firefox',   45.0],
				['IE',       26.8],
				{
					name: 'Chrome',
					y: 12.8,
					sliced: true,
					selected: true
				},
				['Safari',    8.5],
				['Opera',     6.2],
				['Others',   0.7]
			]
		}]
	});
});
    

	
window.onload = function () {
    setTimeout(pri.init, 1);
};
