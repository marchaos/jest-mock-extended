
type MatcherFn<T> = (actualValue: T) => boolean;

export interface Matcher<T> {
    (expectedValue?: T): MatcherImpl<T> & any;
}

export class MatcherImpl<T> {
    public readonly match: MatcherFn<T>;
    constructor(matcher: MatcherFn<T>) {
        this.match = matcher;
    }
}

export const any: Matcher<any> = () => new MatcherImpl(() => true);
export const anyBoolean: Matcher<boolean> = () => (actualValue: boolean) => typeof actualValue === 'boolean';
export const anyString: Matcher<string> = () => (actualValue: string) => typeof actualValue === 'string';
export const anyNumber : Matcher<number> = () => new MatcherImpl((actualValue) => typeof actualValue === 'number' && !isNaN(actualValue));
// export const anyFunction: Matcher<Function> = () => (actualValue: Function) => typeof actualValue === 'function';
// export const anySymbol: Matcher<Symbol> = () => (actualValue) => typeof actualValue === 'symbol';
// export const anyObject: Matcher<any> = () => (actualValue) => typeof actualValue === 'object' && actualValue !== null;
//
// export const anyArray: Matcher<any[]> = () => (actualValue) => Array.isArray(actualValue);
// export const anyMap: Matcher<Map<any, any>> = () => (actualValue) => actualValue instanceof Map;
// export const anySet: Matcher<Set<any>> = () => (actualValue) => actualValue instanceof Set;
// export const isA: Matcher<any> = (clazz) => (actualValue) => actualValue instanceof clazz;
//
// export const includes: Matcher<any[]> = (arrayVal) => (actualValue) => Array.isArray(actualValue) && actualValue.includes(arrayVal);
// export const has: Matcher<Set<any>> = (arrayVal) => (actualValue) => anySet()(actualValue) && actualValue!.has(arrayVal);
// export const containsKey: Matcher<any> = (key) => (actualValue) => anyObject()(actualValue) && actualValue[key] !== undefined;
// export const containsValue: Matcher<any> = (value) => (actualValue) => anyObject()(actualValue) && Object.values(actualValue).includes(value);
// export const notNull : Matcher<any> = () => (actualValue) => actualValue !== null;
// export const notUndefined : Matcher<any> = () => (actualValue) => actualValue !== undefined;
// export const notEmpty : Matcher<any> = () => (actualValue) => actualValue !== null && actualValue !== undefined && actualValue !== '';