export {
  VitestMockExtended as JestMockExtended,
  GlobalConfig,
  mockDeep,
  MockProxy,
  DeepMockProxy,
  CalledWithMock,
  mockClear,
  mockReset,
  mockFn,
  stub,
} from './Mock';
import { default as mockDefault } from './Mock';
export const mock = mockDefault;
import { default as calledWithFnDefault } from './CalledWithFn';
export const calledWithFn = calledWithFnDefault;
export * from './Matchers';
