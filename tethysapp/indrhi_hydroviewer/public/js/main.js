
var feature_layer;
var feature_layer2;
var current_layer;
var map;

let $loading = $('#view-file-loading');
var m_downloaded_historical_streamflow = false;
const glofasURL = `http://globalfloods-ows.ecmwf.int/glofas-ows/ows.py`


//Global Variables //
let layerDict={}
let ajax_url = 'https://geoserver.hydroshare.org/geoserver/wfs?request=GetCapabilities';
let sliderStreams = document.getElementById('sliderStreams');

function init_map() {

  let AccRainEGELayer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
          url: glofasURL,
          params: { LAYERS: 'AccRainEGE', TILED: true },
          serverType: 'mapserver'
          // crossOrigin: 'Anonymous'
      }),
      // visible: false
  });
  let EGE_probRgt50Layer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
          url: glofasURL,
          params: { LAYERS: 'EGE_probRgt50', TILED: true },
          serverType: 'mapserver'
          // crossOrigin: 'Anonymous'
      }),
      // visible: false
  });
  let EGE_probRgt150Layer= new ol.layer.Tile({
      source: new ol.source.TileWMS({
          url: glofasURL,
          params: { LAYERS: 'EGE_probRgt150', TILED: true },
          serverType: 'mapserver'
          // crossOrigin: 'Anonymous'
      }),
      // visible: false
  });
  let EGE_probRgt300Layer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
          url: glofasURL,
          params: { LAYERS: 'EGE_probRgt300', TILED: true },
          serverType: 'mapserver'
          // crossOrigin: 'Anonymous'
      }),
      // visible: false
  })

	var base_layer = new ol.layer.Tile({
		source: new ol.source.BingMaps({
			key: 'eLVu8tDRPeQqmBlKAjcw~82nOqZJe2EpKmqd-kQrSmg~AocUZ43djJ-hMBHQdYDyMbT-Enfsk0mtUIGws1WeDuOvjY4EXCH-9OK3edNLDgkc',
			imagerySet: 'Road'
		})
	});

	var streams = new ol.layer.Image({
		source: new ol.source.ImageWMS({
			url: 'https://tethys2.byu.edu/geoserver/hydroviewer/wms',
			params: { 'LAYERS': 'hispaniola-geoglows-drainage_line' },
			serverType: 'geoserver',
			crossOrigin: 'Anonymous'
		}),
	});
	var layerNameCatchment = 'ffgs:ffgs_hispaniola'
	var wmsLayerCatchment = new ol.layer.Tile({
			source: new ol.source.TileWMS({
					url: 'https://tethys2.byu.edu/geoserver/wms',
					params: { 'LAYERS': layerNameCatchment },
					serverType: 'geoserver',
					crossOrigin: 'Anonymous'
			}),
	});

	var major_rivers = new ol.layer.Image({
  	source: new ol.source.ImageWMS({
  		url: 'https://geoserver.hydroshare.org/geoserver/wms',
  		params: { 'LAYERS': 'HS-cc1b93f1d65440aca895787118ed46f1:Jubba_and_Shabelle' },
  		serverType: 'geoserver',
  		crossOrigin: 'Anonymous'
  	}),
  	opacity: 1
	});

	var stations = new ol.layer.Image({
		source: new ol.source.ImageWMS({
			url: 'https://geoserver.hydroshare.org/geoserver/wms',
			params: { 'LAYERS': 'HS-cc1b93f1d65440aca895787118ed46f1:SomoliaPoints' },
			serverType: 'geoserver',
			crossOrigin: 'Anonymous',
		})
	});

  // Add the resources of the layer display //
  //Model MOOD
  let watersheds_MOD = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url: 'https://geoserver.hydroshare.org/geoserver/wms',
      params: { 'LAYERS': 'HS-0a4ef3190ba14e04a09768eb91e2c23f:cuencas_r' },
      serverType: 'geoserver',
      crossOrigin: 'Anonymous',
    })
  });


  let nod_Q = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url: 'https://geoserver.hydroshare.org/geoserver/wms',
      params: { 'LAYERS': 'HS-0a4ef3190ba14e04a09768eb91e2c23f:NOD_1_CA' },
      serverType: 'geoserver',
      crossOrigin: 'Anonymous',
    })
  });

  layerDict['watersheds_MHH']=watersheds_MOD;
  layerDict['nod_Q']= nod_Q;
  layerDict['wmsLayerCatchment'] = wmsLayerCatchment;
  layerDict['streams'] = streams;

	feature_layer = streams;
	feature_layer2 = nod_Q;

	map = new ol.Map({
		target: 'map',
		layers: [base_layer, streams, stations,wmsLayerCatchment, watersheds_MOD, nod_Q],
		// layers: [base_layer, stations, wmsLayerCatchment, watersheds_MOD,nod_Q],
		view: new ol.View({
			center: ol.proj.fromLonLat([-70.789505, 19.042818]),
			zoom: 8
		})
	});

}

// SWITCH TO SHOW THE WATERSHED MHH//
function modSwitchWatershedMHH(){
  let actual_state=$(this).prop('checked');
  if(actual_state){
    map.addLayer( layerDict['watersheds_MHH']);
    map.updateSize();

  }
  else{
    map.removeLayer(layerDict['watersheds_MHH']);
    map.updateSize();
  }
}
$('#showMHHlayer').change(modSwitchWatershedMHH);

// SWITCH TO SHOW THE STATIONS//
function modSwitchStationsMHH(){
  let actual_state=$(this).prop('checked');
  if(actual_state){
    map.addLayer( layerDict['nod_Q']);
    map.updateSize();

  }
  else{
    map.removeLayer(layerDict['nod_Q']);
    map.updateSize();
  }
}
$('#showStationMHHlayer').change(modSwitchStationsMHH);

// SWITCH TO SHOW THE WMS stations//
function modSwitchWmsCatchment(){
  let actual_state=$(this).prop('checked');
  if(actual_state){
    map.addLayer( layerDict['wmsLayerCatchment']);
    map.updateSize();

  }
  else{
    map.removeLayer(layerDict['wmsLayerCatchment']);
    map.updateSize();
  }
}

$('#ffs').change(modSwitchWmsCatchment);
// SWITCH TO SHOW THE WMS stations//
function modSwitchStreams(){
  let actual_state=$(this).prop('checked');
  if(actual_state){
    map.addLayer( layerDict['streams']);
    map.updateSize();

  }
  else{
    map.removeLayer(layerDict['streams']);
    map.updateSize();
  }
}
$('#geo').change(modSwitchStreams);

// Add opacity to the different sliders //

$("#sliderStreams").on("input change", function() {
  layerDict['streams'].setOpacity(this.value);
});
$("#sliderStationsMHH").on("input change", function() {
  layerDict['nod_Q'].setOpacity(this.value);
});
$("#sliderFSSWatersheds").on("input change", function() {
  layerDict['wmsLayerCatchment'].setOpacity(this.value);
});
$("#sliderWatershedMHH").on("input change", function() {
  layerDict['watersheds_MHH'].setOpacity(this.value);
});

// sliderStreams.onchange = function() {
//     layerDict['streams'].setOpacity(this.value);
// }​

let capabilities = $.ajax(ajax_url, {
	type: 'GET',
	data:{
		service: 'WFS',
		version: '1.0.0',
		request: 'GetCapabilities',
		outputFormat: 'text/javascript'
	},
	success: function() {
		let x = capabilities.responseText
		.split('<FeatureTypeList>')[1]
		// .split('HS-cc1b93f1d65440aca895787118ed46f1:SomoliaPoints')[1]
		.split('HS-0a4ef3190ba14e04a09768eb91e2c23f:Nod_Q')[1]
		.split('LatLongBoundingBox ')[1]
		.split('/></FeatureType>')[0];

		let minx = Number(x.split('"')[1]);
		let miny = Number(x.split('"')[3]);
		let maxx = Number(x.split('"')[5]);
		let maxy = Number(x.split('"')[7]);

		minx = minx + 2;
		miny = miny + 2;
		maxx = maxx - 2;
		maxy = maxy - 2;

		let extent = ol.proj.transform([minx, miny], 'EPSG:4326', 'EPSG:3857').concat(ol.proj.transform([maxx, maxy], 'EPSG:4326', 'EPSG:3857'));

		map.getView().fit(extent, map.getSize());
	}
});

// function get_available_dates(comid) {
function get_available_dates(comid,watershed,subbasin,startdate) {
	$.ajax({
		type: 'GET',
		url: 'get-available-dates/',
		dataType: 'json',
		data: {
			'watershed': watershed,
			'subbasin': subbasin,
			'comid': comid
		},
		error: function() {
			$('#dates').html(
				'<p class="alert alert-danger" style="text-align: center"><strong>An error occurred while retrieving the available dates</strong></p>'
			);

			setTimeout(function() {
				$('#dates').addClass('hidden')
			}, 5000);
        },
        success: function(dates) {
        	datesParsed = JSON.parse(dates.available_dates);
        	$('#datesSelect').empty();

        	$.each(datesParsed, function(i, p) {
        		var val_str = p.slice(1).join();
        		$('#datesSelect').append($('<option></option>').val(val_str).html(p[0]));
        	});
        }
    });
}

// function get_time_series(comid) {
function get_time_series(comid,watershed,subbasin,startdate) {
    $('#forecast-loading').removeClass('hidden');
    $('#forecast-chart').addClass('hidden');
    $('#dates').addClass('hidden');
    $.ajax({
        type: 'GET',
        url: 'get-time-series/',
        data: {
            'comid': comid,
        },
        error: function() {
            $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the forecast</strong></p>');
            $('#info').removeClass('hidden');

            setTimeout(function() {
                $('#info').addClass('hidden')
            }, 5000);
        },
        success: function(data) {
            if (!data.error) {
                $('#forecast-loading').addClass('hidden');
                $('#dates').removeClass('hidden');
                //$loading.addClass('hidden');
                $('#forecast-chart').removeClass('hidden');
                $('#forecast-chart').html(data['plot']);

                //resize main graph
                Plotly.Plots.resize($("#forecast-chart .js-plotly-plot")[0]);
                let divVar = $("#forecast-chart .js-plotly-plot")[0];
                console.log(divVar);
                var params = {
                    watershed_name: watershed,
                    subbasin_name: subbasin,
                    comid: comid,
                    startdate: startdate,
                };

                $('#submit-download-forecast').attr({
                    target: '_blank',
                    href: 'get-forecast-data-csv?' + jQuery.param(params)
                });

                $('#download_forecast').removeClass('hidden');

            } else if (data.error) {
                $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the forecast</strong></p>');
                $('#info').removeClass('hidden');

                setTimeout(function() {
                    $('#info').addClass('hidden')
                }, 5000);
            } else {
                $('#info').html('<p><strong>An unexplainable error occurred.</strong></p>').removeClass('hidden');
            }
        }
    });
}

// function get_historic_data(comid) {
function get_historic_data(comid,watershed,subbasin,startdate) {
	$('#historical-loading').removeClass('hidden');
	m_downloaded_historical_streamflow = true;
    $.ajax({
        url: 'get-historic-data',
        type: 'GET',
        data: {
            'comid': comid,
        },
        error: function() {
            $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the historic data</strong></p>');
            $('#info').removeClass('hidden');

            setTimeout(function () {
                $('#info').addClass('hidden')
            }, 5000);
        },
        success: function (data) {
            if (!data.error) {
                $('#historical-loading').addClass('hidden');
                $('#dates').removeClass('hidden');
                $loading.addClass('hidden');
                $('#historical-chart').removeClass('hidden');
                $('#historical-chart').html(data['plot']);

                //resize main graph
                Plotly.Plots.resize($("#historical-chart .js-plotly-plot")[0]);

                var params = {
                  watershed: watershed,
                	subbasin: subbasin,
                	comid: comid,
                	daily: false
                };

                $('#submit-download-historical').attr({
                    target: '_blank',
                    href: 'get-historic-data-csv?' + jQuery.param(params)
                });

                $('#download_historical').removeClass('hidden');

           		 } else if (data.error) {
           		 	$('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Historical Data</strong></p>');
           		 	$('#info').removeClass('hidden');

           		 	setTimeout(function() {
           		 		$('#info').addClass('hidden')
           		 	}, 5000);
           		 } else {
           		 	$('#info').html('<p><strong>An unexplainable error occurred.</strong></p>').removeClass('hidden');
           		 }
       		}
    });
};

function get_flow_duration_curve(comid) {
    $('#fdc-view-file-loading').removeClass('hidden');
    m_downloaded_flow_duration = true;
    $.ajax({
        type: 'GET',
        url: 'get-flow-duration-curve',
        data: {
            'comid': comid,
        },
        success: function(data) {
            if (!data.error) {
                $('#fdc-loading').addClass('hidden');
                $('#fdc-chart').removeClass('hidden');
                $('#fdc-chart').html(data['plot']);
            } else if (data.error) {
                $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the historic data</strong></p>');
                $('#info').removeClass('hidden');

                setTimeout(function() {
                    $('#info').addClass('hidden')
                }, 5000);
            } else {
                $('#info').html('<p><strong>An unexplainable error occurred.</strong></p>').removeClass('hidden');
            }
        }
    });
}

function get_forecast_percent(comid) {
    $('#mytable').addClass('hidden');
    $.ajax({
        url: 'forecastpercent/',
        type: 'GET',
        data: {
            'comid': comid,
        },
        error: function() {
            $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the forecast table</strong></p>');
            $('#info').removeClass('hidden');

            setTimeout(function() {
                $('#info').addClass('hidden')
            }, 5000);
        },
        success: function(data) {
            $("#mytable").html(data['table']);
            $("#mytable").removeClass('hidden');
        }
    })
}

function get_dailyAverages (comid) {
	$('#dailyAverages-loading').removeClass('hidden');
	m_downloaded_historical_streamflow = true;
    $.ajax({
        url: 'get-dailyAverages',
        type: 'GET',
        data: {
            'comid': comid
        },
        error: function() {
            $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>');
            $('#info').removeClass('hidden');

            setTimeout(function () {
                $('#info').addClass('hidden')
            }, 5000);
        },
        success: function (data) {
            if (!data.error) {
                $('#dailyAverages-loading').addClass('hidden');
                $('#dates').removeClass('hidden');
                //$('#obsdates').removeClass('hidden');
                $loading.addClass('hidden');
                $('#dailyAverages-chart').removeClass('hidden');
                $('#dailyAverages-chart').html(data['plot']);

                //resize main graph
                Plotly.Plots.resize($("#dailyAverages-chart .js-plotly-plot")[0]);

           		 } else if (data.error) {
           		 	$('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>');
           		 	$('#info').removeClass('hidden');

           		 	setTimeout(function() {
           		 		$('#info').addClass('hidden')
           		 	}, 5000);
           		 } else {
           		 	$('#info').html('<p><strong>An unexplainable error occurred.</strong></p>').removeClass('hidden');
           		 }
       		}
    });
};

function get_monthlyAverages (comid) {
	$('#monthlyAverages-loading').removeClass('hidden');
	m_downloaded_historical_streamflow = true;
    $.ajax({
        url: 'get-monthlyAverages',
        type: 'GET',
        data: {
            'comid': comid
        },
        error: function() {
            $('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the data</strong></p>');
            $('#info').removeClass('hidden');

            setTimeout(function () {
                $('#info').addClass('hidden')
            }, 5000);
        },
        success: function (data) {
            if (!data.error) {
                $('#monthlyAverages-loading').addClass('hidden');
                $('#dates').removeClass('hidden');
                //$('#obsdates').removeClass('hidden');
                $loading.addClass('hidden');
                $('#monthlyAverages-chart').removeClass('hidden');
                $('#monthlyAverages-chart').html(data['plot']);

                //resize main graph
                Plotly.Plots.resize($("#monthlyAverages-chart .js-plotly-plot")[0]);

           		 }
               else if (data.error) {
           		 	$('#info').html('<p class="alert alert-danger" style="text-align: center"><strong>An unknown error occurred while retrieving the Data</strong></p>');
           		 	$('#info').removeClass('hidden');

           		 	setTimeout(function() {
           		 		$('#info').addClass('hidden')
           		 	}, 5000);
           		 } else {
           		 	$('#info').html('<p><strong>An unexplainable error occurred.</strong></p>').removeClass('hidden');
           		 }
       		}
    });
};

function removeInvalid(arrayTest){
  let arrayResponse = [];
  arrayTest.forEach(function(x){
    if(x >= 0){
      arrayResponse.push(x);
    }
    else{
      arrayResponse.push(undefined);
    }
  })
  return arrayResponse;

}
function formatDates(arrayDates){
  let arrayResponse=[];
  arrayDates.forEach(function(x){
    let firstPart = x.split(" ");
    let joinPart = firstPart[0].split("/");
    let joinPartConverted = [joinPart[2],joinPart[1],joinPart[0]].join('-');
    let finalString = [joinPartConverted, firstPart[1]].join(' ');
    arrayResponse.push(finalString);
  })
  return arrayResponse;
}
function stationData(idStation,commid){
  console.log("stationData");
  $.ajax({
    type: "GET",
    url: 'getStationMOD',
    dataType: 'json',
    data:{
      'id':idStation,
      'commid':commid
    },
    success: function (result) {
      if (!result.error) {
          console.log(result);

          $('#sloading').addClass('hidden');

          // $loading.addClass('hidden');
          $('#sgraph').removeClass('hidden');

          var prev1Trace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['prev1']),
            type: 'scatter',
            name:'Prev_1'
          };

          var prevATrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['prevA']),
            type: 'scatter',
            name:'Prev_A'
          };
          var prevRTrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['prevR']),
            type: 'scatter',
            name:'Prev_R'
          };
          var maxTrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['max']),
            type: 'scatter',
            name:'Max_Scns_Fut'
          };
          var minTrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['min']),
            type: 'scatter',
            name:'Min_Scns_Fut'

          };

          var data = [prev1Trace,prevATrace,prevRTrace,maxTrace,minTrace];
          var config = {responsive: true}
          // Plotly.newPlot('uploadTab', data);
          Plotly.newPlot('sgraph', data, config);
          //resize main graph
          let divVar = $("#sgraph .js-plotly-plot");
          console.log(divVar[0]);
          Plotly.Plots.resize($("#sgraph")[0]);

         }

    }
  });
}
function stationData2(idStation,commid){
  console.log("stationData");
  $.ajax({
    type: "GET",
    url: 'getStationMODsim',
    dataType: 'json',
    data:{
      'id':idStation,
      'commid':commid
    },
    success: function (result) {
      if (!result.error) {
          console.log(result);

          $('#sloading2').addClass('hidden');

          // $loading.addClass('hidden');
          $('#sgraph2').removeClass('hidden');

          var prev1Trace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['Lento_EHA-Normal']),
            type: 'scatter',
            name:'Lento_EHA-Normal'
          };

          var prevATrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['Lento_EHA-Seco']),
            type: 'scatter',
            name:'Lento_EHA-Seco'
          };
          var prevRTrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['Rap_EHA-Hum']),
            type: 'scatter',
            name:'Rap_EHA-Hum'
          };
          var maxTrace = {
            x: formatDates(result['dates']),
            y: removeInvalid(result['Calibra_Z1']),
            type: 'scatter',
            name:'Calibra_Z1'
          };

          var data = [prev1Trace,prevATrace,prevRTrace,maxTrace];
          var config = {responsive: true}
          // Plotly.newPlot('uploadTab', data);
          Plotly.newPlot('sgraph2', data, config);
          //resize main graph
          Plotly.Plots.resize($("#sgraph2")[0]);

         }

    }
  });
}

function modelDataPlots(idStation){
  $.ajax({
    type: "GET",
    url: 'getModelData',
    dataType: 'json',
    data:{
      'id':idStation,
    },
    // "FFGS-ARW",
    // "FFGS-NMMB",
    // "Sispi-RAIN",
    // "MF-AROME"
    success: function (result) {

      if (!result.error) {
          console.log(result);

          $('#sloading3').addClass('hidden');

          // $loading.addClass('hidden');
          $('#sgraph3').removeClass('hidden');

          var prev1Trace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['FFGS-ARW']),
            type: 'scatter',
            name:'FFGS-ARW'
          };

          var prevATrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['FFGS-NMMB']),
            type: 'scatter',
            name:'FFGS-NMMB'
          };
          var prevRTrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['Sispi-RAIN']),
            type: 'scatter',
            name:'Sispi-RAIN'
          };
          var maxTrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['MF-AROME']),
            type: 'scatter',
            name:'MF-AROME'
          };

          var data = [prev1Trace,prevATrace,prevRTrace,maxTrace];
          var config = {responsive: true}
          // Plotly.newPlot('uploadTab', data);
          Plotly.newPlot('sgraph3', data, config);
          //resize main graph
          Plotly.Plots.resize($("#sgraph3")[0]);

         }

    },
    error:function(data){
      console.log("problem");
      console.log(data)
    }
  });
}
function modelDataPlotsIn(idStation){
  $.ajax({
    type: "GET",
    url: 'getModelDataIn',
    dataType: 'json',
    data:{
      'id':idStation,
    },

    success: function (result) {

      if (!result.error) {
          console.log(result);

          $('#sloading4').addClass('hidden');

          // $loading.addClass('hidden');
          $('#sgraph4').removeClass('hidden');

          var prev1Trace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['FFGS-ARW']),
            type: 'scatter',
            name:'FFGS-ARW'
          };

          var prevATrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['FFGS-NMMB']),
            type: 'scatter',
            name:'FFGS-NMMB'
          };
          var prevRTrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['Sispi-RAIN']),
            type: 'scatter',
            name:'Sispi-RAIN'
          };
          var maxTrace = {
            x: formatDates(result['timestamps']),
            y: removeInvalid(result['MF-AROME']),
            type: 'scatter',
            name:'MF-AROME'
          };

          var data = [prev1Trace,prevATrace,prevRTrace,maxTrace];
          var config = {responsive: true}
          // Plotly.newPlot('uploadTab', data);
          Plotly.newPlot('sgraph4', data, config);
          //resize main graph
          Plotly.Plots.resize($("#sgraph4")[0]);

         }

    },
    error:function(data){
      console.log("problem");
      console.log(data)
    }
  });
}
function map_events() {
	map.on('pointermove', function(evt) {
		if (evt.dragging) {
			return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		var hit = map.forEachLayerAtPixel(pixel, function(layer) {
			if (layer == feature_layer || layer == feature_layer2 ) {
				current_layer = layer;
				return true;
			}
			});
		map.getTargetElement().style.cursor = hit ? 'pointer' : '';
	});

	map.on("singleclick", function(evt) {

		if (map.getTargetElement().style.cursor == "pointer" && current_layer ===feature_layer) {
			var view = map.getView();
			var viewResolution = view.getResolution();
			var wms_url = current_layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(), { 'INFO_FORMAT': 'application/json' });

			if (wms_url) {
				$("#obsgraph").modal('show');
				$("#tbody").empty()
				$('#forecast-chart').addClass('hidden');
				$('#historical-chart').addClass('hidden');
				$('#fdc-chart').addClass('hidden');
				$('#dailyAverages-chart').addClass('hidden');
				$('#monthlyAverages-chart').addClass('hidden');
				$('#forecast-loading').removeClass('hidden');
				$('#historical-loading').removeClass('hidden');
				$('#fdc-loading').removeClass('hidden');
				$("#station-info").empty()
				$('#download_forecast').addClass('hidden');
                $('#download_historical').addClass('hidden');

				$.ajax({
					type: "GET",
					url: wms_url,
					dataType: 'json',
					success: function (result) {
						var startdate = '';
						var watershed = result["features"][0]["properties"]["watershed"];
		         		var subbasin = result["features"][0]["properties"]["subbasin"];
		         		var comid = result["features"][0]["properties"]["COMID"];
                console.log(comid);
                console.log(watershed);
                console.log(subbasin);
		         		$("#station-info").append('<h3 id="Current-Watershed-Tab">Current Watershed: '+ watershed
                        			+ '</h3><h5 id="Subbasin-Name-Tab">Subbasin Name: '
                        			+ subbasin + '</h3><h5 id="COMID-Tab">Station COMID: '
                        			+ comid+ '</h5><h5>Country: '+ 'Dominican Republic');

                        get_time_series(comid,watershed,subbasin,startdate);
                        get_historic_data(comid,watershed,subbasin,startdate);
                        get_flow_duration_curve(comid,watershed,subbasin,startdate);
                        get_forecast_percent(comid,watershed,subbasin,startdate);
                        get_dailyAverages(comid,watershed,subbasin,startdate);
                        get_monthlyAverages(comid,watershed,subbasin,startdate);
                    }
                });
            }
		}
    if (map.getTargetElement().style.cursor == "pointer" && current_layer ===feature_layer2) {

      var view = map.getView();
      var viewResolution = view.getResolution();
      var wms_url = current_layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(), { 'INFO_FORMAT': 'application/json' });

      if (wms_url) {
        $("#obsgraphStations").modal('show');
        // $("#myModal").modal('show');
        $('#sgraph').addClass('hidden');
        $('#sloading').removeClass('hidden');
        $('#sloading2').removeClass('hidden');
        $('#sloading3').removeClass('hidden');
        $('#sloading4').removeClass('hidden');
        $('#sgraph2').addClass('hidden');
        $('#sgraph3').addClass('hidden');
        $('#sgraph4').addClass('hidden');
        $("#sinfo").empty();

        $.ajax({
          type: "GET",
          url: wms_url,
          dataType: 'json',
          success: function (result) {
            console.log("this is the results");
            console.log(result);

            var stationID = result["features"][0]["properties"]["id"]
            var stationCommid = result["features"][0]["properties"]["COMID"]
            $("#sinfo").append('<h3 id="Current-Station-Tab">Current Station: '+ stationID
                          + '</h3><h5 id="COMID-Tab">Station COMID: '
                          + stationCommid+ '</h5><h5>Country: '+ 'Dominican Republic');
            stationData(stationID,stationCommid);
            stationData2(stationID,stationCommid);
            modelDataPlots(stationID);
            modelDataPlotsIn(stationID);

            }
        });
      }
    }

	});
}



function resize_graphs() {
    $("#forecast_tab_link").click(function() {
        Plotly.Plots.resize($("#forecast-chart .js-plotly-plot")[0]);
    });
    $("#historical_tab_link").click(function() {
    	if (m_downloaded_historical_streamflow) {
    		Plotly.Plots.resize($("#historical-chart .js-plotly-plot")[0]);
    	}
    });
    $("#fdc_tab_link").click(function() {
    	Plotly.Plots.resize($("#fdc-chart .js-plotly-plot")[0]);
    });
    $("#dailyAverages_tab_link").click(function() {
    	Plotly.Plots.resize($("#dailyAverages-chart .js-plotly-plot")[0]);
    });
    $("#monthlyAverages_tab_link").click(function() {
    	Plotly.Plots.resize($("#monthlyAverages-chart .js-plotly-plot")[0]);
    });
    $("#monthlyAverages_tab_link").click(function() {
    	Plotly.Plots.resize($("#monthlyAverages-chart .js-plotly-plot")[0]);
    });
    $("#stab").click(function() {
    	Plotly.Plots.resize($("#sgraph")[0]);
    });
    $("#stab2").click(function() {
    	Plotly.Plots.resize($("#sgraph2")[0]);
    });
    $("#stab3").click(function() {
    	Plotly.Plots.resize($("#sgraph3")[0]);
    });
    $("#stab4").click(function() {
    	Plotly.Plots.resize($("#sgraph4")[0]);
    });

};

$(function() {
	// $("#app-content-wrapper").removeClass('show-nav');
	// $(".toggle-nav").removeClass('toggle-nav');

	//make sure active Plotly plots resize on window resize
    window.onresize = function() {
        $('#graph .modal-body .tab-pane.active .js-plotly-plot').each(function(){
            Plotly.Plots.resize($(this)[0]);
        });
    };
    init_map();
    map_events();
    resize_graphs();

    $('#datesSelect').change(function() { //when date is changed
        var sel_val = ($('#datesSelect option:selected').val()).split(',');
        console.log(sel_val)
        console.log(sel_val[0])
        var startdate = sel_val[0];
        var watershed = sel_val[1];
        console.log("problem");
        console.log(watershed);
        var subbasin = sel_val[2];
        var comid = sel_val[3];
        $('#forecast-loading').removeClass('hidden');
        get_time_series(watershed, subbasin, comid, startdate);
        get_forecast_percent(watershed, subbasin, comid, startdate);
    });
});
