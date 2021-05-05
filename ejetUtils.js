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