#CJ 대한통운 샘플

##Overview
###개요
1. 각 항구 및 100개 선박 위치, 경로 표시
2. Dashboard, 클러스터 토글
3. 일반지도, 위성지도, Dark Theme 지도
3. SPH 버전 (직선이 아닌 실항로 표시)


###Directories/Files
* `index.html`: 최초 실행 파일(서버가 동작해야 Dashboard가 작동)입니다.
* data: JSON 데이터가 있는 `data.json`과 SPH 버전 상의 다중 경로 데이터 `data_sph.json` 파일이 들어 있습니다.
* images: 마커 클러스터 이미지가 들어 있습니다.
* js: init 객체와 기본 기능이 포함된 `app.js`와 SPH 버전을 위한 `app_sph.js`, 그리고 chart 객체가 들어있는 `chart.js`와 마커 클러스터를 위한 `markercluster.js`가 들어 있습니다.

---
##버튼 설명(js/app.js)
###지도 초기화(js/app.js)
####개요
* 최초에 지도를 로딩하거나 지도를 최초 상태로 되돌립니다.

####Functions
1. `init.initMap()`: 지도를 로딩하고 지도 클릭 이벤트를 선언합니다. 로딩 완료가 되면 선박 마커들을 뿌려주는 **init.showShipsMarekrs()**를 호출합니다.
2. `init.showShipsMarekrs()`: JSON 파일에 들어있는 선박들의 위치에 각각 마커를 뿌려주고, InfoWindow와 마커 클릭시 이벤트를 설정합니다.
3. `init.drawLine()`: 마커 클릭시 해당 마커의 경로를 그려줍니다.
4. `init.clearPreviousPath()`: 다음 마커 클릭시 이전 마커의 경로를 삭제합니다.

---

###모든 경로 표시(js/app.js)
####개요
* 모든 선박의 경로를 보여줍니다.

####Functions
1. `init.showAllPaths()`: 모든 선박의 경로를 보여줍니다. 버튼 클릭시 마커 클러스터는 해제됩니다.

---

###모든 경로 감춤(js/app.js)
####개요
* 모든 선박의 경로를 삭제합니다.

####Functions
1. `clearAllPaths()`: 모든 선박의 경로를 삭제합니다.

---

###Dashboard(js/chart.js)
####개요
* Dashboard를 on/off 합니다. **본 기능은 서버상에서 실행시에만 작동합니다.**

####Functions
1. `chart.dashboardToggle()`: 대시보드의 on/off 여부를 판단하여 작동을 설정합니다.
2. `chart.showFrontLayer()`: 차트를 띄웁니다.
3. `chart.hideFrontLayer()`: 차트를 감춥니다.

---

###Dark Theme(js/app.js)
####개요
####Functions
1. `init.darkStyle()`: 지도를 Dark 스타일로 바꿉니다.

---

###클러스터(js/app.js)
####개요
####Functions
1. `init.enableMarkerCluster()`: 마커 클러스터를 활성화합니다. 최초 로딩시 호출되고 **클러스터**토글버튼 클릭시 on/off 됩니다.

---

###SPH (js/app_sph.js)
####개요
* SPH 버전 (직선이 아닌 실항로 표시) 지도를 보여줍니다.
####Functions
1. `sph.initMap()`: SPH 버전의 실항로 지도를 보여줍니다. 다른 부가기능들은 Disable 되고, 지도 초기화 버튼 클릭시 기존 버전의 지도로 돌아갑니다.
