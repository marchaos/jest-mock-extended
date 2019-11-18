import { CalledWithMock } from './mock';
import { Matcher, Matchers } from './Matchers';

interface CalledWithStackItem<T, Y extends any[]> {
    args: Y | Matchers<Y>;
    calledWithFn: jest.Mock<T, Y>;
}

const checkCalledWith = <T, Y extends any[]>(calledWithStack: CalledWithStackItem<T, Y>[], actualArgs: Y): T => {
    const calledWithInstance = calledWithStack.find(instance =>
        instance.args.every((matcher, i) => {
            if (matcher instanceof Matcher) {
                return matcher.match(actualArgs[i]);
            }
            return actualArgs[i] === matcher;
        })
    );

    // @ts-ignore cannot return undefined, but this will fail the test if there is an expectation which is what we want
    return calledWithInstance ? calledWithInstance.calledWithFn(...actualArgs) : undefined;
};

export const calledWithFn = <T, Y extends any[]>(): CalledWithMock<T, Y> => {
    const fn: jest.Mock<T, Y> = jest.fn();
    const calledWithStack: CalledWithStackItem<T, Y>[] = [];

    (fn as CalledWithMock<T, Y>).calledWith = (...args) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args
        // If that set of args is matched, we just call that jest.fn() for the result.
        const calledWithFn = jest.fn();
        // Our original function gets a mock implementation which handles the matching
        fn.mockImplementation((...args: Y) => checkCalledWith(calledWithStack, args));
        calledWithStack.push({ args, calledWithFn });

        return calledWithFn;
    };

    return fn as CalledWithMock<T, Y>;
};

export default calledWithFn;
