// routes/routes.js
const mysql = require('mysql');
const bodyParser = require('body-parser');
const serverConfig = require('../config/serverConfig');
const fs = require("fs");
const fsextra = require('fs-extra');
const request = require("request");
const cors = require('cors');
const path    = require('path');
const rateLimit = require("express-rate-limit");
const Download_From = serverConfig.Download_From;
const geoServer = serverConfig.geoServer;

const copySource = path.resolve(__dirname, serverConfig.Download_To); //the path of the source file
const copyDestDir = path.resolve(__dirname, serverConfig.Backup_Dir);
const download_interval = serverConfig.download_interval;

const con_DT = mysql.createConnection(serverConfig.commondb_connection);

con_DT.query('USE ' + serverConfig.Login_db); // Locate Login DB
const Limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
});

let downloadFalse = null ;

module.exports = function (app, passport) {

    removeFile();
    setInterval(copyXML, download_interval); // run the function one time a (day

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cors({
        origin: '*',
        credentials: true
    }));

    app.use(Limiter);

    // =====================================
    // CS APP Home Section =================
    // =====================================

    app.get('/', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        res.render('homepage.ejs')
    });

    app.get('/validateDate', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let validDateQuery = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrendsV3.covid_19 GROUP BY SUBSTRING(RID,1,10);";
        let validDateQuery = "SELECT Date From dtrendsV3.covid_19_nolocation GROUP BY Date order by Date;";
        // let validDateQuery = "SELECT * FROM dtrendsV3.covid_19_nolocation WHERE Date >= \"2021-03-01\" AND Date <= \"2021-03-31\" GROUP BY Date order by Date;";
        con_DT.query(validDateQuery, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // firstDate = results[0].Date;
                // lastSecondDate = results[results.length - 1].Date;

                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/validateVDate', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // let validDateVQuery = "SELECT Date From dtrendsV3.vaccinations GROUP BY date order by date;";
        let validDateVQuery = "SELECT Date From dtrendsV3.vaccinations_noloc GROUP BY date order by date;";
        // let validDateVQuery = "SELECT Date from dtrendsV3.CovidToolkit_Vaccination_v1 group by date order by date;";
        con_DT.query(validDateVQuery, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/1dVaccineData', function (req, res){
        res.setHeader("Access-Control-Allow-Origin","*");
        console.log(req.query);
        // let oneDayV = "select location, date, total_vaccinations, people_vaccinated, people_fully_vaccinated, daily_vaccinations, daily_vaccinations_per_million, Latitude, Longitude, Continent, CountryName  from dtrendsV3.vaccinations where Date >= ? AND Date <= ? order by location, Date;";
        let oneDayV = "select * from dtrendsV3.vaccinations_loc RIGHT JOIN dtrendsV3.vaccinations_noloc ON vaccinations_loc.location = vaccinations_noloc.location where Date >= ? AND Date <= ? order by dtrendsV3.vaccinations_loc.CountryName, Date;";
        // let oneDayV = "select CountryName, Date, TotalVaccinations, IncompletedVaccinated, FullyVaccinated, DailyVaccinations, DailyVaccinations_PerMillion "
        con_DT.query(oneDayV, [req.query.date[0], req.query.date[1]], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error" : true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    // app.get('/covidData', function (req, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     let oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation ON covid_19_loc.LocName = covid_19_nolocation.LocName WHERE Date >= ? AND Date <= ? order by CountryName, Date;";
    //     con_DT.query(oneDaysQ, [req.query.date[0], req.query.date[1]], function (err, results) {
    //         if (err) {
    //             console.log(err);
    //             res.json({"error": true, "message": "An unexpected error occurred !"});
    //         } else {
    //             res.json({"error": false, "data": results});
    //         }
    //     });
    // });

    app.get('/covidData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        let oneDaysQ;
        let reqParameters;

        if (!!req.query.country && req.query.country != "all_countries") {
            oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation " +
                "ON covid_19_loc.LocName = covid_19_nolocation.LocName " +
                "WHERE Date >= ? AND Date <= ? AND CountryName = ? order by Date;";
            reqParameters = [req.query.date[0], req.query.date[1], req.query.country];
        } else if (!!req.query.continent && req.query.continent != "none") {
            oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation " +
                "ON covid_19_loc.LocName = covid_19_nolocation.LocName " +
                "WHERE Date >= ? AND Date <= ? AND ContinentName = ? order by CountryName, Date;";
            reqParameters = [req.query.date[0], req.query.date[1], req.query.continent];
        } else {
            oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation " +
                "ON covid_19_loc.LocName = covid_19_nolocation.LocName " +
                "WHERE Date >= ? AND Date <= ? order by CountryName, Date;";
            reqParameters = [req.query.date[0], req.query.date[1]];
        }

        con_DT.query(oneDaysQ, reqParameters, function (err, results) {
            if (err) {
                console.error(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    // app.get('/contCOVID', function (req, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     let oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation " +
    //         "ON covid_19_loc.LocName = covid_19_nolocation.LocName " +
    //         "WHERE Date >= ? AND Date <= ? AND ContinentName = ? order by CountryName, Date;";
    //     con_DT.query(oneDaysQ, [req.query.date[0], req.query.date[1], req.query.continent], function (err, results) {
    //         if (err) {
    //             console.log(err);
    //             res.json({"error": true, "message": "An unexpected error occurred !"});
    //         } else {
    //             res.json({"error": false, "data": results});
    //         }
    //     });
    // });
    //
    // app.get('/countryCOVID', function (req, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     let oneDaysQ = "select * from dtrendsV3.covid_19_loc RIGHT JOIN dtrendsV3.covid_19_nolocation " +
    //         "ON covid_19_loc.LocName = covid_19_nolocation.LocName " +
    //         "WHERE Date >= ? AND Date <= ? AND CountryName = ? order by Date;";
    //     con_DT.query(oneDaysQ, [req.query.date[0], req.query.date[1], req.query.country], function (err, results) {
    //         if (err) {
    //             console.error(err);
    //             res.json({"error": true, "message": "An unexpected error occurred !"});
    //         } else {
    //             res.json({"error": false, "data": results});
    //         }
    //     });
    // });

    app.get('/allCountry', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let countryQ = "select CountryName, ContinentName from dtrendsV3.covid_19_loc group by CountryName;";
        con_DT.query(countryQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/vaccineCountries', function (req, res) {
       res.setHeader("Access-Control-Allow-Origin", "*");
       //let vaccineCountries = "select CountryName, Continent from dtrendsV3.vaccinations group by CountryName;";
       let vaccineCountries = "select CountryName, Continent from dtrendsV3.vaccinations_loc group by CountryName;";
       con_DT.query(vaccineCountries, function (err, results){
           if (err) {
               res.json({"error": true, "message": "An unexpected error occurred !"});
           } else {
               res.json({"error": false, "data": results})
           }
       });
    });

    app.get('/chartData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // console.log(req.query);
        let dName = req.query.dName;
        let dTo = req.query.dateTo;
        let dFrom = req.query.dateFrom;
        let dLayer = req.query.dLayerType;
        let statAll;

        console.log(dLayer);
        if (dLayer === "H_PKLayer") {
            statAll = "SELECT * From dtrendsV3.covid_19_nolocation WHERE LocName = '" + dName + "' AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "' ORDER BY Date ASC;";
            // console.log("H_PKLayer");
        } else if (dLayer === "V_PKLayer") {
            statAll = "select * from dtrendsV3.vaccinations_noloc  WHERE location = '" + dName + "'AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "' ORDER BY Date ASC;";
            // statAll = "SELECT * FROM dtrendsV3.vaccinations WHERE location = '" + dName + "'AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "' ORDER BY Date ASC;";
            // console.log("V_PKLayer");
        }

        // console.log(statAll);
        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrendsV3.covid_19;";
        // let statAll = "SELECT Date, DeathNum, RecovNum, ActiveNum From dtrendsV3.covid_19_nolocation WHERE LocName = '" + dName + "' AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "' ORDER BY Date ASC;";

        con_DT.query(statAll, function (err, results) {
            if (err) {
                // console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/position',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let layername = req.query.layername;
        let parsedLayers = layername.split(",");

        con_DT.query('SELECT Longitude, Latitude, Altitude FROM LayerMenu WHERE LayerName = ?', parsedLayers[0], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "no result found!"});
            } else {
                res.json(results);
            }
        });
    });

    app.get('/reDownload', () => predownloadXml());

    function copyXML(){
        const today = new Date();//get the current date
        let date = today.getFullYear()+ '_' +(today.getMonth()+1)+ '_' + today.getDate();
        let time = today.getHours() + "_" + today.getMinutes()+'_' + today.getSeconds();
        let dataStr = date + "_"+ time;
        let copyDest = copyDestDir + '/' + dataStr+ '.xml'; //define a file name
        fsextra.copy(copySource, copyDest) //copy the file and rename
            .then(//if copy succeed, call pre-download XML function
                console.log('copy successful'),
                predownloadXml ()
            )
    }

    function predownloadXml () {
        const requestOptions = {
            uri: Download_From,
            timeout: download_interval - 20000
        };
        let resXMLRequest;
        console.log('predownloadXML was called');

        request.get(requestOptions)
            .on('error',function(err){ //called when error
                console.log(err.code);
                console.log('predownloadXML error');
                removeFile();
                // process.exit(0)
            })
            .on('response', function (res) {
                resXMLRequest = res;
                if (res.statusCode === 200){
                    res.pipe(fs.createWriteStream(copySource));
                    console.log('download starting');
                } else {
                    console.log("Respose with Error Code: " + res.statusCode);
                    removeFile();
                    // process.exit(0)
                }
            })
            .on('end', function () {
                downloadFalse = false;
                console.log("The End: " + resXMLRequest.statusCode);
                removeFile();
                // process.exit(0)
            })
    }

    function removeFile() {

        console.log('the remove function was called at: ' + copyDestDir);

        fs.readdir(copyDestDir, (err, files) => {//a method to calculate the number of the files in the geoCapacity folder

        });
    }
};
