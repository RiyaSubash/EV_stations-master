const application = {
    key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
    name: 'EV Routing',
    version: '1.0'
  };
  
  const appearance = {
    marker: {
      color: {
        start: 'green',
        finish: 'red',
        leg: 'blue'
      }
    },
    line: {
      color: '#224488',
      width: 6,
      padding: 40,
      join: 'round',
      cap: 'round'
    }
  };
  
  const ids = {
    html: {
      map: 'map',
      start: 'start',
      finish: 'finish',
      summary: 'summary'
    },
    route: {
      source: 'routeSource',
      layer: 'routeLayer'
    }
  };
  
  const labels = {
    lengthInMeters: 'Travel Distance (km)',
    travelTimeInSeconds: 'Travel Time',
    trafficDelayInSeconds: 'Traffic Delay',
    batteryConsumptionInkWh: 'Battery Consumption (kWh)',
    remainingChargeAtArrivalInkWh: 'Remaining Charge (kWh)',
    totalChargingTimeInSeconds: 'Total Charging Time',
    targetChargeInkWh: 'Target Charge (kWh)',
    chargingTimeInSeconds: 'Charging Time',
    routeSummary: 'Route Summary',
    legSummary: 'Route Leg #%s'
  }
  
  const units = {
    metersPerKilometer: 1000,
    secondsPerMinute: 60,
    secondsPerHour: 3600
  };
  
  const markers = [];
  var finishLocation;
  var routeData;
  var startLocation;
  
  init();
  
  function addLegMarker(leg, index, lastIndex) {
    if (index == lastIndex)
      return;
  
    const points = leg.points;    
    const lastPointIndex = points.length - 1;
    if (lastPointIndex < 0)
      return;
  
    addMarker(points[lastPointIndex], appearance.marker.color.leg);
  }
  
  function addMarker(position, color) {
    markers.push(new tt.Marker({ color: color })
      .setLngLat(position)
      .addTo(map));
  }
  
  function addRoute(geoJson) {
    displayMessage('Adding route to map...');
  
    map.addSource(ids.route.source, { type:  'geojson',  data: geoJson });
  
    map.addLayer({
      id: ids.route.layer,
      type: 'line',
      source: ids.route.source,
      layout: { 'line-join': appearance.line.join, 'line-cap': appearance.line.cap },
      paint: { 'line-color': appearance.line.color, 'line-width': appearance.line.width }
    });
  }
  
  function addRouteLegs(route, callbackFunction, argument) {
    if (!route.hasOwnProperty('legs'))
      return;
  
    const legs = route.legs;
    if (legs.length < 2)
      return;
  
    const lastIndex = legs.length - 1;
  
    legs.forEach(function(leg, index) {
      callbackFunction(leg, index, lastIndex, argument);
    });
  }
  
  function addRouteMarkers(route) {
    displayMessage('Adding route markers to map...');
  
    addRouteLegs(route, addLegMarker);
    addMarker(startLocation.position, appearance.marker.color.start);
    addMarker(finishLocation.position, appearance.marker.color.finish);
  }
  
  function addRouteSummary(route) {
    const summary = clearRouteSummary();
    appendSummary(summary, route.summary, labels.routeSummary);
    addRouteLegs(route, appendLegSummary, summary);
  }
  
  function appendHeading(element, label, headingStyle) {
    const heading = document.createElement(headingStyle || 'h3');
    heading.textContent = label;
    element.appendChild(heading);
  }
  
  function appendLabelValue(element, label, value) {
    const span = document.createElement('span');
    span.textContent = label + ': ' + value;
  
    appendLineBreak(element);
    element.appendChild(span);
  }
  
  function appendLegSummary(leg, index, lastIndex, summary) {
    appendSummary(summary, leg.summary, labels.legSummary.replace('%s', index + 1));
  }
  
  function appendLineBreak(element, child) {
    const lastChild = element.lastChild;
    const lastTagName = lastChild == null ? null : lastChild.tagName;
  
    if (lastTagName != null && lastTagName.charAt(0) != 'H')
      element.appendChild(document.createElement('br'));
  }
  
  function appendProperty(element, options, label, name, format) {
    if (options.hasOwnProperty(name))
      appendLabelValue(element, label,
        format == null ? options[name] : format(options[name]));
  }
  
  function appendSummary(summary, properties, heading) {
    appendHeading(summary, heading);
    appendProperty(summary, properties, labels.lengthInMeters,
      'lengthInMeters', formatMetersToKilometers);
    appendProperty(summary, properties, labels.travelTimeInSeconds,
      'travelTimeInSeconds', formatSecondsToTime);
    appendProperty(summary, properties, labels.trafficDelayInSeconds,
      'trafficDelayInSeconds', formatSecondsToTime);
    appendProperty(summary, properties, labels.batteryConsumptionInkWh,
      'batteryConsumptionInkWh', formatFixedDecimal);
    appendProperty(summary, properties, labels.remainingChargeAtArrivalInkWh,
      'remainingChargeAtArrivalInkWh', formatFixedDecimal);
    appendProperty(summary, properties, labels.totalChargingTimeInSeconds,
      'totalChargingTimeInSeconds', formatSecondsToTime);
  
    if (!properties.hasOwnProperty('chargingInformationAtEndOfLeg'))
      return;
  
    properties = properties.chargingInformationAtEndOfLeg;
  
    appendProperty(summary, properties, labels.targetChargeInkWh,
      'targetChargeInkWh', formatFixedDecimal);
    appendProperty(summary, properties, labels.chargingTimeInSeconds,
      'chargingTimeInSeconds', formatSecondsToTime);
  }
  
  function calculateRoute(finishResults) {
    finishLocation = getLocation(finishResults, ids.html.finish);
    if (finishLocation == null)
      return;
  
    displayMessage('Calculating route...');
  
    calculateLongDistanceEVRoute({
        key: application.key,
        locations: [startLocation.position, finishLocation.position],
        avoid: 'unpavedRoads',
        vehicleEngineType: 'electric',
        vehicleWeight: consumptionModel.vehicleWeight,
        accelerationEfficiency: consumptionModel.accelerationEfficiency,
        decelerationEfficiency: consumptionModel.decelerationEfficiency,
        uphillEfficiency: consumptionModel.uphillEfficiency,
        downhillEfficiency: consumptionModel.downhillEfficiency,
        constantSpeedConsumptionInkWhPerHundredkm: consumptionModel.constantSpeedConsumptionInkWhPerHundredkm,
        currentChargeInkWh: consumptionModel.currentChargeInkWh,
        maxChargeInkWh: consumptionModel.maxChargeInkWh,
        auxiliaryPowerInkW: consumptionModel.auxiliaryPowerInkW,
        minChargeAtDestinationInkWh: minChargeAtDestinationInkWh,
        minChargeAtChargingStopsInkWh: minChargeAtDestinationInkWh,
        chargingModes : chargingModes
      })
      .go()
      .then(displayRoute)
      .catch(function(error) {
        if (error.hasOwnProperty('message'))
          error = error.message;
  
        displayMessage('Error calculating route. ' + error);
      });
  }
  
  function clearRoute() {
    clearRouteSummary();
  
    while(markers.length > 0)
      markers.pop().remove();
  
    if (routeData != null) {
      map.removeLayer(ids.route.layer);
      map.removeSource(ids.route.source);
    }
    routeData = null;
  }
  
  function clearRouteSummary() {
    const summary = document.getElementById(ids.html.summary);
    while(summary.firstChild)
      summary.removeChild(summary.firstChild);
  
    return summary;
  }
  
  function displayMessage(message) {
    const summary = document.getElementById(ids.html.summary);
    summary.textContent = message;
  }
  
  function displayRoute(results) {
    if (results == null) {
      displayMessage('No suitable route was found.');
      return;
    }
  
    routeData = results;
  
    displayMessage('Formatting data for map...');
    const geoJson = routeData.toGeoJson();
    const route = routeData.routes[0];
  
    addRoute(geoJson);
    addRouteMarkers(route);
    fitMapToRoute(geoJson);
    addRouteSummary(route);
  }
  
  function findFinish(startResults) {
     startLocation = getLocation(startResults, ids.html.start);
     if (startLocation != null)
       findLocation(ids.html.finish, calculateRoute);
  }
  
  function findLocation(elementId, callbackFunction) {
     displayMessage('Finding ' + elementId + ' location...');
  
     const queryText = getValue(elementId);
  
     tt.services.fuzzySearch({ key: application.key, query:  queryText })
        .go()
        .then(callbackFunction)
        .catch(function(error) {
          displayMessage('Could not find ' + elementId + ' (' + queryText + '). ' + error.message);
        });
  }
  
  function fitMapToRoute(geoJson) {
    displayMessage('Fitting map to route...');
  
    const bounds = getBounds(geoJson);
    map.fitBounds(bounds, { padding: appearance.line.padding });
  }
  
  function formatMetersToKilometers(meters) {
    return (meters / units.metersPerKilometer).toFixed(3);
  }
  
  function formatSecondsToTime(seconds) {
    const hours = Math.floor(seconds / units.secondsPerHour);
    seconds -= hours * units.secondsPerHour;
  
    const minutes = Math.floor(seconds / units.secondsPerMinute);
    seconds -= minutes * units.secondsPerMinute;
  
    return hours + ':' +
      ((minutes < 10) ? '0' + minutes : minutes) + ':' +
      ((seconds < 10) ? '0' + seconds : seconds);
  }
  
  function formatFixedDecimal(value) {
    return value.toFixed(4);
  }
  
  function findStart() {
     if (!map.loaded()) {
       displayMessage('Please try again later, map is still loading.');
       return;
     }
  
     clearRoute();
     findLocation(ids.html.start, findFinish);
  }
  
  function getBounds(geoJson) {
    const bounds = new tt.LngLatBounds();
  
    bounds.extend(startLocation.position);
    bounds.extend(finishLocation.position);
  
    geoJson.features.forEach(function(feature) {
      feature.geometry.coordinates.forEach(function(coordinate) {
        bounds.extend(coordinate);
      });
    });
  
    return bounds;
  }
  
  function getLocation(results, elementId) {
     if (results.results.length > 0)
       return results.results[0];
  
    displayMessage('Could not find ' + elementId + ' (' + getValue(elementId) + ').');
    return null;
  }
  
  function getValue(elementId) {
    return document.getElementById(elementId).value;
  }
  
  function init() {
    tt.setProductInfo(application.name, application.version);
    map = tt.map({ key: application.key, container: ids.html.map });
  }