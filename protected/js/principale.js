var pri = {};
pri.interv_search;


/* Script sur action "click" */
pri.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", pri.on_click);
	pri.load_art();
	pri.load_ents();
	pri.load_courbe();
	document.getElementById("search").onfocus = function (){pri.interv_search = setInterval(pri.search, 10);};
	document.getElementById("search").onblur = function () {clearInterval(pri.interv_search)};
};

pri.on_click = function (ev) {
	// .target désigne la cible(le noeud DOM) concerné par le chang. d'état sur événement "click" (ici balises <div>)
    var src = ev.target;
	if (src.has_class("post1")) {
		pri.send_post1();
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
	
	while (article) {
		if (entreprise) {
			article = document.getElementById("article"+i);
			
			if (!article)
				break;
			article = article.innerHTML;
			
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
	/*var entreprise = document.getElementsByClassName("entreprise")[0].value;*/
	
	// Création d'un objet contenant les données
    var data = {act: "chargement_articles"/*, search: entreprise*/};
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
	//var entreprise = document.getElementsByClassName("entreprise")[0].value;
	
	// Création d'un objet contenant les données
    var data = {act: "chargement_entreprises"/*, search: entreprise*/};
	client.post(data, pri.load_ents_back);
};

pri.load_ents_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		//alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		if (r.resp) {
			document.getElementById('aff_ents').innerHTML = r.resp;
		} else {
			alert("Les entreprises n'ont pas pu être chargées");
		}
	}
};

pri.load_courbe = function() {
	//var entreprise = document.getElementsByClassName("entreprise")[0].value;
	
	// Création d'un objet contenant les données
    var data = {act: "chargement_courbe"/*, search: entreprise*/};
	client.post(data, pri.load_courbe_back);
};

/* Fonction d'affichage de la courbe */
pri.load_courbe_back = function() {

	if (this.readyState == 4 && this.status == 200) {
		//alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		if (r.resp && r.resp.date) {
			$(function () {
				var highchartsOptions = Highcharts.setOptions(Highcharts.theme1);
				$('#courbe').highcharts({
					chart: {
						zoomType: 'x',
						spacingRight: 20
					},
					title: {
						text: 'Cac 40'
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

					series: [{
						type: 'area',
						name: 'Cours',
						//pointInterval: 5 * 60 * 1000,
						//pointStart: Date.UTC(r.resp.date.annee, r.resp.date.mois, r.resp.date.jour),
						data: /*r.resp.valeurs*/ [
                    [Date.UTC(2014,  1,  01), 0.36   ],
                    [Date.UTC(2014,  2, 01), 0.15],
                    [Date.UTC(2014, 3, 01), 0.35],
                    [Date.UTC(2014, 8, 01), 0.46],
                    [Date.UTC(2014,  9, 01), 0.59]
                ]
					}]
				});
			});
		} else {
			if (!r.resp.date) {
				pri.load_courbe();
				console.log("Les chiffres n'ont pas pu être chargés");
			}
		}
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
