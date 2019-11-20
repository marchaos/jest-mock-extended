import {
    any,
    anyArray,
    anyBoolean,
    anyNumber,
    anyObject,
    anyString,
    anyMap,
    anySet,
    isA,
    arrayIncludes,
    anyFunction,
    anySymbol,
    setHas,
    mapHas,
    objectContainsKey,
    objectContainsValue,
    notNull,
    notUndefined,
    notEmpty
} from './Matchers';

class Cls {}

describe('Matchers', () => {
    describe('any', () => {
        test('returns true for false', () => {
            expect(any().match(false)).toBe(true);
        });

        test('returns true for undefined', () => {
            expect(any().match(undefined)).toBe(true);
        });

        test('returns true for null', () => {
            expect(any().match(null)).toBe(true);
        });
    });

    describe('anyString', () => {
        test('returns true for empty string', () => {
            expect(anyString().match('')).toBe(true);
        });

        test('returns true for non-empty string', () => {
            expect(anyString().match('123')).toBe(true);
        });

        test('returns false for number', () => {
            // @ts-ignore
            expect(anyString().match(123)).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyString().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyString().match(undefined)).toBe(false);
        });
    });

    describe('anyNumber', () => {
        test('returns true for 0', () => {
            expect(anyNumber().match(0)).toBe(true);
        });

        test('returns true for normal number', () => {
            expect(anyNumber().match(123)).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyNumber().match('123')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyNumber().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyNumber().match(undefined)).toBe(false);
        });

        test('returns false for NaN', () => {
            expect(anyNumber().match(NaN)).toBe(false);
        });
    });

    describe('anyBoolean', () => {
        test('returns true for true', () => {
            expect(anyBoolean().match(true)).toBe(true);
        });

        test('returns true for false', () => {
            expect(anyBoolean().match(false)).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyBoolean().match('true')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyBoolean().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyBoolean().match(undefined)).toBe(false);
        });
    });

    describe('anyFunction', () => {
        test('returns true for function', () => {
            expect(anyFunction().match(() => {})).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyFunction().match('true')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyFunction().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyFunction().match(undefined)).toBe(false);
        });
    });

    describe('anySymbol', () => {
        test('returns true for symbol', () => {
            expect(anySymbol().match(Symbol('123'))).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anySymbol().match('123')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anySymbol().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anySymbol().match(undefined)).toBe(false);
        });
    });

    describe('anyObject', () => {
        test('returns true for object', () => {
            expect(anyObject().match({})).toBe(true);
        });

        test('returns true for new object', () => {
            expect(anyObject().match(new Object())).toBe(true);
        });

        test('returns true for new instance', () => {
            expect(anyObject().match(new Cls())).toBe(true);
        });

        test('returns true for new builtin', () => {
            expect(anyObject().match(new Map())).toBe(true);
        });

        test('returns false for string', () => {
            expect(anyObject().match('123')).toBe(false);
        });

        test('returns false for number', () => {
            expect(anyObject().match(123)).toBe(false);
        });

        test('returns false for null', () => {
            expect(anyObject().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            expect(anyObject().match(undefined)).toBe(false);
        });
    });

    describe('anyArray', () => {
        test('returns true for empty array', () => {
            expect(anyArray().match([])).toBe(true);
        });

        test('returns true for non empty', () => {
            expect(anyArray().match([1, 2, 3])).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anyArray().match({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyArray().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyArray().match(undefined)).toBe(false);
        });
    });

    describe('anyMap', () => {
        test('returns true for empty Map', () => {
            expect(anyMap().match(new Map())).toBe(true);
        });

        test('returns true for non empty', () => {
            const map = new Map();
            map.set(1, 2);
            expect(anyMap().match(map)).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anyMap().match({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyMap().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyMap().match(undefined)).toBe(false);
        });
    });

    describe('anySet', () => {
        test('returns true for empty Set', () => {
            expect(anySet().match(new Set())).toBe(true);
        });

        test('returns true for non empty', () => {
            const set = new Set();
            set.add(2);
            expect(anySet().match(set)).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anySet().match({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anySet().match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anySet().match(undefined)).toBe(false);
        });
    });

    describe('isA', () => {
        test('returns true when class is the same builtin', () => {
            expect(isA(Map).match(new Map())).toBe(true);
        });

        test('returns true for non empty', () => {
            expect(isA(Cls).match(new Cls())).toBe(true);
        });

        test('returns false for object', () => {
            expect(isA(Cls).match({})).toBe(false);
        });

        test('returns false for null', () => {
            expect(isA(Cls).match(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            expect(isA(Cls).match(undefined)).toBe(false);
        });
    });

    describe('arrayIncludes', () => {
        test('returns true when array contains value', () => {
            expect(arrayIncludes('val').match(['val', 'val2'])).toBe(true);
        });

        test('returns false when array does not contain value', () => {
            expect(arrayIncludes('val3').match(['val', 'val2'])).toBe(false);
        });

        test('returns false when not a map', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').match({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').match(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').match(undefined)).toBe(false);
        });
    });

    describe('mapHas', () => {
        test('returns true when map contains key', () => {
            expect(mapHas('key').match(new Map([['key', 'val']]))).toBe(true);
        });

        test('returns false when map does not contain key', () => {
            expect(mapHas('key3').match(new Map([['key', 'val']]))).toBe(false);
        });

        test('returns false when not a map', () => {
            // @ts-ignore
            expect(mapHas('val3').match({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(mapHas('val3').match(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(mapHas('val3').match(undefined)).toBe(false);
        });
    });

    describe('setHas', () => {
        test('returns true when set contains value', () => {
            expect(setHas('val').match(new Set(['val']))).toBe(true);
        });

        test('returns false when set does not contain value', () => {
            expect(setHas('val3').match(new Set(['val', 'val2']))).toBe(false);
        });

        test('returns false when not a set', () => {
            // @ts-ignore
            expect(setHas('val3').match({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(setHas('val3').match(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(setHas('val3').match(undefined)).toBe(false);
        });
    });

    describe('objectContainsKey', () => {
        test('returns true when object contains key', () => {
            expect(objectContainsKey('key').match({ key: 'val' })).toBe(true);
        });

        test('returns false when object does not contain key', () => {
            expect(objectContainsKey('key3').match({ key: 'val' })).toBe(false);
        });

        test('returns false when not a object', () => {
            expect(objectContainsKey('val3').match(213)).toBe(false);
        });

        test('returns false when for null', () => {
            expect(objectContainsKey('val3').match(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(objectContainsKey('val3').match(undefined)).toBe(false);
        });
    });

    describe('objectContainsValue', () => {
        test('returns true when object contains value', () => {
            expect(objectContainsValue('val').match({ key: 'val' })).toBe(true);
        });

        test('returns false when object does not contain value', () => {
            expect(objectContainsValue('val3').match({ key: 'val' })).toBe(false);
        });

        test('returns false when not a object', () => {
            expect(objectContainsValue('val3').match(213)).toBe(false);
        });

        test('returns false when for null', () => {
            expect(objectContainsValue('val3').match(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(objectContainsValue('val3').match(undefined)).toBe(false);
        });
    });

    describe('notNull', () => {
        test('returns true when object', () => {
            expect(notNull().match({ key: 'val' })).toBe(true);
        });

        test('returns true when undefined', () => {
            expect(notNull().match(undefined)).toBe(true);
        });

        test('returns true when empty string', () => {
            expect(notNull().match('')).toBe(true);
        });

        test('returns false when for null', () => {
            expect(notNull().match(null)).toBe(false);
        });
    });

    describe('notUndefined', () => {
        test('returns true when object', () => {
            expect(notUndefined().match({ key: 'val' })).toBe(true);
        });

        test('returns true when null', () => {
            expect(notUndefined().match(null)).toBe(true);
        });

        test('returns true when empty string', () => {
            expect(notUndefined().match('')).toBe(true);
        });

        test('returns false when for undefined', () => {
            expect(notUndefined().match(undefined)).toBe(false);
        });
    });

    describe('notEmpty', () => {
        test('returns true when object', () => {
            expect(notEmpty().match({ key: 'val' })).toBe(true);
        });

        test('returns true when null', () => {
            expect(notEmpty().match(null)).toBe(false);
        });

        test('returns true when empty string', () => {
            expect(notEmpty().match('')).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(notEmpty().match(undefined)).toBe(false);
        });
    });
});
