import { IWindowStorage } from "./IWindowStorage";
export declare class MemoryStorage implements IWindowStorage {
    private cache;
    constructor();
    getItem(key: string): string;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    getKeys(): string[];
    containsKey(key: string): boolean;
}
