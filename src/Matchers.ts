export type MatcherFn<T> = (actualValue: T) => boolean;

// needs to be a class so we can instanceof
export class Matcher<T> {
    public readonly asymmetricMatch: MatcherFn<T>;
    constructor(matcher: MatcherFn<T>) {
        this.asymmetricMatch = matcher;
    }
}

export class CaptorMatcher<T> {
    public readonly asymmetricMatch: MatcherFn<T>;
    public readonly value!: T;
    public readonly values: T[] = [];
    constructor() {
        this.asymmetricMatch = (actualValue: T) => {
            // @ts-ignore
            this.value = actualValue;
            this.values.push(actualValue);
            return true;
        };
    }


}

export interface MatcherCreator<T, E = T> {
    (expectedValue?: E): Matcher<T>;
}

export interface CaptorMatcherCreator<T, E = T> {
    (expectedValue?: E): CaptorMatcher<T>;
}


export type MatchersOrLiterals<Y extends any[]> = { [K in keyof Y]: Matcher<Y[K]> | Y[K] };

export const any: MatcherCreator<any> = () => new Matcher(() => true);
export const anyBoolean: MatcherCreator<boolean> = () => new Matcher((actualValue: boolean) => typeof actualValue === 'boolean');
export const anyNumber: MatcherCreator<number> = () => new Matcher(actualValue => typeof actualValue === 'number' && !isNaN(actualValue));
export const anyString: MatcherCreator<string> = () => new Matcher((actualValue: string) => typeof actualValue === 'string');
export const anyFunction: MatcherCreator<Function> = () => new Matcher((actualValue: Function) => typeof actualValue === 'function');
export const anySymbol: MatcherCreator<Symbol> = () => new Matcher(actualValue => typeof actualValue === 'symbol');
export const anyObject: MatcherCreator<any> = () => new Matcher(actualValue => typeof actualValue === 'object' && actualValue !== null);

export const anyArray: MatcherCreator<any[]> = () => new Matcher(actualValue => Array.isArray(actualValue));
export const anyMap: MatcherCreator<Map<any, any>> = () => new Matcher(actualValue => actualValue instanceof Map);
export const anySet: MatcherCreator<Set<any>> = () => new Matcher(actualValue => actualValue instanceof Set);
export const isA: MatcherCreator<any> = clazz => new Matcher(actualValue => actualValue instanceof clazz);

export const arrayIncludes: MatcherCreator<any[], any> = arrayVal =>
    new Matcher(actualValue => Array.isArray(actualValue) && actualValue.includes(arrayVal));
export const setHas: MatcherCreator<Set<any>, any> = arrayVal =>
    new Matcher(actualValue => anySet().asymmetricMatch(actualValue) && actualValue!.has(arrayVal));
export const mapHas: MatcherCreator<Map<any, any>, any> = mapVal =>
    new Matcher(actualValue => anyMap().asymmetricMatch(actualValue) && actualValue!.has(mapVal));
export const objectContainsKey: MatcherCreator<any, string> = key =>
    new Matcher(actualValue => anyObject().asymmetricMatch(actualValue) && actualValue[key!] !== undefined);
export const objectContainsValue: MatcherCreator<any> = value =>
    new Matcher(actualValue => anyObject().asymmetricMatch(actualValue) && Object.values(actualValue).includes(value));

export const notNull: MatcherCreator<any> = () => new Matcher(actualValue => actualValue !== null);
export const notUndefined: MatcherCreator<any> = () => new Matcher(actualValue => actualValue !== undefined);
export const notEmpty: MatcherCreator<any> = () =>
    new Matcher(actualValue => actualValue !== null && actualValue !== undefined && actualValue !== '');

export const captor: CaptorMatcherCreator<any> = () => new CaptorMatcher();

