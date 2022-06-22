import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('Use mock example', () => {
    type SomeType = { fieldC: string };
    interface SomeInterface {
        fieldA: string;
        fieldB: SomeType;
    }

    it('should mock interfaces and types', () => {
        const mockedInterface = mock<SomeInterface>({ fieldA: 'valueA', fieldB: { fieldC: 'valueC' } });

        expect(mockedInterface.fieldA).toBe('valueA');
        expect(mockedInterface.fieldB).toContain({ fieldC: 'valueC' });
    });
});
