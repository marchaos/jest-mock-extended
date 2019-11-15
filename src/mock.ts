import * as jest from 'jest';

type ProxiedProperty = string | number | symbol;

type MockProxy<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ?
        jest.MockInstance<ReturnType<T[K]>, A> & T[K]: T[K]
}

const mock = <T extends {}> (): MockProxy<T> => {
    const set = (obj: MockProxy<T>, property: ProxiedProperty, value: any) => {
        // @ts-ignore
        obj[property] = value;
        return true;
    };

    const get = (obj: MockProxy<T>, property: ProxiedProperty) => {
        // @ts-ignore
        if (!obj[property]) {
            // @ts-ignore
            obj[property] = jest.fn();
        }
        // @ts-ignore
        return obj[property];
    };

    return new Proxy<MockProxy<T>>({} as MockProxy<T>, {
        set: (obj, property, value) => set(obj, property, value),
        get: (obj, property) => get(obj, property)
    });
};

export default mock;