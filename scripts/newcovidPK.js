define([
    './globeObject',
    './canvasPKobject',
    '../config/clientConfig',
    './LayerManager',
    './Error',
    './imgPKobject',
    './jquery-csv-1.0.11',
], function (newGlobe, canvasPKobject, clientConfig, LayerManager, ErrorReturn) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    let pLayer;
    let countryIndex = {}; //Stores index of layers (country) in newGlobe.layers
    let iLength = [];
    //define colors for the placemarks (maybe we should move stuff like this to clientConfig?)
    const colorC = "1 0 0";
    const colorD = "0 0 0";
    const colorR = "0.4 1 0.2";
    const colorA = "0.9 0.6 0";
    //Index for each category
    const pkNum = {"Confirmed Cases": 0,
        "Deaths": 1,
        "Recoveries": 2,
        "Active Cases": 3}; //Index of each category

    const pktype = {"Confirmed Cases": colorC.split(' '),
        "Deaths": colorD.split(' '),
        "Recoveries": colorR.split(' '),
        "Active Cases": colorA.split(' ')};

    function covidPK(date, type, flag, midDate, continent="none", countries="all_countries",inactiveLayers=[]) {
        let covidNum = [0, 0, 0, 0]; //Stores overall case numbers for all continents
        let totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
            "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]};  //The case numbers for each continent
        let sortLayersLocation = 0;
        continent = continent.trim().split(' ').join('_');
        countries = countries.trim();

        let ajaxData;

        if (flag == "filterLoad" && countries != "all_countries") {
            ajaxData = {date: date, country: countries};   // We're selecting only a specific country from the table in a certain date range
        } else if (flag == "filterLoad" && continent != "none") {
            ajaxData = {date: date, continent: continent}; // Select only a specific continent from the table in a certain date range
        } else {
            if (flag != "init") {
                if (inactiveLayers == []) {
                    let layerList = JSON.parse(sessionStorage.getItem('COVIDLayerList')); //session storage can only store string values, so we need to parse the JSON object
                    let notActiveLayers = $('#layerList').find("button[style='color: rgb(0, 0, 0);']")
                        .not("button[class='active']").toArray();  //Find the buttons with the color white (which means they aren't selected and shouldn't be enabled on the globe, and convert them to an array that has all their properties
                    for (let i = 0; i < notActiveLayers.length; i++) {
                        inactiveLayers.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
                    }
                    if (continent == "none") {
                        layerList["All Continents"] = inactiveLayers;
                    } else {
                        layerList[continent] = inactiveLayers;
                    }
                    sessionStorage.setItem('COVIDLayerList', JSON.stringify(layerList));
                }
                if (continent != "none") {
                    totalCaseNum = JSON.parse(sessionStorage.getItem('totalCaseNum'));
                    totalCaseNum[continent] = [0,0,0,0]; //Reset the selected continent's case number to zero (for recalculation)
                }
            }

            ajaxData = {date: date};
        }
        // request the data for placemarks with given date and country
        $.ajax({
            url: '/covidData',
            type: 'GET',
            // data: {date: date, countries: countries, continents: continents},
            data: ajaxData,
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    resp.data.forEach(async function (el, i) {
                        let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)];
                        //el.ActiveNum = el.CaseNum - el.DeathNum - el.RecovNum
                        if ((el.ActiveNum < 0 && !isNaN(el.RecovNum) && el.RecovNum >= 0)
                            || (isNaN(el.ActiveNum) && !isNaN(el.RecovNum) && el.RecovNum >= 0)) {
                            // If the active number is below zero or not a number, and if the recovery number is a number that is not below zero,
                            // calculate the active cases by subtracting deaths and recoveries from confirmed cases
                            numTypes[3] = parseInt(parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.RecovNum));
                        }
                        if ((el.RecovNum < 0 && !isNaN(el.ActiveNum) && el.ActiveNum >= 0)
                            || (isNaN(el.RecovNum) && !isNaN(el.ActiveNum) && el.ActiveNum >= 0)) {
                            numTypes[2] = parseInt(parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.ActiveNum));
                        }

                        if (flag == 'init') {
                            if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                                if (continent == "none") {
                                    if (countries === "all_countries") {
                                        pLayer.enabled = true;
                                    } else {
                                        pLayer.enabled = el.CountryName.trim() == countries.trim(); //Only enable the country requested
                                    }
                                } else {
                                    if (countries == "all_countries") {
                                        pLayer.enabled = el.ContinentName.trim() === continent.trim(); //Only enable continet requested
                                    } else {
                                        pLayer.enabled = el.CountryName.trim() == countries.trim();
                                    }
                                }
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName.trim();
                            }
                        } else {
                            countryIndex[el.CountryName.trim()] = newGlobe.layers.findIndex(ele => ele.displayName.trim() === el.CountryName.trim()); //Find index of the layer to insert placemarks into
                            if (countryIndex[el.CountryName.trim()] !== -1) { //This means that the layer exists in newGlobe.layers
                                if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                    pLayer = newGlobe.layers[countryIndex[el.CountryName.trim()]]; //Access the layer
                                    //remove all renderables of this layer
                                    await pLayer.removeAllRenderables(); //remove all renderables (placemarks from the layer)
                                }

                            } else if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName.trim()); //Create new layer (the layer doesn't exist yet)
                                if (!inactiveLayers.includes(pLayer.displayName.trim())) {
                                    if (continent == "none") {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = true;
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries;
                                        }
                                    } else {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = el.ContinentName.trim() === continent;
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries;
                                        }
                                    }
                                } else {
                                    pLayer.enabled = false;
                                }

                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName.trim();
                            }
                        }

                        // In this version only one placemark is created for every row in the table (as opposed to 4 placemarks)
                        //This means that there's only one category of placemarks on the globe

                        let allPk = new canvasPKobject(pktype[type], el.Latitude, el.Longitude, sizePK(numTypes[pkNum[type]])); //Pass the color, latitude, longitude, and size of the placemark as parameters
                        allPk.pk.userProperties.Date = el.Date;
                        allPk.pk.userProperties.Type = type.trim();
                        allPk.pk.userProperties.dName = el.LocName.trim();
                        allPk.pk.userProperties.Number = numTypes[pkNum[type]]; //This is the category that's currently enabled
                        Object.keys(pkNum).forEach( function (ele, j) { //For every key in pkNum (the categories) create a field under the placemark's user properties with the case number for that category
                            allPk.pk.userProperties[ele] = numTypes[j];
                        });
                        // The above line of code does the same thing as the following four lines of comments
                        // allPk.pk.userProperties["Confirmed Cases"] = numTypes[0];
                        // allPk.pk.userProperties["Deaths"] = numTypes[1];
                        // allPk.pk.userProperties["Recoveries"] = numTypes[2];
                        // allPk.pk.userProperties["Active Cases"] = numTypes[3];
                        allPk.pk.layer = null;
                        if (midDate == "none") {
                            midDate = Math.floor((resp.data.length - 1)/2); //This probably should be removed since it's not needed and was only for the previous date slider
                        }

                        // disable all the placemarks except requested date
                        if (el.Date == midDate) {

                            if (pLayer.enabled === true) {
                                for (let k= 0; k < 4; k++) { //I'm not exactly sure about covidNum being in the if statement
                                    covidNum[k] += parseInt(numTypes[k]); //Add case number to total case number count
                                    totalCaseNum[el.ContinentName.trim()][k] += parseInt(numTypes[k]); //Store case number for continent
                                }
                            }

                            allPk.pk.enabled = true;
                            sortLayersLocation += 1; //Add 1 to the location count
                        } else {
                            allPk.pk.enabled = false;
                        }

                        pLayer.addRenderable(allPk.pk); //Add renderable to layer

                        if (flag == "init") {
                            if (i !== resp.data.length - 1) {
                                if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                    // add current placemark layer onto worldwind layer obj
                                    newGlobe.addLayer(pLayer);
                                }
                            } else {
                                // add current placemark layer onto worldwind layer obj
                                newGlobe.addLayer(pLayer);
                                newGlobe.redraw();

                                totalCaseNum["All Continents"] = covidNum; //Store total case number
                                $('#conConfirmed').text(covidNum[0]); //Push total case number to case number text display
                                $('#conDeaths').text(covidNum[1]);
                                $('#conRecoveries').text(covidNum[2]);
                                $('#conActive').text(covidNum[3]);
                            }
                        } else {
                            if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
                                iLength.push(i);
                                if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                    console.log(el)
                                    console.log(el.CountryName.trim())
                                    let asdf = resp.data[i - iLength.length].CountryName.trim(); //The previous layer
                                    let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf); //The previous layer's index
                                    // add current placemark layer onto worldwind layer obj
                                    newGlobe.insertLayer(asdfPosition + 1, pLayer); //Insert layer after previous layer
                                    iLength = [];

                                    countryIndex[el.CountryName.trim()] = asdfPosition + 1; //Update index
                                }
                            } else if (i == resp.data.length - 1 ) {
                                newGlobe.redraw();
                                layerManager.synchronizeLayerList(inactiveLayers);

                                $('#conConfirmed').text(covidNum[0]);
                                $('#conDeaths').text(covidNum[1]);
                                $('#conRecoveries').text(covidNum[2]);
                                $('#conActive').text(covidNum[3]);
                            }
                        }

                    });
                    sessionStorage.setItem('COVIDinfectionMax', sortLayersLocation); //Stores the number of locations to be used by infectio slider
                    sessionStorage.setItem('COVIDstartDate', date[0]);
                    sessionStorage.setItem('COVIDendDate', date[1]);
                    sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
                } else {
                    ErrorReturn("COVID", "covidPK" , true);
                }
            }
        });
    }

    // function redrawPK(dates, category, renderables) {
    //     // //Method 1
    //     // renderables.forEach (function (elem, index) {
    //     //     if (elem instanceof WorldWind.Placemark) {
    //     //         let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    //     //         let numTypes = [parseInt(elem.userProperties["Confirmed Cases"]), parseInt(elem.userProperties["Deaths"]), parseInt(elem.userProperties["Recoveries"]), parseInt(elem.userProperties["Active Cases"])];
    //     //         let magnitude = sizePK(numTypes[pkNum[category]]);
    //     //         let imageTemp;
    //     //
    //     //         placemarkAttributes.imageScale = Math.abs(magnitude * 3); //placemark size!
    //     //
    //     //         if (!imageTemp) {
    //     //             imageTemp = new WorldWind.ImageSource(imgPK('rgb(255,255,255)', 5, 15));
    //     //         }
    //     //
    //     //         placemarkAttributes.imageSource = imageTemp;
    //     //         placemarkAttributes.imageColor = new WorldWind.Color(pktype[category][0], pktype[category][1], pktype[category][2], 1);
    //     //         elem.attributes = placemarkAttributes;
    //     //         // elem.attributes.imageScale = Math.abs(magnitude * 3);
    //     //         elem.userProperties.Type = category;
    //     //         //If the placemark date equals current date
    //     //         if (elem.userProperties.Date == dates[1]) {
    //     //             elem.enabled = true;
    //     //         } else {
    //     //             elem.enabled = false;
    //     //         }
    //     //     }
    //     // });
    //
    //     //Method 2
    //     renderables.forEach (function (elem, index) {
    //         console.log(elem);
    //         if (elem instanceof WorldWind.Placemark) {
    //             let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    //             let numTypes = [parseInt(elem.userProperties["Confirmed Cases"]), parseInt(elem.userProperties["Deaths"]), parseInt(elem.userProperties["Recoveries"]), parseInt(elem.userProperties["Active Cases"])];
    //             let magnitude = sizePK(numTypes[pkNum[category]]);
    //             let imageTemp;
    //             // renderables.attributes.imageColor = new WorldWind.Color(color[0], color[1], color[2],1);
    //
    //             placemarkAttributes.imageScale = Math.abs(magnitude * 3); //placemark size!
    //
    //             if (!imageTemp) {
    //                 imageTemp = new WorldWind.ImageSource(imgPK('rgb(255,255,255)', 5, 15));
    //             }
    //
    //             placemarkAttributes.imageSource = imageTemp;
    //             placemarkAttributes.imageColor = new WorldWind.Color(pktype[category][0], pktype[category][1], pktype[category][2], 1);
    //             elem.attributes = placemarkAttributes;
    //             // elem.attributes.imageScale = Math.abs(magnitude * 3);
    //             elem.userProperties.Type = category;
    //             console.log(elem);
    //             //If the placemark date equals current date
    //             if (elem.userProperties.Date == dates[1]) {
    //                 elem.enabled = true;
    //             } else {
    //                 elem.enabled = false;
    //             }
    //         }
    //         if (index == renderables.length - 1) {
    //             return renderables;
    //         }
    //     });
    //
    //
    //     // //define colors for the placemarks
    //     // let covidNum = [0, 0, 0, 0];
    //     // let totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
    //     //     "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]};
    //     // let sortLayersLocation = 0;
    //     // continent = continent.trim().split(' ').join('_');
    //     // countries = countries.trim();
    //     //
    //     // let pkNum = {"Confirmed Cases": 0,
    //     //     "Deaths": 1,
    //     //     "Recoveries": 2,
    //     //     "Active Cases": 3};
    //     // let ajaxData;
    //     //
    //     // if (flag == "filterLoad" && countries !== "all_countries") {
    //     //     ajaxData = {date: date, country: countries};
    //     // } else if (flag == "filterLoad" && continent !== "none") {
    //     //     ajaxData = {date: date, continent: continent};
    //     // } else {
    //     //     ajaxData = {date: date};
    //     // }
    //     // // request the data for placemarks with given date and country
    //     // $.ajax({
    //     //     url: '/covidData',
    //     //     type: 'GET',
    //     //     // data: {date: date, countries: countries, continents: continents},
    //     //     data: ajaxData,
    //     //     dataType: 'json',
    //     //     async: false,
    //     //     success: function (resp) {
    //     //         if (!resp.error) {
    //     //             resp.data.forEach(async function (el, i) {
    //     //                 let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)];
    //     //                 //el.CaseNum - el.DeathNum - el.RecovNum
    //     //                 if ((el.ActiveNum < 0 && !isNaN(el.RecovNum) && el.RecovNum >= 0)
    //     //                     || (isNaN(el.ActiveNum) && !isNaN(el.RecovNum) && el.RecovNum >= 0)) {
    //     //                     // If the active number is below zero or not a number, and if the recovery number is a number that is not below zero,
    //     //                     // calculate the active cases by subtracting deaths and recoveries from confirmed cases
    //     //                     numTypes[3] = parseInt(parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.RecovNum));
    //     //                 }
    //     //                 if ((el.RecovNum < 0 && !isNaN(el.ActiveNum) && el.ActiveNum >= 0)
    //     //                     || (isNaN(el.RecovNum) && !isNaN(el.ActiveNum) && el.ActiveNum >= 0)) {
    //     //                     numTypes[2] = parseInt(parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.ActiveNum));
    //     //                 }
    //     //
    //     //                 if (flag == 'init') {
    //     //                     if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
    //     //                         //create placemark layer
    //     //                         pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
    //     //                         if (continent === "none") {
    //     //                             if (countries === "all_countries") {
    //     //                                 pLayer.enabled = true;
    //     //                             } else {
    //     //                                 pLayer.enabled = el.CountryName.trim() == countries.trim();
    //     //                             }
    //     //                         } else {
    //     //                             if (countries === "all_countries") {
    //     //                                 pLayer.enabled = el.ContinentName.trim() === continent.trim();
    //     //                             } else {
    //     //                                 pLayer.enabled = el.CountryName.trim() == countries.trim();
    //     //                             }
    //     //                         }
    //     //                         pLayer.layerType = 'H_PKLayer';
    //     //                         pLayer.continent = el.ContinentName.trim();
    //     //                     }
    //     //                 } else {
    //     //                     countryIndex[el.CountryName.trim()] = newGlobe.layers.findIndex(ele => ele.displayName.trim() === el.CountryName.trim());
    //     //                     if (countryIndex[el.CountryName.trim()] !== -1) {
    //     //                         if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
    //     //                             pLayer = newGlobe.layers[countryIndex[el.CountryName.trim()]];
    //     //                             //remove all renderables of this layer
    //     //                             await pLayer.removeAllRenderables();
    //     //                         }
    //     //
    //     //                     } else if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
    //     //                         //create placemark layer
    //     //                         pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
    //     //                         if (continent === "none") {
    //     //                             if (countries === "all_countries") {
    //     //                                 pLayer.enabled = true;
    //     //                             } else {
    //     //                                 pLayer.enabled = el.CountryName.trim() == countries.trim();
    //     //                             }
    //     //                         } else {
    //     //                             if (countries === "all_countries") {
    //     //                                 pLayer.enabled = el.ContinentName.trim() === continent.trim();
    //     //                             } else {
    //     //                                 pLayer.enabled = el.CountryName.trim() == countries.trim();
    //     //                             }
    //     //                         }
    //     //                         pLayer.layerType = 'H_PKLayer';
    //     //                         pLayer.continent = el.ContinentName.trim();
    //     //                     }
    //     //                 }
    //     //
    //     //                 // pkType.forEach(function (elem, k) {
    //     //                 //     pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
    //     //                 //     pkType[k].pkObj.pk.userProperties.Date = el.Date;
    //     //                 //     pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
    //     //                 //     pkType[k].pkObj.pk.userProperties.dName = el.LocName.trim();
    //     //                 //     pkType[k].pkObj.pk.userProperties.Number = numTypes[k];
    //     //                 //     pkType[k].pkObj.pk.layer = null;
    //     //                 //
    //     //                 //     if (midDate === "none") {
    //     //                 //         midDate = Math.floor((resp.data.length - 1)/2);
    //     //                 //     }
    //     //                 //
    //     //                 //     // disable all the placemarks except requested date
    //     //                 //     if (el.Date == midDate) {
    //     //                 //
    //     //                 //         covidNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
    //     //                 //         totalCaseNum[el.ContinentName.trim()][k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
    //     //                 //
    //     //                 //         if (pkType[k].type == type) {
    //     //                 //             pkType[k].pkObj.pk.enabled = true;
    //     //                 //             sortLayersLocation += 1;
    //     //                 //         } else {
    //     //                 //             pkType[k].pkObj.pk.enabled = false;
    //     //                 //         }
    //     //                 //     } else {
    //     //                 //         pkType[k].pkObj.pk.enabled = false;
    //     //                 //     }
    //     //                 //
    //     //                 //     //add placemarks onto placemark layer
    //     //                 //     pLayer.addRenderable(pkType[k].pkObj.pk);
    //     //                 //
    //     //                 //     if (k === pkType.length - 1 && flag == "init") {
    //     //                 //         if (i !== resp.data.length - 1) {
    //     //                 //             if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                 //                 // add current placemark layer onto worldwind layer obj
    //     //                 //                 newGlobe.addLayer(pLayer);
    //     //                 //             }
    //     //                 //         } else {
    //     //                 //             // add current placemark layer onto worldwind layer obj
    //     //                 //             newGlobe.addLayer(pLayer);
    //     //                 //             newGlobe.redraw();
    //     //                 //
    //     //                 //             totalCaseNum["All Continents"] = covidNum;
    //     //                 //             $('#conConfirmed').text(covidNum[0]);
    //     //                 //             $('#conDeaths').text(covidNum[1]);
    //     //                 //             $('#conRecoveries').text(covidNum[2]);
    //     //                 //             $('#conActive').text(covidNum[3]);
    //     //                 //         }
    //     //                 //     } else if (k === pkType.length - 1 ) {
    //     //                 //         if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
    //     //                 //             iLength.push(i);
    //     //                 //             if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                 //                 console.log(el)
    //     //                 //                 console.log(el.CountryName.trim())
    //     //                 //                 let asdf = resp.data[i - iLength.length].CountryName.trim();
    //     //                 //                 let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);
    //     //                 //                 // add current placemark layer onto worldwind layer obj
    //     //                 //                 newGlobe.insertLayer(asdfPosition + 1, pLayer);
    //     //                 //                 iLength = [];
    //     //                 //
    //     //                 //                 countryIndex[el.CountryName.trim()] = asdfPosition + 1;
    //     //                 //             }
    //     //                 //         } else if (i == resp.data.length - 1 ) {
    //     //                 //             newGlobe.redraw();
    //     //                 //             // layerManager.synchronizeLayerList();
    //     //                 //
    //     //                 //             totalCaseNum["All Continents"] = covidNum;
    //     //                 //             $('#conConfirmed').text(covidNum[0]);
    //     //                 //             $('#conDeaths').text(covidNum[1]);
    //     //                 //             $('#conRecoveries').text(covidNum[2]);
    //     //                 //             $('#conActive').text(covidNum[3]);
    //     //                 //         }
    //     //                 //     }
    //     //                 // });
    //     //
    //     //                 let allPk = new canvasPKobject(pktype[type], el.Latitude, el.Longitude, sizePK(numTypes[pkNum[type]]));
    //     //                 allPk.pk.userProperties.Date = el.Date;
    //     //                 allPk.pk.userProperties.Type = type.trim();
    //     //                 allPk.pk.userProperties.dName = el.LocName.trim();
    //     //                 allPk.pk.userProperties.Number = numTypes[pkNum[type]];
    //     //                 Object.keys(pkNum).forEach( function (ele, j) {
    //     //                     allPk.pk.userProperties[ele] = j;
    //     //                 })
    //     //                 // The above line of code does the same thing as the following four lines of comments
    //     //                 // allPk.pk.userProperties["Confirmed Cases"] = numTypes[0];
    //     //                 // allPk.pk.userProperties["Deaths"] = numTypes[1];
    //     //                 // allPk.pk.userProperties["Recoveries"] = numTypes[2];
    //     //                 // allPk.pk.userProperties["Active Cases"] = numTypes[3];
    //     //                 allPk.pk.layer = null;
    //     //
    //     //                 if (midDate === "none") {
    //     //                     midDate = Math.floor((resp.data.length - 1)/2);
    //     //                 }
    //     //
    //     //                 // disable all the placemarks except requested date
    //     //                 if (el.Date == midDate) {
    //     //
    //     //                     for (let k= 0; k < 4; k++) {
    //     //                         covidNum[k] += parseInt(numTypes[k]);
    //     //                         totalCaseNum[el.ContinentName.trim()][k] += parseInt(numTypes[k]);
    //     //                     }
    //     //
    //     //                     allPk.pk.enabled = true;
    //     //                     sortLayersLocation += 1;
    //     //                 } else {
    //     //                     allPk.pk.enabled = false;
    //     //                 }
    //     //
    //     //                 pLayer.addRenderable(allPk.pk);
    //     //
    //     //                 if (flag == "init") {
    //     //                     if (i !== resp.data.length - 1) {
    //     //                         if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                             // add current placemark layer onto worldwind layer obj
    //     //                             newGlobe.addLayer(pLayer);
    //     //                         }
    //     //                     } else {
    //     //                         // add current placemark layer onto worldwind layer obj
    //     //                         newGlobe.addLayer(pLayer);
    //     //                         newGlobe.redraw();
    //     //
    //     //                         totalCaseNum["All Continents"] = covidNum;
    //     //                         $('#conConfirmed').text(covidNum[0]);
    //     //                         $('#conDeaths').text(covidNum[1]);
    //     //                         $('#conRecoveries').text(covidNum[2]);
    //     //                         $('#conActive').text(covidNum[3]);
    //     //                     }
    //     //                 } else {
    //     //                     if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
    //     //                         iLength.push(i);
    //     //                         if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                             console.log(el)
    //     //                             console.log(el.CountryName.trim())
    //     //                             let asdf = resp.data[i - iLength.length].CountryName.trim();
    //     //                             let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);
    //     //                             // add current placemark layer onto worldwind layer obj
    //     //                             newGlobe.insertLayer(asdfPosition + 1, pLayer);
    //     //                             iLength = [];
    //     //
    //     //                             countryIndex[el.CountryName.trim()] = asdfPosition + 1;
    //     //                         }
    //     //                     } else if (i == resp.data.length - 1 ) {
    //     //                         newGlobe.redraw();
    //     //                         // layerManager.synchronizeLayerList();
    //     //
    //     //                         totalCaseNum["All Continents"] = covidNum;
    //     //                         $('#conConfirmed').text(covidNum[0]);
    //     //                         $('#conDeaths').text(covidNum[1]);
    //     //                         $('#conRecoveries').text(covidNum[2]);
    //     //                         $('#conActive').text(covidNum[3]);
    //     //                     }
    //     //                 }
    //     //
    //     //
    //     //                 // pkType.forEach(function (elem, k) {
    //     //                 //     // pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
    //     //                 //     // pkType[k].pkObj.pk.userProperties.Date = el.Date;
    //     //                 //     // pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
    //     //                 //     // pkType[k].pkObj.pk.userProperties.dName = el.LocName.trim();
    //     //                 //     // pkType[k].pkObj.pk.userProperties.Number = numTypes[k];
    //     //                 //     // pkType[k].pkObj.pk.userProperties["Confirmed Cases"] = numTypes[1];
    //     //                 //     // pkType[k].pkObj.pk.userProperties["Deaths"] = numTypes[2];
    //     //                 //     // pkType[k].pkObj.pk.userProperties["Recoveries"] = numTypes[3];
    //     //                 //     // pkType[k].pkObj.pk.userProperties["Active Cases"] = numTypes[4];
    //     //                 //     // pkType[k].pkObj.pk.layer = null;
    //     //                 //     //
    //     //                 //     // if (midDate === "none") {
    //     //                 //     //     midDate = Math.floor((resp.data.length - 1)/2);
    //     //                 //     // }
    //     //                 //
    //     //                 //     // // disable all the placemarks except requested date
    //     //                 //     // if (el.Date == midDate) {
    //     //                 //     //
    //     //                 //     //     covidNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
    //     //                 //     //     totalCaseNum[el.ContinentName.trim()][k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
    //     //                 //     //
    //     //                 //     //     if (pkType[k].type == type) {
    //     //                 //     //         pkType[k].pkObj.pk.enabled = true;
    //     //                 //     //         sortLayersLocation += 1;
    //     //                 //     //     } else {
    //     //                 //     //         pkType[k].pkObj.pk.enabled = false;
    //     //                 //     //     }
    //     //                 //     // } else {
    //     //                 //     //     pkType[k].pkObj.pk.enabled = false;
    //     //                 //     // }
    //     //                 //
    //     //                 //     // //add placemarks onto placemark layer
    //     //                 //     // pLayer.addRenderable(pkType[k].pkObj.pk);
    //     //                 //
    //     //                 //     // if (k === pkType.length - 1 && flag == "init") {
    //     //                 //     //     if (i !== resp.data.length - 1) {
    //     //                 //     //         if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                 //     //             // add current placemark layer onto worldwind layer obj
    //     //                 //     //             newGlobe.addLayer(pLayer);
    //     //                 //     //         }
    //     //                 //     //     } else {
    //     //                 //     //         // add current placemark layer onto worldwind layer obj
    //     //                 //     //         newGlobe.addLayer(pLayer);
    //     //                 //     //         newGlobe.redraw();
    //     //                 //     //
    //     //                 //     //         totalCaseNum["All Continents"] = covidNum;
    //     //                 //     //         $('#conConfirmed').text(covidNum[0]);
    //     //                 //     //         $('#conDeaths').text(covidNum[1]);
    //     //                 //     //         $('#conRecoveries').text(covidNum[2]);
    //     //                 //     //         $('#conActive').text(covidNum[3]);
    //     //                 //     //     }
    //     //                 //     // } else if (k === pkType.length - 1 ) {
    //     //                 //     //     if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
    //     //                 //     //         iLength.push(i);
    //     //                 //     //         if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
    //     //                 //     //             console.log(el)
    //     //                 //     //             console.log(el.CountryName.trim())
    //     //                 //     //             let asdf = resp.data[i - iLength.length].CountryName.trim();
    //     //                 //     //             let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);
    //     //                 //     //             // add current placemark layer onto worldwind layer obj
    //     //                 //     //             newGlobe.insertLayer(asdfPosition + 1, pLayer);
    //     //                 //     //             iLength = [];
    //     //                 //     //
    //     //                 //     //             countryIndex[el.CountryName.trim()] = asdfPosition + 1;
    //     //                 //     //         }
    //     //                 //     //     } else if (i == resp.data.length - 1 ) {
    //     //                 //     //         newGlobe.redraw();
    //     //                 //     //         // layerManager.synchronizeLayerList();
    //     //                 //     //
    //     //                 //     //         totalCaseNum["All Continents"] = covidNum;
    //     //                 //     //         $('#conConfirmed').text(covidNum[0]);
    //     //                 //     //         $('#conDeaths').text(covidNum[1]);
    //     //                 //     //         $('#conRecoveries').text(covidNum[2]);
    //     //                 //     //         $('#conActive').text(covidNum[3]);
    //     //                 //     //     }
    //     //                 //     // }
    //     //                 // })
    //     //
    //     //             });
    //     //             sessionStorage.setItem('COVIDinfectionMax', sortLayersLocation);
    //     //             sessionStorage.setItem('COVIDstartDate', date[0]);
    //     //             sessionStorage.setItem('COVIDendDate', date[1]);
    //     //             sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
    //     //         } else {
    //     //             ErrorReturn("COVID", "covidPK" , true);
    //     //         }
    //     //     }
    //     // });
    // }
    //
    // //  // Method 3
    // // function redrawPK(dates, category) {
    // //     newGlobe.layers.forEach(function (elem, index) {
    // //         if (elem.layerType == "H_PKLayer") {
    // //             elem.renderables.forEach (function (ele, index) {
    // //                 if (ele instanceof WorldWind.Placemark) {
    // //                     let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    // //                     let numTypes = [parseInt(ele.userProperties["Confirmed Cases"]), parseInt(ele.userProperties["Deaths"]), parseInt(ele.userProperties["Recoveries"]), parseInt(ele.userProperties["Active Cases"])];
    // //                     let magnitude = sizePK(numTypes[pkNum[category]]);
    // //                     let imageTemp;
    // //
    // //                     placemarkAttributes.imageScale = Math.abs(magnitude * 3); //placemark size!
    // //
    // //                     if (!imageTemp) {
    // //                         imageTemp = new WorldWind.ImageSource(imgPK('rgb(255,255,255)', 5, 15));
    // //                     }
    // //
    // //                     placemarkAttributes.imageSource = imageTemp;
    // //                     placemarkAttributes.imageColor = new WorldWind.Color(pktype[category][0], pktype[category][1], pktype[category][2], 1);
    // //                     ele.attributes = placemarkAttributes;
    // //                     // elem.attributes.imageScale = Math.abs(magnitude * 3);
    // //                     ele.userProperties.Type = category;
    // //                     //If the placemark date equals current date
    // //                     if (ele.userProperties.Date == dates[1]) {
    // //                         ele.enabled = true;
    // //                     } else {
    // //                         ele.enabled = false;
    // //                     }
    // //                 }
    // //             });
    // //         }
    // //         if (index == newGlobe.layers.length - 1) {
    // //             newGlobe.redraw();
    // //             console.log(newGlobe.layers);
    // //         }
    // //     });
    // //
    // //
    // //     // //Method 2
    // //     // renderables.forEach (function (elem, index) {
    // //     //     let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    // //     //     let numTypes = [parseInt(elem["Confirmed Cases"]), parseInt(elem["Deaths"]), parseInt(elem["Recoveries"]), parseInt(elem["Active Cases"])];
    // //     //     let magnitude = sizePK(numTypes[pkNum[category]]);
    // //     //     let imageTemp;
    // //     //     // renderables.attributes.imageColor = new WorldWind.Color(color[0], color[1], color[2],1);
    // //     //
    // //     //     placemarkAttributes.imageScale = Math.abs(magnitude * 3); //placemark size!
    // //     //
    // //     //     if (!imageTemp) {
    // //     //         imageTemp = new WorldWind.ImageSource(imgPK('rgb(255,255,255)', 5, 15));
    // //     //     }
    // //     //
    // //     //     placemarkAttributes.imageSource = imageTemp;
    // //     //     placemarkAttributes.imageColor = new WorldWind.Color(pktype[category][0], pktype[category][1], pktype[category][2], 1);
    // //     //     elem.attributes = placemarkAttributes;
    // //     //     // elem.attributes.imageScale = Math.abs(magnitude * 3);
    // //     //     elem.userProperties.Type = category;
    // //     //     //If the placemark date equals current date
    // //     //     if (elem.userProperties.Date == dates[1]) {
    // //     //         elem.enabled = true;
    // //     //     } else {
    // //     //         elem.enabled = false;
    // //     //     }
    // //     //
    // //     // });
    // //     // return renderables;
    // //
    // // }


    function sizePK (num){ //returns the size of the placemark given the case number
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

    return {covidPK};
});



