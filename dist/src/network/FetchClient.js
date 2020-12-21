/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __awaiter, __generator } from "tslib";
import { HTTP_REQUEST_TYPE } from "../utils/BrowserConstants";
/**
 * This class implements the Fetch API for GET and POST requests. See more here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
var FetchClient = /** @class */ (function () {
    function FetchClient() {
    }
    /**
     * Fetch Client for REST endpoints - Get request
     * @param url
     * @param headers
     * @param body
     */
    FetchClient.prototype.sendGetRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch(url, {
                            method: HTTP_REQUEST_TYPE.GET,
                            headers: this.getFetchHeaders(options)
                        })];
                    case 1:
                        response = _b.sent();
                        _a = {
                            headers: this.getHeaderDict(response.headers)
                        };
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, (_a.body = (_b.sent()),
                            _a.status = response.status,
                            _a)];
                }
            });
        });
    };
    /**
     * Fetch Client for REST endpoints - Post request
     * @param url
     * @param headers
     * @param body
     */
    FetchClient.prototype.sendPostRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var reqBody, response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        reqBody = (options && options.body) || "";
                        return [4 /*yield*/, fetch(url, {
                                method: HTTP_REQUEST_TYPE.POST,
                                headers: this.getFetchHeaders(options),
                                body: reqBody
                            })];
                    case 1:
                        response = _b.sent();
                        _a = {
                            headers: this.getHeaderDict(response.headers)
                        };
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, (_a.body = (_b.sent()),
                            _a.status = response.status,
                            _a)];
                }
            });
        });
    };
    /**
     * Get Fetch API Headers object from string map
     * @param inputHeaders
     */
    FetchClient.prototype.getFetchHeaders = function (options) {
        var headers = new Headers();
        if (!(options && options.headers)) {
            return headers;
        }
        Object.keys(options.headers).forEach(function (key) {
            headers.append(key, options.headers[key]);
        });
        return headers;
    };
    FetchClient.prototype.getHeaderDict = function (headers) {
        var headerDict = {};
        headers.forEach(function (value, key) {
            headerDict[key] = value;
        });
        return headerDict;
    };
    return FetchClient;
}());
export { FetchClient };
//# sourceMappingURL=FetchClient.js.map