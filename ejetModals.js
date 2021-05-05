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
var criarModalQuestao = function (title, description) {
    var documentBody = document.body;
    var modal = {},
        container = createElement('div')
            .setClassName('ejet-modal')
            .adicionarNoInicio(documentBody),
        body = createElement('div')
            .setClassName('ejet-modal-content')
            .adicionarNoFinal(container),
        title = createElement('div')
            .setClassName('ejet-title')
            .setInnerHTML(title || ''),
        buttonsDiv = createElement('div')
            .setClassName('ejet-buttons-div')
            .adicionarNoFinal(body),
        vButton = createElement('span')
            .setClassName('ejet-button')
            .setInnerHTML('✔')
            .adicionarNoFinal(buttonsDiv),
        xButton = createElement('span')
            .setClassName('ejet-button')
            .setInnerHTML('✘')
            .adicionarNoFinal(buttonsDiv),
        toggle = function () {
            container.classList.toggle("ejet-show-modal");
        },
        show = function () {
            container.classList.add("ejet-show-modal");
        },
        hide = function () {
            container.classList.remove("ejet-show-modal");
        };
    modal.container = container;
    modal.body = body;
    if (description) {
        modal.description = createElement('textarea')
            .setClassName('ejet-description')
            .setInnerHTML(description)
            .adicionarNoInicio(body);
        modal.description.readOnly = true;
    }
    modal.title = title.adicionarNoInicio(body);
    modal.buttonsDiv = buttonsDiv;
    modal.toggle = toggle;
    modal.show = show;
    modal.hide = hide;
    modal.v = toggle;
    modal.x = hide;
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