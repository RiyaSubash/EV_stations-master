var apiKey = "btVdXlLhF1rgfMqkkAZv8aWClICR4ruk";
var centerCoords = [4.89218, 52.37187];
var initialZoom = 13;
var map = tt.map({
    key: apiKey,
    container: "map",
    center: centerCoords,
    zoom: initialZoom
});

var searchBoxInstance;
var startCornerLngLat;
var endCornerLngLat;
var mousePressed;
var drawBoundingBoxButtonPressed;
var layerFillID = "layerFillID";
var layerOutlineID = "layerOutlineID";
var sourceID = "sourceID";
var styleBase = "tomtom://vector/1/";
var styleS1 = "s1";
var styleRelative = "relative";
var refreshTimeInMillis = 30000;
var popupHideDelayInMilis = 4000;
var incidentListContainer = document.getElementById("incident-list");
var trafficFlowTilesToggle = document.getElementById("flow-toggle");

var trafficIncidentsTier = new tt.TrafficIncidentTier({
    key: apiKey,
    incidentDetails: {
        style: styleS1
    },
    incidentTiles: {
        style: styleBase + styleS1,
    },
    refresh: refreshTimeInMillis
});

var trafficFlowTilesTier = new tt.TrafficFlowTilesTier({
    key: apiKey,
    style: styleBase + styleRelative,
    refresh: refreshTimeInMillis
});

var commonSearchBoxOptions = {
    key: apiKey,
    center: map.getCenter()
};

function toggleTrafficFlowTilesTier() {
    if (trafficFlowTilesToggle.checked) {
        map.addTier(trafficFlowTilesTier);
    } else {
        map.removeTier(trafficFlowTilesTier.getId());
    }
}

function showTrafficIncidentsTier() {
    document.getElementById("incidents-toggle").checked = true;
    map.addTier(trafficIncidentsTier);
}

function hideTrafficIncidentsTier() {
    document.getElementById("incidents-toggle").checked = false;
    map.removeTier(trafficIncidentsTier.getId());
    clearIncidentList();
    removeBoundingBox();
}

function toggleTrafficIncidentsTier() {
    if (document.getElementById("incidents-toggle").checked) {
        showTrafficIncidentsTier();
    } else {
        hideTrafficIncidentsTier();
    }
}

function updateSearchBoxOptions() {
    var updatedOptions = Object.assign(commonSearchBoxOptions, {
        center: map.getCenter()
    });
    searchBoxInstance.updateOptions({
        minNumberOfCharacters: 0,
        searchOptions: updatedOptions,
        autocompleteOptions: updatedOptions
    });
}

function onSearchBoxResult(result) {
    map.flyTo({
        center: result.data.result.position,
        speed: 3
        
    });
    
    
}

function enableBoundingBoxDraw() {
    showInfoPopup("Click and drag to draw a bounding box");
    drawBoundingBoxButtonPressed = true;
    removeBoundingBox();
    clearIncidentList();
}

function getPopupWrapper() {
    return document.getElementById("popup-wrapper");
}

function showPopup(element) {
    element.style.opacity = "0.9";
}

function showInfoPopup(message) {
    var popupElementDiv = getPopupWrapper();
    popupElementDiv.innerHTML = getPopupInnerHTML("popup-info", message);
    showPopup(popupElementDiv);
}

function showErrorPopup(message) {
    var popupElementDiv = getPopupWrapper();
    popupElementDiv.innerHTML = getPopupInnerHTML("popup-error", message);
    showPopup(popupElementDiv);
}

function hidePopup(delayInMilis) {
    var element = getPopupWrapper();
    if (delayInMilis == 0) {
        element.style.opacity = "0";
    } else {
        setTimeout(function () {
            element.style.opacity = "0";
        }, delayInMilis);
    }
}

function getPopupInnerHTML(popupClass, popupMessage) {
    return `<div class="container ${popupClass} popup"> <div class="row"> <div class="col py-2"> <div class="row align-items-center pt-1"> <div class="col-sm-1"> <img src="img/error-symbol.png" alt=""/> </div><div id="popup-message" class="col"> ${popupMessage} </div></div></div></div></div>`;
}

function removeBoundingBox() {
    if (map.getSource(sourceID)) {
        map.removeLayer(layerFillID);
        map.removeLayer(layerOutlineID)
        map.removeSource(sourceID);
    }
}

function onMouseDown(eventDetails) {
    if (drawBoundingBoxButtonPressed) {
        eventDetails.preventDefault();
        mousePressed = true;
        startCornerLngLat = eventDetails.lngLat;
        removeBoundingBox();
        map.addSource(sourceID, getPolygonSource(startCornerLngLat, startCornerLngLat));
        map.addLayer({
            id: layerFillID,
            type: "fill",
            source: sourceID,
            layout: {},
            paint: {
                "fill-color": "#666",
                "fill-opacity": 0.1
            }
        });
        map.addLayer({
            id: layerOutlineID,
            type: "line",
            source: sourceID,
            layout: {},
            paint: {
                "line-width": 4,
                "line-color": "#424242",
                "line-dasharray": [2, 1],
                "line-blur": 0.5
            }
        });
    }
}

function onMouseMove(eventDetails) {
    if (mousePressed) {
        endCornerLngLat = eventDetails.lngLat;
        updateRectangleData(startCornerLngLat, endCornerLngLat);
    }
}

function onMouseUp(eventDetails) {
    mousePressed = false;
    hidePopup(0);
    if (drawBoundingBoxButtonPressed) {
        endCornerLngLat = eventDetails.lngLat;
        if (bothLngLatAreDifferent(startCornerLngLat, endCornerLngLat)) {
            updateRectangleData(startCornerLngLat, endCornerLngLat);
            clearIncidentList();
            displayTrafficIncidents(getLngLatBoundsForIncidentDetailsCall(startCornerLngLat, endCornerLngLat));
            showTrafficIncidentsTier();
        } else {
            showErrorPopup("Try to select bigger bounding box.");
            hidePopup(popupHideDelayInMilis);
        }
    }
    drawBoundingBoxButtonPressed = false;
}

function bothLngLatAreDifferent(lngLat1, lngLat2) {
    return lngLat1.lat !== lngLat2.lat && lngLat1.lng !== lngLat2.lng;
}

function updateRectangleData(startCornerLngLat, endCornerLngLat) {
    map.getSource(sourceID).setData(getPolygonSourceData(startCornerLngLat, endCornerLngLat));
}

function getLngLatBoundsForIncidentDetailsCall(startCornerLngLat, endCornerLngLat) {
    var bottomLeftCorner = new tt.LngLat(
        startCornerLngLat.lng < endCornerLngLat.lng ? startCornerLngLat.lng : endCornerLngLat.lng,
        startCornerLngLat.lat < endCornerLngLat.lat ? startCornerLngLat.lat : endCornerLngLat.lat);
    var topRightCorner = new tt.LngLat(
        startCornerLngLat.lng > endCornerLngLat.lng ? startCornerLngLat.lng : endCornerLngLat.lng,
        startCornerLngLat.lat > endCornerLngLat.lat ? startCornerLngLat.lat : endCornerLngLat.lat);
    return tt.LngLatBounds.convert([bottomLeftCorner.toArray(), topRightCorner.toArray()]);
}

function getPolygonSourceData(startCornerLngLat, endCornerLngLat) {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [startCornerLngLat.lng, startCornerLngLat.lat],
                    [startCornerLngLat.lng, endCornerLngLat.lat],
                    [endCornerLngLat.lng, endCornerLngLat.lat],
                    [endCornerLngLat.lng, startCornerLngLat.lat],
                    [startCornerLngLat.lng, startCornerLngLat.lat]
                ]
            ]
        }
    };
}

function getPolygonSource(startCornerLngLat, endCornerLngLat) {
    return {
        type: "geojson",
        data: getPolygonSourceData(startCornerLngLat, endCornerLngLat)
    };
}

function clearIncidentList() {
    incidentListContainer.innerHTML = "";
}

function isCluster(incident) {
    return incident.id.includes("CLUSTER");
}

function displayTrafficIncidents(boundingBox) {
    var iconsMapping = ["danger", "accident", "fog", "danger", "rain", "ice", "incident", "laneclosed", "roadclosed", "roadworks", "wind", "flooding", "detour", "hospital"];
    var delayMagnitudeMapping = ["unknown", "minor", "moderate", "major", "undefined"];

    tt.services.incidentDetails({
            key: apiKey,
            boundingBox: boundingBox,
            style: styleS1,
            zoomLevel: parseInt(map.getZoom())
        })
        .go()
        .then(function (results) {
            if (results.tm.poi.length === 0) {
                showErrorPopup("There are no traffic incidents in this area.");
                hidePopup(popupHideDelayInMilis);
            } else {
                results.tm.poi.forEach(function (incident) {
                    var buttonListItem = createButtonItem(incident.p);

                    if (isCluster(incident)) {
                        buttonListItem.innerHTML = getButtonClusterContent(incident.id, incident.cs, delayMagnitudeMapping[incident.ty]);
                        incidentListContainer.appendChild(buttonListItem);
                    } else {
                        buttonListItem.innerHTML = getButtonIncidentContent(incident.d.toUpperCase(), iconsMapping[incident.ic], delayMagnitudeMapping[incident.ty], incident.f, incident.t);
                        incidentListContainer.appendChild(buttonListItem);
                    }
                });
            }
        });
}

function createButtonItem(incidentPosition) {
    var incidentBtn = document.createElement("button");
    incidentBtn.setAttribute("type", "button");
    incidentBtn.classList.add("list-group-item", "list-group-item-action", "incidendDetailsListItemButton");
    incidentBtn.addEventListener("click", function () {
        map.flyTo({
            center: incidentPosition
        });
    }, false);

    return incidentBtn;
}

function getButtonIncidentContent(description, iconCategory, delayMagnitude, fromAddress, toAddress) {
    return `<div class="row align-items-center pb-2"> <div class="col-sm-2"> <div class="tt-traffic-icon"> <div class="tt-icon-circle-${delayMagnitude} traffic-icon"> <div class="tt-icon-${iconCategory}"></div></div></div></div><div class="col label pl-0"> ${description} </div></div><div class="row"> <div class="col-sm-2"><label class="label">From: </label></div><div class="col"><label class="incident-details-list-normal-text">${fromAddress}</label> </div></div><div class="row"> <div class="col-sm-2"><label class="label">To: </label></div><div class="col"><label class="incident-details-list-normal-text">${toAddress}</label></div></div>`;
}

function getButtonClusterContent(description, numberOfIncidents, delayMagnitude) {
    return `<div class="row align-items-center pb-2"> <div class="col-sm-2"> <div class="tt-traffic-icon"> <div class="tt-icon-circle-${delayMagnitude} traffic-icon"> <div id="cluster-icon" class="tt-icon-number">${numberOfIncidents}</div></div></div></div><div class="col label pl-0"> ${description} </div></div>`;
}

function initApplication() {
    searchBoxInstance = new tt.plugins.SearchBox(tt.services, {
        minNumberOfCharacters: 0,
        labels: {
            placeholder: "Search"
        },
        noResultsMessage: "No results found.",
        searchOptions: commonSearchBoxOptions,
        autocompleteOptions: commonSearchBoxOptions
    });

    searchBoxInstance.on("tomtom.searchbox.resultselected", onSearchBoxResult);

    document.getElementById("search-panel").append(searchBoxInstance.getSearchBoxHTML());
    trafficFlowTilesToggle.addEventListener("change", toggleTrafficFlowTilesTier);
    document.getElementById("incidents-toggle").addEventListener("change", toggleTrafficIncidentsTier);
    document.getElementById("bounding-box-button").addEventListener("click", enableBoundingBoxDraw);

    map.on("mousedown", onMouseDown);
    map.on("mouseup", onMouseUp);
    map.on("mousemove", onMouseMove);
    map.on("moveend", updateSearchBoxOptions);
}

initApplication();