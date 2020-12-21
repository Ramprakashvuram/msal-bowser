/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __assign } from "tslib";
import { DEFAULT_SYSTEM_OPTIONS, Constants, ProtocolMode, LogLevel } from "@azure/msal-common";
import { BrowserUtils } from "../utils/BrowserUtils";
import { BrowserCacheLocation } from "../utils/BrowserConstants";
// Default timeout for popup windows and iframes in milliseconds
export var DEFAULT_POPUP_TIMEOUT_MS = 60000;
export var DEFAULT_IFRAME_TIMEOUT_MS = 6000;
export var DEFAULT_REDIRECT_TIMEOUT_MS = 30000;
/**
 * MSAL function that sets the default options when not explicitly configured from app developer
 *
 * @param auth
 * @param cache
 * @param system
 *
 * @returns Configuration object
 */
export function buildConfiguration(_a) {
    var userInputAuth = _a.auth, userInputCache = _a.cache, userInputSystem = _a.system;
    // Default auth options for browser
    var DEFAULT_AUTH_OPTIONS = {
        clientId: "",
        authority: "" + Constants.DEFAULT_AUTHORITY,
        knownAuthorities: [],
        cloudDiscoveryMetadata: "",
        redirectUri: "",
        postLogoutRedirectUri: "",
        navigateToLoginRequestUrl: true,
        clientCapabilities: [],
        protocolMode: ProtocolMode.AAD,
        responseType: "",
    };
    // Default cache options for browser
    var DEFAULT_CACHE_OPTIONS = {
        cacheLocation: BrowserCacheLocation.SessionStorage,
        storeAuthStateInCookie: false
    };
    // Default logger options for browser
    var DEFAULT_LOGGER_OPTIONS = {
        loggerCallback: function () { },
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
    };
    // Default system options for browser
    var DEFAULT_BROWSER_SYSTEM_OPTIONS = __assign(__assign({}, DEFAULT_SYSTEM_OPTIONS), { loggerOptions: DEFAULT_LOGGER_OPTIONS, networkClient: BrowserUtils.getBrowserNetworkClient(), loadFrameTimeout: 0, 
        // If loadFrameTimeout is provided, use that as default.
        windowHashTimeout: (userInputSystem && userInputSystem.loadFrameTimeout) || DEFAULT_POPUP_TIMEOUT_MS, iframeHashTimeout: (userInputSystem && userInputSystem.loadFrameTimeout) || DEFAULT_IFRAME_TIMEOUT_MS, navigateFrameWait: BrowserUtils.detectIEOrEdge() ? 500 : 0, redirectNavigationTimeout: DEFAULT_REDIRECT_TIMEOUT_MS, asyncPopups: false, allowRedirectInIframe: false });
    var overlayedConfig = {
        auth: __assign(__assign({}, DEFAULT_AUTH_OPTIONS), userInputAuth),
        cache: __assign(__assign({}, DEFAULT_CACHE_OPTIONS), userInputCache),
        system: __assign(__assign({}, DEFAULT_BROWSER_SYSTEM_OPTIONS), userInputSystem)
    };
    return overlayedConfig;
}
//# sourceMappingURL=Configuration.js.map