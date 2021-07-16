export type MatcherFn<T> = (actualValue: T) => boolean;

// needs to be a class so we can instanceof
export class Matcher<T> {
    $$typeof: symbol;

    constructor(readonly asymmetricMatch: MatcherFn<T>, private readonly description: string) {
        this.$$typeof = Symbol.for('jest.asymmetricMatcher');
    }

    toString() {
        return this.description;
    }

    toAsymmetricMatcher() {
        return this.description;
    }
}

export class CaptorMatcher<T> {
    $$typeof: symbol;
    public readonly asymmetricMatch: MatcherFn<T>;
    public readonly value!: T;
    public readonly values: T[] = [];
    constructor() {
        this.$$typeof = Symbol.for('jest.asymmetricMatcher');

        this.asymmetricMatch = (actualValue: T) => {
            // @ts-ignore
            this.value = actualValue;
            this.values.push(actualValue);
            return true;
        };
    }

    toString() {
        return 'captor';
    }

    toAsymmetricMatcher() {
        return 'captor';
    }
}

export interface MatcherCreator<T, E = T> {
    (expectedValue?: E): Matcher<T>;
}

export type MatchersOrLiterals<Y extends any[]> = { [K in keyof Y]: Matcher<Y[K]> | Y[K] };

export const any: MatcherCreator<any> = () => new Matcher(() => true, 'any()');
export const anyBoolean: MatcherCreator<boolean> = () => new Matcher((actualValue: boolean) => typeof actualValue === 'boolean', 'anyBoolean()');
export const anyNumber: MatcherCreator<number> = () => new Matcher(actualValue => typeof actualValue === 'number' && !isNaN(actualValue), 'anyNumber()');
export const anyString: MatcherCreator<string> = () => new Matcher((actualValue: string) => typeof actualValue === 'string', 'anyString()');
export const anyFunction: MatcherCreator<Function> = () => new Matcher((actualValue: Function) => typeof actualValue === 'function', 'anyFunction()');
export const anySymbol: MatcherCreator<Symbol> = () => new Matcher(actualValue => typeof actualValue === 'symbol', 'anySymbol()');
export const anyObject: MatcherCreator<any> = () => new Matcher(actualValue => typeof actualValue === 'object' && actualValue !== null, 'anyObject()');

export const anyArray: MatcherCreator<any[]> = () => new Matcher(actualValue => Array.isArray(actualValue), 'anyArray()');
export const anyMap: MatcherCreator<Map<any, any>> = () => new Matcher(actualValue => actualValue instanceof Map, 'anyMap()');
export const anySet: MatcherCreator<Set<any>> = () => new Matcher(actualValue => actualValue instanceof Set, 'anySet()');
export const isA: MatcherCreator<any> = clazz => new Matcher(actualValue => actualValue instanceof clazz, 'isA()');

export const arrayIncludes: MatcherCreator<any[], any> = arrayVal =>
    new Matcher(actualValue => Array.isArray(actualValue) && actualValue.includes(arrayVal), 'arrayIncludes()');
export const setHas: MatcherCreator<Set<any>, any> = arrayVal =>
    new Matcher(actualValue => anySet().asymmetricMatch(actualValue) && actualValue!.has(arrayVal), 'setHas()');
export const mapHas: MatcherCreator<Map<any, any>, any> = mapVal =>
    new Matcher(actualValue => anyMap().asymmetricMatch(actualValue) && actualValue!.has(mapVal), 'mapHas()');
export const objectContainsKey: MatcherCreator<any, string> = key =>
    new Matcher(actualValue => anyObject().asymmetricMatch(actualValue) && actualValue[key!] !== undefined, 'objectContainsKey()');
export const objectContainsValue: MatcherCreator<any> = value =>
    new Matcher(actualValue => anyObject().asymmetricMatch(actualValue) && Object.values(actualValue).includes(value), 'objectContainsValue()');

export const notNull: MatcherCreator<any> = () => new Matcher(actualValue => actualValue !== null, 'notNull()');
export const notUndefined: MatcherCreator<any> = () => new Matcher(actualValue => actualValue !== undefined, 'notUndefined()');
export const notEmpty: MatcherCreator<any> = () =>
    new Matcher(actualValue => actualValue !== null && actualValue !== undefined && actualValue !== '', 'notEmpty()');

export const captor = <T extends any = any>() => new CaptorMatcher<T>();
export const matches = <T extends any = any>(matcher: MatcherFn<T>) => new Matcher(matcher, 'matches()');
