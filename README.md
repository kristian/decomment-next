decomment-next
==============

A fork of [decomment] similar to [esprima-next] being a fork of [esprima].

Removes comments from JSON/JavaScript, CSS/HTML, CPP/H, etc.

## Changes to the original decomment:

- Rename to decomment-next
- Uses [esprima-next] instead of [esprima]
- Change to using ES6 module format
- Removing `package-lock.json` from `.gitignore`
- Remove `getEOL` export, which didn't fit in the library in the first place
- Remove support for Node <= 12
- Switch from `jamsine-node` to `jasmine`

## Installing

```
$ npm i decomment-next
```

## Testing

```
$ npm test
```

Testing with coverage:

```
$ npm run coverage
```

## Usage

```js
import decomment from 'decomment-next';

const code = 'var t; // comments';

decomment(code); //=> var t;
```

## Features

* Removes both single and multi-line comments from JSON, JavaScript and CSS/Text
* Automatically recognizes HTML and removes all `<!-- comments -->` from it
* Does not change layout / formatting of the original document
* Removes lines that have only comments on them
* Compatible with CSS3, JSON5 and ECMAScript 6

The library does not support mixed content - HTML with JavaScript or CSS in it.
Once the input code is recognized as HTML, only the HTML comments will be removed from it.

## Performance

For JSON and JavaScript this library uses [esprima] to guarantee correct processing for regular expressions.

As an example, it can process [AngularJS 1.5 Core](https://code.angularjs.org/1.5.0/angular.js)
in under 100ms, which is 1.1MB ~ 30,000 lines of JavaScript.

## API

### decomment(code, [options]) ⇒ String

This method first checks if the code starts with `<`, as an HTML, and if so, all `<!-- comment -->` entries
are removed, according to the `options`.

When the `code` is not recognized as HTML, it is assumed to be either JSON or JavaScript. It is then parsed
through [esprima] for ECMAScript 6 compliance, and to extract details about regular expressions.

If [esprima] fails to validate the code, it will throw a parsing error. When successful, this method will remove
`//` and `/**/` comments according to the `options` (see below).

##### options.safe ⇒ Boolean

* `false (default)` - remove all multi-line comments
* `true` - keep special multi-line comments that begin with:
  - `<!--[if` - for conditional comments in HTML
  - `/*!` - for everything else (other than HTML)

Example:

```js
import decomment from 'decomment-next';
const code = '/*! special */ var a; /* normal */';
decomment(code); //=> var a;
decomment(code, {safe: true}); //=> /*! special */ var a;
```

##### options.ignore ⇒ RegExp | [RegExp,...]

Takes either a single or an array of regular expressions to match against.
All matching blocks are then skipped, as well as any comment-like content inside them.

Examples:

* CSS may contain Base64-encoded strings with comment-like symbols:

```css
  src: url(data:font/woff;base64,d09GRg//ABAAAAAAZ)
```

You can isolate all `url(*)` blocks by using:

```js
  {ignore: /url\([\w\s:\/=\-\+;,]*\)/g}
```

* If you want to isolate jsDoc blocks (start with `/**`, followed by a line break, end with `*/`),
you can use the following:

```js
{ignore: /\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//g}
```

##### options.space ⇒ Boolean

* `false (default)` - remove comment blocks entirely
* `true` - replace comment blocks with white spaces where needed, in order to preserve
the original line + column position of every code element.

Example:

```js
import decomment from 'decomment-next';
const code = 'var a/*text*/, b';
decomment(code); //=> var a, b
decomment(code, {space: true}); //=> var a        , b
```

NOTE: When this option is enabled, option `trim` is ignored.

##### options.trim ⇒ Boolean

* `false (default)` - do not trim comments
* `true` - remove empty lines that follow removed full-line comments

Example:

```js
import decomment from 'decomment-next';
const code = '/* comment */\r\n\r\n var test = 123';
decomment(code); //=> \r\n var test = 123
decomment(code, {trim: true}); //=> var test = 123
```

NOTE: This option has no effect when option `space` is enabled.

##### options.tolerant ⇒ Boolean

* `false (default)` - perform strict JavaScript parsing (parser throws on invalid JavaScript)
* `true` - pass `tolerant` flag to [esprima] parser (the parser _may_ choose to continue parsing and produce a syntax tree).
  Usefull for parsing Angular/TypeScript code, for example.

Example:

```js
import decomment from 'decomment-next';
const code = '/* comment */\r\n\r\n@Injectable()\r\nexport class HeroService {}';
decomment(code); //=> Error: 'Unexpected token ILLEGAL'
decomment(code, {tolerant: true}); //=> @Injectable()\r\nexport class HeroService {}
```

### decomment.text(text, [options]) ⇒ String

Unlike the default **decomment**, it instructs the library that `text` is not a JSON,
JavaScript or HTML, rather a plain text that needs no parsing or validation,
only to remove `//` and `/**/` comments from it according to the `options`.

This method is good for any text file that uses syntax `//` and `/**/` for comments,
such as: `.CSS`, `.CPP`, `.H`, etc.

Example:

```js
import decomment from 'decomment-next';
const text = '.my-class{color:Red;}// comments';
decomment.text(text); //=> .my-class{color:Red;}
```

Please note that while the same rules apply for the text blocks (`''`, `""` and \`\`),
you should not use this method for JSON or JavaScript, as it can break your regular expressions.

### decomment.html(html, [options]) ⇒ String

Unlike the default **decomment** method, it instructs the library not to parse
or validate the input in any way, rather assume it to be HTML, and remove all
`<!-- comment -->` entries from it according to the `options`.

## License

Copyright © 2023 [Kristian Kraljic](https://kra.lc);
Original [decomment] Copyright © 2021 [Vitaly Tomilov](https://github.com/vitaly-t);
Released under the MIT license.

[decomment]:https://github.com/vitaly-t/decomment
[esprima]:https://github.com/jquery/esprima
[esprima-next]:https://github.com/node-projects/esprima-next
