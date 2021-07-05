define([
    './globeObject',
    './canvasPKobject',
    './imgPKobject',
    './Error',
    './LayerManager',
    '../config/clientConfig',
    './jquery-csv-1.0.11',
    // ,'./initPL'
], function (newGlobe, canvasPKobject, imagePK, ErrorReturn, LayerManager, clientConfig) {
    "use strict";

    let pLayer;
    let layerManager = new LayerManager(newGlobe);


    let countryIndex = [];
    let spliceLength;
    let iLength = [];

    function vaccinePK(date, type, flag, midDate, countries="all_countries", continent="none") {
        // console.log(countryIndex)
        spliceLength = newGlobe.layers.length - countryIndex.length;
        // console.log(spliceLength)

        newGlobe.layers.splice(spliceLength, countryIndex.length);

        let colorT = "0.3 1 1";
        let colorI = "1 0.5 0";
        let colorC = "0.55 0.51 0.54";
        let colorDV = "0 1 0";
        let colorDVM = "0.5 0.1 0.6";
        let sortLayersLocation = 0;
        let vaccNum = [0, 0, 0, 0, 0];
        let totalVaccNum = {"All Continents":[0,0,0,0,0],"North_America":[0,0,0,0,0],"Europe":[0,0,0,0,0],"South_America":[0,0,0,0,0],
            "Asia":[0,0,0,0,0],"Africa":[0,0,0,0,0],"Oceania":[0,0,0,0,0],"Other":[0,0,0,0,0]};
        continent = continent.trim();
        continent = continent.split(' ').join('_');
        countries = countries.trim()

        let pkType = [
            {type: "Total Vaccinations", color: colorT.split(' ')},
            {type: "Incomplete Vaccinations", color: colorI.split(' ')},
            {type: "Completed Vaccinations", color: colorC.split(' ')},
            {type: "Daily Vaccinations", color: colorDV.split(' ')},
            {type: "Daily Vaccinations/million", color: colorDVM.split(' ')},
        ]


        // request the data for placemarks with given date and country
        $.ajax({
            url: '/1dVaccineData',
            type: 'GET',
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {
                console.log(resp);
                if (!resp.error) {

                    resp.data.forEach(async function (el, i) {

                        let numTypes = [
                            parseInt(el.total_vaccinations),
                            parseInt((el.people_vaccinated - el.people_fully_vaccinated)),
                            parseInt(el.people_fully_vaccinated),
                            parseInt(el.daily_vaccinations),
                            parseInt(el.daily_vaccinations_per_million)
                        ];
                        if (i === 0 || el.CountryName.trim() !== resp.data[i - 1].CountryName.trim()){

                            if (!countryIndex.includes(el.CountryName.trim())) {
                                countryIndex.push(el.CountryName.trim());
                            }

                            pLayer = new WorldWind.RenderableLayer(el.CountryName.trim());
                            // pLayer.enabled = true;
                            if (continent === "none") {
                                if (countries === "all_countries") {
                                    pLayer.enabled = true;
                                } else {
                                    pLayer.enabled = el.CountryName.trim() == countries;
                                }
                            } else {
                                if (countries === "all_countries") {
                                    pLayer.enabled = el.Continent.trim() === continent;
                                } else {
                                    pLayer.enabled = el.CountryName.trim() == countries;
                                }
                            }
                            pLayer.layerType = 'V_PKLayer';
                            pLayer.continent = el.Continent.trim();
                        }
                        
                        pkType.forEach(function (elem, k) {
                            pkType[k].pkObj = new canvasPKobject(pkType[k].color, el.Latitude, el.Longitude, sizePK(numTypes[k]));
                            pkType[k].pkObj.pk.userProperties.Date = el.date;
                            pkType[k].pkObj.pk.userProperties.Type = pkType[k].type;
                            pkType[k].pkObj.pk.userProperties.dName = el.CountryName.trim();
                            pkType[k].pkObj.pk.userProperties.Number = numTypes[k];



                            if (el.date === resp.data[resp.data.length - 1].date) {
                                if (pkType[k].type == type) {
                                    console.log(type, pkType[k].type);
                                    pkType[k].pkObj.pk.enabled = true;
                                    sortLayersLocation += 1;
                                } else {
                                    pkType[k].pkObj.pk.enabled = false;
                                    console.log(pkType[k].pkObj.pk.enabled)
                                }
                                vaccNum[k] += parseInt(pkType[k].pkObj.pk.userProperties.Number);
                                totalVaccNum[el.Continent.trim()][k] += parseInt(numTypes[k]);
                            } else {
                                pkType[k].pkObj.pk.enabled = false;
                            }
                            pLayer.addRenderable(pkType[k].pkObj.pk);

                            if (k === pkType.length - 1 && i !== resp.data.length - 1) {
                                if (el.CountryName.trim() !== resp.data[i + 1].CountryName.trim()) {
                                    // add current placemark layer onto worldwind layer obj
                                    console.log(pLayer)
                                    newGlobe.addLayer(pLayer);
                                }
                            } else if (k === pkType.length - 1 && i === resp.data.length - 1) {
                                    newGlobe.addLayer(pLayer);
                                    newGlobe.redraw();
                                    layerManager.synchronizeLayerList();

                                    totalVaccNum["All Continents"] = vaccNum;
                                    $('#totVaccinations').text(vaccNum[0]);
                                    $('#incVaccinations').text(vaccNum[1]);
                                    $('#comVaccinations').text(vaccNum[2]);
                                    $('#daiVaccinations').text(vaccNum[3]);
                                    $('#milVaccinations').text(vaccNum[4]);
                                    sessionStorage.setItem('vaccInfectionMax', sortLayersLocation);
                                    sessionStorage.setItem("totalVaccNum", JSON.stringify(totalVaccNum));
                            }

                        })
                    });
                } else {
                    ErrorReturn("vaccination", "1dVaccineData" , true);
                }
            }
        });
    }

    function sizePK (num){
        let fSize = 0;
        if (num > 0) {
            for (let j = 0; j < clientConfig.pkSize.length; j++) {
                if (j !== 0) {
                    if (num <= clientConfig.pkSize[j].num && num > clientConfig.pkSize[j - 1].num) {
                        fSize = clientConfig.pkSize[j].size * num / clientConfig.pkSize[j].num;
                        return fSize;
                    } else if (j === clientConfig.pkSize.length - 1) {
                        fSize = clientConfig.pkSize[j].size;
                        return fSize;
                    }
                }
            }
        } else {
            return fSize;
        }
    }

    return {vaccinePK};
});
