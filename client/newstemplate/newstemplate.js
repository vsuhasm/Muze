function getnews(userloc) {

  var GoogleNews, googleNews, track;

  GoogleNews = Meteor.npmRequire('google-news');
  googleNews = new GoogleNews();

  track = userloc;

  googleNews.stream(track, function(stream) {

  var newsItemNum = 0;  
    stream.on(GoogleNews.DATA, Meteor.bindEnvironment(function(data) {
      newsItemNum++;
      return Meteor.call('getNews', data.title, data.link, data.description, newsItemNum); 
    }));

    stream.on(GoogleNews.ERROR, Meteor.bindEnvironment(function(error) {
      return console.log('Error Event received... ' + error);
    }));
  });

}



if (Meteor.isClient) {

  function getLocation() {
    navigator.geolocation.getCurrentPosition(showPosition);
  
    function showPosition(position, loca) {
      var lat = position.coords.latitude; 
      var longi = position.coords.longitude;
      var geocoder = new google.maps.Geocoder;
      geocodeLatLng(geocoder, lat, longi); 
    }

    function geocodeLatLng(geocoder, latitude, longitude) {
      //var input = document.getElementById('latlng').value;
      //var latlngStr = input.split(',', 2);
      var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
      geocoder.geocode({'location': latlng}, function(results, status) {
        
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            
            var loclen = results.length;
            var loca = results[loclen-3].formatted_address.toString();
            //var loc = document.getElementById('location');
            //Session.set("location", loca);
            Meteor.call('getLocation', loca);
            
            //loc.innerHTML = results[loclen-3].formatted_address;
            //alert(loca);

          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    }
  }

  

  Meteor.startup(function () {
      getElementById('hoverlink').popover();
      GoogleMaps.load();
      getLocation();
      //Meteor.call("getLocation", loc);

  });

  Template.newstemplate.helpers({
    news: function () {
        return News.find({}, {sort: [["_id","asc"]], limit: 10});
    }
  });
}

if (Meteor.isServer) {
  Meteor.methods({

    getLocation: function(userloc) {
      //console.log(userloc);
      Locations.update({}, 
      {
        $set: {
          location: userloc 
        }
      }, {upsert: true});
    },

    getNews: function(title, link, description, itemnum) {
      News.update({
        _id: itemnum
      }, 
      {
        $set: {
          title: title,
          link: link,
          description: description
        }
      }, {upsert: true});
    }
  });

  var id = Locations.findOne({});
  if (id) {
    getnews(id.location);
  }
}
