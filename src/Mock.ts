import calledWithFn from './CalledWithFn';
import { MatchersOrLiterals } from './Matchers';
import { DeepPartial } from 'ts-essentials';

type ProxiedProperty = string | number | symbol;

export interface CalledWithMock<T, Y extends any[]> extends jest.Mock<T, Y> {
    calledWith: (...args: Y | MatchersOrLiterals<Y>) => jest.Mock<T, Y>;
}

export type MockProxy<T> = {
    // This supports deep mocks in the else branch
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> & T[K] : MockProxy<T[K]> & T[K];
};

export interface MockOpts {
    deep?: boolean;
}

export const mockDeep = <T>(mockImplementation?: DeepPartial<T>): MockProxy<T> & T => mock(mockImplementation, { deep: true });

// @ts-ignore
const overrideMockImp = (obj: object, opts) => {
    const proxy = new Proxy<MockProxy<any>>(obj, handler(opts));
    for (let name of Object.keys(obj)) {
        // @ts-ignore
        if (typeof obj[name] === 'object' && obj[name] !== null) {
            // @ts-ignore
            proxy[name] = overrideMockImp(obj[name]);
        } else {
            // @ts-ignore
            proxy[name] = obj[name];
        }
    }

    return proxy;
};

const handler = (opts?: MockOpts) => ({
    set: (obj: MockProxy<any>, property: ProxiedProperty, value: any) => {
        // @ts-ignore
        obj[property] = value;
        return true;
    },

    get: (obj: MockProxy<any>, property: ProxiedProperty) => {
        let fn = calledWithFn();

        // @ts-ignore
        if (!obj[property]) {
            // So this calls check here is totally not ideal - jest internally does a
            // check to see if this is a spy - which we want to say no to, but blindly returning
            // an proxy for calls results in the spy check returning true. This is another reason
            // why deep is opt in.
            if (opts?.deep && property !== 'calls') {
                // @ts-ignore
                fn.propName = property;
                // @ts-ignore
                obj[property] = new Proxy<MockProxy<any>>(fn, handler(opts));
            } else {
                // @ts-ignore
                if (!obj[property]) {
                    // @ts-ignore
                    obj[property] = calledWithFn();
                }
            }
        }
        // @ts-ignore
        return obj[property];
    }
});

const mock = <T>(mockImplementation: DeepPartial<T> = {} as DeepPartial<T>, opts?: MockOpts): MockProxy<T> & T => {
    // @ts-ignore
    return overrideMockImp(mockImplementation, opts);
};

export default mock;
