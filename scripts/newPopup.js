define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    // , './covidPK_bak'
    // , './covidPK'
    , './newcovidPK'
    // , './vaccinePK'
    , './vaccinePK_v3'
    , './graphsData'
    , '../config/clientConfig.js'
    ,'./Error'
    , './slider'
    , 'menu'


], function (newGlobe, dataAll, csvD, LayerManager, covidPK, vaccinePK, graphsD, clientConfig,ErrorReturn) {
    "use strict";

    let highlightedItems = [];
    let COVIDcheckbox = document.getElementById("COVID-19-checkbox");
    let vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
    let countryCheckbox = document.getElementById("Country-checkbox");
    let weatherCheckbox = document.getElementById("Weather-checkbox");

    let category;

    if (clientConfig === undefined) {
        ErrorReturn("placemarks and layers", "Popup" , true);
    }

    //on clicking placemark
    let handleMouseCLK = function (e) {
        let x = e.clientX,
            y = e.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickListCLK.objects.forEach(function (value) {
            let pickedPM = value.userObject;

            if (pickedPM instanceof WorldWind.Placemark) {
                if (pickedPM.layer.layerType !== 'Country Placemarks' && pickedPM.layer.layerType !== 'Weather Station Placemarks' && pickedPM.layer.layerType !== 'Country_Placemarks' && pickedPM.layer.layerType !== 'Weather_Station_Placemarks') {
                    sitePopUp(pickedPM); //pass placemark to this function
                } else if (pickedPM.layer.layerType === 'Country Placemarks' || pickedPM.layer.layerType === 'Weather Station Placemarks' || pickedPM.layer.layerType === 'Country_Placemarks' || pickedPM.layer.layerType === 'Weather_Station_Placemarks') {
                    if (pickedPM.layer.layerType === 'Country_Placemarks' || pickedPM.layer.layerType === 'Country Placemarks') {
                        document.getElementById("selectedCountry").innerHTML = "Selected Country: " + pickedPM.userProperties.country + " ";  //We might want to consider removing this since we already have the popup
                    } else {
                        document.getElementById("selectedCountry").innerHTML = "Selected Station: " + pickedPM.userProperties.stationName + " "; //We might want to consider removing this since we already have the popup
                    }
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
                let xOffset = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                let yOffset = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                let content = "";
                COVIDcheckbox = document.getElementById("COVID-19-checkbox");
                vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
                countryCheckbox = document.getElementById("Country-checkbox");
                weatherCheckbox = document.getElementById("Weather-checkbox");

                let popover = document.getElementById('popover');
                popover.style.position = "absolute";
                popover.style.left = (x + xOffset - 3) + 'px';
                popover.style.top = (y + yOffset - 3) + 'px';

                if (countryCheckbox.checked == true && pickedPM.layer.layerType === 'Country_Placemarks') {
                    content = "<p><strong>Country:</strong> " + pickedPM.userProperties.country + "</p>";
                } else if (weatherCheckbox.checked == true && pickedPM.layer.layerType === 'Weather_Station_Placemarks') {
                    content = "<p><strong>Weather Station:</strong> " + pickedPM.userProperties.stationName + "</p>";
                } else if (COVIDcheckbox.checked == true && pickedPM.layer.layerType === 'H_PKLayer') {

                    if (pickedPM.userProperties.Type == "Confirmed Cases") {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong><br>" + pickedPM.userProperties["Confirmed Cases"] + " cases</p>";
                    } else if (pickedPM.userProperties.Type == "Deaths") {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong><br>" + pickedPM.userProperties.Deaths + " deaths</p>";
                    } else if (pickedPM.userProperties.Type == "Recoveries") {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong><br>" + pickedPM.userProperties.Recoveries + " recoveries</p>";
                    } else if (pickedPM.userProperties.Type == "Active Cases") {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong><br>" + pickedPM.userProperties["Active Cases"] + " cases</p>";
                    }
                } else if (vaccCheckbox.checked == true && pickedPM.layer.layerType === 'V_PKLayer') {
                    if (document.getElementById("vaccine-category").innerText.trim() == "Daily Vaccinations") {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong><br>" + pickedPM.userProperties.Number + " daily vaccinations</p>";
                    } else {
                        content = "<p style='text-align: center;'> <strong>" + pickedPM.userProperties.dName.replace(/_/g, ' ') + "</strong>" +
                            "<br>" + pickedPM.userProperties.Number + " vaccinations</p>";
                    }
                }

                $("#popover").attr('data-content', content);
                $("#popover").show();
            }
        });
    }
    //pop-up content
    let sitePopUp = function (PM) {
        // document.getElementById("popupBox").hidden = false;
        if (document.getElementById("graphs").style.display == "none") {
            openTabRight(event, 'graphs'); //Open the graphs tab on right
            // document.getElementById("charts").click();
            // document.querySelector('#charts').dispatchEvent(new CustomEvent('click'));
            // openTabRight(event, 'graphs');
        }
        let popupBodyItem = $("#popupBody");

        //clears pop-up contents
        popupBodyItem.children().remove();
        let placeLat = PM.position.latitude;
        let placeLon = PM.position.longitude;
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");

        if (PM.layer.layerType === "Country_Placemarks") {
            //inserts title and discription for placemark
            let popupBodyName = $('<p class="site-name"><h4 class="h4-sitename">' + PM.userProperties.country + '</h4></p>');
            let buttonArea = $("<div id='buttonArea'></div>");
            let br = $('<br><br>');

            //tab buttons for different date ranges for chart data shown
            let button0 = document.createElement("button");
            button0.id = "spawnAgri"
            button0.textContent = "Agr. Production";
            button0.className = "chartsB";

            let button1 = document.createElement("button");
            button1.id = "spawnPrice"
            button1.textContent = "Price";
            button1.className = "chartsB";

            let button2 = document.createElement("button");
            button2.id = "spawnLive"
            button2.textContent = "Livestock";
            button2.className = "chartsB";

            let button3 = document.createElement("button");
            button3.id = "spawnEmissionAgri"
            button3.textContent = "Emissions";
            button3.className = "chartsB";

            let button4 = document.createElement("button");
            button4.id = "spawnPest"
            button4.textContent = "Pesticides";
            button4.className = "chartsB";

            let button5 = document.createElement("button");
            button5.id = "spawnFerti"
            button5.textContent = "Fertilizer";
            button5.className = "chartsB";

            let button6 = document.createElement("button");
            button6.id = "spawnYield"
            button6.textContent = "Yield"
            button6.className = "chartsB";

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

            let modal = document.getElementById('popupBox');
            let span = document.getElementById('closeIt');

            if (PM.userProperties.country != null || PM.userProperties.country != undefined) {
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
            document.querySelector('#'+ button0.id).dispatchEvent(new CustomEvent('click')); //clicks on the first button
        } else if (PM.layer.layerType === "Weather_Station_Placemarks") {
            //inserts title and discription for placemark
            let stationName = PM.userProperties.stationName;
            let popupBodyName = $('<p class="site-name"><h4 class="h4-sitename">' + stationName + '</h4></p>');
            popupBodyItem.append(popupBodyName);
            let br = $('<br><br>');
            graphsD.generateAtmoButtons(graphsD.atmoData, graphsD.atmoDataMonthly, stationName);
            let atmoDataPoint = graphsD.findDataPoint(csvD.csv1[1], placeLat, placeLon);
            let countryData = csvD.csv1[0];
            let ccode2 = atmoDataPoint.stationName.slice(0, 2);
            let ccode3 = graphsD.findDataPointCountry(countryData, ccode2, 2);
            let agriDataPoint = graphsD.findDataPointCountry(graphsD.agriData, ccode3, 3);
            graphsD.giveAtmoButtonsFunctionality(graphsD.atmoData,
                graphsD.atmoDataMonthly, graphsD.refugeeData,
                atmoDataPoint.stationName,
                ccode3,
                agriDataPoint);

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
            document.querySelector('#plotWeatherButton0').dispatchEvent(new CustomEvent('click')); //Clicks on the first button
        } else {
            //inserts title and discription for placemark
            let popupBodyHeading;
            if (COVIDcheckbox.checked === true) {
                popupBodyHeading = "Total Cases = Active + Deceased + Recoveries";
            } else if (vaccCheckbox.checked === true) {
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

            popupBodyItem
                .append(popupBodyName)
                .append(popupBodyDesc)
                .append(button0)
                .append(button1)
                .append(button2)
                .append(button3)
                .append(button4)
                .append(br);

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
            //load chart data by clicking on first button
            button0.click();
        }
    }

    //If you don't understand the principle behind this, search "binary search", at the moment this isn't being used though
    let recursiveBinarySearch = function (arr, x, start, end) {

        // Base Condition
        if (start > end) return false;

        // Find the middle index
        let mid=Math.floor((start + end)/2);

        // Compare mid with given key x
        if (arr[mid]===x) return true;

        // If element at mid is greater than x,
        // search in the left half of mid
        if(arr[mid] > x)
            return recursiveBinarySearch(arr, x, start, mid-1);
        else

            // If element at mid is smaller than x,
            // search in the right half of mid
            return recursiveBinarySearch(arr, x, mid+1, end);
    }

    let chartDFun = function (objButton, PM) { //Generates chart
        // get button value to reset chart duration time
        console.log(PM)
        let pDate = $("#amount").val(); //This is the current date of the date slider
        let d0 = new Date("" + pDate + "");
        let dFrom = $.format.date(d0.setDate(d0.getDate() - objButton.id + 2), "yyyy-MM-dd");
        COVIDcheckbox = document.getElementById("COVID-19-checkbox");
        vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
        console.log(pDate);

        // disable this button and enable previous button disabled
        $(".chartsB").prop('disabled', false);
        $("#" + objButton.value).prop('disabled', true);
        $("#chartText").html(objButton.textContent);

        // set label date value
        let lArr = [];
        let d1 = new Date("" + pDate + "");
        let data1 = [],
            data2 = [],
            data3 = [];

        let label1, label2, label3;

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

        //// if (objButton.value < clientConfig.initLength) {
        //         if (objButton.value == 1) {
        //             let mid = Math.floor((PM.layer.renderables.length - 1)/2);
        //             console.log(mid)
        //             if (COVIDcheckbox.checked === true) {
        //                 //Assume that the placemarks in the layer are ordered by date
        //                 // We use binary search here. Search it online if you don't know what it does.
        //                 while (PM.layer.renderables[mid].userProperties.Date !== PM.userProperties.Date) {
        //                     if (PM.layer.renderables[mid].userProperties.Date < PM.userProperties.Date) {
        //                         mid =  Math.floor((mid + PM.layer.renderables.length)/2);
        //                     } else if (PM.layer.renderables[mid].userProperties.Date > PM.userProperties.Date) {
        //                         mid =  Math.floor((mid - 1)/ 2);
        //                     }
        //                 }
        //                 if (PM.layer.renderables[mid].userProperties.Type == "Active Cases") {
        //                     data1.push(PM.layer.renderables[mid].userProperties.Number);
        //                     for (let i = 1; i < 5; i++) {
        //                         if (PM.layer.renderables[mid + i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid + i].userProperties.Type == "Deaths") {
        //                                 data2.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid + i].userProperties.Type == "Recoveries") {
        //                                 data3.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             }
        //                         } else if (PM.layer.renderables[mid - i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid - i].userProperties.Type == "Deaths") {
        //                                 data2.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid - i].userProperties.Type == "Recoveries") {
        //                                 data3.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             }
        //                         }
        //                     }
        //                 } else if (PM.layer.renderables[mid].userProperties.Type == "Deaths") {
        //                     data2.push(PM.layer.renderables[mid].userProperties.Number);
        //                     for (let i = 1; i < 5; i++) {
        //                         if (PM.layer.renderables[mid + i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid + i].userProperties.Type == "Active Cases") {
        //                                 data1.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid + i].userProperties.Type == "Recoveries") {
        //                                 data3.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             }
        //                         } else if (PM.layer.renderables[mid - i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid - i].userProperties.Type == "Active Cases") {
        //                                 data1.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid - i].userProperties.Type == "Recoveries") {
        //                                 data3.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             }
        //                         }
        //                     }
        //                 } else if (PM.layer.renderables[mid].userProperties.Type == "Recoveries") {
        //                     data3.push(PM.layer.renderables[mid].userProperties.Number);
        //                     for (let i = 1; i < 5; i++) {
        //                         if (PM.layer.renderables[mid + i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid + i].userProperties.Type == "Active Cases") {
        //                                 data1.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid + i].userProperties.Type == "Deaths") {
        //                                 data2.push(PM.layer.renderables[mid + i].userProperties.Number);
        //                             }
        //                         } else if (PM.layer.renderables[mid - i].userProperties.Date === PM.userProperties.Date) {
        //                             if (PM.layer.renderables[mid - i].userProperties.Type == "Active Cases") {
        //                                 data1.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             } else if (PM.layer.renderables[mid - i].userProperties.Type == "Deaths") {
        //                                 data2.push(PM.layer.renderables[mid - i].userProperties.Number);
        //                             }
        //                         }
        //                     }
        //                 }
        //                 console.log(mid);
        //                 console.log(data1, data2, data3);
        //
        //                 label1 = "Active";
        //                 label2 = "Deceased";
        //                 label3 = "Recoveries";
        //                 let myChart = new Chart(ctx, {
        //                     type: 'bar',
        //                     data: {
        //                         labels: lArr,
        //                         datasets: [
        //                             {
        //                                 label: label1,
        //                                 backgroundColor: "#45c498",
        //                                 data: data1,
        //                             }, {
        //                                 label: label2,
        //                                 backgroundColor: "#ead04b",
        //                                 data: data2,
        //                             }
        //                             , {
        //                                 label: label3,
        //                                 backgroundColor: "#035992",
        //                                 data: data3,
        //                             }
        //                         ],
        //                     },
        //                     options: {
        //                         tooltips: {
        //                             displayColors: true,
        //                             callbacks: {
        //                                 mode: 'x',
        //                             },
        //                         },
        //                         scales: {
        //                             xAxes: [{
        //                                 stacked: true,
        //                                 gridLines: {
        //                                     display: false,
        //                                 }
        //                             }],
        //                             yAxes: [{
        //                                 stacked: true,
        //                                 ticks: {
        //                                     beginAtZero: true,
        //                                 },
        //                                 type: 'linear',
        //                             }]
        //                         },
        //                         responsive: true,
        //                         maintainAspectRatio: true,
        //                         legend: {position: 'bottom'},
        //                     }
        //                 });
        //
        //             } else if (vaccCheckbox.checked === true) {
        //
        //                 data1.push(PM.people_fully_vaccinated);
        //                 data2.push(PM.people_vaccinated - PM.people_fully_vaccinated);
        //                 label1 = "Completed";
        //                 label2 = "Incompleted";
        //                 let myChart = new Chart(ctx, {
        //                     type: 'bar',
        //                     data: {
        //                         labels: lArr,
        //                         datasets: [
        //                             {
        //                                 label: label1,
        //                                 backgroundColor: "#45c498",
        //                                 data: data1,
        //                             }, {
        //                                 label: label2,
        //                                 backgroundColor: "#ead04b",
        //                                 data: data2,
        //                             }
        //                         ],
        //                     },
        //                     options: {
        //                         tooltips: {
        //                             displayColors: true,
        //                             callbacks: {
        //                                 mode: 'x',
        //                             },
        //                         },
        //                         scales: {
        //                             xAxes: [{
        //                                 stacked: true,
        //                                 gridLines: {
        //                                     display: false,
        //                                 }
        //                             }],
        //                             yAxes: [{
        //                                 stacked: true,
        //                                 ticks: {
        //                                     beginAtZero: true,
        //                                 },
        //                                 type: 'linear',
        //                             }]
        //                         },
        //                         responsive: true,
        //                         maintainAspectRatio: true,
        //                         legend: {position: 'bottom'},
        //                     }
        //                 });
        //             }
        //         }
        let PkStartDate = sessionStorage.getItem('COVIDstartDate');
        if ((dFrom >= PkStartDate && PM.layer.renderables.length <= clientConfig.initLength + 1 ) || objButton.value == "1") { //If the requested range is 1 day or
            // if both (the from date is larger than or equal to the pk loaded date range and the length of the placemark renderables is greater than 1 + the placemark load range)

            let k = PM.layer.renderables.indexOf(PM);

            if (objButton.value == "1") {
                if (COVIDcheckbox.checked === true) {
                    data1.push(PM.userProperties["Active Cases"]);
                    data2.push(PM.userProperties["Deaths"]);
                    data3.push(PM.userProperties["Recoveries"]);
                    label1 = "Active";
                    label2 = "Deceased";
                    label3 = "Recoveries";

                }
                // else if (vaccCheckbox.checked === true) {
                //
                //     data1.push(PM.people_fully_vaccinated);
                //     data2.push(PM.people_vaccinated - PM.people_fully_vaccinated);
                //     label1 = "Completed";
                //     label2 = "Incompleted";
                //     let myChart = new Chart(ctx, {
                //         type: 'bar',
                //         data: {
                //             labels: lArr,
                //             datasets: [
                //                 {
                //                     label: label1,
                //                     backgroundColor: "#45c498",
                //                     data: data1,
                //                 }, {
                //                     label: label2,
                //                     backgroundColor: "#ead04b",
                //                     data: data2,
                //                 }
                //             ],
                //         },
                //         options: {
                //             tooltips: {
                //                 displayColors: true,
                //                 callbacks: {
                //                     mode: 'x',
                //                 },
                //             },
                //             scales: {
                //                 xAxes: [{
                //                     stacked: true,
                //                     gridLines: {
                //                         display: false,
                //                     }
                //                 }],
                //                 yAxes: [{
                //                     stacked: true,
                //                     ticks: {
                //                         beginAtZero: true,
                //                     },
                //                     type: 'linear',
                //                 }]
                //             },
                //             responsive: true,
                //             maintainAspectRatio: true,
                //             legend: {position: 'bottom'},
                //         }
                //     });
                // }
            } else if (objButton.value != "28" && objButton.value != "63") {  //If the requested range is not 2 weeks or past 1 month
                if (COVIDcheckbox.checked === true) {
                    label1 = "Active";
                    label2 = "Deceased";
                    label3 = "Recoveries";
                    console.log(k)
                    console.log(k - parseInt(objButton.value))

                    for (let j = k - parseInt(objButton.value); j < k ; j++) {
                        console.log(PM.layer.renderables[j]);
                        data1.push(PM.layer.renderables[j].userProperties["Active Cases"]);
                        data2.push(PM.layer.renderables[j].userProperties["Deaths"]);
                        data3.push(PM.layer.renderables[j].userProperties["Recoveries"]);
                    }
                }

            } else if (objButton.value == "28" || objButton.value == "63") {
                if (COVIDcheckbox.checked === true) {
                    label1 = "Active";
                    label2 = "Deceased";
                    label3 = "Recoveries";
                    for (let j = k - parseInt(objButton.value); j < k ; j += 7) {
                        data1.push(PM.layer.renderables[j].userProperties["Active Cases"]);
                        data2.push(PM.layer.renderables[j].userProperties["Deaths"]);
                        data3.push(PM.layer.renderables[j].userProperties["Recoveries"]);
                    }
                }
            }
            console.log(data1, data2, data3);

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
            });

        } else { //We will retrieve data from the table in the server
            console.log(dFrom);
            console.log(PkStartDate);
            console.log("run Ajax");
            $.ajax({
                url: '/chartData',
                type: 'GET',
                data: {dateFrom: dFrom, dateTo: pDate, dName: PM.userProperties.dName, dLayerType: PM.layer.layerType},
                dataType: 'json',
                async: false,
                success: function (resp) {
                    let j;
                    if (!resp.error) {
                        let availableDays;
                        console.log(dFrom);
                        console.log(resp.data);
                        console.log(objButton.value);
                        if (objButton.value <= resp.data.length) {
                            availableDays = objButton.value;
                        } else {
                            availableDays = resp.data.length;
                            alert("Some data is not be available. There are " +
                                (parseInt(objButton.value) - resp.data.length) + " day(s) of data missing");
                        }

                        // if (objButton.value <= resp.data.length) {
                        if (objButton.value != "28" && objButton.value != "63") {
                            for (j = 0; j < availableDays; j++) {
                                if (COVIDcheckbox.checked === true) {
                                    data1.push(resp.data[j].ActiveNum);
                                    data2.push(resp.data[j].DeathNum);
                                    data3.push(resp.data[j].RecovNum);
                                    label1 = "Active";
                                    label2 = "Deceased";
                                    label3 = "Recoveries";

                                } else if (vaccCheckbox.checked === true) {
                                    data1.push(resp.data[j].people_fully_vaccinated);
                                    data2.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                    label1 = "Completed";
                                    label2 = "Incompleted";
                                }
                            }

                        } else if (objButton.value == "28" || objButton.value == "63") {
                            for (j = 0; j < availableDays; j += 7) {
                                if (COVIDcheckbox.checked === true) {
                                    data1.push(resp.data[j].ActiveNum);
                                    data2.push(resp.data[j].DeathNum);
                                    data3.push(resp.data[j].RecovNum);
                                    label1 = "Active";
                                    label2 = "Deceased";
                                    label3 = "Recoveries";

                                } else if (vaccCheckbox.checked === true) {
                                    // iArr.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                    // cArr.push(resp.data[j].people_fully_vaccinated);
                                    data1.push(resp.data[j].people_fully_vaccinated);
                                    data2.push(resp.data[j].people_vaccinated - resp.data[j].people_fully_vaccinated);
                                    label1 = "Completed";
                                    label2 = "Incompleted";
                                }
                            }
                        }


                        if (COVIDcheckbox.checked === true) {
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
                        } else if (vaccCheckbox.checked === true) {
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
                        }

                    } else {
                        ErrorReturn("popup", "Popup" , false);
                    }
                }
            });
        }
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

    return {
        handleMouseCLK,
        handleMouseMove,
        handlePick,
    }
})