import { calledWithFn } from './CalledWithFn';
import { MatchersOrLiterals } from './Matchers';
import { DeepPartial } from 'ts-essentials';
import { Mock, vi } from 'vitest';

type ProxiedProperty = string | number | symbol;

interface GlobalConfig {
    // ignoreProps is required when we don't want to return anything for a mock (for example, when mocking a promise).
    ignoreProps?: ProxiedProperty[];
}

const DEFAULT_CONFIG: GlobalConfig = {
    ignoreProps: ['then'],
};

let GLOBAL_CONFIG = DEFAULT_CONFIG;

const VitestMockExtended = {
    DEFAULT_CONFIG,
    configure: (config: GlobalConfig) => {
        // Shallow merge so they can override anything they want.
        GLOBAL_CONFIG = { ...DEFAULT_CONFIG, ...config };
    },
    resetConfig: () => {
        GLOBAL_CONFIG = DEFAULT_CONFIG;
    },
};

interface CalledWithMock<T, Y extends any[]> extends Mock<Y, T> {
    calledWith: (...args: Y | MatchersOrLiterals<Y>) => Mock<Y, T>;
}

type MockProxy<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> : T[K];
} & T;

type DeepMockProxy<T> = {
    // This supports deep mocks in the else branch
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> : DeepMockProxy<T[K]>;
} & T;

type DeepMockProxyWithFuncPropSupport<T> = {
    // This supports deep mocks in the else branch
    [K in keyof T]: T[K] extends (...args: infer A) => infer B ? CalledWithMock<B, A> & DeepMockProxy<T[K]> : DeepMockProxy<T[K]>;
} & T;

interface MockOpts {
    deep?: boolean;
    fallbackMockImplementation?: (...args: any[]) => any;
}

const mockClear = (mock: MockProxy<any>) => {
    for (const key of Object.keys(mock)) {
        if (mock[key] === null || mock[key] === undefined) {
            continue;
        }

        if (mock[key]._isMockObject) {
            mockClear(mock[key]);
        }

        if (mock[key]._isMockFunction) {
            mock[key].mockClear();
        }
    }

    // This is a catch for if they pass in a vi.fn()
    if (!mock._isMockObject) {
        return mock.mockClear();
    }
};

const mockReset = (mock: MockProxy<any>) => {
    for (const key of Object.keys(mock)) {
        if (mock[key] === null || mock[key] === undefined) {
            continue;
        }

        if (mock[key]._isMockObject) {
            mockReset(mock[key]);
        }
        if (mock[key]._isMockFunction) {
            mock[key].mockReset();
        }
    }

    // This is a catch for if they pass in a vi.fn()
    // Worst case, we will create a vi.fn() (since this is a proxy)
    // below in the get and call mockReset on it
    if (!mock._isMockObject) {
        return mock.mockReset();
    }
};

function mockDeep<T>(
    opts: {
        funcPropSupport?: true;
        fallbackMockImplementation?: MockOpts['fallbackMockImplementation'];
    },
    mockImplementation?: DeepPartial<T>,
): DeepMockProxyWithFuncPropSupport<T>;
function mockDeep<T>(mockImplementation?: DeepPartial<T>): DeepMockProxy<T>;
function mockDeep(arg1: any, arg2?: any) {
    const [opts, mockImplementation] =
        typeof arg1 === 'object' && (typeof arg1.fallbackMockImplementation === 'function' || arg1.funcPropSupport === true)
            ? [arg1, arg2]
            : [{}, arg1];
    return mock(mockImplementation, { deep: true, fallbackMockImplementation: opts.fallbackMockImplementation });
}

const overrideMockImp = (obj: DeepPartial<any>, opts?: MockOpts) => {
    const proxy = new Proxy<MockProxy<any>>(obj, handler(opts));
    for (const name of Object.keys(obj)) {
        if (typeof obj[name] === 'object' && obj[name] !== null) {
            proxy[name] = overrideMockImp(obj[name], opts);
        } else {
            proxy[name] = obj[name];
        }
    }

    return proxy;
};

const handler = (opts?: MockOpts) => ({
    ownKeys(target: MockProxy<any>) {
        return Reflect.ownKeys(target);
    },

    set: (obj: MockProxy<any>, property: ProxiedProperty, value: any) => {
        // @ts-ignore All of these ignores are due to https://github.com/microsoft/TypeScript/issues/1863
        obj[property] = value;
        return true;
    },

    get: (obj: MockProxy<any>, property: ProxiedProperty) => {
        // @ts-ignore
        if (!(property in obj)) {
            if (property === '_isMockObject' || property === '_isMockFunction') {
                return undefined;
            }

            if (GLOBAL_CONFIG.ignoreProps?.includes(property)) {
                return undefined;
            }
            // Jest's internal equality checking does some wierd stuff to check for iterable equality
            if (property === Symbol.iterator) {
                // @ts-ignore
                return obj[property];
            }
            // So this calls check here is totally not ideal - jest internally does a
            // check to see if this is a spy - which we want to say no to, but blindly returning
            // an proxy for calls results in the spy check returning true. This is another reason
            // why deep is opt in.
            const fn = calledWithFn({ fallbackMockImplementation: opts?.fallbackMockImplementation });
            if (opts?.deep && property !== 'calls') {
                // @ts-ignore
                obj[property] = new Proxy<MockProxy<any>>(fn, handler(opts));
                // @ts-ignore
                obj[property]._isMockObject = true;
            } else {
                // @ts-ignore
                obj[property] = fn;
            }
        }

        // @ts-ignore
        if (obj instanceof Date && typeof obj[property] === 'function') {
            // @ts-ignore
            return obj[property].bind(obj);
        }

        if (property === 'toJSON') {
            return JSON.stringify(obj);
        }

        // @ts-ignore
        return obj[property];
    },
});

const mock = <T, MockedReturn extends MockProxy<T> & T = MockProxy<T> & T>(
    mockImplementation: DeepPartial<T> = {} as DeepPartial<T>,
    opts?: MockOpts,
): MockedReturn => {
    // @ts-ignore private
    mockImplementation!._isMockObject = true;
    return overrideMockImp(mockImplementation, opts);
};

const mockFn = <
    T,
    A extends any[] = T extends (...args: infer AReal) => any ? AReal : any[],
    R = T extends (...args: any) => infer RReal ? RReal : any,
>(): CalledWithMock<R, A> & T => {
    // @ts-ignore
    return calledWithFn();
};

const stub = <T extends object>(): T => {
    return new Proxy<T>({} as T, {
        get: (obj, property: ProxiedProperty) => {
            if (property in obj) {
                // @ts-ignore
                return obj[property];
            }
            return vi.fn();
        },
    });
};

export { mock, VitestMockExtended, mockClear, mockReset, mockDeep, mockFn, stub };
export type { GlobalConfig, CalledWithMock, MockProxy, DeepMockProxy, MockOpts };
