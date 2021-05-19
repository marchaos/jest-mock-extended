import mock, { mockClear, mockDeep, mockReset, mockFn, JestMockExtended } from './Mock';
import { anyNumber } from './Matchers';
import calledWithFn from './CalledWithFn';
import { MockProxy } from './Mock';

interface MockInt {
    id: number;
    someValue?: boolean | null;
    getNumber: () => number;
    getSomethingWithArgs: (arg1: number, arg2: number) => number;
}

class Test1 implements MockInt {
    readonly id: number;
    public deepProp: Test2 = new Test2();
    private readonly anotherPart: number;

    constructor(id: number) {
        this.id = id;
        this.anotherPart = id;
    }

    public ofAnother(test: Test1) {
        return test.getNumber();
    }

    public getNumber() {
        return this.id;
    }

    public getSomethingWithArgs(arg1: number, arg2: number) {
        return this.id;
    }
}

class Test2 {
    public deeperProp: Test3 = new Test3();

    getNumber(num: number) {
        return num * 2;
    }

    getAnotherString(str: string) {
        return `${str} another string`;
    }
}

class Test3 {
    getNumber(num: number) {
        return num ^ 2;
    }
}
class Test4 {
    constructor(test1: Test1, int: MockInt) {}
}

describe('jest-mock-extended', () => {
    test('Can be assigned back to itself even when there are private parts', () => {
        // No TS errors here
        const mockObj: Test1 = mock<Test1>();
        // No error here.
        new Test1(1).ofAnother(mockObj);
        expect(mockObj.getNumber).toHaveBeenCalledTimes(1);
    });

    test('Check that a jest.fn() is created without any invocation to the mock method', () => {
        const mockObj = mock<MockInt>();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(0);
    });

    test('Check that invocations are registered', () => {
        const mockObj: MockInt = mock<MockInt>();
        mockObj.getNumber();
        mockObj.getNumber();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(2);
    });

    test('Can mock a return value', () => {
        const mockObj = mock<MockInt>();
        mockObj.getNumber.mockReturnValue(12);
        expect(mockObj.getNumber()).toBe(12);
    });

    test('Can specify args', () => {
        const mockObj = mock<MockInt>();
        mockObj.getSomethingWithArgs(1, 2);
        expect(mockObj.getSomethingWithArgs).toBeCalledWith(1, 2);
    });

    test('Can specify calledWith', () => {
        const mockObj = mock<MockInt>();
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(1);

        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(1);
    });

    test('Can specify multiple calledWith', () => {
        const mockObj = mock<MockInt>();
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
        mockObj.getSomethingWithArgs.calledWith(6, 7).mockReturnValue(13);

        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        expect(mockObj.getSomethingWithArgs(6, 7)).toBe(13);
    });

    test('Can set props', () => {
        const mockObj = mock<MockInt>();
        mockObj.id = 17;

        expect(mockObj.id).toBe(17);
    });

    test('Can set false and null boolean props', () => {
        const mockObj = mock<MockInt>({
            someValue: false
        });

        const mockObj2 = mock<MockInt>({
            someValue: null
        });

        expect(mockObj.someValue).toBe(false);
        expect(mockObj2.someValue).toBe(null);
    });

    test('can set undefined explicitly', () => {
        const mockObj = mock<MockInt>({
            someValue: undefined // this is intentionally set to undefined
        });

        expect(mockObj.someValue).toBe(undefined);
    });

    test('Equals self', () => {
        const mockObj = mock<MockInt>();
        expect(mockObj).toBe(mockObj);
        expect(mockObj).toEqual(mockObj);

        const spy = jest.fn();
        spy(mockObj);
        expect(spy).toHaveBeenCalledWith(mockObj);
    });

    describe('Mimic Type', () => {
        test('can use MockProxy in place of Mock Type', () => {
            const t1: MockProxy<Test1> = mock<Test1>();
            const i1: MockProxy<MockInt> = mock<MockInt>();

            // no TS error
            const f = new Test4(t1, i1);
        });
    });

    describe('calledWith', () => {
        test('can use calledWith without mock', () => {
            const mockFunc = calledWithFn();
            mockFunc.calledWith(anyNumber(), anyNumber()).mockReturnValue(3);
            expect(mockFunc(1, 2)).toBe(3);
        });

        test('Can specify matchers', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(anyNumber(), anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('does not match when one arg does not match Matcher', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(anyNumber(), anyNumber()).mockReturnValue(3);
            // @ts-ignore
            expect(mockObj.getSomethingWithArgs('1', 2)).toBe(undefined);
        });

        test('can use literals', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('can mix Matchers with literals', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('supports multiple calledWith', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(2, anyNumber()).mockReturnValue(4);
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3);
            mockObj.getSomethingWithArgs.calledWith(6, anyNumber()).mockReturnValue(7);

            expect(mockObj.getSomethingWithArgs(2, 2)).toBe(4);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            expect(mockObj.getSomethingWithArgs(6, 2)).toBe(7);
            expect(mockObj.getSomethingWithArgs(7, 2)).toBe(undefined);
        });
    });

    describe('Matchers with toHaveBeenCalledWith', () => {
        test('matchers allow all args to be Matcher based', () => {
            const mockObj: MockInt = mock<MockInt>();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), anyNumber());
        });

        test('matchers allow for a mix of Matcher and literal', () => {
            const mockObj: MockInt = mock<MockInt>();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), 4);
        });

        test('matchers allow for not.toHaveBeenCalledWith', () => {
            const mockObj: MockInt = mock<MockInt>();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).not.toHaveBeenCalledWith(anyNumber(), 5);
        });
    });

    describe('Deep mock support', () => {
        test('can deep mock members', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
        });

        test('three level deep mock', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.deeperProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.deeperProp.getNumber(1)).toBe(4);
        });

        test('maintains API for deep mocks', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber(100);

            expect(mockObj.deepProp.getNumber.mock.calls[0][0]).toBe(100);
        });

        test('non deep expectation work as expected', () => {
            const mockObj = mockDeep<Test1>();
            new Test1(1).ofAnother(mockObj);
            expect(mockObj.getNumber).toHaveBeenCalledTimes(1);
        });

        test('deep expectation work as expected', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber(2);
            expect(mockObj.deepProp.getNumber).toHaveBeenCalledTimes(1);
        });
    });

    describe('mock implementation support', () => {
        test('can provide mock implementation for props', () => {
            const mockObj = mock<Test1>({
                id: 61
            });
            expect(mockObj.id).toBe(61);
        });

        test('can provide mock implementation for functions', () => {
            const mockObj = mock<Test1>({
                getNumber: () => {
                    return 150;
                }
            });
            expect(mockObj.getNumber()).toBe(150);
        });

        test('Partially mocked implementations can have non-mocked function expectations', () => {
            const mockObj = mock<Test1>({
                getNumber: () => {
                    return 150;
                }
            });

            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('can provide deep mock implementations', () => {
            const mockObj = mockDeep<Test1>({
                deepProp: {
                    getNumber: (num: number) => {
                        return 76;
                    }
                }
            });
            expect(mockObj.deepProp.getNumber(123)).toBe(76);
        });

        test('Partially mocked implementations of deep mocks can have non-mocked function expectations', () => {
            const mockObj = mockDeep<Test1>({
                deepProp: {
                    getNumber: (num: number) => {
                        return 76;
                    }
                }
            });

            mockObj.deepProp.getAnotherString.calledWith('abc').mockReturnValue('this string');
            expect(mockObj.deepProp.getAnotherString('abc')).toBe('this string');
        });
    });

    describe('Promise', () => {
        test('Can return as Promise.resolve', async () => {
            const mockObj = mock<MockInt>();
            mockObj.id = 17;
            const promiseMockObj = Promise.resolve(mockObj);
            await expect(promiseMockObj).resolves.toBeDefined();
            await expect(promiseMockObj).resolves.toMatchObject({ id: 17 });
        });

        test('Can return as Promise.reject', async () => {
            const mockError = mock<Error>();
            mockError.message = '17';
            const promiseMockObj = Promise.reject(mockError);
            try {
                await promiseMockObj;
                fail('Promise must be rejected');
            } catch (e) {
                await expect(e).toBeDefined();
                await expect(e).toBe(mockError);
                await expect(e).toHaveProperty('message', '17');
            }
            await expect(promiseMockObj).rejects.toBeDefined();
            await expect(promiseMockObj).rejects.toBe(mockError);
            await expect(promiseMockObj).rejects.toHaveProperty('message', '17');
        });

        test('Can mock a then function', async () => {
            const mockPromiseObj = Promise.resolve(42);
            const mockObj = mock<MockInt>();
            mockObj.id = 17;
            // @ts-ignore
            mockObj.then = mockPromiseObj.then.bind(mockPromiseObj);
            const promiseMockObj = Promise.resolve(mockObj);
            await promiseMockObj;
            await expect(promiseMockObj).resolves.toBeDefined();
            await expect(promiseMockObj).resolves.toEqual(42);
        });
    });

    describe('clearing / resetting', () => {
        test('mockReset supports jest.fn()', () => {
            const fn = jest.fn().mockImplementation(() => true);
            expect(fn()).toBe(true);
            mockReset(fn);
            expect(fn()).toBe(undefined);
        });

        test('mockClear supports jest.fn()', () => {
            const fn = jest.fn().mockImplementation(() => true);
            fn();
            expect(fn.mock.calls.length).toBe(1);
            mockClear(fn);
            expect(fn.mock.calls.length).toBe(0);
        });

        test('mockReset object', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            mockReset(mockObj);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(undefined);
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('mockClear object', () => {
            const mockObj = mock<MockInt>();
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3);
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(1);
            mockClear(mockObj);
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(0);
            // Does not clear mock implementations of calledWith
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3);
        });

        test('mockReset deep', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
            mockReset(mockObj);
            expect(mockObj.deepProp.getNumber(1)).toBe(undefined);
        });

        test('mockClear deep', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4);
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(1);
            mockClear(mockObj);
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(0);
            // Does not clear mock implementations of calledWith
            expect(mockObj.deepProp.getNumber(1)).toBe(4);
        });
    });

    describe('function mock', () => {
        test('should mock function', async () => {
            type MyFn = (x: number, y: number) => Promise<string>;
            const mockFunc = mockFn<MyFn>();
            mockFunc.mockResolvedValue(`str`);
            const result: string = await mockFunc(1, 2);
            expect(result).toBe(`str`);
        });
        test('should mock function and use calledWith', async () => {
            type MyFn = (x: number, y: number) => Promise<string>;
            const mockFunc = mockFn<MyFn>();
            mockFunc.calledWith(1, 2).mockResolvedValue(`str`);
            const result: string = await mockFunc(1, 2);
            expect(result).toBe(`str`);
        });
    });

    describe('ignoreProps', () => {
        test('can configure ignoreProps', async () => {
            JestMockExtended.configure({ ignoreProps: ['ignoreMe'] });
            const mockFunc = mock<{ ignoreMe: string; dontIgnoreMe: string }>();
            expect(mockFunc.ignoreMe).toBeUndefined();
            expect(mockFunc.dontIgnoreMe).toBeDefined();
        });
    });
});
