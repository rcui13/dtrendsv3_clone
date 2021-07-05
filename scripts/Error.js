define([], function () {
    function ErrorReturn (data, funcName, refresh=false) {
        if (refresh == true) {
            console.error("Error retrieving " + data + " data from server (" + funcName + ")");
            console.trace();
            if(confirm("Error retrieving " + data + " data from server. Would you like to refresh the page? ")) {
                location.reload();
                return false;
            }
        } else {
            console.error("Error retrieving " + data + " data from server (" + funcName + ")");
            console.trace();
            alert("Error retrieving " + data + " data/configurations from server (" + funcName + ")");
        }

    }
    return ErrorReturn;
})