requirejs([
    './globeObject'
    , './imgPKobject'
    ,'./csvData'
    ,'./jquery-csv-1.0.11'
], function (newGlobe, imagePK,csvData) {
    "use strict";

    let aLayer;

    //Data type list
    let dataTypes = ['Country', 'Weather Station'];

    dataTypes.forEach(async function (el, index){
        await genPLPK(el, index, csvData.csv1);

        if (index == dataTypes.length - 1) {
            newGlobe.redraw();
        }
    })

   function genPLPK(dType, i, csvData) {
        // create placemark layer for AgroSphere
       aLayer = new WorldWind.RenderableLayer(dType + " PK");
       aLayer.enabled = false;

       let apkArr = [];
        // Create the placemark and its label.
       csvData[i].forEach(function (e, j, arr) {
           let lat = parseFloat(e.lat); //Convert from string or other formats into a float
           let lon = parseFloat(e.lon);
           let imgSource = "";

           //Handle the string is based on the type we determine
           if (dType === 'Country') {
               aLayer.layerType = 'Country_Placemarks';
               imgSource = 'images/flags/' + e.iconCode + '.png'; //Locates image source for country flag
           } else if (dType === 'Weather Station') {
               aLayer.layerType = 'Weather_Station_Placemarks';
               imgSource = 'images/sun.png';
           } else {
               console.warn("Read layer type in error");
           }

           // create AgroSphere placemark
           let agroPK = new imagePK(lat, lon, imgSource);
           if (e.country !== "undefined" && e.country !== undefined) {
               agroPK.pk.userProperties.country = e.country;
           } else if (e.stationName !== "undefined" && e.stationName !== undefined) {
               agroPK.pk.userProperties.country = e.stationName.charAt(0) + e.stationName.charAt(1);
               agroPK.pk.userProperties.stationName = e.stationName;
           }

           apkArr.push(agroPK.pk);

           if (j === arr.length - 2) {
               // add AgroSphere placemark onto AgroSphere Placemark Layer.
               newGlobe.redraw();
               aLayer.addRenderables(apkArr);
               newGlobe.addLayer(aLayer);
               arr.length = j + 1; // Behaves like \`break
           }
       })
    }
});