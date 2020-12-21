/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __awaiter, __generator } from "tslib";
import { StringUtils, AuthorityFactory } from "@azure/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils";
/**
 * Abstract class which defines operations for a browser interaction handling class.
 */
var InteractionHandler = /** @class */ (function () {
    function InteractionHandler(authCodeModule, storageImpl) {
        this.authModule = authCodeModule;
        this.browserStorage = storageImpl;
    }
    /**
     * Function to handle response parameters from hash.
     * @param locationHash
     */
    InteractionHandler.prototype.returnCode = function (locationHash, authority, networkModule) {
        return __awaiter(this, void 0, void 0, function () {
            var serverParams, stateKey, requestState, authCodeResponse, nonceKey, cachedNonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check that location hash isn't empty.
                        if (StringUtils.isEmpty(locationHash)) {
                            throw BrowserAuthError.createEmptyHashError(locationHash);
                        }
                        serverParams = BrowserProtocolUtils.parseServerResponseFromHash(locationHash);
                        stateKey = this.browserStorage.generateStateKey(serverParams.state);
                        requestState = this.browserStorage.getTemporaryCache(stateKey);
                        authCodeResponse = this.authModule.handleFragmentResponse(locationHash, requestState);
                        nonceKey = this.browserStorage.generateNonceKey(requestState);
                        cachedNonce = this.browserStorage.getTemporaryCache(nonceKey);
                        // Assign code to request
                        this.authCodeRequest.code = authCodeResponse.code;
                        if (!authCodeResponse.cloud_instance_host_name) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateTokenEndpointAuthority(authCodeResponse.cloud_instance_host_name, authority, networkModule)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        authCodeResponse.nonce = cachedNonce;
                        authCodeResponse.state = requestState;
                        // Acquire token with retrieved code.   
                        return [2 /*return*/, authCodeResponse.code];
                }
            });
        });
    };
    ;
    InteractionHandler.prototype.handleCodeResponse = function (locationHash, authority, networkModule) {
        return __awaiter(this, void 0, void 0, function () {
            var serverParams, stateKey, requestState, authCodeResponse, nonceKey, cachedNonce, tokenResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check that location hash isn't empty.
                        if (StringUtils.isEmpty(locationHash)) {
                            throw BrowserAuthError.createEmptyHashError(locationHash);
                        }
                        serverParams = BrowserProtocolUtils.parseServerResponseFromHash(locationHash);
                        stateKey = this.browserStorage.generateStateKey(serverParams.state);
                        requestState = this.browserStorage.getTemporaryCache(stateKey);
                        authCodeResponse = this.authModule.handleFragmentResponse(locationHash, requestState);
                        nonceKey = this.browserStorage.generateNonceKey(requestState);
                        cachedNonce = this.browserStorage.getTemporaryCache(nonceKey);
                        // Assign code to request
                        this.authCodeRequest.code = authCodeResponse.code;
                        if (!authCodeResponse.cloud_instance_host_name) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateTokenEndpointAuthority(authCodeResponse.cloud_instance_host_name, authority, networkModule)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        authCodeResponse.nonce = cachedNonce;
                        authCodeResponse.state = requestState;
                        return [4 /*yield*/, this.authModule.acquireToken(this.authCodeRequest, authCodeResponse)];
                    case 3:
                        tokenResponse = _a.sent();
                        this.browserStorage.cleanRequestByState(serverParams.state);
                        return [2 /*return*/, tokenResponse];
                }
            });
        });
    };
    InteractionHandler.prototype.updateTokenEndpointAuthority = function (cloudInstanceHostname, authority, networkModule) {
        return __awaiter(this, void 0, void 0, function () {
            var cloudInstanceAuthorityUri, cloudInstanceAuthority;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!authority.isAuthorityAlias(cloudInstanceHostname)) return [3 /*break*/, 2];
                        cloudInstanceAuthorityUri = "https://" + cloudInstanceHostname + "/" + authority.tenant + "/";
                        return [4 /*yield*/, AuthorityFactory.createDiscoveredInstance(cloudInstanceAuthorityUri, networkModule, authority.protocolMode)];
                    case 1:
                        cloudInstanceAuthority = _a.sent();
                        this.authModule.updateAuthority(cloudInstanceAuthority);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return InteractionHandler;
}());
export { InteractionHandler };
//# sourceMappingURL=InteractionHandler.js.map