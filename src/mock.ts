
type ProxiedProperty = string | number | symbol;

const mock = <T extends {}> () => {
    const set = (obj: T, property: ProxiedProperty, value: any) => {
        // @ts-ignore
        obj[property] = value;
        return true;
    };

    const get = (obj: T, property: ProxiedProperty) => {
        // @ts-ignore
        if (!obj[property]) {
            // @ts-ignore
            obj[property] = jest.fn();
        }
        // @ts-ignore
        return obj[property];
    };

    return new Proxy<T>({} as T, {
        set: (obj, property, value) => set(obj, property, value),
        get: (obj, property) => get(obj, property)
    });
};

export default mock;