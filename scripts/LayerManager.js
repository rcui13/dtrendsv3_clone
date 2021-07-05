/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports LayerManager
 */
define([
    './WorldWindShim',
    './dataAll'

], function (WorldWind , dataAll) {
    "use strict";

    /**
     * Constructs a layer manager for a specified {@link WorldWindow}.
     * @alias LayerManager
     * @constructor
     * @classdesc Provides a layer manager to interactively control layer visibility for a World Window.
     * @param {WorldWindow} WorldWindow The World Window to associated this layer manager with.
     */

    let worldWin;
    let LayerManager = function (WorldWindow) {
        let thisExplorer = this;

        this.wwd = WorldWindow;
        worldWin = WorldWindow;

        this.roundGlobe = this.wwd.globe;

        // this.createProjectionList();
        // $("#projectionDropdown").find(" li").on("click", function (e) {
        //     thisExplorer.onProjectionClick(e);
        // });
        //
        // this.diseaseList();
        //
        // this.agrosList();
        //
        //
        // this.synchronizeLayerList();
        //
        // this.continentList();
        //
        // this.categoryList();

        $("#searchBox").find("button").on("click", function (e) {
            thisExplorer.onSearchButton(e);
        });

        this.geocoder = new WorldWind.NominatimGeocoder();
        this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
        $("#searchText").on("keypress", function (e) {
            thisExplorer.onSearchTextKeyPress($(this), e);
        });

        //
        //this.wwd.redrawCallbacks.push(function (WorldWindow, stage) {
        //    if (stage == WorldWind.AFTER_REDRAW) {
        //        thisExplorer.updateVisibilityState(WorldWindow);
        //    }
        //});
    };
    let covidVal;
    let covidNums = [
        $('#conConfirmed'),
        $('#conDeaths'),
        $('#conRecoveries'),
        $('#conActive'),
    ];
    let covidType = [
        "Confirmed Cases",
        "Deaths",
        "Recoveries",
        "Active Cases",
    ];

    let vaccVal;
    let vaccNums = [
        $('#totVaccinations'),
        $('#incVaccinations'),
        $('#comVaccinations'),
        $('#daiVaccinations'),
        $('#milVaccinations'),
    ];
    let vaccType = [
        "Total Vaccinations",
        "Incomplete Vaccinations",
        "Completed Vaccinations",
        "Daily Vaccinations",
        "Daily Vaccinations/million",
    ];

    LayerManager.prototype.onProjectionClick = function (event) {
        let projectionName = event.target.innerText.trim() || event.target.innerHTML.trim();
        $("#projectionDropdown").find("button").html(projectionName + ' <span class="caret"></span>');

        if (projectionName === "3D") {
            if (!this.roundGlobe) {
                this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
            }

            if (this.wwd.globe !== this.roundGlobe) {
                this.wwd.globe = this.roundGlobe;
            }
        } else {
            if (!this.flatGlobe) {
                this.flatGlobe = new WorldWind.Globe2D();
            }

            if (projectionName === "Equirectangular") {
                this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
            } else if (projectionName === "Mercator") {
                this.flatGlobe.projection = new WorldWind.ProjectionMercator();
            }

            if (this.wwd.globe !== this.flatGlobe) {
                this.wwd.globe = this.flatGlobe;
            }
        }

        this.wwd.redraw();
    };

    LayerManager.prototype.onLayerClick = function (layerButton) {
        // Update the layer state for the selected layer.
        let layerName = layerButton.text();
        layerName = layerName.replace(" ", "_");
        let layers = this.wwd.layers;
        const a = layers.findIndex(ele => ele.displayName.trim() === layerName);
        const b = layers.findIndex((ele, index) => index >= (layers.length - dataAll.arrVCountries.length) && ele.displayName.trim() === layerName);
        if (!layers[a].hide || !layers[b].hide) {
            if (document.getElementById("vaccine-category").disabled === true) {
                // console.log("covid category true");
                // const d = layers[a].renderables.filter(ele => ele.userProperties.Date == $("#currentdatepicker").val());
                const d = layers[a].renderables.findIndex(ele => ele.userProperties.Date == $("#currentdatepicker").val());
                // console.log(d)
                // console.log(d)
                if (layers[a].displayName.trim() === layerName && layers[a].layerType === "H_PKLayer") {
                    layers[a].enabled = !layers[a].enabled;
                    // layers[a].hide = !layers[a].hide;

                    // $.ajax({
                    //     url: '/rr',
                    //     type: 'GET',
                    //     data: {country: layerName},
                    //     dataType: 'json',
                    //     async: false,
                    //     success: function (res) {
                    //         if (!res.error) {
                    //             // console.log(res.data[0].Latitude)
                    //             worldWin.goTo(new WorldWind.Position(res.data[0].Latitude, res.data[0].Longitude, 14000000));
                    //         }
                    //     }
                    // });
                    // console.log(layers[a].renderables)
                    // console.log(layers[a].renderables[layers[a].renderables.length /2])
                    // worldWin.goTo(new WorldWind.Position(layers[a].renderables[layers[a].renderables.length /2].position.latitude, layers[a].renderables[layers[a].renderables.length /2].position.longitude, 14000000));
                    worldWin.goTo(new WorldWind.Position(layers[a].renderables[0].position.latitude, layers[a].renderables[0].position.longitude, 14000000));

                }
                if (layers[a].enabled) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                    // let layerList = sessionStorage.getItem("layerList");
                    // if (layerList == null ) {
                    //     // sessionStorage.setItem("layerList") = [layerButton.text()];
                    //
                    // }
                    // const d = layers[a].renderables.filter(ele => ele.userProperties.Date == $("#currentdatepicker").val());
                    // console.log(d)
                    // for (let i = 0; i < covidType.length; i++) {
                    //     covidVal = 0;
                    //     const dType = d.filter(ele => ele.userProperties.Type == covidType[i]);
                    //     dType.forEach(function (elem, j) {
                    //         covidVal += dType[j].userProperties.Number;
                    //     })
                    //     // console.log(covidVal);
                    //     // console.log(dType)
                    //     covidNums[i].text(parseInt(covidNums[i].text()) + covidVal);
                    // }
                } else {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                    // console.log("remove class active")
                    // console.log($("#currentdatepicker").val())
                    // const c = layers[a].renderables.findIndex(ele => ele.userProperties.Date == $("#currentdatepicker").val() && ele.userProperties.Type == "Deaths")
                    // console.log(d)
                    // for (let i = 0; i < covidType.length; i++) {
                    //     covidVal = 0;
                    //     const dType = d.filter(ele => ele.userProperties.Type == covidType[i]);
                    //     dType.forEach(function (elem, j) {
                    //         covidVal += dType[j].userProperties.Number;
                    //     })
                    //     // console.log(covidVal);
                    //     // console.log(dType)
                    //     covidNums[i].text(parseInt(covidNums[i].text()) - covidVal);
                    // }


                    // d.forEach(function(elem, dNum) {
                    //     console.log(dNum)
                    //     ;
                    //     covidNums[dNum].text(covidVal);
                    // });

                    // console.log(c)
                    // console.log(parseInt($('#conDeaths').text()) - layers[a].renderables[c].userProperties.Number);
                    // $('#conDeaths').text(numD);
                    // $('#conRecoveries').text(numR);
                    // $('#conActive').text(numA);

                }
                // for (let i = 0; i < covidType.length; i++) {
                    // const dType = d.filter(ele => ele.userProperties.Type == covidType[i]);
                    // covidType.forEach(function (elem, j) {
                    //     covidVal += dType[j].userProperties.Number;
                    // })
                    covidNums.forEach(function (elem, i) {
                        covidVal = 0;
                        if (i == 0) {
                            covidVal += layers[a].renderables[d].userProperties["Confirmed Cases"];
                        } else if (i == 1) {
                            covidVal += layers[a].renderables[d].userProperties.Deaths;
                        } else if (i == 2) {
                            covidVal += layers[a].renderables[d].userProperties.Recoveries;
                        } else {
                            covidVal += layers[a].renderables[d].userProperties["Active Cases"];
                        }

                        if (layers[a].enabled){
                            covidNums[i].text(parseInt(covidNums[i].text()) + covidVal);
                        } else {
                            covidNums[i].text(parseInt(covidNums[i].text()) - covidVal);
                        }
                    })

                // }


            } else if (document.getElementById("COVID-category").disabled === true) {
                const e = layers[b].renderables.filter(ele => ele.userProperties.Date == $("#currentdatepicker").val());
                // const f = layers[b].renderables.findIndex(ele => ele.userProperties.Date == $("#currentdatepicker").val());
                if (layers[b].displayName.trim() === layerName && layers[b].layerType === "V_PKLayer") {
                    layers[b].enabled = !layers[b].enabled;
                    // $.ajax({
                    //     url: '/rr',
                    //     type: 'GET',
                    //     data: {country: layerName},
                    //     dataType: 'json',
                    //     async: false,
                    //     success: function (res) {
                    //         if (!res.error) {
                    //             // console.log(res.data[0])
                    //             worldWin.goTo(new WorldWind.Position(res.data[0].Latitude, res.data[0].Longitude, 14000000));
                    //         }
                    //     }
                    // });

                    worldWin.goTo(new WorldWind.Position(layers[b].renderables[0].position.latitude, layers[b].renderables[0].position.longitude, 14000000));
                }
                        if (layers[b].enabled) {
                            layerButton.addClass("active");
                            layerButton.css("color", "white");
                        } else {
                            layerButton.removeClass("active");
                            layerButton.css("color", "black");
                        }

                    for (let i = 0; i < vaccType.length; i++) {
                        vaccVal = 0;
                        const eType = e.filter(ele => ele.userProperties.Type == vaccType[i]);
                        eType.forEach(function (elem, j) {
                            vaccVal += eType[j].userProperties.Number;
                        })
                        if (layers[b].enabled){
                            vaccNums[i].text(parseInt(vaccNums[i].text()) + vaccVal);
                        } else {
                            vaccNums[i].text(parseInt(vaccNums[i].text()) - vaccVal);
                        }
                    }
                // vaccNums.forEach(function (elem, i) {
                //     vaccVal = 0;
                //     if (i == 0) {
                //         vaccVal += layers[b].renderables[f].userProperties["Total Vaccinations"];
                //     } else if (i == 1) {
                //         vaccVal += layers[b].renderables[f].userProperties["Incomplete Vaccinations"];
                //     } else if (i == 2) {
                //         vaccVal += layers[b].renderables[f].userProperties["Completed Vaccinatinos"];
                //     } else if (i == 3) {
                //         vaccVal += layers[b].renderables[f].userProperties["Daily Vaccinations"];
                //     } else {
                //         vaccVal += layers[b].renderables[f].userProperties["Daily Vaccinations/million"]
                //     }
                //
                //     if (layers[b].enabled){
                //         vaccNums[i].text(parseInt(vaccNums[i].text()) + vaccVal);
                //     } else {
                //         vaccNums[i].text(parseInt(vaccNums[i].text()) - vaccVal);
                //     }
                // })
                }



            // if (layers[a].displayName === layerName && layers[a].layerType === "H_PKLayer") {
            //     layers[a].enabled = !layers[a].enabled;
            //     $.ajax({
            //         url: '/rr',
            //         type: 'GET',
            //         data: {country: layerName},
            //         dataType: 'json',
            //         async: false,
            //         success: function (res) {
            //             if (!res.error) {
            //                 // console.log(res.data[0].Latitude)
            //                 worldWin.goTo(new WorldWind.Position(res.data[0].Latitude, res.data[0].Longitude, 14000000));
            //
            //             }
            //
            //         }
            //     })
                // this.wwd.goTo(new WorldWind.Position(layers[a].renderables[0].position.latitude, layers[a].renderables[0].position.longitude, 14000000));
                // if (layers[a].enabled) {
                //     layerButton.addClass("active");
                //     layerButton.css("color", "white");
                // } else if (layers[b].enabled) {
                //     layerButton.addClass("active");
                //     layerButton.css("color", "white");
                // } else {
                //     layerButton.removeClass("active");
                //     layerButton.css("color", "black");
                // }
                this.wwd.redraw();
        }
    };

    LayerManager.prototype.synchronizeLayerList = function (exceptions="none") {
        // console.log(exceptions)
        let layerListItem = $("#layerList");
        let filterLayerList = $("#filterCountries");
        let noSpaceLayerName;
        let spaceLayerName;
        // console.log("synchronize")
        layerListItem.find("button").off("click");
        layerListItem.find("button").remove();
        filterLayerList.find("option").not("option[value='all_countries']").remove();

        // Synchronize the displayed layer list with the World Window's layer list.
        for (let i = 6, len = this.wwd.layers.length; i < len; i++) {
            let layer = this.wwd.layers[i];
            if (layer.enabled === false && !exceptions.includes(layer.displayName.trim())) {
                continue;
            }

            if (layer.displayName.trim().includes(' ')) {
                noSpaceLayerName = layer.displayName.trim().replace(/ /g, '_');
                spaceLayerName = noSpaceLayerName.replace(/_/g, ' ');
                spaceLayerName = spaceLayerName.replace("-", " ");
            } else {
                noSpaceLayerName = layer.displayName.trim();
                spaceLayerName = noSpaceLayerName.replace(/_/g, ' ');
                spaceLayerName = spaceLayerName.replace("-", " ");
            }

            if (layer.layerType == "H_PKLayer" || layer.layerType == "V_PKLayer") {
                let layerItem = $('<button class="list-group-item btn btn-block" id="' + noSpaceLayerName + '" style="color: white">' + noSpaceLayerName + '</button>');
                layerListItem.append(layerItem);

                let filterLayerItem = $('<option value="'+ noSpaceLayerName + '">'+ noSpaceLayerName + '</option>');
                filterLayerList.append(filterLayerItem);

                if (layer.showSpinner && Spinner) {
                    let opts = {
                        scale: 0.9
                    };
                    let spinner = new Spinner(opts).spin();
                    layerItem.append(spinner.el);
                }

                if (layer.enabled && !exceptions.includes(layer.displayName)) {
                    layerItem.addClass("active");
                    layerItem.css("color", "white");
                } else {
                    if (exceptions.includes(layer.displayName.trim())) {
                        layer.enabled = false;
                    }
                    layerItem.removeClass("active");
                    layerItem.css("color", "black");
                }
            }
        }


        let self = this;
        layerListItem.find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });
    };

    //LayerManager.prototype.updateVisibilityState = function (WorldWindow) {
    //    let layerButtons = $("#layerList").find("button"),
    //        layers = WorldWindow.layers;
    //
    //    for (let i = 0; i < layers.length; i++) {
    //        let layer = layers[i];
    //        for (let j = 0; j < layerButtons.length; j++) {
    //            let button = layerButtons[j];
    //
    //            if (layer.displayName === button.innerText) {
    //                if (layer.inCurrentFrame) {
    //                    button.innerHTML = "<em>" + layer.displayName + "</em>";
    //                } else {
    //                    button.innerHTML = layer.displayName;
    //                }
    //            }
    //        }
    //    }
    //};

    LayerManager.prototype.createProjectionList = function () {
        let projectionNames = [
            "3D",
            "Equirectangular",
            "Mercator"
        ];
        let projectionDropdown = $("#projectionDropdown");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">3D<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);

        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < projectionNames.length; i++) {
            let projectionItem = $('<li><a >' + projectionNames[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);


    };

    LayerManager.prototype.continentList = function () {
        let contiLists = [
            "All Continents",
            "North America",
            "Europe",
            "South America",
            "Asia",
            "Africa",
            "Oceania",
        ];
        let projectionDropdown = $("#continentList");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" id="continentButton" type="button" data-toggle="dropdown">All Continents<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);

        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < contiLists.length; i++) {
            let projectionItem = $('<li><a>' + contiLists[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);

    };

    LayerManager.prototype.categoryList = function () {
        let category = [
            "Confirmed Cases",
            "Deaths",
            "Recoveries",
            "Active Cases"
        ];
        let projectionDropdown = $("#categoryList");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" id="COVID-category" type="button" data-toggle="dropdown">Confirmed Cases<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);
        projectionDropdown.find("button").css("background-color", "red");
        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < category.length; i++) {
            let projectionItem = $('<li><a>' + category[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);

    };

    LayerManager.prototype.categoryListVaccine = function() {
        let Vaccinations = [
            "Total Vaccinations",
            "Incomplete Vaccinations",
            "Completed Vaccinations",
            "Daily Vaccinations",
            "Daily Vaccinations/million"
        ]
        let projectionDropdown = $("#categoryListVaccinations");

        let dropdownButton = $('<button disabled class="btn btn-info btn-block dropdown-toggle" id="vaccine-category" type="button" data-toggle="dropdown">Total Vaccinations<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);
        projectionDropdown.find("button").css("background-color", "#4dffff");
        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < Vaccinations.length; i++) {
            let projectionItem = $('<li><a>' + Vaccinations[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        // console.log(ulItem);
        projectionDropdown.append(ulItem);
    }

    // LayerManager.prototype.diseaseList = function () {
    //     let diseaseName = [
    //         "COVID-19",
    //         "Influenza A",
    //         "Influenza B"
    //     ];
    //
    //     let diseaseId = [
    //         "Covid",
    //         "InfluA",
    //         "InfluB"
    //     ];
    //
    //     let diseaseDropdown = $("#diseaseDropdown");
    //
    //     let diseaseOptions = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">COVID-19<span class="caret"></span></button>');
    //
    //     diseaseDropdown.append(diseaseOptions);
    //
    //     let ulItem2 = $('<ul class="dropdown-menu">');
    //     diseaseDropdown.append(ulItem2);
    //
    //     for (let i = 0; i < diseaseName.length; i++) {
    //         let diseaseItem = $('<li id="' + diseaseId[i] + '"><a >' + diseaseName[i] + '</a></li>');
    //         ulItem2.append(diseaseItem);
    //     }
    //
    //     ulItem2 = $('</ul>');
    //     diseaseDropdown.append(ulItem2);
    // };

    // Agrosphere Menu
    // LayerManager.prototype.agrosList = function () {
    //     const agrosName = [
    //         'AgroSphere',
    //         'ECMWF Forecasts',
    //         'Sentinel Satellite Data'
    //     ]
    //
    //     let agrosDropdown = $("#agrosphereDropdown");
    //
    //     let agrosOptions = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">AgroSphere<span class="caret"></span></button>');
    //
    //     agrosDropdown.append(agrosOptions);
    //
    //     let ulItem3 = $('<ul class="dropdown-menu">');
    //     agrosDropdown.append(ulItem3);
    //
    //     for (let i = 0; i < agrosName.length; i++) {
    //         let agrosItem = $('<li><a >' + agrosName[i] + '</a></li>');
    //         ulItem3.append(agrosItem);
    //     }
    //
    //     ulItem3 = $('</ul>');
    //     agrosDropdown.append(ulItem3);
    //
    // };

    LayerManager.prototype.onSearchButton = function (event) {
        this.performSearch($("#searchText")[0].value)
    };

    LayerManager.prototype.onSearchTextKeyPress = function (searchInput, event) {
        if (event.keyCode === 13) {
            searchInput.blur();
            this.performSearch($("#searchText")[0].value)
        }
    };

    LayerManager.prototype.performSearch = function (queryString) {
        if (queryString) {
            let thisLayerManager = this,
                latitude, longitude;

            if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
                let tokens = queryString.split(",");
                latitude = parseFloat(tokens[0]);
                longitude = parseFloat(tokens[1]);
                thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            } else {
                this.geocoder.lookup(queryString, function (geocoder, result) {
                    if (result.length > 0) {
                        latitude = parseFloat(result[0].lat);
                        longitude = parseFloat(result[0].lon);

                        WorldWind.Logger.log(
                            WorldWind.Logger.LEVEL_INFO, queryString + ": " + latitude + ", " + longitude);

                        thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
                    }
                });
            }
        }
    };

    return LayerManager;
});