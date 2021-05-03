/*global document */
'use strict';

/**
 * @param {String} type - 'div', 'p', 'h1', ...
 * @returns {HTMLElement}
 */
var createElement = function (type) {
    var el = document.createElement(type);
    el.setClassName = function (className) {
        el.className = className;
        return el;
    };
    el.setInnerHTML = function (innerHTML) {
        el.innerHTML = innerHTML;
        return el;
    };
    el.adicionarNoFinal = function (parent) {
        parent.appendChild(el);
        return el;
    };
    el.adicionarNoInicio = function (parent) {
        var fc = parent.firstChild;
        if (fc) {
            parent.insertBefore(el, fc);
        } else {
            parent.appendChild(el);
        }
        return el;
    };
    return el;
};

/**
 *  Criar um modal basico com dois botões 'V' e 'X'
 */
var criarModalQuestao = function () {
    var body = document.body;
    var modal = {},
        conteiner = createElement('div')
            .setClassName('ejet-modal')
            .adicionarNoFinal(body),
        modalContent = createElement('div')
            .setClassName('ejet-modal-content')
            .adicionarNoFinal(conteiner),
        buttonsDiv = createElement('div')
            .setClassName('ejet-buttons-div')
            .adicionarNoFinal(modalContent),
        vButton = createElement('span')
            .setClassName('ejet-button')
            .setInnerHTML('✔')
            .adicionarNoFinal(buttonsDiv),
        xButton = createElement('span')
            .setClassName('ejet-button')
            .setInnerHTML('✘')
            .adicionarNoFinal(buttonsDiv),
        trocarVisibilidade = function () {
            conteiner.classList.toggle("ejet-show-modal");
        };
    modal.conteiner = conteiner;
    modal.corpo = modalContent;
    modal.botoes = buttonsDiv;
    modal.trocarVisibilidade = trocarVisibilidade;
    modal.v = trocarVisibilidade;
    modal.x = trocarVisibilidade;
    vButton.addEventListener('click', modal.v);
    xButton.addEventListener('click', modal.x);
    modal.setV = function (acao) {
        vButton.removeEventListener('click', modal.v);
        modal.v = acao;
        vButton.addEventListener('click', acao);
        return modal;
    };
    modal.setX = function (acao) {
        xButton.removeEventListener('click', modal.x);
        modal.x = acao;
        xButton.addEventListener('click', acao);
        return modal;
    };
    return modal;
};