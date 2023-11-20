import parser from './parser.js';

export default function main(code, options) {
    return parser(code, options, {
        parse: true // need to parse;
    });
}

export function text(text, options) {
    return parser(text, options, {
        parse: false, // do not parse;
        html: false // treat as plain text;
    });
}
main.text = text;

export function html(html, options) {
    return parser(html, options, {
        parse: false, // do not parse;
        html: true // treat as HTML;
    }); 
}
main.html = html;
