import { CalledWithMock } from './Mock';
import { Matcher, MatchersOrLiterals } from './Matchers';
import { vi, Mock } from 'vitest';

interface CalledWithStackItem<T, Y extends any[]> {
    args: MatchersOrLiterals<Y>;
    calledWithFn: Mock<Y, T>;
}

interface VitestAsymmetricMatcher {
    asymmetricMatch(...args: any[]): boolean;
}
function isVitestAsymmetricMatcher(obj: any): obj is VitestAsymmetricMatcher {
    return !!obj && typeof obj === 'object' && 'asymmetricMatch' in obj && typeof obj.asymmetricMatch === 'function';
}

const checkCalledWith = <T, Y extends any[]>(
    calledWithStack: CalledWithStackItem<T, Y>[],
    actualArgs: Y,
    fallbackMockImplementation?: FallbackImplementation<Y, T>
): T => {
    const calledWithInstance = calledWithStack.find((instance) =>
        instance.args.every((matcher, i) => {
            if (matcher instanceof Matcher) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            if (isVitestAsymmetricMatcher(matcher)) {
                return matcher.asymmetricMatch(actualArgs[i]);
            }

            return actualArgs[i] === matcher;
        })
    );

    // @ts-ignore cannot return undefined, but this will fail the test if there is an expectation which is what we want
    return calledWithInstance
        ? calledWithInstance.calledWithFn(...actualArgs)
        : fallbackMockImplementation && fallbackMockImplementation(...actualArgs);
};

type FallbackImplementation<Y extends any[], T> = (...args: Y) => T;
type CalledWithFnArgs<Y extends any[], T> = { fallbackMockImplementation?: FallbackImplementation<Y, T> };

const calledWithFn = <T, Y extends any[]>({ fallbackMockImplementation }: CalledWithFnArgs<Y, T> = {}): CalledWithMock<T, Y> => {
    const fn: Mock<Y, T> = fallbackMockImplementation ? vi.fn(fallbackMockImplementation) : vi.fn();
    let calledWithStack: CalledWithStackItem<T, Y>[] = [];

    (fn as CalledWithMock<T, Y>).calledWith = (...args) => {
        // We create new function to delegate any interactions (mockReturnValue etc.) to for this set of args.
        // If that set of args is matched, we just call that vi.fn() for the result.
        const calledWithFn: Mock<Y, T> = fallbackMockImplementation ? vi.fn(fallbackMockImplementation) : vi.fn();
        const mockImplementation = fn.getMockImplementation();
        if (
            !mockImplementation ||
            fn.getMockImplementation()?.name === 'implementation' ||
            mockImplementation === fallbackMockImplementation
        ) {
            // Our original function gets a mock implementation which handles the matching
            fn.mockImplementation((...args: Y) => checkCalledWith(calledWithStack, args, fallbackMockImplementation));
            calledWithStack = [];
        }
        calledWithStack.unshift({ args, calledWithFn });

        return calledWithFn;
    };

    return fn as CalledWithMock<T, Y>;
};

export { calledWithFn };
