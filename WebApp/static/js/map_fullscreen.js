$('#opacity_esi_full').hide();
$('#opacity_chirps_full').hide();

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')

const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
var map = L.map('map3', {
    zoomControl: false,
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "2015-09-01/2015-09-03",
        period: "PT1H",
        currentTime: Date.parse("2015-09-01T00:00:00Z")
    },
    timeDimensionControl: true,
    timeDimensionControlOptions: {
        autoPlay: false,
        loopButton: true,
        timeSteps: 1,
        playReverseButton: true,
        limitSliders: true,
        playerOptions: {
            buffer: 0,
            transitionTime: 250,
            loop: true,
        }
    }, center: [42.35, -71.08], zoom: 3
});

L.control.zoom({ position: 'topright'}).addTo(map);

osm.addTo(map);

var chirpsTimeLayer = L.timeDimension.layer.wms(chirps, {
    updateTimeDimension: true,
});
var chirps_wms = 'https://thredds.servirglobal.net/thredds/wms/Agg/ucsb-chirps_global_0.05deg_daily.nc4';
var esi_wms = 'https://gis1.servirglobal.net/arcgis/rest/services/Global/ESI_4WK/MapServer';
var chirps_variable = 'precipitation_amount';
var style = 'boxfill/apcp_surface';
var colorscalerange = '0,5';
$("#chirps_full").change(function () {
    if (this.checked) {
        chirpsTimeLayer.addTo(map);
        chirpsTimeLayer.bringToFront();
        var val = Math.round($('#opacity_chirps_full').val() * 100);
        $('#chirps_full_opacity').text(val + "%");
        $('#chirps_full_opacity').show();
        $('#opacity_chirps_full').show();
        add_legend_fixed_size("chirps", chirps_wms, chirps_variable, colorscalerange, style, 'legend_full_chirps');


    } else {
        chirpsTimeLayer.remove();
        $('#chirps_full_opacity').hide();
        $('#opacity_chirps_full').hide();
        remove_legend_fixed_size("chirps");

    }
});

$("#esi_full").change(function () {
    if (this.checked) {
        esi.addTo(map);
        esi.bringToFront();
        var val = Math.round($('#opacity_esi_full').val() * 100);
        $('#esi_full_opacity').text(val + "%");
        $('#esi_full_opacity').show();
        $('#opacity_esi_full').show();
        add_legend_fixed_size("esi", esi_wms, "", colorscalerange, style, 'legend_full_esi');

    } else {
        esi.remove();
        $('#esi_full_opacity').hide();
        $('#opacity_esi_full').hide();
        remove_legend_fixed_size("esi");

    }
});

$('#opacity_chirps_full').change(function () {
    chirpsTimeLayer.setOpacity($(this).val());
    var val = Math.round($(this).val() * 100);
    $('#chirps_full_opacity').text(val + "%");
});

$('#opacity_esi_full').change(function () {
    esi.setOpacity($(this).val());
    var val = Math.round($(this).val() * 100);
    $('#esi_full_opacity').text(val + "%");
});
// var control1 = L.Control.geocoder({collapsed: false});
//
// control1.addTo(map);
//
//
// let layerControlDiv = control1.getContainer();
//
// // you can set an id for it if you want to use it to override the CSS later
// layerControlDiv.setAttribute("id", "layer-control-id-full");
//
// let layerControlParentLayer = L.control({
//     position: "topright"
// });
// layerControlParentLayer.onAdd = function (map) {
//     // Create the main div that will hold all your elements
//     let parentDiv = L.DomUtil.create("a");
//
//     // you can set an id for it if you want to use it for CSS
//     parentDiv.setAttribute("id", "layer-control-parent-id-full");
//     parentDiv.appendChild(layerControlDiv);
//     L.DomEvent.disableClickPropagation(parentDiv);
//     return parentDiv;
// };
// // add the Layer to the map
// layerControlParentLayer.addTo(map);
// set_parent(layerControlParentLayer,'location_full');

removeLayers = function () {
    satellite.remove();
    osm.remove();
    OpenTopoMap.remove();
    terrainLayer.remove();
    deLormeLayer.remove();
    gSatLayer.remove();
}

add_basemap = function (map_name) {
    removeLayers();

    switch (map_name) {
        case "osm":

            osm.addTo(map);
            // osm.bringToFront();

            break;
        case "delorme":
            deLormeLayer.addTo(map);
            break;
        case "satellite":
            satellite.addTo(map);
            break;

        case "terrain":
            terrainLayer.addTo(map);
            break;
        case "topo":
            OpenTopoMap.addTo(map);
            break;
        case "gsatellite":
            gSatLayer.addTo(map);
            break;
        default:
            osm.addTo(map);

    }
};

function add_legend_fixed_size(dataset, wms, variable, colorscalerange, palette, element) {
    if (variable === "") {
        var base_service_url = wms;

        $.ajax({
            url: base_service_url + "/legend?f=json",
            type: "GET",
            async: true,
            crossDomain: true
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.warn(jqXHR + textStatus + errorThrown);
        }).done(function (data, _textStatus, _jqXHR) {
            if (data.errMsg) {
                console.info(data.errMsg);
            } else {
                add_other_legend(data, dataset, wms);
            }
        });
    } else {
        var legend = L.control({});
        var link = wms + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=" + variable + "&colorscalerange=" + colorscalerange + "&PALETTE=" + palette + "&transparent=TRUE";
        legend.onAdd = function (map) {
            var src = link;
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML +=
                '<img src="' + src + '" alt="legend">';
            div.id = "legend_" + dataset;
            div.className = "thredds-legend";
            return div;
        };
        legend.addTo(map);
        set_parent(legend,element);
    }
}

function remove_legend_fixed_size(val) {
    document.getElementById("legend_" + val).remove();
}

function add_other_legend(response, dataset, base_service_url) {
    var htmlString = "<table>";
    for (var iCnt = 0; iCnt < response.layers.length; iCnt++) {
        lyr = response.layers[iCnt];
        if (lyr.layerId == 3) {
            if (lyr.legend.length > 1) {
                htmlString += "<tr><td colspan='2' style='font-weight:bold;'>" + dataset + "</td></tr>";
                for (var jCnt = 0; jCnt < lyr.legend.length; jCnt++) {
                    var src = base_service_url + "/" + lyr.layerId + "/images/" + lyr.legend[jCnt].url;
                    var strlbl = lyr.legend[jCnt].label.replace("<Null>", "Null");
                    htmlString += "<tr><td align='left'><img src=\"" + src + "\" alt ='' /></td><td>" + strlbl + "</td></tr>";
                }
            } else {
                htmlString += "<tr><td colspan='2' class='tdLayerHeader' style='font-weight:bold;'>" + dataset + "</td></tr>";
                var img_src = base_service_url + "/" + lyr.layerId + "/images/" + lyr.legend[0].url;
                htmlString += "<tr><td colspan='2' ><img src=\"" + img_src + "\" alt ='' /></td></tr>";
            }
        }
    }
    htmlString += "</table>";
    var div = document.createElement('div');
    div.innerHTML += htmlString;

    div.id = "legend_" + dataset;
    div.className = "arcgis-legend";
    document.getElementById("legend_full_" + dataset).appendChild(div);

}
const search = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        showMarker: false, // optional: true|false  - default true
        showPopup: false,
    position:'topright',
        autoClose: true,
    });
    map.addControl(search);
    $(".leaflet-bar-timecontrol").css("margin-left","50px");
$('.leaflet-bar-timecontrol').css('display', 'inline');
        function openNav() {
document.getElementById("mySidenav").style.width = "250px";
$("#nav_opener").hide();
$(".leaflet-bar-timecontrol").css("margin-left","270px");
$('.leaflet-bar-timecontrol').css('display', 'flex');
}


function closeNav() {
document.getElementById("mySidenav").style.width = "0";
$("#nav_opener").show();
$(".leaflet-bar-timecontrol").css("margin-left","50px");
$('.leaflet-bar-timecontrol').css('display', 'inline');
}