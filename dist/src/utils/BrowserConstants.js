/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Constants } from "@azure/msal-common";
/**
 * Constants
 */
export var BrowserConstants = {
    // Interaction in progress cache value
    INTERACTION_IN_PROGRESS_VALUE: "interaction_in_progress",
    // Invalid grant error code
    INVALID_GRANT_ERROR: "invalid_grant",
    // Default popup window width
    POPUP_WIDTH: 483,
    // Default popup window height
    POPUP_HEIGHT: 600,
    // Default popup monitor poll interval in milliseconds
    POLL_INTERVAL_MS: 50,
    // msal-browser SKU
    MSAL_SKU: "msal.js.browser",
};
export var BrowserCacheLocation;
(function (BrowserCacheLocation) {
    BrowserCacheLocation["LocalStorage"] = "localStorage";
    BrowserCacheLocation["SessionStorage"] = "sessionStorage";
    BrowserCacheLocation["MemoryStorage"] = "memoryStorage";
})(BrowserCacheLocation || (BrowserCacheLocation = {}));
/**
 * HTTP Request types supported by MSAL.
 */
export var HTTP_REQUEST_TYPE;
(function (HTTP_REQUEST_TYPE) {
    HTTP_REQUEST_TYPE["GET"] = "GET";
    HTTP_REQUEST_TYPE["POST"] = "POST";
})(HTTP_REQUEST_TYPE || (HTTP_REQUEST_TYPE = {}));
/**
 * Temporary cache keys for MSAL, deleted after any request.
 */
export var TemporaryCacheKeys;
(function (TemporaryCacheKeys) {
    TemporaryCacheKeys["AUTHORITY"] = "authority";
    TemporaryCacheKeys["ACQUIRE_TOKEN_ACCOUNT"] = "acquireToken.account";
    TemporaryCacheKeys["SESSION_STATE"] = "session.state";
    TemporaryCacheKeys["REQUEST_STATE"] = "request.state";
    TemporaryCacheKeys["NONCE_IDTOKEN"] = "nonce.id_token";
    TemporaryCacheKeys["ORIGIN_URI"] = "request.origin";
    TemporaryCacheKeys["RENEW_STATUS"] = "token.renew.status";
    TemporaryCacheKeys["URL_HASH"] = "urlHash";
    TemporaryCacheKeys["REQUEST_PARAMS"] = "request.params";
    TemporaryCacheKeys["SCOPES"] = "scopes";
    TemporaryCacheKeys["INTERACTION_STATUS_KEY"] = "interaction.status";
})(TemporaryCacheKeys || (TemporaryCacheKeys = {}));
/**
 * API Codes for Telemetry purposes.
 * Before adding a new code you must claim it in the MSAL Telemetry tracker as these number spaces are shared across all MSALs
 * 0-99 Silent Flow
 * 800-899 Auth Code Flow
 */
export var ApiId;
(function (ApiId) {
    ApiId[ApiId["acquireTokenRedirect"] = 861] = "acquireTokenRedirect";
    ApiId[ApiId["acquireTokenPopup"] = 862] = "acquireTokenPopup";
    ApiId[ApiId["ssoSilent"] = 863] = "ssoSilent";
    ApiId[ApiId["acquireTokenSilent_authCode"] = 864] = "acquireTokenSilent_authCode";
    ApiId[ApiId["handleRedirectPromise"] = 865] = "handleRedirectPromise";
    ApiId[ApiId["acquireTokenSilent_silentFlow"] = 61] = "acquireTokenSilent_silentFlow";
})(ApiId || (ApiId = {}));
/*
 * Interaction type of the API - used for state and telemetry
 */
export var InteractionType;
(function (InteractionType) {
    InteractionType["Redirect"] = "redirect";
    InteractionType["Popup"] = "popup";
    InteractionType["Silent"] = "silent";
})(InteractionType || (InteractionType = {}));
export var DEFAULT_REQUEST = {
    scopes: [Constants.OPENID_SCOPE, Constants.PROFILE_SCOPE]
};
// JWK Key Format string (Type MUST be defined for window crypto APIs)
export var KEY_FORMAT_JWK = "jwk";
//# sourceMappingURL=BrowserConstants.js.map