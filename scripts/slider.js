define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    // , './covidPK_bak'
    , './newcovidPK'
    // , './covidPK'
    // , './vaccinePK'
    , './vaccinePK_v3'
    , './graphsData'
    , '../config/clientConfig.js'
    ,'./Error'
    , 'menu'

], function (newGlobe, dataAll, csvD, LayerManager, covidPK, vaccinePK, graphsD, clientConfig,ErrorReturn) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    let fromDate = $('#fromdatepicker');
    let toDate = $('#todatepicker');
    let curDate = $("#currentdatepicker");

    let COVIDcategory = document.getElementById("COVID-category");
    let COVIDcheckbox = document.getElementById("COVID-19-checkbox");
    let vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");

    let l;
    let numC = 0;
    let numD = 0;
    let numR = 0;
    let numA = 0;

    let numDM = 0;
    let numDV = 0;
    let numT = 0;
    let numI = 0;
    let numCV = 0;

    const confirmedC= "Confirmed Cases";
    const deathC = "Deaths";
    const recoveriesC = "Recoveries";
    const activeC = "Active Cases";
    const globV = "Global Vaccinations";
    const totalV = "Total Vaccinations";
    const incV = "Incomplete Vaccinations";
    const comV = "Completed Vaccinations";
    const daiV = "Daily Vaccinations";
    const milV = "Daily Vaccinations/million";
    const NA = "Data Not Available";

    const contVal = ["North_America", "Europe", "South_America", "Asia", "Africa", "Oceania"];
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
    let categoryS = confirmedC;
    let categoryV = totalV;


    let speed = false;

    if (clientConfig === undefined || covidPK === undefined) {
        ErrorReturn("placemarks and layers", "slider" , true);
    }

    let d1 = dataAll.arrDate.length - 1;
    let PkStartIndex = d1 - clientConfig.initLength;
    let PkEndIndex = d1;
    let PkStartDate;
    let PkMidIndex = Math.floor((PkStartIndex + PkEndIndex) / 2);
    let PkMidDate = dataAll.arrDate[PkMidIndex];
    let PkEndDate;

    // if (PkStartDate == null || PkEndDate == null) {
    //     ErrorReturn("date", "slider" , true);
    // }
    //
    // while (PkStartDate.Date.includes('NaN')) {
    //     PkStartIndex += 1
    //     PkStartDate = dataAll.arrDate[PkStartIndex];
    //     if (PkStartIndex >= PkEndIndex) {
    //         ErrorReturn("date", "slider" , true);
    //     }
    // }
    // while (PkEndDate.Date.includes('NaN')) {
    //     PkEndIndex -= 1
    //     PkEndDate = dataAll.arrDate[PkEndIndex];
    //     if (PkEndIndex <= 0) {
    //         ErrorReturn("date", "slider" , true);
    //     }
    // }

    if (PkMidIndex < PkStartIndex || PkMidIndex > PkEndIndex) {
        PkMidIndex = PkStartIndex;
        PkMidDate = dataAll.arrDate[PkMidIndex];
    }

    //under third left tab; plays a timelapse of the placemarks over the course of a set date range
    let timelapse = function (sd, ed) {
        //sd = start date, ed= end date
        let a;
        let dDate;
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        let duration = parseInt($("#speedValue").text().trim().split(" ")[0]) * 1000;
        console.log(duration)
        console.log($("#speedValue").text());

        if (COVIDcheckbox.checked === true) {
            if (sd < dataAll.arrDate[0].Date) {
                sd = dataAll.arrDate[0].Date;
            }
            if (ed > dataAll.arrDate[dataAll.arrDate.length - 1].Date) {
                ed = dataAll.arrDate[dataAll.arrDate.length - 1].Date;
            }
            a = dataAll.arrDate.findIndex(dat => dat.Date === sd);
            dDate = dataAll.arrDate[a].Date;
        } else if (vaccCheckbox.checked === true) {
            if (sd < dataAll.arrDateV[0].Date) {
                sd = dataAll.arrDateV[0].Date;
            }
            if (ed > dataAll.arrDateV[dataAll.arrDateV.length - 1].Date) {
                ed = dataAll.arrDateV[dataAll.arrDateV.length - 1].Date;
            }
            a = dataAll.arrDateV.findIndex(dat => dat.Date === sd);
            dDate = dataAll.arrDateV[a].Date;
        }

        $("#slider-range").slider("disable");
        l = setInterval(async function () {
            if (COVIDcheckbox.checked === true) {
                dDate = dataAll.arrDate[a].Date;
            } else if (vaccCheckbox.checked === true) {
                dDate = dataAll.arrDateV[a].Date;
            }
            curDate.val(dDate);

            $("#slider-range").slider("disable");
            let val = new Date(dDate).getTime() / 1000 + 86400;
            await $("#slider-range").slider("value", val);
            // $("#amount").val(dataAll.arrDate[a].Date);
            $("#amount").val(dDate);
            $("#currentdatepicker").val(dDate);
            $("#slider-range").slider("disable");

            if (ed === dDate) {
                curDate.attr('disabled', false);
                fromDate.attr('disabled', false);
                toDate.attr('disabled', false);
                curDate.val(dDate);
                $("#amount").val(curDate.val());
                $('#stopTL').hide();
                $('#pauseTL').hide();
                $('#toggleTL').show();
                $("#slider-range").slider("enable");
                $("#hInfectionSlider").slider("enable");

                clearI();
            }
            a++;
        }, duration) //
    };


    //clears timelapse interval
    let clearI = function () {
        clearInterval(l);
    };

    //under third left tab; used to update placemarks shown based on filter boundaries
    let updateHIS = async function (v1, v2, Dd = "none") {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        COVIDcategory = document.getElementById("COVID-category");
        PkStartDate = sessionStorage.getItem('COVIDstartDate');
        PkEndDate = sessionStorage.getItem('COVIDendDate');

        if (COVIDcheckbox == null) {
            ErrorReturn("COVID menu", "updateHIS" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn("vaccination menu", "updateHIS" , true);
        }

        let sortLayers;
        let totalCaseNum;
        let totalVaccNum;
        let continentVal = document.getElementById("continentList").innerText.trim().split(' ').join('_');
        let notActiveLayers = $('#layerList').find("button[style='color: rgb(0, 0, 0);']")
            .not("button[class='active']").toArray();  //Finds all the buttons that have been switched off
        let layerList;
        let inactiveID = [];
        let curLayerList = []; //This will be the variable that accesses and stores the inactive layers for the newly selected continent

        if (Dd !== "none") { //checks if a date is given
            sortLayers = 0;
            if (COVIDcheckbox.checked === true) { //checks if we should turn on COVID PK or Vaccine PK
                categoryS = COVIDcategory.innerText.trim();
                for (let i = 0; i < notActiveLayers.length; i++) {
                    inactiveID.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
                }

                if (Dd <= PkStartDate || Dd > PkEndDate) { //Checks if selected date is before loaded range



                    console.log("before: ");
                    console.log(PkStartIndex, PkEndIndex);
                    console.log(PkStartDate, PkEndDate);

                    console.log(Dd);
                    PkMidDate.Date = Dd; //sets middate as the date selected
                    PkMidIndex = dataAll.arrDate.findIndex(x => x.Date == Dd); //finds index of selected date in array
                    console.log(PkMidDate, PkMidIndex);

                    if (PkMidIndex > dataAll.arrDate.length - 1 || PkMidIndex < 0) { //checks if selected date is beyond available range
                        console.error("Error loading placemarks! (1)");
                        $('#amount').val(Dd);
                        $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                        $("#slider-range").slider("disable");
                    } else {
                        PkEndIndex = PkMidIndex + Math.floor(clientConfig.initLength / 2); //loads half of inital load range before and after (so total is still in initial load range)
                        PkStartIndex = PkMidIndex - Math.floor(clientConfig.initLength / 2);

                        if (PkEndIndex > dataAll.arrDate.length - 1) {
                            PkEndIndex = dataAll.arrDate.length - 1; //Reset end date index to last index if it's larger than available date range
                        }
                        if (PkStartIndex < 0) {
                            PkStartIndex = 0; //Reset start date index to first index if it's less than 0
                        }

                        PkStartDate = dataAll.arrDate[PkStartIndex];
                        PkEndDate = dataAll.arrDate[PkEndIndex];
                        console.log("after: ");
                        console.log(PkStartIndex, PkEndIndex);
                        console.log(PkStartDate, PkEndDate);

                        $("#slider-range").slider("disable");  //We need to test and see which one works, we don't need 3
                        $("#slider-range").slider({disabled: "true"});
                        $("#slider-range").slider({disabled: true});
                        if (Dd >= PkStartDate.Date && Dd <= PkEndDate.Date) { //checks if new PkMidIndex is greater than or less than loaded range
                            if (contVal.includes(continentVal)) { //We need to look at the case number updates for this, it seems like it updates the number for the whole thing, not just one of continents
                                await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd, continentVal,"all_countries",inactiveID);
                                sortLayers = parseInt(sessionStorage.getItem('COVIDinfectionMax'));
                                totalCaseNum = JSON.parse(sessionStorage.getItem('totalCaseNum'));
                                covidList.forEach(function (elem, i) {
                                    covidList[i].text(totalCaseNum[continentVal][i]);
                                });
                            } else {
                                await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd,"none","all_countries",inactiveID);
                                sortLayers = parseInt(sessionStorage.getItem('COVIDinfectionMax'));
                            }

                            $("#slider-range").slider("enable");   //This may be the reason why timelapse date slider flashes on and off
                            $("#slider-range").slider({enabled: "true"});
                            $("#slider-range").slider({enabled: true});

                        } else {
                            console.log(type(Dd))
                            console.log(type(PkStartDate.Date));
                            console.error("Error! Placemarks were not loaded properly (2). " + Dd + " is not within the date range " + dataAll.arrDate[0].Date +" and " + dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                            alert("Error! Placemarks were not loaded properly (2). " + Dd + " is not within the date range " + dataAll.arrDate[0].Date +" and " + dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                            console.log(dataAll.arrDate.includes(Dd));
                            console.log(dataAll.arrDate.findIndex(x => x.Date = Dd));
                            $('#amount').val(Dd);
                            $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                        }
                    }

                } else {
                    numC = 0;
                    numD = 0;
                    numA = 0;
                    numR = 0;
                    layerList = JSON.parse(sessionStorage.getItem('COVIDLayerList'));
                    layerList[continentVal.split(' ').join('_')] = inactiveID; //The array is pushed into a JSON object for the continent (prior to change)
                    sessionStorage.setItem('COVIDLayerList', JSON.stringify(layerList)); //Stringfy JSON object then push to session storage (session storage can only store key value pairs composed of strings


                    if (contVal.includes(continentVal)) {
                        totalCaseNum = JSON.parse(sessionStorage.getItem('totalVaccNum'));
                        for (let i = 0; i < covidList.length; i++) {
                            totalCaseNum["All Continents"][i] -= totalCaseNum[continentVal][i];
                        }
                        totalCaseNum[continentVal] = [0,0,0,0];
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.continent.trim() == continentVal && !inactiveID.includes(elem.displayName.trim())) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == confirmedC) {
                                                numC += parseInt(d.userProperties.Number);
                                                totalCaseNum[continentVal][0] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == deathC) {
                                                numD += parseInt(d.userProperties.Number);
                                                totalCaseNum[continentVal][1] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == recoveriesC) {
                                                numR += parseInt(d.userProperties.Number);
                                                totalCaseNum[continentVal][2] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == activeC) {
                                                numA += parseInt(d.userProperties.Number);
                                                totalCaseNum[continentVal][3] += parseInt(d.userProperties.Number);
                                            }
                                            // if (d.userProperties.Type == categoryS) {
                                                sortLayers += 1;
                                                d.enabled = true;
                                            // } else {
                                            //     d.enabled = false;
                                            // }
                                        } else {
                                            d.enabled = false;
                                        }
                                    }
                                });
                            }
                            if (index === newGlobe.layers.length - 1) {
                                newGlobe.redraw();
                                layerManager.synchronizeLayerList(inactiveID);
                                for (let i = 0; i < covidList.length; i++) {
                                    totalCaseNum["All Continents"][i] += totalCaseNum[continentVal][i];
                                }
                            }
                        });

                    } else {
                        totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
                            "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]};
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && !inactiveID.includes(elem.displayName.trim())) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            // numC += parseInt(d.userProperties["Confirmed Cases"]);
                                            // numD += parseInt(d.userProperties["Confirmed Cases"]);
                                            // numC += parseInt(d.userProperties["Confirmed Cases"]);
                                            // numC += parseInt(d.userProperties["Confirmed Cases"]);
                                            if (d.userProperties.Type == confirmedC) {
                                                numC += parseInt(d.userProperties.Number);
                                                totalCaseNum[elem.continent.trim()][0] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == deathC) {
                                                numD += parseInt(d.userProperties.Number);
                                                totalCaseNum[elem.continent.trim()][1] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == recoveriesC) {
                                                numR += parseInt(d.userProperties.Number);
                                                totalCaseNum[elem.continent.trim()][2] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == activeC) {
                                                numA += parseInt(d.userProperties.Number);
                                                totalCaseNum[elem.continent.trim()][3] += parseInt(d.userProperties.Number);
                                            }
                                            // if (d.userProperties.Type == categoryS) {
                                            sortLayers += 1;
                                            d.enabled = true;
                                            // } else {
                                            //     d.enabled = false;
                                            // }
                                        } else {
                                            d.enabled = false;
                                        }
                                    }
                                });
                            }
                            if (index === newGlobe.layers.length - 1) {
                                newGlobe.redraw();
                                layerManager.synchronizeLayerList(inactiveID);
                                totalCaseNum["All Continents"] = [numC, numD, numR, numA];
                            }
                        });
                    }

                    if (isNaN(numR) && isNaN(numA)) {
                        numR = NA;
                        numA = NA;
                    }
                    $('#conConfirmed').text(numC);
                    $('#conDeaths').text(numD);
                    $('#conRecoveries').text(numR);
                    $('#conActive').text(numA);
                    sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
                }
            } else if (vaccCheckbox.checked == true) {
                categoryV = document.getElementById("vaccine-category").innerText.trim();
                layerList = JSON.parse(sessionStorage.getItem('vaccLayerList'));
                for (let i = 0; i < notActiveLayers.length; i++) {
                    inactiveID.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
                }
                layerList[continentVal.split('_').join(' ')] = inactiveID;
                sessionStorage.setItem('vaccLayerList', JSON.stringify(layerList)); //Stringfy JSON object then push to session storage (session storage can only store key value pairs composed of strings
                if (categoryV == globV) {
                    categoryV = totalV;
                }
                if (Dd > dataAll.arrDateV[dataAll.arrDateV.length - 1].Date || Dd < dataAll.arrDateV[0].Date) {
                    alert("error! beyond date range" + Dd + " is not within the date range " + dataAll.arrDateV[0].Date +" and " + dataAll.arrDateV[dataAll.arrDateV.length - 1].Date);
                } else {
                    numT = 0;
                    numI = 0;
                    numDV = 0;
                    numDM = 0;
                    numCV = 0;

                    //enables placemark based on the placemark properties current date and type
                    if (contVal.includes(continentVal)) {
                        totalVaccNum = JSON.parse(sessionStorage.getItem('totalVaccNum'));
                        for (let i = 0; i < vaccList.length; i++) {
                            totalVaccNum["All Continents"][i] -= totalVaccNum[continentVal][i];
                        }
                        totalVaccNum[continentVal] = [0,0,0,0,0];
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && elem.continent.trim() == continentVal && !inactiveID.includes(elem.displayName.trim())) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == totalV) {
                                                numT += parseInt(d.userProperties.Number);
                                                totalVaccNum[continentVal][0] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == incV) {
                                                numI += parseInt(d.userProperties.Number);
                                                totalVaccNum[continentVal][1] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == comV) {
                                                numCV += parseInt(d.userProperties.Number);
                                                totalVaccNum[continentVal][2] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == daiV) {
                                                numDV += parseInt(d.userProperties.Number);
                                                totalVaccNum[continentVal][3] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == milV) {
                                                numDM += parseInt(d.userProperties.Number);
                                                totalVaccNum[continentVal][4] += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type == categoryV) {
                                                sortLayers += 1;
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
                                layerManager.synchronizeLayerList(inactiveID);
                                for (let i = 0; i < vaccList.length; i++) {
                                    totalVaccNum["All Continents"][i] += totalVaccNum[continentVal][i];
                                }
                            }
                        });
                    } else {
                        totalVaccNum = {"All Continents":[0,0,0,0,0],"North_America":[0,0,0,0,0],"Europe":[0,0,0,0,0],"South_America":[0,0,0,0,0],
                            "Asia":[0,0,0,0,0],"Africa":[0,0,0,0,0],"Oceania":[0,0,0,0,0],"Other":[0,0,0,0,0]};
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && !inactiveID.includes(elem.displayName.trim())) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == totalV) {
                                                numT += parseInt(d.userProperties.Number);
                                                totalVaccNum[elem.continent.trim()][0] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == incV) {
                                                numI += parseInt(d.userProperties.Number);
                                                totalVaccNum[elem.continent.trim()][1] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == comV) {
                                                numCV += parseInt(d.userProperties.Number);
                                                totalVaccNum[elem.continent.trim()][2] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == daiV) {
                                                numDV += parseInt(d.userProperties.Number);
                                                totalVaccNum[elem.continent.trim()][3] += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == milV) {
                                                numDM += parseInt(d.userProperties.Number);
                                                totalVaccNum[elem.continent.trim()][4] += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type == categoryV) {
                                            sortLayers += 1;
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
                                layerManager.synchronizeLayerList(inactiveID);
                                totalVaccNum["All Continents"] = [numT, numI, numCV, numDV, numDM];
                            }
                        });
                    }
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
                        numDV = NA
                    }
                    if (isNaN(numDM)) {
                        numDM = NA
                    }
                    $('#totVaccinations').text(numT);
                    $('#incVaccinations').text(numI);
                    $('#comVaccinations').text(numCV);
                    $('#daiVaccinations').text(numDV);
                    $('#milVaccinations').text(numDM);
                    sessionStorage.setItem("totalVaccNum", JSON.stringify(totalVaccNum));
                }
                // }
            }
            await $("#hInfectionSlider").slider({max: sortLayers, values: [0, sortLayers]});
            $("#hInfectionsValue").text("0 to " + sortLayers + " Locations");
        } else {
            sortLayers = [];
            if (COVIDcheckbox.checked === true) {
                numC = 0;
                numD = 0;
                numR = 0;
                numA = 0;
                categoryS = COVIDcategory.innerText.trim();

                if (contVal.includes(continentVal)) {
                    totalCaseNum = JSON.parse(sessionStorage.getItem('totalCaseNum'));
                    totalCaseNum[continentVal] = [0,0,0,0];

                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.continent.trim() == continentVal) {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == confirmedC) {
                                            numC += parseInt(d.userProperties.Number);
                                            totalCaseNum[continentVal][0] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == deathC) {
                                            numD += parseInt(d.userProperties.Number);
                                            totalCaseNum[continentVal][1] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == recoveriesC) {
                                            numR += parseInt(d.userProperties.Number);
                                            totalCaseNum[continentVal][2] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == activeC) {
                                            numA += parseInt(d.userProperties.Number);
                                            totalCaseNum[continentVal][3] += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type == categoryS) {
                                            sortLayers.push(d);
                                        }
                                    } else {
                                        d.enabled = false;
                                    }
                                }
                            })
                        }
                        if (index === newGlobe.layers.length - 1) {
                            newGlobe.redraw();
                            layerManager.synchronizeLayerList;
                        }
                    });
                    // for (let i = 0; i < 4; i++) {
                    //     totalCaseNum["All Continents"][i] += totalCaseNum[continentVal][i];
                    // }
                } else {
                    totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
                        "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]};

                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == confirmedC) {
                                            numC += parseInt(d.userProperties.Number);
                                            totalCaseNum[elem.continent.trim()][0] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == deathC) {
                                            numD += parseInt(d.userProperties.Number);
                                            totalCaseNum[elem.continent.trim()][1] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == recoveriesC) {
                                            numR += parseInt(d.userProperties.Number);
                                            totalCaseNum[elem.continent.trim()][2] += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == activeC) {
                                            numA += parseInt(d.userProperties.Number);
                                            totalCaseNum[elem.continent.trim()][3] += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type == categoryS) {
                                            sortLayers.push(d);
                                        }
                                    } else {
                                        d.enabled = false;
                                    }
                                }
                            })
                        }
                        if (index === newGlobe.layers.length - 1) {
                            newGlobe.redraw();
                            layerManager.synchronizeLayerList;
                            totalCaseNum["All Continents"] = [numC, numD, numR, numA];
                        }
                    });
                }
                sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
                if (isNaN(numR) && isNaN(numA)) {
                    numR = NA;
                    numA = NA;
                } else if (isNaN(numA) && !isNaN(numR)) {
                    numA = numC - numD - numR;
                } else if (!isNaN(numA) && isNaN(numR)) {
                    numR = numC - numD - numA;
                }
                $('#conConfirmed').text(numC);
                $('#conDeaths').text(numD);
                $('#conRecoveries').text(numR);
                $('#conActive').text(numA);
            } else if (vaccCheckbox.checked == true) {
                numT = 0;
                numI = 0;
                numDV = 0;
                numDM = 0;
                numCV = 0;
                categoryV = document.getElementById("vaccine-category").innerText.trim();
                if (categoryV == globV) {
                    categoryV = totalV;
                }

                if (contVal.includes(continentVal)) {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        // if (d.userProperties.Type == totalV) {
                                        //     numT += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == incV) {
                                        //     numI += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == comV) {
                                        //     numCV += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == daiV) {
                                        //     numDV += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == milV) {
                                        //     numDM += parseInt(d.userProperties.Number);
                                        // }
                                        if (d.userProperties.Type == categoryV) {
                                            sortLayers.push(d);
                                        }
                                    } else {
                                        d.enabled = false;
                                    }
                                }
                            })
                        }
                        if (index === newGlobe.layers.length - 1) {
                            newGlobe.redraw();
                            layerManager.synchronizeLayerList;
                        }
                    });
                } else {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer") {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        // if (d.userProperties.Type == totalV) {
                                        //     numT += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == incV) {
                                        //     numI += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == comV) {
                                        //     numCV += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == daiV) {
                                        //     numDV += parseInt(d.userProperties.Number);
                                        // } else if (d.userProperties.Type == milV) {
                                        //     numDM += parseInt(d.userProperties.Number);
                                        // }
                                        if (d.userProperties.Type == categoryV) {
                                            sortLayers.push(d);
                                        }
                                    } else {
                                        d.enabled = false;
                                    }
                                }
                            })
                        }
                        if (index === newGlobe.layers.length - 1) {
                            newGlobe.redraw();
                            layerManager.synchronizeLayerList;
                        }
                    });
                }
                // if(isNaN(numT) && !isNaN(numI) && !isNaN(numCV)){
                //     numT = numI + numCV;
                // } else if (isNaN(numT)) {
                //     numT = NA;
                // }
                // if (isNaN(numI) && !isNaN(numT) && !isNaN(numCV)) {
                //     numI = numT - numCV;
                // } else if (isNaN(numI)) {
                //     numI = NA;
                // }
                // if (isNaN(numCV )&& !isNaN(numT) && !isNaN(numI)) {
                //     numCV = numT - numI;
                // } else if (isNaN(numCV)) {
                //     numCV = NA;
                // }
                // if (isNaN(numDV)) {
                //     numDV = NA;
                // }
                // if (isNaN(numDM)) {
                //     numDM = NA;
                // }
                // $('#totVaccinations').text(numT);
                // $('#incVaccinations').text(numI);
                // $('#comVaccinations').text(numCV);
                // $('#daiVaccinations').text(numDV);
                // $('#milVaccinations').text(numDM);
            }

            $("#hInfectionSlider").slider({max: sortLayers.length}); //Set the maximum number of locations for infection slider
            //sorts all enabled placemarks based on case number from least to greatest
            sortLayers.sort(function (a, b) {
                if (a.userProperties.Number === b.userProperties.Number) {
                    return 0;
                }
                if (a.userProperties.Number > b.userProperties.Number) {
                    return 1;
                } else {
                    return -1;
                }
            });

            //based on boundaries set using the filter slider, the placemarks are enabled or disabled
            for (let k = 0; k < sortLayers.length; k++) {
                if (k >= v1 && k <= v2) {
                    sortLayers[k].enabled = true;
                } else {
                    sortLayers[k].enabled = false;
                }
            }
        }
    };

    //under third left tab; filter slider for lowest to highest infections
    let infectionSlider = function (max= null) {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        let maxVal;
        if (max != null) {
            maxVal = max;
        } else {
            // maxVal = $("#hInfectionsValue").text().split(" ")[2];
            if (vaccCheckbox != null && vaccCheckbox.checked === true) {
                maxVal = sessionStorage.getItem('vaccInfectionMax');
            } else if (COVIDcheckbox != null && COVIDcheckbox.checked === true) {
                maxVal = sessionStorage.getItem('COVIDinfectionMax');
            }
        }

        $("#hInfectionSlider").slider({
            min: 0,
            max: maxVal,
            values: [0, maxVal],
            slide: async function (event, ui) {
                if (ui.values[0] > ui.values[1]) {
                    alert("Error! The filter from value must be less than the filter to value.");
                    $("#hInfectionSlider").slider({values: [ui.values[1], ui.values[0]]});
                } else {
                    if (ui.values[1] == 1) {
                        //updates text
                        $("#hInfectionsValue").text(ui.values[0] + " to " + ui.values[1] + " Location");
                    } else {
                        //updates text
                        $("#hInfectionsValue").text(ui.values[0] + " to " + ui.values[1] + " Locations");
                    }

                    //updates placemarks displayed based on infection slider range
                    await updateHIS(ui.values[0], ui.values[1]);
                }
            }
        });
        $("#hInfectionsValue").text("0 to " + maxVal + " Locations");
    };

    //under third left tab; speed slider for timelapse (cannot be changed during timelapse)
    let speedSlider = function (max= null) {
        $("#speedSlider").slider({
            min: 0.5, //0.5 seconds fastest
            max: 10, //10 seconds slowest
            step: 0.25, //slider increases/decreases in increments of 0.25
            value: 1, //Default value 1 second
            slide: async function (event, ui) {
                // $("#hInfectionsValue").text(ui.values[0] + " to " + ui.values[1] + " Locations");
                if (ui.value == 1) {
                    $("#speedValue").text(ui.value + " second");
                } else {
                    $("#speedValue").text(ui.value + " seconds");
                }
            }
        });
        $("#speedValue").text("1 Second");
    };

    //under third left tab; surface opacity slider
    let opacitySlider = function () {
        $("#opacitySlider").slider({
            value: 100,
            animate: true,
            slide: function (event, ui) {
                //updates text
                $("#opacitySliderValue").text(ui.value + "% opacity");
            },
            stop: function (event, ui) {
                //when user releases mouse, sets opacity to that percentage
                setOpacity(ui.value / 100); //Do we really only want it to be when they release the mouse and not when they slide the mouse?
            }
        });
    };

    //sets surface opacity
    let setOpacity = function (value) {
        newGlobe.Opacity = value;
        newGlobe.surfaceOpacity = newGlobe.Opacity;
    };

    //date slider
    let dateSlider = function (sd) {
        let minDate = new Date(dataAll.arrDate[0].Date).getTime() / 1000 + 86400;
        let maxDate = new Date(dataAll.arrDate[dataAll.arrDate.length - 1].Date).getTime() / 1000 + 86400;
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");

        if (COVIDcheckbox == null) {
            ErrorReturn("COVID menu", "dateSlider" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn("vaccination menu", "dateSlider" , true);
        }
        if (vaccCheckbox.checked === true) {
            minDate = new Date(dataAll.arrDateV[0].Date).getTime() / 1000 + 86400;
            maxDate = new Date(dataAll.arrDateV[dataAll.arrDateV.length - 1].Date).getTime() / 1000 + 86400;
        }

        $("#slider-range").slider({
            min: minDate,
            max: maxDate,
            step: 86400,
            value: new Date(sd).getTime() / 1000 + 86400
            , change: async function (event, ui) {
                $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));
                curDate.val($('#amount').val());
                await updateHIS(0, $("#hInfectionsValue").text().split(" ")[2], $("#amount").val());
                // await $("#hInfectionsValue").slider('values', 1, $("#hInfectionsValue").text().split(" ")[2]);
            }, create: function (event, ui) {
                $('#amount').val(curDate.val());
                curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000 + 86400), "yyyy-MM-dd"));
            }
        });
        //display current date
        curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000 + 86400), "yyyy-MM-dd"));
        $('#amount').val(curDate.val());
    };

    //range slider; sets date range for date slider
    let rangeSlider = function () {
        $("#doubleSlider-range").slider({
            min: new Date(fromDate.val()).getTime() / 1000 + 86400,
            max: new Date(toDate.val()).getTime() / 1000 + 86400,
            step: 86400,
            values: [new Date(fromDate.val()).getTime() / 1000 + 86400, new Date(toDate.val()).getTime() / 1000 + 86400],
            change: async function (event, ui) {
                if (ui.values[0] > ui.values[1]) {
                    alert("Error! The from date value must be less than the to date value.");
                    $("#doubleSlider-range").slider({values: [0, ui.values[0]]});
                } else {
                    //updates text
                    $("#amount2").val($.format.date(ui.values[0] * 1000, "yyyy-MM-dd") + " to " + $.format.date(ui.values[1] * 1000, "yyyy-MM-dd"));

                    //updates date slider; date range, value, text
                    $('#slider-range').slider("option", "min", $("#doubleSlider-range").slider("values", 0));
                    $('#slider-range').slider("option", "max", $("#doubleSlider-range").slider("values", 1));
                    await $('#slider-range').slider("option", "value", $("#doubleSlider-range").slider("values", 1));
                    $('#amount').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"));

                    //updates date range pickers
                    await flatpickr(".date", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    await flatpickr(".fromdatepicker", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    await flatpickr("#drTo", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    await flatpickr("#drFrom", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        // minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                        minDate: fromDate.val(),
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    // $('#drFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"));
                    // $('#drTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
                    $('.filterFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"));
                    $('.filterTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"));
                }
            }
        });
        //display current date range
        $('#amount2').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd") + " to " + $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"));
    };

    //edit function to prompt date range adjustments
    let edit = function () {
        if ($('#edit').hasClass('edit-mode')) {
            $("#dialogDateRange").dialog("open");
            $('#edit').removeClass('edit-mode');
            $('#edit').css('background-color', 'transparent');
            $('#labelRangeSlider').css('display', 'none');
            $('#labelSlider').css('display', 'inline-block');
            $('#doubleSlider-range').css('display', 'none');
            $('#amount2').css('display', 'none');
            $('#slider-range').css('display', 'block');
            $('#amount').css('display', 'inline-block');
            $('#filter').removeClass('disabled-icon');
        } else {
            $('#edit').addClass('edit-mode');
            $('#edit').css('background-color', '#55d2d5');
            $('#labelRangeSlider').css('display', 'inline-block');
            $('#labelSlider').css('display', 'none');
            $('#doubleSlider-range').css('display', 'block');
            $('#amount2').css('display', 'inline-block');
            $('#slider-range').css('display', 'none');
            $('#amount').css('display', 'none');
            $('#filter').addClass('disabled-icon');
        }
    }

    //overrides user changes in filter option dialog box; sets date range to max range, continents to all
    let fullLoad = async function () {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");

        if (COVIDcheckbox == null) {
            ErrorReturn(" COVID selection menu", "fullLoad" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn(" vaccination selection menu", "fullLoad" , true);
        }

        if (confirm("Are you sure you want to proceed? This may crash your browser ")) {
            //$('.filterFrom').val(dataAll.arrDate[dataAll.arrDate.length - 1 - clientConfig.initLength].Date);
            if (COVIDcheckbox.checked == true) {
                let filterContinents = $('#filterContinents').val().trim().split(' ').join('_');
                let filterCountries  = $('#filterCountries').val().trim().split(' ').join('_');
                let startDate = dataAll.arrDate[0].Date;
                let endDate = dataAll.arrDate[dataAll.arrDate.length - 1].Date;

                document.getElementById("overlay").style.display = "block";
                if (contVal.includes(filterContinents)) {
                    // if (filterContinents == "North_America" || filterContinents == "Europe" || filterContinents == "South_America" || filterContinents == "Asia" || filterContinents == "Africa" || filterContinents == "Oceania") {
                    if (filterCountries == "all_countries" ) {
                        await covidPK.covidPK([startDate, endDate], categoryS,"filterLoad", endDate, filterContinents);
                    } else {
                        await covidPK.covidPK([startDate, endDate], categoryS,"filterLoad", endDate, filterContinents, filterCountries);
                    }
                    console.log(newGlobe.layers);
                } else {
                    if (filterCountries == "all_countries" ) {
                        await covidPK.covidPK([startDate, endDate], categoryS,"load",endDate);
                    } else {
                        await covidPK.covidPK([startDate, endDate], categoryS,"filterLoad",endDate,"none", filterCountries);
                    }
                    console.log(newGlobe.layers);
                }
                //do we need to synchronize layer list here? I removed it from the covidPK already
                $('.filterFrom').val(startDate);
                $('.filterTo').val(endDate);
                flatpickr(".date", {
                    defaultDate: endDate,
                    minDate: startDate,
                    // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    maxDate: endDate,
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });
                $("#dialog").dialog("close");
                document.getElementById("overlay").style.display = "none";
            } else if (vaccCheckbox.checked == true) {
                alert("Vaccination placemarks are already all fully loaded. ");
            }
            $('.filterFrom, .filterTo').css('background-color', 'lightgray');
            $('.filterFrom, .filterTo').prop('disabled', true);
            $('#filterContinents').val('All Continents');
            $('#filterContinents').prop('disabled', true);
        } else {
            $('.filterFrom, .filterTo').css('background-color', 'white');
            $('.filterFrom, .filterTo').prop('disabled', false);
            $('#filterContinents').prop('disabled', false);
        }
    }

    //dialog box for filter options for date slider; contains date range picker, continent selector, and full load option
    let filterOptionDialog = function () {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        COVIDcategory = document.getElementById("COVID-category");

        if (COVIDcheckbox == null) {
            ErrorReturn(" COVID selection menu", "filterOptionDialog" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn(" vaccination selection menu", "filterOptionDialog" , true);
        }

        $("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Apply": async function () {
                    speed = true;

                    //changes dates across all date range pickers
                    // $('#drFrom').val($("#foFrom").val());
                    // $('#drTo').val($("#foTo").val());

                    //changes date slider value range
                    // $('#slider-range').slider("values", 0) === new Date($('#foFrom').val()).getTime() / 1000 + 86400;
                    // $('#slider-range').slider("values", 1) === new Date($('#foTo').val()).getTime() / 1000 + 86400;
                    // $("#amount2").val($('#foFrom').val() + " to " + $('#foTo').val());
                    // flatpickr(".date", {
                    //     defaultDate: $('#foTo').val(),
                    //     minDate: $('#foFrom').val(),
                    //     // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    //     maxDate: $('#foTo').val(),
                    //     inline: false,
                    //     dateFormat: "Y-m-d",
                    //     time_24hr: true
                    // });

                    //creates placemarks based on range selected
                    if (speed) {
                        if (COVIDcheckbox.checked == true) {
                            console.log($('#filterCountries').val());
                            categoryS = COVIDcategory.innerText.trim();
                            let filterContinents = $('#filterContinents').val().trim().split(' ').join('_');
                            let filterCountries  = $('#filterCountries').val().trim().split(' ').join('_');
                            if (contVal.includes(filterContinents)) {
                            // if (filterContinents == "North_America" || filterContinents == "Europe" || filterContinents == "South_America" || filterContinents == "Asia" || filterContinents == "Africa" || filterContinents == "Oceania") {
                                if (filterCountries =="all_countries" ) {
                                    await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"filterLoad", $('#foTo').val(), filterContinents);
                                } else {
                                    await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"filterLoad", $('#foTo').val(), filterContinents, filterCountries);
                                }
                                console.log(newGlobe.layers);
                            } else {
                                if (filterCountries =="all_countries" ) {
                                    await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"load",$('#foTo').val());
                                } else {
                                    await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"filterLoad",$('#foTo').val(),"none", filterCountries);
                                }
                                console.log(newGlobe.layers);
                            }
                            //do we need to synchronize layer list here? I removed it from the covidPK already
                        } else if (vaccCheckbox.checked == true) {
                            alert("Vaccination placemarks are already all fully loaded. ");
                            //await vaccinePK([$('#foFrom').val(), $('#foTo').val()]);
                        }
                    }

                    //changes date slider min and max valuesm current value, and text display
                    // $('#slider-range').slider("option", "min", new Date($('#foFrom').val()).getTime() / 1000 + 86400);
                    // $('#slider-range').slider("option", "max", new Date($('#foTo').val()).getTime() / 1000 + 86400);
                    // await $('#slider-range').slider("option", "value", new Date($('#foTo').val()).getTime() / 1000 + 86400);
                    $('#amount').val($('#foTo').val());

                    //ensures date slider is shown and range slider is hidden; edit mode is closed
                    $('#edit').removeClass('edit-mode');
                    $('#edit').css('background-color', 'transparent');
                    $('#labelRangeSlider').css('display', 'none');
                    $('#labelSlider').css('display', 'inline-block');
                    $('#doubleSlider-range').css('display', 'none');
                    $('#amount2').css('display', 'none');
                    $('#slider-range').css('display', 'block');
                    $('#amount').css('display', 'inline-block');

                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    }

    //dialog box for edit mode for date slider; contains date range picker
    let editDialog = function () {
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");
        COVIDcategory = document.getElementById("COVID-category");

        if (COVIDcheckbox == null) {
            ErrorReturn(" COVID selection menu", "editDialog" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn(" vaccination selection menu", "editDialog" , true);
        }

        $("#dialogDateRange").dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Confirm": async function () {
                    speed = true;
                    //changes dates across all date range pickers
                    $('#foFrom').val($("#drFrom").val());
                    $('#foTo').val($("#drTo").val());

                    //changes date slider value range
                    $('#slider-range').slider("values", 0) === new Date($('#drFrom').val()).getTime() / 1000 + 86400;
                    $('#slider-range').slider("values", 1) === new Date($('#drTo').val()).getTime() / 1000 + 86400;
                    $("#amount2").val($('#drFrom').val() + " to " + $('#drTo').val());

                    //changes date slider min and max values current value, and text display
                    $('#slider-range').slider("option", "min", new Date($('#drFrom').val()).getTime() / 1000 + 86400);
                    $('#slider-range').slider("option", "max", new Date($('#drTo').val()).getTime() / 1000 + 86400);
                    $('#slider-range').slider("option", "value", new Date($('#drTo').val()).getTime() / 1000 + 86400);
                    $('#amount').val($('#drTo').val());
                    let oldDrFrom = $('#drFrom').val();
                    await flatpickr(".date", {
                        defaultDate: $('#drTo').val(),
                        minDate: $('#drFrom').val(),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $('#drTo').val(),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    await flatpickr(".fromdatepicker", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    await flatpickr("#drTo", {defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"),});
                    await flatpickr("#drFrom", {minDate: oldDrFrom});
                    $('#drFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000 + 86400), "yyyy-MM-dd"));
                    $('#drTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000 + 86400), "yyyy-MM-dd"));
                    fromDate.val($("#drFrom").val());
                    toDate.val($("#drTo").val());

                    // //creates placemarks based on range selected
                    // if (speed) {
                    //     console.log("fast edit dialog");
                    //     // covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS, "not init", $('#filterContinents').val());
                    //     if (COVIDcheckbox.checked == true) {
                    //         categoryS = COVIDcategory.innerText;
                    //         let filterContinents = $('#filterContinents').val().trim().split(' ').join('_');
                    //         if (filterContinents == "North_America" || filterContinents == "Europe" || filterContinents == "South_America" || filterContinents == "Asia" || filterContinents == "Africa" || filterContinents == "Oceania") {
                    //             covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()],categoryS, "load", $('#foTo').val(), filterContinents);
                    //         } else {
                    //             covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()],categoryS, "load", $('#foTo').val());
                    //         }
                    //     } else if (vaccCheckbox.checked == true) {
                    //         vaccinePK([$('#foFrom').val(), $('#foTo').val()]);
                    //     }
                    // }

                    $(this).dialog("close");
                },
                Cancel: function () {
                    //edit mode remains active
                    $('#edit').addClass('edit-mode');
                    $('#edit').css('background-color', '#55d2d5');
                    $('#labelRangeSlider').css('display', 'inline-block');
                    $('#labelSlider').css('display', 'none');
                    $('#doubleSlider-range').css('display', 'block');
                    $('#amount2').css('display', 'inline-block');
                    $('#slider-range').css('display', 'none');
                    $('#amount').css('display', 'none');
                    $(this).dialog("close");
                }
            }
        });
    }

    return {
        timelapse,
        clearI,
        updateHIS,
        infectionSlider,
        speedSlider,
        opacitySlider,
        dateSlider,
        rangeSlider,
        edit,
        fullLoad,
        filterOptionDialog,
        editDialog
    }
});