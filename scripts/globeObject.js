// exports the globe to at top-level

define(['./WorldWindShim'],function (WorldWind) {
    "use strict";

    // Load Globe
    // let wwd = window.WorldWind;
    let globe = new WorldWind.WorldWindow('canvasOne');

    let layers = [
        // {layer: new WorldWind.BMNGLayer(), enabled: true},
        // {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
        // {layer: new WorldWind.AtmosphereLayer(), enabled: true},
        // {layer: new WorldWind.BingAerialLayer(), enabled: false},
        // {layer: new WorldWind.BMNGOneImageLayer(), enabled: true},
        {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
        {layer: new WorldWind.BingRoadsLayer(), enabled: false},
        {layer: new WorldWind.CompassLayer(), enabled: true},
        {layer: new WorldWind.CoordinatesDisplayLayer(globe), enabled: true},
        {layer: new WorldWind.ViewControlsLayer(globe), enabled: true},
        {layer: new WorldWind.AtmosphereLayer(), enabled: true}
    ];

    globe.navigator.lookAtLocation.altitude = 0;
    globe.navigator.range = 2e7;
    layers[2].layer._compass.size = 0.05;
    layers[4].layer.placement.y = 49;
    layers[4].layer.placement.x = window.innerWidth-200;

    for (let l = 0; l < layers.length; l++) {
        layers[l].layer.enabled = layers[l].enabled;
        layers[l].layer.hide = layers[l].hide;
        globe.addLayer(layers[l].layer);
    }

    //Tell wouldwind to log only warnings and errors.
    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

    return globe
});