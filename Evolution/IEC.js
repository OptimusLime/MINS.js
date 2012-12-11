//Javascript file for dealing with interactive evolution
//lots of dummy code for now. Later, will need to ajax hook up to server for fetching genomes (calling HTTP get/post etc)

var initialGenomeRequest = 20;


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

    var $container = $('#container');
    $container.height('auto');

    //add initialGenomeRequest sample genomes for now
    //make multiple requests to get body genomes, then add the genome objects
    getBodies(initialGenomeRequest, addManyGenomeDivs);
}
function addManyGenomeDivs(genomeArray)
{
//    console.log('Adding many genomes in a loop!')
    for(var i=0; i < genomeArray.length; i++)
        addGenomeDiv(genomeArray[i]);
}
function addGenomeDiv(genomeJSON)
{
//    console.log('Returning JSON from the get request');

//    console.log(genomeJSON);

    var genomeObject = JSON.parse(genomeJSON);
//    console.log(genomeObject);

    //JSON Body comes back async from JSON body
    var $container = $('#container');

    var divID = "d" + genomeObject.GenomeID;
    var id = "s"+ genomeObject.GenomeID;


    $container.append(smallNS.smallWorldHtmlString(divID, id, 230,230));

    var smallWorld = new smallNS.SmallWorld(id, 230, 230, 14);
    //hopefully this works!
    smallWorld.addJSONBody(genomeObject);

    $('#' + divID).mouseenter(function(){smallWorld.startLoop();}).mouseleave(function(){smallWorld.stopLoop();});

//    smallWorld.startLoop();
//
//    $container.append('<div id='+ id + ' class="element halogen nonmetal   width2 height2  " data-symbol="F" data-category="halogen">' +
//        '<p class="number">ID: '+ genomeObject.GenomeID +'</p>' +
//        '<h3 class="symbol">'+ genomeObject.HiddenLocations.length +'</h3>' +
//        '<h2 class="name">Connections</h2>' +
//        '<p class="weight"> '+ genomeObject.Connections.length +'</p>' +
//        '</div>');


//    addD3ToNewBody(id, genomeObject);


//        '<div class="element halogen nonmetal   width2 height2"><h1>Test body addition</h1><h2>' + 'GenomeID: ' + genomeJSON.GenomeID + '</h2></div>');
//    <div class="element halogen nonmetal   width2 height2  " data-symbol="F" data-category="halogen">
//        <p class="number">9</p>
//        <h3 class="symbol">F</h3>
//        <h2 class="name">Fluorine</h2>
//        <p class="weight">18.9984032</p>
//    </div>
};

function addD3ToNewBody(divID, genomeObject)
{
    //right now, this is a bodyObject with InputLocations, HiddenLocations, and Connections

    var inCnt = genomeObject.InputLocations.length;
    var hiCnt = genomeObject.HiddenLocations.length;

    var data = genomeObject.InputLocations.concat(genomeObject.HiddenLocations);

    var connections = genomeObject.Connections;
    var nodes =[];
    var force = d3.layout.force().nodes(nodes).on("tick", function(e) {
        nodes.forEach(function(o, i) {
            o.y -= 4 / 30;
        });

//        node.attr("cx", function(d) { return d.x; })
//            .attr("cy", function(d) { return d.y; });
    }).start();

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 230,
        height = 230;

    var x = pad(d3.scale.linear()
        .domain(d3.extent(data, function(d, i) { return d.X; }))
        .range([0, width - margin.left - margin.right]), 40);

    var y = pad(d3.scale.linear()
        .domain(d3.extent(data, function(d, i) { return d.Y; }))
        .range([ height - margin.top - margin.bottom,0]), 40);

    var svg = d3.select('#'+divID).append("svg").style("border", "1px solid black")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "dot line chart");


    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .style("fill", function(d, i) {
            return i < inCnt ? "#00f" : "#050";
        })
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.X); })
        .attr("cy", function(d) { return y(d.Y); })
        .attr("r", 12)
//    console.log("Connections: ");
//    console.log(connections);

    svg.selectAll(".line")
        .data(connections)
        .enter().append("line")
        .style("stroke-width", function(d) { return 1.5;})//Math.sqrt(d.value); });
        .style("stroke", function(d) { return "#000"})
        .attr("x1", function(c){ return x(c.coordinates[0]); })
        .attr("y1", function(c){ return y(c.coordinates[1]); })
        .attr("x2", function(c){ return x(c.coordinates[2]); })
        .attr("y2", function(c){ return y(c.coordinates[3]); });
}
function pad(scale, k) {
    return scale;
//        var range = scale.range();
//        if (range[0] > range[1]) k *= -1;
//        return scale.domain([range[0] - k, range[1] + k].map(scale.invert)).nice();
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



