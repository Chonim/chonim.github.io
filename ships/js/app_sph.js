var sph = {
  map: null,
  center: {lat: 36, lng: 125},
  marker: null,
  markerCluster: null,
  sailedPath: null,
  sailPlanPath: null,
  geodesic: true,
  portIcon: 'http://maps.google.com/mapfiles/kml/pal3/icon28.png',
  markerArray: [],
  infowindowArray: [],
  shipsArray: [],
  portsArray: [],
  allLinesArray: [],
  styleArray: style,
  lineSymbol: {
    path: 'M 0,-1 0,1',
    strokeColor: 'red',
    strokeOpacity: 1,
    scale: 4
  },
  initMap: function() {
    sph.markerArray = [];
    sph.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 2,
      center: sph.center,
      mapTypeControl: true,
      mapTypeId: 'terrain',
      rotateControl: true,
      streetViewControl: false,
      styles: this.styleArray, // 스타일 적용
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      scaleControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER,
        style: google.maps.MapTypeControlStyle.DEFAULT
      }
    });
    // 지도가 로딩되면 마커 생성 함수 호출
    this.showShipsMarkers();
  },
  addLegends: function() {
    var icons = {
      ship: {
        name: 'Ship',
        icon: 'http://maps.google.com/mapfiles/kml/pal2/icon13.png'
      },
      port: {
        name: 'Port',
        icon: 'http://maps.google.com/mapfiles/kml/pal3/icon28.png'
      }
    };

    var legend = document.getElementById('legend');
    for (var key in icons) {
      var type = icons[key];
      var name = type.name;
      var icon = type.icon;
      var div = document.createElement('div');
      div.className += " legend-container";
      div.innerHTML = '<img src="' + icon + '"> ' + name;
      // legend.appendChild(div);
      $('#legend').append(div);
    }
    sph.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
  },
  showShipsMarkers: function() {
    sph.shipsArray = ships_route.data;
    ships = ships_route;
    console.log(sph.shipsArray)
    var shipImage = {
      url: 'http://maps.google.com/mapfiles/kml/pal2/icon13.png'
    };
    for (var i in sph.shipsArray) {
      // 선박 마커 생성
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(sph.shipsArray[i].LAT, sph.shipsArray[i].LON),
        label: i,
        icon: shipImage,
        size: new google.maps.Size(2, 2),
        map: sph.map
      })

      // 항구 마커 생성
      var startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(sph.shipsArray[i].startLat, sph.shipsArray[i].startLon),
        icon: sph.portIcon,
        map: sph.map
      })
      var endMarker = new google.maps.Marker({
        position: new google.maps.LatLng(sph.shipsArray[i].endLat, sph.shipsArray[i].endLon),
        icon: sph.portIcon,
        map: sph.map
      })

      // 클러스터링, 항로 생성 등을 위해 배열에 담는다.
      sph.markerArray.push(marker);

      var infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', function(arg) {
        // 센터 변경
        sph.map.setCenter(this.position);

        // 인포윈도우 생성
        i = this.label;
        var contentString = '<p>경도: ' + sph.shipsArray[i].LON +'</p>' + '<p>위도: ' + sph.shipsArray[i].LAT + '</p>';
        contentString += '<p>ID: ' + sph.shipsArray[i].ID +'</p>';
        infowindow.setContent(contentString);

        // 운항경로 보여주는 라인 생성함수 호출
        sph.drawLine(this, this.label, sph.shipsArray);
        infowindow.open(sph.map, this);
      });
    };
  },
  // 마커 클러스터링
  enableMarkerCluster: function() {
    sph.initMap();
    var options = {
        imagePath: 'images/m'
    };
    if (typeof sph.markerCluster === 'undefined' || sph.markerCluster === null) {
      sph.markerCluster = new MarkerClusterer(sph.map, sph.markerArray, sph.options);
    } else {
      sph.markerCluster = null;
    };
  },
  clearPreviousPath: function() {
    // 기존에 그려진 경로가 있으면 삭제
    if (sph.sailedPath !== null) {
      sph.sailedPath.setMap(null);
      sph.sailPlanPath.setMap(null);
    }
  },
  drawLine: function(marker, index, shipsArray) {
    var i;
    var currentPosition = marker.position;
    var startCoords = {
      lat: parseFloat(ships.data[index].startLat),
      lng: parseFloat(ships.data[index].startLon)
    }
    var endCoords = {
      lat: parseFloat(ships.data[index].endLat),
      lng: parseFloat(ships.data[index].endLon)
    }

    // 이전 항구 배열에 넣기

    // 지나온 항로 생성
    var sailedCoordinates = [{lat: startCoords.lat, lng: startCoords.lng}];
    for (var leg in ships.data[index].PATH) {
      // console.log()
      var pathSplit = ships.data[index].PATH[leg].split(", ");
      var legLat = parseFloat(pathSplit[0]);
      var legLng = parseFloat(pathSplit[1]);
      sailedCoordinates.push({lat: legLat, lng: legLng});
    }
    sailedCoordinates.push({lat: currentPosition.lat(), lng: currentPosition.lng()});
    sph.sailedPath = new google.maps.Polyline({
      path: sailedCoordinates,
      geodesic: sph.geodesic,
      strokeColor: '#70db70',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    // 남은 항로 생성
    var sailPlanCoordinates = [
      {lat: currentPosition.lat(), lng: currentPosition.lng()},
      {lat: endCoords.lat,  lng: endCoords.lng}
    ];
    // 점선 표시를 위한 스타일링
    sph.sailPlanPath = new google.maps.Polyline({
      path: sailPlanCoordinates,
      strokeOpacity: 0,
      geodesic: sph.geodesic,
      icons: [{
        icon: sph.lineSymbol,
        offset: '0',
        repeat: '20px'
      }]
    });

    // 항로 지도에 표시
    sph.sailedPath.setMap(sph.map);
    sph.sailPlanPath.setMap(sph.map);
  },
  setMapOnAll: function() {
    for (var i = 0; i < sph.markerArray.length; i++) {
      sph.markerArray[i].setMap(sph.map);
    }
  },
  // 모든 경로들을 보여준다.
  showAllPaths: function() {
    if (init.markerCluster !== null) {
      init.markerCluster.clearMarkers();
      init.markerCluster = null;
    }
    sph.clearPreviousPath();
    var ships = ships_route;
    for (var i in sph.markerArray) {
      // 지나온 항로 생성
      console.log(sph.markerArray.length);
      var sailedCoordinates = [{lat: parseFloat(ships.data[i].startLat), lng: parseFloat(ships.data[i].startLon)}];
      for (var leg in ships.data[i].PATH) {
        var pathSplit = ships.data[i].PATH[leg].split(", ");
        var legLat = parseFloat(pathSplit[0]);
        var legLng = parseFloat(pathSplit[1]);
        sailedCoordinates.push({lat: legLat, lng: legLng});
      }
      sailedCoordinates.push({lat: sph.markerArray[i].position.lat(), lng: sph.markerArray[i].position.lng()});
      sph.sailedPath = new google.maps.Polyline({
        path: sailedCoordinates,
        geodesic: sph.geodesic,
        strokeColor: '#70db70',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      // 남은 항로 생성
      var sailPlanCoordinates = [
        {lat: sph.markerArray[i].position.lat(), lng: sph.markerArray[i].position.lng()},
        {lat: parseFloat(ships.data[i].endLat),  lng: parseFloat(ships.data[i].endLon)}
      ];
      // 점선 표시를 위한 스타일링
      sph.sailPlanPath = new google.maps.Polyline({
        path: sailPlanCoordinates,
        geodesic: sph.geodesic,
        strokeOpacity: 0,
        icons: [{
          icon: sph.lineSymbol,
          offset: '0',
          repeat: '20px'
        }]
      });

      sph.allLinesArray.push(sph.sailedPath, sph.sailPlanPath);

      sph.sailedPath.setMap(sph.map);
      sph.sailPlanPath.setMap(sph.map);
    }
  },
  // 모든 경로들을 없앤다.
  clearAllPaths: function() {
    for (var i in sph.allLinesArray) {
      sph.allLinesArray[i].setMap(null);
    }
    sph.sailedPath.setMap(null);
    sph.sailPlanPath.setMap(null);
    sph.allLinesArray = [];
  },
  clear: function() {
    sph.markers = [];
  },
  clearStyle: function() {
    if (sph.styleArray.length > 0) {
      sph.styleArray = [];
    } else {
      sph.styleArray = style;
    }
    sph.initMap();
  },
  initWithMarkerCluster: function() {
    sph.initMap();
    sph.showAllPaths();
    sph.addLegends();
  }
}
