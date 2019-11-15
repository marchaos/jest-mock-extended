
type ProxiedProperty = string | number | symbol;

const mock = <T extends {}> () => {
    const set = (obj: T, property: ProxiedProperty, value: any) => {
        obj[property] = value;
        return true;
    };

    const get = (obj: T, property: ProxiedProperty) => {
        if (!obj[property]) {
            obj[property] = jest.fn();
        }
        return obj[property];
    };

    const proxy = new Proxy<T>({} as T, {
        set: (obj, property, value) => set(obj, property, value),
        get: (obj, property) => get(obj, property)
    });

    return proxy;
};

export default mock;