const posStart =     { lat: 47.24918511058598, lng: 7.96714970547165  };
const posBaustelle = { lat: 48.44549975058353, lng: 8.612035850681368 }; //{ lat: 48.44658162815497, lng: 8.611278804068808 };
let map;
let infoWindow;
let markers = new Map();

function displayInfo(latLng, html) {
	// Falls bereits vorhanden Info-Fenster schliessen
	if(infoWindow) {
      infoWindow.close();
	  infowindow = null;
	}
	infoWindow = new google.maps.InfoWindow();		
	infoWindow.setPosition(latLng);		
	infoWindow.setContent(html);
	infoWindow.open(map);
}


function initMap() { 

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: posStart,
  });
  
  // Klick auf Karte
  map.addListener("click", (mapsMouseEvent) => {

	// Aktionen aus dem DropDown
	let options = document.getElementById("action").options;
	  
    if (options.selectedIndex === 0) {	
		displayInfo(mapsMouseEvent.latLng, "lat='" + mapsMouseEvent.latLng.lat() + "' lng='" + mapsMouseEvent.latLng.lng() + "'");		
	} else {		
		addMarker(options.item(options.selectedIndex), mapsMouseEvent.latLng, "lime");		
	}
  });

  // Default Marker: Zentrum der "Baustelle"
  new google.maps.Marker({
    position: posBaustelle,
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
	
	// Click auf dazugeladene Daten
	map.data.addListener('click', function (event) {
		let html = '';
		for (let item of Object.entries(event.feature.i)) {
			html += item[0] + ": " + item[1] + "<br>" // output: properties key/value 			
		}		
		displayInfo(event.latLng, html);
	});


}


function panToOption(option) {
	
	switch(option.getAttribute('typ')) {
		
	  case "coord":
		panToLocation( parseFloat(option.getAttribute('lat')), parseFloat(option.getAttribute('lng')), parseInt(option.getAttribute('zoom')), option.text  );		
		break;
		
	  case "home":
		panToMyLocation( parseInt(option.getAttribute('zoom')), option.text );
		break;

	  default:
		break;
		
	}	
}


function panToLocation(lat, lng, zoom, text) {
	const pos = {
	  lat: lat,
	  lng: lng,
	};
	displayInfo(pos, text);
	map.setZoom(zoom);
    map.setCenter(pos);		
}

function panToMyLocation(zoom, text) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
		  panToLocation(position.coords.latitude, position.coords.longitude, zoom, text );
        },
        () => {
		  displayInfo(map.getCenter(), "Error: The Geolocation service failed.");
        }
      );
    } else {
      // Browser doesn't support Geolocation
	  displayInfo(map.getCenter(), "Error: Your browser doesn't support geolocation.");
    }
}


function loadData(path) {
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
	
	// Create the google maps api url with api-key dynamically
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
