requirejs([
    'controls'
], function (controls) {
    "use strict";

    const firstL = ['Disease Projection', 'Food Security']
    const diseasesecondL = ["COVID-19", "Influenza A", "Influenza B"];
    const foodsecondL = ["Agrosphere", "ECMWF Forecasts", "Sentinel Satellite Data"]
    const thirdL = ["Country", "Weather"]

    const influenzaA = [
        "H1N1", "H2N2", "H3N2", "H5N1", "H7N7",
        "H1N2", "H9N2", "H7N2", "H7N3", "H10N7",
        "H7N9", "H6N1", "Not Determined"
    ];
    const influenzaB = [
        "Yamagata",
        "Victoria",
        "Not Determined"
    ];
    const covid19M = [
        "COVID-19",
        "Global Vaccinations"
    ];
    const ecmwf_forecasts = ["Temperature", "Precipitation", "Wind"]
    const parentMenu = document.getElementById("accordion");

    const satellite_data = [
        "Moisture Index",
        "NDVI",
        "NDMI",
        "NDWI",
        "SWIR",
        "Agriculture",
        "False Color (Urban)",
        "False Color (Vegetation)",
        "Natural Color (True Color)",
        "Geology"
    ]
    const NDMI = ['Covid19_SH:ET_NDMI_Sent2_L1C']
    const NDVI = ["Covid19_SH:ET_NDVI2",'Covid19_SH:ET_NDVI_Sent2_L1C']
    const NDWI = ["Covid19_SH:ET_NDWI_Sent3_OLCI"]
    const MI = ["Covid19_SH:ET_M1"]
    const SWIR = ["Covid19_SH:ET_SWIR_Sent2_L1C"]

        // Initially load accordion menu
        for (let i = 0; i < firstL.length; i++) {
            createFirstLayer(firstL[i]);
            if (firstL[i] === 'Disease Projection') {
                for (let j = 0; j < diseasesecondL.length; j++) {
                    createSecondLayer(firstL[i], diseasesecondL[j]);
                    if (diseasesecondL[j] === "Influenza A") {
                        for (let h = 0; h < influenzaA.length; h++) {
                            createThirdLayer(firstL[i], diseasesecondL[j], influenzaA[h]);
                            // controls.influenza();
                        }
                    } else if (diseasesecondL[j] === "Influenza B") {
                        for (let h = 0; h < influenzaB.length; h++) {
                            createThirdLayer(firstL[i], diseasesecondL[j], influenzaB[h]);
                        }
                    } else if (diseasesecondL[j] === "COVID-19") {
                        for (let h = 0; h < covid19M.length; h++) {
                            createThirdLayer(firstL[i], diseasesecondL[j], covid19M[h]);
                        }
                    } else {
                        alert('Error! Some disease trends layers might not have been created properly. ');
                    }
                }
            } else if (firstL[i] === 'Food Security') {
                for (let j = 0; j < foodsecondL.length; j++) {
                    createSecondLayer(firstL[i], foodsecondL[j]);
                    if (foodsecondL[j] === 'Agrosphere') {
                        for (let h = 0; h < thirdL.length; h++) {

                            createThirdLayer(firstL[i], foodsecondL[j], thirdL[h]);
                            if (thirdL[h] != "Country" && thirdL[h] != "Weather") {
                                alert('Error! Some Agrosphere layers might not have been created properly.');
                                console.error()
                                // throw error
                            }
                        }
                    } else if (foodsecondL[j] === 'ECMWF Forecasts') {
                        for (let h = 0; h < ecmwf_forecasts.length; h++) {
                            createThirdLayer(firstL[i], foodsecondL[j], ecmwf_forecasts[h]);
                        }
                    } else if (foodsecondL[j] === 'Sentinel Satellite Data') {
                        for (let h = 0; h < satellite_data.length; h++) {

                            createThirdLayers(firstL[i], foodsecondL[j], satellite_data[h]);
                            if (satellite_data[h] === "Moisture Index") {
                                for (let k = 0; k <MI.length; k++) {
                                    createFourthLayer(firstL[i],foodsecondL[j], satellite_data[h],MI[k]);
                                }
                            } else if (satellite_data[h] === "SWIR") {
                                for (let k = 0; k < SWIR.length; k++) {
                                    createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], SWIR[k]);
                                }
                            } else if (satellite_data[h] === "NDWI") {
                                for (let k = 0; k < NDWI.length; k++) {
                                    createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDWI[k]);
                                }
                            } else if (satellite_data[h] === "NDMI") {
                                for (let k = 0; k < NDMI.length; k++) {
                                    createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDMI[k]);
                                }
                            } else if (satellite_data[h] === "NDVI") {
                                for (let k = 0; k < NDVI.length; k++) {
                                    createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDVI[k]);
                                }
                            }
                        }
                    } else {
                        // throw error
                        console.log('Error! Some layers might not have been created properly. ');
                    }
                }
            } else {
                // throw error
                console.log('Error! Some layers might not have been created properly. ');
            }
        }

    function createFirstLayer(FirstL) {
        //Removes trailing/leading whitespaces
        FirstL = FirstL.trim();

        let firstL = FirstL.replace(/\s+/g, '');

        let panelDefault1 = document.createElement("div");
        panelDefault1.className = "Menu panel panel-info " + firstL;

        let panelHeading1 = document.createElement("div");
        panelHeading1.className = "panel-heading";
        let panelTitle1 = document.createElement("h4");
        panelTitle1.className = "panel-title";

        let collapsed1 = document.createElement("a");
        collapsed1.setAttribute("data-toggle", "collapse");
        collapsed1.setAttribute("data-parent", "#accordion");
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
    }

    function createSecondLayer(FirstL, SecondL) {

        //Removes trailing/leading whitespaces
        SecondL = SecondL.trim();

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

        document.getElementById("nested-" + firstL).appendChild(panelDefault2);
    }

    function createThirdLayers(FirstL, SecondL, ThirdL) {

        //Removes trailing/leading whitespaces
        SecondL = SecondL.trim();

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
            collapsed3.className = "collapsed";
            collapsed3.href = "#" + firstL + "-" + secondL + "-" + thirdL;
            collapsed3.setAttribute("data-toggle", "collapse");
            collapsed3.setAttribute("data-parent", "#nested");
            panelDefault3.className = "Menu panel panel-info " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        } else if (SecondL === "Sentinel Satellite Data") {
            collapsed3.className = "collapsed disabled-link";
            panelDefault3.className = "Menu panel disabled-menu " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        } else {
            collapsed3.className = "collapsed";
            panelDefault3.className = "Menu panel panel-info " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;
        }
        collapsed3.id = firstL + "-" + secondL + "-" + thirdL + '-a';
        collapsed3.className = firstL + "-" + secondL + "-atags"

        let thirdLayerName = document.createTextNode(ThirdL + "  ");
        thirdLayerName.className = "menuwords";

        let checkboxDiv = document.createElement("div");
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
            panelDefault3.appendChild(nested1c1);
            nested1c1.appendChild(panelBody4);
        }
        if (SecondL !== "Sentinel Satellite Data") {
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxDiv.appendChild(checkboxLabel);
        }
        document.getElementById(firstL + "--" + secondL).appendChild(panelDefault3);
    }

    function createThirdLayer(FirstL, SecondL, ThirdL) {
        //Removes trailing/leading whitespaces
        ThirdL = ThirdL.trim();

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

        let checkboxAt = document.createTextNode(ThirdL);
        checkboxA.className = "menuWords";
        idname = thirdL;
        checkboxA.id = idname + '-atag';
        checkboxInput.value = ThirdL;
        checkboxInput.id = idname + '-checkbox';

        checkboxA.appendChild(checkboxAt);
        checkboxH4.appendChild(checkboxA);
        checkboxLabel.appendChild(checkboxInput);
        checkboxLabel.appendChild(checkboxSpan);
        checkboxH4.appendChild(checkboxLabel);
        checkboxDiv.appendChild(checkboxH4);

        document.getElementById(firstL + "--" + secondL).appendChild(checkboxDiv);
    }

    function createFourthLayer(FirstL, SecondL, ThirdL, FourthL = 'none') {
        //Removes trailing/leading whitespaces
        FourthL= FourthL.trim()

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
            checkboxInput.className = "input" + " input-" + thirdL + " " + secondL + "-checkbox";
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

            checkboxA.appendChild(checkboxAt);
            checkboxH4.appendChild(checkboxA);
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxH4.appendChild(checkboxLabel);
            checkboxDiv.appendChild(checkboxH4);

            document.getElementById(firstL + "--" + secondL + "--" + thirdL).appendChild(checkboxDiv);


        } else {
            alert('Error!');
        }

    }

});