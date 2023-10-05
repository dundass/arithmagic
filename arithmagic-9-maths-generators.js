var TwinklGame = TwinklGame || {};

(function(tw) {

    'use strict';

    function isInt(n) {
        return n === (n|0);
    }

    function randomInt(a, b) {
        return Math.floor(Math.random()*(b-a)+a);
    }

    var parseAnswer = function(ans) {       // TODO - consider moving switch(content) into this so that u just need to call parseAnswer in main app
        var splitAns = ans.split(/[ ,]+/);
        if(splitAns.length === 1) {
            if(splitAns[0].includes('-')) return tw.Utils.filledArray(parseInt(splitAns[0].split('-')[1]) + 1).slice(parseInt(splitAns[0].split('-')[0]), parseInt(splitAns[0].split('-')[1]) + 1);
            else return parseInt(splitAns[0]);
        }
        else if(splitAns.length > 1) {
            return splitAns.reduce(function (a, x) {
                return x.includes('-') ? a.concat( tw.Utils.filledArray( parseInt(x.split('-')[1]) + 1).slice( parseInt(x.split('-')[0]), parseInt(x.split('-')[1]) + 1) )
                    : a.concat([parseInt(x)]);
            }, []);
        }
    };

    // var additionCrossesTens = function (left, right) {
    //     // console.log(left.toString().charAt(left.toString().length - 2), (left+right).toString().charAt((left+right).toString().length - 2));
    //     return (left.toString().charAt(left.toString().length - 2) !== (left+right).toString().charAt((left+right).toString().length - 2))
    //         && (right.toString().charAt(right.toString().length - 2) !== (left+right).toString().charAt((left+right).toString().length - 2));
    // };

    var generateRedHerrings = function (question) {
        var bits, herrings = [];
        if(question.includes('+')) {

            // TODO - only works for integer sums ..........

            bits = question.split(' + ');

            var answer = parseFloat(bits[0]) + parseFloat(bits[1]);
            herrings.push(bits[0] + bits[1]);

            var digits = bits[0].split('').concat(bits[1].split('')), tot = 0;
            for(var i = 0; i < digits.length; i++) tot += parseFloat(digits[i]);
            herrings.push(tot + '');

            if(bits[0].length > 1) herrings.push((parseFloat(bits[0].charAt(0)) + parseFloat(bits[0].charAt(1)) + parseFloat(bits[1].charAt(0))) + '');

            if(bits[1].length > 1) herrings.push((parseFloat(bits[1].charAt(0)) + parseFloat(bits[1].charAt(1)) + parseFloat(bits[0].charAt(0))) + '');

            if(bits[0].length > 2) {
                herrings.push((parseFloat(bits[0]) + (parseFloat(bits[1].charAt(0)) * 10)) + '');
                herrings.push((answer + 100) + '');
                herrings.push((answer - 100) + '');
            }
            if(bits[1].length > 2) {
                herrings.push((parseFloat(bits[1]) + (parseFloat(bits[0].charAt(0)) * 10)) + '');
            }
            for(var i = 1; i <= 10; i++) {
                herrings.push((answer + i) + '');
                herrings.push((answer - i) + '');
            }

            return tw.Utils.removeDuplicates(herrings).filter(function (h) { return parseFloat(h) !== answer });
        } else if(question.includes('-')) {
            bits = question.split(' - ');

        } else if(question.includes('×')) {
            bits = question.split(' × ');

        } else if(question.includes('÷')) {
            bits = question.split(' ÷ ');

        }
    };

    var additionCrossesTens = function (left, right) {
        var crosses = false, lstr = left.toString(), rstr = right.toString();
        var minLength = Math.min(lstr.length, rstr.length);
        for(var i = 0; i < minLength; i++) {
            // console.log(parseInt(lstr.charAt(lstr.length - 1 - i)) + parseInt(rstr.charAt(rstr.length - 1 - i)));
            if((parseInt(lstr.charAt(lstr.length - 1 - i)) + parseInt(rstr.charAt(rstr.length - 1 - i))).toString().length > 1) crosses = true;
        }
        return crosses;
    };

    var subtractionCrossesTens = function (left, right) {
        return left.toString().charAt(left.toString().length - 2) !== (left-right).toString().charAt((left-right).toString().length - 2);
    };

    var generateCalculationQuestion = function (opts) {
        opts = opts || {};
        var min = typeof opts.min === 'undefined' ? 1 : opts.min,
            max = opts.max || 12,
            terms = opts.terms || tw.Utils.filledArray(max + 1).slice(min, max + 1),
            answers = opts.answers || tw.Utils.filledArray((max+1) * 2),
            operations = opts.operations || ['+'],
            canCrossTens = typeof opts.canCrossTens === 'undefined' ? true : opts.canCrossTens,
            swapTerms = typeof opts.swapTerms === 'undefined' ? true : opts.swapTerms,
            decimalPlaces = opts.decimalPlaces || 0,
            exclude = opts.exclude || [];

        var initialAnswerIdx = randomInt(0, answers.length),
            viableQuestions = [],
            correspondingAnswers = [],
            correspondingAims = [];

        if(decimalPlaces > 0 && operations[0] === '+') { // TODO - only for addition so far !

            var answer = parseFloat(answers[tw.Utils.randomInt(0, answers.length)]);

            console.log(answer)

            // answer = answer + (Math.random() - 0.5).toFixed(decimalPlaces);
            var l = tw.Utils.randomInt(min, max) + parseFloat((Math.random() - 0.5).toFixed(decimalPlaces)),
                r = answer - l;

            console.log(l)
            console.log(r)

            viableQuestions = [l.toFixed(decimalPlaces) + ' + ' + r.toFixed(decimalPlaces)];
            correspondingAnswers = [answer];
            // correspondingAims = ?

            console.log(viableQuestions)

        } else {

            // iterate through all of the supplied answers
            for(var answerIdx = initialAnswerIdx; answerIdx < answers.length + initialAnswerIdx; answerIdx++) {
                var answer = answers[answerIdx % answers.length];

                // iterate through all of the supplied terms (eg a multiplication factor, or one of the addition sum numbers that u want to fix)
                for(var termIdx = 0; termIdx < terms.length; termIdx++) {

                    // iterate through all of the other numbers in the calculation (defined by min/max args to this function)
                    for(var otherTerm = min; otherTerm <= max; otherTerm++) {

                        // select a random operation from the list supplied
                        var op = operations[randomInt(0, operations.length)];

                        // add the question if it satisfies the answer. different depending on the operation ofc
                        switch(op) {
                            case '+':
                                if(otherTerm + terms[termIdx] === answer &&
                                    !viableQuestions.includes(otherTerm + ' + ' + terms[termIdx]) &&
                                    !viableQuestions.includes(terms[termIdx] + ' + ' + otherTerm))
                                    if(canCrossTens) {
                                        viableQuestions.push(Math.random() > 0.5 && swapTerms ? otherTerm + ' + ' + terms[termIdx] : terms[termIdx] + ' + ' + otherTerm);
                                        correspondingAnswers.push(answer);
                                        // correspondingAims.push(?)
                                    } else {
                                        viableQuestions.push(Math.random() > 0.5 && swapTerms ? otherTerm + ' + ' + terms[termIdx] : terms[termIdx] + ' + ' + otherTerm);
                                        correspondingAnswers.push(answer);
                                        // correspondingAims.push(?)
                                    }
                                break;
                            case '-':
                                if(otherTerm - terms[termIdx] === answer && !viableQuestions.includes(otherTerm + ' - ' + terms[termIdx])) {
                                    if(canCrossTens) {
                                        viableQuestions.push(otherTerm + ' - ' + terms[termIdx]);
                                        correspondingAnswers.push(answer);
                                        // correspondingAims.push(?)
                                    } else {
                                        if(!subtractionCrossesTens(otherTerm, terms[termIdx])) {
                                            viableQuestions.push(otherTerm + ' - ' + terms[termIdx]);
                                            correspondingAnswers.push(answer);
                                            // correspondingAims.push(?)
                                        }
                                    }
                                }
                                break;
                            case '*':
                                if(otherTerm * terms[termIdx] === answer &&
                                    !viableQuestions.includes(otherTerm + ' * ' + terms[termIdx]) &&
                                    !viableQuestions.includes(terms[termIdx] + ' * ' + otherTerm)) {

                                    var q = Math.random() > 0.5 && swapTerms ? otherTerm + ' * ' + terms[termIdx] : terms[termIdx] + ' * ' + otherTerm;
                                    if(!exclude.includes(q)) {
                                        viableQuestions.push(q);
                                        correspondingAnswers.push(answer);
                                        correspondingAims.push(terms[termIdx] + '_times_table');
                                    }
                                }
                                break;
                            case '/':
                                if(otherTerm / terms[termIdx] === answer && !viableQuestions.includes(otherTerm + ' / ' + terms[termIdx])) {
                                    viableQuestions.push(otherTerm + ' / ' + terms[termIdx]);
                                    correspondingAnswers.push(answer);
                                    correspondingAims.push(terms[termIdx] + '_times_table');
                                }
                                break;
                            default:
                                console.error(op + ' is not a valid operation !');
                        }
                    }
                }
            }
        }

        // console.log(viableQuestions);

        if(viableQuestions.length === 0)
            console.error('no calcs found for: [' + min + '-' + max + ']' + op + '[' + terms + '] = [' + answers + ']' + (opts.exclude ? ' and excluding [' + exclude.join(', ') + ']' : ''));

        // return a random question from the list, formatted appropriately for use in learning resources
        var randomIdx = randomInt(0, viableQuestions.length);

        return {
            question: viableQuestions[randomIdx].replace('/', '÷').replace('*', '×'),
            answer: correspondingAnswers[randomIdx],
            aim: correspondingAims[randomIdx]
        };
    };

    var generateDecimalQuestion = function (opts) {
        opts = opts || {};
        // TODO - here (alias to generateCalculationQuestion) or within gCQ itself ? if here, fix toFixed -> returns String ?!?!?
        var decimalPlaces = opts.decimalPlaces || 1,
            max = opts.max || 12;
        opts.answers = opts.answers ? opts.answers : tw.Utils.filledArray((max+1) * 2);
        // opts.answers = [opts.answers[tw.Utils.randomInt(0, opts.answers.length)]] + (Math.random() - 0.5).toFixed(decimalPlaces);
        var q = generateCalculationQuestion(opts);

        // if(decimalPlaces > 0) {
        //     var s = q.split(' '), r = (Math.random() > 0.5 ? Math.random() : -Math.random()).toFixed(decimalPlaces);
        //     q = (parseInt(s[0]) - (r*-1)) + ' ' + s[1] + ' ' + (parseInt(s[2]) - r);
        // }

        return q;
    };

    var generateSimpleRatio = function (opts) {
        opts = opts || {};
        var min = opts.min || 1,
            max = opts.max || 10;

        var first = opts.first || tw.Utils.randomInt(1, (opts.maxfirst || 4));
        var secondRange = tw.Utils.filledArray(max - min + 1).map(function(x){ return x + min });
        var idxToRemove = secondRange.indexOf(first);
        if(idxToRemove !== -1) secondRange.splice(idxToRemove, 1);
        var second = secondRange[tw.Utils.randomInt(0, secondRange.length)];

        for(var i = 10; i > 1; i--) {
            if(isInt(first / i) && isInt(second / i)) {
                first /= i;
                second /= i;
                break;
            }
        }

        return first + ':' + second;
    };

    var generateRatioQuestion = function (opts) {
        opts = opts || {};
        var min = opts.min || 2,
            max = opts.max || 10,
            answer = opts.answer || generateSimpleRatio((opts.simpleOpts || {}));

        var factor = tw.Utils.randomInt(min, max + 1), first = answer.split(':')[0], second = answer.split(':')[1];
        return { question: (first * factor) + ':' + (second * factor), answer: answer };
    };

    // for(var j = 0; j < 5; j++) {
    //     var baseRatio = generateSimpleRatio();
    //     for(var i = 0; i < 20; i++) {
    //         console.log(baseRatio + '\t' + generateRatioQuestion({answer: baseRatio}));
    //     }
    // }

    var generateSimpleFraction = function (opts) {
        opts = opts || {};
        var simpleRatio = generateSimpleRatio(opts), first = simpleRatio.split(':')[0], second = simpleRatio.split(':')[1];
        if(first > second) simpleRatio = second + ':' + first;
        return simpleRatio.replace(':', '\n—\n');
    };

    var generateFractionQuestion = function (opts) {
        opts = opts || {};
        var answer = opts.answer || generateSimpleFraction((opts.simpleOpts || {}));
        return {question: generateRatioQuestion({answer: answer.replace('\n—\n', ':')}).replace(':', '<br>—<br>'), answer: answer };
    };

    // for(var j = 0; j < 5; j++) {
    //     var baseFraction = generateSimpleFraction();
    //     console.log(baseFraction);
    //     for(var i = 0; i < 20; i++) {
    //         console.log(generateFractionQuestion({answer: baseFraction}).replace('<br>—<br>', '/'));
    //     }
    // }

    var generatePerfectPower = function (opts) {
        opts = opts || {};
        var minBase = opts.minBase || 1,
            maxBase = opts.maxBase || 10,
            base = opts.base || tw.Utils.randomInt(minBase, maxBase+1),
            minPower = opts.minPower || 1,
            maxPower = opts.maxPower || maxBase - base;
        return Math.pow(base, tw.Utils.randomInt(minPower, maxPower));    // TODO - on easiest, power >= 1, harder ones can include 0 (probs alongside -ve powers)
    };

    // for(var j = 0; j < 5; j++) {
    //     var base = tw.Utils.randomInt(1, 11);
    //     console.log(base);
    //     for (var i = 0; i < 20; i++) {
    //         console.log(generatePerfectPower({base: base, minPower: 2}));
    //     }
    // }

    function layOutMosaicCell(data, idx) {
        data.filled = typeof data.filled === 'undefined' ? true : data.filled;

        var dataColor = data.image[idx].toLowerCase().replace(/ /g,'-'),
            args = Object.assign({}, data.args),
            colAns = data.colourMap[data.image[idx]],
            cellContents = '&nbsp;';

        if(colAns.constructor === Array) {
            args.answers = colAns;
            cellContents = data.generator(args).question;
        }
        else if(colAns.constructor === Number && !isNaN(colAns)) {
            args.answers = [colAns];
            cellContents = data.generator(args).question;
        }
        else if(colAns.constructor === String) {
            args.answer = colAns;
            cellContents = data.generator(args).question;
        }
        var cls = data.filled ? 'mosaic-' + dataColor : '';
        return '<td class="' + cls + '" data-color="' + dataColor + '">' + cellContents + '</td>';
    }

    var layOutMosaic = function (data) {
        var grid = '';

        for (var y = 0; y < 10; y++) {
            grid += '<tr>';
            for (var x = 0; x < 9; x++) {

                grid += layOutMosaicCell(data, y * 9 + x);

            }
            grid += '</tr>';
        }

        return grid;
    };

    function layOutWorksheetCell(data) {
        var cell = '<td><table class="worksheet-subgrid">', q = generateCalculationQuestion(data).split(' '); // ['21', '+', '40']

        for(var y = 0; y < 5; y++) {
            cell += '<tr>';
            for (var x = 0; x < 4; x++) {
                cell += '<td>';
                if(y === 1) {
                    if(x === 1) cell += q[0].length === 3 ? q[0].charAt(0) : '';
                    else if(x === 2) cell += q[0].length > 1 ? q[0].charAt(q[0].length === 2 ? 0 : 1) : '';
                    else if(x === 3) cell += q[0].length > 1 ? q[0].charAt(q[0].length === 2 ? 1 : 2) : q[0].charAt(0);
                }
                if(y === 2) {
                    if(x === 0) cell += q[1];
                    else if(x === 1) cell += q[2].length === 3 ? q[2].charAt(0) : '';
                    else if(x === 2) cell += q[2].length > 1 ? q[2].charAt(q[2].length === 2 ? 0 : 1) : '';
                    else if(x === 3) cell += q[2].length > 1 ? q[2].charAt(q[2].length === 2 ? 1 : 2) : q[2].charAt(0);
                }
                cell += '</td>';
            }
            cell += '</tr>';
        }
        cell += '</table></td>';
        return cell;
    }

    var layOutWorksheet = function (data) {
        var grid = '';

        for(var y = 0; y < 3; y++) {
            grid += '<tr>';
            for (var x = 0; x < 7; x++) {
                grid += layOutWorksheetCell(data);
            }
            grid += '</tr>'
        }
        return grid;
    };

    // var generateCalculationQuestion = function (opts) {
    //     var min = opts.min || 1,
    //         max = opts.max || 12,
    //         terms = opts.terms || tw.Utils.filledArray(max + 1).slice(min, max + 1),
    //         answers = opts.answers || tw.Utils.filledArray((max+1) * 2),
    //         operations = opts.operations || ['+'];
    //
    //     var initialTerm = randomInt(0, terms.length);
    //     var operation = operations[randomInt(0, operations.length)];
    //     var question = '', viableAnswers = [];
    //
    //     for(var i = 0; i < terms.length; i++) {
    //         var term = terms[(initialTerm+i) % terms.length];
    //         // console.log(term);
    //         viableAnswers = answers.filter(function (answer) {
    //             var otherTerm = answer - term;
    //             switch (operation) {
    //                 case '+':
    //                     otherTerm = answer - term;
    //                     break;
    //                 case '-':
    //                     otherTerm = answer + term;
    //                     break;
    //                 case '*':
    //                     otherTerm = answer / term;
    //                     break;
    //                 case '/':
    //                     otherTerm = answer * term;
    //                     break;
    //             }
    //             return (isInt(otherTerm) && otherTerm >= min && otherTerm <= max);
    //         });
    //         var op = (' ' + operation + ' ').replace('/', '÷').replace('*', '×');
    //         if(viableAnswers.length > 0) break;
    //     }
    //
    //     if (viableAnswers.length === 0) {
    //         console.error('no calcs found for: [' + min + '-' + max + ']' + op + term + ' = [' + answers + ']');
    //     }
    //     else {
    //         var answer = viableAnswers[randomInt(0, viableAnswers.length)];
    //         switch (operation) {
    //             case '+':
    //                 question = Math.random() > 0.5 ? (answer - term) + ' + ' + term
    //                     : term + ' + ' + (answer - term);
    //                 break;
    //             case '-':
    //                 question = (answer + term) + op + term;
    //                 break;
    //             case '*':
    //                 question = Math.random() > 0.5 ? (answer / term) + op + term
    //                     : term + op + (answer / term);
    //                 break;
    //             case '/':
    //                 question = (answer * term) + op + term;
    //                 break;
    //         }
    //     }
    //     return question;
    // };

    // var tot = 0;
    // for(var i = 0; i < 1000; i++) {
    //     var ans = generateCalculationQuestion( {answers: [8], operation: ['-'], max: 24} );
    //     // if(ans === '7 + 1' || ans === '1 + 7') tot++;
    //     // if(ans === '5 + 3' || ans === '3 + 5') tot++;
    //     if(ans === '9 - 1') tot++;
    // }
    // console.log(tot);

    tw.mathsGenerators = {
        layOutMosaic: layOutMosaic,
        layOutWorksheet: layOutWorksheet,
        generateCalculationQuestion: generateCalculationQuestion,
        generateDecimalQuestion: generateDecimalQuestion,
        generateSimpleRatio: generateSimpleRatio,
        generateSimpleFraction: generateSimpleFraction,
        generateRatioQuestion: generateRatioQuestion,
        generateFractionQuestion: generateFractionQuestion,
        additionCrossesTens: additionCrossesTens,
        subtractionCrossesTens: subtractionCrossesTens,
        generateRedHerrings: generateRedHerrings,
        parseAnswer: parseAnswer
    }

})(TwinklGame);
