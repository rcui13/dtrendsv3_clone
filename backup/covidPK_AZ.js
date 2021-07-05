define([
    '../scripts/globeObject',
    './canvasPKobject',
    '../config/clientConfig',
    './LayerManager',
    './imgPKobject',
    './jquery-csv-1.0.11',
    // ,'./initPL'
], function (newGlobe, canvasPKobject, clientConfig, LayerManager) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    let pLayer;
    let countryIndex = {};
    let currlayerIndex;
    let iLength = [];

    // let numC = 0;
    // let numD = 0;
    // let numR = 0;
    // let numA = 0;

    let num = [0, 0, 0, 0];


    function covidPK(date, type, flag, midDate, continent="none", countries) {
        // console.log(continent);
        // console.log(newGlobe.layers)
        //define colors for the placemarks
        let colorC = "1 0 0";
        let colorD = "0 0 0";
        let colorR = "0.4 1 0.2 ";
        let colorA = "0.9 0.6 0";
        continent = continent.trim();
        continent = continent.split(' ').join('_');

        //Placemark type object
        let pkType = [
            {type: "Confirmed Cases", color: colorC.split(' ')},
            {type: "Deaths", color: colorD.split(' ')},
            {type: "Recoveries", color: colorR.split(' ')},
            {type: "Active Cases", color: colorA.split(' ')},
        ];

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/covidData',
            type: 'GET',
            // data: {date: date, countries: countries, continents: continents},
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {
                // console.log(resp.data);
                // console.log(countryIndex)
                if (!resp.error) {
                    // overlay.style.display = 'none';
                    // tutorial.hidden = false;
                    // tutorial.disabled = false;
                    // tutorial.style.display = 'table-cell';
                    // $('#amount').val(midDate);
                    // $("#slider-range").slider("enable");
                    // console.log(resp.data.length)
                    resp.data.forEach(async function (el, i) {
                        // console.log(i)
                        let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)]
                        //el.CaseNum - el.DeathNum - el.RecovNum
                        if (flag == 'init') {
                            if (i === 0 || el.CountryName !== resp.data[i - 1].CountryName) {
                                // console.log("create pk layer")
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName);
                                pLayer.enabled = true;
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName;
                            }
                        } else {
                            // console.log(newGlobe.layers.some(ele => ele.CountryName === el.CountryName));
                            countryIndex[el.CountryName] = newGlobe.layers.findIndex(ele => ele.displayName === el.CountryName);
                            // console.log(countryIndex[el.CountryName])
                            if (
                                // el.CountryName
                                countryIndex[el.CountryName] !== -1
                            ) {
                                if (i === 0 || el.CountryName !== resp.data[i - 1].CountryName) {
                                    pLayer = newGlobe.layers[countryIndex[el.CountryName]];
                                    // console.log(pLayer)
                                    //remove all renderables of this layer
                                    await pLayer.removeAllRenderables();
                                }

                            } else if (i === 0 || el.CountryName !== resp.data[i - 1].CountryName) {
                                //create placemark layer
                                // console.log("create pk layer !!countryindex")
                                pLayer = new WorldWind.RenderableLayer(el.CountryName);
                                // pLayer.enabled = true;
                                if (continent === "none") {
                                    pLayer.enabled = true;
                                } else {
                                    pLayer.enabled = el.ContinentName === continent;
                                }
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName;
                                // console.log(pLayer)
                            }
                        }

                        pkType.forEach(function (elem, k) {
                            // console.log("pkType running")
                            // console.log("add renderables")
                            pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                            pkType[k].pkObj.pk.userProperties.Date = el.Date;
                            pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
                            pkType[k].pkObj.pk.userProperties.dName = el.LocName;
                            pkType[k].pkObj.pk.userProperties.Number = numTypes[k];


                            if (midDate === "none") {
                                midDate = Math.floor((resp.data.length - 1)/2);
                            }

                            // if (continent === "none") {
                            // } else {
                            //     if (el.ContinentName === continents) {} else {}
                            // }

                            // disable all the placemarks except requested date
                            if (el.Date == midDate) {

                                num[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number)

                                if (pkType[k].type == type) {
                                    pkType[k].pkObj.pk.enabled = true;
                                } else {
                                    pkType[k].pkObj.pk.enabled = false;
                                }
                            } else {
                                pkType[k].pkObj.pk.enabled = false;
                            }


                            //add placemarks onto placemark layer
                            pLayer.addRenderable(pkType[k].pkObj.pk);

                            // numC += parseInt(confirmedPK.pk.userProperties.Number);
                            // numD += parseInt(deathPK.pk.userProperties.Number);
                            // numR += parseInt(recoveredPK.pk.userProperties.Number);
                            // numA += parseInt(activePK.pk.userProperties.Number);



                            if (k === pkType.length - 1 && flag == "init") {
                                if (i !== resp.data.length - 1) {
                                    if (el.CountryName !== resp.data[i + 1].CountryName) {
                                        // add current placemark layer onto worldwind layer obj
                                        // console.log(el.CountryName)
                                        // console.log("add layer")
                                        newGlobe.addLayer(pLayer);
                                    }
                                } else {
                                    // add current placemark layer onto worldwind layer obj
                                    // console.log("adding again")
                                    // console.log(pLayer)
                                    newGlobe.addLayer(pLayer);
                                    newGlobe.redraw();

                                    $('#conConfirmed').text(num[0]);
                                    $('#conDeaths').text(num[1]);
                                    $('#conRecoveries').text(num[2]);
                                    $('#conActive').text(num[3]);
                                }
                            } else if (k === pkType.length - 1 ) {
                                // console.log(el.CountryName)
                                 if (i !== resp.data.length - 1 && countryIndex[el.CountryName] == -1){
                                     iLength.push(i);
                                    if (el.CountryName !== resp.data[i + 1].CountryName) {
                                        // console.log(iLength.length)

                                        let asdf = resp.data[i - iLength.length].CountryName;
                                        let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName === asdf);
                                        console.log(resp.data[i - iLength.length]);

                                        // add current placemark layer onto worldwind layer obj
                                        // console.log(el.CountryName)
                                        // console.log(pLayer)
                                        newGlobe.insertLayer(asdfPosition + 1, pLayer);
                                        iLength = [];

                                        countryIndex[el.CountryName] = asdfPosition + 1;

                                        // newGlobe.addLayer(pLayer);
                                        // console.log(countryIndex.findIndex(ele => ele === el.CountryName));
                                        // console.log(countryIndex.value());
                                    }
                                } else if (i == resp.data.length - 1 ) {
                                     // newGlobe.addLayer(pLayer);
                                     // console.log("hi")
                                     newGlobe.redraw();
                                     layerManager.synchronizeLayerList();

                                     $('#conConfirmed').text(num[0]);
                                     $('#conDeaths').text(num[1]);
                                     $('#conRecoveries').text(num[2]);
                                     $('#conActive').text(num[3]);
                                 }
                            }
                        })
                    });
                } else {
                    console.error("Error retrieving COVID data from server (covidData)");
                    alert("Error retrieving COVID data from server");
                }
            }
        });
    }

    // function sizePK(num) {
    //     let magnitude = 0;
    //     if (num > 0 && num <= 5) {
    //         magnitude = 0.05;
    //     } else if (num > 5 && num <= 25) {
    //         magnitude = 0.07;
    //     } else if (num > 25 && num <= 75) {
    //         magnitude = 0.13;
    //     } else if (num > 75 && num <= 150) {
    //         magnitude = 0.17;
    //     } else if (num > 150 && num <= 250) {
    //         magnitude = 0.22;
    //     } else if (num > 250 && num <= 350) {
    //         magnitude = 0.25;
    //     } else if (num > 350 && num <= 600) {
    //         magnitude = 0.28;
    //     } else if (num > 600 && num <= 1100) {
    //         magnitude = 0.3;
    //     } else if (num > 1100 && num <= 2500) {
    //         magnitude = 0.40;
    //     } else if (num > 2500 && num <= 7500) {
    //         magnitude = 0.45;
    //     } else if (num > 7500 && num <= 11000) {
    //         magnitude = 0.5;
    //     } else if (num > 11000) {
    //         magnitude = 0.6;
    //     }
    //
    //     return magnitude
    // }

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
    // function deletePK() {
    //     for (let j = 6; j < newGlobe.layers.length - 1; j++) {
    //         if (newGlobe.layers[j].layerType === 'H_PKLayer') {
    //             newGlobe.removeLayer(newGlobe.layers[j]);
    //         }
    //     }
    // }

    // function createPK(flag, reqDate, reqType, pkType, pkData) {
    //     pkData.forEach(async function (el, i) {
    //         if (flag == 'init') {
    //             if (i === 0 || el.CountryName !== pkData[i - 1].CountryName) {
    //                 //create placemark layer
    //                 pLayer = new WorldWind.RenderableLayer(el.CountryName);
    //                 pLayer.enabled = true;
    //                 pLayer.layerType = 'H_PKLayer';
    //                 pLayer.continent = el.ContinentName;
    //
    //                 currlayerIndex++;
    //                 countryIndex[el.CountryName] = currlayerIndex;
    //             }
    //         } else {
    //             if (!!countryIndex[el.CountryName]) {
    //                 //layer exists in our object of indexes, we can directly access the layer with its index
    //                 pLayer = newGlobe.layers[countryIndex[el.CountryName]];
    //                 //remove all renderables of this layer
    //                 await pLayer.removeAllRenderables();
    //             }
    //         }
    //
    //         pkType.forEach(function (elem, k) {
    //             pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(el.CaseNum));
    //             pkType[k].pkObj.pk.userProperties.Date = el.Date;
    //             pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
    //             pkType[k].pkObj.pk.userProperties.dName = el.LocName;
    //             if (k == 3) {
    //                 pkType[k].pkObj.pk.userProperties.Number = el.CaseNum - el.DeathNum - el.RecovNum;
    //             } else {
    //                 pkType[k].pkObj.pk.userProperties.Number = el.CaseNum;
    //             }
    //
    //             // disable all the placemarks except requested date
    //             if (el.Date == reqDate) {
    //                 if (pkType[k].type == reqType) {
    //                     pkType[k].pkObj.pk.enabled = true;
    //                 } else {
    //                     pkType[k].pkObj.pk.enabled = false;
    //                 }
    //             } else {
    //                 pkType[k].pkObj.pk.enabled = false;
    //             }
    //
    //             //add placemarks onto placemark layer
    //             pLayer.addRenderable(pkType[k].pkObj.pk);
    //             if (k === pkType.length - 1) {
    //                 if (i !== pkData.length - 1) {
    //                     if (el.CountryName !== pkData[i + 1].CountryName) {
    //                         // add current placemark layer onto worldwind layer obj
    //                         newGlobe.addLayer(pLayer);
    //                     }
    //                 } else {
    //                     newGlobe.redraw();
    //                 }
    //             }
    //         })
    //     });
    // }

    // async function updateArr() {
    //     countryArr = [];
    //     let arrindex = [];
    //
    //     await newGlobe.layers.forEach(function (elem, index) {
    //         if (elem instanceof WorldWind.RenderableLayer && elem.layerType == "H_PKLayer") {
    //             // elem.renderables.forEach(function (d) {
    //             // })
    //             countryArr.push(elem.displayName);
    //             arrindex.push(index);
    //         }
    //     });
    //
    //     countryIndex = countryArr.reduce((acc,curr,i)=> (acc[curr]=arrindex[i], acc),{});
    //     console.log(countryIndex)
    // }

    return {covidPK};
});



