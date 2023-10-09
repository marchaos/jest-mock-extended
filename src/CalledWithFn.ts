import { CalledWithMock } from './Mock';
import { Matcher, MatchersOrLiterals } from './Matchers';
import isEqual from 'lodash.isequal';

interface CalledWithStackItem<T, Y extends any[]> {
    args: MatchersOrLiterals<Y>;
    calledWithFn: jest.Mock<T, Y>;
}

interface JestAsymmetricMatcher {
    asymmetricMatch(...args: any[]): boolean;
}
function isJestAsymmetricMatcher(obj: any): obj is JestAsymmetricMatcher {
    return !!obj && typeof obj === 'object' && 'asymmetricMatch' in obj && typeof obj.asymmetricMatch === 'function';
}

const checkCalledWith = <T, Y extends any[]>(
    calledWithStack: CalledWithStackItem<T, Y>[],
    actualArgs: Y,
    fallbackMockImplementation?: (...args: Y) => T
): T => {
    const calledWithInstance = calledWithStack.find((instance) =>
        instance.args.every((matcher, i) => {
            if (matcher instanceof Matcher) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            if (isJestAsymmetricMatcher(matcher)) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            return isEqual(actualArgs[i], matcher);
        })
    );

    // @ts-ignore cannot return undefined, but this will fail the test if there is an expectation which is what we want
    return calledWithInstance
        ? calledWithInstance.calledWithFn(...actualArgs)
        : fallbackMockImplementation && fallbackMockImplementation(...actualArgs);
};

export const calledWithFn = <T, Y extends any[]>({
    fallbackMockImplementation,
}: { fallbackMockImplementation?: (...args: Y) => T } = {}): CalledWithMock<T, Y> => {
    const fn: jest.Mock<T, Y> = jest.fn(fallbackMockImplementation);
    let calledWithStack: CalledWithStackItem<T, Y>[] = [];

    (fn as CalledWithMock<T, Y>).calledWith = (...args) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args.
        // If that set of args is matched, we just call that jest.fn() for the result.
        const calledWithFn = jest.fn(fallbackMockImplementation);
        const mockImplementation = fn.getMockImplementation();
        if (!mockImplementation || mockImplementation === fallbackMockImplementation) {
            // Our original function gets a mock implementation which handles the matching
            fn.mockImplementation((...args: Y) => checkCalledWith(calledWithStack, args, fallbackMockImplementation));
            calledWithStack = [];
        }
        calledWithStack.unshift({ args, calledWithFn });

        return calledWithFn;
    };

    return fn as CalledWithMock<T, Y>;
};

export default calledWithFn;
