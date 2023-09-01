type MatcherFn<T> = (actualValue: T) => boolean;

// needs to be a class so we can instanceof
class Matcher<T> {
    $$typeof: symbol;
    inverse?: boolean;

    constructor(
        readonly asymmetricMatch: MatcherFn<T>,
        private readonly description: string,
    ) {
        this.$$typeof = Symbol.for('vi.asymmetricMatcher');
    }

    toString() {
        return this.description;
    }

    toAsymmetricMatcher() {
        return this.description;
    }

    getExpectedType() {
        return 'undefined';
    }
}

class CaptorMatcher<T> {
    $$typeof: symbol;
    public readonly asymmetricMatch: MatcherFn<T>;
    public readonly value!: T;
    public readonly values: T[] = [];
    constructor() {
        this.$$typeof = Symbol.for('vi.asymmetricMatcher');

        this.asymmetricMatch = (actualValue: T) => {
            // @ts-ignore
            this.value = actualValue;
            this.values.push(actualValue);
            return true;
        };
    }

    getExpectedType() {
        return 'Object';
    }

    toString() {
        return 'captor';
    }

    toAsymmetricMatcher() {
        return 'captor';
    }
}

interface MatcherCreator<T, E = T> {
    (expectedValue?: E): Matcher<T>;
}

type MatchersOrLiterals<Y extends any[]> = { [K in keyof Y]: Matcher<Y[K]> | Y[K] };

const any: MatcherCreator<any> = () => new Matcher(() => true, 'any()');
const anyBoolean: MatcherCreator<boolean> = () => new Matcher((actualValue: boolean) => typeof actualValue === 'boolean', 'anyBoolean()');
const anyNumber: MatcherCreator<number> = () =>
    new Matcher((actualValue) => typeof actualValue === 'number' && !isNaN(actualValue), 'anyNumber()');
const anyString: MatcherCreator<string> = () => new Matcher((actualValue: string) => typeof actualValue === 'string', 'anyString()');
const anyFunction: MatcherCreator<Function> = () =>
    new Matcher((actualValue: Function) => typeof actualValue === 'function', 'anyFunction()');
const anySymbol: MatcherCreator<symbol> = () => new Matcher((actualValue) => typeof actualValue === 'symbol', 'anySymbol()');
const anyObject: MatcherCreator<any> = () =>
    new Matcher((actualValue) => typeof actualValue === 'object' && actualValue !== null, 'anyObject()');

const anyArray: MatcherCreator<any[]> = () => new Matcher((actualValue) => Array.isArray(actualValue), 'anyArray()');
const anyMap: MatcherCreator<Map<any, any>> = () => new Matcher((actualValue) => actualValue instanceof Map, 'anyMap()');
const anySet: MatcherCreator<Set<any>> = () => new Matcher((actualValue) => actualValue instanceof Set, 'anySet()');
const isA: MatcherCreator<any> = (clazz) => new Matcher((actualValue) => actualValue instanceof clazz, 'isA()');

const arrayIncludes: MatcherCreator<any[], any> = (arrayVal) =>
    new Matcher((actualValue) => Array.isArray(actualValue) && actualValue.includes(arrayVal), 'arrayIncludes()');
const setHas: MatcherCreator<Set<any>, any> = (arrayVal) =>
    new Matcher((actualValue) => anySet().asymmetricMatch(actualValue) && actualValue!.has(arrayVal), 'setHas()');
const mapHas: MatcherCreator<Map<any, any>, any> = (mapVal) =>
    new Matcher((actualValue) => anyMap().asymmetricMatch(actualValue) && actualValue!.has(mapVal), 'mapHas()');
const objectContainsKey: MatcherCreator<any, string> = (key) =>
    new Matcher((actualValue) => anyObject().asymmetricMatch(actualValue) && actualValue[key!] !== undefined, 'objectContainsKey()');
const objectContainsValue: MatcherCreator<any> = (value) =>
    new Matcher(
        (actualValue) => anyObject().asymmetricMatch(actualValue) && Object.values(actualValue).includes(value),
        'objectContainsValue()',
    );

const notNull: MatcherCreator<any> = () => new Matcher((actualValue) => actualValue !== null, 'notNull()');
const notUndefined: MatcherCreator<any> = () => new Matcher((actualValue) => actualValue !== undefined, 'notUndefined()');
const notEmpty: MatcherCreator<any> = () =>
    new Matcher((actualValue) => actualValue !== null && actualValue !== undefined && actualValue !== '', 'notEmpty()');

const captor = <T extends any = any>() => new CaptorMatcher<T>();
const matches = <T extends any = any>(matcher: MatcherFn<T>) => new Matcher(matcher, 'matches()');

export {
    Matcher,
    CaptorMatcher,
    any,
    anyBoolean,
    anyNumber,
    anyString,
    anyFunction,
    anySymbol,
    anyObject,
    anyArray,
    anyMap,
    anySet,
    isA,
    arrayIncludes,
    setHas,
    mapHas,
    objectContainsKey,
    objectContainsValue,
    notNull,
    notUndefined,
    notEmpty,
    captor,
    matches,
};
export type { MatcherFn, MatchersOrLiterals, MatcherCreator };
