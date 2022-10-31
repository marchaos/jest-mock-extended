
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

type thing = {
    property: string;
};

export type MockContext = {
    prisma: DeepMockProxy<thing>;
};

export const createMockContext = (): MockContext => {
    return {
        prisma: mockDeep<thing>(),
    };
};
