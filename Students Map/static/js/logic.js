var mymap = L.map('mapid').setView([37.0902, -95.7129],4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: myKey
}).addTo(mymap);

var mags = statesData.features.map(  function (i) { return i.properties['Significant Difference'] });
mags = mags.filter(function (x) { return x != ''; });
mags = mags.sort((a, b) => a - b)
mags = mags.map(function(y) { return parseInt(y); });

function color (feature) {
    if (feature === '') {
        return 'black';
    } else {
        var notNull = d3.scaleLinear()
          .domain([d3.min(mags),0, d3.max(mags)])
          .range(['red','white', 'blue'])
        return notNull(feature)
    }
}

function style(feature) {
    return {
        fillColor: color(feature.properties['Significant Difference']),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();

    info.update(layer.feature.properties)
    }
}

var info = L.control();

info.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>State</h4>' + (props ?
        props.State + '<br>Significant Difference: ' + props['Significant Difference'] + 
        '<br>Score: ' + props['Score (0-300)'] + '<br>% With Basic Understanding: '
         + props['Above Basic (%)']  + '<br>% With Proficiency: ' + props['Above Proficient (%)']
        : 'Hover over a state')
};

info.addTo(mymap);

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (mymap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-16, -12, -8, -4, 0, 4, 8, 12, 16],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + color(grades[i]) + '"></i> ' +
            grades[i] + '<br>';
    }

    return div;
};

legend.addTo(mymap);

var geojson = L.geoJson(statesData, {
                    style: style,
                    onEachFeature: onEachFeature}).addTo(mymap);