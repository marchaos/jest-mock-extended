import mock from './mock';

interface MockInt {
    getNumber: () => number;
    getSomethingWithArgs: (arg1: number, arg2: number) => number;
}

describe('jest-ts-mock', () => {
    test('Check that a jest.fn() is created without any invocation to the mock method', () => {
        const mockObj = mock<MockInt>();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(0);
    });

    test('Check that invocations are registered', () => {
        const mockObj = mock<MockInt>();
        mockObj.getNumber();
        mockObj.getNumber();
        expect(mockObj.getNumber).toHaveBeenCalledTimes(2);
    });
});