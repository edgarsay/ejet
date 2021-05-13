/*global loadImageAndCreateTextureInfo, setCanvasSize, canvas, gl,
ejetWebglInit, ejetInputInit,
drawImage, setLoop, matrixStack, Entity, Component, System, ejetInput,
drawText, createTextTextureInfo, shuffle, criarModalQuestao
drawTriangle, cleanAllEntitysComponents*/
'use strict';

/**
 * @example
 * ejetJogoDaMemoria('#canvas',
 *  {
 *      'Assunto 1': "Descrição 1",
 *      'Assunto 2': "Descrição 2",
 *      'Assunto 3': "Descrição 3",
 *      'Assunto 4': "Descrição 4",
 *      'Assunto 5': "Descrição 5",
 *  }, function (erros) {
 *      console.log(erros);
 *  });
 * @param {String} conteiner - CSS Selector
 * @param {JSON} dados - max 10
 * @param {Function} final
 */
var ejetJogoDaMemoria = function (conteiner, dados, final) {
    cleanAllEntitysComponents();
    ejetWebglInit(conteiner);
    ejetInputInit();

    /*test mouse posstion */
    var mouse = new Entity().add(Component.transform()).add(Component.shape('square', 5, 5));

    var scaleScreen = 2,
    // pixels
        screenw = 480,
        screenh = 270,
    // hyperlightdrifter dimentions
        canvasw = screenw * scaleScreen,
        canvash = screenh * scaleScreen;

    setCanvasSize(canvas, canvasw, canvash);
    gl.viewport(0, 0, canvasw, canvash);

    //template
    var subjects = Object.keys(dados),
        descriptions = shuffle(Object.values(dados)),
        modal = criarModalQuestao('Esta descrição condizer como o assunto?', '...'),
        createSubject = function (x, y, text, color) {
            return new Entity()
                .add(Component.transform(x, y))
                .add(Component.shape('square', 150, 150, color))
                .add(Component.text(text, 150, 150, null, null, [0, 0, 0, 1]))
                .add(Component.textAnimation(text, 5))
                .add(Component.hitBox(null, null, 150, 150));
        },
        createOptions = function (x, y, listOfStrings, backgroundColor, color) {
            var subjectOptions = new Entity()
                    .add(Component.transform(x, y))
                    .add(Component.motion()),
                background = new Entity()
                    .add(Component.transform(x, y))
                    .add(Component.shape('square', canvasw, canvash, backgroundColor, 0, 0));
            var gap = 175,
                i = 0,
                string = '',
                subject = null,
                options = [],
                _color = color,
                _answered = false;
                //     });
            while (i < 10) {
                if (i < listOfStrings.length) {
                    string = listOfStrings[i];
                    _color = color;
                    _answered = false;
                } else {
                    string = '...';
                    _color = ['#936A63', '#A88B75'];
                    _answered = true;
                }
                subject = createSubject(gap * (i % 5 - 2),
                        (i < 5 ? 250 : 425), string, _color[i % 2]);
                subject.get('transform').x += canvasw / 2 + x;
                subject.get('transform').y += 10 + y;
                subject.index = i;
                subject.answered = _answered;
                options.push(subject);
                i += 1;
            }
            subjectOptions.children = [background].concat(options);
            return subjectOptions;
        },
        title = new Entity()
            .add(Component.transform(canvasw / 2, 90))
            .add(Component.shape('square', 700, 150, '#655057'))
            .add(Component.text('', 700, 150, null, null, [1, 1, 1, 1]))
            .add(Component.textAnimation('Escolha um assunto', 5)),
        subjectOptions = createOptions(0, 0, subjects, '#f0cf8e', ['#cb8175', '#e2a97e']),
        descriptionOptions = createOptions(canvasw, 0, new Array(subjects.length).fill('?'),
                '#f6edcd', ['#a8c8a6', '#6d8d8a']),
        container = new Entity()
            .add(Component.transform())
            .add(Component.motion());
    container.children = [subjectOptions, descriptionOptions];


    var errors = {};
    subjects.forEach(function (subject) {
        errors[subject] = 0;
    });
    var answereds = 0,
        selectedSubject = null,
        selectedDescription = null,
        titleText = title.get('textAnimation'),
        containerMotion = container.get('motion'),
        containerTransform = container.get('transform'),
        moving = false,
        updateOption = function (options, delta, onClick) {
            options.children.forEach(function (subject) {
                System.animateText(subject, delta);
                ejetInput.onClick(subject, function () {
                    if (moving) {
                        return;
                    }
                    onClick(subject);
                });
                System.renderShape(subject);
                System.renderText(subject);
            });
            if (containerTransform.x <= -canvasw && moving) {
                containerMotion.speed = [0, 0];
                moving = false;
            } else if (containerTransform.x >= 0 && moving) {
                containerMotion.speed = [0, 0];
                moving = false;
            }
        };
    var slide = function (direction) {
        containerMotion.speed[0] = direction * canvasw / 30;
        containerTransform.x += direction;
        moving = true;
    };
    modal.setV(function () {
        modal.toggle();
        var subject = titleText.finalText;
        if (dados[subject] === modal.description.innerHTML) {
            var white = [1, 1, 1, 1],
                selectedSubjectText = selectedSubject.get('text');
            selectedSubjectText.color = white;
            selectedDescription.get('text').text = selectedSubjectText.text;
            selectedSubject.answered = true;
            answereds += 1;
            if (answereds === subjects.length) {
                final(errors);
            }
        } else {
            errors[subject] += 1;
        }
        slide(1);
    });
    var update = function (delta) {
        System.animateText(title, delta);
        System.movement(container);
        updateOption(subjectOptions, delta, function (subject) {
            if (subject.answered) {
                return;
            }
            titleText.finalText = subject.get('textAnimation')
                .finalText;
            titleText.stop = false;
            selectedSubject = subject;
            slide(-1);
        });
        updateOption(descriptionOptions, delta, function (description) {
            if (description.answered) {
                return;
            }
            selectedDescription = description;
            modal.description.setInnerHTML(descriptions[description.index]);
            modal.show();
        });
        System.renderShape(title);
        System.renderText(title);
    };

    // gl.colorMask(false, false, false, true);
    gl.clearColor(0, 0, 0, 1);
    setLoop(function (delta) {
        setCanvasSize(canvas, canvasw, canvash);
        gl.viewport(0, 0, canvasw, canvash);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clear(gl.COLOR_BUFFER_BIT);

        ejetInput.update();

        update(delta);
        /*mouse positon*/
        mouse.get('transform').x = ejetInput.mousePosition.x;
        mouse.get('transform').y = ejetInput.mousePosition.y;
        System.renderShape(mouse);
    });
};