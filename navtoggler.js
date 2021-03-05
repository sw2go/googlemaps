(function() {

  var hamburger = {
    navToggle: document.querySelector('.nav-toggle'),
    nav: document.querySelector('.nav'),

    doToggle: function(e) {
      e.preventDefault();
      this.navToggle.classList.toggle('expanded');
      this.nav.classList.toggle('expanded');
    }
  };

  hamburger.navToggle.addEventListener('click', function(e) { hamburger.doToggle(e); });
  
  // einkommentieren wenn Klick in der Navigation das Menü sofort schliessen soll
  // hamburger.nav.addEventListener('click', function(e) { hamburger.doToggle(e); });

}());