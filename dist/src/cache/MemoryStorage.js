/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
        this.cache = new Map();
    }
    MemoryStorage.prototype.getItem = function (key) {
        return this.cache.get(key) || null;
    };
    MemoryStorage.prototype.setItem = function (key, value) {
        this.cache.set(key, value);
    };
    MemoryStorage.prototype.removeItem = function (key) {
        this.cache.delete(key);
    };
    MemoryStorage.prototype.getKeys = function () {
        var cacheKeys = [];
        this.cache.forEach(function (value, key) {
            cacheKeys.push(key);
        });
        return cacheKeys;
    };
    MemoryStorage.prototype.containsKey = function (key) {
        return this.cache.has(key);
    };
    return MemoryStorage;
}());
export { MemoryStorage };
//# sourceMappingURL=MemoryStorage.js.map