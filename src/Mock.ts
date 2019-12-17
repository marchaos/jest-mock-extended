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

const JestFnAPI = [
    '_isMockFunction',
    '_protoImpl',
    'getMockName',
    'getMockImplementation',
    'mock',
    'mockClear',
    'mockReset',
    'mockRestore',
    'mockImplementation',
    'mockImplementation',
    'mockImplementationOnce',
    'mockImplementationOnce',
    'mockName',
    'mockReturnThis',
    'mockReturnValue',
    'mockReturnValueOnce',
    'mockResolvedValue',
    'mockResolvedValueOnce',
    'mockRejectedValue',
    'mockRejectedValueOnce',
    'calledWith' // added by this library
];

export interface MockOpts {
    deep?: boolean;
}

export const mockDeep = <T>(mockImplementation?: DeepPartial<T>): MockProxy<T> & T => mock(mockImplementation, { deep: true });

const mock = <T>(mockImplementation: DeepPartial<T> = {} as DeepPartial<T>, opts?: MockOpts): MockProxy<T> & T => {
    const handler = {
        set: (obj: MockProxy<T>, property: ProxiedProperty, value: any) => {
            // @ts-ignore
            obj[property] = value;
            return true;
        },

        get: (obj: MockProxy<T>, property: ProxiedProperty) => {
            let fn = calledWithFn();
            // @ts-ignore
            if (!obj[property]) {
                if (opts?.deep) {
                    // @ts-ignore
                    fn.propName = property;
                    // @ts-ignore
                    obj[property] = new Proxy<MockProxy<T>>(fn, handler);
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
        },

        apply: (obj: MockProxy<T>, thisArg: any, argumentsList: Array<any>) => {
            // check to see if this is a call on a the MockInstance which we will need to delegate to the instance rather
            // than the function i.e
            // const mock = jest.fn();
            // mock.mockReturnValue() // Call on instance
            // mock(); // call on mock function
            // TODO: There does not seem to be a cleaner way to do this - any suggestions?

            // @ts-ignore
            if (JestFnAPI.includes(obj.propName)) {
                // @ts-ignore
                return obj[obj.propName](...argumentsList);
            }

            // otherwise it's a call on the mock function.
            // @ts-ignore
            return obj(...argumentsList);
        }
    };

    return new Proxy<MockProxy<T>>(mockImplementation as MockProxy<T>, handler);
};

export default mock;
