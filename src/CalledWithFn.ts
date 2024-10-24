import { CalledWithMock } from './Mock';
import { Matcher, MatchersOrLiterals } from './Matchers';
import { fn as jestFn, Mock } from 'jest-mock';
import type { FunctionLike } from 'jest-mock';

interface CalledWithStackItem<T extends FunctionLike> {
    args: MatchersOrLiterals<[...Parameters<T>]>;
    calledWithFn: Mock<T>;
}

interface JestAsymmetricMatcher {
    asymmetricMatch(...args: any[]): boolean;
}
function isJestAsymmetricMatcher(obj: any): obj is JestAsymmetricMatcher {
    return !!obj && typeof obj === 'object' && 'asymmetricMatch' in obj && typeof obj.asymmetricMatch === 'function';
}

const checkCalledWith = <T extends FunctionLike>(
    calledWithStack: CalledWithStackItem<T>[],
    actualArgs: [...Parameters<T>],
    fallbackMockImplementation?: T
): ReturnType<T> => {
    const calledWithInstance = calledWithStack.find((instance) =>
        instance.args.every((matcher, i) => {
            if (matcher instanceof Matcher) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            if (isJestAsymmetricMatcher(matcher)) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            return actualArgs[i] === matcher;
        })
    );

    return calledWithInstance
        ? calledWithInstance.calledWithFn(...actualArgs)
        : fallbackMockImplementation && fallbackMockImplementation(...actualArgs);
};

export const calledWithFn = <T extends FunctionLike>({
    fallbackMockImplementation,
}: { fallbackMockImplementation?: T } = {}): CalledWithMock<T> => {
    const fn = jestFn(fallbackMockImplementation);
    let calledWithStack: CalledWithStackItem<T>[] = [];

    (fn as CalledWithMock<T>).calledWith = (...args) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args.
        // If that set of args is matched, we just call that jest.fn() for the result.
        const calledWithFn = jestFn(fallbackMockImplementation);
        const mockImplementation = fn.getMockImplementation();
        if (!mockImplementation || mockImplementation === fallbackMockImplementation) {
            // Our original function gets a mock implementation which handles the matching
            // @ts-expect-error '(...args: any) => ReturnType<T>' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'FunctionLike'.
            fn.mockImplementation((...args) => checkCalledWith(calledWithStack, args, fallbackMockImplementation));
            calledWithStack = [];
        }
        calledWithStack.unshift({ args, calledWithFn });

        return calledWithFn;
    };

    return fn as CalledWithMock<T>;
};

export default calledWithFn;
