define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    // , './covidPK'
    , './newcovidPK'
    // , './vaccinePK'
    , './vaccinePK_v3'
    , './graphsData'
    , '../config/clientConfig.js'
    , './slider'
    ,'./update'
    ,'./Error'
    , 'menu'

], function (newGlobe, dataAll, csvD, LayerManager, covidPK, vaccinePK, graphsD, clientConfig, slider,Update,ErrorReturn) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);
    let categoryS = "Confirmed Cases";
    let categoryV = "Total Vaccinations";

    let curDate = $("#currentdatepicker"); //The current date of the date slider
    let COVIDcheckbox = document.getElementById("COVID-19-checkbox");
    let vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
    let COVIDcategory;

    let active = "active";


    const latLong = [
        {cont: 'North America', lat: 40.7306, long: -73.9352},
        {cont: 'South America', lat: -14.235, long: -51.9253},
        {cont: 'Asia', lat: 30.9756, long: 112.2707},
        {cont: 'Europe', lat: 51, long: 9},
        {cont: 'Africa', lat: 9.082, long: 8.6753},
        {cont: 'Oceania', lat: -37.8136, long: 144.9631},
        {cont: 'All Continents', lat: 30.9756, long: 112.2707},
        {cont: 'Please Select Continent', lat: 30.9756, long: 112.2707}
    ];

    const contVal = ["North_America", "Europe", "South_America", "Asia", "Africa", "Oceania"];  //Stores continent values that have no spaces (like in the table?)

    if (clientConfig == null) {
        ErrorReturn("placemarks and layers", "controls" , true);
    }

    //overlays sub dropdown menus over other items
    let subDropdown = function () { //Seems like an unused function to me
        $(".dropdown").on("show.bs.dropdown", function () {
            let $btnDropDown = $(this).find(".dropdown-toggle");
            let $listHolder = $(this).find(".dropdown-menu");
            let subMenu = $(this).find(".dropdown-submenu");
            let subMenu2 = subMenu.find(".dropdown-menu");
            //reset position property for DD container
            $(this).css("position", "relative");
            $listHolder.css({
                // "top": ($btnDropDown.offset().top + $btnDropDown.outerHeight(true)) + "px",
                "left": $btnDropDown.offset().left + "px"
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
    }

    //under first left tab; activates Influenza A display when selected for Disease Projection
    let influenza = function () { //Unused function here.... where is the influenza data?
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName.trim() + '');
            if (layer.layerType === "INA_PKLayer") {
                layer.enabled = !layer.enabled;
                if (!layer.enabled) {
                    layerButton.removeClass(active);
                    layerButton.css("color", "black");
                } else {
                    layer.enabled = false;
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

    //under second left tab, second dropdown menu; used to display layers filtered by cases, deaths, and recoveries
    let onCategory = async function (event, cat = "none") {
        if (cat === "none") {
            //grab the category selection value
            categoryS = event.target.innerText.trim() || event.target.innerHTML.trim();
        } else {
            categoryS = cat;
        }
        let continentVal = document.getElementById("continentList").innerText.trim().split(' ').join('_'); //obtain continent value

        if (!contVal.includes(continentVal)) {continentVal="none";}

        //refresh the option display
        $("#categoryList").find("button").html(categoryS + ' <span class="caret"></span>'); //updates button title
        $("#titleCategory").text(categoryS + " Filter (Lowest - Highest)"); //Updates infection sldier title

        //reset the button background color according to selection
        if (categoryS === "Confirmed Cases") {
            $("#categoryList").find("button").css("background-color", "red");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("conC").target != "active") {
                document.querySelector('#conC').dispatchEvent(new CustomEvent('click')); //Click on the corresponding case number
            }
        } else if (categoryS === "Deaths") {
            $("#categoryList").find("button").css("background-color", "black");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("conD").target != "active") {
                document.querySelector('#conD').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryS === "Recoveries") {
            $("#categoryList").find("button").css("background-color", "#7cfc00");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("conR").target != "active") {
                document.querySelector('#conR').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryS === "Active Cases") {
            $("#categoryList").find("button").css("background-color", "#F9910A");

            if (document.getElementById("graphs").style.display == "block" && document.getElementById("conA").target != "active") {
                document.querySelector('#conA').dispatchEvent(new CustomEvent('click'));
            }
        }
        // Update.updateCOVID(categoryS);

        //Obtain loaded placemarks start date and end date
        let PkStartDate = sessionStorage.getItem('COVIDstartDate'); //Obtain loaded placemarks start date and end date
        let PkEndDate = sessionStorage.getItem('COVIDendDate');
        covidPK.covidPK([PkStartDate,PkEndDate],categoryS,"category", curDate.val(),continentVal);


        // newGlobe.layers.forEach(function (elem, index) {
            // //Method 1
            // if (elem.layerType == "H_PKLayer") {
            //    covidPK.redrawPK([PkStartDate, PkEndDate] ,categoryS, elem.renderables);
            //     // elem.renderables = covidPK.redrawPK([PkStartDate, PkEndDate] ,categoryS, elem.renderables);
            // }
            // if (index == newGlobe.layers.length - 1) {
            //     newGlobe.redraw();
            //     console.log(newGlobe.layers);
            // }

            // //Method 2
            // if (elem.layerType == "H_PKLayer") {
            //     let newRenderables = covidPK.redrawPK([PkStartDate, PkEndDate] ,categoryS, elem.renderables);
            //     elem.removeAllRenderables();
            //     elem.addRenderables(newRenderables);
            //     // elem.renderables = covidPK.redrawPK([PkStartDate, PkEndDate] ,categoryS, elem.renderables);
            // }
            // if (index == newGlobe.layers.length - 1) {
            //     newGlobe.redraw();
            //     console.log(newGlobe.layers);
            // }
        // });

        //Method 3
        // covidPK.redrawPK([PkStartDate, PkEndDate], categoryS);
    };

    let onCategoryV = async function (event, cat = "none") {
        if (cat === "none") {
            //grab the selection value
            categoryV = event.target.innerText.trim() || event.target.innerHTML.trim();
        } else {
            categoryV = cat;
        }

        let continentVal = document.getElementById("continentList").innerText.trim().split(' ').join('_'); //obtain continent value
        if (!contVal.includes(continentVal)) {continentVal="All Continents";}

        //refresh the option display
        $("#categoryListVaccinations").find("button").html(categoryV + ' <span class="caret"></span>');
        $("#titleCategory").text(categoryV + " Filter (Lowest - Highest)");

        //reset the button background color according to selection
        if (categoryV === "Total Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#4dffff");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("totV").target != "active") {
                document.querySelector('#totV').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryV === "Incomplete Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#ff8100");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("incV").target != "active") {
                document.querySelector('#incV').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryV === "Completed Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#8C8189");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("comV").target != "active") {
                document.querySelector('#comV').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryV === "Daily Vaccinations") {
            $("#categoryListVaccinations").find("button").css("background-color", "#00ff00");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("daiV").target != "active") {
                document.querySelector('#daiV').dispatchEvent(new CustomEvent('click'));
            }
        } else if (categoryV === "Daily Vaccinations/million") {
            $("#categoryListVaccinations").find("button").css("background-color", "#801C8C");
            if (document.getElementById("graphs").style.display == "block" && document.getElementById("milV").target != "active") {
                document.querySelector('#milV').dispatchEvent(new CustomEvent('click'));
            }
        }
        Update.updateVaccine(categoryV, continentVal, [], curDate.val());
    }
    //under second left tab, third dropdown menu; used to display all countries/layers in that continent
    let onContinent = async function (event,contin="none") {

        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox =  document.getElementById("GlobalVaccinations-checkbox");

        if (COVIDcheckbox == null) {
            ErrorReturn("COVID selection", "onContinent" , true);
        } else if (vaccCheckbox == null) {
            ErrorReturn("vaccination selection", "onContinent" , true);
        }

        let continentS;
        let inactiveID = [];
        let notActiveLayers = $('#layerList').find("button[style='color: rgb(0, 0, 0);']")
            .not("button[class='active']").toArray();  //Finds all the buttons that have been switched off
        let prevCont = $("#continentButton").text().trim(); //This is the continent prior to the user's click
        let layerList;
        let curLayerList = []; //This will be the variable that accesses inactive layers from the session storage for the newly selected continent

        if (event === "none" && contin !== "none") {
             continentS = contin.trim();
        } else {
            //grab the continent value when selected by user.
             continentS = event.target.innerText.trim() || event.target.innerHTML.trim();
        }

        //gets the layer list (which stores inactive layers) from session storage
        if (COVIDcheckbox.checked === true) {
            layerList = JSON.parse(sessionStorage.getItem('COVIDLayerList')); //session storage can only store string values, so we need to parse the JSON object
        } else if (vaccCheckbox.checked === true) {
            layerList = JSON.parse(sessionStorage.getItem('vaccLayerList'));
        }

        for (let i = 0; i < notActiveLayers.length; i++) {
            inactiveID.push(notActiveLayers[i].id); //Push the IDs which are also the layer displayNames into the array
        }

        layerList[prevCont] = inactiveID; //The array is pushed into a JSON object for the continent (prior to change)


        let savedCont = Object.keys(layerList); //The keys of the JSON object, or all the continent keys in there
        //remove underscore
        let continentNOspace = continentS.split(' ').join('_');

        if (savedCont.includes(continentS)) { //If the continent's layer settings have been saved in the session storage (or if the continent appears in the keys of the JSON object)
            curLayerList = layerList[continentS]; //Assign the list of layers to curLayerList so we know which ones to enable
        }

        //refresh the option display
        // let sortLayers = 0;
        if (COVIDcheckbox.checked === true) {
            sessionStorage.setItem('COVIDLayerList', JSON.stringify(layerList)); //Stringfy JSON object then push to session storage (session storage can only store key value pairs composed of strings
            COVIDcategory = document.getElementById("COVID-category").innerText.trim();
            if (contVal.includes(continentNOspace)) {
                //This means that a specific continent (not all continents) has been selected
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer" && !curLayerList.includes(elem.displayName.trim())) {
                        //Enables layers if they are of the same continent
                        let cont = String(elem.continent).trim();
                        let contNOspace = cont.split(' ').join('_');
                        if (contNOspace === continentNOspace || cont === continentS) {
                            elem.enabled = true;
                        } else {
                            elem.enabled = false;
                        }
                    }

                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        latLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000)); //Go to specific location
                                return true
                            }
                        });
                        Update.updateCOVID(COVIDcategory, continentNOspace, curLayerList);
                        // we don't call synchronizeLayerList here because updateCOVID will do that for us
                    }
                });
            } else {
                //This means that all continents need to be enabled
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == 'H_PKLayer' && !curLayerList.includes(elem.displayName.trim())) {
                        //Enables all COVID layers 
                        elem.enabled = true;
                    }
                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        latLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        });
                        Update.updateCOVID(COVIDcategory,"All Continents", curLayerList);
                        // we don't call synchronizeLayerList here because updateCOVID will do that for us
                    }
                });
            }

        } else if (vaccCheckbox.checked === true) {
            sessionStorage.setItem('vaccLayerList', JSON.stringify(layerList)); //Stringfy JSON object then push to session storage (session storage can only store key value pairs composed of strings
            let vaccCategory = document.getElementById("vaccine-category").innerText.trim();
            if (contVal.includes(continentNOspace)) {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "V_PKLayer" && !curLayerList.includes(elem.displayName.trim())) {
                        let cont = String(elem.continent).trim();
                        let contNOspace = cont.split(' ').join('_');
                        if (contNOspace === continentNOspace || cont === continentS) {
                            elem.enabled = true;
                        } else {
                            elem.enabled = false;
                        }
                    }

                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        latLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        });
                        Update.updateVaccine(vaccCategory, continentNOspace, curLayerList);
                        // we don't call synchronizeLayerList here because updateVaccine will do that for us
                    }
                });
            } else {
                await newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer && elem.layerType == 'V_PKLayer' && !curLayerList.includes(elem.displayName.trim())) {
                        elem.enabled = true;
                    }
                    // refreshed the menu buttoms
                    if (index === newGlobe.layers.length - 1) {
                        //navigate the globe to the continent
                        latLong.some(function (c) {
                            if (c.cont == continentS) {
                                newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                                return true
                            }
                        });
                        Update.updateVaccine(vaccCategory, "All Continents", curLayerList);
                        // we don't call synchronizeLayerList here because updateVaccine will do that for us
                    }
                });
            }
        }


        $("#continentList").find("button").html(continentS + ' <span class="caret"></span>');
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

    //enables all layers; if layer is disabled, force enable it
    let enableAllCovid = async function () {

        let continentVal = document.getElementById("continentList").innerText;
        continentVal = continentVal.trim().split(' ').join('_');

        if (contVal.includes(continentVal)) { //If continent is not all continents (and is a specific continent)
        // if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "H_PKLayer" && elem.continent == continentVal) {
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName.trim() + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");

                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    latLong.some(function (c) {
                        if (c.cont == continentVal) {
                            newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                            return true
                        }
                    })

                    layerManager.synchronizeLayerList();

                }
            })
        } else { //This means that it's all continents
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "H_PKLayer") {
                        //elem.hide = false;
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName.trim() + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    latLong.some(function (c) {
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

        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.layerType == "H_PKLayer") {
                    //elem.hide = true;
                    elem.enabled = false;
                    let layerButton = $('#' + elem.displayName.trim() + '');
                    if (layerButton.hasClass(active)) {
                        layerButton.removeClass(active);
                        layerButton.css("color", "black");
                    }
                }
            }
        })

    }

    let enableAllVaccine = async function () {

        let continentVal = document.getElementById("continentList").innerText.trim();
        continentVal = continentVal.trim().split(' ').join('_');

        if (contVal.includes(continentVal)) {
        // if (continentVal == "North_America" || continentVal == "Europe" || continentVal == "South_America" || continentVal == "Asia" || continentVal == "Africa" || continentVal == "Oceania") {
            await newGlobe.layers.forEach(function (elem, index) {
                if (elem instanceof WorldWind.RenderableLayer) {
                    if (elem.layerType == "V_PKLayer" && elem.continent == continentVal) {
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName.trim() + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");

                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    latLong.some(function (c) {
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
                        elem.enabled = true;
                        let layerButton = $('#' + elem.displayName.trim() + '');
                        if (!layerButton.hasClass(active)) {
                            layerButton.addClass(active);
                            layerButton.css("color", "white");
                        }
                    }
                }

                // refreshed the menu buttoms
                if (index === newGlobe.layers.length - 1) {
                    //navigate the globe to the continent
                    latLong.some(function (c) {
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
        await newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.layerType == "V_PKLayer") {
                    //elem.hide = true;
                    elem.enabled = false;
                    let layerButton = $('#' + elem.displayName.trim() + '');
                    if (layerButton.hasClass(active)) {
                        layerButton.removeClass(active);
                        layerButton.css("color", "black");
                    }
                }
            }
        });
    }

    return {
        subDropdown,
        onCategory,
        onCategoryV,
        onContinent,
        onNav,
        enableAllCovid,
        closeAllCovid,
        enableAllVaccine,
        closeAllVaccine,
        influenza
    }
})