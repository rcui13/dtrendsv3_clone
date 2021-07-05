define([
    '../scripts/globeObject',
    './canvasPKobject',
    './imgPKobject',
    './Error',
    './LayerManager',
    './jquery-csv-1.0.11'
    // ,'./initPL'
], function (newGlobe, canvasPKobject, imagePK, ErrorReturn, LayerManager) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);
    let pLayer;

    function vaccinePK(date, type, flag, countries, continents="none") {

        let numDM = 0;
        let numDV = 0;
        let numT = 0;
        let numI = 0;
        let numCV = 0;
        let sortLayersLocation = 0;
        continents = continents.trim();
        continents = continents.split(' ').join('_');

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/1dVaccineData',
            type: 'GET',
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    // if (flag !== "init") {
                    //     deletePK();
                    //     console.log("delete")
                    // }

                    resp.data.forEach(function (el, i) {
                        if (i === 0){
                            pLayer = new WorldWind.RenderableLayer(el.CountryName);
                            if (continents === "none") {
                                pLayer.enabled = true;
                            } else {
                                pLayer.enabled = el.Continent === continents;
                            }
                            pLayer.layerType = 'V_PKLayer';
                            pLayer.continent = el.Continent;
                        }
                        let colorT = "0.3 1 1";
                        let colorI = "1 0.5 0";
                        let colorC = "0.55 0.51 0.54";
                        let colorDV = "0 1 0";
                        let colorDVM = "0.5 0.1 0.6";

                        let cTotal = colorT.split(' ');
                        let cIncomplete = colorI.split(' ');
                        let cComplete = colorC.split(' ');
                        let cDailyV = colorDV.split(' ');
                        let cDailyVM = colorDVM.split(' ');

                        let totalPK = new canvasPKobject(cTotal, el.Latitude, el.Longitude, sizePK(el.total_vaccinations));
                        let incompletePK = new canvasPKobject(cIncomplete, el.Latitude, el.Longitude, sizePK(el.people_vaccinated - el.people_fully_vaccinated));
                        let completePK = new canvasPKobject(cComplete, el.Latitude, el.Longitude, sizePK(el.people_fully_vaccinated));
                        let dailyVPK = new canvasPKobject(cDailyV, el.Latitude, el.Longitude, sizePK(el.daily_vaccinations));
                        let dailyVMPK = new canvasPKobject(cDailyVM, el.Latitude, el.Longitude, sizePK(el.daily_vaccinations_per_million));

                        totalPK.pk.userProperties.Date = el.date;
                        totalPK.pk.userProperties.Type = "Total Vaccinations";
                        totalPK.pk.userProperties.dName = el.location;
                        totalPK.pk.userProperties.Number = el.total_vaccinations;

                        incompletePK.pk.userProperties.Date = el.date;
                        incompletePK.pk.userProperties.Type = "Incomplete Vaccinations";
                        incompletePK.pk.userProperties.dName = el.location;
                        incompletePK.pk.userProperties.Number = el.people_vaccinated - el.people_fully_vaccinated;

                        completePK.pk.userProperties.Date = el.date;
                        completePK.pk.userProperties.Type = "Completed Vaccinations";
                        completePK.pk.userProperties.dName = el.location;
                        completePK.pk.userProperties.Number = el.people_fully_vaccinated;

                        dailyVPK.pk.userProperties.Date = el.date;
                        dailyVPK.pk.userProperties.Type = "Daily Vaccinations";
                        dailyVPK.pk.userProperties.dName = el.location;
                        dailyVPK.pk.userProperties.Number = el.daily_vaccinations;

                        dailyVMPK.pk.userProperties.Date = el.date;
                        dailyVMPK.pk.userProperties.Type = "Daily Vaccinations/million";
                        dailyVMPK.pk.userProperties.dName = el.location;
                        dailyVMPK.pk.userProperties.Number = el.daily_vaccinations_per_million;

                        if (el.Date === resp.data[resp.data.length - 1].Date) {
                            totalPK.pk.enabled = false;
                            incompletePK.pk.enabled = false;
                            completePK.pk.enabled = false;
                            dailyVPK.pk.enabled = false;
                            dailyVMPK.pk.enabled = false;

                            numT += parseInt(totalPK.pk.userProperties.Number);
                            numI += parseInt(incompletePK.pk.userProperties.Number);
                            numCV += parseInt(completePK.pk.userProperties.Number);
                            numDV += parseInt(dailyVPK.pk.userProperties.Number);
                            numDM += parseInt(dailyVMPK.pk.userProperties.Number);
                            // sortLayersLocation += 1;
                        } else{
                            totalPK.pk.enabled = false;
                            incompletePK.pk.enabled = false;
                            completePK.pk.enabled = false;
                            dailyVPK.pk.enabled = false;
                            dailyVMPK.pk.enabled = false;
                        }
                        newGlobe.redraw();

                        pLayer.addRenderables([totalPK.pk
                            , incompletePK.pk, completePK.pk, dailyVPK.pk, dailyVMPK.pk
                            ]
                        );
                        // console.log("add renderables")
                        if (i !== resp.data.length - 1) {
                            if (el.CountryName !== resp.data[i + 1].CountryName) {
                                // add current placemark layer onto worldwind layer obj
                                // console.log("add layers")
                                let layers = newGlobe.layers;
                                const a = layers.findIndex(ele => ele.displayName.trim() === pLayer.displayName.trim());
                                if (layers[a] != undefined && layers.enabled === false){
                                    layers[a].addRenderables([totalPK.pk
                                        , incompletePK.pk, completePK.pk, dailyVPK.pk, dailyVMPK.pk
                                    ]);
                                    newGlobe.redraw();
                                } else {
                                    newGlobe.addLayer(pLayer);
                                    newGlobe.redraw();
                                    layerManager.synchronizeLayerList();
                                }

                                //create new placemark layer for next country
                                pLayer = new WorldWind.RenderableLayer(resp.data[i + 1].CountryName);
                                if (continents === "none") {
                                    pLayer.enabled = true;
                                } else {
                                    pLayer.enabled = el.Continent === continents;
                                }
                                pLayer.layerType = 'V_PKLayer';
                                pLayer.continent = resp.data[i + 1].Continent;
                            }
                        } else {
                            // add current placemark layer onto worldwind layer obj
                            let layers = newGlobe.layers;
                            const a = layers.findIndex(ele => ele.displayName.trim() === pLayer.displayName.trim());

                            // console.log("add layer to WW obj");
                            if (layers[a] != undefined && layers.enabled === false){
                                layers[a].addRenderables([totalPK.pk
                                    , incompletePK.pk, completePK.pk, dailyVPK.pk, dailyVMPK.pk
                                ]);
                                newGlobe.redraw();
                                layerManager.synchronizeLayerList();
                                $('#totVaccinations').text(numT);
                                $('#incVaccinations').text(numI);
                                $('#comVaccinations').text(numCV);
                                $('#daiVaccinations').text(numDV);
                                $('#milVaccinations').text(numDM);
                            } else {
                                newGlobe.addLayer(pLayer);
                                newGlobe.redraw();
                                layerManager.synchronizeLayerList();
                                $('#totVaccinations').text(numT);
                                $('#incVaccinations').text(numI);
                                $('#comVaccinations').text(numCV);
                                $('#daiVaccinations').text(numDV);
                                $('#milVaccinations').text(numDM);
                            }

                        }
                    });
                    // if (flag == "init") {
                    //     console.log(sortLayersLocation);
                    //     $("#hInfectionSlider").slider({max: sortLayersLocation, values: [0, sortLayersLocation]});
                    //     $("#hInfectionsValue").text("0 to " + sortLayersLocation + " Locations");
                    //     sessionStorage.setItem('vaccInfectionMax', sortLayersLocation);
                    // }
                } else {
                    ErrorReturn("vaccination", "1dVaccineData" , true);
                }
            }
        })
    }
    function sizePK(num) {
        let magnitude = 0;
        if (num > 0 && num <= 5) {
            magnitude = 0.05;
        } else if (num > 5 && num <= 25) {
            magnitude = 0.07;
        } else if (num > 25 && num <= 75) {
            magnitude = 0.13;
        } else if (num > 75 && num <= 150) {
            magnitude = 0.17;
        } else if (num > 150 && num <= 250) {
            magnitude = 0.22;
        } else if (num > 250 && num <= 350) {
            magnitude = 0.25;
        } else if (num > 350 && num <= 600) {
            magnitude = 0.28;
        } else if (num > 600 && num <= 1100) {
            magnitude = 0.3;
        } else if (num > 1100 && num <= 2500) {
            magnitude = 0.40;
        } else if (num > 2500 && num <= 7500) {
            magnitude = 0.45;
        } else if (num > 7500 && num <= 11000) {
            magnitude = 0.5;
        } else if (num > 11000) {
            magnitude = 0.6;
        }

        return magnitude
    }
    // function deletePK() {
    //     for (let j = 6; j < newGlobe.layers.length - 1; j++) {
    //         if (newGlobe.layers[j].layerType === 'V_PKLayer') {
    //             newGlobe.removeLayer(newGlobe.layers[j]);
    //         }
    //     }
    // }

    return vaccinePK;
});
