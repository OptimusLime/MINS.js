//Fake genome creation, for adding in extra genome objects

var fakeGenome = {};

fakeGenome.genomeID =0;
fakeGenome.nextGenomeID  = function()
{
    return fakeGenome.genomeID++;
}


fakeGenome.constanants = 'b c d f g k l m n p q r s t v x z'.split(' ');
fakeGenome.vowels = 'a e i o u y'.split(' ');
fakeGenome.categories = 'alkali alkaline-earth lanthanoid actinoid transition post-transition'.split(' ');
fakeGenome.suffices = 'on ium ogen'.split(' ');

fakeGenome.getRandom = function( property ) {
    var values = fakeGenome[ property ];
    return values[ Math.floor( Math.random() * values.length ) ];
};

fakeGenome.create = function() {
    var widthClass = Math.random()*10 > 6 ? 'width2' : 'width1';
    heightClass = Math.random()*10 > 6 ? 'height2' : 'height1';
    category = fakeGenome.getRandom('categories');
    className = 'underBox fake metal ' + category + ' ' + widthClass + ' ' + heightClass;
    letter1 = fakeGenome.getRandom('constanants').toUpperCase();
    letter2 = fakeGenome.getRandom('constanants');
    symbol = letter1 + letter2;
    name = letter1 + fakeGenome.getRandom('vowels') + letter2 + fakeGenome.getRandom('vowels') + fakeGenome.getRandom('constanants') + fakeGenome.getRandom('suffices');
    number = ~~( 21 + Math.random() * 100 );
    weight = ~~( number * 2 + Math.random() * 15 );
    var genomeID = fakeGenome.nextGenomeID();

    return  "<div id=" + "\"genome-" + genomeID + "\" class=\"" + "underBox bordered centered\"" + ">" +
        "genome: " + genomeID + "</div>";


    //return '<div class="' + className + '"' + // data-symbol="' + symbol +
        //'" data-category="' + category + '"><p class="number">' + number +
       // '</p><h3 class="symbol">' + symbol + '</h3><h2 class="name">' + name +
       // '</h2><p class="weight">' + weight + '</p>' +
       // '</div>';
};

fakeGenome.getGroup = function() {
    var i = Math.ceil( Math.random()*3 + 1 ),
        newEls = '';
    while ( i-- ) {
        newEls += fakeGenome.create();
    }
    return newEls;
};


