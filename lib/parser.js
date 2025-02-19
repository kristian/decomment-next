import { getEOL, isHtml, parseRegEx, getSpaces, indexInRegEx } from './utils.js';

export default function(code, options, config) {
    if (typeof code !== 'string') {
        throw new TypeError('Input code/text/html must be a string.');
    }

    if (options !== undefined && typeof(options) !== 'object') {
        throw new TypeError('Parameter \'options\' must be an object.');
    }

    const len = code.length, // code length;
        optSafe = options && options.safe, // 'safe' option;
        optSpace = options && options.space, // 'space' option;
        optTrim = options && options.trim, // 'trim' option;
        optTolerant = options && options.tolerant, // 'tolerant' option;
        EOL = getEOL(code); // get EOL from the code;

    let idx = 0, // current index;
        s = '', // resulting code;
        emptyLine = true, // set while no symbols encountered on the current line;
        emptyLetters = '', // empty letters on a new line;
        html, // set when the input is recognized as HTML;
        regEx = []; // regular expression details;

    if (!len) {
        return code;
    }

    if (config.parse) {
        html = isHtml(code);
        if (!html) {
            regEx = parseRegEx(code, optTolerant);
        }
    } else {
        html = config.html;
    }

    if (options && options.ignore) {
        let ignore = options.ignore;
        if (ignore instanceof RegExp) {
            ignore = [ignore];
        } else {
            if (ignore instanceof Array) {
                ignore = ignore.filter(f => f instanceof RegExp);
                if (!ignore.length) {
                    ignore = null;
                }
            } else {
                ignore = null;
            }
        }
        if (ignore) {
            for (let i = 0; i < ignore.length; i++) {
                const reg = ignore[i];
                let match;
                do {
                    match = reg.exec(code);
                    if (match) {
                        regEx.push({
                            start: match.index,
                            end: match.index + match[0].length - 1
                        });
                    }
                } while (match && reg.global);
            }
            regEx = regEx.sort((a, b) => a.start - b.start);
        }
    }

    do {
        if (!html && code[idx] === '/' && idx < len - 1 && (!idx || code[idx - 1] !== '\\')) {
            if (code[idx + 1] === '/') {
                if (inRegEx()) {
                    if (emptyLetters) {
                        s += emptyLetters;
                        emptyLetters = '';
                    }
                    s += '/';
                    continue;
                }
                const lb1 = code.indexOf(EOL, idx + 2);
                if (lb1 < 0) {
                    break;
                }
                if (emptyLine) {
                    emptyLetters = '';
                    if (optSpace) {
                        idx = lb1 - 1; // just before the line break;
                    } else {
                        idx = lb1 + EOL.length - 1; // last symbol of the line break;
                        trim();
                    }
                } else {
                    idx = lb1 - 1; // just before the line break;
                }
                continue;
            }
            if (code[idx + 1] === '*') {
                if (inRegEx()) {
                    if (emptyLetters) {
                        s += emptyLetters;
                        emptyLetters = '';
                    }
                    s += '/';
                    continue;
                }
                const end1 = code.indexOf('*/', idx + 2),
                    keep1 = optSafe && idx < len - 2 && code[idx + 2] === '!';
                if (keep1) {
                    if (end1 >= 0) {
                        s += code.substr(idx, end1 - idx + 2);
                    } else {
                        s += code.substr(idx, len - idx);
                    }
                }
                if (end1 < 0) {
                    break;
                }
                const comment1 = code.substr(idx, end1 - idx + 2);
                idx = end1 + 1;
                if (emptyLine) {
                    emptyLetters = '';
                }
                if (!keep1) {
                    const parts1 = comment1.split(EOL);
                    if (optSpace) {
                        for (let k1 = 0; k1 < parts1.length - 1; k1++) {
                            s += EOL;
                        }
                    }
                    const lb2 = code.indexOf(EOL, idx + 1);
                    if (lb2 > idx) {
                        let gapIdx1 = lb2 - 1;
                        while ((code[gapIdx1] === ' ' || code[gapIdx1] === '\t') && --gapIdx1 > idx) ;
                        if (gapIdx1 === idx) {
                            if (emptyLine && !optSpace) {
                                idx = lb2 + EOL.length - 1; // last symbol of the line break;
                                trim();
                            }
                        } else {
                            if (optSpace) {
                                s += getSpaces(parts1[parts1.length - 1].length);
                            }
                        }
                    } else {
                        if (optSpace) {
                            let gapIdx2 = idx + 1;
                            while ((code[gapIdx2] === ' ' || code[gapIdx2] === '\t') && ++gapIdx2 < len) ;
                            if (gapIdx2 < len) {
                                s += getSpaces(parts1[parts1.length - 1].length);
                            }
                        }
                    }
                }
                continue;
            }
        }

        if (html && code[idx] === '<' && idx < len - 3 && code.substr(idx + 1, 3) === '!--') {
            if (inRegEx()) {
                if (emptyLetters) {
                    s += emptyLetters;
                    emptyLetters = '';
                }
                s += '<';
                continue;
            }
            const end2 = code.indexOf('-->', idx + 4),
                keep2 = optSafe && code.substr(idx + 4, 3) === '[if';
            if (keep2) {
                if (end2 >= 0) {
                    s += code.substr(idx, end2 - idx + 3);
                } else {
                    s += code.substr(idx, len - idx);
                }
            }
            if (end2 < 0) {
                break;
            }
            const comment2 = code.substr(idx, end2 - idx + 3);
            idx = end2 + 2;
            if (emptyLine) {
                emptyLetters = '';
            }
            if (!keep2) {
                const parts2 = comment2.split(EOL);
                if (optSpace) {
                    for (let k2 = 0; k2 < parts2.length - 1; k2++) {
                        s += EOL;
                    }
                }
                const lb3 = code.indexOf(EOL, idx + 1);
                if (lb3 > idx) {
                    let gapIdx3 = lb3 - 1;
                    while ((code[gapIdx3] === ' ' || code[gapIdx3] === '\t') && --gapIdx3 > idx) ;
                    if (gapIdx3 === idx) {
                        if (emptyLine && !optSpace) {
                            idx = lb3 + EOL.length - 1; // last symbol of the line break;
                            trim();
                        }
                    } else {
                        if (optSpace) {
                            s += getSpaces(parts2[parts2.length - 1].length);
                        }
                    }
                } else {
                    if (optSpace) {
                        let gapIdx4 = idx + 1;
                        while ((code[gapIdx4] === ' ' || code[gapIdx4] === '\t') && ++gapIdx4 < len) ;
                        if (gapIdx4 < len) {
                            s += getSpaces(parts2[parts2.length - 1].length);
                        }
                    }
                }
            }
            continue;
        }

        const symbol = code[idx],
            isSpace = symbol === ' ' || symbol === '\t';
        if (symbol === '\r' || symbol === '\n') {
            if (code.indexOf(EOL, idx) === idx) {
                emptyLine = true;
            }
        } else {
            if (!isSpace) {
                emptyLine = false;
                s += emptyLetters;
                emptyLetters = '';
            }
        }
        if (emptyLine && isSpace) {
            emptyLetters += symbol;
        } else {
            s += symbol;
        }

        if (!html && (symbol === '\'' || symbol === '"' || symbol === '`') && (!idx || code[idx - 1] !== '\\')) {
            if (inRegEx()) {
                continue;
            }
            let closeIdx = idx;
            do {
                closeIdx = code.indexOf(symbol, closeIdx + 1);
                if (closeIdx > 0) {
                    let shIdx = closeIdx;
                    while (code[--shIdx] === '\\') ;
                    if ((closeIdx - shIdx) % 2) {
                        break;
                    }
                }
            } while (closeIdx > 0);
            if (closeIdx < 0) {
                break;
            }
            s += code.substr(idx + 1, closeIdx - idx);
            idx = closeIdx;
        }

    } while (++idx < len);

    function inRegEx() {
        if (regEx.length) {
            return indexInRegEx(idx, regEx);
        }
    }

    function trim() {
        if (optTrim) {
            let startIdx, endIdx, i;
            do {
                startIdx = idx + 1;
                endIdx = code.indexOf(EOL, startIdx);
                i = startIdx;
                while ((code[i] === ' ' || code[i] === '\t') && ++i < endIdx) ;
                if (i === endIdx) {
                    idx = endIdx + EOL.length - 1;
                }
            } while (i === endIdx);
        }
    }

    return s;
}