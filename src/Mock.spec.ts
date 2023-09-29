import { mock, mockClear, mockDeep, mockReset, mockFn, VitestMockExtended } from './Mock'
import { anyNumber } from './Matchers'
import { calledWithFn } from './CalledWithFn'
import { MockProxy } from './Mock'
import { expect, vi, describe, test, it } from 'vitest'

interface MockInt {
    id: number
    someValue?: boolean | null
    getNumber: () => number
    getNumberWithMockArg: (mock: any) => number
    getSomethingWithArgs: (arg1: number, arg2: number) => number
    getSomethingWithMoreArgs: (arg1: number, arg2: number, arg3: number) => number
}

class Test1 implements MockInt {
    readonly id: number
    public deepProp: Test2 = new Test2()
    private readonly anotherPart: number

    constructor(id: number) {
        this.id = id
        this.anotherPart = id
    }

    public ofAnother(test: Test1) {
        return test.getNumber()
    }

    public getNumber() {
        return this.id
    }

    public getNumberWithMockArg(mock: any) {
        return this.id
    }

    public getSomethingWithArgs(arg1: number, arg2: number) {
        return this.id
    }

    public getSomethingWithMoreArgs(arg1: number, arg2: number, arg3: number) {
        return this.id
    }
}

class Test2 {
    public deeperProp: Test3 = new Test3()

    getNumber(num: number) {
        return num * 2
    }

    getAnotherString(str: string) {
        return `${str} another string`
    }
}

class Test3 {
    getNumber(num: number) {
        return num ^ 2
    }
}
class Test4 {
    constructor(test1: Test1, int: MockInt) {}
}

export interface FunctionWithPropsMockInt {
    (arg1: number): number

    prop: number

    nonDeepProp: (arg: Test1) => number

    deepProp: Test2
}

export class Test6 {
    public id: number
    funcValueProp: FunctionWithPropsMockInt

    constructor(funcValueProp: FunctionWithPropsMockInt, id: number) {
        this.id = id
        this.funcValueProp = funcValueProp
    }
}

describe('vitest-mock-extended', () => {
    test('Can be assigned back to itself even when there are private parts', () => {
        // No TS errors here
        const mockObj: Test1 = mock<Test1>()
        // No error here.
        new Test1(1).ofAnother(mockObj)
        expect(mockObj.getNumber).toHaveBeenCalledTimes(1)
    })

    test('Check that a vi.fn() is created without any invocation to the mock method', () => {
        const mockObj = mock<MockInt>()
        expect(mockObj.getNumber).toHaveBeenCalledTimes(0)
    })

    test('Check that invocations are registered', () => {
        const mockObj: MockInt = mock<MockInt>()
        mockObj.getNumber()
        mockObj.getNumber()
        expect(mockObj.getNumber).toHaveBeenCalledTimes(2)
    })

    test('Can mock a return value', () => {
        const mockObj = mock<MockInt>()
        mockObj.getNumber.mockReturnValue(12)
        expect(mockObj.getNumber()).toBe(12)
    })

    test('Can specify args', () => {
        const mockObj = mock<MockInt>()
        mockObj.getSomethingWithArgs(1, 2)
        expect(mockObj.getSomethingWithArgs).toBeCalledWith(1, 2)
    })

    test('Can specify calledWith', () => {
        const mockObj = mock<MockInt>()
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(1)

        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(1)
    })

    test('Can specify multiple calledWith', () => {
        const mockObj = mock<MockInt>()
        mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3)
        mockObj.getSomethingWithArgs.calledWith(6, 7).mockReturnValue(13)

        expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        expect(mockObj.getSomethingWithArgs(6, 7)).toBe(13)
    })

    test('Can specify fallbackMockImplementation', () => {
        const mockObj = mock<MockInt>(
            {},
            {
                fallbackMockImplementation: () => {
                    throw new Error('not mocked')
                },
            },
        )

        expect(() => mockObj.getSomethingWithArgs(1, 2)).toThrowError('not mocked')
    })

    test('Can set props', () => {
        const mockObj = mock<MockInt>()
        mockObj.id = 17

        expect(mockObj.id).toBe(17)
    })

    test('Can set false and null boolean props', () => {
        const mockObj = mock<MockInt>({
            someValue: false,
        })

        const mockObj2 = mock<MockInt>({
            someValue: null,
        })

        expect(mockObj.someValue).toBe(false)
        expect(mockObj2.someValue).toBe(null)
    })

    test('can set undefined explicitly', () => {
        const mockObj = mock<MockInt>({
            someValue: undefined, // this is intentionally set to undefined
        })

        expect(mockObj.someValue).toBe(undefined)
    })

    test('Equals self', () => {
        const mockObj = mock<MockInt>()
        expect(mockObj).toBe(mockObj)
        expect(mockObj).toEqual(mockObj)

        const spy = vi.fn()
        spy(mockObj)
        expect(spy).toHaveBeenCalledWith(mockObj)
    })

    describe('Mimic Type', () => {
        test('can use MockProxy in place of Mock Type', () => {
            const t1: MockProxy<Test1> = mock<Test1>()
            const i1: MockProxy<MockInt> = mock<MockInt>()

            // no TS error
            const f = new Test4(t1, i1)
        })
    })

    describe('calledWith', () => {
        test('can use calledWith without mock', () => {
            const mockFunc = calledWithFn()
            mockFunc.calledWith(anyNumber(), anyNumber()).mockReturnValue(3)
            expect(mockFunc(1, 2)).toBe(3)
        })

        test('Can specify matchers', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(anyNumber(), anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('does not match when one arg does not match Matcher', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(anyNumber(), anyNumber()).mockReturnValue(3)
            // @ts-ignore
            expect(mockObj.getSomethingWithArgs('1', 2)).toBe(undefined)
        })

        test('can use literals', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('can mix Matchers with literals', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('supports multiple calledWith', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(2, anyNumber()).mockReturnValue(4)
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            mockObj.getSomethingWithArgs.calledWith(6, anyNumber()).mockReturnValue(7)

            expect(mockObj.getSomethingWithArgs(2, 2)).toBe(4)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            expect(mockObj.getSomethingWithArgs(6, 2)).toBe(7)
            expect(mockObj.getSomethingWithArgs(7, 2)).toBe(undefined)
        })

        test('supports overriding with same args', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(4)
            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3)

            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('Support vitest matcher', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(expect.anything(), expect.anything()).mockReturnValue(3)

            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('Suport mix Matchers with literals and with vitest matcher', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithMoreArgs.calledWith(anyNumber(), expect.anything(), 3).mockReturnValue(4)

            expect(mockObj.getSomethingWithMoreArgs(1, 2, 3)).toBe(4)
            expect(mockObj.getSomethingWithMoreArgs(1, 2, 4)).toBeUndefined
        })

        test('Can use calledWith with an other mock', () => {
            const mockObj = mock<MockInt>()
            const mockArg = mock()
            mockObj.getNumberWithMockArg.calledWith(mockArg).mockReturnValue(4)

            expect(mockObj.getNumberWithMockArg(mockArg)).toBe(4)
        })
    })

    describe('Matchers with toHaveBeenCalledWith', () => {
        test('matchers allow all args to be Matcher based', () => {
            const mockObj: MockInt = mock<MockInt>()
            mockObj.getSomethingWithArgs(2, 4)
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), anyNumber())
        })

        test('matchers allow for a mix of Matcher and literal', () => {
            const mockObj: MockInt = mock<MockInt>()
            mockObj.getSomethingWithArgs(2, 4)
            expect(mockObj.getSomethingWithArgs).toHaveBeenCalledWith(anyNumber(), 4)
        })

        test('matchers allow for not.toHaveBeenCalledWith', () => {
            const mockObj: MockInt = mock<MockInt>()
            mockObj.getSomethingWithArgs(2, 4)
            expect(mockObj.getSomethingWithArgs).not.toHaveBeenCalledWith(anyNumber(), 5)
        })
    })

    describe('Deep mock support for class variables which are functions but also have nested properties and functions', () => {
        test('can deep mock members', () => {
            const mockObj = mockDeep<Test6>({ funcPropSupport: true })
            const input = new Test1(1)
            mockObj.funcValueProp.nonDeepProp.calledWith(input).mockReturnValue(4)

            expect(mockObj.funcValueProp.nonDeepProp(input)).toBe(4)
        })

        test('three or more level deep mock', () => {
            const mockObj = mockDeep<Test6>({ funcPropSupport: true })
            mockObj.funcValueProp.deepProp.deeperProp.getNumber.calledWith(1).mockReturnValue(4)

            expect(mockObj.funcValueProp.deepProp.deeperProp.getNumber(1)).toBe(4)
        })

        test('maintains API for deep mocks', () => {
            const mockObj = mockDeep<Test6>({ funcPropSupport: true })
            mockObj.funcValueProp.deepProp.getNumber(100)

            expect(mockObj.funcValueProp.deepProp.getNumber.mock.calls[0][0]).toBe(100)
        })

        test('deep expectation work as expected', () => {
            const mockObj = mockDeep<Test6>()
            mockObj.funcValueProp.deepProp.getNumber(2)

            expect(mockObj.funcValueProp.deepProp.getNumber).toHaveBeenCalledTimes(1)
        })

        test('can mock base function which have properties', () => {
            const mockObj = mockDeep<Test6>()
            mockObj.funcValueProp.calledWith(1).mockReturnValue(2)

            expect(mockObj.funcValueProp(1)).toBe(2)
        })

        test('base function expectation work as expected', () => {
            const mockObj = mockDeep<Test6>()
            mockObj.funcValueProp(1)

            expect(mockObj.funcValueProp).toHaveBeenCalledTimes(1)
        })
    })

    describe('Deep mock support', () => {
        test('can deep mock members', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4)
            expect(mockObj.deepProp.getNumber(1)).toBe(4)
        })

        test('three level deep mock', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.deeperProp.getNumber.calledWith(1).mockReturnValue(4)
            expect(mockObj.deepProp.deeperProp.getNumber(1)).toBe(4)
        })

        test('maintains API for deep mocks', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.getNumber(100)

            expect(mockObj.deepProp.getNumber.mock.calls[0][0]).toBe(100)
        })

        test('non deep expectation work as expected', () => {
            const mockObj = mockDeep<Test1>()
            new Test1(1).ofAnother(mockObj)
            expect(mockObj.getNumber).toHaveBeenCalledTimes(1)
        })

        test('deep expectation work as expected', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.getNumber(2)
            expect(mockObj.deepProp.getNumber).toHaveBeenCalledTimes(1)
        })

        test('fallback mock implementation can be overridden', () => {
            const mockObj = mockDeep<Test1>({
                fallbackMockImplementation: () => {
                    throw new Error('not mocked')
                },
            })
            mockObj.deepProp.getAnotherString.calledWith('foo') // no mock implementation
            expect(() => mockObj.getNumber()).toThrowError('not mocked')
            expect(() => mockObj.deepProp.getAnotherString('foo')).toThrowError('not mocked')
        })

        test('fallback mock implementation can be overridden while also providing a mock implementation', () => {
            const mockObj = mockDeep<Test1>(
                {
                    fallbackMockImplementation: () => {
                        throw new Error('not mocked')
                    },
                },
                {
                    getNumber: () => {
                        return 150
                    },
                },
            )

            mockObj.deepProp.getAnotherString.calledWith('?').mockReturnValue('mocked')
            expect(mockObj.getNumber()).toBe(150)
            expect(mockObj.deepProp.getAnotherString('?')).toBe('mocked')
            expect(() => mockObj.deepProp.getNumber(1)).toThrowError('not mocked')
            expect(() => mockObj.deepProp.getAnotherString('!')).toThrowError('not mocked')
        })
    })

    describe('mock implementation support', () => {
        test('can provide mock implementation for props', () => {
            const mockObj = mock<Test1>({
                id: 61,
            })
            expect(mockObj.id).toBe(61)
        })

        test('can provide mock implementation for functions', () => {
            const mockObj = mock<Test1>({
                getNumber: () => {
                    return 150
                },
            })
            expect(mockObj.getNumber()).toBe(150)
        })

        test('Partially mocked implementations can have non-mocked function expectations', () => {
            const mockObj = mock<Test1>({
                getNumber: () => {
                    return 150
                },
            })

            mockObj.getSomethingWithArgs.calledWith(1, 2).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('can provide deep mock implementations', () => {
            const mockObj = mockDeep<Test1>({
                deepProp: {
                    getNumber: (num: number) => {
                        return 76
                    },
                },
            })
            expect(mockObj.deepProp.getNumber(123)).toBe(76)
        })

        test('Partially mocked implementations of deep mocks can have non-mocked function expectations', () => {
            const mockObj = mockDeep<Test1>({
                deepProp: {
                    getNumber: (num: number) => {
                        return 76
                    },
                },
            })

            mockObj.deepProp.getAnotherString.calledWith('abc').mockReturnValue('this string')
            expect(mockObj.deepProp.getAnotherString('abc')).toBe('this string')
        })
    })

    describe('Promise', () => {
        test('Can return as Promise.resolve', async () => {
            const mockObj = mock<MockInt>()
            mockObj.id = 17
            const promiseMockObj = Promise.resolve(mockObj)
            await expect(promiseMockObj).resolves.toBeDefined()
            await expect(promiseMockObj).resolves.toMatchObject({ id: 17 })
        })

        test('Can return as Promise.reject', async () => {
            const mockError = mock<Error>()
            mockError.message = '17'
            const promiseMockObj = Promise.reject(mockError)
            try {
                await promiseMockObj
                throw new Error('Promise must be rejected')
            } catch (e) {
                await expect(e).toBeDefined()
                await expect(e).toBe(mockError)
                await expect(e).toHaveProperty('message', '17')
            }
            await expect(promiseMockObj).rejects.toBeDefined()
            await expect(promiseMockObj).rejects.toBe(mockError)
            await expect(promiseMockObj).rejects.toHaveProperty('message', '17')
        })

        test('Can mock a then function', async () => {
            const mockPromiseObj = Promise.resolve(42)
            const mockObj = mock<MockInt>()
            mockObj.id = 17
            // @ts-ignore
            mockObj.then = mockPromiseObj.then.bind(mockPromiseObj)
            const promiseMockObj = Promise.resolve(mockObj)
            await promiseMockObj
            await expect(promiseMockObj).resolves.toBeDefined()
            await expect(promiseMockObj).resolves.toEqual(42)
        })
    })

    describe('clearing / resetting', () => {
        test('mockReset supports vi.fn()', () => {
            const fn = vi.fn().mockImplementation(() => true)
            expect(fn()).toBe(true)
            mockReset(fn)
            expect(fn()).toBe(undefined)
        })

        test('mockClear supports vi.fn()', () => {
            const fn = vi.fn().mockImplementation(() => true)
            fn()
            expect(fn.mock.calls.length).toBe(1)
            mockClear(fn)
            expect(fn.mock.calls.length).toBe(0)
        })

        test('mockReset object', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            mockReset(mockObj)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(undefined)
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            const x = mockObj.getSomethingWithArgs(1, 2)
            expect(x).toBe(3)
        })

        test('mockClear object', () => {
            const mockObj = mock<MockInt>()
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(1)
            mockClear(mockObj)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(0)
            // Does not clear mock implementations of calledWith
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
        })

        test('mockReset deep', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4)
            expect(mockObj.deepProp.getNumber(1)).toBe(4)
            mockReset(mockObj)
            expect(mockObj.deepProp.getNumber(1)).toBe(undefined)
        })

        test('mockClear deep', () => {
            const mockObj = mockDeep<Test1>()
            mockObj.deepProp.getNumber.calledWith(1).mockReturnValue(4)
            expect(mockObj.deepProp.getNumber(1)).toBe(4)
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(1)
            mockClear(mockObj)
            expect(mockObj.deepProp.getNumber.mock.calls.length).toBe(0)
            // Does not clear mock implementations of calledWith
            expect(mockObj.deepProp.getNumber(1)).toBe(4)
        })

        test('mockReset ignores undefined properties', () => {
            const mockObj = mock<MockInt>()
            mockObj.someValue = undefined
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            mockReset(mockObj)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(undefined)
        })

        test('mockReset ignores null properties', () => {
            const mockObj = mock<MockInt>()
            mockObj.someValue = null
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            mockReset(mockObj)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(undefined)
        })

        test('mockClear ignores undefined properties', () => {
            const mockObj = mock<MockInt>()
            mockObj.someValue = undefined
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(1)
            mockClear(mockObj)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(0)
        })

        test('mockClear ignores null properties', () => {
            const mockObj = mock<MockInt>()
            mockObj.someValue = null
            mockObj.getSomethingWithArgs.calledWith(1, anyNumber()).mockReturnValue(3)
            expect(mockObj.getSomethingWithArgs(1, 2)).toBe(3)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(1)
            mockClear(mockObj)
            expect(mockObj.getSomethingWithArgs.mock.calls.length).toBe(0)
        })
    })

    describe('function mock', () => {
        test('should mock function', async () => {
            type MyFn = (x: number, y: number) => Promise<string>
            const mockFunc = mockFn<MyFn>()
            mockFunc.mockResolvedValue(`str`)
            const result: string = await mockFunc(1, 2)
            expect(result).toBe(`str`)
        })
        test('should mock function and use calledWith', async () => {
            type MyFn = (x: number, y: number) => Promise<string>
            const mockFunc = mockFn<MyFn>()
            mockFunc.calledWith(1, 2).mockResolvedValue(`str`)
            const result: string = await mockFunc(1, 2)
            expect(result).toBe(`str`)
        })
    })

    describe('ignoreProps', () => {
        test('can configure ignoreProps', async () => {
            VitestMockExtended.configure({ ignoreProps: ['ignoreMe'] })
            const mockObj = mock<{ ignoreMe: string; dontIgnoreMe: string }>()
            expect(mockObj.ignoreMe).toBeUndefined()
            expect(mockObj.dontIgnoreMe).toBeDefined()
        })
    })

    describe('VitestMockExtended config', () => {
        test('can mock then', async () => {
            VitestMockExtended.configure({ ignoreProps: [] })
            const mockObj = mock<{ then: () => void }>()
            mockObj.then()
            expect(mockObj.then).toHaveBeenCalled()
        })

        test('can reset config', async () => {
            VitestMockExtended.configure({ ignoreProps: [] })
            VitestMockExtended.resetConfig()
            const mockObj = mock<{ then: () => void }>()
            expect(mockObj.then).toBeUndefined()
        })
    })

    describe('mock Date', () => {
        test('should call built-in date functions', () => {
            type objWithDate = { date: Date }
            const mockObj = mock<objWithDate>({ date: new Date('2000-01-15') })
            expect(mockObj.date.getFullYear()).toBe(2000)
            expect(mockObj.date.getMonth()).toBe(0)
            expect(mockObj.date.getDate()).toBe(15)
        })
    })

    describe('toJSON', () => {
        it('should properly stringify mock given option is set', () => {
            //given
            interface Test {
                test: string
                hello: number
            }
            const mocked = mock<Test>({ test: 'default' }, { useActualToJSON: true })

            //when
            const stringified = JSON.stringify(mocked)

            //then
            expect(stringified).toStrictEqual('{"test":"default","_isMockObject":true}')
        })

        it('should not stringify given option not set', () => {
            //given
            interface Test {
                test: string
                hello: number
            }
            const mocked = mock<Test>({ test: 'default' }, { useActualToJSON: false })

            //when
            const stringified = JSON.stringify(mocked)

            //then
            expect(stringified).toBeUndefined
        })

        it('should stricktly equal after stringify', () => {
            //given
            interface Test {
                cookie: {
                    domain: string
                }
            }
            const cookie = { domain: 'dummy' }
            const data = mock<Test>({ cookie })

            //when
            JSON.stringify(data)

            //when
            expect({ cookie: { domain: 'dummy' } }).toStrictEqual({ cookie })
        })
    })
})
