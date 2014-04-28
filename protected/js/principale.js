var pri = {};

/* Script sur action "click" */
pri.init = function () {
	/* object.addEventListener (eventName, function, useCapture) */
    document.addEventListener("click", pri.on_click);
	pri.load_art();
	pri.load_ents();
	pri.load_courbe();
};

pri.on_click = function (ev) {
	// .target désigne la cible(le noeud DOM) concerné par le chang. d'état sur événement "click" (ici balises <div>)
    var src = ev.target;
	if (src.has_class("post1")) {
		pri.send_post1();
	} else if (src.has_class("search")) {
		pri.load_art();
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

pri.load_art = function() {
	var entreprise = document.getElementsByClassName("entreprise")[0].value;
	
	// Création d'un objet contenant les données
    var data = {act: "chargement_articles", search: entreprise};
	client.post(data, pri.load_articles_back);
};

pri.load_articles_back = function () {
	if (this.readyState == 4 && this.status == 200) {
		//alert("this : " + this.responseText);
		var r = JSON.parse(this.responseText);
		if (r.resp == "log out") {
			window.location.assign("/acceuil.html");
		} else if (r.resp == "no result") {
			alert("Aucun article correspondant");
		} else if (r.resp) {
			document.getElementById('articles').innerHTML = r.resp;
		} else {
			alert("Les articles n'ont pas pu être rafraichis");
		}
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
		if (r.resp) {
			$(function () {
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
						pointInterval: 5 * 60 * 1000,
						pointStart: Date.UTC(r.resp.date.annee, r.resp.date.mois, r.resp.date.jour),
						data: r.resp.valeurs
					}]
				});
			});
		} else {
			alert("Les chiffres n'ont pas pu être chargés");
		}
	}
};
	
window.onload = function () {
    setTimeout(pri.init, 1);
};
