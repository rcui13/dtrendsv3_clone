const serverConfig = require('../config/serverConfig');
const mysql = require('mysql2');
const Client = require('ssh2').Client;
let ssh = new Client();

let db = new Promise(function(resolve, reject){
    ssh.on('ready', function() {
        ssh.forwardOut(

            // source address, this can usually be any valid address
            serverConfig.liveDB_connection.mySql_sourceHost,

            // source port, this can be any valid port number
            serverConfig.liveDB_connection.mySql_sourcePort,

            // destination address (localhost here refers to the SSH server)
            serverConfig.liveDB_connection.mySql_destHost,

            // destination port
            serverConfig.liveDB_connection.mySql_destPort,

            function (err, stream) {

                if (err) throw err; // SSH error: can also send error in promise ex. reject(err)

                // use `sql` connection as usual

                let con = mysql.createConnection({

                    host     : serverConfig.liveDB_connection.mySql_destHost,
                    user     : serverConfig.liveDB_connection.mySql_user,
                    password : serverConfig.liveDB_connection.mySql_password,
                    stream: stream
                    // database : 'test',
                });

                // send connection back in variable depending on success or not
                con.connect(function(err){
                    if (!err) {
                        resolve(con);
                    } else {
                        reject(err);
                    }
                });
            });
    }).connect({
        host: serverConfig.liveDB_connection.ssh_destHost,
        port: serverConfig.liveDB_connection.ssh_destPort,
        username: serverConfig.liveDB_connection.ssh_user,
        password: serverConfig.liveDB_connection.ssh_password
    });
});

module.exports = db;