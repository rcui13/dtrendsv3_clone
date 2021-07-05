requirejs.config({
    waitSeconds: 0,
    baseUrl: "scripts"
});

requirejs([
    'globeObject'
    , 'dataAll'
    , 'LayerManager'
    // , 'LayerManager_AZ'
    , '3rdPartyLibs/Chart-2.9.3.min.js'
    , 'newcovidPK'
    // , 'covidPK'
    // , 'vaccinePK'
    , 'vaccinePK_v3'
    , 'controls'
    , '../config/clientConfig.js'
    ,'Error'
    ,'slider'
    ,'./update'
    // ,'Popup'
    ,'newPopup'
    , 'csvData'
    , 'cAgrosPK'
    , 'graphsData'
    , 'Wmslayer'
    ,'menu'
], function (newGlobe, dataAll, LayerManager, Chart, covidPK, vaccinePK, controls, clientConfig, ErrorReturn, slider, Update, popup) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);
    let COVIDcheckbox = document.getElementById("COVID-19-checkbox");
    let vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");

    newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));
    console.log(newGlobe.layers);
    if (clientConfig == null || covidPK == null) {
        ErrorReturn("placemarks and layers", "Home" , true);
    }

    let date1Index = dataAll.arrDate.length - 1 - clientConfig.initLength;
    let date2Index = dataAll.arrDate.length - 1;
    let date1 = dataAll.arrDate[date1Index];
    let date2 = dataAll.arrDate[date2Index];

    let dateV1Index = 0;
    let dateV2Index = dataAll.arrDateV.length - 1;
    let dateV1 = dataAll.arrDateV[dateV1Index];
    let dateV2 = dataAll.arrDateV[dateV2Index];

    while (dateV1.Date.includes('NaN')) {
        dateV1Index += 1
        dateV1 = dataAll.arrDate[dateV1Index];
        if (dateV1Index >= dateV2Index) {
            ErrorReturn("date", "Home" , true);
        }
    }
    while (dateV2.Date.includes('NaN')) {
        dateV2Index -= 1
        dateV2 = dataAll.arrDate[dateV2Index];
        if (dateV2Index <= 0) {
            ErrorReturn("date", "Home" , true);
        }
    }

    if (!!date1 && !!date2 && !!dateV1 && !!dateV2) {
        covidPK.covidPK([date1.Date, date2.Date], "Confirmed Cases", "init", date2.Date);
    } else {ErrorReturn("date", "Home" , true);}
    let click_event = new CustomEvent('click');

    let fromDate = $('#fromdatepicker');
    let toDate = $('#todatepicker');
    let curDate = $("#currentdatepicker");
    let allFromDate = $('.fromdatepicker');
    let layerSelected, Altitude;

    const covidList = [
        $('#conConfirmed'),
        $('#conDeaths'),
        $('#conRecoveries'),
        $('#conActive'),
    ];
    let parsedCovidList = [];

    const vaccList = [
        $('#totVaccinations'),
        $('#incVaccinations'),
        $('#comVaccinations'),
        $('#daiVaccinations'),
        $('#milVaccinations'),
    ];
    let parsedVaccList = [];
    const contVal = ["North_America", "Europe", "South_America", "Asia", "Africa", "Oceania"];

    //All the event listeners
    $(document).ready(function () {

        let ls = localStorage.getItem('namespace.visited');
        if (ls == null) {
            alert('Welcome to the A World Bridge COVID Toolkit! ' + "\r\n" +
                'For a better experience, please accept all cookies. ' +
                'If you are experiencing any problems, ' +
                'please try switching a browser (Chrome or Firefox) or watching the tutorial on the lower right corner.');
            localStorage.setItem('namespace.visited', 1);
            if (navigator.cookieEnabled === false) {
                alert("You have cookies disabled. ")
            }
        }

        sessionStorage.setItem('COVIDLayerList', JSON.stringify( {}));
        sessionStorage.setItem('vaccLayerList', JSON.stringify( {}));

        //COVID Tab info event listeners under graphs/charts tab on the right
        $("#conC").on("click", function (e) {
            openTabInfo(e, 'confirmed_cases');
        });

        $("#conD").on("click", function (e) {
            openTabInfo(e, 'confirmed_deaths');
        });

        $("#conR").on("click", function (e) {
            openTabInfo(e, 'confirmed_recoveries');
        });

        $("#conA").on("click", function (e) {
            openTabInfo(e, 'confirmed_active');
        });

        //vacc Tab info event listeners under graphs/charts tab on the right
        $("#totV").on("click", function (e) {
            openTabInfo(e, 'confirmed_vacc');
        });

        $("#incV").on("click", function (e) {
            openTabInfo(e, 'confirmed_incvacc');
        });

        $("#comV").on("click", function (e) {
            openTabInfo(e, 'confirmed_comvacc');
        });

        $("#daiV").on("click", function (e) {
            openTabInfo(e, 'confirmed_daivacc');
        });

        $("#milV").on("click", function (e) {
            openTabInfo(e, 'confirmed_milvacc');
        });
        let limit = 1024 * 1024 * 5; // 5 MB
        let remSpace = limit - unescape(encodeURIComponent(JSON.stringify(sessionStorage))).length;
        if (remSpace <= 0.1) {
            alert("No space left in session storage!")
        }

        $("#FoodSecurity-Agrosphere").find("input").on("click", function (e) {
            $("#Country-checkbox").change(function () {
                //Shows/hides menu below, sets country placemarks' layer to .enabled and toggles all the toggles beneath it
                let toggle = this;
                let findLayerIndex;
                if (newGlobe.layers[6].displayName == 'Country PK') {
                    findLayerIndex = 6;
                } else {
                    findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country PK');
                    if (findLayerIndex == null || findLayerIndex == -1) {
                        findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
                    }
                }

                if (newGlobe.layers[findLayerIndex] !== undefined && findLayerIndex != -1) {
                    if (toggle.checked === true) {
                        if (ls=== null) {
                            alert("Agrosphere country placemarks are loading... please be patient")
                        }
                        newGlobe.layers[findLayerIndex].enabled = true;
                    } else if (toggle.checked === false) {
                        newGlobe.layers[findLayerIndex].enabled = false;
                        document.getElementById("selectedCountry").innerHTML = " ";
                    }
                } else {
                    alert("Error! Agrosphere country placemarks are currently unavailable");
                    toggle.checked = false;
                    document.getElementById("Country-checkbox").disabled = true;
                }
            });

            $("#Weather-checkbox").change(function () {
                //Shows/hides menu below, sets weather placemarks' layer to .enabled
                let toggle = this;
                let findLayerIndex;
                if (newGlobe.layers[6].displayName == 'Weather Station PK') {
                    findLayerIndex = 6;
                } else {
                    findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Weather Station PK');
                    if (findLayerIndex == null || findLayerIndex == -1) {
                        findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Weather_Station_PK');
                    }
                }
                if (newGlobe.layers[findLayerIndex] !== undefined && findLayerIndex != -1) {
                    if (toggle.checked === true) {
                        newGlobe.layers[findLayerIndex].enabled = true;
                    } else if (toggle.checked === false) {
                        newGlobe.layers[findLayerIndex].enabled = false;
                        document.getElementById("selectedCountry").innerHTML = " ";
                    }
                } else {
                    alert("Error! Weather station placemarks are currently unavailable");
                    toggle.checked = false;
                    document.getElementById("Weather-checkbox").disabled = true;
                }
            });
        });

        $("#SentinelSatelliteData").find("input").on("click", function (e) {
            $(".SentinelSatelliteData-checkbox").change(function(){
                let toggle = this;
                togglePK(toggle.value, toggle.checked);
            });
        });

        $("#COVID-19-checkbox").on("click", async function (e) {
            toDate.val(date2.Date);
            curDate.val(date2.Date);
            vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
            if (this.checked) {
                document.getElementById("COVID-category").disabled = false;
                document.getElementById("datesliderdiv").hidden = false;
                document.getElementById("vaccine-category").disabled = true;
                document.getElementById("drawingtools-span").classList.remove("disabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("disabled-icon");
                document.getElementById("drawingtools-span").classList.add("enabled-icon");
                document.getElementById("diseasetrends-span").classList.add("enabled-icon");
                document.getElementById("charts").classList.add("enabled-icon");
                document.getElementById("charts").classList.remove("disabled-icon");
                document.getElementById("COVID-19-atag").classList.add("enabled-icon");
                document.getElementById("COVID-19-atag").classList.remove("disabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.add("disabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.remove("enabled-icon");
                vaccCheckbox.checked = false;
                document.getElementById("categoryListVaccinations").hidden = true;
                document.getElementById("categoryList").hidden = false;
                $('#filter').removeClass('disabled-icon');
                $('#edit').removeClass('disabled-icon');
                await controls.closeAllVaccine();
                await controls.enableAllCovid();
                $( "#slider-range" ).slider( "enable" );

                flatpickr(".date", {
                    defaultDate: date2.Date,
                    minDate: dataAll.arrDate[0].Date,
                    maxDate: date2.Date,
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });

                $("#continentList").find("button").html("All Continents" + ' <span class="caret"></span>');
                $("timelapseText").text("Timelapse of COVID-19");
                vaccCheckbox.checked = false;
                document.querySelector('#diseasetrends-tab').dispatchEvent(click_event);

                if (document.getElementById("graphs").style.display == "none") {
                    document.querySelector('#charts').dispatchEvent(click_event);
                }
                $('.COVIDTab').show();
                $('.vaccTab').hide();
                $('.COVIDTabNumber').hide();
                allFromDate.val(dataAll.arrDate[0].Date);
                await slider.rangeSlider();
                await slider.filterOptionDialog();
                await slider.editDialog();
                await slider.infectionSlider(parseInt(sessionStorage.getItem('COVIDinfectionMax')));
            } else {
                $( "#slider-range" ).slider( "disable" );
                await controls.closeAllCovid();

                if (document.getElementById("graphs").style.display == "block") {
                    document.querySelector('#charts').dispatchEvent(click_event);
                }
                $('.COVIDTab').hide();
                document.getElementById("COVID-category").disabled = true;
                document.getElementById("datesliderdiv").hidden = true;
                document.getElementById("drawingtools-span").classList.remove("enabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("enabled-icon");
                document.getElementById("drawingtools-span").classList.add("disabled-icon");
                document.getElementById("diseasetrends-span").classList.add("disabled-icon");
                document.getElementById("charts").classList.remove("enabled-icon");
                document.getElementById("charts").classList.add("disabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.remove("disabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.add("enabled-icon");
            }
        });

        $("#GlobalVaccinations-checkbox").on("click", async function(){
            toDate.val(dateV2.Date);
            curDate.val(dateV2.Date);
            COVIDcheckbox = document.getElementById("COVID-19-checkbox");
            if (this.checked){
                document.getElementById("vaccine-category").disabled = false;
                document.getElementById("datesliderdiv").hidden = false;
                await $('.overlay').show();
                await vaccinePK.vaccinePK([dateV1.Date, dateV2.Date], "Total Vaccinations", "init");
                // sessionStorage.setItem('vaccStartDate', dateV1.Date);
                // sessionStorage.setItem('vaccEndDate', dateV2.Date);
                document.getElementById("COVID-category").disabled = true;
                document.getElementById("drawingtools-span").classList.remove("disabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("disabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.remove("disabled-icon");
                document.getElementById("charts").classList.remove("disabled-icon");
                $('#edit').removeClass('disabled-icon');
                document.getElementById("COVID-19-atag").classList.add("disabled-icon");

                document.getElementById("charts").classList.add("enabled-icon");
                document.getElementById("drawingtools-span").classList.add("enabled-icon");
                document.getElementById("diseasetrends-span").classList.add("enabled-icon");
                document.getElementById("GlobalVaccinations-atag").classList.add("enabled-icon");
                document.getElementById("COVID-19-atag").classList.remove("enabled-icon");
                $('#filter').addClass('disabled-icon'); //The vaccination placemarks are already fully loaded, so there's no need to allow them to select which date range should be loaded
                COVIDcheckbox.checked = false;
                document.getElementById("categoryListVaccinations").hidden = false;
                document.getElementById("categoryList").hidden = true;
                document.querySelector('#diseasetrends-tab').dispatchEvent(click_event);

                flatpickr(".date", {
                    defaultDate: dateV2.Date,
                    minDate: dateV1.Date,
                    maxDate: dateV2.Date,
                    inline: false,
                    dateFormat: "Y-m-d",
                    time_24hr: true
                });

                await controls.closeAllCovid();
                await controls.enableAllVaccine();
                await slider.dateSlider(dateV2.Date);
                $( "#slider-range" ).slider( "enable" );
                COVIDcheckbox.checked = false;
                $("#continentList").find("button").html("All Continents" + ' <span class="caret"></span>');
                $("timelapseText").text("Timelapse of COVID-19 Vaccinations");

                if (document.getElementById("graphs").style.display == "none") {
                    document.querySelector('#charts').dispatchEvent(click_event);
                }
                $('.COVIDTab').hide();
                $('.vaccTab').show();
                $('.vaccTabNumber').hide();
                toDate.val(dateV2.Date);
                curDate.val(dateV2.Date);
                allFromDate.val(dataAll.arrDateV[0].Date);
                await slider.rangeSlider();
                await slider.filterOptionDialog();
                await slider.editDialog();
                await slider.infectionSlider(parseInt(sessionStorage.getItem('vaccInfectionMax')));
                document.getElementById("overlay").style.display = "none";
            } else {

                $( "#slider-range" ).slider( "disable" );
                await controls.closeAllVaccine();

                if (document.getElementById("graphs").style.display == "block") {
                    document.querySelector('#charts').dispatchEvent(click_event);
                }
                $('.vaccTab').hide();
                document.getElementById("vaccine-category").disabled = true;
                document.getElementById("datesliderdiv").hidden = true;
                document.getElementById("drawingtools-span").classList.remove("enabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("enabled-icon");
                document.getElementById("drawingtools-span").classList.add("disabled-icon");
                document.getElementById("diseasetrends-span").classList.add("disabled-icon");
                document.getElementById("charts").classList.remove("enabled-icon");
                document.getElementById("charts").classList.add("disabled-icon");
                document.getElementById("COVID-19-atag").classList.remove("disabled-icon");
                document.getElementById("COVID-19-atag").classList.add("enabled-icon");
            }
        });

        $('#accordion').find("a").on('click', function (e) {
            let divid = e.target.hash + '';
            let atag = this;
            if (atag.id !== 'FoodSecurity-SentinelSatelliteData-Agriculture-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-FalseColor(Urban)-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-FalseColor(Vegetation)-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-Geology-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-NaturalColor(TrueColor)-a') {
                document.getElementById(divid.substring(1)).style.visibility = 'visible';
                let parentATag = divid.substring(1).trim().split("-");
                parentATag.pop();
                parentATag = parentATag.join("-") + "-a"

                $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById(parentATag))
                    .addClass('collapsed');

                let hrefvalue = $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById(parentATag))
                    .attr("href");

                if (hrefvalue !== undefined) {
                    document.getElementById(hrefvalue.substring(1)).setAttribute("class", "collapsing");
                    document.getElementById(hrefvalue.substring(1)).removeAttribute("class", "collapsing");
                    document.getElementById(hrefvalue.substring(1)).style.visibility = 'hidden';
                    document.getElementById(hrefvalue.substring(1)).removeAttribute("class", "in");
                    document.getElementById(hrefvalue.substring(1)).setAttribute("aria-expanded", "false");
                    document.getElementById(hrefvalue.substring(1)).style.height = '0px';
                }

                $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById(parentATag))
                    .attr('aria-expanded', 'false');
            }
        });

        //Initialize projection menu
        layerManager.createProjectionList();
        $("#projectionDropdown").find(" li").on("click", function (e) {
            layerManager.onProjectionClick(e);
        });

        // layerManager.diseaseList();
        // layerManager.agrosList();
        layerManager.continentList();
        layerManager.categoryList();
        layerManager.categoryListVaccine();
        layerManager.synchronizeLayerList();
        //sets date picker values. when user changes the date, globe will redraw to show the placemarks of current day
        fromDate.val(date1.Date);
        toDate.val(date2.Date);
        curDate.val(date2.Date);

        //loads initial case numbers
        curDate.change(function () {
            if (document.getElementById('COVID-19-checkbox').checked) {
                if (curDate.val() > date1.Date || curDate.val() < dataAll.arrDate[0].Date) {
                    alert("Current day selection beyond available range.");
                } else {
                    Update.updateCurr(curDate.val());
                }
            } else if (document.getElementById('GlobalVaccinations-checkbox').checked) {
                if (curDate.val() > dateV1.Date || curDate.val() < dateV2.Date) {
                    alert("Current day selection beyond available range.");
                } else {
                    Update.updateCurr(curDate.val());
                }
            }
        });

        // when user changes the 'From' date, updates starting date for timelapse
        fromDate.change(function () {
            if (fromDate.val() > toDate.val()) {
                alert("From date value cannot exceed to date value.");
                fromDate.val(toDate.val());
            } else {
                Update.updateFrom(fromDate.val());
            }
        });
        toDate.change(function () {
            if (toDate.val() < fromDate.val()) {
                alert("To date value cannot be smaller than from date value.");
                toDate.val(fromDate.val());
            } else {
                Update.updateTo(toDate.val());
            }
        });

        $('#drFrom').change(function () {
            if ($('#drFrom').val() > $('#drTo').val()) {
                alert("From date value cannot exceed to date value.");
                $('#drFrom').val($('#drTo').val());
            } else {
                $( "#doubleSlider-range" ).slider( "values", 0, new Date($('#drFrom').val()).getTime() / 1000);
            }
        });

        $('#drTo').change(function () {
            if ($('#drFrom').val() > $('#drTo').val()) {
                alert("To date value cannot be smaller than from date value.");
                $('#drTo').val($('#drFrom').val());
            } else {
                $( "#doubleSlider-range" ).slider( "values", 1, new Date($('#drTo').val()).getTime() / 1000);
            }
        });

        $('#foFrom').change(function () {
            if ($('#foFrom').val() > $('#foTo').val()) {
                $('#foFrom').val($('#foTo').val());
                alert("From date value cannot exceed to date value.");
            }
        });

        $('#foTo').change(function () {
            if ($('#foFrom').val() > $('#foTo').val()) {
                $('#foTo').val($('#foFrom').val());
                alert("To date value cannot be smaller than from date value.");
            }
        });

        //load slider functionalities
        slider.dateSlider(curDate.val());
        slider.speedSlider();

        //overlays sub dropdown menus
        $('.dropdown-submenu a.test').on("click", function (e) {
            $(this).next('ul').toggle();

            e.stopPropagation();
            e.preventDefault();
        })

        controls.subDropdown();

        //sets date picker format; disables all dates without data available
        console.log(dataAll.arrDate.length - 1,dataAll.arrDate[0].Date, date1.Date, dataAll.arrDate[dataAll.arrDate.length - 1].Date);
            flatpickr(".date", {
                defaultDate: date2.Date,
                minDate: dataAll.arrDate[0].Date,
                maxDate: date2.Date,
                inline: false,
                dateFormat: "Y-m-d",
                time_24hr: true
            });

        $("#popover").popover({html: true, placement: "top", trigger: "hover"});

        //enables all covid/vacc placemarks
        $('#refresh').click(async function () {
            COVIDcheckbox = document.getElementById("COVID-19-checkbox");
            vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
            let continentVal = document.getElementById("continentList").innerText.trim();
            continentVal = continentVal.trim().split(' ').join('_');
            if (COVIDcheckbox.checked === true) {
                //The only reason we created "totalCaseNum" for session storage is for the refresh
                parsedCovidList = JSON.parse(sessionStorage.getItem('totalCaseNum'));
                if (!contVal.includes(continentVal)) {
                    continentVal = "All Continents";
                }
                covidList.forEach(function (elem, i) {
                    covidList[i].text(parsedCovidList[continentVal][i]);
                });

                await controls.enableAllCovid();
            } else if (vaccCheckbox.checked === true) {
                parsedVaccList = JSON.parse(sessionStorage.getItem('totalVaccNum'));
                if (!contVal.includes(continentVal)) {
                    continentVal = "All Continents";
                }
                vaccList.forEach(function (elem, i) {
                    vaccList[i].text(parsedVaccList[continentVal][i]);
                });

                await controls.enableAllVaccine();
            }
        });

        //disables all covid placemarks
        $('#clear').click(function () {
            COVIDcheckbox = document.getElementById("COVID-19-checkbox");
            vaccCheckbox = document.getElementById("GlobalVaccinations-checkbox");
            if (COVIDcheckbox.checked === true){
                // parsedCovidList = [
                //     parseInt($('#conConfirmed').text()),
                //     parseInt($('#conDeaths').text()),
                //     parseInt($('#conRecoveries').text()),
                //     parseInt($('#conActive').text()),
                // ];
                //
                // console.log(parsedCovidList)
                // sessionStorage.setItem('covidNumList', JSON.stringify(parsedCovidList));
                controls.closeAllCovid();

                covidList.forEach(function (elem, i) {
                    covidList[i].text("0");
                });
            } else if (vaccCheckbox.checked === true) {

                parsedVaccList = [
                    parseInt($('#totVaccinations').text()),
                    parseInt($('#incVaccinations').text()),
                    parseInt($('#comVaccinations').text()),
                    parseInt($('#daiVaccinations').text()),
                    parseInt($('#milVaccinations').text()),
                ];
                sessionStorage.setItem('vaccNumList', JSON.stringify(parsedVaccList));

                controls.closeAllVaccine();
                vaccList.forEach(function (elem, i) {
                    vaccList[i].text("0");
                })
            }
        });

        //enables and disables the navigation controls
        $('#navControls').click(function () {
            controls.onNav();
        })

        //dropdown menu for placemark category
        $("#categoryList").find("li").on("click", function (e) {
            controls.onCategory(e);
        });

        $("#categoryListVaccinations").find("li").on("click", function (e) {
            controls.onCategoryV(e);
        });

        //dropdown menu for continent selection
        $("#continentList").find("li").on("click", function (e) {
            controls.onContinent(e);
        });

        $('#filterContinents').on('change', function() {
            controls.onContinent("none",this.value);
        });

        $('#filterCountries').on('change', function() {
            if ($(this).val().trim() !== "all_countries") {
                $('#clear').click();
                document.querySelector('#'+ $(this).val().trim()).dispatchEvent(click_event);
            } else {
                $('#refresh').click();
            }
        });

        //timelapse: start button
        $('#toggleTL').click(function () {
            $('#pauseTL').show();
            $('#stopTL').show();
            $('#toggleTL').hide();
            curDate.attr('disabled', true);
            fromDate.attr('disabled', true);
            toDate.attr('disabled', true);
            $("#speedSlider").slider("disable");
            $("#slider-range").slider("disable");
            $("#hInfectionSlider").slider("disable");
            document.getElementById("controls-span").classList.remove("enabled-icon");
            document.getElementById("diseasetrends-span").classList.remove("enabled-icon");
            document.getElementById("edit").classList.remove("enabled-icon");
            document.getElementById("filter").classList.remove("enabled-icon");
            document.getElementById("controls-span").classList.add("disabled-icon");
            document.getElementById("diseasetrends-span").classList.add("disabled-icon");
            document.getElementById("edit").classList.add("disabled-icon");
            document.getElementById("filter").classList.add("disabled-icon");
            slider.timelapse(fromDate.val(),toDate.val());
        });

        //timelapse: stop button
        $('#stopTL').click(async function () {
            $('#playTL').hide();
            $('#pauseTL').hide();
            $('#toggleTL').show();
            $('#stopTL').hide();
            curDate.attr('disabled', false);
            fromDate.attr('disabled', false);
            toDate.attr('disabled', false);
            $("#speedSlider").slider("enable");
            $("#slider-range").slider("enable");
            $("#hInfectionSlider").slider("enable");
            curDate.val(fromDate.val());
            $("#amount").val(fromDate.val());
            document.getElementById("controls-span").classList.add("enabled-icon");
            document.getElementById("diseasetrends-span").classList.add("enabled-icon");
            document.getElementById("edit").classList.add("enabled-icon");
            document.getElementById("filter").classList.add("enabled-icon");
            document.getElementById("controls-span").classList.remove("disabled-icon");
            document.getElementById("diseasetrends-span").classList.remove("disabled-icon");
            document.getElementById("edit").classList.remove("disabled-icon");
            document.getElementById("filter").classList.remove("disabled-icon");
            await slider.clearI();
            let val = new Date(fromDate.val()).getTime() / 1000 + 86400;
            await $("#slider-range").slider("value", val);
            // slider.dateSlider(fromDate.val());
        });

        //timelapse: pause button
        $('#pauseTL').click(function () {
            $('#pauseTL').hide();
            $('#stopTL').show();
            $('#playTL').show();
            curDate.attr('disabled', false);
            fromDate.attr('disabled', true);
            toDate.attr('disabled', false);
            $("#speedSlider").slider("enable");
            $("#slider-range").slider("enable");
            $("#hInfectionSlider").slider("enable");
            document.getElementById("controls-span").classList.add("enabled-icon");
            document.getElementById("diseasetrends-span").classList.add("enabled-icon");
            document.getElementById("controls-span").classList.remove("disabled-icon");
            document.getElementById("diseasetrends-span").classList.remove("disabled-icon");
            slider.clearI();
        });

        //timelapse: play button
        $('#playTL').click(function () {
            $('#pauseTL').show();
            $('#stopTL').show();
            $('#playTL').hide();
            curDate.attr('disabled', true);
            fromDate.attr('disabled', true);
            toDate.attr('disabled', true);
            $("#speedSlider").slider("disable");
            $("#slider-range").slider("disable");
            $("#hInfectionSlider").slider("disable");
            document.getElementById("controls-span").classList.remove("enabled-icon");
            document.getElementById("diseasetrends-span").classList.remove("enabled-icon");
            document.getElementById("controls-span").classList.add("disabled-icon");
            document.getElementById("diseasetrends-span").classList.add("disabled-icon");
            let a = dataAll.arrDate.findIndex(dat => dat.Date === curDate.val());
            slider.timelapse(dataAll.arrDate[a + 1].Date, toDate.val());
        });

        //far right of date slider overlay; opens dialog when filter is selected
        $('#filter').click(function () {
            $("#dialog").dialog("open");
        });

        //prompts date range adjustments
        $('#edit').click(function () {
            slider.edit();
        })

        $('#fullLoad').click(function () {
            slider.fullLoad();
        })

        //selecting placemark creates pop-up
        newGlobe.addEventListener("click", popup.handleMouseCLK);
        //selecting popover creates pop-up
        document.getElementById("popover").addEventListener("click", popup.handleMouseCLK);
        //hovering over placemark creates pop-up
        newGlobe.addEventListener("mousemove", popup.handleMouseMove);

        //Changes all the from date
        allFromDate.val(dataAll.arrDate[0].Date);
        slider.rangeSlider();
        slider.infectionSlider();
        slider.opacitySlider();

        //load dialog boxes for filter options and edit mode
        slider.filterOptionDialog();
        slider.editDialog();
    });


    function globePosition(request) {
        $.ajax({
            url: '/position',
            type: 'GET',
            dataType: 'json',
            data: request, //send the most current value of the selected switch to server-side
            async: false,
            success: function (results) {
                layerSelected = results[0];
                Altitude = layerSelected.Altitude * 5000;
                newGlobe.goTo(new WorldWind.Position(layerSelected.Latitude, layerSelected.Longitude, Altitude));
            }
        })
    }
    async function togglePK(countryN, status) {

        if (countryN !== undefined || status !== undefined) {
            let findLayerIndex = await newGlobe.layers.findIndex(ele => ele.displayName === countryN);

            //turn on/off the pk
            if (findLayerIndex >= 0) {
                newGlobe.layers[findLayerIndex].enabled = status;

                let layerRequest = "layername=" + countryN;
                globePosition(layerRequest);
            } else {
                console.warn("Layer not found!");
            }
        } else {
            alert("Error! Layer wasn't found. ");
        }

    }
});