define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    // , './newcovidPK'
    // , './covidPK'
    // , './vaccinePK'
    // , './vaccinePK_v3'
    // , './graphsData'
    , '../config/clientConfig.js'
    // , './slider'
    ,'./Error'
    , 'menu'

], function (newGlobe, dataAll, csvD, LayerManager, clientConfig,ErrorReturn) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);
    let fromDate = $('#fromdatepicker');

    let toDate = $('#todatepicker');
    let curDate = $("#currentdatepicker");
    let COVIDcheckbox = document.getElementById("COVID-19-checkbox");
    let vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
    const covidList = [
        $('#conConfirmed'),
        $('#conDeaths'),
        $('#conRecoveries'),
        $('#conActive'),
    ];
    const vaccList = [
        $('#totVaccinations'),
        $('#incVaccinations'),
        $('#comVaccinations'),
        $('#daiVaccinations'),
        $('#milVaccinations'),
    ];

    const contVal = ["North_America", "Europe", "South_America", "Asia", "Africa", "Oceania"];  //Stores continent values that have no spaces (like in the table?)

    let numC = 0;
    let numD = 0;
    let numR = 0;
    let numA = 0;

    let numDM = 0;
    let numDV = 0;
    let numT = 0;
    let numI = 0;
    let numCV = 0;

    const NA = "Data Not Available";

    if (clientConfig === undefined) {
        ErrorReturn("placemarks and layers", "update" , true);
    }
    let d1 = dataAll.arrDate.length - 1;
    let PkStartIndex = d1 - clientConfig.initLength;
    let PkEndIndex = d1;
    let PkStartDate = dataAll.arrDate[PkStartIndex];
    let PkMidIndex = Math.floor((PkStartIndex + PkEndIndex) / 2);
    let PkMidDate = dataAll.arrDate[PkMidIndex];
    let PkEndDate = dataAll.arrDate[PkEndIndex];

    if (PkStartDate == null || PkEndDate == null) {
        ErrorReturn("date", "update" , true);
    }

    while (PkStartDate.Date.includes('NaN')) {
        PkStartIndex += 1
        PkStartDate = dataAll.arrDate[PkStartIndex];
        if (PkStartIndex >= PkEndIndex) {
            ErrorReturn("date", "update" , true);
        }
    }
    while (PkEndDate.Date.includes('NaN')) {
        PkEndIndex -= 1
        PkEndDate = dataAll.arrDate[PkEndIndex];
        if (PkEndIndex <= 0) {
            ErrorReturn("date", "update" , true);
        }
    }

    if (PkMidIndex < PkStartIndex || PkMidIndex > PkEndIndex) {
        PkMidIndex = PkStartIndex;
        PkMidDate = dataAll.arrDate[PkMidIndex];
    }

    let updateFrom = function (fromD) {
        fromDate.val(fromD);
    }

    let updateTo = function (toD) {
        toDate.val(toD);
    }

    //enables placemarks for current date; used when current date is changed based on date picker or date slider
    let updateCurr = async function (currentD) {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        curDate.val(currentD);
        let val = new Date(currentD).getTime() / 1000 + 86400;

        if (COVIDcheckbox == null) {
            ErrorReturn("COVID selection", "updateCurr" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn("vaccination selection", "updateCurr" , true);
        }
            await $("#slider-range").slider("value", val);
    };

    let updateCOVID = async function (category, continent="All Continents", inactivelayers=[], date = curDate.val()) {
        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;
        continent = continent.trim();
        let sortLayers = [];
        // let totalCaseNum;
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");

        if (COVIDcheckbox == null) {
            ErrorReturn("COVID selection", "updateCOVID" , true);
        }

        if (category == null) {
            category = document.getElementById("COVID-category").innerText.trim(); //Get the COVID category
        }

        if (inactivelayers == []) {
            let layerList = JSON.parse(sessionStorage.getItem('COVIDLayerList')); //session storage can only store string values, so we need to parse the JSON object
            let notActiveLayers = $('#layerList').find("button[style='color: rgb(0, 0, 0);']")
                .not("button[class='active']").toArray();  //Find the buttons with the color white (which means they aren't selected and shouldn't be enabled on the globe, and convert them to an array that has all their properties
            for (let i = 0; i < notActiveLayers.length; i++) {
                inactivelayers.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
            }
            if (contVal.includes(continent.trim().split(" ").join("_"))) {
                layerList[continent.trim().split(' ').join('_')] = inactivelayers; //continent equals specific, no space continent
            } else {
                layerList[continent] = inactivelayers; //continent = "All Continents"
            }

            sessionStorage.setItem('COVIDLayerList', JSON.stringify(layerList));
        }

        if (COVIDcheckbox.checked === true) { //checks if COVID pk is enabled
            // if (continent === "All Continents") {
            //     totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
            //         "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]}; //Reset all the continent's case numbers to zero
            // } else {
            //     totalCaseNum = JSON.parse(sessionStorage.getItem('totalCaseNum'));
            //     for (let i = 0; i < 4; i++) {
            //         totalCaseNum["All Continents"][i] -= totalCaseNum[continent][i]; // Subtract the case number of the selected continent from the case number of all continents
            //     }
            //     totalCaseNum[continent] = [0,0,0,0]; //Reset the selected continent's case number to zero (for recalculation)
            // }

            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && !inactivelayers.includes(elem.displayName.trim())) {
                    elem.renderables.forEach(function (d) {
                        if (d instanceof WorldWind.Placemark) {
                            if (d.userProperties.Date === date) {
                                if (elem.enabled) {
                                    if (d.userProperties.Type == "Confirmed Cases") {
                                        numC += parseInt(d.userProperties["Confirmed Cases"]);
                                        // totalCaseNum[elem.continent.trim()][0] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Deaths") {
                                        numD += parseInt(d.userProperties.Deaths);
                                        // totalCaseNum[elem.continent.trim()][1] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Recoveries") {
                                        numR += parseInt(d.userProperties.Recoveries);
                                        // totalCaseNum[elem.continent.trim()][2] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Active Cases") {
                                        numA += parseInt(d.userProperties["Active Cases"]);
                                        // totalCaseNum[elem.continent.trim()][3] += parseInt(d.userPropertie s.Number);
                                    }

                                    if ((numA < 0 && !isNaN(numR) && numR >= 0)
                                        || (isNaN(numA) && !isNaN(numR) && numR >= 0)) {
                                        // If the active number is below zero or not a number, and if the recovery number is a number that is not below zero,
                                        // calculate the active cases by subtracting deaths and recoveries from confirmed cases
                                        numA = parseInt(parseInt(numC) - parseInt(numD) - parseInt(numR));
                                    }
                                    if ((numR < 0 && !isNaN(numA) && numA >= 0)
                                        || (isNaN(numR) && !isNaN(numA) && numA >= 0)) {
                                        numR = parseInt(parseInt(numC) - parseInt(numD) - parseInt(numA));
                                    }

                                        // if (d.userProperties.Type == category) {
                                    sortLayers.push(d); //This contains the number of locations available
                                    d.enabled = true;
                                    // } else {
                                    //     d.enabled = false;
                                    // }
                                } else {
                                    d.enabled = false;
                                }
                            } else {
                                d.enabled = false;
                            }
                        }
                    });
                }
                if (index === newGlobe.layers.length - 1) {
                    newGlobe.redraw();
                    layerManager.synchronizeLayerList(inactivelayers);
                }
            });

            // The active cases and recoveries can be calculated if one of the other is not available
            if (isNaN(numR) && isNaN(numA)) {
                numR = NA;
                numA = NA;
            }
            // else if (isNaN(numA) && !isNaN(numR)) {
            //     numA = numC - numD - numR
            // } else if (!isNaN(numA) && isNaN(numR)) {
            //     numR = numC - numD - numA
            // }


                let covidNum = [numC, numD, numR, numA];
            // totalCaseNum["All Continents"].forEach(function (elem, i) {
            //     totalCaseNum["All Continents"][i] += covidNum[i]; //Add the continent's case number back to original (if the continent was "All Continents", the number would just be 0 + the correct number.
                // This eliminates the need of having to assign
                // totalCaseNum["All Continents"] = [numC, numD, numR, numA]; for "All Continents" and doing something else for the others
            // });
            //Updates the numbers
            covidList.forEach(function (elem, i) {
                // covidList[i].text(totalCaseNum[continent][i]);
                covidList[i].text(covidNum[i]);
            });
            //Sets the infection slider range and text
            $("#hInfectionSlider").slider({max: sortLayers.length, values: [0, sortLayers.length]});
            $("#hInfectionsValue").text("0 to " + sortLayers.length + " Locations");
            //Stores the case number for each continent in the session storage
            // sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
        } else {
            alert("COVID placemarks haven't been enabled.");
        }
    }

    let updateVaccine = async function (category, continent="All Continents", inactivelayers=[], date = curDate.val()) {
        numDV = 0;
        numT = 0;
        numI = 0;
        numCV = 0;
        numDM = 0;
        let sortLayers = [];
        let totalVaccNum;
        continent = continent.trim();


        if (category == null) {
            category = document.getElementById("vaccine-category").innerText.trim();
        }

        if (inactivelayers === []) {
            let notActiveLayers = $('#layerList').find("button[style='color: rgb(0, 0, 0);']")
                .not("button[class='active']").toArray();
            for (let i = 0; i < notActiveLayers.length; i++) {
                inactivelayers.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
            }
        }

        if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {

            // if (continent === "All Continents") {
            //     totalVaccNum = {"All Continents":[0,0,0,0,0],"North_America":[0,0,0,0,0],"Europe":[0,0,0,0,0],"South_America":[0,0,0,0,0],
            //         "Asia":[0,0,0,0,0],"Africa":[0,0,0,0,0],"Oceania":[0,0,0,0,0],"Other":[0,0,0,0,0]};
            // } else {
            //     totalVaccNum = JSON.parse(sessionStorage.getItem('totalVaccNum'));
            //     console.log(totalVaccNum, continent, totalVaccNum[continent]);
            //     for (let i = 0; i < 5; i++) {
            //         totalVaccNum["All Continents"][i] -= totalVaccNum[continent][i];
            //     }
            //     totalVaccNum[continent] = [0,0,0,0,0];
            // }

            //enables placemark based on the user properties date and type
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && !inactivelayers.includes(elem.displayName.trim())) {
                    elem.renderables.forEach(function (d) {
                        if (d instanceof WorldWind.Placemark) {
                            if (d.userProperties.Date === date && date !== "null") {
                                if (elem.enabled) {
                                    if (d.userProperties.Type == "Total Vaccinations") {
                                        numT += parseInt(d.userProperties.Number);
                                        // totalVaccNum[elem.continent.trim()][0] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                        numI += parseInt(d.userProperties.Number);
                                        // totalVaccNum[elem.continent.trim()][1] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Completed Vaccinations") {
                                        numCV += parseInt(d.userProperties.Number);
                                        // totalVaccNum[elem.continent.trim()][2] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Daily Vaccinations") {
                                        numDV += parseInt(d.userProperties.Number);
                                        // totalVaccNum[elem.continent.trim()][3] += parseInt(d.userProperties.Number);
                                    } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                        numDM += parseInt(d.userProperties.Number);
                                        // totalVaccNum[elem.continent.trim()][4] += parseInt(d.userProperties.Number);
                                    }
                                }


                                if (d.userProperties.Type == category) {
                                    sortLayers.push(d);
                                    d.enabled = true;
                                } else {
                                    d.enabled = false;
                                }
                            } else {
                                d.enabled = false;
                            }
                        }
                    })
                }
                if (index === newGlobe.layers.length - 1) {
                    newGlobe.redraw();
                    layerManager.synchronizeLayerList(inactivelayers);
                }
            });
            if(isNaN(numT) && !isNaN(numI) && !isNaN(numCV)){
                numT = numI + numCV;
            } else if (isNaN(numT)) {
                numT = NA;
            }
            if (isNaN(numI) && !isNaN(numT) && !isNaN(numCV)) {
                numI = numT - numCV;
            } else if (isNaN(numI)) {
                numI = NA;
            }
            if (isNaN(numCV )&& !isNaN(numT) && !isNaN(numI)) {
                numCV = numT - numI;
            } else if (isNaN(numCV)) {
                numCV = NA;
            }
            if (isNaN(numDV)) {
                numDV = NA;
            }
            if (isNaN(numDM)) {
                numDM = NA;
            }
            let vaccNum = [numT, numI, numCV, numDV, numDM];
            // totalVaccNum["All Continents"].forEach(function (elem, i) {
            //     totalVaccNum["All Continents"][i] += vaccNum[i]; //Add the continent's case number back to original (if the continent was "All Continents", the number would just be 0 + the correct number.
                // This eliminates the need of having to assign
                // totalVaccNum["All Continents"] = [numC, numD, numR, numA]; for "All Continents" and doing something else for the others
            // });
            //Updates the numbers
            vaccList.forEach(function (elem, i) {
                // vaccList[i].text(totalVaccNum[continent][i]);
                vaccList[i].text(vaccNum[i]);
            });

            $("#hInfectionSlider").slider({max: sortLayers.length, values: [0, sortLayers.length]});
            $("#hInfectionsValue").text("0 to " + sortLayers.length + " Locations");
            sessionStorage.setItem('vaccInfectionMax', String(sortLayers.length));
            // sessionStorage.setItem("totalVaccNum", JSON.stringify(totalVaccNum));
        } else {
            alert("Vaccine placemarks haven't been enabled.");
        }
    }


    return {
        updateFrom,
        updateTo,
        updateCurr,
        updateCOVID,
        updateVaccine
    }
})