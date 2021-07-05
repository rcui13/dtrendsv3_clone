define(['./jquery-csv-1.0.11'], function () {
    "use strict";

    // load csv data for Agrosphere placemarks
    let csvFiles1 = [
        '../csvdata/countries.csv',
        '../csvdata/weatherstations.csv',
        '../csvdata/cropAcros.csv'
    ];
    // load csv data for Agrosphere graphs
    let csvFiles2 = ['../csvdata/FAOcrops.csv', '../csvdata/Atmo.csv',
        '../csvdata/prices2.csv', '../csvdata/livestock.csv',
        '../csvdata/emissionAll.csv', '../csvdata/Monthly_AvgData1.csv',
        '../csvdata/pesti.csv', '../csvdata/ferti.csv',
        '../csvdata/yield.csv', '../csvdata/refugeeout.csv'
    ];

    function loadCSVdata(csvList) {
        //Find the file
        let csvString = "";
        let csvData = [];
        for (let i = 0; i < csvList.length; i++) {
            $.ajax({
                async: false,
                url: csvList[i],
                success: function (file_content) {
                    csvString = file_content;
                    csvData.push($.csv.toObjects(csvString));
                }
            });
        }
        return csvData;
    }

    function loadCSVDataArray(csvList) {
        //Find the file
        let csvString = "";
        let csvData = [];
        let i = 0;
        //Send out request and grab the csv file content
        for (i = 0; i < csvList.length; i++) {
            let csvRequest = $.ajax({
                async: false,
                url: csvList[i],
                success: function(file_content) {
                    csvString = file_content;
                    csvData.push($.csv.toArrays(csvString));
                }
            });
        }
        return csvData;
    }

    return {csv1: loadCSVdata(csvFiles1),csv2: loadCSVDataArray(csvFiles2)}

});