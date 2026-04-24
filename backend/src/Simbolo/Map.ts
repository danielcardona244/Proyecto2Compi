export class MapType {
    public keyType: any;
    public valueType: any;
    public values: Map<any, any>;

    constructor(keyType: any, valueType: any) {
        this.keyType = keyType;
        this.valueType = valueType;
        this.values = new Map();
    }

    public set(key: any, value: any): void {
        this.values.set(key, value);
    }

    public get(key: any): any {
        return this.values.get(key);
    }

    public has(key: any): boolean {
        return this.values.has(key);
    }
}
