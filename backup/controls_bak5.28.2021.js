define([
    '../scripts/globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    // , './covidPK_bak'
    , './covidPK'
    // , './vaccinePK'
    , './vaccinePK_v3'
    , './graphsData'
    , '../config/clientConfig.js'
    , 'menu'

], function (newGlobe, dataAll, csvD, LayerManager, covidPK, vaccinePK, graphsD, clientConfig) {
    "use strict";

    // alert ("Please do not click on the app until the globe appears.");

    let layerManager = new LayerManager(newGlobe);
    let categoryS = "Confirmed Cases";
    let categoryV = "Total Vaccinations";

    let fromDate = $('#fromdatepicker');

    let toDate = $('#todatepicker');
    let curDate = $("#currentdatepicker");

    // let dataTypes = ['Country', 'Weather Station'];
    // let countryL = []
    let active = "active";
    let activecases = "Active Cases";
    let parentMenu = document.getElementById("accordion");

    // for (let i = 0; i < dataTypes.length; i++) {
    //     for (let j = 0; j < csvD[i].length; j++) {
    //         if (dataTypes[i] === 'Country') {
    //             countryL.push(csvD[i][j].country)
    //         } else if (dataTypes[i] === 'Weather Station') {
    //         } else {
    //             console.log("Read layer type in error");
    //         }
    //     }
    // }

    let menuStructure;
    let cropsL = [
        'Production',
        'Price',
        'Livestock',
        'Emissions',
        'Pesticides',
        'Fertilizer',
        'Yield'
    ];
    let weatherL = [
        'GraphsandWeather',
        'YearlyTemperature',
        'MonthlyTemperature',
        'YearlyPrecipitation',
        'MonthlyPrecipitation'
    ];
    let highlightedItems = [];

    let i = 0;
    let l;

    // let play = false;

    let numC = 0;
    let numD = 0;
    let numR = 0;
    let numA = 0;

    let numDM = 0;
    let numDV = 0;
    let numT = 0;
    let numI = 0;
    let numCV = 0;

    let speed = false;
    let letLong = [
        {cont: 'North America', lat: 40.7306, long: -73.9352},
        {cont: 'South America', lat: -14.235, long: -51.9253},
        {cont: 'Asia', lat: 30.9756, long: 112.2707},
        {cont: 'Europe', lat: 51, long: 9},
        {cont: 'Africa', lat: 9.082, long: 8.6753},
        {cont: 'Oceania', lat: -37.8136, long: 144.9631},
        {cont: 'All Continents', lat: 30.9756, long: 112.2707},
        {cont: 'Please Select Continent', lat: 30.9756, long: 112.2707}
    ];

    if (clientConfig === undefined) {
        if(confirm("Error loading layers configuration. Would you like to refresh the page?")) {
            location.reload();
            return false;
        }
        console.error("Error loading layers configurations. (controls.js)");
    }
    let d1 = dataAll.arrDate.length - 1;
    let PkStartIndex = d1 - clientConfig.initLength;
    // let PkEndIndex  = d1;
    let PkEndIndex = d1;
    // let PkStartDate = dataAll.arrDate[d1 - clientConfig.initLength];
    let PkStartDate = dataAll.arrDate[PkStartIndex];
    // let PkMidDate = [dataAll.arrDate[PkStartIndex+ clientConfig.initLength/2],0];
    let PkMidIndex = Math.floor((PkStartIndex + PkEndIndex) / 2);
    let PkMidDate = dataAll.arrDate[PkMidIndex];
    // let PkMidDate = dataAll.arrDate[Math.round(((PkStartIndex) + (PkEndIndex))/2)];
    let PkEndDate = dataAll.arrDate[PkEndIndex];
    // let PkEndDate = dataAll.arrDate[d1];
    let oldPkStart;
    let oldPkEnd;
    let oldPkStartDate;
    let oldPkEndDate;

    if (PkStartDate == null || PkEndDate == null) {
        if(confirm("Error loading date configurations. Would you like to refresh the page?")) {
            location.reload();
            return false;
        }
        console.error("Error loading date configurations. (controls.js)");
    }

    while (PkStartDate.Date.includes('NaN')) {
        PkStartIndex += 1
        PkStartDate = dataAll.arrDate[PkStartIndex];
        if (PkStartIndex >= PkEndIndex) {
            if(confirm("Error loading date configurations. Would you like to refresh the page?")) {
                location.reload();
                return false;
            }
            console.error("Error loading date configurations. (controls.js)");
        }
    }
    while (PkEndDate.Date.includes('NaN')) {
        PkEndIndex -= 1
        PkEndDate = dataAll.arrDate[PkEndIndex];
        if (PkEndIndex <= 0) {
            if(confirm("Error loading date configurations. Would you like to refresh the page?")) {
                location.reload();
                return false;
            }
            console.error("Error loading date configurations. (controls.js)");

        }
    }

    if (PkMidIndex < PkStartIndex || PkMidIndex > PkEndIndex) {
        PkMidIndex = PkStartIndex;
        PkMidDate = dataAll.arrDate[PkMidIndex];
    }

    // console.log(newGlobe.layers)
    //under initial load for case numbers
    // let initCaseNum = function () {
    //     // newGlobe.layers.forEach(function (elem, index) {
    //     //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.enabled) {
    //     //         elem.renderables.forEach(function (d) {
    //     //             if (d instanceof WorldWind.Placemark) {
    //     //                 if (d.userProperties.Date == curDate.val()) {
    //     //                     if (d.userProperties.Type == "Confirmed Cases") {
    //     //                         numC += d.userProperties.Number;
    //     //                     } else if (d.userProperties.Type == "Deaths") {
    //     //                         numD += d.userProperties.Number;
    //     //                     } else if (d.userProperties.Type == "Recoveries") {
    //     //                         numR += d.userProperties.Number;
    //     //                     } else if (d.userProperties.Type == "Active Cases") {
    //     //                         numA += d.userProperties.Number;
    //     //                     }
    //     //                 }
    //     //             }
    //     //         });
    //     //     }
    //     //     if (index == newGlobe.layers.length - 1) {
    //     //         newGlobe.redraw()
    //     //     }
    //     // });
    //     updateCOVID("Confirmed Cases", curDate.val())
    //
    //     // $('#conConfirmed').text(numC);
    //     // $('#conDeaths').text(numD);
    //     // $('#conRecoveries').text(numR);
    //     // $('#conActive').text(numA);
    // }

    //overlays sub dropdown menus over other items
    let subDropdown = function () {
        $(".dropdown").on("show.bs.dropdown", function () {
            let $btnDropDown = $(this).find(".dropdown-toggle");
            let $listHolder = $(this).find(".dropdown-menu");
            let subMenu = $(this).find(".dropdown-submenu");
            let subMenu2 = subMenu.find(".dropdown-menu");
            //reset position property for DD container
            $(this).css("position", "relative");
            $listHolder.css({
                // "top": ($btnDropDown.offset().top + $btnDropDown.outerHeight(true)) + "px",
                // "left": $btnDropDown.offset().left + "px"
            });
            subMenu2.css({
                "left": $listHolder.outerWidth(true) + "px"
            });

            $listHolder.data("open", true);
        });
        //add BT DD hide event
        $(".dropdown").on("hidden.bs.dropdown", function () {
            let $listHolder = $(this).find(".dropdown-menu");
            $listHolder.data("open", false);
        });

        $(".agrotoggle").click(function () {
            let visibility = $("#agrosphere-dropdowndiv").css("visibility");
            let display = $("#agrosphere-dropdowndiv").css("display");
            if (visibility === 'hidden' && display === "none") {
                $("#agrosphere-dropdowndiv").css("visibility", "visible");
                $("#agrosphere-dropdowndiv").css("display", "block");
            } else {
                $("#agrosphere-dropdowndiv").css("visibility", "hidden");
                $("#agrosphere-dropdowndiv").css("display", "none");
            }
        });

        $("#Crops-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#CropsDropdown").css("visibility", "visible");
                $("#CropsDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#CropsDropdown").css("visibility", "hidden");
                $("#CropsDropdown").css("display", "none");
            }
        });

        $("#Countries-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#CountriesDropdown").css("visibility", "visible");
                $("#CountriesDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#CountriesDropdown").css("visibility", "hidden");
                $("#CountriesDropdown").css("display", "none");
            }
        });

        $("#WeatherStations-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#WeatherStationsDropdown").css("visibility", "visible");
                $("#WeatherStationsDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#WeatherStationsDropdown").css("visibility", "hidden");
                $("#WeatherStationsDropdown").css("display", "none");
            }
        });
    }

    // fromDate.val(dataAll.arrDate[0].Date);
    let updateFrom = function (fromD) {
        fromDate.val(fromD);
        console.log(fromD);
        // console.log(fromDate.val(fromD))
    }
    let updateTo = function (toD) {
        toDate.val(toD);
        // console.log(toD)
    }
    //enables placemarks for current date; used when current date is changed based on date picker or date slider
    let updateCurr = async function (currentD, skip = "none") {
        curDate.val(currentD);

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(updateCurr)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (updateCurr)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(updateCurr)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (updateCurr)");
        }

        // console.log(currentD)
        // console.log(curDate.val(currentD))
        //enables placemark based on the placemark properties current date and type; adds number of cases per category
        // await newGlobe.layers.forEach(function (elem) {
        //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.enabled) {
        //         // console.log("layers on")
        //         elem.renderables.forEach(function (d) {
        //             if (d instanceof WorldWind.Placemark) {
        //                 // console.log("Placemark Date: "+ d.userProperties.Date);
        //                 // console.log("Current Date: " + currentD);
        //                 if (d.userProperties.Date == currentD) {
        //                     // console.log("date equals current")
        //                     console.log(currentD, categoryS);
        //                     if (d.userProperties.Type == categoryS) {
        //                         // console.log("selected")
        //                         // console.log(d.userProperties.dName);
        //                         d.enabled = true;
        //                         // console.log(d);
        //                     } else {
        //                         d.enabled = false;
        //                     }
        //                     if (d.userProperties.Type == "Confirmed Cases") {
        //                         numC += d.userProperties.Number;
        //                         // console.log(d.userProperties.Number)
        //                     } else if (d.userProperties.Type == "Deaths") {
        //                         numD += d.userProperties.Number;
        //                     } else if (d.userProperties.Type == "Recoveries") {
        //                         numR += d.userProperties.Number;
        //                     } else if (d.userProperties.Type == "Active Cases") {
        //                         numA += d.userProperties.Number;
        //                     }
        //                 } else {
        //                     d.enabled = false;
        //                 }
        //             }
        //         })
        //     }
        //     newGlobe.redraw()
        // });
        if (skip != "timelapse") {
            if (document.getElementById("COVID-19-checkbox").checked === true) {
                updateCOVID(categoryS, currentD);
            } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                updateVaccine(categoryV, currentD);
            } else {
                updateCOVID(categoryS, currentD);
                updateVaccine(categoryV, currentD);
            }
        }

        //updates text under second right tab containing total case numbers up to current date shown
        // $('#conConfirmed').text(numC);
        // $('#conDeaths').text(numD);
        // $('#conRecoveries').text(numR);
        // $('#conActive').text(numA);
    };

    // //under first left tab; used to switch display between
    // let onDiseaseClick = function (event) {
    //
    //     //grab the selection value
    //     let projectionName = event.target.innerText || event.target.innerHTML;
    //     //refresh the option display
    //     $("#diseaseDropdown").find("button").html(projectionName + ' <span class="caret"></span>');
    //
    //     //insert foodSecurity menu corresponding to the selection
    //     if (projectionName === "COVID-19") {
    //         covid19();
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: ["COVID-19", "Influenza A", "Influenza B"],
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Influenza A') {
    //         influenza();
    //         $("#diseases").css('visibility', 'visible');
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: [
    //                 "H1N1", "H2N2", "H3N2", "H5N1", "H7N7",
    //                 "H1N2", "H9N2", "H7N2", "H7N3", "H10N7",
    //                 "H7N9","H6N1", "Not Determined"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Influenza B') {
    //         $("#diseases").css('visibility', 'visible');
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: [
    //                 "Yamagata",
    //                 "Victoria",
    //                 "Not Determined"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     }
    // };

    // //under first left tab; used to switch display between
    // let onAgrosphereClick = function (event) {
    //
    //     //grab the selection value
    //     let projectionName = event.target.innerText || event.target.innerHTML;
    //     //refresh the option display
    //     $("#agrosphereDropdown").find("button").html(projectionName + ' <span class="caret"></span>');
    //
    //     //insert foodSecurity menu corresponding to the selection
    //     if (projectionName === "AgroSphere") {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: ["Country", "Crops", "Weather"],
    //             Level2: [countryL, cropsL, weatherL],
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'ECMWF Forecasts') {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: ["Temperature", "Precipitation", "Wind"]
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Sentinel Satellite Data') {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: [
    //                 "Agriculture",
    //                 "False Color (Urban)",
    //                 "False Color (Vegetation)",
    //                 "Geology",
    //                 "Moisture Index",
    //                 "Natural Color (True Color)",
    //                 "NDVI"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     }
    // };

    //under first left tab; activates COVID-19 display when selected for Disease Projection
    let covid19 = function () {
        // if(document.getElementById('diseases').css.visiblity === 'visible') {
        //     $("#diseases").css('visibility', 'hidden');
        // } else {
        //     $("#diseases").css('visibility', 'visible');
        // }
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            // console.log(layer)
            let layerButton = $('#' + layer.displayName + '');
            if (layer.layerType === "H_PKLayer") {
                // $("#diseases").css('visibility', 'hidden');
                // $("#diseases").css('display', 'none');
                layer.enabled = !layer.enabled;
                // layer.hide = !layer.hide;
                if (!layer.enabled) {
                    layerButton.addClass(active);
                    layerButton.css("color", "white");
                } else {
                    layerButton.removeClass(active);
                    layerButton.css("color", "black");
                }
            }
            if (i === newGlobe.layers.length - 1) {
                layerManager.synchronizeLayerList();
            }
        }
    };

    //under first left tab; activates Influenza A display when selected for Disease Projection
    let influenza = function () {
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            // if (layer.layerType === "H_PKLayer" || layer.layerType === "INA_PKLayer") {
            if (layer.layerType === "INA_PKLayer") {
                layer.enabled = !layer.enabled;
                // layer.hide = !layer.hide;
                if (!layer.enabled) {
                    layerButton.removeClass(active);
                    layerButton.css("color", "black");
                } else {
                    layer.enabled = false;
                    // layer.hide = true;
                    layerButton.removeClass(active);
                    layerButton.css("color", "black");
                }

                layerButton.remove();
            }

            if (i === newGlobe.layers.length - 1) {
                layerManager.synchronizeLayerList();
            }
        }
    };

    function createFirstLayer(FirstL) {

        let firstL = FirstL.replace(/\s+/g, '');

        let panelDefault1 = document.createElement("div");
        panelDefault1.className = "Menu panel panel-info " + firstL;

        let panelHeading1 = document.createElement("div");
        panelHeading1.className = "panel-heading";

        let panelTitle1 = document.createElement("h4");
        panelTitle1.className = "panel-title";

        let collapsed1 = document.createElement("a");
        // collapsed1.className = "collapsed";
        collapsed1.setAttribute("data-toggle", "collapse");
        collapsed1.setAttribute("data-parent", "#accordion");
        // collapsed1.setAttribute("aria-expanded", "false");
        collapsed1.href = "#" + firstL;
        collapsed1.id = firstL + '-a';
        collapsed1.className = "collapsed";

        let firstLayerName = document.createTextNode(FirstL + "  ");
        firstLayerName.className = "menuwords";

        let collapseOne = document.createElement("div");
        collapseOne.className = "panel-collapse collapse";
        collapseOne.id = firstL;

        let panelBody1 = document.createElement("div");
        panelBody1.className = "panel-body";

        let panelGroup1 = document.createElement("div");
        panelGroup1.className = "panel-group " + firstL;
        panelGroup1.id = "nested-" + firstL;

        collapsed1.appendChild(firstLayerName);
        panelTitle1.appendChild(collapsed1);
        panelHeading1.appendChild(panelTitle1);
        panelDefault1.appendChild(panelHeading1);
        panelDefault1.appendChild(collapseOne);
        parentMenu.appendChild(panelDefault1);

        panelBody1.appendChild(panelGroup1);
        collapseOne.appendChild(panelBody1);

        // firstLayers.push(firstL);
    }

    function createSecondLayer(FirstL, SecondL) {

        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');

        let panelDefault2 = document.createElement("div");
        panelDefault2.id = secondL;
        panelDefault2.className = "Menu panel panel-info " + secondL + " " + firstL + "-" + secondL;

        let panelHeading2 = document.createElement("div");
        panelHeading2.className = "panel-heading " + firstL + "-" + secondL;

        let panelTitle2 = document.createElement("h4");
        panelTitle2.className = "panel-title " + firstL + "-" + secondL;

        let collapsed2 = document.createElement("a");
        // collapsed2.className = "collapsed";
        collapsed2.setAttribute("data-toggle", "collapse");
        collapsed2.setAttribute("data-parent", "#nested");
        collapsed2.href = "#" + firstL + "-" + secondL;
        collapsed2.id = firstL + "-" + secondL + '-a';
        collapsed2.className = "collapsed";

        let secondLayerName = document.createTextNode(SecondL + "  ");
        secondLayerName.className = "menuwords";

        let nested1c1 = document.createElement("div");
        nested1c1.id = firstL + "-" + secondL;
        nested1c1.className = "panel-collapse collapse";

        let panelBody3 = document.createElement("div");
        panelBody3.className = "panel-body " + secondL;
        panelBody3.id = firstL + "--" + secondL;

        let panelGroup2 = document.createElement("div");
        panelGroup2.className = "panel-group " + secondL;
        panelGroup2.id = "nested-" + secondL;

        collapsed2.appendChild(secondLayerName);
        panelTitle2.appendChild(collapsed2);
        panelHeading2.appendChild(panelTitle2);
        panelDefault2.appendChild(panelHeading2);
        panelDefault2.appendChild(nested1c1);

        nested1c1.appendChild(panelBody3);

        // secondLayers.push(panelBody3.id);

        // document.getElementsByClassName("panel-group " + firstL)[0].appendChild(panelDefault2);
        document.getElementById("nested-" + firstL).appendChild(panelDefault2);
    }

    function createThirdLayers(FirstL, SecondL, ThirdL) {

        //Third Layer for Agrosphere and Sentinel Menu
        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');
        thirdL = thirdL.replace('()', '');
        let allToggle = thirdL + '-alltoggle';

        let panelHeading3 = document.createElement("div");
        panelHeading3.className = "panel-heading " + firstL + "-" + secondL + "-" + thirdL;

        let panelTitle3 = document.createElement("h5");
        panelTitle3.className = "panel-title " + firstL + "-" + secondL + "-" + thirdL;

        let collapsed3 = document.createElement("a");

        let panelDefault3 = document.createElement("div");
        panelDefault3.id = thirdL;

        if (thirdL !== 'Country' && thirdL !== 'Weather' && thirdL !== 'Agriculture' && ThirdL !== 'False Color (Urban)' && ThirdL !== 'False Color (Vegetation)' && thirdL !== 'Geology' && ThirdL !== 'Natural Color (True Color)') {
            // if (thirdL !== 'Country') {
            collapsed3.className = "collapsed";
            collapsed3.href = "#" + firstL + "-" + secondL + "-" + thirdL;
            collapsed3.setAttribute("data-toggle", "collapse");
            collapsed3.setAttribute("data-parent", "#nested");
            panelDefault3.className = "Menu panel panel-info " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        } else if (SecondL === "Sentinel Satellite Data") {
            // } else if (thirdL == 'Agriculture' && thirdL == 'False Color (Urban)' && thirdL == 'False Color (Vegetation)' && thirdL == 'Geology' && thirdL == 'Natural Color (True Color)') {
            collapsed3.className = "collapsed disabled-link";
            panelDefault3.className = "Menu panel disabled-menu " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        } else {
            collapsed3.className = "collapsed";
            panelDefault3.className = "Menu panel panel-info " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        }
        collapsed3.id = firstL + "-" + secondL + "-" + thirdL + '-a';

        let thirdLayerName = document.createTextNode(ThirdL + "  ");
        thirdLayerName.className = "menuwords";

        let checkboxDiv = document.createElement("div");
        // checkboxDiv.className = "Menu "

        let checkboxLabel = document.createElement("label");
        checkboxLabel.className = "switch right";

        let checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.className = "input";
        checkboxInput.id = allToggle;

        let checkboxSpan = document.createElement("span");
        checkboxSpan.className = "slider round";

        checkboxInput.value = allToggle;
        checkboxInput.className = "input alltoggle";

        let nested1c1 = document.createElement("div");
        nested1c1.id = firstL + "-" + secondL + "-" + thirdL;
        nested1c1.className = "panel-collapse collapse";

        let panelBody4 = document.createElement("div");
        panelBody4.className = "panel-body " + thirdL;
        panelBody4.id = firstL + "--" + secondL + "--" + thirdL;

        collapsed3.appendChild(thirdLayerName);
        panelTitle3.appendChild(collapsed3);
        panelHeading3.appendChild(panelTitle3);
        panelHeading3.appendChild(checkboxDiv);
        panelDefault3.appendChild(panelHeading3);
        if (thirdL !== 'Country' && thirdL != 'Agriculture' && thirdL != 'False Color (Urban)' && thirdL != 'False Color (Vegetation)' && thirdL != 'Geology' && thirdL != 'Natural Color (True Color)') {
            // if (thirdL !== 'Country') {
            panelDefault3.appendChild(nested1c1);
            nested1c1.appendChild(panelBody4);
        } else if (SecondL === "Sentinel Satellite Data") {

        }
        //// checkboxA.appendChild(checkboxAt);
        //// checkboxH4.appendChild(checkboxA);
        // checkboxLabel.appendChild(checkboxInput);
        // checkboxLabel.appendChild(checkboxSpan);
        /////checkboxH4.appendChild(checkboxLabel);
        /////checkboxDiv.appendChild(checkboxH4);
        //// document.getElementById(firstL + "--" + secondL + "--" + thirdL).appendChild(checkboxDiv);

        // secondLayers.push(panelBody3.id);

        if (SecondL !== "Sentinel Satellite Data") {
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxDiv.appendChild(checkboxLabel);
        }

        document.getElementById(firstL + "--" + secondL).appendChild(panelDefault3);

        // document.getElementById(thirdL).style.width = '50%';

        // document.getElementsByClassName("panel-group " + firstL)[0].appendChild(panelDefault2);

    }

    // function createThirdLayerold(element) {
    //
    //     let thirdReplace = element.ThirdLayer.replace(/\s+/g, '');
    //     let countryNameStr = element.CountryName.replace(/\s+/g, '');
    //     let stateNameStr = element.StateName.replace(/\s+/g, '');
    //     let cityNameStr = element.CityName.replace(/\s+/g, '');
    //
    //     if (thirdReplace !== element.ThirdLayer) {
    //         console.log(thirdReplace);
    //         console.log(element.ThirdLayer);
    //     }
    //
    //     let checkboxDiv = document.createElement("div");
    //     checkboxDiv.className = "Menu " + thirdReplace + " " + countryNameStr + " " + stateNameStr + " " + cityNameStr;
    //     let checkboxH5 = document.createElement("h5");
    //
    //     let checkboxA = document.createElement("a");
    //     let checkAboxAt = document.createTextNode(element.ThirdLayer + "   ");
    //
    //     let checkboxLabel = document.createElement("label");
    //     checkboxLabel.className = "switch right";
    //
    //     let checkboxInput = document.createElement("input");
    //     checkboxInput.type = "checkbox";
    //     checkboxInput.className = element.LayerType + " input";
    //     checkboxInput.setAttribute("value", element.LayerName);
    //
    //     let checkboxSpan = document.createElement("span");
    //     checkboxSpan.className = "slider round";
    //
    //     checkboxA.appendChild(checkAboxAt);
    //     checkboxH5.appendChild(checkboxA);
    //     checkboxLabel.appendChild(checkboxInput);
    //     checkboxLabel.appendChild(checkboxSpan);
    //     checkboxH5.appendChild(checkboxLabel);
    //     checkboxDiv.appendChild(checkboxH5);
    //
    //     // document.getElementsByClassName("panel-body " + element.SecondLayer)[0].appendChild(checkboxDiv);
    //     document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
    // }

    function createThirdLayer(FirstL, SecondL, ThirdL) {
        //Third layer for non-Agrosphere menus
        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');
        thirdL = thirdL.replace('()', '');

        let checkboxDiv = document.createElement("div");
        checkboxDiv.className = "Menu "
        let checkboxH4 = document.createElement("h5");
        let checkboxA = document.createElement("a");
        let idname;

        let checkboxLabel = document.createElement("label");
        checkboxLabel.className = "switch right";

        let checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.className = "input";

        if (ThirdL === "COVID-19") {checkboxInput.defaultChecked = true;}

        let checkboxSpan = document.createElement("span");
        checkboxSpan.className = "slider round";

        // if (FourthL === 'none') {

        let checkboxAt = document.createTextNode(thirdL);
        checkboxA.className = "menuWords";
        idname = thirdL
        checkboxA.id = idname + '-atag';
        checkboxInput.value = ThirdL;
        checkboxInput.id = idname + '-checkbox';


        checkboxA.appendChild(checkboxAt);
        checkboxH4.appendChild(checkboxA);
        checkboxLabel.appendChild(checkboxInput);
        checkboxLabel.appendChild(checkboxSpan);
        checkboxH4.appendChild(checkboxLabel);
        checkboxDiv.appendChild(checkboxH4);

        // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
        // if (firstL === "No Level1") {
        document.getElementById(firstL + "--" + secondL).appendChild(checkboxDiv);
        // } else {
        //     document.getElementById("nested-" + firstL).appendChild(checkboxDiv);
        // }

        // } else {
        //
        //     let checkboxAt = document.createTextNode(fourthL + "   ");
        //     checkboxA.className = "menuWords";
        //     idname = fourthL;
        //     checkboxA.id = idname + '-atag';
        //
        //     checkboxInput.value = FourthL;
        //
        //     if (ThirdL === "Country") {
        //         checkboxInput.defaultChecked = true;
        //         checkboxInput.className = "input countries-check";
        //         checkboxA.className = "menuWords countries-atag";
        //     }
        //
        //     checkboxA.appendChild(checkboxAt);
        //     checkboxH4.appendChild(checkboxA);
        //     checkboxLabel.appendChild(checkboxInput);
        //     checkboxLabel.appendChild(checkboxSpan);
        //     checkboxH4.appendChild(checkboxLabel);
        //     checkboxDiv.appendChild(checkboxH4);
        //
        //     // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
        //     // if (firstL === "No Level1") {
        //     //     parentMenu.appendChild(checkboxDiv);
        //     // } else {
        //         document.getElementById(firstL + "--" + secondL).appendChild(checkboxDiv);
        //     // }
        // }

    }

    function createFourthLayer(FirstL, SecondL, ThirdL, FourthL = 'none') {
        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');
        thirdL = thirdL.replace('()', '');
        let fourthL = FourthL.replace(/\s+/g, '');

        if (fourthL !== 'none' && thirdL !== 'Country' && thirdL !== 'Agriculture' && thirdL !== 'False Color (Urban)' && thirdL !== 'False Color (Vegetation)' && thirdL !== 'Geology' && thirdL !== 'Natural Color (True Color)') {

            let checkboxDiv = document.createElement("div");
            checkboxDiv.className = "Menu "
            let checkboxH4 = document.createElement("h5");
            let checkboxA = document.createElement("a");
            let idname = fourthL;

            let checkboxLabel = document.createElement("label");
            checkboxLabel.className = "switch right";

            let checkboxInput = document.createElement("input");
            checkboxInput.type = "checkbox";
            checkboxInput.className = "input" + " input-" + ThirdL;
            checkboxInput.id = idname + '-checkbox';

            let checkboxSpan = document.createElement("span");
            checkboxSpan.className = "slider round";

            let checkboxAt = document.createTextNode(FourthL + "");
            if (SecondL === "Sentinel Satellite Data") {
                checkboxA.className = "menuWords" + " WmsLayer";
            } else {
                checkboxA.className = "menuWords";
            }
            idname = fourthL;
            checkboxA.id = idname + '-atag';
            checkboxA.value = fourthL;
            checkboxInput.value = FourthL;

            // if (ThirdL === "Country") {
            //     checkboxInput.defaultChecked = true;
            //     checkboxInput.className = "input countries-check";
            //     checkboxA.className = "menuWords countries-atag";
            // }

            checkboxA.appendChild(checkboxAt);
            checkboxH4.appendChild(checkboxA);
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxH4.appendChild(checkboxLabel);
            checkboxDiv.appendChild(checkboxH4);

            // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
            // if (firstL === "No Level1") {
            //     parentMenu.appendChild(checkboxDiv);
            // } else {
            document.getElementById(firstL + "--" + secondL + "--" + thirdL).appendChild(checkboxDiv);
            // }

        } else {
            alert('Error!');
        }

    }

    // let accordionMenu = function (menuObj) {
    //     let parentMenu = document.getElementById(menuObj.accordianID.replace('#', ''));
    //
    //     //clear previous submenu
    //     $(menuObj.accordianID).empty();
    //
    //     if (!menuObj.Level2) {
    //         //create level one menu
    //         menuObj.Level1.forEach(function (ele) {
    //             menuL2("No Level1", ele)
    //         });
    //     } else {
    //         //create level one menu
    //         menuObj.Level1.forEach(async function (e1, i) {
    //             await menuL1(menuObj.accordianID, e1);
    //             menuObj.Level2[i].forEach(function (e2){
    //                 menuL2(e1, e2);
    //             })
    //         });
    //     }
    //
    //     function menuL1(id, firstL) {
    //         let panelDefault1 = document.createElement("div");
    //         panelDefault1.className = "Menu panel panel-info " + firstL;
    //
    //         let panelHeading1 = document.createElement("div");
    //         panelHeading1.className = "panel-heading";
    //
    //         let panelTitle1 = document.createElement("h5");
    //         panelTitle1.className = "panel-title";
    //
    //         let collapsed1 = document.createElement("a");
    //         collapsed1.className = "collapsed";
    //         collapsed1.setAttribute("data-toggle", "collapse");
    //         collapsed1.setAttribute("data-parent", id);
    //         collapsed1.href = "#" + firstL;
    //
    //         let firstLayerName = document.createTextNode(firstL + "  ");
    //         firstLayerName.className = "menuwords";
    //         let idname = firstL.replace(/\s+/g, '');
    //         firstLayerName.id = idname;
    //
    //         let collapseOne = document.createElement("div");
    //         collapseOne.className = "panel-collapse collapse";
    //         collapseOne.id = firstL;
    //
    //         let panelBody1 = document.createElement("div");
    //         panelBody1.className = "panel-body";
    //
    //         let panelGroup1 = document.createElement("div");
    //         panelGroup1.className = "panel-group " + firstL;
    //         panelGroup1.id = "nested-" + firstL;
    //
    //         collapsed1.appendChild(firstLayerName);
    //         panelTitle1.appendChild(collapsed1);
    //         panelHeading1.appendChild(panelTitle1);
    //         panelDefault1.appendChild(panelHeading1);
    //
    //         panelBody1.appendChild(panelGroup1);
    //         collapseOne.appendChild(panelBody1);
    //         panelDefault1.appendChild(collapseOne);
    //
    //         parentMenu.appendChild(panelDefault1);
    //     }
    //
    //     function menuL2(firstL, secondL) {
    //         let checkboxDiv = document.createElement("div");
    //         checkboxDiv.className = "Menu "
    //
    //         let checkboxH4 = document.createElement("h5");
    //         let checkboxA = document.createElement("a");
    //         let checkboxAt = document.createTextNode(secondL + "   ");
    //         checkboxA.className = "menuWords";
    //         let idname = secondL.replace(/\s+/g, '');
    //         checkboxA.id = idname + '-atag';
    //
    //         let checkboxLabel = document.createElement("label");
    //         checkboxLabel.className = "switch right";
    //
    //         let checkboxInput = document.createElement("input");
    //         checkboxInput.type = "checkbox";
    //         checkboxInput.className = "input";
    //         checkboxInput.value = secondL;
    //
    //         if (firstL === "Country") {
    //             checkboxInput.defaultChecked = true;
    //             checkboxInput.className = "input countries-check";
    //             checkboxA.className = "menuWords countries-atag";
    //         }
    //
    //         let checkboxSpan = document.createElement("span");
    //         checkboxSpan.className = "slider round";
    //
    //         checkboxA.appendChild(checkboxAt);
    //         checkboxH4.appendChild(checkboxA);
    //         checkboxLabel.appendChild(checkboxInput);
    //         checkboxLabel.appendChild(checkboxSpan);
    //         checkboxH4.appendChild(checkboxLabel);
    //         checkboxDiv.appendChild(checkboxH4);
    //
    //         // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
    //         if (firstL === "No Level1") {
    //             parentMenu.appendChild(checkboxDiv);
    //         } else {
    //             document.getElementById("nested-" + firstL).appendChild(checkboxDiv);
    //         }
    //     }
    // };

    //under second left tab, second dropdown menu; used to display layers filtered by cases, deaths, and recoveries
    let onCategory = async function (event, cat = "none") {
        if (cat === "none") {
            //grab the selection value
            categoryS = event.target.innerText || event.target.innerHTML;
            // console.log(categoryS);
        } else {
            categoryS = cat;
            // console.log(categoryS)
        }

        //refresh the option display
        $("#categoryList").find("button").html(categoryS + ' <span class="caret"></span>');

        //reset the button background color according to selection
        if (categoryS === "Confirmed Cases") {
            $("#categoryList").find("button").css("background-color", "red");
            $("#titleCategory").text("Infections Filter (Lowest - Highest)");

        } else if (categoryS === "Deaths") {
            $("#categoryList").find("button").css("background-color", "black");
            $("#titleCategory").text("Deaths Filter (Lowest - Highest)");
        } else if (categoryS === "Recoveries") {
            $("#categoryList").find("button").css("background-color", "#7cfc00");
            $("#titleCategory").text("Recoveries Filter (Lowest - Highest)");
        } else if (categoryS === activecases) {
            $("#categoryList").find("button").css("background-color", "#F9910A");
            $("#titleCategory").text("Active Cases Filter (Lowest - Highest)");
        }

        //turn off all the placemarks, and then turn on selected placemarks
        //locate placemarks by accessing renderables member in placemark layers
        // await newGlobe.layers.forEach(function (elem, index) {
        //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType === "H_PKLayer" && elem.enabled) {
        //         elem.renderables.forEach(function (d) {
        //             if (d instanceof WorldWind.Placemark) {
        //                 if (d.userProperties.Type === categoryS) {
        //                     d.enabled = true;
        //                     // console.log(d)
        //                 } else {
        //                     d.enabled = false;
        //                 }
        //             }
        //         });
        //     }
        //     if (index === newGlobe.layers.length - 1) {
        //         newGlobe.redraw();
        //     }
        // });
        updateCOVID(categoryS)
    };

    let onCategoryV = async function (event, cat = "none") {
        if (cat === "none") {
            //grab the selection value
            categoryV = event.target.innerText || event.target.innerHTML;
            // console.log(categoryS);
        } else {
            categoryV = cat;
            // console.log(categoryS)
        }

        //refresh the option display
        $("#categoryListVaccinations").find("button").html(categoryV + ' <span class="caret"></span>');

        //reset the button background color according to selection
        if (categoryV === "Total Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#4dffff");
            // $("#titleCategory").text("Infections Filter (Lowest - Highest)");
        } else if (categoryV === "Incomplete Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#ff8100");
            // $("#titleCategory").text("Deaths Filter (Lowest - Highest)");
        } else if (categoryV === "Completed Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#8C8189");
            // $("#titleCategory").text("Recoveries Filter (Lowest - Highest)");
        } else if (categoryV === "Daily Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#00ff00");
            // $("#titleCategory").text("Active Cases Filter (Lowest - Highest)");
        } else if (categoryV === "Daily Vaccinations/million") {
            $("#categoryListVaccinations").find("button").css("background-color", "#801C8C")
        }


        //turn off all the placemarks, and then turn on selected placemarks
        //locate placemarks by accessing renderables member in placemark layers
        // await newGlobe.layers.forEach(function (elem, index) {
        //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType === "H_PKLayer") {
        //         elem.renderables.forEach(function (d) {
        //             if (d instanceof WorldWind.Placemark) {
        //                 if (d.userProperties.Type === categoryV) {
        //                     d.enabled = true;
        //                     // console.log(d)
        //                 } else {
        //                     d.enabled = false;
        //                 }
        //             }
        //         });
        //     }
        //     if (index === newGlobe.layers.length - 1) {
        //         newGlobe.redraw();
        //     }
        // });
        updateVaccine(categoryV, curDate.val());
    }
    //under second left tab, third dropdown menu; used to display all countries/layers in that continent
    let onContinent = async function (event,contin="none") {
        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page? (onContinent)")) {
                location.reload();
                return false;
            }
            console.error("Error COVID vaccination selection menu. (onContinent)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(onContinent)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (onContinent)");
        }
        let continentS;
        if (event == "none" && contin !== "none") {
             continentS = contin;
        } else {
            //grab the continent value when selected by user.
             continentS = event.target.innerText || event.target.innerHTML;
            // console.warn('hi')
            // console.error('oh no')
            // let findCountryIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Country_PK');
            // let findWeatherIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Weather_Station_PK');
            // let country_status = newGlobe.layers[findCountryIndex].enabled
            // let weather_status = newGlobe.layers[findWeatherIndex].enabled
            // let continentS = event.target.innerText || event.target.innerHTML;
            // let findCountryIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Country_PK');
            // let country_status = newGlobe.layers[findCountryIndex].enabled;
            // let findWeatherIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Weather_Station_PK');
            // let weather_status = newGlobe.layers[findWeatherIndex].enabled;
        }
        //remove underscore
        let continentNOspace = continentS.split(' ').join('_');
        //refresh the option display
        $("#continentList").find("button").html(continentS + ' <span class="caret"></span>');

        // let letLong = [
        //     {cont: 'North America', lat: 40.7306, long: -73.9352},
        //     {cont: 'South America', lat: -14.235, long: -51.9253},
        //     {cont: 'Asia', lat: 30.9756, long: 112.2707},
        //     {cont: 'Europe', lat: 51, long: 9},
        //     {cont: 'Africa', lat: 9.082, long: 8.6753},
        //     {cont: 'Oceania', lat: -37.8136, long: 144.9631},
        //     {cont: 'All Continents', lat: 30.9756, long: 112.2707}
        // ];
        //turn off all the placemark layers, and then turn on the layers with continent name selected.
        if (document.getElementById("COVID-19-checkbox").checked === true) {
            if (continentS == 'All Continents' || continentS == "Please Select Continent") {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == 'H_PKLayer') {
                        //elem.hide = false;
                        elem.enabled = true;
                    }
                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        letLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        })
                        layerManager.synchronizeLayerList();
                    }
                })
            } else {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                        let cont = String(elem.continent).trim();
                        let contNOspace = cont.split(' ').join('_');
                        if (contNOspace === continentNOspace || cont === continentS) {
                            //elem.hide = false;
                            elem.enabled = true;
                        } else {
                            //elem.hide = true;
                            elem.enabled = false;
                        }
                    }

                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        letLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        })
                        layerManager.synchronizeLayerList();
                    }
                })
            }

            // await newGlobe.layers.forEach(function (elem, index) {
            //     if (elem instanceof WorldWind.RenderableLayer) {
            //         let cont = String(elem.continent).trim();
            //         let contNOspace = cont.split(' ').join('_');
            //         // let cont = elem.continent;
            //         if (contNOspace === continentNOspace && elem.layerType == "H_PKLayer" || cont === continentS && elem.layerType == "H_PKLayer") {
            //             console.log("equal continent" + elem.continent)
            //             //elem.hide = false;
            //             elem.enabled = true;
            //         } else if (cont != continentS && elem.layerType == "H_PKLayer") {
            //             // console.log("this continent is not equal to the button value: " + elem.continent)
            //             // console.log("button value: " + continentS)
            //             if (continentS == 'All Continents' || continentS == "Please Select Continent") {
            //                 //elem.hide = false;
            //                 elem.enabled = true;
            //             } else {
            //                 //elem.hide = true;
            //                 elem.enabled = false;
            //             }
            //         }
            //     }
            //
            //     // refreshed the menu buttoms
            //     if (index === newGlobe.layers.length - 1) {
            //         //navigate the globe to the continent
            //         letLong.some(function (c) {
            //             if (c.cont == continentS) {
            //                 newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
            //                 return true
            //             }
            //         })
            //
            //         layerManager.synchronizeLayerList();
            //         // console.log("123")
            //
            //         // if (country_status === false) {
            //         //     newGlobe.layers[findCountryIndex].enabled = false;
            //         // }
            //         //
            //         // if (weather_status === false) {
            //         //     newGlobe.layers[findWeatherIndex].enabled = false;
            //         // }
            //
            //     }
            // })

        } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
            if (continentS == 'All Continents' || continentS == "Please Select Continent") {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == 'V_PKLayer') {
                        // //elem.hide = false;
                        elem.enabled = true;
                    }
                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        letLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        })
                        layerManager.synchronizeLayerList();
                    }
                })
            } else {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer") {
                        let cont = String(elem.continent).trim();
                        let contNOspace = cont.split(' ').join('_');
                        if (contNOspace === continentNOspace || cont === continentS) {
                            //elem.hide = false;
                            elem.enabled = true;
                        } else {
                            //elem.hide = true;
                            elem.enabled = false;
                        }
                    }

                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        letLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        })
                        layerManager.synchronizeLayerList();
                    }
                })
            }

            // await newGlobe.layers.forEach(function (elem, index) {
            //     if (elem instanceof WorldWind.RenderableLayer) {
            //         let cont = String(elem.continent).trim();
            //         let contNOspace = cont.split(' ').join('_');
            //         // let cont = elem.continent;
            //         if (contNOspace === continentNOspace && elem.layerType == "V_PKLayer" || cont === continentS && elem.layerType == "V_PKLayer") {
            //             console.log("equal continent" + elem.continent)
            //             //elem.hide = false;
            //             elem.enabled = true;
            //         } else if (cont != continentS && elem.layerType == "V_PKLayer") {
            //             // console.log("this continent is not equal to the button value: " + elem.continent)
            //             // console.log("button value: " + continentS)
            //             if (continentS == 'All Continents' || continentS == "Please Select Continent") {
            //                 //elem.hide = false;
            //                 elem.enabled = true;
            //             } else {
            //                 //elem.hide = true;
            //                 elem.enabled = false;
            //             }
            //         }
            //     }
            //
            //     // refreshed the menu buttoms
            //     if (index === newGlobe.layers.length - 1) {
            //         //navigate the globe to the continent
            //         letLong.some(function (c) {
            //             if (c.cont == continentS) {
            //                 newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
            //                 return true
            //             }
            //         })
            //
            //         layerManager.synchronizeLayerList();
            //         // console.log("123")
            //
            //         // if (country_status === false) {
            //         //     newGlobe.layers[findCountryIndex].enabled = false;
            //         // }
            //         //
            //         // if (weather_status === false) {
            //         //     newGlobe.layers[findWeatherIndex].enabled = false;
            //         // }
            //
            //     }
            // })
        }
    };

    //under second left tab; controls display of navigation tools
    let onNav = function () {
        if (newGlobe.layers[2].enabled === true && newGlobe.layers[4].enabled === true) {
            $('#navControls').css("background-color", "transparent");
            newGlobe.layers[2].enabled = false;
            newGlobe.layers[4].enabled = false;
        } else if (newGlobe.layers[2].enabled === false && newGlobe.layers[4].enabled === false) {
            $('#navControls').css("background-color", "#0db9f0");
            newGlobe.layers[2].enabled = true;
            newGlobe.layers[4].enabled = true;
        }
    }

    //under third left tab; plays a timelapse of the placemarks over the course of a set date range
    let timelapse = function (sd, ed) {
        //sd = start date, ed= end date
        let a;
        let dDate;

        if (document.getElementById("COVID-19-checkbox").checked === true) {
            a = dataAll.arrDate.findIndex(dat => dat.Date === sd);
            dDate = dataAll.arrDate[a].Date;
        } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
            a = dataAll.arrDateV.findIndex(dat => dat.Date === sd);
            dDate = dataAll.arrDateV[a].Date;
        }

        $("#slider-range").slider("disable");
        l = setInterval(async function () {
            if (document.getElementById("COVID-19-checkbox").checked === true) {
                dDate = dataAll.arrDate[a].Date;
            } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                dDate = dataAll.arrDateV[a].Date;
            }
            //updates current date picker and date slider
            // updateCurr(dataAll.arrDate[a].Date);
            // updateCurr(dDate,"timelapse");
            curDate.val(dDate);
            // let val = new Date(dataAll.arrDate[a].Date).getTime() / 1000;
            let val = new Date(dDate).getTime() / 1000;
            $("#slider-range").slider("disable");
            await $("#slider-range").slider("value", val);
            // $("#amount").val(dataAll.arrDate[a].Date);
            $("#amount").val(dDate);
            $("#currentdatepicker").val(dDate);
            // //enables placemark based on the user properties date and type
            // newGlobe.layers.forEach(function (elem, index) {
            //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.enabled) {
            //         elem.renderables.forEach(function (d) {
            //             if (d instanceof WorldWind.Placemark) {
            //                 if (d.userProperties.Date === dataAll.arrDate[a].Date) {
            //                     d.enabled = d.userProperties.Type === categoryS;
            //                 } else {
            //                     d.enabled = false;
            //                 }
            //             }
            //         })
            //     }
            //     newGlobe.redraw()
            // });
            // if (document.getElementById("COVID-category").checked === true){
            //     updateCOVID(categoryS, dDate);
            // } else if (document.getElementById("vaccine-category").checked === true) {
            //     updateVaccine(categoryV, dDate);
            // //     console.log("update vaccine timelapse")
            // } else {
            //     // updateVaccine(categoryV, dDate);
            //     // updateCOVID(categoryS, dDate);
            // }


            //when date reaches 'To' date aka end of date range, stop animation
            // if (ed === dataAll.arrDate[a].Date) {
            if (ed === dDate) {
                // curDate.val(dataAll.arrDate[a].Date);
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


        }, 2000)
    };

    //used for timelapse function; pauses/plays animation without restarting from the beginning of timelapse
    // let pause = function () {
    //     play = !play;
    //     console.log(play)
    //
    // };


    //clears timelapse interval
    let clearI = function () {
        clearInterval(l);
    }

    //under third left tab; used to update placemarks shown based on filter boundaries
    let updateHIS = async function (v1, v2, Dd = "none") {
        // console.log("update HIS");

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(updateHIS)")) {
                location.reload();
                return false;
            }
            console.error("Error COVID selection menu. (updateHIS)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(updateHIS)")) {
                location.reload();
                return false;
            }
            console.error("Error vaccination selection menu. (updateHIS)");
        }
        // let categoryVal = document.getElementById("categoryList").innerText;

        let sortLayers = [];
        let continentVal = document.getElementById("continentList").innerText;
        continentVal = continentVal.trim().split(' ').join('_');
        if (Dd !== "none") { //checks if a date is given
            if (document.getElementById("COVID-19-checkbox").checked === true) { //checks if we should turn on COVID PK or Vaccine PK

                if (Dd <= PkStartDate.Date || Dd > PkEndDate.Date) { //Checks if selected date is before loaded range

                    console.log("before: ");
                    console.log(PkStartIndex, PkEndIndex);
                    console.log(PkStartDate, PkEndDate);

                    console.log(Dd);
                    // PkEndDate.Date = Dd;
                    PkMidDate.Date = Dd; //sets middate as the date selected
                    PkMidIndex = dataAll.arrDate.findIndex(x => x.Date == Dd); //finds index of selected date in array
                    console.log(PkMidDate, PkMidIndex);
                    // console.log(dataAll.arrDate);
                    if (PkMidIndex > dataAll.arrDate.length - 1 || PkMidIndex < 0) { //checks if selected date is beyond available range
                        console.log("Error loading placemarks! (1)");
                        $('#amount').val(Dd);
                        $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                        $("#slider-range").slider("disable");
                    } else {
                        PkEndIndex = PkMidIndex + Math.floor(clientConfig.initLength / 2); //loads half of inital load range before and after (so total is still in initial load range)
                        PkStartIndex = PkMidIndex - Math.floor(clientConfig.initLength / 2);

                        if (PkEndIndex > dataAll.arrDate.length - 1) {
                            //checks if end index is out of range and resets it to the last day, start date is set so that the max number of days are loaded
                            PkEndIndex = dataAll.arrDate.length - 1;
                            // PkStartIndex = PkEndIndex - clientConfig.initLength;

                            // PkMidIndex = Math.floor((PkStartIndex+PkEndIndex)/2); //updates PkMidIndex and mid date
                            // PkMidDate = dataAll.arrDate[PkMidIndex];
                        } else if (PkStartIndex < 0) {
                            PkStartIndex = 0;
                            // PkEndIndex = PkStartIndex + clientConfig.initLength;

                            // PkMidIndex = Math.floor((PkStartIndex+PkEndIndex)/2);
                            // PkMidDate = dataAll.arrDate[PkMidIndex];
                        }

                        PkStartDate = dataAll.arrDate[PkStartIndex];
                        PkEndDate = dataAll.arrDate[PkEndIndex];
                        console.log("after: ");
                        console.log(PkStartIndex, PkEndIndex);
                        // console.log(dataAll.arrDate.indexOf(Dd));
                        console.log(PkStartDate, PkEndDate);

                        // overlay.style.display = 'none';
                        // tutorial.hidden = false;
                        // tutorial.disabled = false;
                        $("#slider-range").slider("disable");
                        $("#slider-range").slider({disabled: "true"});
                        $("#slider-range").slider({disabled: true});
                        if (Dd >= PkStartDate.Date && Dd <= PkEndDate.Date) { //checks if new PkMidIndex is greater than or less than loaded range

                            // if (confirm("You selected "+ Dd + ". COVID PK Loading from " + PkStartDate.Date + " to " + PkEndDate.Date)) {

                            if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
                                await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd,continentVal);
                                //this next part can and should be simplified
                                await newGlobe.layers.forEach(function (elem, index) {
                                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
                                        elem.renderables.forEach(function (d) {
                                            if (d instanceof WorldWind.Placemark) {
                                                if (d.userProperties.Date === Dd) {
                                                    if (d.userProperties.Type === categoryS) {
                                                        sortLayers.push(d);
                                                    }
                                                }
                                            }
                                        })
                                    }
                                    if (index === newGlobe.layers.length - 1) {
                                        newGlobe.redraw();
                                        layerManager.synchronizeLayerList();
                                    }
                                });
                            } else {
                                await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd);
                                //this next part can and should be simplified
                                await newGlobe.layers.forEach(function (elem, index) {
                                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                                        elem.renderables.forEach(function (d) {
                                            if (d instanceof WorldWind.Placemark) {
                                                if (d.userProperties.Date === Dd) {
                                                    if (d.userProperties.Type === categoryS) {
                                                        sortLayers.push(d);
                                                    }
                                                }
                                            }
                                        })
                                    }
                                    if (index === newGlobe.layers.length - 1) {
                                        newGlobe.redraw();
                                        layerManager.synchronizeLayerList();
                                    }
                                });
                            }

                            // $('#amount').val(Dd);
                            // $( "#slider-range" ).slider( "enable" );
                            // alert("COVID Placemarks finished loading ");
                            // $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                            // overlay.style.display = 'none';
                            // tutorial.hidden = false;
                            // tutorial.disabled = false;
                            // tutorial.style.display = 'table-cell';
                            // $('#amount').val(Dd);
                            // await $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                            $("#slider-range").slider("enable");
                            $("#slider-range").slider({enabled: "true"});
                            $("#slider-range").slider({enabled: true});
                            // } else {
                            //     $('#amount').val(Dd);
                            //     $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                            // }

                        } else {
                            // await covidPK.covidPK([Dd, PkStartDate.Date], categoryS, "load", Dd);
                            console.error("Error! Placemarks were not loaded properly (2). " + Dd + " is not within the date range " + dataAll.arrDate[0].Date +" and " + dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                            alert("Error! Placemarks were not loaded properly (2). " + Dd + " is not within the date range " + dataAll.arrDate[0].Date +" and " + dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                            console.log(dataAll.arrDate.includes(Dd));
                            console.log(dataAll.arrDate.findIndex(x => x.Date = Dd));
                            $('#amount').val(Dd);
                            $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                        }
                    }

                }
                    // else if (Dd > PkEndDate.Date) {
                    //
                    //
                    //     // let overlay = document.getElementById("overlay");
                    //     // let tutorial = document.getElementById("tutorial");
                    //
                    //     // await $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                    //     // await $('#amount').val("Loading");
                    //     // await $( "#slider-range" ).slider( "disable" );
                    //     console.log(PkStartIndex, PkEndIndex);
                    //     console.log(PkStartDate, PkEndDate);
                    //
                    //     // PkEndDate.Date = Dd;
                    //     console.log(Dd);
                    //     PkMidDate.Date = Dd;
                    //     PkMidIndex = dataAll.arrDate.findIndex(x => x.Date == Dd);
                    //     console.log(PkMidIndex, PkMidDate);
                    //     console.log(dataAll.arrDate);
                    //
                    //
                    //     if (PkMidIndex > dataAll.arrDate.length - 1 || PkMidIndex < 0) {
                    //         console.log("Error loading placemarks! (1)");
                    //         $('#amount').val(Dd);
                    //         $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                    //         $( "#slider-range" ).slider( "disable");
                    //     } else {
                    //         PkEndIndex = PkMidIndex + Math.floor(clientConfig.initLength/2);
                    //         PkStartIndex= PkMidIndex - Math.floor(clientConfig.initLength/2);
                    //
                    //         if (PkEndIndex > dataAll.arrDate.length - 1) {
                    //             //checks if end index is out of range and resets it to the last day, start date is set so that the max number of days are loaded
                    //             PkEndIndex = dataAll.arrDate.length - 1;
                    //             // PkStartIndex = PkEndIndex - clientConfig.initLength;
                    //
                    //             // PkMidIndex = Math.floor((PkStartIndex+PkEndIndex)/2); //updates PkMidIndex and mid date
                    //             // PkMidDate = dataAll.arrDate[PkMidIndex];
                    //         } else if (PkStartIndex < 0) {
                    //             PkStartIndex= 0;
                    //             // PkEndIndex = PkStartIndex + clientConfig.initLength;
                    //             //
                    //             // PkMidIndex = Math.floor((PkStartIndex+PkEndIndex)/2);
                    //             // PkMidDate = dataAll.arrDate[PkMidIndex];
                    //         }
                    //
                    //         PkStartDate = dataAll.arrDate[PkStartIndex];
                    //         PkEndDate = dataAll.arrDate[PkEndIndex];
                    //         console.log(PkStartIndex, PkEndIndex);
                    //         console.log(PkStartDate, PkEndDate);
                    //         console.log(PkMidIndex, PkMidDate);
                    //
                    //         // overlay.style.display = 'none';
                    //         // tutorial.hidden = false;
                    //         // tutorial.disabled = false;
                    //         $( "#slider-range" ).slider( "disable");
                    //         $( "#slider-range" ).slider({ disabled: "true" });
                    //         $( "#slider-range" ).slider({ disabled: true });
                    //         if (Dd >= PkStartDate.Date && Dd <= PkEndDate.Date ) {
                    //             if (confirm("You selected "+ Dd + ". COVID PK Loading from " + PkStartDate.Date + " to " + PkEndDate.Date)) {
                    //                 await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd);
                    //
                    //                 //this part can and should be simplified
                    //                 await newGlobe.layers.forEach(function (elem, index) {
                    //                     if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                    //                         elem.renderables.forEach(function (d) {
                    //                             if (d instanceof WorldWind.Placemark) {
                    //                                 if (d.userProperties.Date === Dd) {
                    //                                     // if (d.userProperties.Type == "Confirmed Cases") {
                    //                                     //     numC += d.userProperties.Number;
                    //                                     // } else if (d.userProperties.Type == "Deaths") {
                    //                                     //     numD += d.userProperties.Number;
                    //                                     // } else if (d.userProperties.Type == "Recoveries") {
                    //                                     //     numR += d.userProperties.Number;
                    //                                     // } else if (d.userProperties.Type == "Active Cases") {
                    //                                     //     numA += d.userProperties.Number;
                    //                                     // }
                    //                                     if (d.userProperties.Type === categoryS) {
                    //                                         sortLayers.push(d);
                    //                                     }
                    //                                 }
                    //                             }
                    //                         })
                    //                     }
                    //                     if (index === newGlobe.layers.length - 1) {
                    //                         newGlobe.redraw();
                    //                     }
                    //                 });
                    //
                    //                 // $('#amount').val(Dd);
                    //                 // $( "#slider-range" ).slider( "enable" );
                    //                 alert("COVID Placemarks finished loading ");
                    //                 $( "#slider-range" ).slider( "enable");
                    //                 $( "#slider-range" ).slider({ enabled: "true" });
                    //                 $( "#slider-range" ).slider({ enabled: true });
                    //                 // $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                    //                 // overlay.style.display = 'none';
                    //                 // tutorial.hidden = false;
                    //                 // tutorial.disabled = false;
                    //                 // tutorial.style.display = 'table-cell';
                    //                 // $('#amount').val(Dd);
                    //                 // await $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                    //                 // $( "#slider-range" ).slider( "enable");
                    //             } else {
                    //                 $('#amount').val(Dd);
                    //                 $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                    //             }
                    //
                    //         } else {
                    //             // await covidPK.covidPK([PkEndDate.Date, Dd], categoryS, "load", Dd);
                    //             console.log("Error! Placemarks were not loaded properly (2)");
                    //             console.log(dataAll.arrDate.includes(PkMidDate));
                    //             console.log( dataAll.arrDate.findIndex(x => x.Date == Dd));
                    //             console.log( dataAll.arrDate.findIndex(x => x == PkMidDate));
                    //             $('#amount').val(Dd);
                    //             $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                    //         }
                    //     }
                    //
                // }
                else {
                    numC = 0
                    numD = 0
                    numA = 0
                    numR = 0

                    if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == "Confirmed Cases") {
                                                numC += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Deaths") {
                                                numD += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Recoveries") {
                                                numR += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Active Cases") {
                                                numA += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type === categoryS) {
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
                                newGlobe.redraw()
                            }
                        });
                    } else {
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == "Confirmed Cases") {
                                                numC += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Deaths") {
                                                numD += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Recoveries") {
                                                numR += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Active Cases") {
                                                numA += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type === categoryS) {
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
                                newGlobe.redraw()
                            }
                        });
                    }
                    if (isNaN(numR)) {
                        numR = "Not Available"
                        numA = "Not Available"
                    }
                    $('#conConfirmed').text(numC);
                    $('#conDeaths').text(numD);
                    $('#conRecoveries').text(numR);
                    $('#conActive').text(numA);
                }


                // else if (Dd > PkEndDate.Date) {
                //     console.log("greater than");
                //
                //     await $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                //     await $('#amount').val("Loading");
                //     await $( "#slider-range" ).slider( "disable" );
                //     // PkStartIndex= PkStartIndex+ (Math.floor(clientConfig.initLength/2));
                //     // PkEndIndex = PkEndIndex + (Math.floor(clientConfig.initLength/2));
                //
                //     console.log(PkStartIndex, PkEndIndex);
                //     console.log(PkStartDate, PkEndDate);
                //
                //     // PkEndDate.Date = Dd;
                //     PkMidDate.Date = Dd;
                //     PkMidIndex = dataAll.arrDate.findIndex(x => x.Date == Dd);
                //
                //     if (PkMidIndex > dataAll.arrDate.length - 1 || PkMidIndex < 0) {
                //         alert("Error loading placemarks!");
                //         $('#amount').val(Dd);
                //     } else {
                //         // PkEndIndex = PkMidIndex + Math.floor(clientConfig.initLength/2);
                //         // PkEndIndex = PkMidIndex + clientConfig.initLength + 1 || dataAll.arrDate.indexOf(PkEndDate.Date)
                //         PkEndIndex = PkMidIndex + (Math.floor((clientConfig.initLength *3 )/4)) - 1;
                //         if (PkEndIndex > dataAll.arrDate.length - 1) {PkEndIndex = dataAll.arrDate.length - 1}
                //
                //         // PkStartIndex= PkMidIndex - Math.floor(clientConfig.initLength/2);
                //         PkStartIndex= PkMidIndex - (Math.floor((clientConfig.initLength *1 )/4)) - 1;
                //         if (PkStartIndex< 0) {PkStartIndex= 0}
                //
                //         PkStartDate = dataAll.arrDate[PkStartIndex];
                //         PkEndDate = dataAll.arrDate[PkEndIndex];
                //         console.log(PkStartIndex, PkEndIndex);
                //         console.log(PkStartDate, PkEndDate);
                //
                //         PkMidIndex = Math.floor((PkStartIndex+PkEndIndex)/2);
                //         PkMidDate = dataAll.arrDate[PkMidIndex];
                //
                //         alert("You clicked "+ Dd + ". COVID PK Loading from " + PkStartDate.Date + " to " + PkEndDate.Date);
                //         // $( "#slider-range" ).slider( "value",  new Date(Dd).getTime() / 1000 + 86400);
                //         await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], categoryS, "load", Dd);
                //         // $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                //         // let layerArr= [];
                //         // newGlobe.layers.forEach(function (elem, index) {
                //         //     if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                //         //         elem.renderables.forEach(function (d) {
                //         //             if (d instanceof WorldWind.Placemark && d.userProperties.Date === Dd && d.userProperties.Type === categoryS) {
                //         //                 sortLayers.push(d);
                //         //             }
                //         //         })
                //         //         // layerArr.push(elem.displayName);
                //         //     }
                //         // });
                //
                //         await newGlobe.layers.forEach(function (elem, index) {
                //             if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                //                 elem.renderables.forEach(function (d) {
                //                     if (d instanceof WorldWind.Placemark) {
                //                         if (d.userProperties.Date === Dd) {
                //                             if (d.userProperties.Type === categoryS) {
                //                                 sortLayers.push(d);
                //                                 d.enabled = true;
                //                             } else {
                //                                 d.enabled = false;
                //                             }
                //                         } else {
                //                             d.enabled = false;
                //                         }
                //                     }
                //                 })
                //             }
                //             if (index === newGlobe.layers.length - 1) {
                //                 newGlobe.redraw();
                //             }
                //         });
                //         $('#amount').val(Dd);
                //         $( "#slider-range" ).slider( "enable" );
                //         alert("COVID Placemarks finished loading ");
                //         // $("#slider-range").slider({value: new Date(Dd).getTime() / 1000});
                //         $('#amount').val(Dd);
                //         await $("#slider-range").slider({value: new Date(Dd).getTime() / 1000 + 86400});
                //         $( "#slider-range" ).slider( "enable");
                //     }
                //
                // }

                // console.log(PkMidDate);
                // if (Dd <= PkMidDate[0].Date) {
                //     // I think we also need this for Dd == "none" too later
                //     //if start date less than smallest value, set PkStartIndex to smallest value, else set start date to start date -20
                //     // if end date larger than max value, set PkEndIndex  to currdate, else set end date to end date +20
                //
                //     //create delete pk for some days and update PkStartIndex and PkEndIndex  based on the deleted
                //     console.log(PkMidDate)
                //
                //     // if (Dd >= PkStartDate.Date) {
                //         //load new pk
                //         oldPkStart = PkStartIndex
                //         oldPkStartDate = PkStartDate;
                //         console.log(PkStartIndex)
                //         PkStartIndex = PkStartIndex - clientConfig.initLength;
                //         console.log(clientConfig.initLength);
                //         PkMidDate[0] = dataAll.arrDate[oldPkStart];
                //         console.log(PkMidDate[0] - clientConfig.initLength)
                //         console.log(dataAll.arrDate[oldPkStart]);
                //         console.log(PkMidDate)
                //         console.log(PkMidDate.getDate())
                //         if (PkStartIndex < 0) {PkStartIndex = 0}
                //
                //
                //         // while (PkStartDate.Date.includes('NaN')) {
                //         //     PkStartIndex -= 1
                //         //     PkStartDate = dataAll.arrDate[PkStartIndex]  ;
                //         //     if (PkStartIndex < 0) {
                //         //         alert("Error loading date configurations. Refreshing page... ")
                //         //         location.reload();
                //         //         return false;
                //         //     }
                //         // }
                //
                //         PkStartDate = dataAll.arrDate[PkStartIndex]  ;
                //         // console.log([PkStartDate.Date, oldPkStartDate.Date])
                //         alert("Please wait for the placemarks to load... ");
                //         $( "#slider-range" ).slider( "disable" );
                //         //hash table
                //         // await covidPK.covidPK([PkStartDate.Date, oldPkStartDate.Date], "Confirmed", "load");
                //
                //
                //         //removal
                //         oldPkEnd = PkEndIndex
                //         oldPkEndDate = PkEndDate
                //         PkEndIndex  = PkEndIndex  - clientConfig.initLength
                //         if (PkEndIndex  > dataAll.arrDate.length - 1) {PkEndIndex  = dataAll.arrDate.length - 1}
                //
                //         while (PkStartDate.Date.includes('NaN')) {
                //             PkStartIndex -= 1
                //             PkStartDate = dataAll.arrDate[PkStartIndex]  ;
                //             if (PkStartIndex <= 0) {
                //                 alert("Error loading date configurations. Refreshing page... ")
                //                 location.reload();
                //                 return false;
                //             }
                //         }
                //
                //         PkEndDate = dataAll.arrDate[PkEndIndex]  ;
                //         PkMidDate[1] = dataAll.arrDate[PkEnd-20];
                //         // await covidPK.covidPK([PkEndDate.Date, oldPkEndDate.Date], "Confirmed", "remove");
                //
                //         //delete then create
                //             await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], "Confirmed", "load");
                //         alert("Placemarks finished loading");
                //         $( "#slider-range" ).slider("enable");
                //         // console.log(newGlobe.layers[160])
                //     // } else {
                //     //     alert("Please drag the slider only!");
                //     // }
                //
                //
                //
                //
                //
                // } else if (Dd >= PkMidDate[1].Date) {
                //
                //     // if (Dd <= PkEndDate.Date) {
                //         //loading new pk in background
                //         oldPkEnd = PkEndIndex
                //         oldPkEndDate = dataAll.arrDate[oldPkEnd]
                //         PkEndIndex  = oldPkEndIndex  + clientConfig.initLength
                //         PkMidDate[1] = dataAll.arrDate[oldPkEnd];
                //         if (PkEndIndex  > dataAll.arrDate.length - 1) {PkEndIndex  = dataAll.arrDate.length - 1}
                //         PkEndDate = dataAll.arrDate[PkEndIndex]  ;
                //         alert("Please wait for the placemarks to load... ")
                //         $( "#slider-range" ).slider( "disable" );
                //         // hash table
                //         // await covidPK.covidPK([oldPkEndDate.Date, PkEndDate.Date], "Confirmed", "load");
                //
                //         //removal
                //         oldPkStart = PkStartIndex
                //         oldPkStartDate = PkStartDate
                //         PkStartIndex = PkStartIndex + clientConfig.initLength
                //         if (PkStartIndex < 0) {PkStartIndex = 0}
                //         PkStartDate = dataAll.arrDate[PkStartIndex]
                //         PkMidDate[0] = dataAll.arrDate[PkStart+20]
                //         // await covidPK.covidPK([oldPkStartDate.Date, PkStartDate.Date], "Confirmed", "remove");
                //
                //         //delete then create
                //         await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], "Confirmed", "load");
                //         alert("Placemarks finished loading");
                //         $( "#slider-range" ).slider( "enable" );
                //     // } else {
                //     //     alert("Please drag the slider only!");
                //     // }
                //
                //
                // }


            } else if (document.getElementById("GlobalVaccinations-checkbox").checked == true) {
                if (Dd > dataAll.arrDateV[dataAll.arrDateV.length - 1].Date || Dd < dataAll.arrDateV[0].Date) {
                    alert("error! beyond date range" + Dd + " is not within the date range " + dataAll.arrDateV[0].Date +" and " + dataAll.arrDateV[dataAll.arrDateV.length - 1].Date);
                } else {
                    numT = 0;
                    numI = 0;
                    numDV = 0;
                    numDM = 0;
                    numCV = 0;

                    //enables placemark based on the placemark properties current date and type
                    if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == "Total Vaccinations") {
                                                numT += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                                numI += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Completed Vaccinations") {
                                                numCV += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Daily Vaccinations") {
                                                numDV += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                                numDM += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type === categoryV) {
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
                                newGlobe.redraw()
                            }
                        });
                    } else {
                        await newGlobe.layers.forEach(function (elem, index) {
                            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer") {
                                elem.renderables.forEach(function (d) {
                                    if (d instanceof WorldWind.Placemark) {
                                        if (d.userProperties.Date === curDate.val()) {
                                            if (d.userProperties.Type == "Total Vaccinations") {
                                                numT += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                                numI += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Completed Vaccinations") {
                                                numCV += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Daily Vaccinations") {
                                                numDV += parseInt(d.userProperties.Number);
                                            } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                                numDM += parseInt(d.userProperties.Number);
                                            }
                                            if (d.userProperties.Type === categoryV) {
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
                                newGlobe.redraw()
                            }
                        });
                    }
                    if (isNaN(numT)) {
                        numT = "Data Not Available"
                    }
                    if (isNaN(numI)) {
                        numI = "Data Not Available"
                    }
                    if (isNaN(numCV)) {
                        numCV = "Data Not Available"
                    }
                    if (isNaN(numDV)) {
                        numDV = "Data Not Available"
                    }
                    if (isNaN(numDM)) {
                        numDM = "Data Not Available"
                    }
                    $('#totVaccinations').text(numT);
                    $('#incVaccinations').text(numI);
                    $('#comVaccinations').text(numCV);
                    $('#daiVaccinations').text(numDV);
                    $('#milVaccinations').text(numDM);
                }


                // }
            }
        } else {
            //edit here

            if (document.getElementById("COVID-19-checkbox").checked === true) {
                numC = 0
                numD = 0
                numR = 0
                numA = 0

                if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == "Confirmed Cases") {
                                            numC += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Deaths") {
                                            numD += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Recoveries") {
                                            numR += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Active Cases") {
                                            numA += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type === categoryS) {
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
                            newGlobe.redraw()
                        }
                    });
                } else {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == "Confirmed Cases") {
                                            numC += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Deaths") {
                                            numD += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Recoveries") {
                                            numR += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Active Cases") {
                                            numA += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type === categoryS) {
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
                            newGlobe.redraw()
                        }
                    });
                }
                if (isNaN(numR)) {
                    numR = "Not Available"
                    numA = "Not Available"
                }
                $('#conConfirmed').text(numC);
                $('#conDeaths').text(numD);
                $('#conRecoveries').text(numR);
                $('#conActive').text(numA);
            } else if (document.getElementById("GlobalVaccinations-checkbox").checked == true) {
                numT = 0;
                numI = 0;
                numDV = 0;
                numDM = 0;
                numCV = 0;

                if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == "Total Vaccinations") {
                                            numT += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                            numI += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Completed Vaccinations") {
                                            numCV += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Daily Vaccinations") {
                                            numDV += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                            numDM += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type === categoryV) {
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
                            newGlobe.redraw()
                        }
                    });
                } else {
                    await newGlobe.layers.forEach(function (elem, index) {
                        if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer") {
                            elem.renderables.forEach(function (d) {
                                if (d instanceof WorldWind.Placemark) {
                                    if (d.userProperties.Date === curDate.val()) {
                                        if (d.userProperties.Type == "Total Vaccinations") {
                                            numT += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                            numI += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Completed Vaccinations") {
                                            numCV += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Daily Vaccinations") {
                                            numDV += parseInt(d.userProperties.Number);
                                        } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                            numDM += parseInt(d.userProperties.Number);
                                        }
                                        if (d.userProperties.Type === categoryV) {
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
                            newGlobe.redraw()
                        }
                    });
                }
                if (isNaN(numT)) {
                    numT = "Data Not Available"
                }
                if (isNaN(numI)) {
                    numI = "Data Not Available"
                }
                if (isNaN(numCV)) {
                    numCV = "Data Not Available"
                }
                if (isNaN(numDV)) {
                    numDV = "Data Not Available"
                }
                if (isNaN(numDM)) {
                    numDM = "Data Not Available"
                }
                $('#totVaccinations').text(numT);
                $('#incVaccinations').text(numI);
                $('#comVaccinations').text(numCV);
                $('#daiVaccinations').text(numDV);
                $('#milVaccinations').text(numDM);
            }
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
            })

            //based on boundaries set using the filter slider, the placemarks are enabled or disabled
            for (let k = 0; k < sortLayers.length; k++) {
                if (k >= v1 && k <= v2) {
                    sortLayers[k].enabled = true;
                } else {
                    sortLayers[k].enabled = false;
                }
            }
        }
    }

    //under third left tab; changes starting date for timelapse when 'From' date is changed
    // let onFrom = function () {
    //     for (let j = 0; j < dataAll.arrDate.length - 1; j++) {
    //         if (dataAll.arrDate[j].Date === fromDate.val()) {
    //             i = j;
    //         }
    //     }
    // };

    //under third left tab; filter slider for lowest to highest infections
    let infectionSlider = function () {
        $("#hInfectionSlider").slider({
            min: 0,
            max: 320,
            values: [0, 320],
            slide: function (event, ui) {
                //updates text
                $("#hInfectionsValue").text(ui.values[0] + " to " + ui.values[1] + " Locations");
                // if (ui.values[0] == 0 && ui.values[1] == 320) {
                //     updateHIS(ui.values[0], ui.values[1], curDate.val());
                // } else {
                    //updates placemarks displayed based on infection slider range
                    updateHIS(ui.values[0], ui.values[1]);
                // }
            }
        });
        //display current numbers for locations shown
        // $("#hInfectionsValue").text($("#hInfectionSlider").slider("values", 0) + " to " + $("#hInfectionsSlider").slider("values", 1) + " Locations");
        $("#hInfectionsValue").text("0 to 320 Locations");
    }

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
                setOpacity(ui.value / 100);
            }
        });
    }

    //sets surface opacity
    let setOpacity = function (value) {
        newGlobe.Opacity = value;
        newGlobe.surfaceOpacity = newGlobe.Opacity;
    };

    //date slider
    let dateSlider = function (sd) {
        // console.log(fromDate.val());
        let minDate;
        let maxDate;

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(dateSlider)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (dateSlider)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(dateSlider)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (dateSlider)");
        }
        if (document.getElementById("COVID-19-checkbox").checked === true) {
            minDate = new Date(dataAll.arrDate[0].Date).getTime() / 1000 + 86400,
            maxDate = new Date(dataAll.arrDate[dataAll.arrDate.length - 1].Date).getTime() / 1000 + 86400;
        } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
            minDate = new Date(dataAll.arrDateV[0].Date).getTime() / 1000 + 86400;
            maxDate = new Date(dataAll.arrDateV[dataAll.arrDateV.length - 1].Date).getTime() / 1000 + 86400;
        }

        $("#slider-range").slider({
            min: minDate,
            max: maxDate,
            //// min: new Date(dataAll.arrDate[dataAll.arrDate.length - 1 - clientConfig.initLength].Date).getTime() / 1000 + 86400,
            //             min: new Date(dataAll.arrDate[0].Date).getTime() / 1000 + 86400,
            //             max: new Date(dataAll.arrDate[dataAll.arrDate.length - 1].Date).getTime() / 1000 + 86400,
            step: 86400,
            value: new Date(sd).getTime() / 1000 + 86400
            // value: new Date(toDate.val()),
            // value: new Date(toDate.val()).getUTCDate() / 1000,
            , change: async function (event, ui) {
                $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));
                curDate.val($('#amount').val());
                await updateHIS($('#hInfectionSlider').slider('values', 0), $('#hInfectionSlider').slider('values', 1), $("#amount").val());
            }
            // , slide: function (event, ui) {
            //     //     // console.log(ui.value * 1000);
            //     //     console.log(event);
            //     //     // console.log(ui);
            //     //     // console.log($.format.date(ui.value * 1000, "yyyy-MM-dd"));
            //     //     // $("#amount").val($.format.date(ui.value, "yyyy-MM-dd"));
            //     //
            //     //     //updates text of current date of slider
            //     //     $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));
            //     //
            //     //     //update current placemark display based on slider/current date
            //     //     // console.log("date slider was run")
            //     //     // console.log($("#amount").val())
            //     //
            //     //     //update filter boundaries with changes in date
            //     //     updateHIS($('#hInfectionSlider').slider('values', 0), $('#hInfectionSlider').slider('values', 1), $("#amount").val());
            //     //     // console.log("Date slider was called " + $("#amount").val());
            //     //
            //     //     // $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));
            //     //     // updateCurr($("#amount").val());
            // }
            , create: function (event, ui) {
                // console.log("created");
                $('#amount').val(curDate.val());
                curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));
            }
            // , stop: function (event, ui) {
            //     // console.log("end");
            //     // $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));
            //     // updateHIS($('#hInfectionSlider').slider('values', 0), $('#hInfectionSlider').slider('values', 1), $("#amount").val());
            // }
        });
        //display current date
        curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));
        // $('#amount').val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));

        // curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));
        $('#amount').val(curDate.val());
    };

    //range slider; sets date range for date slider
    let rangeSlider = function () {
        $("#doubleSlider-range").slider({
            min: new Date(fromDate.val()).getTime() / 1000,
            max: new Date(toDate.val()).getTime() / 1000,
            step: 86400,
            values: [new Date(fromDate.val()).getTime() / 1000, new Date(toDate.val()).getTime() / 1000],
            slide: async function (event, ui) {
                //updates text
                $("#amount2").val($.format.date(ui.values[0] * 1000, "yyyy-MM-dd") + " to " + $.format.date(ui.values[1] * 1000, "yyyy-MM-dd"));

                //updates date slider; date range, value, text
                $('#slider-range').slider("option", "min", $("#doubleSlider-range").slider("values", 0));
                $('#slider-range').slider("option", "max", $("#doubleSlider-range").slider("values", 1));
                await $('#slider-range').slider("option", "value", $("#doubleSlider-range").slider("values", 1));
                $('#amount').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));

                //updates date range pickers
                $('.filterFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"));
                $('.filterTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
                flatpickr(".date", {
                    defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                    minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                    // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });
                flatpickr(".fromdatepicker", {
                    defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                    minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                    // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });
                flatpickr("#drTo", {
                    defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                    minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                    // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });
                $('#drFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"));
                $('#drTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
            }
        });
        //display current date range
        $('#amount2').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd") + " to " + $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
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
        } else {
            $('#edit').addClass('edit-mode');
            $('#edit').css('background-color', '#55d2d5');
            $('#labelRangeSlider').css('display', 'inline-block');
            $('#labelSlider').css('display', 'none');
            $('#doubleSlider-range').css('display', 'block');
            $('#amount2').css('display', 'inline-block');
            $('#slider-range').css('display', 'none');
            $('#amount').css('display', 'none');
        }
    }

    //overrides user changes in filter option dialog box; sets date range to max range, continents to all
    let fullLoad = async function () {

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(fullLoad)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (fullLoad)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(fullLoad)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (fullLoad)");
        }

        if (confirm("Are you sure you want to proceed? This may crash your browser ")) {
            //$('.filterFrom').val(dataAll.arrDate[dataAll.arrDate.length - 1 - clientConfig.initLength].Date);
            if (document.getElementById("COVID-19-checkbox") == true) {
                await covidPK.covidPK([dataAll.arrDate[0].Date, dataAll.arrDate[dataAll.arrDate.length - 1].Date], "Confirmed", "load");
                $('.filterFrom').val(dataAll.arrDate[0].Date);
                $('.filterTo').val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                flatpickr(".date", {
                    defaultDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
                    minDate: dataAll.arrDate[0].Date,
                    // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                    maxDate: date2.Date,
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });
            } else if (document.getElementById("GlobalVaccinations-checkbox").checked == true) {
                alert("Vaccination placemarks are already all fully loaded. ")
                // await vaccinePK([dataAll.arrDateV[0].Date, dataAll.arrDateV[dataAll.arrDateV.length - 1].Date]);
                // $('.filterFrom').val(dataAll.arrDateV[0].Date);
                // $('.filterTo').val(dataAll.arrDateV[dataAll.arrDateV.length - 1].Date);
                // flatpickr(".date", {
                //     defaultDate: dataAll.arrDateV[dataAll.arrDateV.length - 1].Date,
                //     minDate: dataAll.arrDateV[0].Date,
                //     // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                //     maxDate: date2.Date,
                //     inline: false,
                //     dateFormat: "Y-m-d",
                //     time_24hr: true
                // });
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

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(filterOptionDialog)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (filterOptionDialog)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(filterOptionDialog)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (filterOptionDialog)");
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
                    $('#drFrom').val($("#foFrom").val());
                    $('#drTo').val($("#foTo").val());

                    //changes date slider value range
                    $('#slider-range').slider("values", 0) === new Date($('#foFrom').val()).getTime() / 1000;
                    $('#slider-range').slider("values", 1) === new Date($('#foTo').val()).getTime() / 1000;
                    $("#amount2").val($('#foFrom').val() + " to " + $('#foTo').val());
                    flatpickr(".date", {
                        defaultDate: $('#foTo').val(),
                        minDate: $('#foFrom').val(),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $('#foTo').val(),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });

                    //creates placemarks based on range selected
                    if (speed) {
                        console.log("fast");
                        // covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS, "not init", $('#filterContinents').val());
                        if (document.getElementById("COVID-19-checkbox").checked == true) {
                            console.log($('#filterCountries').val());
                            let filterContinents = $('#filterContinents').val().trim().split(' ').join('_');
                            if (filterContinents == "North_America" || filterContinents == "Europe" || filterContinents == "South_America" || filterContinents == "Asia" || filterContinents == "Africa" || filterContinents == "Oceania") {
                                await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"load", "none", filterContinents);
                            } else {
                                await covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS,"load");
                            }
                        } else if (document.getElementById("GlobalVaccinations-checkbox").checked == true) {
                            await vaccinePK([$('#foFrom').val(), $('#foTo').val()]);
                        }
                    }

                    //changes date slider min and max valuesm current value, and text display
                    $('#slider-range').slider("option", "min", new Date($('#foFrom').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "max", new Date($('#foTo').val()).getTime() / 1000);
                    await $('#slider-range').slider("option", "value", new Date($('#foTo').val()).getTime() / 1000);
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

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(editDialog)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (editDialog)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page? (editDialog)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (editDialog)");
        }

        $("#dialogDateRange").dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Confirm": function () {
                    speed = true;
                    //changes dates across all date range pickers
                    $('#foFrom').val($("#drFrom").val());
                    $('#foTo').val($("#drTo").val());

                    //changes date slider value range
                    $('#slider-range').slider("values", 0) === new Date($('#drFrom').val()).getTime() / 1000;
                    $('#slider-range').slider("values", 1) === new Date($('#drTo').val()).getTime() / 1000;
                    $("#amount2").val($('#drFrom').val() + " to " + $('#drTo').val());

                    //changes date slider min and max valuesm current value, and text display
                    $('#slider-range').slider("option", "min", new Date($('#drFrom').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "max", new Date($('#drTo').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "value", new Date($('#drTo').val()).getTime() / 1000);
                    $('#amount').val($('#drTo').val());
                    let oldDrFrom = $('#drFrom').val();
                    flatpickr(".date", {
                        defaultDate: $('#drTo').val(),
                        minDate: $('#drFrom').val(),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $('#drTo').val(),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    flatpickr(".fromdatepicker", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    flatpickr("#drTo", {
                        defaultDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                        minDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"),
                        // minDate:  dataAll.arrDate[dataAll.arrDate.length - 1 - window.config.initLength].Date,
                        maxDate: $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"),
                        inline: false,
                        dateFormat: "Y-m-d",
                        time_24hr: true
                    });
                    $('#drFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"));
                    $('#drTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));

                    //creates placemarks based on range selected
                    if (speed) {
                        // console.log("fast");
                        // covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()], categoryS, "not init", $('#filterContinents').val());
                        if (document.getElementById("COVID-19-checkbox") == true) {
                            covidPK.covidPK([$('#foFrom').val(), $('#foTo').val()]);
                        } else if (document.getElementById("GlobalVaccinations-checkbox").checked == true) {
                            vaccinePK([$('#foFrom').val(), $('#foTo').val()]);
                        }
                    }

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


    //on clicking placemark
    let handleMouseCLK = function (e) {
        //console.log("clicked")
        let x = e.clientX,
            y = e.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickListCLK.objects.forEach(function (value) {
            let pickedPM = value.userObject;
            //console.log(pickedPM)

            if (pickedPM instanceof WorldWind.Placemark) {
                // console.log("picked");
                if (pickedPM.layer.layerType !== 'Country Placemarks' && pickedPM.layer.layerType !== 'Weather Station Placemarks' && pickedPM.layer.layerType !== 'Country_Placemarks' && pickedPM.layer.layerType !== 'Weather_Station_Placemarks') {
                    sitePopUp(pickedPM);
                } else if (pickedPM.layer.layerType === 'Country Placemarks' || pickedPM.layer.layerType === 'Weather Station Placemarks' || pickedPM.layer.layerType === 'Country_Placemarks' || pickedPM.layer.layerType === 'Weather_Station_Placemarks') {
                    //     let foodsecuritya = "FoodSecurity-a";
                    //     let foodsecurity = "FoodSecurity"
                    //     let agrofoodsecuritya = "FoodSecurity-Agrosphere-a
                    //     let agrofoodsecurity = "FoodSecurity-Agrosphere"
                    //
                    //     //document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Selected Country: " + pickedPM.country + " ";
                    if (pickedPM.layer.layerType === 'Country_Placemarks' || pickedPM.layer.layerType === 'Country Placemarks') {
                        document.getElementById("selectedCountry").innerHTML = "Selected Country: " + pickedPM.userProperties.country + " ";
                    } else {
                        document.getElementById("selectedCountry").innerHTML = "Selected Station: " + pickedPM.userProperties.stationName + " ";
                    }
                    //
                    //     // document.getElementById("controls").style.display = 'block';
                    //     openTabLeft(event, 'controls','open');
                    //     document.getElementById(foodsecuritya).removeAttribute("class", "collapsed");
                    //     document.getElementById(foodsecuritya).setAttribute("aria-expanded", "true");
                    //     document.getElementById(foodsecurity).setAttribute("aria-expanded", "true");
                    //     document.getElementById(foodsecurity).setAttribute("class", "in");
                    //     document.getElementById(foodsecurity).style.visibility = 'visible';
                    //     document.getElementById(foodsecurity).style.height = '';
                    //
                    //     document.getElementById(agrofoodsecuritya).removeAttribute("class", "collapsed");
                    //     document.getElementById(agrofoodsecuritya).setAttribute("aria-expanded", "true");
                    //     document.getElementById(agrofoodsecurity).setAttribute("aria-expanded", "true");
                    //     document.getElementById(agrofoodsecurity).setAttribute("class", "in");
                    //     document.getElementById(agrofoodsecurity).style.visibility = 'visible';
                    //     document.getElementById(agrofoodsecurity).style.height = '';
                    sitePopUp(pickedPM);
                }
            }

        })
    }

    let handleMouseMove = function (o) {
        if ($("#popover").is(":visible")) {
            $("#popover").hide();
        }

        // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
        // the mouse or tap location.
        let x = o.clientX,
            y = o.clientY;

        // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        // relative to the upper left corner of the canvas rather than the upper left corner of the page.

        let pickList = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickList.objects.forEach(function (value) {
            let pickedPM = value.userObject;

            if (pickedPM instanceof WorldWind.Placemark) {
                //console.log("hovered");
                let xOffset = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                let yOffset = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                let content = "";

                let popover = document.getElementById('popover');
                popover.style.position = "absolute";
                popover.style.left = (x + xOffset - 3) + 'px';
                popover.style.top = (y + yOffset - 3) + 'px';
                //console.log(popover)

                // if (pickedPM.layer.layerType !== 'Country_Placemarks' && pickedPM.layer.layerType !== 'Weather_Station_Placemarks') {
                //     sitePopUp(pickedPM);
                // }
                if (pickedPM.layer.layerType === 'Country_Placemarks') {
                    content = "<p><strong>Country:</strong> " + pickedPM.userProperties.country + "</p>";
                } else if (pickedPM.layer.layerType === 'Weather_Station_Placemarks') {
                    content = "<p><strong>Weather Station:</strong> " + pickedPM.userProperties.stationName + "</p>";
                }

                $("#popover").attr('data-content', content);
                $("#popover").show();
            }

        })
    }
    //pop-up content
    let sitePopUp = function (PM) {
        let popupBodyItem = $("#popupBody");
        //clears pop-up contents
        popupBodyItem.children().remove();
        let placeLat = PM.position.latitude;
        let placeLon = PM.position.longitude;

        if (PM.layer.layerType === "Country_Placemarks") {
            //inserts title and discription for placemark
            let popupBodyName = $('<p class="site-name"><h4 class="h4-sitename">' + PM.userProperties.country + '</h4></p>');
            // let popupBodyDesc = $('<p class="site-description">' + "Total Cases = Active + Deceased + Recoveries" + '</p><br>');
            let buttonArea = $("<div id='buttonArea'></div>");
            let br = $('<br><br>');

            //tab buttons for different date ranges for chart data shown
            let button0 = document.createElement("button");
            // button0.id = "AgrProduction";
            button0.id = "spawnAgri"
            button0.textContent = "Agr. Production";
            button0.className = "chartsB";
            // button0.onclick = function () {
            //     console.log("agr production")
            //     console.log(graphsD.agriData);
            //     let countryDataPoint = graphsD.findDataPoint(graphsD.countries, placeLat, placeLon);
            //     console.log(countryDataPoint)
            //     let ccode3 = countryDataPoint.code3;
            //     console.log(ccode3);
            //     // graphsD.findDataPointCountry(graphsD.agriData, '', 2);
            //
            //     graphsD.giveDataButtonsFunctionality(buttonArea,graphsD.agriData, graphsD.refugeeData, graphsD.agriDef, ccode3,0);
            //
            // };

            let button1 = document.createElement("button");
            // button1.id = "Price";
            button1.id = "spawnPrice"
            button1.textContent = "Price";
            button1.className = "chartsB";
            // button1.onclick = function () {
            //     console.log("price")
            // };
            let button2 = document.createElement("button");
            // button2.id = "Livestock";
            button2.id = "spawnLive"
            button2.textContent = "Livestock";
            button2.className = "chartsB";
            // button2.onclick = function () {
            //     console.log("livestock")
            // };

            let button3 = document.createElement("button");
            // button3.id = "Emissions";
            button3.id = "spawnEmissionAgri"
            button3.textContent = "Emissions";
            button3.className = "chartsB";
            // button3.onclick = function () {
            //     console.log("emissions")
            // };

            let button4 = document.createElement("button");
            // button4.id = "Pesticides";
            button4.id = "spawnPest"
            button4.textContent = "Pesticides";
            button4.className = "chartsB";
            // button4.onclick = function () {
            //     console.log("pesties")
            // };

            let button5 = document.createElement("button");
            // button5.id = "Fertilizer";
            button5.id = "spawnFerti"
            button5.textContent = "Fertilizer";
            button5.className = "chartsB";
            // button5.onclick = function () {
            //     console.log("Fertilizer")
            // };

            let button6 = document.createElement("button");
            // button6.id = "Yield";
            button6.id = "spawnYield"
            button6.textContent = "Yield"
            button6.className = "chartsB";
            // button6.onclick = function () {
            //     console.log("Yield")
            // };

            popupBodyItem
                .append(popupBodyName)
                .append(button0)
                .append(button1)
                .append(button2)
                .append(button3)
                .append(button4)
                .append(button5)
                .append(button6)
                .append(buttonArea)
                .append(br);
            // popupBodyItem.append(popupBodyDesc);
            // console.log(csvD.csv1[0]);
            // console.log(graphsD);
            // console.log(dataPoint);

            let dataPoint = graphsD.findDataPoint(csvD.csv1[0], placeLat, placeLon);
            graphsD.giveCountryButtonsFunctionality(graphsD.agriData, graphsD.priceData, graphsD.liveData, graphsD.emissionAgriData, graphsD.pestiData, graphsD.fertiData, graphsD.yieldData, graphsD.refugeeData, graphsD.agriDef, dataPoint.code3)

            let details = $("#country");
            let detailsHTML = '<h4>Country Details</h4>';

            detailsHTML +=
                '<p>Country: ' + dataPoint.country + '</p>';
            detailsHTML +=
                '<p>Country Code: ' + dataPoint.code3 +
                '</p>';
            detailsHTML += '<button class="btn-info"><a ' +
                'href="http://www.fao.org/faostat/en/#data/" ' +
                'target="_blank">Download Raw Agriculture ' +
                'Data</a></button>';
            //Get the agriculture data
            detailsHTML += graphsD.generateCountryButtons();
            detailsHTML += '<div id="buttonArea"></div>';
            details.html(detailsHTML);

            //Give functionality for the buttons generated
            // graphsD.giveCountryButtonsFunctionality(graphsD.agriData, graphsD.priceData,
            //     graphsD.liveData, graphsD.emissionAgriData, graphsD.pestiData,
            //     graphsD.fertiData, graphsD.yieldData, graphsD.refugeeData, graphsD.agriDef,
            //     dataPoint.country);


            let modal = document.getElementById('popupBox');
            let span = document.getElementById('closeIt');

            if (PM.userProperties.country !== 'undefined' || PM.userProperties.country !== undefined) {
                modal.style.display = "block";

                span.onclick = function () {
                    modal.style.display = "none";
                };

                window.onclick = function (event) {
                    if (event.target === modal) {
                        modal.style.display = "none";
                    }
                }

            }
        } else if (PM.layer.layerType === "Weather_Station_Placemarks") {
            //inserts title and discription for placemark
            let stationName = PM.userProperties.stationName;
            let popupBodyName = $('<p class="site-name"><h4 class="h4-sitename">' + stationName + '</h4></p>');
            // let popupBodyDesc = $('<p class="site-description">' + "Total Cases = Active + Deceased + Recoveries" + '</p><br>');
            popupBodyItem.append(popupBodyName);
            let br = $('<br><br>');
            graphsD.generateAtmoButtons(graphsD.atmoData, graphsD.atmoDataMonthly, stationName);
            let atmoDataPoint = graphsD.findDataPoint(csvD.csv1[1], placeLat, placeLon);
            // console.log(atmoDataPoint);
            let countryData = csvD.csv1[0];
            // console.log(countryData);
            let ccode2 = atmoDataPoint.stationName.slice(0, 2);
            // console.log(ccode2);
            let ccode3 = graphsD.findDataPointCountry(countryData, ccode2, 2);
            // console.log(ccode3)
            let agriDataPoint = graphsD.findDataPointCountry(graphsD.agriData, ccode3, 3);
            // console.log(agriDataPoint);
            graphsD.giveAtmoButtonsFunctionality(graphsD.atmoData,
                graphsD.atmoDataMonthly, graphsD.refugeeData,
                atmoDataPoint.stationName,
                ccode3,
                agriDataPoint);
            // tab buttons for different date ranges for chart data shown
            // let button0 = document.createElement("button");
            // button0.id = "plotWeatherButton0";
            // button0.textContent = "Temperature (Yearly)";
            // button0.className = "chartsB";
            // button0.onclick = function () {
            //     console.log("yearly temp");
            //
            //
            //
            //     // let details = $('#station');
            //     // let detailsHTML = '<h4>Weather Station Detail</h4>';
            //     //
            //     // detailsHTML += '<p>Station Name: ' +
            //     //     atmoDataPoint.stationName + '</p>';
            //     // detailsHTML += '<button class="btn-info">' +
            //     //     '<a href="https://fluxnet.fluxdata.org//' +
            //     //     'data/download-data/" ' +
            //     //     'target="_blank">Download Raw Atmosphere' +
            //     //     ' Data (Fluxnet Account Required)</a></button>'
            //     // //Generate the station buttons
            //     // detailsHTML += graphsD.generateAtmoButtons(graphsD.atmoData,
            //     //     graphsD.atmoDataMonthly, atmoDataPoint.stationName);
            //     //
            //     // details.html(detailsHTML);
            //
            //     //Generate the plots
            //     //Give functionality for buttons generated
            //
            //
            // }
            // let button1 = document.createElement("button");
            // button1.id = "plotWeatherButton1";
            // button1.textContent = "Precipitation (Yearly)";
            // button1.className = "chartsB";
            // button1.onclick = function () {
            //     console.log("yearly precip");
            // }
            // let button2 = document.createElement("button");
            // button2.id = "plotWeatherButton2";
            // button2.textContent = "Temperature (Monthly)";
            // button2.className = "chartsB";
            // button2.onclick = function () {
            //     console.log("yearly temp");
            // }
            // let button3 = document.createElement("button");
            // button3.id = "plotWeatherButton3";
            // button3.textContent = "Precipitation (Monthly)";
            // button3.className = "chartsB";
            // button3.onclick = function () {
            //     console.log("monthly precip");
            // }
            // // popupBodyItem.append(popupBodyDesc);
            // popupBodyItem.append(button0);
            // popupBodyItem.append(button1);
            // popupBodyItem.append(button2);
            // popupBodyItem.append(button3);
            // popupBodyItem.append(br);

            let modal = document.getElementById('popupBox');
            let span = document.getElementById('closeIt');

            if (PM.userProperties.country !== 'undefined' || PM.userProperties.country !== undefined) {
                modal.style.display = "block";

                span.onclick = function () {
                    modal.style.display = "none";
                };

                window.onclick = function (event) {
                    if (event.target === modal) {
                        modal.style.display = "none";
                    }
                }

            }
        } else {
            //inserts title and discription for placemark
            let popupBodyHeading;
            if (document.getElementById("COVID-19-checkbox").checked === true) {
                popupBodyHeading = "Total Cases = Active + Deceased + Recoveries";
            } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                popupBodyHeading = "Total Vaccinations = Incompleted + Completed";
            }

            let popupBodyName = $('<p class="site-name"><h4 class="h4-sitename">' + PM.userProperties.dName + '</h4></p>');
            let popupBodyDesc = $('<p class="site-description">' + popupBodyHeading + '</p><br>');
            let br = $('<br><br>');

            //tab buttons for different date ranges for chart data shown
            let button0 = document.createElement("button");
            button0.id = button0.value = "1";
            button0.textContent = "Current";
            button0.className = "chartsB";
            button0.onclick = function () {
                chartDFun(button0, PM)
            };
            let button1 = document.createElement("button");
            button1.id = button1.value = "7";
            button1.textContent = "Past 7 Days";
            button1.className = "chartsB";
            button1.onclick = function () {
                chartDFun(button1, PM)
            };
            let button2 = document.createElement("button");
            button2.id = button2.value = "14";
            button2.textContent = "Past 2 Weeks";
            button2.className = "chartsB";
            button2.onclick = function () {
                chartDFun(button2, PM)
            };
            let button3 = document.createElement("button");
            button3.id = button3.value = "28";
            button3.textContent = "Past 1 Month";
            button3.className = "chartsB";
            button3.onclick = function () {
                chartDFun(button3, PM)
            };
            let button4 = document.createElement("button");
            button4.id = button4.value = "63";
            button4.textContent = "Past 2 Months";
            button4.className = "chartsB";
            button4.onclick = function () {
                chartDFun(button4, PM)
            };

            popupBodyItem.append(popupBodyName);
            popupBodyItem.append(popupBodyDesc);
            popupBodyItem.append(button0);
            popupBodyItem.append(button1);
            popupBodyItem.append(button2);
            popupBodyItem.append(button3);
            popupBodyItem.append(button4);
            popupBodyItem.append(br);

            let modal = document.getElementById('popupBox');
            let span = document.getElementById('closeIt');

            if (PM.userProperties.dName !== 'undefined' || PM.userProperties.dName !== undefined) {
                modal.style.display = "block";

                span.onclick = function () {
                    modal.style.display = "none";
                };

                window.onclick = function (event) {
                    if (event.target === modal) {
                        modal.style.display = "none";
                    }
                }

            }


            //load chart data
            button0.click();
        }


    }

    let chartDFun = function (objButton, PM) {
        // get button value to reset chart duration time
        let pDate = $("#amount").val();
        let d0 = new Date("" + pDate + "");
        console.log(d0)
        console.log(d0.getDate())
        console.log(objButton.id)
        let dFrom = $.format.date(d0.setDate(d0.getDate() - objButton.id + 2), "yyyy-MM-dd");
        console.log(dFrom)
        // let dTo = dataAll.arrDate[dataAll.arrDate.length - 1].Date;
        let dTo = new Date("" + pDate + "");

        // disable this button and enable previous button disabled
        $(".chartsB").prop('disabled', false);
        $("#" + objButton.value).prop('disabled', true);
        $("#chartText").html(objButton.textContent);

        // set label date value
        let lArr = [];
        let d1 = new Date("" + pDate + "");

        //label creation
        if (objButton.value === "1") {
            lArr.push(pDate);
        } else if (objButton.value === "7") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 5), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "14") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 12), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "28") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 26), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        } else if (objButton.value === "63") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 61), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        }

        // refresh the chart canvas and data
        let cCanvas = document.getElementById("stackedChart");
        if (!!cCanvas) {
            cCanvas.remove();
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        } else {
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        }

        let ctx = cCanvas.getContext('2d');
        let popupBody = $("#popupBody");
        popupBody.append(cCanvas);

        //retrieves data for chart
        $.ajax({
            url: '/chartData',
            type: 'GET',
            data: {dateFrom: dFrom, dateTo: dTo, dName: PM.userProperties.dName, dLayerType: PM.layer.layerType,},
            dataType: 'json',
            async: false,
            success: function (resp) {
                let j;
                if (!resp.error) {
                    console.log(objButton)

                    // j = resp.data.findIndex(ele => ele.Date === dFrom);
                    // console.log(j)
                    // console.log("chart data");
                    console.log(resp);
                    // let dArr = [];
                    // let rArr = [];
                    // let aArr = [];
                    //
                    // let iArr = [];
                    // let cArr = [];
                    let data1 = [],
                        data2 = [],
                        data3 = [];

                    let label1, label2, label3;
                    // console.log(resp.data);
                    if (objButton.value !== "28" && objButton.value !== "63") {
                        for (j = 0; j < objButton.value; j++) {
                            if (document.getElementById("COVID-19-checkbox").checked === true) {
                                console.log("less than 28")
                                // dArr.push(resp.data[j].DeathNum);
                                // rArr.push(resp.data[j].RecovNum);
                                // // aArr.push(resp.data[i].CaseNum - resp.data[i].DeathNum - resp.data[i].RecovNum);
                                // aArr.push(resp.data[j].ActiveNum);
                                // console.log(resp.data[j].ActiveNum)
                                data1.push(resp.data[j].ActiveNum);
                                data2.push(resp.data[j].DeathNum);
                                data3.push(resp.data[j].RecovNum);
                                console.log(data1)
                                label1 = "Active";
                                label2 = "Deceased";
                                label3 = "Recoveries";
                                // let dataset3 = {
                                //     label: label3,
                                //     backgroundColor: "#035992",
                                //     data: data3,
                                // }
                                //
                                // myChart.data.datasets.push(dataset3);
                                // myChart.updateDatasets();

                            } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                                // iArr.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                // cArr.push(resp.data[j].people_fully_vaccinated);
                                data1.push(resp.data[j].people_fully_vaccinated);
                                data2.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                label1 = "Completed";
                                label2 = "Incompleted";
                            }

                        }
                    } else if (objButton.value == "28" || objButton.value == "63") {
                        for (j = 0; j < objButton.value; j += 7) {
                            if (document.getElementById("COVID-19-checkbox").checked === true) {
                                console.log("greater than 30")
                                // dArr.push(resp.data[j].DeathNum);
                                // rArr.push(resp.data[j].RecovNum);
                                // // aArr.push(resp.data[i].CaseNum - resp.data[i].DeathNum - resp.data[i].RecovNum);
                                // aArr.push(resp.data[j].ActiveNum);
                                // console.log(resp.data[j].ActiveNum)
                                data1.push(resp.data[j].ActiveNum);
                                data2.push(resp.data[j].DeathNum);
                                data3.push(resp.data[j].RecovNum);
                                console.log(data1)
                                label1 = "Active";
                                label2 = "Deceased";
                                label3 = "Recoveries";
                                // let dataset3 = {
                                //     label: label3,
                                //     backgroundColor: "#035992",
                                //     data: data3,
                                // }
                                //
                                // myChart.data.datasets.push(dataset3);
                                // myChart.updateDatasets();

                            } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                                // iArr.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                // cArr.push(resp.data[j].people_fully_vaccinated);
                                data1.push(resp.data[j].people_fully_vaccinated);
                                data2.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                label1 = "Completed";
                                label2 = "Incompleted";


                            }

                        }
                    }


                    if (document.getElementById("COVID-19-checkbox").checked === true) {
                        let myChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: lArr,
                                datasets: [
                                    {
                                        label: label1,
                                        backgroundColor: "#45c498",
                                        data: data1,
                                    }, {
                                        label: label2,
                                        backgroundColor: "#ead04b",
                                        data: data2,
                                    }
                                    , {
                                        label: label3,
                                        backgroundColor: "#035992",
                                        data: data3,
                                    }
                                ],
                            },
                            options: {
                                tooltips: {
                                    displayColors: true,
                                    callbacks: {
                                        mode: 'x',
                                    },
                                },
                                scales: {
                                    xAxes: [{
                                        stacked: true,
                                        gridLines: {
                                            display: false,
                                        }
                                    }],
                                    yAxes: [{
                                        stacked: true,
                                        ticks: {
                                            beginAtZero: true,
                                        },
                                        type: 'linear',
                                    }]
                                },
                                responsive: true,
                                maintainAspectRatio: true,
                                legend: {position: 'bottom'},
                            }
                        })
                        console.log(myChart);
                    } else if (document.getElementById("GlobalVaccinations-checkbox").checked === true) {
                        let myChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: lArr,
                                datasets: [
                                    {
                                        label: label1,
                                        backgroundColor: "#45c498",
                                        data: data1,
                                    }, {
                                        label: label2,
                                        backgroundColor: "#ead04b",
                                        data: data2,
                                    }
                                ],
                            },
                            options: {
                                tooltips: {
                                    displayColors: true,
                                    callbacks: {
                                        mode: 'x',
                                    },
                                },
                                scales: {
                                    xAxes: [{
                                        stacked: true,
                                        gridLines: {
                                            display: false,
                                        }
                                    }],
                                    yAxes: [{
                                        stacked: true,
                                        ticks: {
                                            beginAtZero: true,
                                        },
                                        type: 'linear',
                                    }]
                                },
                                responsive: true,
                                maintainAspectRatio: true,
                                legend: {position: 'bottom'},
                            }
                        })
                        console.log(myChart);
                    }

                } else {
                    console.error("Error retrieving popup data from server (chartData)");
                    alert("Error retrieving popup data from server");
                }
            }
        });
    }

    let handlePick = function (x, y) {
        // De-highlight any previously highlighted placemarks.
        for (let h = 0; h < highlightedItems.length; h++) {
            highlightedItems[h].highlighted = false;
        }
        highlightedItems = [];

        let pickList;
        pickList = newGlobe.pick(newGlobe.canvasCoordinates(x, y));
        if (pickList.objects.length > 0) {
            let i = 0;
            for (i = 0; i < pickList.objects.length; i++) {
                pickList.objects[i].userObject.highlighted = true;
                // Keep track of highlighted items in order to
                // de-highlight them later.
                highlightedItems.push(pickList.objects[i].userObject);
                if (typeof (pickList.objects[i].userObject.type) !=
                    'undefined') {
                    //It's most likely a placemark
                    //"most likely"
                    //Grab the co-ordinates
                    let placeLat =
                        pickList.objects[i].userObject.position.latitude;
                    let placeLon =
                        pickList.objects[i].userObject.position.longitude;

                    //Find the country
                    if (pickList.objects[i].userObject.type === 'Country') {
                        let dataPoint =
                            graphsD.findDataPoint(csvD.csv1[0], placeLat, placeLon);
                        let details = $("#country");
                        let detailsHTML = '<h4>Country Details</h4>';

                        detailsHTML +=
                            '<p>Country: ' + dataPoint.country + '</p>';
                        detailsHTML +=
                            '<p>Country Code: ' + dataPoint.code3 +
                            '</p>';
                        detailsHTML += '<button class="btn-info"><a ' +
                            'href="http://www.fao.org/faostat/en/#data/" ' +
                            'target="_blank">Download Raw Agriculture ' +
                            'Data</a></button>';
                        //Get the agriculture data
                        detailsHTML += graphsD.generateCountryButtons();
                        detailsHTML += '<div id="buttonArea"></div>';
                        details.html(detailsHTML);

                        //Give functionality for the buttons generated
                        graphsD.giveCountryButtonsFunctionality(graphsD.agriData, graphsD.priceData,
                            graphsD.liveData, graphsD.emissionAgriData, graphsD.pestiData,
                            graphsD.fertiData, graphsD.yieldData, graphsD.refugeeData, graphsD.agriDef,
                            dataPoint.code3);

                        //fixed hover flags bug - now click instead of
                        // hover eventlistener
                        let otherTab = $("#layers");
                        let otherTab2 = $("#graphs");
                        let otherTab3 = $("#station");
                        let otherTab4 = $("#comp");
                        let otherTab5 = $("#wms");
                        let otherTab6 = $("#weather");
                        let otherTab7 = $("#view");
                        details.show();
                        otherTab.hide();
                        otherTab2.hide();
                        otherTab3.hide();
                        otherTab4.hide();
                        otherTab5.hide();
                        otherTab6.hide();
                        otherTab7.hide();

                        $('.glyphicon-globe').css('color', 'white');
                        $('.fa-map').css('color', 'white');
                        $('.glyphicon-cloud').css('color', 'white');
                        $('.fa-area-chart').css('color', 'white');
                        $('.glyphicon-briefcase').css('color', 'white');
                        $('.fa-sun-o').css('color', 'white');
                        $('.glyphicon-eye-open').css('color', 'white');
                        $('.glyphicon-flag').css('color', 'lightgreen');

                        $('.resizable').show();

                    } else if (pickList.objects[i].userObject.type ===
                        'Weather Station') {
                        let atmoDataPoint =
                            graphsD.findDataPoint(csvD.csv1[1], placeLat, placeLon);

                        let countryData = csvD.csv1[0];
                        let ccode2 = atmoDataPoint.stationName.slice(0, 2);
                        let ccode3 = graphsD.findDataPointCountry(countryData,
                            ccode2, 2).country;

                        let agriDataPoint = graphsD.findDataPointCountry(graphsD.agriData, ccode3, 3);

                        let details = $('#station');
                        let detailsHTML = '<h4>Weather Station Detail</h4>';

                        detailsHTML += '<p>Station Name: ' +
                            atmoDataPoint.stationName + '</p>';
                        detailsHTML += '<button class="btn-info">' +
                            '<a href="https://fluxnet.fluxdata.org//' +
                            'data/download-data/" ' +
                            'target="_blank">Download Raw Atmosphere' +
                            ' Data (Fluxnet Account Required)</a></button>'
                        //Generate the station buttons
                        detailsHTML += graphsD.generateAtmoButtons(graphsD.atmoData,
                            graphsD.atmoDataMonthly, atmoDataPoint.stationName);

                        details.html(detailsHTML);

                        //Generate the plots
                        //Give functionality for buttons generated
                        graphsD.giveAtmoButtonsFunctionality(graphsD.atmoData,
                            graphsD.atmoDataMonthly, graphsD.refugeeData,
                            atmoDataPoint.stationName,
                            ccode3,
                            agriDataPoint);
                        console.log(graphsD.atmoData);
                        console.log(graphsD.atmoDataMonthly)
                        console.log(graphsD.refugeeData)
                        console.log(atmoDataPoint.stationName)
                        console.log(ccode3)
                        console.log(agriDataPoint)

                        let otherTab = $("#layers");
                        let otherTab2 = $("#graphs");
                        let otherTab3 = $("#country");
                        let otherTab4 = $("#comp");
                        let otherTab5 = $("#wms");
                        let otherTab6 = $("#weather");
                        let otherTab7 = $("#view");
                        details.show();
                        $('.resizable').show();
                        otherTab.hide();
                        otherTab2.hide();
                        otherTab3.hide();
                        otherTab4.hide();
                        otherTab5.hide();
                        otherTab6.hide();
                        otherTab7.hide();

                        $('.glyphicon-globe').css('color', 'white');
                        $('.fa-map').css('color', 'white');
                        $('.glyphicon-cloud').css('color', 'lightgreen');
                        $('.fa-area-chart').css('color', 'white');
                        $('.glyphicon-briefcase').css('color', 'white');
                        $('.fa-sun-o').css('color', 'white');
                        $('.glyphicon-eye-open').css('color', 'white');
                        $('.glyphicon-flag').css('color', 'white');
                    }
                }
            }
        }
    };

    let updateCOVID = async function (category, date = curDate.val()) {
        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;

        if (document.getElementById("COVID-19-checkbox") == null) {
            if(confirm("Error loading COVID selection menu. Would you like to refresh the page?(updateCOVID)")) {
                location.reload();
                return false;
            }
            console.error("Error loading COVID selection menu. (updateCOVID)");
        } else if (document.getElementById("GlobalVaccinations-checkbox") == null) {
            if(confirm("Error loading vaccination selection menu. Would you like to refresh the page?(updateCOVID)")) {
                location.reload();
                return false;
            }
            console.error("Error loading vaccination selection menu. (updateCOVID)");
        }

        if (document.getElementById("COVID-19-checkbox").checked === true) { //checks if we should turn on COVID PK or Vaccine PK

            if (date < PkStartDate.Date || date > PkEndDate.Date) { //Checks if selected date is before loaded range
                PkMidDate.Date = date; //sets middate as the date selected
                PkMidIndex = dataAll.arrDate.findIndex(x => x.Date == date); //finds index of selected date in array

                if (PkMidIndex > dataAll.arrDate.length - 1 || PkMidIndex < 0) { //checks if selected date is beyond available range
                    alert("Error loading placemarks!");
                    $('#amount').val(date);
                } else {
                    PkEndIndex = PkMidIndex + Math.floor(clientConfig.initLength / 2); //loads half of inital load range before and after (so total is still in initial load range)
                    PkStartIndex = PkMidIndex - Math.floor(clientConfig.initLength / 2);

                    if (PkEndIndex > dataAll.arrDate.length - 1) {
                        //checks if end index is out of range and resets it to the last day, start date is set so that the max number of days are loaded
                        PkEndIndex = dataAll.arrDate.length - 1;
                        PkStartIndex = PkEndIndex - clientConfig.initLength;

                        PkMidIndex = Math.floor((PkStartIndex + PkEndIndex) / 2); //updates PkMidIndex and mid date
                        PkMidDate = dataAll.arrDate[PkMidIndex];
                    } else if (PkStartIndex < 0) {
                        PkStartIndex = 0;
                        PkEndIndex = PkStartIndex + clientConfig.initLength;

                        PkMidIndex = Math.floor((PkStartIndex + PkEndIndex) / 2);
                        PkMidDate = dataAll.arrDate[PkMidIndex];
                    }

                    PkStartDate = dataAll.arrDate[PkStartIndex];
                    PkEndDate = dataAll.arrDate[PkEndIndex];
                    if (PkMidIndex < PkEndIndex && PkMidIndex > PkStartIndex) { //checks if new PkMidIndex is greater than or less than loaded range
                        await covidPK.covidPK([PkStartDate.Date, PkEndDate.Date], category, "load", date);
                    } else {
                        alert("Error! Placemarks were not loaded properly");
                    }
                }

            }
            //enables placemark based on the user properties date and type
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && elem.enabled) {
                    elem.renderables.forEach(function (d) {
                        if (d instanceof WorldWind.Placemark) {
                            if (date !== "null" && d.userProperties.Date === date) {
                                if (d.userProperties.Type == "Confirmed Cases") {
                                    numC += parseInt(d.userProperties.Number);
                                } else if (d.userProperties.Type == "Deaths") {
                                    numD += parseInt(d.userProperties.Number);
                                } else if (d.userProperties.Type == "Recoveries") {
                                    numR += parseInt(d.userProperties.Number);
                                } else if (d.userProperties.Type == "Active Cases") {
                                    numA += parseInt(d.userProperties.Number);
                                }

                                d.enabled = d.userProperties.Type === category;
                            } else if (date === "null") {
                                d.enabled = d.userProperties.Type === category;
                            } else {
                                d.enabled = false;
                            }
                        }
                    })
                }
                if (index === newGlobe.layers.length - 1) {
                    newGlobe.redraw()
                    layerManager.synchronizeLayerList();
                }
            });
            if (date !== "null") {
                if (numR == "NaN") {
                    numR = "Not Available"
                    numA = "Not Available"
                }
                $('#conConfirmed').text(numC);
                $('#conDeaths').text(numD);
                $('#conRecoveries').text(numR);
                $('#conActive').text(numA);
            }
        } else {
            alert("COVID placemarks haven't been enabled.")
        }
    }

    let updateVaccine = async function (category, date = curDate) {
        numDV = 0;
        numT = 0;
        numI = 0;
        numCV = 0;
        numDM = 0;

        //enables placemark based on the user properties date and type
        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && elem.enabled) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date === date && date !== "null") {
                            if (d.userProperties.Type == "Total Vaccinations") {
                                numT += parseInt(d.userProperties.Number);
                            } else if (d.userProperties.Type == "Incomplete Vaccinations") {
                                numI += parseInt(d.userProperties.Number);
                            } else if (d.userProperties.Type == "Completed Vaccinations") {
                                numCV += parseInt(d.userProperties.Number);
                            } else if (d.userProperties.Type == "Daily Vaccinations") {
                                numDV += parseInt(d.userProperties.Number);
                            } else if (d.userProperties.Type == "Daily Vaccinations/million") {
                                numDM += parseInt(d.userProperties.Number);
                            }

                            d.enabled = d.userProperties.Type === category;
                        } else if (date === "null") {
                            d.enabled = d.userProperties.Type === category;
                        } else {
                            d.enabled = false;
                        }
                    }
                })
            }
            if (index === newGlobe.layers.length - 1) {
                newGlobe.redraw();
                layerManager.synchronizeLayerList();
            }
        });
        if (isNaN(numT)) {
            numT = "Data Not Available"
        }
        if (isNaN(numI)) {
            numI = "Data Not Available"
        }
        if (isNaN(numCV)) {
            numCV = "Data Not Available"
        }
        if (isNaN(numDV)) {
            numDV = "Data Not Available"
        }
        if (isNaN(numDM)) {
            numDM = "Data Not Available"
        }
        $('#totVaccinations').text(numT);
        $('#incVaccinations').text(numI);
        $('#comVaccinations').text(numCV);
        $('#daiVaccinations').text(numDV);
        $('#milVaccinations').text(numDM);
    }

    //enables all layers; if layer is disabled, force enable it
    let enableAllCovid = async function () {
        // for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
        //     let layer = newGlobe.layers[i];
        //     if (layer.layerType === 'H_PKLayer') {
        //         layer.enabled = true;
        //         let layerButton = $('#' + layer.displayName + '');
        //         if (!layerButton.hasClass(active)) {
        //             layerButton.addClass(active);
        //             layerButton.css("color", "white");
        //         }
        //     }
        // }
        // layerManager.synchronizeLayerList();

        let continentVal = document.getElementById("continentList").innerText;
        continentVal = continentVal.trim().split(' ').join('_');
        console.log(continentVal)

        // if (continentVal == 'All Continents' || continentVal == "Please Select Continent") {
        //     await newGlobe.layers.forEach(function (elem, index) {
        //         if (elem instanceof WorldWind.RenderableLayer) {
        //             if (elem.layerType == "H_PKLayer") {
        //                 //elem.hide = false;
        //                 elem.enabled = true;
        //                 let layerButton = $('#' + elem.displayName + '');
        //                 if (!layerButton.hasClass(active)) {
        //                     layerButton.addClass(active);
        //                     layerButton.css("color", "white");
        //                 }
        //             }
        //         }
        //
        //         // refreshed the menu buttoms
        //         if (index === newGlobe.layers.length - 1) {
        //             //navigate the globe to the continent
        //             letLong.some(function (c) {
        //                 if (c.cont == continentVal) {
        //                     newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
        //                     return true
        //                 }
        //             });
        //
        //             layerManager.synchronizeLayerList();
        //         }
        //     })
        // } else {
        //     await newGlobe.layers.forEach(function (elem, index) {
        //         if (elem instanceof WorldWind.RenderableLayer) {
        //             if (elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
        //                 //elem.hide = false;
        //                 elem.enabled = true;
        //                 let layerButton = $('#' + elem.displayName + '');
        //                 if (!layerButton.hasClass(active)) {
        //                     layerButton.addClass(active);
        //                     layerButton.css("color", "white");
        //                 }
        //             }
        //         }
        //
        //         // refreshed the menu buttoms
        //         if (index === newGlobe.layers.length - 1) {
        //             //navigate the globe to the continent
        //             letLong.some(function (c) {
        //                 if (c.cont == continentVal) {
        //                     newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
        //                     return true
        //                 }
        //             })
        //
        //             layerManager.synchronizeLayerList();
        //         }
        //     })
        // }

        if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
                        //elem.hide = false;
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    letLong.some(function (c) {
                        if (c.cont == continentVal) {
                            newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                            return true
                        }
                    })

                    layerManager.synchronizeLayerList();
                }
            })
        } else {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "H_PKLayer") {
                        //elem.hide = false;
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    letLong.some(function (c) {
                        if (c.cont == continentVal) {
                            newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                            return true
                        }
                    })

                    layerManager.synchronizeLayerList();
                }
            });
        }
    }

    //disables all layers; if layer is enabled, force disable it
    let closeAllCovid = async function () {
        // for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
        //     let layer = newGlobe.layers[i];
        //     if (layer.layerType === 'H_PKLayer') {
        //         layer.enabled = false;
        //         let layerButton = $('#' + layer.displayName + '');
        //         if (layerButton.hasClass(active)) {
        //             layerButton.removeClass(active);
        //             layerButton.css("color", "black");
        //         }
        //     }
        // }

        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.layerType == "H_PKLayer") {
                    //elem.hide = true;
                    elem.enabled = false;
                    let layerButton = $('#' + elem.displayName + '');
                    if (layerButton.hasClass(active)) {
                        layerButton.removeClass(active);
                        layerButton.css("color", "black");
                    }
                }
            }
        })
    }

    let enableAllVaccine = async function () {
        // for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
        //     let layer = newGlobe.layers[i];
        //     if (layer.layerType === 'V_PKLayer') {
        //         layer.enabled = true;
        //         let layerButton = $('#' + layer.displayName + '');
        //         if (!layerButton.hasClass(active)) {
        //             layerButton.addClass(active);
        //             layerButton.css("color", "white");
        //
        //         }
        //     }
        // }


        let continentVal = document.getElementById("continentList").innerText;
        continentVal = continentVal.trim().split(' ').join('_');

        // if (continentVal == 'All Continents' || continentVal == "Please Select Continent") {
        //     await newGlobe.layers.forEach(function (elem, index) {
        //         if (elem instanceof WorldWind.RenderableLayer) {
        //             if (elem.layerType == "V_PKLayer") {
        //                 //elem.hide = false;
        //                 elem.enabled = true;
        //                 let layerButton = $('#' + elem.displayName + '');
        //                 if (!layerButton.hasClass(active)) {
        //                     layerButton.addClass(active);
        //                     layerButton.css("color", "white");
        //                 }
        //             }
        //         }
        //
        //         // refreshed the menu buttoms
        //         if (index === newGlobe.layers.length - 1) {
        //             //navigate the globe to the continent
        //             letLong.some(function (c) {
        //                 if (c.cont == continentVal) {
        //                     newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
        //                     return true
        //                 }
        //             })
        //
        //             layerManager.synchronizeLayerList();
        //         }
        //     })
        // } else {
        //     await newGlobe.layers.forEach(function (elem, index) {
        //         if (elem instanceof WorldWind.RenderableLayer) {
        //             if (elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
        //                 //elem.hide = false;
        //                 elem.enabled = true;
        //                 let layerButton = $('#' + elem.displayName + '');
        //                 if (!layerButton.hasClass(active)) {
        //                     layerButton.addClass(active);
        //                     layerButton.css("color", "white");
        //                 }
        //             }
        //         }
        //
        //         // refreshed the menu buttoms
        //         if (index === newGlobe.layers.length - 1) {
        //             //navigate the globe to the continent
        //             letLong.some(function (c) {
        //                 if (c.cont == continentVal) {
        //                     newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
        //                     return true
        //                 }
        //             })
        //
        //             layerManager.synchronizeLayerList();
        //         }
        //     })
        // }


        if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
                        //elem.hide = false;
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    letLong.some(function (c) {
                        if (c.cont == continentVal) {
                            newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                            return true
                        }
                    })

                    layerManager.synchronizeLayerList();
                }
            })
        } else {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "V_PKLayer") {
                        //elem.hide = false;
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    letLong.some(function (c) {
                        if (c.cont == continentVal) {
                            newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                            return true
                        }
                    })

                    layerManager.synchronizeLayerList();
                }
            });
        }
    }

    let closeAllVaccine = async function () {
        // for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
        //     let layer = newGlobe.layers[i];
        //     if (layer.layerType === 'V_PKLayer') {
        //         layer.enabled = false;
        //         // console.log(layer);
        //         let layerButton = $('#' + layer.displayName + '');
        //         if (layerButton.hasClass(active)) {
        //             layerButton.removeClass(active);
        //             layerButton.css("color", "black");
        //         }
        //     }
        // }

        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.layerType == "V_PKLayer") {
                    //elem.hide = true;
                    elem.enabled = false;
                    let layerButton = $('#' + elem.displayName + '');
                    if (layerButton.hasClass(active)) {
                        layerButton.removeClass(active);
                        layerButton.css("color", "black");
                    }
                }
            }
        })
    }

    return {
        // initCaseNum,
        subDropdown,
        updateFrom,
        updateTo,
        updateCurr,
        // onDiseaseClick,
        // onAgrosphereClick,
        onCategory,
        onCategoryV,
        onContinent,
        onNav,
        timelapse,
        // pause,
        clearI,
        updateHIS,
        // onFrom,
        infectionSlider,
        opacitySlider,
        dateSlider,
        rangeSlider,
        edit,
        fullLoad,
        filterOptionDialog,
        editDialog,
        handleMouseCLK,
        handleMouseMove,
        enableAllCovid,
        closeAllCovid,
        enableAllVaccine,
        closeAllVaccine,
        createFirstLayer,
        createSecondLayer,
        createThirdLayer,
        createThirdLayers,
        createFourthLayer,
        covid19,
        influenza,
        handlePick,
        updateCOVID,
        updateVaccine
        // play

    }
})