var chart = {
  isDashboardOpen: false,
  dashboardToggle: function() {
    if (chart.isDashboardOpen) {
      chart.hideFrontLayer();
    } else {
      chart.showFrontLayer();
    }
  },
  showFrontLayer: function() {
    document.getElementById('bg_mask').style.visibility='visible';
    document.getElementById('frontlayer').style.visibility='visible';
    chart.isDashboardOpen = true;
  },
  hideFrontLayer: function() {
    document.getElementById('bg_mask').style.visibility='hidden';
    document.getElementById('frontlayer').style.visibility='hidden';
    chart.isDashboardOpen = false;
  }
}
