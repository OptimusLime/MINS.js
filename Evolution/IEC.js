//Javascript file for dealing with interactive evolution
//lots of dummy code for now. Later, will need to ajax hook up to server for fetching genomes (calling HTTP get/post etc)


function populateGenomes()
{
    var genomeCount = 12;
    console.log("Dop");
    var stackWidth = $("#underPanel").width();

    for(var g=0; g< genomeCount; g++)
    {
       // var div = "<div id=" + "\"genome-" + fakeGenome.nextGenomeID() + "\" class=\"" + "underBox bordered centered\"" + "></div>";
        $("#underPanel").append(fakeGenome.create());
    }
}
function addInitialGenomes()
{
    console.log('Adding initial genomes');
    //add ten sample genomes for now
    for(var i =0; i < 10; i++){
        //make multiple requests to get body genomes, then add the genome objects
        getBody(addGenomeDiv);
    }


}
function addGenomeDiv(genomeJSON)
{
    console.log('Returning JSON from the get request')
    //JSON Body comes back async from JSON body
    var $container = $('#container');

    $container.append('<div class="element"><h1>Test body addition</h1><h2>' + 'GenomeID: ' + genomeJSON.GenomeID + '</h2></div>');

};

function isoSetup(){

    populateGenomes();
    var $container = $('#underPanel');


    $('#insert a').click(function(){
        var $newEls = $( fakeGenome.getGroup() );
        $container.isotope( 'insert', $newEls );

        return false;
    });

    $('#append a').click(function(){
        var $newEls = $( fakeGenome.getGroup() );
        $container.append( $newEls ).isotope( 'appended', $newEls );

        return false;
    });


    $('#prepend a').click(function(){
        var $newEls = $( fakeGenome.getGroup() );
        $container
            .prepend( $newEls ).isotope('reloadItems').isotope({ sortBy: 'original-order' })
            // set sort back to symbol for inserting
            .isotope('option', { sortBy: 'symbol' });

        return false;
    });

    $container.isotope({
        itemSelector : '.underBox',
        filter: '*',
        getSortData : {
            symbol : function( $elem ) {
                return $elem.attr('data-symbol');
            }
        },
        sortBy : 'symbol'
    });

};



