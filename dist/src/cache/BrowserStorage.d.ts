import { IWindowStorage } from "./IWindowStorage";
export declare class BrowserStorage implements IWindowStorage {
    private _windowStorage;
    private cacheLocation;
    get windowStorage(): Storage;
    constructor(cacheLocation: string);
    private validateWindowStorage;
    getItem(key: string): string;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    getKeys(): string[];
    containsKey(key: string): boolean;
}
