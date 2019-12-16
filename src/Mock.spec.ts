import mock, { mockDeep } from './Mock';
import { anyNumber } from './Matchers';
import calledWithFn from './CalledWithFn';

interface MockInt {
    id: number;
    getNumber: () => number;
    getSomethingWithArgs: (arg1: number, arg2: number) => number;
}

class Test1 implements MockInt {
    readonly id: number;
    private readonly anotherPart: number;
    public deepProp: Test2 = new Test2();

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
    getNumber(num: number) {
        return num * 2;
    }

    getAnotherString() {
        return 'another string';
    }
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

    describe('calledWith', () => {
        test('can use calledWith without mock', () => {
            const mockFn = calledWithFn();
            mockFn.calledWith(anyNumber(), anyNumber()).mockReturnValue(3);
            expect(mockFn(1, 2)).toBe(3);
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
        it('matchers allow all args to be Matcher based', () => {
            const mockObj: MockInt = mock<MockInt>();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), anyNumber());
        });

        it('matchers allow for a mix of Matcher and literal', () => {
            const mockObj: MockInt = mock<MockInt>();
            mockObj.getSomethingWithArgs(2, 4);
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), 4);
        });

        it('matchers allow for not.toHaveBeenCalledWith', () => {
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

        test('maintains API for deep mocks', () => {
            const mockObj = mockDeep<Test1>();
            mockObj.deepProp.getNumber(100);

            expect(mockObj.deepProp.getNumber.mock.calls[0][0]).toBe(100);
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
    });
});
