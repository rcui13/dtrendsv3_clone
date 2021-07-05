requirejs([
    'globeObject',
    '../config/clientConfig'
    , 'menu'
], function (newGlobe,clientConfig) {

    "use strict";

    // Web Map Service information from NASA's Near Earth Observations WMS
    let serviceAddress1 = clientConfig.serviceAddress1;
    let serviceAddress2 = clientConfig.serviceAddress2;
    let secondDownload = false;
    // let preloadWmsLayers = [];//preload entire layer name

    //preload wmsLayer by getting the xml file of wmslayer and pass the file into  createLayer function.
    $.get(serviceAddress1).done(createWMSLayer).fail(logError);

    function createWMSLayer(xmlDom) {

        // Create a WmsCapabilities object from the XML DOM
        let wms = new WorldWind.WmsCapabilities(xmlDom);

        // Retrieve a WmsLayerCapabilities object by the desired layer name
        $(".WmsLayer").each(function (i) {
            let parsed = $(this).val();

            if (!parsed) return true;
            let wmsLayerCapability = wms.getNamedLayer(parsed);

            // Form a configuration object from the wmsLayerCapability object
            if (!wmsLayerCapability) return true;
            let wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapability);

            // Modify the configuration objects title property to a more user friendly title
            if (!wmsLayerCapability) return true;
            wmsConfig.title = parsed;

            // Create the WMS Layer from the configuration object
            let wmsLayer = new WorldWind.WmsLayer(wmsConfig);
            wmsLayer.enabled = false;

            // Add the layers to WorldWind and update the layer manager
            newGlobe.addLayer(wmsLayer);
        });
    }

    // Called if an error occurs during WMS Capabilities document retrieval
    function logError(jqXhr, text, exception) {
        // secondDownload = !secondDownload;
        console.warn("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);

        if (secondDownload) {
            $.get(serviceAddress2).done(createWMSLayer).fail(logError);
            $.get('/reDownload');
        } else {
            console.error("WMS loading fail!");
            alert("WMS Layers not generated properly... Sentinel Satellite layers may not be available");
            // // $.get(serviceAddress1).done(createWMSLayer).fail(logError);
            // location.reload();
            $('#FoodSecurity--SentinelSatelliteData').find("a").addClass("disabled-icon");
            $('#FoodSecurity--SentinelSatelliteData').find("input").disabled = true;
            return false;
        }
    }


});
