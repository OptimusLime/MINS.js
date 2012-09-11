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



