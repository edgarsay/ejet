/*global document, createElement, shuffle, ejetRange, ejetSVG*/
'use strict';

/**
 * @example
 * ejetJogoDaMemoria('#canvas',
 *  {
 *      "Assunto 1": "Descrição 1",
 *      "Assunto 2": "Descrição 2",
 *      "Assunto 3": "Descrição 3",
 *      "Assunto 4": "Descrição 4",
 *      "Assunto 5": "Descrição 5",
 *  }, function (erros) {
 *      console.log(erros);
 *  });
 * @param {String} conteinerSelector - CSS Selector
 * @param {JSON} conteudo - maxímo 9
 * @param {Function} final
 */
var ejetJogoDaMemoria = function (conteinerSelector, conteudo, final) {
    var container = document.querySelector(conteinerSelector),
        background = createElement('div')
            .setClassName('ejet-background-gray ejet-flex-center')
            .setStyle({
                width: '960px',
                height: '470px'
            })
            .addAtTheStart(container),
        message = createElement('div').setClassName('ejet-background-gray')
            .setStyle({
                width: '960px',
                height: '130px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            })
            .addAtTheStart(container),
        exclamation = createElement('div')
            .setClassName('ejet-exclamation ejet-flex-center')
            .setStyle({
                width: '100px',
                height: '100px',
                fontSize: '75px'
            })
            .setInnerHTML(ejetSVG.question)
            .addAtTheEnd(message),
        messageText = createElement('div')
            .setInnerHTML('Faça a correspondência dos conceitos com as ' +
                    'respectivas explicações, clicando numa carta e na sua ' +
                    'correspondente.')
            .setStyle({
                fontSize: '20px',
                width: '740px',
                marginLeft: '10px'
            })
            .addAtTheEnd(message),
        cardDimentions = 125,
        cardGap = 10,
        baseCard = createElement('div')
            .setClassName('ejet-flex-center ejet-card'),
        checkMark = createElement('div').setClassName('ejet-check'),
        subjects = Object.keys(conteudo),
        containerDimentions = (cardDimentions + 10 + 2 * cardGap) * 3,
        subjectContainer = createElement('div')
            .setStyle({
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                width: containerDimentions + 'px',
                height: containerDimentions + 'px'
                // backgroundColor: '#dd2e44'
            })
            .addAtTheStart(background),
        descriptions = shuffle(Object.values(conteudo)),
        descriptionContainer = subjectContainer.clone()
            .setStyle({
                // backgroundColor: '#55acef'
                flexWrap: 'wrap-reverse'
            })
            .addAtTheEnd(background);

    var innerHTML = '', selected = null, answered = 0, errors = {};
    ejetRange(0, 9, 1, function (i) {
        var newCard = baseCard.clone();
        innerHTML = '';
        if (i < subjects.length) {
            newCard.onclick = function () {
                if (selected) {
                    selected.classList.remove('ejet-card-select');
                }
                newCard.classList.add('ejet-card-select');
                selected = newCard;
            };
            innerHTML = subjects[i];
            newCard.addClass('ejet-box-warm');
            errors[innerHTML] = 0;
        }
        newCard.setInnerHTML(innerHTML).addAtTheEnd(subjectContainer);
    });
    ejetRange(0, 9, 1, function (i) {
        var newCard = baseCard.clone();
        innerHTML = '';
        if (i < descriptions.length) {
            innerHTML = descriptions[i];
            newCard.addClass('ejet-box-blue');
            newCard.onclick = function () {
                if (selected) {
                    selected.classList.remove('ejet-card-select');
                    if (conteudo[selected.innerHTML] === newCard.innerHTML) {
                        selected.classList.remove('ejet-box-warm');
                        selected.classList.add('ejet-box-success');
                        selected.setStyle({cursor: 'default'});
                        selected.onclick = function () {
                            return;
                        };
                        checkMark.clone().addAtTheEnd(selected);

                        newCard.setStyle({cursor: 'default'});
                        newCard.classList.remove('ejet-box-blue');
                        newCard.classList.add('ejet-box-success');
                        newCard.onclick = function () {
                            return;
                        };
                        checkMark.clone().addAtTheEnd(newCard);

                        answered += 1;
                        if (answered >= subjects.length) {
                            final(errors);
                        }
                    } else {
                        errors[selected.innerHTML] += 1;
                    }
                    selected = null;
                }
            };
        }
        newCard.setInnerHTML(innerHTML).addAtTheEnd(descriptionContainer);
    });
};