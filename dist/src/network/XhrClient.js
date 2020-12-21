/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __awaiter, __generator } from "tslib";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { HTTP_REQUEST_TYPE } from "../utils/BrowserConstants";
/**
 * This client implements the XMLHttpRequest class to send GET and POST requests.
 */
var XhrClient = /** @class */ (function () {
    function XhrClient() {
    }
    /**
     * XhrClient for REST endpoints - Get request
     * @param url
     * @param headers
     * @param body
     */
    XhrClient.prototype.sendGetRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAsync(url, HTTP_REQUEST_TYPE.GET, options)];
            });
        });
    };
    /**
     * XhrClient for REST endpoints - Post request
     * @param url
     * @param headers
     * @param body
     */
    XhrClient.prototype.sendPostRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAsync(url, HTTP_REQUEST_TYPE.POST, options)];
            });
        });
    };
    /**
     * Helper for XhrClient requests.
     * @param url
     * @param method
     * @param options
     */
    XhrClient.prototype.sendRequestAsync = function (url, method, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, /* async: */ true);
            _this.setXhrHeaders(xhr, options);
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) {
                    reject(xhr.responseText);
                }
                try {
                    var jsonResponse = JSON.parse(xhr.responseText);
                    var networkResponse = {
                        headers: _this.getHeaderDict(xhr),
                        body: jsonResponse,
                        status: xhr.status
                    };
                    resolve(networkResponse);
                }
                catch (e) {
                    reject(xhr.responseText);
                }
            };
            xhr.onerror = function () {
                reject(xhr.status);
            };
            if (method === "POST" && options.body) {
                xhr.send(options.body);
            }
            else if (method === "GET") {
                xhr.send();
            }
            else {
                throw BrowserAuthError.createHttpMethodNotImplementedError(method);
            }
        });
    };
    /**
     * Helper to set XHR headers for request.
     * @param xhr
     * @param options
     */
    XhrClient.prototype.setXhrHeaders = function (xhr, options) {
        if (options && options.headers) {
            Object.keys(options.headers).forEach(function (key) {
                xhr.setRequestHeader(key, options.headers[key]);
            });
        }
    };
    /**
     * Gets a string map of the headers received in the response.
     *
     * Algorithm comes from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
     * @param xhr
     */
    XhrClient.prototype.getHeaderDict = function (xhr) {
        var headerString = xhr.getAllResponseHeaders();
        var headerArr = headerString.trim().split(/[\r\n]+/);
        var headerDict = {};
        headerArr.forEach(function (value) {
            var parts = value.split(": ");
            var headerName = parts.shift();
            var headerVal = parts.join(": ");
            headerDict[headerName] = headerVal;
        });
        return headerDict;
    };
    return XhrClient;
}());
export { XhrClient };
//# sourceMappingURL=XhrClient.js.map