/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __awaiter, __extends, __generator } from "tslib";
import { StringUtils, ThrottlingUtils } from "@azure/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { BrowserConstants, TemporaryCacheKeys } from "../utils/BrowserConstants";
import { BrowserUtils } from "../utils/BrowserUtils";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils";
import { InteractionHandler } from "./InteractionHandler";
var RedirectHandler = /** @class */ (function (_super) {
    __extends(RedirectHandler, _super);
    function RedirectHandler(authCodeModule, storageImpl, browserCrypto) {
        var _this = _super.call(this, authCodeModule, storageImpl) || this;
        _this.browserCrypto = browserCrypto;
        return _this;
    }
    /**
     * Redirects window to given URL.
     * @param urlNavigate
     */
    RedirectHandler.prototype.initiateAuthRequest = function (requestUrl, authCodeRequest, params) {
        // Navigate if valid URL
        if (!StringUtils.isEmpty(requestUrl)) {
            // Cache start page, returns to this page after redirectUri if navigateToLoginRequestUrl is true
            if (params.redirectStartPage) {
                this.browserStorage.setTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, params.redirectStartPage, true);
            }
            // Set interaction status in the library.
            this.browserStorage.setTemporaryCache(TemporaryCacheKeys.INTERACTION_STATUS_KEY, BrowserConstants.INTERACTION_IN_PROGRESS_VALUE, true);
            this.browserStorage.cacheCodeRequest(authCodeRequest, this.browserCrypto);
            this.authModule.logger.infoPii("Navigate to:" + requestUrl);
            // If onRedirectNavigate is implemented, invoke it and provide requestUrl
            if (typeof params.onRedirectNavigate === "function") {
                this.authModule.logger.verbose("Invoking onRedirectNavigate callback");
                var navigate = params.onRedirectNavigate(requestUrl);
                // Returning false from onRedirectNavigate will stop navigation
                if (navigate !== false) {
                    this.authModule.logger.verbose("onRedirectNavigate did not return false, navigating");
                    return BrowserUtils.navigateWindow(requestUrl, params.redirectTimeout, this.authModule.logger);
                }
                else {
                    this.authModule.logger.verbose("onRedirectNavigate returned false, stopping navigation");
                    return Promise.resolve();
                }
            }
            else {
                // Navigate window to request URL
                this.authModule.logger.verbose("Navigating window to navigate url");
                return BrowserUtils.navigateWindow(requestUrl, params.redirectTimeout, this.authModule.logger);
            }
        }
        else {
            // Throw error if request URL is empty.
            this.authModule.logger.info("Navigate url is empty");
            throw BrowserAuthError.createEmptyNavigationUriError();
        }
    };
    /**
     * Handle authorization code response in the window.
     * @param hash
     */
    RedirectHandler.prototype.handleCodeResponse = function (locationHash, authority, networkModule, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var serverParams, stateKey, requestState, authCodeResponse, nonceKey, cachedNonce, tokenResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check that location hash isn't empty.
                        if (StringUtils.isEmpty(locationHash)) {
                            throw BrowserAuthError.createEmptyHashError(locationHash);
                        }
                        // Interaction is completed - remove interaction status.
                        this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.INTERACTION_STATUS_KEY));
                        serverParams = BrowserProtocolUtils.parseServerResponseFromHash(locationHash);
                        stateKey = this.browserStorage.generateStateKey(serverParams.state);
                        requestState = this.browserStorage.getTemporaryCache(stateKey);
                        authCodeResponse = this.authModule.handleFragmentResponse(locationHash, requestState);
                        nonceKey = this.browserStorage.generateNonceKey(requestState);
                        cachedNonce = this.browserStorage.getTemporaryCache(nonceKey);
                        this.authCodeRequest = this.browserStorage.getCachedRequest(requestState, this.browserCrypto);
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
                        // Remove throttle if it exists
                        if (clientId) {
                            ThrottlingUtils.removeThrottle(this.browserStorage, clientId, this.authCodeRequest.authority, this.authCodeRequest.scopes);
                        }
                        return [4 /*yield*/, this.authModule.acquireToken(this.authCodeRequest, authCodeResponse)];
                    case 3:
                        tokenResponse = _a.sent();
                        this.browserStorage.cleanRequestByState(serverParams.state);
                        return [2 /*return*/, tokenResponse];
                }
            });
        });
    };
    return RedirectHandler;
}(InteractionHandler));
export { RedirectHandler };
//# sourceMappingURL=RedirectHandler.js.map