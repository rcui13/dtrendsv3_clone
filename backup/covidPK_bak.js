define([
    '../scripts/globeObject',
    './canvasPKobject',
    '../config/clientConfig.js',
    './imgPKobject',
    './jquery-csv-1.0.11'
], function (newGlobe, canvasPKobject, clientConfig) {
    "use strict";

    let pLayer;
    let countryArr = [];
    let xfgb;
    let countryindex = {};
    let findCountryIndex;


    function covidPK(date, type, flag, middate ="none", continents="none", countries) {
        // console.log(date);

        // let csvdata = loadCSVData();

        // generatePlacemarkLayer(csvdata);
        //define colors for the placemarks
        let colorC = "1 0 0";
        // let colorC = "0.3 1 1";
        let colorD = "0 0 0";
        let colorR = "0.4 1 0.2 ";
        let colorA = "0.9 0.6 0";

        // let dict = {}

        let numC = 0;
        let numD = 0;
        let numR = 0;
        let numA = 0;
        //color arrays
        let cConfirmed = colorC.split(' ');
        let cDeath = colorD.split(' ');
        let cRecovered = colorR.split(' ');
        let cActive = colorA.split(' ');

        if (countries === null && continents == null) {}

        continents = continents.trim()
        continents = continents.split(' ').join('_')

        // console.log(newGlobe.layers.length);
        // if (newGlobe.layers[7] != null && newGlobe.layers[7].displayName != null && newGlobe.layers[7].displayName == "Weather_Station_PK") {
        //     xfgb = 8;
        // } else if (newGlobe.layers[5] != null && newGlobe.layers[5].displayName == "Atmosphere") {
        //     xfgb = 6;
        // } else {
        //     xfgb = "";
        // }

        //Finds length of newGlobe.layers
        xfgb = newGlobe.layers.length;

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/covidData',
            type: 'GET',
            // data: {date: date, countries: countries, continents: continents},
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {
                // console.log(resp);
                // console.log(resp.data);
                // console.log(countryindex)
                if (!resp.error) {
                    if(flag == "load"){
                        // resp.data.forEach(function (el, i) {
                        //     if (i === 0) {
                        //         //find placemark layer
                        //         let pCountry = el.CountryName;
                        //         console.log(countryindex)
                        //         console.log(countryindex[pCountry]);
                        //
                        //         // let findLayerIndex = newGlobe.layers.findIndex(element => element.displayName === el.CountryName);// what if it's not found? what to do then?
                        //         // pLayer = newGlobe.layers[findLayerIndex];
                        //         pLayer = newGlobe.layers[countryindex[pCountry]];
                        //
                        //         console.log(pLayer)
                        //     }
                        //
                        //     let confirmedPK = new canvasPKobject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                        //     let deathPK = new canvasPKobject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                        //     let recoveredPK = new canvasPKobject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                        //     let activePK = new canvasPKobject(cActive, el.Latitude, el.Longitude, sizePK(el.CaseNum - el.DeathNum - el.RecovNum));
                        //
                        //     confirmedPK.pk.userProperties.Date = el.Date;
                        //     confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                        //     confirmedPK.pk.userProperties.dName = el.LocName;
                        //     confirmedPK.pk.userProperties.Number = el.CaseNum;
                        //
                        //     deathPK.pk.userProperties.Date = el.Date;
                        //     deathPK.pk.userProperties.Type = "Deaths";
                        //     deathPK.pk.userProperties.dName = el.LocName;
                        //     deathPK.pk.userProperties.Number = el.DeathNum;
                        //
                        //     recoveredPK.pk.userProperties.Date = el.Date;
                        //     recoveredPK.pk.userProperties.Type = "Recoveries";
                        //     recoveredPK.pk.userProperties.dName = el.LocName;
                        //     recoveredPK.pk.userProperties.Number = el.RecovNum;
                        //
                        //     activePK.pk.userProperties.Date = el.Date;
                        //     activePK.pk.userProperties.Type = "Active Cases";
                        //     activePK.pk.userProperties.dName = el.LocName;
                        //     activePK.pk.userProperties.Number = el.CaseNum - el.DeathNum - el.RecovNum;
                        //
                        //     // disable all the placemarks except requested date
                        //     if (el.Date === resp.data[resp.data.length - 1].Date) {
                        //         confirmedPK.pk.enabled = true;
                        //         deathPK.pk.enabled = false;
                        //         recoveredPK.pk.enabled = false;
                        //         activePK.pk.enabled = false;
                        //
                        //         confirmedPK.pk.hide = true;
                        //         deathPK.pk.hide = true;
                        //         recoveredPK.pk.hide = true;
                        //         activePK.pk.hide = true;
                        //     } else {
                        //         confirmedPK.pk.enabled = false;
                        //         deathPK.pk.enabled = false;
                        //         recoveredPK.pk.enabled = false;
                        //         activePK.pk.enabled = false;
                        //
                        //         confirmedPK.pk.hide = true;
                        //         deathPK.pk.hide = true;
                        //         recoveredPK.pk.hide = true;
                        //         activePK.pk.hide = true;
                        //     }
                        //
                        //     // add current placemark layer onto worldwind layer obj
                        //     newGlobe.redraw();
                        //
                        //     pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);
                        //     //add placemarks onto placemark layer
                        //     if (i !== resp.data.length - 1) {
                        //         if (el.CountryName !== resp.data[i + 1].CountryName) {
                        //             newGlobe.redraw();
                        //         }
                        //     } else {
                        //         newGlobe.redraw();
                        //     }
                        //
                        // });

                        //method 2
                        // deletePK();
                        // let sortLayers = [];
                        resp.data.forEach(async function (el, i) {
                            // console.log(i)
                            if (i === 0) {
                                //find placemark layer
                                let pCountry = el.CountryName;
                                // console.log(pCountry)
                                //checks to see if we have already stored the index of the layer
                                if (countryindex[pCountry] != null) {
                                    //layer exists in our object of indexes, we can directly access the layer with its index
                                    // console.log(countryindex[pCountry])
                                    // console.log("remove renderables")
                                    pLayer = newGlobe.layers[countryindex[pCountry]];
                                    //remove all renderables of this layer
                                    // console.log(pLayer)
                                    await pLayer.removeAllRenderables();
                                    // console.log(pLayer)

                                } else {
                                    //We have not stored the index of this layer, meaning it probably doesn't exist yet in newGlobe.layers

                                    // if (newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK') == null) {}

                                    alert("adding layers...")
                                    console.log(pCountry)
                                    //create new layer
                                    pLayer = await new WorldWind.RenderableLayer(pCountry);

                                    if (continents === "none") {
                                        pLayer.enabled = true;
                                    } else {
                                        pLayer.enabled = el.ContinentName === continents;
                                    }
                                    // pLayer.hide = false;
                                    pLayer.layerType = 'H_PKLayer';
                                    pLayer.continent = el.ContinentName;

                                    //update indexes of layers
                                    console.log(countryindex);
                                    updateArr();
                                    // console.log(countryindex);

                                }
                            }
                            // console.log("create pk")
                            //create new pk object and set its properties
                            let confirmedPK = new canvasPKobject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                            let deathPK = new canvasPKobject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                            let recoveredPK = new canvasPKobject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                            let activePK = new canvasPKobject(cActive, el.Latitude, el.Longitude, sizePK(el.CaseNum - el.DeathNum - el.RecovNum));

                            confirmedPK.pk.userProperties.Date = el.Date;
                            confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                            confirmedPK.pk.userProperties.dName = el.LocName;
                            confirmedPK.pk.userProperties.Number = el.CaseNum;

                            deathPK.pk.userProperties.Date = el.Date;
                            deathPK.pk.userProperties.Type = "Deaths";
                            deathPK.pk.userProperties.dName = el.LocName;
                            deathPK.pk.userProperties.Number = el.DeathNum;

                            recoveredPK.pk.userProperties.Date = el.Date;
                            recoveredPK.pk.userProperties.Type = "Recoveries";
                            recoveredPK.pk.userProperties.dName = el.LocName;
                            recoveredPK.pk.userProperties.Number = el.RecovNum;

                            activePK.pk.userProperties.Date = el.Date;
                            activePK.pk.userProperties.Type = "Active Cases";
                            activePK.pk.userProperties.dName = el.LocName;
                            activePK.pk.userProperties.Number = el.ActiveNum;

                            // middate = clicked date on slider
                            if (middate != "none") {
                                if (el.Date === middate) { //if placemark's date is equal to clicked date
                                    //updates case number to current date
                                    if (continents === "none") {
                                        numC += parseInt(confirmedPK.pk.userProperties.Number);
                                        numD += parseInt(deathPK.pk.userProperties.Number);
                                        numR += parseInt(recoveredPK.pk.userProperties.Number);
                                        numA += parseInt(activePK.pk.userProperties.Number);
                                        //enables placemarks based on their type
                                        if (type == "Deaths") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = true;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;

                                        } else if (type == "Recoveries") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = true;
                                            activePK.pk.enabled = false;

                                        } else if (type == "Active Cases" || type == "Active") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = true;

                                        } else {
                                            confirmedPK.pk.enabled = true;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;
                                        }
                                    } else {
                                        if (el.ContinentName === continents) {
                                            numC += parseInt(confirmedPK.pk.userProperties.Number);
                                            numD += parseInt(deathPK.pk.userProperties.Number);
                                            numR += parseInt(recoveredPK.pk.userProperties.Number);
                                            numA += parseInt(activePK.pk.userProperties.Number);
                                            //enables placemarks based on their type
                                            if (type == "Deaths") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = true;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = false;

                                            } else if (type == "Recoveries") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = true;
                                                activePK.pk.enabled = false;

                                            } else if (type == "Active Cases" || type == "Active") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = true;

                                            } else {
                                                confirmedPK.pk.enabled = true;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = false;
                                            }
                                        } else {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;
                                        }
                                    }


                                } else {
                                    confirmedPK.pk.enabled = false;
                                    deathPK.pk.enabled = false;
                                    recoveredPK.pk.enabled = false;
                                    activePK.pk.enabled = false;
                                }
                            } else {
                                let mid = Math.floor((resp.data.length - 1)/2)
                                if (el.Date === resp.data[mid].Date) {

                                    if (continents == "none") {
                                        //enables placemarks based on type
                                        numC += parseInt(confirmedPK.pk.userProperties.Number);
                                        numD += parseInt(deathPK.pk.userProperties.Number);
                                        numR += parseInt(recoveredPK.pk.userProperties.Number);
                                        numA += parseInt(activePK.pk.userProperties.Number);
                                        if (type == "Deaths") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = true;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;

                                        } else if (type == "Recoveries") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = true;
                                            activePK.pk.enabled = false;

                                        } else if (type == "Active Cases" || type == "Active") {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = true;

                                            // confirmedPK.pk.hide = true;
                                            // deathPK.pk.hide = true;
                                            // recoveredPK.pk.hide = true;
                                            // activePK.pk.hide = false

                                            // sortLayers.push(activePK);
                                        } else {
                                            confirmedPK.pk.enabled = true;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;

                                            // confirmedPK.pk.hide = false;
                                            // deathPK.pk.hide = true;
                                            // recoveredPK.pk.hide = true;
                                            // activePK.pk.hide = true;

                                            // sortLayers.push(confirmedPK);
                                        }
                                    } else {
                                        if (el.ContinentName == continents) {
                                            //enables placemarks based on type
                                            numC += parseInt(confirmedPK.pk.userProperties.Number);
                                            numD += parseInt(deathPK.pk.userProperties.Number);
                                            numR += parseInt(recoveredPK.pk.userProperties.Number);
                                            numA += parseInt(activePK.pk.userProperties.Number);
                                            if (type == "Deaths") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = true;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = false;

                                            } else if (type == "Recoveries") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = true;
                                                activePK.pk.enabled = false;

                                            } else if (type == "Active Cases" || type == "Active") {
                                                confirmedPK.pk.enabled = false;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = true;

                                                // confirmedPK.pk.hide = true;
                                                // deathPK.pk.hide = true;
                                                // recoveredPK.pk.hide = true;
                                                // activePK.pk.hide = false

                                                // sortLayers.push(activePK);
                                            } else {
                                                confirmedPK.pk.enabled = true;
                                                deathPK.pk.enabled = false;
                                                recoveredPK.pk.enabled = false;
                                                activePK.pk.enabled = false;

                                                // confirmedPK.pk.hide = false;
                                                // deathPK.pk.hide = true;
                                                // recoveredPK.pk.hide = true;
                                                // activePK.pk.hide = true;

                                                // sortLayers.push(confirmedPK);
                                            }
                                        } else {
                                            confirmedPK.pk.enabled = false;
                                            deathPK.pk.enabled = false;
                                            recoveredPK.pk.enabled = false;
                                            activePK.pk.enabled = false;
                                        }
                                    }


                                } else {
                                    confirmedPK.pk.enabled = false;
                                    deathPK.pk.enabled = false;
                                    recoveredPK.pk.enabled = false;
                                    activePK.pk.enabled = false;

                                    // confirmedPK.pk.hide = true;
                                    // deathPK.pk.hide = true;
                                    // recoveredPK.pk.hide = true;
                                    // activePK.pk.hide = true;
                                }

                            }

                            // add renderable placemarks onto layer
                            pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);
                            if (i !== resp.data.length - 1) { //if this isn't the last layer
                                if (el.CountryName !== resp.data[i + 1].CountryName) { //if the name of the layer and the name of the next layer isn't the same?

                                    if (countryindex[el.CountryName] == null || countryindex[el.CountryName] == -1) { //if layer cannot be found in index
                                        // let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === el.CountryName);
                                        //
                                        // if (findLayerIndex == -1 || findLayerIndex == null) {
                                        //     //create new layer
                                        //     pLayer = await new WorldWind.RenderableLayer(el.CountryName);
                                        //     pLayer.enabled = true;
                                        //     pLayer.hide = false;
                                        //     pLayer.layerType = 'H_PKLayer';
                                        //     pLayer.continent = el.ContinentName;
                                        //     console.log(countryindex);
                                        //
                                        //     //update indexes of layers
                                        //     updateArr();
                                        //     console.log(countryindex);
                                        // } else {
                                        //
                                        // }

                                    } else if (newGlobe.layers[countryindex[el.CountryName]].displayName != el.CountryName) { //if
                                        console.log(newGlobe.layers[countryindex[el.CountryName]]);
                                        await newGlobe.addLayer(pLayer);
                                        newGlobe.redraw();

                                        console.log(countryindex);
                                        updateArr();
                                        console.log(countryindex);
                                    }

                                    if (countryindex[resp.data[i + 1].CountryName] != null) {
                                        // console.log(i)
                                        // console.log(resp.data[i + 1].CountryName)
                                        pLayer = newGlobe.layers[countryindex[resp.data[i + 1].CountryName]];
                                        await pLayer.removeAllRenderables();
                                    } else {

                                        //create new placemark layer for next country
                                        pLayer = await new WorldWind.RenderableLayer(resp.data[i + 1].CountryName);
                                        pLayer.enabled = true;
                                        // pLayer.hide = false;
                                        pLayer.layerType = 'H_PKLayer';
                                        pLayer.continent = resp.data[i + 1].ContinentName;

                                        // countryArr.push(resp.data[i + 1].CountryName);
                                        // countryindex[resp.data[i + 1].CountryName] = countryArr.length;

                                        await newGlobe.layers.splice(xfgb + i, 0, pLayer);
                                        // console.log(countryindex)
                                        await updateArr();
                                    }
                                }
                            } else {
                                newGlobe.redraw();
                                if (isNaN(numR) && isNaN(numA)) {
                                    numR = "Not Available";
                                    numA = "Not Available";
                                } else if (isNaN(numA) && !isNaN(numR)) {
                                    numA = numC - numD - numR
                                } else if (!isNaN(numA) && isNaN(numR)) {
                                    numR = numC - numD - numA
                                }
                                $('#conConfirmed').text(numC);
                                $('#conDeaths').text(numD);
                                $('#conRecoveries').text(numR);
                                $('#conActive').text(numA);
                            }

                        })

                        // overlay.style.display = 'none';
                        // tutorial.hidden = false;
                        // tutorial.disabled = false;
                        // tutorial.style.display = 'table-cell';
                        // $('#amount').val(middate);
                        // $( "#slider-range" ).slider( "enable" );
                        // console.log(resp.data.length)
                    } else {
                        console.log((new Date()).getTime())
                        console.log(Date.now())
                        if (flag !== "init") {
                            // initiated by Home.js
                            // delete all other unnecessary placemarks
                            deletePK();
                            console.log("pk deleted");
                        }
                        // console.log(resp.data);
                        // console.log(newGlobe.layers);
                        resp.data.forEach(async function (el, i) {

                            if (i === 0) {
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName);
                                pLayer.enabled = true;
                                // pLayer.hide = false;
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName;

                                // dict[resp.data[i + 1].CountryName] = xfgb + 1
                                countryArr.push(el.CountryName)
                                // console.log(xfgb);
                                // xfgb += 1;
                            }

                            // console.log(el.CaseNum)
                            // console.log(sizePK(el.CaseNum));

                            let confirmedPK = new canvasPKobject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                            let deathPK = new canvasPKobject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                            let recoveredPK = new canvasPKobject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                            let activePK = new canvasPKobject(cActive, el.Latitude, el.Longitude, sizePK(el.ActiveNum));

                            confirmedPK.pk.userProperties.Date = el.Date;
                            confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                            confirmedPK.pk.userProperties.dName = el.LocName;
                            confirmedPK.pk.userProperties.Number = el.CaseNum;

                            deathPK.pk.userProperties.Date = el.Date;
                            deathPK.pk.userProperties.Type = "Deaths";
                            deathPK.pk.userProperties.dName = el.LocName;
                            deathPK.pk.userProperties.Number = el.DeathNum;

                            recoveredPK.pk.userProperties.Date = el.Date;
                            recoveredPK.pk.userProperties.Type = "Recoveries";
                            recoveredPK.pk.userProperties.dName = el.LocName;
                            recoveredPK.pk.userProperties.Number = el.RecovNum;

                            activePK.pk.userProperties.Date = el.Date;
                            activePK.pk.userProperties.Type = "Active Cases";
                            activePK.pk.userProperties.dName = el.LocName;
                            activePK.pk.userProperties.Number = el.ActiveNum;

                            // disable all the placemarks except requested date
                            if (el.Date === resp.data[resp.data.length - 1].Date) {
                                confirmedPK.pk.enabled = true;
                                deathPK.pk.enabled = false;
                                recoveredPK.pk.enabled = false;
                                activePK.pk.enabled = false;

                                numC += parseInt(confirmedPK.pk.userProperties.Number);
                                numD += parseInt(deathPK.pk.userProperties.Number);
                                numR += parseInt(recoveredPK.pk.userProperties.Number);
                                numA += parseInt(activePK.pk.userProperties.Number);

                                // confirmedPK.pk.hide = false;
                                // deathPK.pk.hide = true;
                                // recoveredPK.pk.hide = true;
                                // activePK.pk.hide = true;
                            } else {
                                confirmedPK.pk.enabled = false;
                                deathPK.pk.enabled = false;
                                recoveredPK.pk.enabled = false;
                                activePK.pk.enabled = false;

                                // confirmedPK.pk.hide = true;
                                // deathPK.pk.hide = true;
                                // recoveredPK.pk.hide = true;
                                // activePK.pk.hide = true;
                            }

                            //add placemarks onto placemark layer
                            pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);
                            if (i !== resp.data.length - 1) {
                                if (el.CountryName !== resp.data[i + 1].CountryName) {

                                    // add current placemark layer onto worldwind layer obj
                                    newGlobe.addLayer(pLayer);

                                    //create new placemark layer for next country
                                    pLayer = new WorldWind.RenderableLayer(resp.data[i + 1].CountryName);
                                    pLayer.enabled = true;
                                    // pLayer.hide = false;
                                    pLayer.layerType = 'H_PKLayer';
                                    pLayer.continent = resp.data[i + 1].ContinentName;

                                    countryArr.push(resp.data[i + 1].CountryName);
                                }
                            } else {
                                // add current placemark layer onto worldwind layer obj
                                newGlobe.addLayer(pLayer);
                                // console.log(newGlobe.layers);
                                newGlobe.redraw();
                                if (isNaN(numR)) {
                                    numR = "Not Available"
                                    numA = "Not Available"
                                }
                                $('#conConfirmed').text(numC);
                                $('#conDeaths').text(numD);
                                $('#conRecoveries').text(numR);
                                $('#conActive').text(numA);
                                console.log((new Date()).getTime())
                                console.log(Date.now());

                                if (xfgb != "") {
                                    countryindex = countryArr.reduce((acc,curr,i)=> (acc[curr]=i+xfgb, acc),{});
                                    // console.log(countryindex);
                                } else {
                                    updateArr();
                                }
                            }

                        })
                    }
                } else {
                    console.error("Error retrieving COVID data from server (covidData)");
                    alert("Error retrieving COVID data from server");
                }
            }
        })
    }

    function sizePK (num){
        let fSize = 0;
        if (num > 0) {
            for (let j = 0; j < clientConfig.pkSize.length; j++) {
                if (j != 0) {
                    if (num <= clientConfig.pkSize[j].num && num > clientConfig.pkSize[j - 1].num) {
                        fSize = clientConfig.pkSize[j].size * num / clientConfig.pkSize[j].num;
                        return fSize;
                    } else if (j == clientConfig.pkSize.length - 1) {
                        fSize = clientConfig.pkSize[j].size;
                        return fSize;
                    }
                }
            }
        } else {
            return fSize;
        }
    }


    function deletePK() {
        for (let j = 6; j < newGlobe.layers.length - 1; j++) {
            if (newGlobe.layers[j].layerType === 'H_PKLayer') {
                newGlobe.removeLayer(newGlobe.layers[j]);
            }
        }
    }

    async function updateArr() {
        countryArr = [];
        let arrindex = [];

        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                // elem.renderables.forEach(function (d) {
                // })
                countryArr.push(elem.displayName);
                arrindex.push(index);
            }
        });

        countryindex = countryArr.reduce((acc,curr,i)=> (acc[curr]=arrindex[i], acc),{});
        // console.log(countryindex)
    }

    return {covidPK};
});



