

//this is a function to grab a single body from our server
function getBody(bodyCallback)
{
    console.log('Senidng body requests');
    $.getJSON('http://127.0.0.1:3000/get',function(jsonData)
    {
        console.log('Return body request');
        bodyCallback(jsonData);
    });
};

//this is a function to grab multiple bodies from our server
function getBodies(numberBodies, bodyCallback)
{
    console.log('Sending multibody request');

    $.ajax({
        url: "http://127.0.0.1:3000/getBodies",
        type: 'GET',
        data: {"numberOfBodies" : numberBodies },
        cache: false,
        timeout: 30000,
        complete: function() {
            //called when complete
            console.log('done with get bodies request');
        },

        success: function(data) {

            console.log('Multibody success');
            bodyCallback(data);

        },

        error: function(err) {
            console.log('Multibody error: ' + err.responseText);
        }
    });



};

function toggleSelectedBody(genomeID, successCallback, errorCallback)
{

    $.ajax({
        url: "http://127.0.0.1:3000/toggle",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({"genomeID" : genomeID }),
        contentType: "application/json",
        cache: false,
        timeout: 30000,
        complete: function() {
            //called when complete
            console.log('toggle process complete');
        },

        success: function(data) {
            //simply call our success function
           successCallback(data);

        },

        error: function(err) {

            if(errorCallback)
                errorCallback(err);
            else
               console.log('Toggle error: ' + err.responseText);

        }
    });
}