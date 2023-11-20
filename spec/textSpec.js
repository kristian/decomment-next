// Tests for any text file;

import decomment from '../lib/index.js';
import os from 'os';
const LB = os.EOL;

describe('Text:', function () {

    describe('empty comment', function () {
        it('must be removed', function () {
            expect(decomment('class{}/**/')).toBe('class{}');
            expect(decomment('class{}//')).toBe('class{}');
        });
    });

    describe('regular comment', function () {
        it('must be removed', function () {
            expect(decomment('class{}/* text */')).toBe('class{}');
            expect(decomment('class{}// text')).toBe('class{}');
        });
    });
    
    describe('comments as text', function () {
        it('must remain', function () {
            expect(decomment('\'<*hello*>\'')).toBe('\'<*hello*>\'');
        });
    });
});
