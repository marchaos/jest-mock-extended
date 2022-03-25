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
    notEmpty,
    captor,
    matches,
} from './Matchers';

class Cls {}

describe('Matchers', () => {
    describe('any', () => {
        test('returns true for false', () => {
            expect(any().asymmetricMatch(false)).toBe(true);
        });

        test('returns true for undefined', () => {
            expect(any().asymmetricMatch(undefined)).toBe(true);
        });

        test('returns true for null', () => {
            expect(any().asymmetricMatch(null)).toBe(true);
        });

        // test('Supports undefined in chain', () => {
        //     const f = vi.fn();
        //     f(undefined);

        //     // @ts-ignore
        //     console.info(f.mock);

        //     expect(f).toHaveBeenCalledWith(any());
        // });
    });

    describe('anyString', () => {
        test('returns true for empty string', () => {
            expect(anyString().asymmetricMatch('')).toBe(true);
        });

        test('returns true for non-empty string', () => {
            expect(anyString().asymmetricMatch('123')).toBe(true);
        });

        test('returns false for number', () => {
            // @ts-ignore
            expect(anyString().asymmetricMatch(123)).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyString().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyString().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anyNumber', () => {
        test('returns true for 0', () => {
            expect(anyNumber().asymmetricMatch(0)).toBe(true);
        });

        test('returns true for normal number', () => {
            expect(anyNumber().asymmetricMatch(123)).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyNumber().asymmetricMatch('123')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyNumber().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyNumber().asymmetricMatch(undefined)).toBe(false);
        });

        test('returns false for NaN', () => {
            expect(anyNumber().asymmetricMatch(NaN)).toBe(false);
        });
    });

    describe('anyBoolean', () => {
        test('returns true for true', () => {
            expect(anyBoolean().asymmetricMatch(true)).toBe(true);
        });

        test('returns true for false', () => {
            expect(anyBoolean().asymmetricMatch(false)).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyBoolean().asymmetricMatch('true')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyBoolean().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyBoolean().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anyFunction', () => {
        test('returns true for function', () => {
            expect(anyFunction().asymmetricMatch(() => {})).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anyFunction().asymmetricMatch('true')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyFunction().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyFunction().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anySymbol', () => {
        test('returns true for symbol', () => {
            expect(anySymbol().asymmetricMatch(Symbol('123'))).toBe(true);
        });

        test('returns false for string', () => {
            // @ts-ignore
            expect(anySymbol().asymmetricMatch('123')).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anySymbol().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anySymbol().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anyObject', () => {
        test('returns true for object', () => {
            expect(anyObject().asymmetricMatch({})).toBe(true);
        });

        test('returns true for new object', () => {
            expect(anyObject().asymmetricMatch(new Object())).toBe(true);
        });

        test('returns true for new instance', () => {
            expect(anyObject().asymmetricMatch(new Cls())).toBe(true);
        });

        test('returns true for new builtin', () => {
            expect(anyObject().asymmetricMatch(new Map())).toBe(true);
        });

        test('returns false for string', () => {
            expect(anyObject().asymmetricMatch('123')).toBe(false);
        });

        test('returns false for number', () => {
            expect(anyObject().asymmetricMatch(123)).toBe(false);
        });

        test('returns false for null', () => {
            expect(anyObject().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            expect(anyObject().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anyArray', () => {
        test('returns true for empty array', () => {
            expect(anyArray().asymmetricMatch([])).toBe(true);
        });

        test('returns true for non empty', () => {
            expect(anyArray().asymmetricMatch([1, 2, 3])).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anyArray().asymmetricMatch({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignored
            expect(anyArray().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyArray().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anyMap', () => {
        test('returns true for empty Map', () => {
            expect(anyMap().asymmetricMatch(new Map())).toBe(true);
        });

        test('returns true for non empty', () => {
            const map = new Map();
            map.set(1, 2);
            expect(anyMap().asymmetricMatch(map)).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anyMap().asymmetricMatch({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anyMap().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anyMap().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('anySet', () => {
        test('returns true for empty Set', () => {
            expect(anySet().asymmetricMatch(new Set())).toBe(true);
        });

        test('returns true for non empty', () => {
            const set = new Set();
            set.add(2);
            expect(anySet().asymmetricMatch(set)).toBe(true);
        });

        test('returns false for object', () => {
            // @ts-ignore
            expect(anySet().asymmetricMatch({})).toBe(false);
        });

        test('returns false for null', () => {
            // @ts-ignore
            expect(anySet().asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            // @ts-ignore
            expect(anySet().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('isA', () => {
        test('returns true when class is the same builtin', () => {
            expect(isA(Map).asymmetricMatch(new Map())).toBe(true);
        });

        test('returns true for non empty', () => {
            expect(isA(Cls).asymmetricMatch(new Cls())).toBe(true);
        });

        test('returns false for object', () => {
            expect(isA(Cls).asymmetricMatch({})).toBe(false);
        });

        test('returns false for null', () => {
            expect(isA(Cls).asymmetricMatch(null)).toBe(false);
        });

        test('returns false for undefined', () => {
            expect(isA(Cls).asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('arrayIncludes', () => {
        test('returns true when array contains value', () => {
            expect(arrayIncludes('val').asymmetricMatch(['val', 'val2'])).toBe(true);
        });

        test('returns false when array does not contain value', () => {
            expect(arrayIncludes('val3').asymmetricMatch(['val', 'val2'])).toBe(false);
        });

        test('returns false when not a map', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').asymmetricMatch({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').asymmetricMatch(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(arrayIncludes('val3').asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('mapHas', () => {
        test('returns true when map contains key', () => {
            expect(mapHas('key').asymmetricMatch(new Map([['key', 'val']]))).toBe(true);
        });

        test('returns false when map does not contain key', () => {
            expect(mapHas('key3').asymmetricMatch(new Map([['key', 'val']]))).toBe(false);
        });

        test('returns false when not a map', () => {
            // @ts-ignore
            expect(mapHas('val3').asymmetricMatch({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(mapHas('val3').asymmetricMatch(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(mapHas('val3').asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('setHas', () => {
        test('returns true when set contains value', () => {
            expect(setHas('val').asymmetricMatch(new Set(['val']))).toBe(true);
        });

        test('returns false when set does not contain value', () => {
            expect(setHas('val3').asymmetricMatch(new Set(['val', 'val2']))).toBe(false);
        });

        test('returns false when not a set', () => {
            // @ts-ignore
            expect(setHas('val3').asymmetricMatch({})).toBe(false);
        });

        test('returns false when for null', () => {
            // @ts-ignore
            expect(setHas('val3').asymmetricMatch(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            // @ts-ignore
            expect(setHas('val3').asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('objectContainsKey', () => {
        test('returns true when object contains key', () => {
            expect(objectContainsKey('key').asymmetricMatch({ key: 'val' })).toBe(true);
        });

        test('returns false when object does not contain key', () => {
            expect(objectContainsKey('key3').asymmetricMatch({ key: 'val' })).toBe(false);
        });

        test('returns false when not a object', () => {
            expect(objectContainsKey('val3').asymmetricMatch(213)).toBe(false);
        });

        test('returns false when for null', () => {
            expect(objectContainsKey('val3').asymmetricMatch(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(objectContainsKey('val3').asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('objectContainsValue', () => {
        test('returns true when object contains value', () => {
            expect(objectContainsValue('val').asymmetricMatch({ key: 'val' })).toBe(true);
        });

        test('returns false when object does not contain value', () => {
            expect(objectContainsValue('val3').asymmetricMatch({ key: 'val' })).toBe(false);
        });

        test('returns false when not a object', () => {
            expect(objectContainsValue('val3').asymmetricMatch(213)).toBe(false);
        });

        test('returns false when for null', () => {
            expect(objectContainsValue('val3').asymmetricMatch(null)).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(objectContainsValue('val3').asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('notNull', () => {
        test('returns true when object', () => {
            expect(notNull().asymmetricMatch({ key: 'val' })).toBe(true);
        });

        test('returns true when undefined', () => {
            expect(notNull().asymmetricMatch(undefined)).toBe(true);
        });

        test('returns true when empty string', () => {
            expect(notNull().asymmetricMatch('')).toBe(true);
        });

        test('returns false when for null', () => {
            expect(notNull().asymmetricMatch(null)).toBe(false);
        });
    });

    describe('notUndefined', () => {
        test('returns true when object', () => {
            expect(notUndefined().asymmetricMatch({ key: 'val' })).toBe(true);
        });

        test('returns true when null', () => {
            expect(notUndefined().asymmetricMatch(null)).toBe(true);
        });

        test('returns true when empty string', () => {
            expect(notUndefined().asymmetricMatch('')).toBe(true);
        });

        test('returns false when for undefined', () => {
            expect(notUndefined().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('notEmpty', () => {
        test('returns true when object', () => {
            expect(notEmpty().asymmetricMatch({ key: 'val' })).toBe(true);
        });

        test('returns true when null', () => {
            expect(notEmpty().asymmetricMatch(null)).toBe(false);
        });

        test('returns true when empty string', () => {
            expect(notEmpty().asymmetricMatch('')).toBe(false);
        });

        test('returns false when for undefined', () => {
            expect(notEmpty().asymmetricMatch(undefined)).toBe(false);
        });
    });

    describe('captor', () => {
        let fn: () => void;
        let doSomething: (...args: any[]) => void;

        beforeEach(() => {
            fn = vi.fn();
            doSomething = (fn: (...args: any[]) => void, count: number) => {
                fn(String(count), count, { 1: 2 });
            };
        });

        test('can capture arg with other matchers', () => {
            doSomething(fn, 1);

            const argCaptor = captor();
            expect(fn).toHaveBeenCalledWith(argCaptor, any(), any());
            expect(argCaptor.value).toBe('1');
        });

        test('stores all values', () => {
            doSomething(fn, 1);
            doSomething(fn, 2);
            doSomething(fn, 3);

            const argCaptor = captor();
            expect(fn).toHaveBeenNthCalledWith(1, argCaptor, any(), any());
            expect(fn).toHaveBeenNthCalledWith(2, argCaptor, any(), any());
            expect(fn).toHaveBeenNthCalledWith(3, argCaptor, any(), any());

            expect(argCaptor.value).toBe('3');
            expect(argCaptor.values).toEqual(['1', '2', '3']);
        });
    });

    describe('matches function', () => {
        test('expects passes for when it returns true', () => {
            const fn = vi.fn();
            fn(1);

            expect(fn).toHaveBeenCalledWith(matches((val) => val === 1));
        });

        test('expects with not passes for when it returns false', () => {
            const fn = vi.fn();
            fn(1);

            expect(fn).not.toHaveBeenCalledWith(matches((val) => val === 2));
        });
    });
});
