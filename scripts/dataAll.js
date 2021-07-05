define(['./WorldWindShim', 'Error'], function (WorldWind, ErrorReturn) {

    let arrDate = [];
    // let arrAll = [];
    let arrCountry = [];
    let arrDateV = [];
    let arrVCountries = [];
    // collect all the valid dates
    $.ajax({
        url: '/validateDate',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                arrDate = resp.data;
            }
            else{
                ErrorReturn("COVID date", "validateDate" , false);
            }
        }
    });

    // collect all placemark data
    $.ajax({
        url: '/allCountry',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                arrCountry = resp.data;
            }
            else {
                ErrorReturn("country", "allCountry" , false);
            }
        }
    });

    // collect all vaccine dates
    $.ajax({
        url: '/validateVDate',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {

            if (!resp.error) {
                arrDateV = resp.data;
            }
            else {
                ErrorReturn("vaccination date", "validateVDate" , false);
            }
        }
    });

    $.ajax({
        url: '/vaccineCountries',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                arrVCountries = resp.data;
            }
            else {
                ErrorReturn("vaccination country", "vaccineCountries" , false);
            }
        }
    })

    return {arrDate, arrCountry, arrDateV, arrVCountries}
});
