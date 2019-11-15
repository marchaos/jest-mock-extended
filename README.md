# jest-ts-mock
Type safe mocking framework for Jest

# Installation
```
npm install jest-ts-mock --save-dev
```
or
```
yarn add jest-ts-mock --dev
```

# Example

```js
import mock from 'jest-ts-mock';

interface FunProvider {
   getSomeFun: () => string;
   makeFun: (funMethod: string) => void;
}

describe('My Awesome Tests', () => {

   test('Mock out an interface', () => {
       const mock = mock<FunProvider>();
       mock.makeFun('disco party');
       
       expect(mock.makeFun).toHaveBeenCalledWith('disco party');
   });
   
   
   test('mock out a return type', () => {
       const mock = mock<FunProvider>();
       mock.getSomeFun.mockReturnValue('west coast party');
       
       expect(mock.getSomeFun()).toBe('west coast party');
   });

});
```
