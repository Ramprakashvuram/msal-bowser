/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __assign, __awaiter, __generator, __read, __spread } from "tslib";
import { CryptoOps } from "../crypto/CryptoOps";
import { TrustedAuthority, StringUtils, UrlString, AuthorizationCodeClient, PromptValue, ServerError, InteractionRequiredAuthError, AuthorityFactory, ServerTelemetryManager, SilentFlowClient, PersistentCacheKeys, IdToken, ProtocolUtils, ResponseMode, Logger, ThrottlingUtils, RefreshTokenClient, AuthenticationScheme } from "@azure/msal-common";
import { BrowserCacheManager } from "../cache/BrowserCacheManager";
import { buildConfiguration } from "../config/Configuration";
import { TemporaryCacheKeys, InteractionType, ApiId, BrowserConstants, BrowserCacheLocation } from "../utils/BrowserConstants";
import { BrowserUtils } from "../utils/BrowserUtils";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils";
import { RedirectHandler } from "../interaction_handler/RedirectHandler";
import { PopupHandler } from "../interaction_handler/PopupHandler";
import { SilentHandler } from "../interaction_handler/SilentHandler";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { version, name } from "../../package.json";
import { EventType } from "../event/EventType";
import { BrowserConfigurationAuthError } from "../error/BrowserConfigurationAuthError";
var ClientApplication = /** @class */ (function () {
    /**
     * @constructor
     * Constructor for the PublicClientApplication used to instantiate the PublicClientApplication object
     *
     * Important attributes in the Configuration object for auth are:
     * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
     * - authority: the authority URL for your application.
     * - redirect_uri: the uri of your application registered in the portal.
     *
     * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
     * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
     * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
     * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
     * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
     * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
     *
     * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
     * Full B2C functionality will be available in this library in future versions.
     *
     * @param {@link (Configuration:type)} configuration object for the MSAL PublicClientApplication instance
     */
    function ClientApplication(configuration) {
        /*
         * If loaded in an environment where window is not available,
         * set internal flag to false so that further requests fail.
         * This is to support server-side rendering environments.
         */
        this.isBrowserEnvironment = typeof window !== "undefined";
        if (!this.isBrowserEnvironment) {
            return;
        }
        // Set the configuration.
        this.config = buildConfiguration(configuration);
        // Initialize the crypto class.
        this.browserCrypto = new CryptoOps();
        // Initialize the network module class.
        this.networkClient = this.config.system.networkClient;
        // Initialize logger
        this.logger = new Logger(this.config.system.loggerOptions, name, version);
        // Initialize the browser storage class.
        this.browserStorage = new BrowserCacheManager(this.config.auth.clientId, this.config.cache, this.browserCrypto, this.logger);
        // Array of events
        this.eventCallbacks = new Map();
        // Initialize default authority instance
        TrustedAuthority.setTrustedAuthoritiesFromConfig(this.config.auth.knownAuthorities, this.config.auth.cloudDiscoveryMetadata);
        this.defaultAuthority = null;
    }
    // #region Redirect Flow
    /**
     * Event handler function which allows users to fire events after the PublicClientApplication object
     * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
     * auth flows.
     * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
     * @returns {Promise.<AuthenticationResult | null>} token response or null. If the return value is null, then no auth redirect was detected.
     */
    ClientApplication.prototype.handleRedirectPromise = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var loggedInAccounts;
            var _this = this;
            return __generator(this, function (_a) {
                this.emitEvent(EventType.HANDLE_REDIRECT_START, InteractionType.Redirect);
                loggedInAccounts = this.getAllAccounts();
                if (this.isBrowserEnvironment) {
                    return [2 /*return*/, this.handleRedirectResponse(hash)
                            .then(function (result) {
                            if (result) {
                                // Emit login event if number of accounts change
                                var isLoggingIn = loggedInAccounts.length < _this.getAllAccounts().length;
                                if (isLoggingIn) {
                                    _this.emitEvent(EventType.LOGIN_SUCCESS, InteractionType.Redirect, result);
                                }
                                else {
                                    _this.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Redirect, result);
                                }
                            }
                            _this.emitEvent(EventType.HANDLE_REDIRECT_END, InteractionType.Redirect);
                            return result;
                        })
                            .catch(function (e) {
                            // Emit login event if there is an account
                            if (loggedInAccounts.length > 0) {
                                _this.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Redirect, null, e);
                            }
                            else {
                                _this.emitEvent(EventType.LOGIN_FAILURE, InteractionType.Redirect, null, e);
                            }
                            _this.emitEvent(EventType.HANDLE_REDIRECT_END, InteractionType.Redirect);
                            throw e;
                        })];
                }
                return [2 /*return*/, null];
            });
        });
    };
    /**
     * Checks if navigateToLoginRequestUrl is set, and:
     * - if true, performs logic to cache and navigate
     * - if false, handles hash string and parses response
     */
    ClientApplication.prototype.handleRedirectResponse = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var responseHash, loginRequestUrl, loginRequestUrlNormalized, currentUrlNormalized, handleHashResult, homepage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.interactionInProgress()) {
                            this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null.");
                            return [2 /*return*/, null];
                        }
                        responseHash = this.getRedirectResponseHash(hash || window.location.hash);
                        if (StringUtils.isEmpty(responseHash)) {
                            // Not a recognized server response hash or hash not associated with a redirect request
                            return [2 /*return*/, null];
                        }
                        loginRequestUrl = this.browserStorage.getTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, true);
                        loginRequestUrlNormalized = UrlString.removeHashFromUrl(loginRequestUrl || "");
                        currentUrlNormalized = UrlString.removeHashFromUrl(window.location.href);
                        if (!(loginRequestUrlNormalized === currentUrlNormalized && this.config.auth.navigateToLoginRequestUrl)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleHash(responseHash)];
                    case 1:
                        handleHashResult = _a.sent();
                        if (loginRequestUrl.indexOf("#") > -1) {
                            // Replace current hash with non-msal hash, if present
                            BrowserUtils.replaceHash(loginRequestUrl);
                        }
                        return [2 /*return*/, handleHashResult];
                    case 2:
                        if (!!this.config.auth.navigateToLoginRequestUrl) return [3 /*break*/, 3];
                        return [2 /*return*/, this.handleHash(responseHash)];
                    case 3:
                        if (!!BrowserUtils.isInIframe()) return [3 /*break*/, 7];
                        /*
                         * Returned from authority using redirect - need to perform navigation before processing response
                         * Cache the hash to be retrieved after the next redirect
                         */
                        this.browserStorage.setTemporaryCache(TemporaryCacheKeys.URL_HASH, responseHash, true);
                        if (!(!loginRequestUrl || loginRequestUrl === "null")) return [3 /*break*/, 5];
                        homepage = BrowserUtils.getHomepage();
                        // Cache the homepage under ORIGIN_URI to ensure cached hash is processed on homepage
                        this.browserStorage.setTemporaryCache(TemporaryCacheKeys.ORIGIN_URI, homepage, true);
                        this.logger.warning("Unable to get valid login request url from cache, redirecting to home page");
                        return [4 /*yield*/, BrowserUtils.navigateWindow(homepage, this.config.system.redirectNavigationTimeout, this.logger, true)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: 
                    // Navigate to page that initiated the redirect request
                    return [4 /*yield*/, BrowserUtils.navigateWindow(loginRequestUrl, this.config.system.redirectNavigationTimeout, this.logger, true)];
                    case 6:
                        // Navigate to page that initiated the redirect request
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Gets the response hash for a redirect request
     * Returns null if interactionType in the state value is not "redirect" or the hash does not contain known properties
     * @returns {string}
     */
    ClientApplication.prototype.getRedirectResponseHash = function (hash) {
        // Get current location hash from window or cache.
        var isResponseHash = UrlString.hashContainsKnownProperties(hash);
        var cachedHash = this.browserStorage.getTemporaryCache(TemporaryCacheKeys.URL_HASH, true);
        this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.URL_HASH));
        var responseHash = isResponseHash ? hash : cachedHash;
        if (responseHash) {
            // Deserialize hash fragment response parameters.
            var serverParams = UrlString.getDeserializedHash(responseHash);
            var platformStateObj = BrowserProtocolUtils.extractBrowserRequestState(this.browserCrypto, serverParams.state);
            if (platformStateObj.interactionType !== InteractionType.Redirect) {
                return null;
            }
            else {
                BrowserUtils.clearHash();
                return responseHash;
            }
        }
        this.browserStorage.cleanRequestByInteractionType(InteractionType.Redirect);
        return null;
    };
    /**
     * Checks if hash exists and handles in window.
     * @param responseHash
     * @param interactionHandler
     */
    ClientApplication.prototype.handleHash = function (responseHash) {
        return __awaiter(this, void 0, void 0, function () {
            var encodedTokenRequest, cachedRequest, serverTelemetryManager, serverParams, currentAuthority, authClient, interactionHandler, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encodedTokenRequest = this.browserStorage.getTemporaryCache(TemporaryCacheKeys.REQUEST_PARAMS, true);
                        cachedRequest = JSON.parse(this.browserCrypto.base64Decode(encodedTokenRequest));
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.handleRedirectPromise, cachedRequest.correlationId);
                        serverParams = BrowserProtocolUtils.parseServerResponseFromHash(responseHash);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        currentAuthority = this.browserStorage.getCachedAuthority(serverParams.state);
                        return [4 /*yield*/, this.createAuthCodeClient(serverTelemetryManager, currentAuthority)];
                    case 2:
                        authClient = _a.sent();
                        interactionHandler = new RedirectHandler(authClient, this.browserStorage, this.browserCrypto);
                        return [4 /*yield*/, interactionHandler.handleCodeResponse(responseHash, authClient.authority, this.networkClient, this.config.auth.clientId)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        e_1 = _a.sent();
                        serverTelemetryManager.cacheFailedRequest(e_1);
                        this.browserStorage.cleanRequestByInteractionType(InteractionType.Redirect);
                        throw e_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
     * the page, so any code that follows this function will not execute.
     *
     * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
     * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
     *
     * @param {@link (RedirectRequest:type)}
     */
    ClientApplication.prototype.acquireTokenRedirect = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var isLoggedIn, validRequest, serverTelemetryManager, authCodeRequest, authClient, interactionHandler, navigateUrl, redirectStartPage, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Preflight request
                        this.preflightBrowserEnvironmentCheck(InteractionType.Redirect);
                        isLoggedIn = this.getAllAccounts().length > 0;
                        if (isLoggedIn) {
                            this.emitEvent(EventType.ACQUIRE_TOKEN_START, InteractionType.Redirect, request);
                        }
                        else {
                            this.emitEvent(EventType.LOGIN_START, InteractionType.Redirect, request);
                        }
                        validRequest = this.preflightInteractiveRequest(request, InteractionType.Redirect);
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenRedirect, validRequest.correlationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.initializeAuthorizationCodeRequest(validRequest)];
                    case 2:
                        authCodeRequest = _a.sent();
                        return [4 /*yield*/, this.createAuthCodeClient(serverTelemetryManager, validRequest.authority)];
                    case 3:
                        authClient = _a.sent();
                        interactionHandler = new RedirectHandler(authClient, this.browserStorage, this.browserCrypto);
                        return [4 /*yield*/, authClient.getAuthCodeUrl(validRequest)];
                    case 4:
                        navigateUrl = _a.sent();
                        redirectStartPage = (request && request.redirectStartPage) || window.location.href;
                        // Show the UI once the url has been created. Response will come back in the hash, which will be handled in the handleRedirectCallback function.
                        return [2 /*return*/, interactionHandler.initiateAuthRequest(navigateUrl, authCodeRequest, {
                                redirectTimeout: this.config.system.redirectNavigationTimeout,
                                redirectStartPage: redirectStartPage,
                                onRedirectNavigate: request.onRedirectNavigate
                            })];
                    case 5:
                        e_2 = _a.sent();
                        // If logged in, emit acquire token events
                        if (isLoggedIn) {
                            this.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Redirect, null, e_2);
                        }
                        else {
                            this.emitEvent(EventType.LOGIN_FAILURE, InteractionType.Redirect, null, e_2);
                        }
                        serverTelemetryManager.cacheFailedRequest(e_2);
                        this.browserStorage.cleanRequestByState(validRequest.state);
                        throw e_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // #endregion
    // #region Popup Flow
    /**
     * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
     * @param {@link (PopupRequest:type)}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    ClientApplication.prototype.acquireTokenPopup = function (request) {
        try {
            this.preflightBrowserEnvironmentCheck(InteractionType.Popup);
        }
        catch (e) {
            // Since this function is syncronous we need to reject
            return Promise.reject(e);
        }
        if (this.config.auth.responseType === 'code') {
            if (this.config.system.asyncPopups)
                return this.acquireCodePopupAsync(request);
            var popup = PopupHandler.openSizedPopup();
            return this.acquireCodePopupAsync(request, popup);
        }
        // asyncPopups flag is true. Acquires token without first opening popup. Popup will be opened later asynchronously.
        if (this.config.system.asyncPopups) {
            return this.acquireTokenPopupAsync(request);
        }
        else {
            // asyncPopups flag is set to false. Opens popup before acquiring token.
            var popup = PopupHandler.openSizedPopup();
            return this.acquireTokenPopupAsync(request, popup);
        }
    };
    /**
     * Helper which obtains an access_token for your API via opening a popup window in the user's browser
     * @param {@link (PopupRequest:type)}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    ClientApplication.prototype.acquireCodePopupAsync = function (request, popup) {
        return __awaiter(this, void 0, void 0, function () {
            var validRequest, serverTelemetryManager, authCodeRequest, authClient, navigateUrl, interactionHandler, popupParameters, popupWindow, hash, result, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validRequest = this.preflightInteractiveRequest(request, InteractionType.Popup);
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenPopup, validRequest.correlationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.initializeAuthorizationCodeRequest(validRequest)];
                    case 2:
                        authCodeRequest = _a.sent();
                        return [4 /*yield*/, this.createAuthCodeClient(serverTelemetryManager, validRequest.authority)];
                    case 3:
                        authClient = _a.sent();
                        return [4 /*yield*/, authClient.getAuthCodeUrl(validRequest)];
                    case 4:
                        navigateUrl = _a.sent();
                        interactionHandler = new PopupHandler(authClient, this.browserStorage);
                        popupParameters = {
                            popup: popup
                        };
                        popupWindow = interactionHandler.initiateAuthRequest(navigateUrl, authCodeRequest, popupParameters);
                        return [4 /*yield*/, interactionHandler.monitorPopupForHash(popupWindow, this.config.system.windowHashTimeout)];
                    case 5:
                        hash = _a.sent();
                        // Remove throttle if it exists
                        ThrottlingUtils.removeThrottle(this.browserStorage, this.config.auth.clientId, authCodeRequest.authority, authCodeRequest.scopes);
                        return [4 /*yield*/, interactionHandler.returnCode(hash, authClient.authority, this.networkClient)];
                    case 6:
                        result = _a.sent();
                        // If logged in, emit acquire token events
                        return [2 /*return*/, result];
                    case 7:
                        e_3 = _a.sent();
                        this.emitEvent(EventType.LOGIN_FAILURE, InteractionType.Popup, null, e_3);
                        serverTelemetryManager.cacheFailedRequest(e_3);
                        this.browserStorage.cleanRequestByState(validRequest.state);
                        throw e_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ClientApplication.prototype.acquireTokenPopupAsync = function (request, popup) {
        return __awaiter(this, void 0, void 0, function () {
            var loggedInAccounts, validRequest, serverTelemetryManager, authCodeRequest, authClient, navigateUrl, interactionHandler, popupParameters, popupWindow, hash, result, isLoggingIn, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loggedInAccounts = this.getAllAccounts();
                        if (loggedInAccounts.length > 0) {
                            this.emitEvent(EventType.ACQUIRE_TOKEN_START, InteractionType.Popup, request);
                        }
                        else {
                            this.emitEvent(EventType.LOGIN_START, InteractionType.Popup, request);
                        }
                        validRequest = this.preflightInteractiveRequest(request, InteractionType.Popup);
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenPopup, validRequest.correlationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.initializeAuthorizationCodeRequest(validRequest)];
                    case 2:
                        authCodeRequest = _a.sent();
                        return [4 /*yield*/, this.createAuthCodeClient(serverTelemetryManager, validRequest.authority)];
                    case 3:
                        authClient = _a.sent();
                        return [4 /*yield*/, authClient.getAuthCodeUrl(validRequest)];
                    case 4:
                        navigateUrl = _a.sent();
                        interactionHandler = new PopupHandler(authClient, this.browserStorage);
                        popupParameters = {
                            popup: popup
                        };
                        popupWindow = interactionHandler.initiateAuthRequest(navigateUrl, authCodeRequest, popupParameters);
                        return [4 /*yield*/, interactionHandler.monitorPopupForHash(popupWindow, this.config.system.windowHashTimeout)];
                    case 5:
                        hash = _a.sent();
                        // Remove throttle if it exists
                        ThrottlingUtils.removeThrottle(this.browserStorage, this.config.auth.clientId, authCodeRequest.authority, authCodeRequest.scopes);
                        return [4 /*yield*/, interactionHandler.handleCodeResponse(hash, authClient.authority, this.networkClient)];
                    case 6:
                        result = _a.sent();
                        isLoggingIn = loggedInAccounts.length < this.getAllAccounts().length;
                        if (isLoggingIn) {
                            this.emitEvent(EventType.LOGIN_SUCCESS, InteractionType.Popup, result);
                        }
                        else {
                            this.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Popup, result);
                        }
                        return [2 /*return*/, result];
                    case 7:
                        e_4 = _a.sent();
                        if (loggedInAccounts.length > 0) {
                            this.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Popup, null, e_4);
                        }
                        else {
                            this.emitEvent(EventType.LOGIN_FAILURE, InteractionType.Popup, null, e_4);
                        }
                        serverTelemetryManager.cacheFailedRequest(e_4);
                        this.browserStorage.cleanRequestByState(validRequest.state);
                        throw e_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // #endregion
    // #region Silent Flow
    /**
     * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
     * - Any browser using a form of Intelligent Tracking Prevention
     * - If there is not an established session with the service
     *
     * In these cases, the request must be done inside a popup or full frame redirect.
     *
     * For the cases where interaction is required, you cannot send a request with prompt=none.
     *
     * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
     * you session on the server still exists.
     * @param {@link AuthorizationUrlRequest}
     *
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     */
    ClientApplication.prototype.ssoSilent = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var silentTokenResult, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.preflightBrowserEnvironmentCheck(InteractionType.Silent);
                        this.emitEvent(EventType.SSO_SILENT_START, InteractionType.Silent, request);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.acquireTokenByIframe(request)];
                    case 2:
                        silentTokenResult = _a.sent();
                        this.emitEvent(EventType.SSO_SILENT_SUCCESS, InteractionType.Silent, silentTokenResult);
                        return [2 /*return*/, silentTokenResult];
                    case 3:
                        e_5 = _a.sent();
                        this.emitEvent(EventType.SSO_SILENT_FAILURE, InteractionType.Silent, null, e_5);
                        throw e_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function uses a hidden iframe to fetch an authorization code from the eSTS. To be used for silent refresh token acquisition and renewal.
     * @param {@link AuthorizationUrlRequest}
     * @param request
     */
    ClientApplication.prototype.acquireTokenByIframe = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var silentRequest, serverTelemetryManager, authCodeRequest, authClient, navigateUrl, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check that we have some SSO data
                        if (StringUtils.isEmpty(request.loginHint) && StringUtils.isEmpty(request.sid) && (!request.account || StringUtils.isEmpty(request.account.username))) {
                            throw BrowserAuthError.createSilentSSOInsufficientInfoError();
                        }
                        // Check that prompt is set to none, throw error if it is set to anything else.
                        if (request.prompt && request.prompt !== PromptValue.NONE) {
                            throw BrowserAuthError.createSilentPromptValueError(request.prompt);
                        }
                        silentRequest = this.initializeAuthorizationRequest(__assign(__assign({}, request), { prompt: PromptValue.NONE }), InteractionType.Silent);
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.ssoSilent, silentRequest.correlationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.initializeAuthorizationCodeRequest(silentRequest)];
                    case 2:
                        authCodeRequest = _a.sent();
                        return [4 /*yield*/, this.createAuthCodeClient(serverTelemetryManager, silentRequest.authority)];
                    case 3:
                        authClient = _a.sent();
                        return [4 /*yield*/, authClient.getAuthCodeUrl(silentRequest)];
                    case 4:
                        navigateUrl = _a.sent();
                        return [4 /*yield*/, this.silentTokenHelper(navigateUrl, authCodeRequest, authClient)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6:
                        e_6 = _a.sent();
                        serverTelemetryManager.cacheFailedRequest(e_6);
                        this.browserStorage.cleanRequestByState(silentRequest.state);
                        throw e_6;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Use this function to obtain a token before every call to the API / resource provider
     *
     * MSAL return's a cached token when available
     * Or it send's a request to the STS to obtain a new token using a refresh token.
     *
     * @param {@link (SilentRequest:type)}
     *
     * To renew idToken, please pass clientId as the only scope in the Authentication Parameters
     * @returns {Promise.<AuthenticationResult>} - a promise that is fulfilled when this function has completed, or rejected if an error was raised. Returns the {@link AuthResponse} object
     *
     */
    ClientApplication.prototype.acquireTokenByRefreshToken = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var silentRequest, serverTelemetryManager, refreshTokenClient, e_7, isServerError, isInteractionRequiredError, isInvalidGrantError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.emitEvent(EventType.ACQUIRE_TOKEN_NETWORK_START, InteractionType.Silent, request);
                        // block the reload if it occurred inside a hidden iframe
                        BrowserUtils.blockReloadInHiddenIframes();
                        silentRequest = __assign(__assign({}, request), this.initializeBaseRequest(request));
                        serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent_silentFlow, silentRequest.correlationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 7]);
                        return [4 /*yield*/, this.createRefreshTokenClient(serverTelemetryManager, silentRequest.authority)];
                    case 2:
                        refreshTokenClient = _a.sent();
                        return [4 /*yield*/, refreshTokenClient.acquireTokenByRefreshToken(silentRequest)];
                    case 3: 
                    // Send request to renew token. Auth module will throw errors if token cannot be renewed.
                    return [2 /*return*/, _a.sent()];
                    case 4:
                        e_7 = _a.sent();
                        serverTelemetryManager.cacheFailedRequest(e_7);
                        isServerError = e_7 instanceof ServerError;
                        isInteractionRequiredError = e_7 instanceof InteractionRequiredAuthError;
                        isInvalidGrantError = (e_7.errorCode === BrowserConstants.INVALID_GRANT_ERROR);
                        if (!(isServerError && isInvalidGrantError && !isInteractionRequiredError)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.acquireTokenByIframe(request)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: throw e_7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper which acquires an authorization code silently using a hidden iframe from given url
     * using the scopes requested as part of the id, and exchanges the code for a set of OAuth tokens.
     * @param navigateUrl
     * @param userRequestScopes
     */
    ClientApplication.prototype.silentTokenHelper = function (navigateUrl, authCodeRequest, authClient) {
        return __awaiter(this, void 0, void 0, function () {
            var silentHandler, msalFrame, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        silentHandler = new SilentHandler(authClient, this.browserStorage, this.config.system.navigateFrameWait);
                        return [4 /*yield*/, silentHandler.initiateAuthRequest(navigateUrl, authCodeRequest)];
                    case 1:
                        msalFrame = _a.sent();
                        return [4 /*yield*/, silentHandler.monitorIframeForHash(msalFrame, this.config.system.iframeHashTimeout)];
                    case 2:
                        hash = _a.sent();
                        // Handle response from hash string
                        return [2 /*return*/, silentHandler.handleCodeResponse(hash, authClient.authority, this.networkClient)];
                }
            });
        });
    };
    // #endregion
    // #region Logout
    /**
     * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
     * Default behaviour is to redirect the user to `window.location.href`.
     * @param {@link (EndSessionRequest:type)}
     */
    ClientApplication.prototype.logout = function (logoutRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var validLogoutRequest, authClient, logoutUri, navigate, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.preflightBrowserEnvironmentCheck(InteractionType.Redirect);
                        this.emitEvent(EventType.LOGOUT_START, InteractionType.Redirect, logoutRequest);
                        validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
                        return [4 /*yield*/, this.createAuthCodeClient(null, logoutRequest && logoutRequest.authority)];
                    case 1:
                        authClient = _a.sent();
                        logoutUri = authClient.getLogoutUri(validLogoutRequest);
                        this.emitEvent(EventType.LOGOUT_SUCCESS, InteractionType.Redirect, validLogoutRequest);
                        // Check if onRedirectNavigate is implemented, and invoke it if so
                        if (logoutRequest && typeof logoutRequest.onRedirectNavigate === "function") {
                            navigate = logoutRequest.onRedirectNavigate(logoutUri);
                            if (navigate !== false) {
                                this.logger.verbose("Logout onRedirectNavigate did not return false, navigating");
                                return [2 /*return*/, BrowserUtils.navigateWindow(logoutUri, this.config.system.redirectNavigationTimeout, this.logger)];
                            }
                            else {
                                this.logger.verbose("Logout onRedirectNavigate returned false, stopping navigation");
                            }
                        }
                        else {
                            return [2 /*return*/, BrowserUtils.navigateWindow(logoutUri, this.config.system.redirectNavigationTimeout, this.logger)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        this.emitEvent(EventType.LOGOUT_FAILURE, InteractionType.Redirect, null, e_8);
                        throw e_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // #endregion
    // #region Account APIs
    /**
     * Returns all accounts that MSAL currently has data for.
     * (the account object is created at the time of successful login)
     * or empty array when no accounts are found
     * @returns {@link AccountInfo[]} - Array of account objects in cache
     */
    ClientApplication.prototype.getAllAccounts = function () {
        return this.isBrowserEnvironment ? this.browserStorage.getAllAccounts() : [];
    };
    /**
     * Returns the signed in account matching username.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found.
     * This API is provided for convenience but getAccountById should be used for best reliability
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    ClientApplication.prototype.getAccountByUsername = function (userName) {
        var allAccounts = this.getAllAccounts();
        if (!StringUtils.isEmpty(userName) && allAccounts && allAccounts.length) {
            return allAccounts.filter(function (accountObj) { return accountObj.username.toLowerCase() === userName.toLowerCase(); })[0] || null;
        }
        else {
            return null;
        }
    };
    /**
     * Returns the signed in account matching homeAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    ClientApplication.prototype.getAccountByHomeId = function (homeAccountId) {
        var allAccounts = this.getAllAccounts();
        if (!StringUtils.isEmpty(homeAccountId) && allAccounts && allAccounts.length) {
            return allAccounts.filter(function (accountObj) { return accountObj.homeAccountId === homeAccountId; })[0] || null;
        }
        else {
            return null;
        }
    };
    /**
     * Returns the signed in account matching localAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @returns {@link AccountInfo} - the account object stored in MSAL
     */
    ClientApplication.prototype.getAccountByLocalId = function (localAccountId) {
        var allAccounts = this.getAllAccounts();
        if (!StringUtils.isEmpty(localAccountId) && allAccounts && allAccounts.length) {
            return allAccounts.filter(function (accountObj) { return accountObj.localAccountId === localAccountId; })[0] || null;
        }
        else {
            return null;
        }
    };
    // #endregion
    // #region Helpers
    /**
     *
     * Use to get the redirect uri configured in MSAL or null.
     * @returns {string} redirect URL
     *
     */
    ClientApplication.prototype.getRedirectUri = function (requestRedirectUri) {
        var redirectUri = requestRedirectUri || this.config.auth.redirectUri || BrowserUtils.getCurrentUri();
        return UrlString.getAbsoluteUrl(redirectUri, BrowserUtils.getCurrentUri());
    };
    /**
     * Use to get the post logout redirect uri configured in MSAL or null.
     *
     * @returns {string} post logout redirect URL
     */
    ClientApplication.prototype.getPostLogoutRedirectUri = function (requestPostLogoutRedirectUri) {
        var postLogoutRedirectUri = requestPostLogoutRedirectUri || this.config.auth.postLogoutRedirectUri || BrowserUtils.getCurrentUri();
        return UrlString.getAbsoluteUrl(postLogoutRedirectUri, BrowserUtils.getCurrentUri());
    };
    /**
     * Used to get a discovered version of the default authority.
     */
    ClientApplication.prototype.getDiscoveredDefaultAuthority = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.defaultAuthority) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, AuthorityFactory.createDiscoveredInstance(this.config.auth.authority, this.config.system.networkClient, this.config.auth.protocolMode)];
                    case 1:
                        _a.defaultAuthority = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.defaultAuthority];
                }
            });
        });
    };
    /**
     * Helper to check whether interaction is in progress.
     */
    ClientApplication.prototype.interactionInProgress = function () {
        // Check whether value in cache is present and equal to expected value
        return (this.browserStorage.getTemporaryCache(TemporaryCacheKeys.INTERACTION_STATUS_KEY, true)) === BrowserConstants.INTERACTION_IN_PROGRESS_VALUE;
    };
    /**
     * Creates an Authorization Code Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    ClientApplication.prototype.createAuthCodeClient = function (serverTelemetryManager, authorityUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var clientConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClientConfiguration(serverTelemetryManager, authorityUrl)];
                    case 1:
                        clientConfig = _a.sent();
                        return [2 /*return*/, new AuthorizationCodeClient(clientConfig)];
                }
            });
        });
    };
    /**
     * Creates an Silent Flow Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    ClientApplication.prototype.createSilentFlowClient = function (serverTelemetryManager, authorityUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var clientConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClientConfiguration(serverTelemetryManager, authorityUrl)];
                    case 1:
                        clientConfig = _a.sent();
                        return [2 /*return*/, new SilentFlowClient(clientConfig)];
                }
            });
        });
    };
    /**
     * Creates a Refresh Client with the given authority, or the default authority.
     * @param authorityUrl
     */
    ClientApplication.prototype.createRefreshTokenClient = function (serverTelemetryManager, authorityUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var clientConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClientConfiguration(serverTelemetryManager, authorityUrl)];
                    case 1:
                        clientConfig = _a.sent();
                        return [2 /*return*/, new RefreshTokenClient(clientConfig)];
                }
            });
        });
    };
    /**
     * Creates a Client Configuration object with the given request authority, or the default authority.
     * @param requestAuthority
     */
    ClientApplication.prototype.getClientConfiguration = function (serverTelemetryManager, requestAuthority) {
        return __awaiter(this, void 0, void 0, function () {
            var discoveredAuthority, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!StringUtils.isEmpty(requestAuthority) && requestAuthority !== this.config.auth.authority)) return [3 /*break*/, 2];
                        return [4 /*yield*/, AuthorityFactory.createDiscoveredInstance(requestAuthority, this.config.system.networkClient, this.config.auth.protocolMode)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getDiscoveredDefaultAuthority()];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        discoveredAuthority = _a;
                        return [2 /*return*/, {
                                authOptions: {
                                    clientId: this.config.auth.clientId,
                                    authority: discoveredAuthority,
                                    knownAuthorities: this.config.auth.knownAuthorities,
                                    cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
                                    clientCapabilities: this.config.auth.clientCapabilities,
                                    protocolMode: this.config.auth.protocolMode
                                },
                                systemOptions: {
                                    tokenRenewalOffsetSeconds: this.config.system.tokenRenewalOffsetSeconds
                                },
                                loggerOptions: {
                                    loggerCallback: this.config.system.loggerOptions.loggerCallback,
                                    piiLoggingEnabled: this.config.system.loggerOptions.piiLoggingEnabled
                                },
                                cryptoInterface: this.browserCrypto,
                                networkInterface: this.networkClient,
                                storageInterface: this.browserStorage,
                                serverTelemetryManager: serverTelemetryManager,
                                libraryInfo: {
                                    sku: BrowserConstants.MSAL_SKU,
                                    version: version,
                                    cpu: "",
                                    os: ""
                                }
                            }];
                }
            });
        });
    };
    /**
     * Helper to validate app environment before making a request.
     */
    ClientApplication.prototype.preflightInteractiveRequest = function (request, interactionType) {
        // block the reload if it occurred inside a hidden iframe
        BrowserUtils.blockReloadInHiddenIframes();
        // Check if interaction is in progress. Throw error if true.
        if (this.interactionInProgress()) {
            throw BrowserAuthError.createInteractionInProgressError();
        }
        return this.initializeAuthorizationRequest(request, interactionType);
    };
    /**
     * Helper to validate app environment before making an auth request
     * * @param request
     */
    ClientApplication.prototype.preflightBrowserEnvironmentCheck = function (interactionType) {
        // Block request if not in browser environment
        BrowserUtils.blockNonBrowserEnvironment(this.isBrowserEnvironment);
        // Block redirects if in an iframe
        BrowserUtils.blockRedirectInIframe(interactionType, this.config.system.allowRedirectInIframe);
        // Block auth requests inside a hidden iframe
        BrowserUtils.blockReloadInHiddenIframes();
        // Block redirects if memory storage is enabled but storeAuthStateInCookie is not
        if (interactionType === InteractionType.Redirect &&
            this.config.cache.cacheLocation === BrowserCacheLocation.MemoryStorage &&
            !this.config.cache.storeAuthStateInCookie) {
            throw BrowserConfigurationAuthError.createInMemoryRedirectUnavailableError();
        }
    };
    /**
     * Initializer function for all request APIs
     * @param request
     */
    ClientApplication.prototype.initializeBaseRequest = function (request) {
        var authority = request.authority;
        if (StringUtils.isEmpty(authority)) {
            authority = this.config.auth.authority;
        }
        var scopes = __spread(((request && request.scopes) || []));
        var correlationId = (request && request.correlationId) || this.browserCrypto.createNewGuid();
        var validatedRequest = __assign(__assign({}, request), { correlationId: correlationId,
            authority: authority,
            scopes: scopes });
        return validatedRequest;
    };
    ClientApplication.prototype.initializeServerTelemetryManager = function (apiId, correlationId, forceRefresh) {
        var telemetryPayload = {
            clientId: this.config.auth.clientId,
            correlationId: correlationId,
            apiId: apiId,
            forceRefresh: forceRefresh || false
        };
        return new ServerTelemetryManager(telemetryPayload, this.browserStorage);
    };
    /**
     * Helper to initialize required request parameters for interactive APIs and ssoSilent()
     * @param request
     */
    ClientApplication.prototype.initializeAuthorizationRequest = function (request, interactionType) {
        var redirectUri = this.getRedirectUri(request.redirectUri);
        var browserState = {
            interactionType: interactionType
        };
        var state = ProtocolUtils.setRequestState(this.browserCrypto, (request && request.state) || "", browserState);
        var nonce = request.nonce;
        if (StringUtils.isEmpty(nonce)) {
            nonce = this.browserCrypto.createNewGuid();
        }
        var authenticationScheme = request.authenticationScheme || AuthenticationScheme.BEARER;
        var validatedRequest = __assign(__assign({}, this.initializeBaseRequest(request)), { redirectUri: redirectUri, state: state, nonce: nonce, responseMode: ResponseMode.FRAGMENT, authenticationScheme: authenticationScheme });
        // Check for ADAL SSO
        if (StringUtils.isEmpty(validatedRequest.loginHint)) {
            // Only check for adal token if no SSO params are being used
            var adalIdTokenString = this.browserStorage.getTemporaryCache(PersistentCacheKeys.ADAL_ID_TOKEN);
            if (!StringUtils.isEmpty(adalIdTokenString)) {
                var adalIdToken = new IdToken(adalIdTokenString, this.browserCrypto);
                this.browserStorage.removeItem(PersistentCacheKeys.ADAL_ID_TOKEN);
                if (adalIdToken.claims && adalIdToken.claims.upn) {
                    validatedRequest.loginHint = adalIdToken.claims.upn;
                }
            }
        }
        this.browserStorage.updateCacheEntries(validatedRequest.state, validatedRequest.nonce, validatedRequest.authority);
        return validatedRequest;
    };
    /**
     * Generates an auth code request tied to the url request.
     * @param request
     */
    ClientApplication.prototype.initializeAuthorizationCodeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var authCodeRequest;
            return __generator(this, function (_a) {
                authCodeRequest = __assign(__assign({}, request), { redirectUri: request.redirectUri, code: "" });
                return [2 /*return*/, authCodeRequest];
            });
        });
    };
    /**
     * Initializer for the logout request.
     * @param logoutRequest
     */
    ClientApplication.prototype.initializeLogoutRequest = function (logoutRequest) {
        var validLogoutRequest = __assign({ correlationId: this.browserCrypto.createNewGuid() }, logoutRequest);
        validLogoutRequest.postLogoutRedirectUri = this.getPostLogoutRedirectUri(logoutRequest ? logoutRequest.postLogoutRedirectUri : "");
        return validLogoutRequest;
    };
    /**
     * Emits events by calling callback with event message
     * @param eventType
     * @param interactionType
     * @param payload
     * @param error
     */
    ClientApplication.prototype.emitEvent = function (eventType, interactionType, payload, error) {
        var _this = this;
        if (this.isBrowserEnvironment) {
            var message_1 = {
                eventType: eventType,
                interactionType: interactionType || null,
                payload: payload || null,
                error: error || null,
                timestamp: Date.now()
            };
            this.logger.info("Emitting event: " + eventType);
            this.eventCallbacks.forEach(function (callback, callbackId) {
                _this.logger.verbose("Emitting event to callback " + callbackId + ": " + eventType);
                callback.apply(null, [message_1]);
            });
        }
    };
    /**
     * Adds event callbacks to array
     * @param callback
     */
    ClientApplication.prototype.addEventCallback = function (callback) {
        if (this.isBrowserEnvironment) {
            var callbackId = this.browserCrypto.createNewGuid();
            this.eventCallbacks.set(callbackId, callback);
            this.logger.verbose("Event callback registered with id: " + callbackId);
            return callbackId;
        }
        return null;
    };
    ClientApplication.prototype.removeEventCallback = function (callbackId) {
        this.eventCallbacks.delete(callbackId);
        this.logger.verbose("Event callback " + callbackId + " removed.");
    };
    /**
     * Returns the logger instance
     */
    ClientApplication.prototype.getLogger = function () {
        return this.logger;
    };
    /**
     * Replaces the default logger set in configurations with new Logger with new configurations
     * @param logger Logger instance
     */
    ClientApplication.prototype.setLogger = function (logger) {
        this.logger = logger;
    };
    return ClientApplication;
}());
export { ClientApplication };
//# sourceMappingURL=ClientApplication.js.map