import CalledWith from "./CalledWith";

type ProxiedProperty = string | number | symbol;

export interface CalledWithMockInstance<T, Y extends any[]> extends jest.MockInstance<T, Y> {
    calledWith: (...args: Y) => jest.MockInstance<T, Y>;
}

export type TSMock<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ?
        CalledWithMockInstance<B, A> & T[K]: T[K]
}

const mock = <T extends {}> (): TSMock<T> => {
    const set = (obj: TSMock<T>, property: ProxiedProperty, value: any) => {
        // @ts-ignore
        obj[property] = value;
        return true;
    };

    const get = (obj: TSMock<T>, property: ProxiedProperty) => {
        // @ts-ignore
        if (!obj[property]) {
            // @ts-ignore
            obj[property] = CalledWith(jest.fn());
        }
        // @ts-ignore
        return obj[property];
    };

    return new Proxy<TSMock<T>>({} as TSMock<T>, {
        set: (obj, property, value) => set(obj, property, value),
        get: (obj, property) => get(obj, property)
    });
};

export default mock;