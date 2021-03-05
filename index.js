const center = { lat: 48.44658162815497, lng: 8.611278804068808 };
let pos;
let map;
let infoWindow;
let markers = new Map();

function initMap() { 

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: center,
  });
  
  // Klick auf Karte
  map.addListener("click", (mapsMouseEvent) => {

    // Info-Fenster schliessen
	if(infoWindow) {
      infoWindow.close();
	  infowindow = null;
	}  
  
	pos = mapsMouseEvent.latLng;  
	
	// Aktionen aus dem DropDown
	let options = document.getElementById("action").options;
	  
    if (options.selectedIndex === 0) {
		
		// Info-Fenster
		infoWindow = new google.maps.InfoWindow({
		  position: mapsMouseEvent.latLng,
		}); 
		
		infoWindow.setContent("<p>" + JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2) + "</p>" );
		infoWindow.open(map);
		
	} else {
		
		addMarker(options.item(options.selectedIndex), mapsMouseEvent.latLng, "lime");
		
	}
  });

  // Default Marker: Zentrum der "Baustelle"
  new google.maps.Marker({
    position: center,
    title:"Baustelle",
	map,
	icon: { 
		path: google.maps.SymbolPath.CIRCLE,
		scale: 7,
		strokeWeight: 3,
		fillColor: "lightblue",
		strokeColor: "grey",
		fillOpacity: 1,
		},
    });
  
	// Styling der dazugeladenen GeoJSON Daten (Strecken und Kilometer)
	map.data.setStyle(function(feature) {
		
		var km_l = feature.getProperty('km_l');
		if (km_l) {
			return {
			  title: km_l,
			};		
		}
		
		var strecke_nr = feature.getProperty('strecke_nr');
			if (strecke_nr) {
			return {
			  strokeColor: 'red'
			};		
		}
	});
	
}

function load(path) {
	if (path != "") {
		map.data.loadGeoJson(path);	
	}	
}

function addMarker(option, position, statusColor) {
	
	var marker = new google.maps.Marker({
    position: position,
    title: option.getAttribute('title'),
	icon: { 
		path: parseInt(option.getAttribute('path'),10),
		scale: parseInt(option.getAttribute('scale'),10),
		strokeWeight: parseInt(option.getAttribute('strokeWeight'),10),
		strokeColor: option.getAttribute('strokeColor'),
		fillColor: statusColor,
		rotation: parseInt(option.getAttribute('rotation'),10),
		fillOpacity: 1,
		},
    });
	
	marker.setMap(map);	
	
	listener = google.maps.event.addListenerOnce(marker, 'click', removeMarker);	
	markers.set(marker, { marker, listener, option });	
}

function removeMarker() {
	markers.delete(this);
	this.setMap(null);
}

function toggleColor() {	
	const values = [];
	markers.forEach((v) => { values.push(v) });	
	values.forEach((v) => { toggleMarkerColor(v);});	
}

function toggleMarkerColor(value) {
	
	google.maps.event.removeListener(value.listener)
	value.marker.setMap(null);
    markers.delete(value.marker);
	
	var statusColor = (value.marker.icon.fillColor === "lime") ? "red" : "lime";
		
	addMarker(value.option, value.marker.position, statusColor);	
}

function addScript(apiKey, removeElementId) {
	
	// Create the google maps api url with api-key dynmaically
	var script = document.createElement("SCRIPT");
	script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=initMap&libraries=&v=weekly";
	script.async = true;
		
	document.body.appendChild(script);  // Async script executes immediately and must be after any DOM elements used in callback
										// Deshalb body "append"
											
	var elem = document.getElementById(removeElementId);
	if (elem) {
		elem.parentNode.removeChild(elem);
	}

}
