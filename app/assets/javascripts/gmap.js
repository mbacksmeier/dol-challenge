var MapView = {

  init: function() {
    var mapOptions = {
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: style,
        disableDefaultUI: true,
        scaleControlOptions: {
      }
    };

    this.markers = [];
    this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    // set map center
    this.setUserLocation();
    var that = this;

    google.maps.event.addListener(this.map, 'idle', function() {
      that.getCompanies();
    });
  },

  getCompanies: function() {
    var bounds = this.getTheBounds();
    var that = this;
    $.get('/companies/data', bounds, function(response) {
      console.log("Clearing companies and rendering new ones!");
      that.clearMapMarkers();
      for (var i=0; i < response.length; i++) {
        var company = $.parseJSON( response[i] );
        that.markers.push(that.renderMarker(company));
      }
      that.startMarkerManager();
    });

  },

  renderMarker: function(company) {
    var that = this;
    var customPin = '/assets/markerRed.png';
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(company["latitude"], company["longitude"]),
      icon: customPin,
      map: that.map
    });

    google.maps.event.addListener(marker, 'click', function() {
      if (that.oldMarker !== undefined) {
        that.oldMarker.setIcon('/assets/markerRed.png');
      }
      that.activeMarker = marker;
      that.activeMarker.setIcon('/assets/marker2.png');
      that.oldMarker = that.activeMarker;
      that.openSideBar(company);
    });
    return marker;
  },

  clearMapMarkers: function() {
    var that = this;
      if(that.markers && that.markers.length !== 0){
      for(var i = 0; i < that.markers.length; ++i){
          that.markers[i].setMap(null);
      }
    }
   that.markers = [];
  },

  openSideBar: function(company) {
    var that = this;
    var companyData = that.renderSideBar(company);
    $("#biz-info").children().remove();
    $("#biz-info").append(companyData);
  },

  renderSideBar: function(company) {
    return $("<h3>" + company["trade_name"] + "</h3>" +
             "<h3>" + company["letter_grade"] + "</h3>" +
             "<span class='fade'>" + company["street"] + "<br/>" + company["city"] + ", " + company["state"] + " " + company["zip"] + "</span>" +
             "<p>... has " + company["flsa_cl_violtn_count"] + " child labor violations.</p>" +
             "<p>...has paid $" + company["flsa_ot_bw_atp_amt"] + " dollars for violating overtime laws</p>" +
             "<a href='/companies/" + company['id'] + "' alt='" + company['trade_name'] + "'>" + company['trade_name'] + "</a>")
  },

  getTheBounds: function() {
    var bounds = this.map.getBounds();

    var neLat = this.map.getBounds().getNorthEast().lat();
    var neLng = this.map.getBounds().getNorthEast().lng();
    var seLat = this.map.getBounds().getSouthWest().lat();
    var seLng = this.map.getBounds().getSouthWest().lng();
    var centerLat = this.map.getCenter().lat();
    var centerLng = this.map.getCenter().lng();

    return {ne: {lat: neLat, lng: neLng}, sw: {lat: seLat, lng: seLng}, center: {lat: centerLat, lng: centerLng} };
  },
  setUserLocation: function() {
    var that = this;
    if(navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        that.map.setCenter(initialLocation);
      }, function() {
        handleNoGeolocation(browserSupportFlag);
      });
    }
  // Browser doesn't support Geolocation
    else {
      browserSupportFlag = false;
      handleNoGeolocation(browserSupportFlag);
    }
  },
  handleNoGeoLocation: function(errorFlag) {
    if (errorFlag === true) {
      alert("Geolocation service failed.");
    } else {
      alert("Your browser doesn't support geolocation.");
    }
  }
};

$(document).ready(function(){
  myTabs(); //Tabs MUST be called within this document.ready
  stateOnClick();
});

