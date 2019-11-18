import mock from './mock';
import { anyNumber} from './Matchers';
import calledWithFn from './CalledWithFn';

interface MockInt {
    getNumber: () => number;
    getSomethingWithArgs: (arg1: number, arg2: number) => number;
}

describe('jest-mock-extended', () => {
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
    });
});
