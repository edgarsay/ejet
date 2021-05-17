'use strict';
/**
 * Retorna um array randomizado
 * @param {Array} lista
 */
var shuffle = function (lista) {
    var currentIndex = lista.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = lista[currentIndex];
        lista[currentIndex] = lista[randomIndex];
        lista[randomIndex] = temporaryValue;
    }

    return lista;
};

var i = null,
    ejetRange = function (from, to, step, forEach) {
        i = from;
        while (i < to) {
            forEach(i);
            i += step;
        }
    };

var ejetSVG = {
    question: '<?xml version="1.0" encoding="UTF-8" standalone="no"?> <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="100%" height="100%" viewBox="0 0 32 32" version="1.1" id="svg863" sodipodi:docname="question-circle-svgrepo-com.svg" inkscape:version="1.0.1 (3bc2e813f5, 2020-09-07)"> <metadata id="metadata869"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> </cc:Work> </rdf:RDF> </metadata> <defs id="defs867" /> <sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1366" inkscape:window-height="704" id="namedview865" showgrid="false" inkscape:snap-bbox="true" inkscape:snap-bbox-midpoints="true" inkscape:snap-bbox-edge-midpoints="true" inkscape:zoom="11.335806" inkscape:cx="23.585003" inkscape:cy="17.008748" inkscape:window-x="0" inkscape:window-y="27" inkscape:window-maximized="0" inkscape:current-layer="svg863" /> <g id="g877"> <circle style="fill:#efefaf;stroke-width:1.10972;fill-opacity:1" id="path871" cx="16" cy="16" r="12" /> <path d="M 16 4 C 9.382813 4 4 9.382813 4 16 C 4 22.617188 9.382813 28 16 28 C 22.617188 28 28 22.617188 28 16 C 28 9.382813 22.617188 4 16 4 Z M 16 6 C 21.535156 6 26 10.464844 26 16 C 26 21.535156 21.535156 26 16 26 C 10.464844 26 6 21.535156 6 16 C 6 10.464844 10.464844 6 16 6 Z M 16 10 C 13.800781 10 12 11.800781 12 14 L 14 14 C 14 12.882813 14.882813 12 16 12 C 17.117188 12 18 12.882813 18 14 C 18 14.765625 17.507813 15.445313 16.78125 15.6875 L 16.375 15.8125 C 15.558594 16.082031 15 16.863281 15 17.71875 L 15 19 L 17 19 L 17 17.71875 L 17.40625 17.59375 C 18.945313 17.082031 20 15.621094 20 14 C 20 11.800781 18.199219 10 16 10 Z M 15 20 L 15 22 L 17 22 L 17 20 Z" id="path861" /> </g> </svg>'
};