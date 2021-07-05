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
    let countryIndex = {};
    let iLength = [];

    // let covidNum = [0, 0, 0, 0];

    function covidPK(date, type, flag, midDate, continent="none", countries="all_countries") {
        //define colors for the placemarks
        let colorC = "1 0 0";
        let colorD = "0 0 0";
        let colorR = "0.4 1 0.2";
        let colorA = "0.9 0.6 0";
        let covidNum = [0, 0, 0, 0];
        let totalCaseNum = {"All Continents":[0,0,0,0],"North_America":[0,0,0,0],"Europe":[0,0,0,0],"South_America":[0,0,0,0],
            "Asia":[0,0,0,0],"Africa":[0,0,0,0],"Oceania":[0,0,0,0],"Other":[0,0,0,0]};
        let sortLayersLocation = 0;
        continent = continent.trim();
        continent = continent.split(' ').join('_');

        //Placemark type object
        let pkType = [
            {type: "Confirmed Cases", color: colorC.split(' ')},
            {type: "Deaths", color: colorD.split(' ')},
            {type: "Recoveries", color: colorR.split(' ')},
            {type: "Active Cases", color: colorA.split(' ')},
        ];

        if (flag == "filterLoad" && countries !== "all_countries") {
            $.ajax({
                url: '/countryCOVID',
                type: 'GET',
                // data: {date: date, countries: countries, continents: continents},
                data: {date: date, country: countries.trim()},
                dataType: 'json',
                async: false,
                success: function (resp) {
                    if (!resp.error) {
                        resp.data.forEach(async function (el, i) {
                            let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)];
                            //el.CaseNum - el.DeathNum - el.RecovNum
                            if (el.ActiveNum < 0 || isNaN(el.ActiveNum)) {
                                numTypes[3]= parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.RecovNum);
                            }

                            countryIndex[el.CountryName.trim()] = newGlobe.layers.findIndex(ele => ele.displayName.trim() === el.CountryName.trim());
                            if (countryIndex[el.CountryName.trim()] !== -1) {
                                if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                    pLayer = newGlobe.layers[countryIndex[el.CountryName.trim()]];
                                    //remove all renderables of this layer
                                    await pLayer.removeAllRenderables();
                                }
                            } else if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                                pLayer.enabled = el.CountryName.trim() == countries.trim();
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName.trim();
                            }

                            pkType.forEach(function (elem, k) {
                                pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
                                pkType[k].pkObj.pk.userProperties.Date = el.Date;
                                pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
                                pkType[k].pkObj.pk.userProperties.dName = el.LocName.trim();
                                pkType[k].pkObj.pk.userProperties.Number = numTypes[k];
                                // pkType[k].pkObj.pk.layer = null;

                                // disable all the placemarks except requested date
                                if (el.Date == midDate) {

                                    covidNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number)

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

                                if (k === pkType.length - 1 ) {
                                    if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
                                        iLength.push(i);
                                        if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                            console.log(i)
                                            console.log(el)
                                            console.log(el.CountryName.trim())
                                            console.log(i - iLength.length);
                                            let asdf = resp.data[i - iLength.length].CountryName.trim();
                                            let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);
                                            console.log(resp.data[i - iLength.length]);
                                            console.log(asdf)
                                            console.log(asdfPosition)
                                            // add current placemark layer onto worldwind layer obj
                                            newGlobe.insertLayer(asdfPosition + 1, pLayer);
                                            iLength = [];

                                            countryIndex[el.CountryName.trim()] = asdfPosition + 1;
                                        }
                                    } else if (i == resp.data.length - 1 ) {
                                        newGlobe.redraw();
                                        layerManager.synchronizeLayerList();

                                        $('#conConfirmed').text(covidNum[0]);
                                        $('#conDeaths').text(covidNum[1]);
                                        $('#conRecoveries').text(covidNum[2]);
                                        $('#conActive').text(covidNum[3]);
                                    }
                                }
                            });
                        });
                    } else {
                        ErrorReturn("COVID filterLoad country", "covidPK" , true);
                    }
                }
            });
        } else if (flag == "filterLoad" && continent !== "none") {
            $.ajax({
                url: '/contCOVID',
                type: 'GET',
                // data: {date: date, countries: countries, continents: continents},
                data: {date: date, continent: continent.trim()},
                dataType: 'json',
                async: false,
                success: function (resp) {
                    if (!resp.error) {
                        resp.data.forEach(async function (el, i) {
                            let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)];
                            //el.CaseNum - el.DeathNum - el.RecovNum
                            if (el.ActiveNum < 0 || isNaN(el.ActiveNum)) {
                                numTypes[3]= parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.RecovNum);
                            }

                            countryIndex[el.CountryName.trim()] = newGlobe.layers.findIndex(ele => ele.displayName.trim() === el.CountryName.trim());
                            if (countryIndex[el.CountryName.trim()] !== -1) {
                                if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                    pLayer = newGlobe.layers[countryIndex[el.CountryName.trim()]];
                                    //remove all renderables of this layer
                                    await pLayer.removeAllRenderables();
                                }

                            } else if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                //create placemark layer
                                pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                                pLayer.enabled = el.ContinentName.trim() === continent.trim();
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = el.ContinentName.trim();
                            }

                            pkType.forEach(function (elem, k) {
                                pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
                                pkType[k].pkObj.pk.userProperties.Date = el.Date;
                                pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
                                pkType[k].pkObj.pk.userProperties.dName = el.LocName.trim();
                                pkType[k].pkObj.pk.userProperties.Number = numTypes[k];
                                // pkType[k].pkObj.pk.layer = null;
                                // disable all the placemarks except requested date
                                if (el.Date == midDate) {

                                    covidNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number)

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

                               if (k === pkType.length - 1 ) {
                                    if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
                                        iLength.push(i);
                                        if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {

                                            let asdf = resp.data[i - iLength.length].CountryName.trim();
                                            let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);

                                            // add current placemark layer onto worldwind layer obj
                                            newGlobe.insertLayer(asdfPosition + 1, pLayer);
                                            iLength = [];

                                            countryIndex[el.CountryName] = asdfPosition + 1;
                                        }
                                    } else if (i == resp.data.length - 1 ) {
                                        newGlobe.redraw();
                                        layerManager.synchronizeLayerList();

                                        $('#conConfirmed').text(covidNum[0]);
                                        $('#conDeaths').text(covidNum[1]);
                                        $('#conRecoveries').text(covidNum[2]);
                                        $('#conActive').text(covidNum[3]);
                                    }
                                }
                            })
                        });
                    } else {
                        ErrorReturn("COVID filterLoad continent", "covidPK" , true);
                    }
                }
            });
        } else {
            // request the data for placemarks with given date and country
            $.ajax({
                url: '/covidData',
                type: 'GET',
                // data: {date: date, countries: countries, continents: continents},
                data: {date: date},
                dataType: 'json',
                async: false,
                success: function (resp) {
                    if (!resp.error) {
                        resp.data.forEach(async function (el, i) {
                            let numTypes = [parseInt(el.CaseNum), parseInt(el.DeathNum), parseInt(el.RecovNum), parseInt(el.ActiveNum)];
                            //el.CaseNum - el.DeathNum - el.RecovNum
                            if (el.ActiveNum < 0 || isNaN(el.ActiveNum)) {
                                numTypes[3]= parseInt(el.CaseNum) - parseInt(el.DeathNum) - parseInt(el.RecovNum);
                            }
                            if (flag == 'init') {
                                if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                    //create placemark layer
                                    pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                                    if (continent === "none") {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = true;
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries.trim();
                                        }
                                    } else {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = el.ContinentName.trim() === continent.trim();
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries.trim();
                                        }
                                    }
                                    pLayer.layerType = 'H_PKLayer';
                                    pLayer.continent = el.ContinentName.trim();
                                }
                            } else {
                                countryIndex[el.CountryName.trim()] = newGlobe.layers.findIndex(ele => ele.displayName.trim() === el.CountryName.trim());
                                if (countryIndex[el.CountryName.trim()] !== -1) {
                                    if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                        pLayer = newGlobe.layers[countryIndex[el.CountryName.trim()]];
                                        //remove all renderables of this layer
                                        await pLayer.removeAllRenderables();
                                    }

                                } else if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()) {
                                    //create placemark layer
                                    pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                                    if (continent === "none") {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = true;
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries.trim();
                                        }
                                    } else {
                                        if (countries === "all_countries") {
                                            pLayer.enabled = el.ContinentName.trim() === continent.trim();
                                        } else {
                                            pLayer.enabled = el.CountryName.trim() == countries.trim();
                                        }
                                    }
                                    pLayer.layerType = 'H_PKLayer';
                                    pLayer.continent = el.ContinentName.trim();
                                }
                            }

                            pkType.forEach(function (elem, k) {
                                pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
                                pkType[k].pkObj.pk.userProperties.Date = el.Date;
                                pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
                                pkType[k].pkObj.pk.userProperties.dName = el.LocName.trim();
                                pkType[k].pkObj.pk.userProperties.Number = numTypes[k];
                                // pkType[k].pkObj.pk.layer = null;

                                if (midDate === "none") {
                                    midDate = Math.floor((resp.data.length - 1)/2);
                                }

                                // disable all the placemarks except requested date
                                if (el.Date == midDate) {

                                    covidNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
                                    totalCaseNum[el.ContinentName.trim()][k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);

                                    if (pkType[k].type == type) {
                                        pkType[k].pkObj.pk.enabled = true;
                                        sortLayersLocation += 1;
                                    } else {
                                        pkType[k].pkObj.pk.enabled = false;
                                    }
                                } else {
                                    pkType[k].pkObj.pk.enabled = false;
                                }

                                //add placemarks onto placemark layer
                                pLayer.addRenderable(pkType[k].pkObj.pk);


                                if (k === pkType.length - 1 && flag == "init") {
                                    if (i !== resp.data.length - 1) {
                                        if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                            // add current placemark layer onto worldwind layer obj
                                            newGlobe.addLayer(pLayer);
                                        }
                                    } else {
                                        // add current placemark layer onto worldwind layer obj
                                        newGlobe.addLayer(pLayer);
                                        newGlobe.redraw();

                                        totalCaseNum["All Continents"] = covidNum;
                                        $('#conConfirmed').text(covidNum[0]);
                                        $('#conDeaths').text(covidNum[1]);
                                        $('#conRecoveries').text(covidNum[2]);
                                        $('#conActive').text(covidNum[3]);
                                    }
                                } else if (k === pkType.length - 1 ) {
                                    if (i !== resp.data.length - 1 && countryIndex[el.CountryName.trim()] == -1){
                                        iLength.push(i);
                                        if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                            console.log(el)
                                            console.log(el.CountryName.trim())
                                            let asdf = resp.data[i - iLength.length].CountryName.trim();
                                            let asdfPosition = newGlobe.layers.findIndex(ele => ele.displayName.trim() === asdf);
                                            // add current placemark layer onto worldwind layer obj
                                            newGlobe.insertLayer(asdfPosition + 1, pLayer);
                                            iLength = [];

                                            countryIndex[el.CountryName.trim()] = asdfPosition + 1;
                                        }
                                    } else if (i == resp.data.length - 1 ) {
                                        newGlobe.redraw();
                                        // layerManager.synchronizeLayerList();

                                        totalCaseNum["All Continents"] = covidNum;
                                        $('#conConfirmed').text(covidNum[0]);
                                        $('#conDeaths').text(covidNum[1]);
                                        $('#conRecoveries').text(covidNum[2]);
                                        $('#conActive').text(covidNum[3]);
                                    }
                                }
                                // if (pkType[k].pkObj.pk.layer != null && pkType[k].pkObj.pk.layer != undefined) {
                                //     console.log(pkType[k].pkObj.pk.layer);
                                // }
                            });
                        });
                        sessionStorage.setItem('COVIDinfectionMax', sortLayersLocation);
                        sessionStorage.setItem('COVIDstartDate', date[0]);
                        sessionStorage.setItem('COVIDendDate', date[1]);
                        sessionStorage.setItem("totalCaseNum", JSON.stringify(totalCaseNum));
                    } else {
                        ErrorReturn("COVID", "covidPK" , true);
                    }
                }
            });
        }
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
    return {covidPK};
});



