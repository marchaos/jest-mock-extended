import {CalledWithMockInstance} from "./mock";
import {Matcher, MatcherImpl} from "./Matchers";

interface CalledWithStackItem<T, Y extends any[]> {
    args: Y;
    calledWithFn: jest.Mock<T, Y>
}

const checkCalledWith = <T, Y extends any[]> (calledWithStack: CalledWithStackItem<T, Y>[], actualArgs: Y): T => {
    const calledWithInstance = calledWithStack.find((instance) =>
        instance.args.every((matcher, i) => {
            if (matcher instanceof MatcherImpl) {
                console.info('asdasdasd', actualArgs[i]);
                return matcher.match(actualArgs[i]);
            }
            console.info('oh')
            return actualArgs[i] === matcher
        })
    );

    // @ts-ignore cannot return undefined, but this will fail the test if there is an expectation which is what we want
    return calledWithInstance? calledWithInstance.calledWithFn(...actualArgs): undefined;
};

export const CalledWith = <T, Y extends any[]> (fn: jest.MockInstance<T, Y>): jest.MockInstance<T, Y> => {
    const calledWithStack: CalledWithStackItem<T, Y>[] = [];
    (fn as CalledWithMockInstance<T, Y>).calledWith = (...args: Y) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args
        // If that set of args is matched, we just call that jest.fn() for the result.
        const calledWithFn = jest.fn();
        // Our original function gets a mock implementation which handles the matching
        fn.mockImplementation((...args: Y) => checkCalledWith(calledWithStack, args));
        calledWithStack.push({args, calledWithFn});
        return calledWithFn;
    };

    return (fn as jest.MockInstance<T, Y>);
};

export default CalledWith;