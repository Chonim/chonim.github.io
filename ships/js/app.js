var ships = shipsOriginal;
var style = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}]
  }
];

var init = {
  map: null,
  center: {lat: 36, lng: 125},
  marker: null,
  markerCluster: null,
  sailedPath: null,
  sailPlanPath: null,
  geodesic: false,
  portIcon: 'http://maps.google.com/mapfiles/kml/pal3/icon28.png',
  mapTypeId: 'hybrid',
  markerArray: [],
  shipsArray: [],
  allLinesArray: [],
  styleArray: [],
  lineSymbol: {
    path: 'M 0,-1 0,1',
    strokeColor: 'red',
    strokeOpacity: 1,
    scale: 4
  },
  initMap: function() {
    ships = shipsOriginal;
    init.markerArray = [];
    init.shipsArray = shipsOriginal.data;
    init.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: init.center,
      mapTypeControl: true,
      mapTypeId: init.mapTypeId,
      rotateControl: true,
      styles: this.styleArray, // 스타일 적용
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      scaleControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER,
        style: google.maps.MapTypeControlStyle.DEFAULT,
        mapTypeIds: ['roadmap', 'hybrid']
      }
    });

    // 배경지도 클릭시 현재경로 삭제
    init.map.addListener('click', function() {
      init.clearPreviousPath();
    });

    init.map.addListener('maptypeid_changed', function() {
      if (init.map.getMapTypeId !== "terrain") {
        init.map.setOptions({'styles' : []});
      }
    });

    // 지도가 로딩되면 마커 생성 함수 호출
    this.showShipsMarkers();
  },
  showShipsMarkers: function() {
    init.deleteAllMarkers();
    init.markerArray = [];  // 배열 초기화
    var shipImage = {
      url: 'http://maps.google.com/mapfiles/kml/pal2/icon13.png'
    };
    for (var i in init.shipsArray) {
      // 선박 마커 생성
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(init.shipsArray[i].LAT, init.shipsArray[i].LON),
        label: i,
        icon: shipImage,
        size: new google.maps.Size(2, 2),
        map: init.map
      })

      // 항구 마커 생성
      var startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(init.shipsArray[i].startLat, init.shipsArray[i].startLon),
        icon: init.portIcon,
        map: init.map
      })
      var endMarker = new google.maps.Marker({
        position: new google.maps.LatLng(init.shipsArray[i].endLat, init.shipsArray[i].endLon),
        icon: init.portIcon,
        map: init.map
      })

      // 클러스터링, 항로 생성 등을 위해 배열에 담는다.
      init.markerArray.push(marker);

      // 인포윈도우 생성
      var infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', function(arg) {
        // 센터 변경
        init.map.setCenter(this.position);

        // 인포윈도우 생성
        i = this.label;
        var contentString = '<p>경도: ' + init.shipsArray[i].LON +'</p>' + '<p>위도: ' + init.shipsArray[i].LAT + '</p>';
        infowindow.setContent(contentString);

        // 운항경로 보여주는 라인 생성함수 호출
        init.drawLine(this, this.label, init.shipsArray);
        infowindow.open(init.map, this);
      });
    };
  },
  // 마커 클러스터링
  enableMarkerCluster: function() {
    var options = {
        imagePath: 'images/m'
    };
    init.deleteAllMarkers();
    // console.log(init.markerCluster);
    if (typeof init.markerCluster === 'undefined' || init.markerCluster === null) { // 클러스터 되어 있지 않을 시
      init.markerCluster = new MarkerClusterer(init.map, init.markerArray, init.options);
    } else {  // 클러스터가 되어 있을 시
      init.markerCluster.clearMarkers();
      init.showShipsMarkers();
      init.markerCluster = null;
    };
  },
  deleteAllMarkers: function() {
    for (var i = 0; i < init.markerArray.length; i++) {
      init.markerArray[i].setMap(null);
    }
  },
  clearPreviousPath: function() {
    // 기존에 그려진 경로가 있으면 삭제
    if (init.sailedPath !== null) {
      init.sailedPath.setMap(null);
      init.sailPlanPath.setMap(null);
    }
  },
  drawLine: function(marker, index, shipsArray) {
    var i;
    init.clearPreviousPath();

    var currentPosition = marker.position;
    var startCoords = {
      lat: parseFloat(ships.data[index].startLat),
      lng: parseFloat(ships.data[index].startLon)
    }
    var endCoords = {
      lat: parseFloat(ships.data[index].endLat),
      lng: parseFloat(ships.data[index].endLon)
    }

    // 지나온 항로 생성
    var sailedCoordinates = [
      {lat: currentPosition.lat(), lng: currentPosition.lng()},
      {lat: startCoords.lat, lng: startCoords.lng}
    ];
    init.sailedPath = new google.maps.Polyline({
      path: sailedCoordinates,
      geodesic: init.geodesic,
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
    init.sailPlanPath = new google.maps.Polyline({
      path: sailPlanCoordinates,
      strokeOpacity: 0,
      geodesic: init.geodesic,
      icons: [{
        icon: init.lineSymbol,
        offset: '0',
        repeat: '20px'
      }]
    });

    // 항로 지도에 표시
    init.sailedPath.setMap(init.map);
    init.sailPlanPath.setMap(init.map);
  },
  setMapOnAll: function() {
    for (var i = 0; i < init.markerArray.length; i++) {
      init.markerArray[i].setMap(init.map);
    }
  },
  // 모든 경로들을 보여준다.
  showAllPaths: function() {
    init.clearPreviousPath();
    if (init.markerCluster !== null) {
      init.markerCluster.clearMarkers();
      init.markerCluster = null;
    }
    init.showShipsMarkers();
    for (var i in init.markerArray) {

      // 지나온 항로 생성
      var sailedCoordinates = [
        {lat: init.markerArray[i].position.lat(), lng: init.markerArray[i].position.lng()},
        {lat: parseFloat(ships.data[i].startLat), lng: parseFloat(ships.data[i].startLon)}
      ];
      init.sailedPath = new google.maps.Polyline({
        path: sailedCoordinates,
        geodesic: init.geodesic,
        strokeColor: '#70db70',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      // 남은 항로 생성
      var sailPlanCoordinates = [
        {lat: init.markerArray[i].position.lat(), lng: init.markerArray[i].position.lng()},
        {lat: parseFloat(ships.data[i].endLat),  lng: parseFloat(ships.data[i].endLon)}
      ];
      // 점선 표시를 위한 스타일링
      init.sailPlanPath = new google.maps.Polyline({
        path: sailPlanCoordinates,
        geodesic: init.geodesic,
        strokeOpacity: 0,
        icons: [{
          icon: init.lineSymbol,
          offset: '0',
          repeat: '20px'
        }]
      });

      init.allLinesArray.push(init.sailedPath, init.sailPlanPath);

      init.sailedPath.setMap(init.map);
      init.sailPlanPath.setMap(init.map);
    }
  },
  // 모든 경로들을 없앤다.
  clearAllPaths: function() {
    for (var i in init.allLinesArray) {
      init.allLinesArray[i].setMap(null);
    }
    init.sailedPath.setMap(null);
    init.sailPlanPath.setMap(null);
    init.allLinesArray = [];
  },
  clear: function() {
    init.markers = [];
  },
  darkStyle: function() {  // 다크테마 스타일 적용
    init.map.setMapTypeId("terrain");
    init.map.setOptions({'styles' : style});
  }
}

$(document).ready(function() {
  init.initMap();
  init.enableMarkerCluster();
  // init.showAllPaths();
  $("#result").load("dashboard.html");

  $('#showAllPaths').click(function() {
    init.showAllPaths();
  });

  $('#clearAllPaths').click(function() {
    init.clearAllPaths();
  });

  $('#initiate').click(function() {
    init.initMap();
    $('.non-sph').removeClass("disabled");
    $('#legend').remove('.legend-container');
  });

  $('#sph').click(function() {
    $('.non-sph').addClass("disabled");
  })

})
