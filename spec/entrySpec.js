// Entry tests;

import decomment from '../lib/index.js';

describe('Entry:', function () {

    describe('non-string input', function () {
        it('must throw an error', function () {
            expect(function () {
                decomment();
            }).toThrow(new TypeError('Input code/text/html must be a string.'));
        });
    });

    describe('non-object options', function () {
        it('must throw an error', function () {
            expect(function () {
                decomment('', 123);
            }).toThrow(new TypeError('Parameter \'options\' must be an object.'));
        });
    });

    describe('empty string input', function () {
        it('must return empty string', function () {
            expect(decomment('')).toBe('');
        });
    });

    describe('tolerant mode', function () {
        it('must parse in tolerant mode', function () {
            expect(decomment('/* comment */@Injectable() export class HeroService {}', {tolerant: true})).toBe('@Injectable() export class HeroService {}');
        });
    });
});
