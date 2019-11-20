import {any, anyArray, anyBoolean, anyNumber, anyObject, anyString, anyMap, anySet, isA, arrayIncludes} from './Matchers';
import { anyFunction, anySymbol } from '../lib';

class Cls {}


describe('Matchers', () => {
    describe('any', () => {
        it('returns true for false', () => {
            expect(any().match(false)).toBe(true);
        });

        it('returns true for undefined', () => {
            expect(any().match(undefined)).toBe(true);
        });

        it('returns true for null', () => {
            expect(any().match(null)).toBe(true);
        });
    });

    describe('anyString', () => {
        it('returns true for empty string', () => {
            expect(anyString().match('')).toBe(true);
        });

        it('returns true for non-empty string', () => {
            expect(anyString().match('123')).toBe(true);
        });

        it('returns false for number', () => {
            // @ts-ignore
            expect(anyString().match(123)).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyString().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyString().match(undefined)).toBe(false);
        });
    });

    describe('anyNumber', () => {
        it('returns true for 0', () => {
            expect(anyNumber().match(0)).toBe(true);
        });

        it('returns true for normal number', () => {
            expect(anyNumber().match(123)).toBe(true);
        });

        it('returns false for string', () => {
            // @ts-ignore
            expect(anyNumber().match('123')).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyNumber().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyNumber().match(undefined)).toBe(false);
        });

        it('returns false for NaN', () => {
            expect(anyNumber().match(NaN)).toBe(false);
        });
    });

    describe('anyBoolean', () => {
        it('returns true for true', () => {
            expect(anyBoolean().match(true)).toBe(true);
        });

        it('returns true for false', () => {
            expect(anyBoolean().match(false)).toBe(true);
        });

        it('returns false for string', () => {
            // @ts-ignore
            expect(anyBoolean().match('true')).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyBoolean().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyBoolean().match(undefined)).toBe(false);
        });
    });

    describe('anyFunction', () => {
        it('returns true for function', () => {
            expect(anyFunction().match(() => {})).toBe(true);
        });

        it('returns false for string', () => {
            // @ts-ignore
            expect(anyFunction().match('true')).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyFunction().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyFunction().match(undefined)).toBe(false);
        });
    });

    describe('anySymbol', () => {
        it('returns true for symbol', () => {
            expect(anySymbol().match(Symbol('123'))).toBe(true);
        });

        it('returns false for string', () => {
            // @ts-ignore
            expect(anySymbol().match('123')).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anySymbol().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anySymbol().match(undefined)).toBe(false);
        });
    });

    describe('anyObject', () => {
        it('returns true for object', () => {
            expect(anyObject().match({})).toBe(true);
        });

        it('returns true for new object', () => {
            expect(anyObject().match(new Object())).toBe(true);
        });

        it('returns true for new instance', () => {
            expect(anyObject().match(new Cls())).toBe(true);
        });

        it('returns true for new builtin', () => {
            expect(anyObject().match(new Map())).toBe(true);
        });

        it('returns false for string', () => {
            expect(anyObject().match('123')).toBe(false);
        });

        it('returns false for number', () => {
            expect(anyObject().match(123)).toBe(false);
        });

        it('returns false for null', () => {
            expect(anyObject().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(anyObject().match(undefined)).toBe(false);
        });
    });

    describe('anyArray', () => {
        it('returns true for empty array', () => {
            expect(anyArray().match([])).toBe(true);
        });

        it('returns true for non empty', () => {
            expect(anyArray().match([1, 2, 3])).toBe(true);
        });

        it('returns false for object', () => {
            // @ts-ignore
            expect(anyArray().match({})).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyArray().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyArray().match(undefined)).toBe(false);
        });
    });

    describe('anyMap', () => {
        it('returns true for empty Map', () => {
            expect(anyMap().match(new Map())).toBe(true);
        });

        it('returns true for non empty', () => {
            const map = new Map();
            map.set(1, 2);
            expect(anyMap().match(map)).toBe(true);
        });

        it('returns false for object', () => {
            // @ts-ignore
            expect(anyMap().match({})).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anyMap().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anyMap().match(undefined)).toBe(false);
        });
    });

    describe('anySet', () => {
        it('returns true for empty Set', () => {
            expect(anySet().match(new Set())).toBe(true);
        });

        it('returns true for non empty', () => {
            const set = new Set();
            set.add(2);
            expect(anySet().match(set)).toBe(true);
        });

        it('returns false for object', () => {
            // @ts-ignore
            expect(anySet().match({})).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(anySet().match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(anySet().match(undefined)).toBe(false);
        });
    });

    describe('isA', () => {
        it('returns true when class is the same builtin', () => {
            expect(isA(Map).match(new Map())).toBe(true);
        });

        it('returns true for non empty', () => {
            expect(isA(Cls).match(new Cls())).toBe(true);
        });

        it('returns false for object', () => {
            // @ts-ignore
            expect(isA(Cls).match({})).toBe(false);
        });

        it('returns false for null', () => {
            // @ts-ignore
            expect(isA(Cls).match(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            // @ts-ignore
            expect(isA(Cls).match(undefined)).toBe(false);
        });
    });
    describe('arrayIncludes', () => {
        it('returns true when array contains value', () => {
            expect(arrayIncludes('val').match(['val', 'val2'])).toBe(true);
        });

        it('returns false when array does not contain value', () => {
            expect(arrayIncludes('val3').match(['val', 'val2'])).toBe(false);
        });

        // TODO
    });

});
