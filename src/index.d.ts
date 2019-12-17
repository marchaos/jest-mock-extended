/// <reference types="jest" />

import {MockOpts, MockProxy} from "./Mock";
import {DeepPartial} from 'ts-essentials';

declare namespace jest {
     function mockType<T>(mockImplementation: DeepPartial<T>, opts?: MockOpts): MockProxy<T> & T;
}