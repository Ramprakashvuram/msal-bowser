/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BrowserConfigurationAuthError } from "../error/BrowserConfigurationAuthError";
import { BrowserCacheLocation } from "../utils/BrowserConstants";
var BrowserStorage = /** @class */ (function () {
    function BrowserStorage(cacheLocation) {
        this.validateWindowStorage(cacheLocation);
        this.cacheLocation = cacheLocation;
    }
    Object.defineProperty(BrowserStorage.prototype, "windowStorage", {
        get: function () {
            if (!this._windowStorage) {
                this._windowStorage = window[this.cacheLocation];
            }
            return this._windowStorage;
        },
        enumerable: true,
        configurable: true
    });
    BrowserStorage.prototype.validateWindowStorage = function (cacheLocation) {
        if (cacheLocation !== BrowserCacheLocation.LocalStorage && cacheLocation !== BrowserCacheLocation.SessionStorage) {
            throw BrowserConfigurationAuthError.createStorageNotSupportedError(cacheLocation);
        }
        var storageSupported = !!window[cacheLocation];
        if (!storageSupported) {
            throw BrowserConfigurationAuthError.createStorageNotSupportedError(cacheLocation);
        }
    };
    BrowserStorage.prototype.getItem = function (key) {
        return this.windowStorage.getItem(key);
    };
    BrowserStorage.prototype.setItem = function (key, value) {
        this.windowStorage.setItem(key, value);
    };
    BrowserStorage.prototype.removeItem = function (key) {
        this.windowStorage.removeItem(key);
    };
    BrowserStorage.prototype.getKeys = function () {
        return Object.keys(this.windowStorage);
    };
    BrowserStorage.prototype.containsKey = function (key) {
        return this.windowStorage.hasOwnProperty(key);
    };
    return BrowserStorage;
}());
export { BrowserStorage };
//# sourceMappingURL=BrowserStorage.js.map