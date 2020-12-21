/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __extends } from "tslib";
import { AuthError, StringUtils } from "@azure/msal-common";
/**
 * BrowserAuthErrorMessage class containing string constants used by error codes and messages.
 */
export var BrowserAuthErrorMessage = {
    pkceNotGenerated: {
        code: "pkce_not_created",
        desc: "The PKCE code challenge and verifier could not be generated."
    },
    cryptoDoesNotExist: {
        code: "crypto_nonexistent",
        desc: "The crypto object or function is not available."
    },
    httpMethodNotImplementedError: {
        code: "http_method_not_implemented",
        desc: "The HTTP method given has not been implemented in this library."
    },
    emptyNavigateUriError: {
        code: "empty_navigate_uri",
        desc: "Navigation URI is empty. Please check stack trace for more info."
    },
    hashEmptyError: {
        code: "hash_empty_error",
        desc: "Hash value cannot be processed because it is empty."
    },
    interactionInProgress: {
        code: "interaction_in_progress",
        desc: "Interaction is currently in progress. Please ensure that this interaction has been completed before calling an interactive API."
    },
    popUpWindowError: {
        code: "popup_window_error",
        desc: "Error opening popup window. This can happen if you are using IE or if popups are blocked in the browser."
    },
    emptyWindowError: {
        code: "empty_window_error",
        desc: "window.open returned null or undefined window object."
    },
    userCancelledError: {
        code: "user_cancelled",
        desc: "User cancelled the flow."
    },
    monitorPopupTimeoutError: {
        code: "monitor_window_timeout",
        desc: "Token acquisition in popup failed due to timeout."
    },
    monitorIframeTimeoutError: {
        code: "monitor_window_timeout",
        desc: "Token acquisition in iframe failed due to timeout."
    },
    redirectInIframeError: {
        code: "redirect_in_iframe",
        desc: "Code flow is not supported inside an iframe. Please ensure you are using MSAL.js in a top frame of the window if using the redirect APIs, or use the popup APIs."
    },
    blockTokenRequestsInHiddenIframeError: {
        code: "block_iframe_reload",
        desc: "Request was blocked inside an iframe because MSAL detected an authentication response. Please ensure monitorWindowForHash was called."
    },
    iframeClosedPrematurelyError: {
        code: "iframe_closed_prematurely",
        desc: "The iframe being monitored was closed prematurely."
    },
    silentSSOInsufficientInfoError: {
        code: "silent_sso_error",
        desc: "Silent SSO could not be completed - insufficient information was provided. Please provide either a loginHint or sid."
    },
    silentPromptValueError: {
        code: "silent_prompt_value_error",
        desc: "The value given for the prompt value is not valid for silent requests - must be set to 'none'."
    },
    tokenRequestCacheError: {
        code: "token_request_cache_error",
        desc: "The token request could not be fetched from the cache correctly."
    },
    invalidCacheType: {
        code: "invalid_cache_type",
        desc: "Invalid cache type"
    },
    notInBrowserEnvironment: {
        code: "non_browser_environment",
        desc: "Login and token requests are not supported in non-browser environments."
    }
};
/**
 * Browser library error class thrown by the MSAL.js library for SPAs
 */
var BrowserAuthError = /** @class */ (function (_super) {
    __extends(BrowserAuthError, _super);
    function BrowserAuthError(errorCode, errorMessage) {
        var _this = _super.call(this, errorCode, errorMessage) || this;
        Object.setPrototypeOf(_this, BrowserAuthError.prototype);
        _this.name = "BrowserAuthError";
        return _this;
    }
    /**
     * Creates an error thrown when PKCE is not implemented.
     * @param errDetail
     */
    BrowserAuthError.createPkceNotGeneratedError = function (errDetail) {
        return new BrowserAuthError(BrowserAuthErrorMessage.pkceNotGenerated.code, BrowserAuthErrorMessage.pkceNotGenerated.desc + " Detail:" + errDetail);
    };
    /**
     * Creates an error thrown when the crypto object is unavailable.
     * @param errDetail
     */
    BrowserAuthError.createCryptoNotAvailableError = function (errDetail) {
        return new BrowserAuthError(BrowserAuthErrorMessage.cryptoDoesNotExist.code, BrowserAuthErrorMessage.cryptoDoesNotExist.desc + " Detail:" + errDetail);
    };
    /**
     * Creates an error thrown when an HTTP method hasn't been implemented by the browser class.
     * @param method
     */
    BrowserAuthError.createHttpMethodNotImplementedError = function (method) {
        return new BrowserAuthError(BrowserAuthErrorMessage.httpMethodNotImplementedError.code, BrowserAuthErrorMessage.httpMethodNotImplementedError.desc + " Given Method: " + method);
    };
    /**
     * Creates an error thrown when the navigation URI is empty.
     */
    BrowserAuthError.createEmptyNavigationUriError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.emptyNavigateUriError.code, BrowserAuthErrorMessage.emptyNavigateUriError.desc);
    };
    /**
     * Creates an error thrown when the hash string value is unexpectedly empty.
     * @param hashValue
     */
    BrowserAuthError.createEmptyHashError = function (hashValue) {
        return new BrowserAuthError(BrowserAuthErrorMessage.hashEmptyError.code, BrowserAuthErrorMessage.hashEmptyError.desc + " Given Url: " + hashValue);
    };
    /**
     * Creates an error thrown when a browser interaction (redirect or popup) is in progress.
     */
    BrowserAuthError.createInteractionInProgressError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.interactionInProgress.code, BrowserAuthErrorMessage.interactionInProgress.desc);
    };
    /**
     * Creates an error thrown when the popup window could not be opened.
     * @param errDetail
     */
    BrowserAuthError.createPopupWindowError = function (errDetail) {
        var errorMessage = BrowserAuthErrorMessage.popUpWindowError.desc;
        errorMessage = !StringUtils.isEmpty(errDetail) ? errorMessage + " Details: " + errDetail : errorMessage;
        return new BrowserAuthError(BrowserAuthErrorMessage.popUpWindowError.code, errorMessage);
    };
    /**
     * Creates an error thrown when window.open returns an empty window object.
     * @param errDetail
     */
    BrowserAuthError.createEmptyWindowCreatedError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.emptyWindowError.code, BrowserAuthErrorMessage.emptyWindowError.desc);
    };
    /**
     * Creates an error thrown when the user closes a popup.
     */
    BrowserAuthError.createUserCancelledError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.userCancelledError.code, BrowserAuthErrorMessage.userCancelledError.desc);
    };
    /**
     * Creates an error thrown when monitorPopupFromHash times out for a given popup.
     */
    BrowserAuthError.createMonitorPopupTimeoutError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.monitorPopupTimeoutError.code, BrowserAuthErrorMessage.monitorPopupTimeoutError.desc);
    };
    /**
     * Creates an error thrown when monitorIframeFromHash times out for a given iframe.
     */
    BrowserAuthError.createMonitorIframeTimeoutError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.monitorIframeTimeoutError.code, BrowserAuthErrorMessage.monitorIframeTimeoutError.desc);
    };
    /**
     * Creates an error thrown when navigateWindow is called inside an iframe.
     * @param windowParentCheck
     */
    BrowserAuthError.createRedirectInIframeError = function (windowParentCheck) {
        return new BrowserAuthError(BrowserAuthErrorMessage.redirectInIframeError.code, BrowserAuthErrorMessage.redirectInIframeError.desc + " (window.parent !== window) => " + windowParentCheck);
    };
    /**
     * Creates an error thrown when an auth reload is done inside an iframe.
     */
    BrowserAuthError.createBlockReloadInHiddenIframeError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.blockTokenRequestsInHiddenIframeError.code, BrowserAuthErrorMessage.blockTokenRequestsInHiddenIframeError.desc);
    };
    /**
     * Creates an error thrown when an iframe is found to be closed before the timeout is reached.
     */
    BrowserAuthError.createIframeClosedPrematurelyError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.iframeClosedPrematurelyError.code, BrowserAuthErrorMessage.iframeClosedPrematurelyError.desc);
    };
    /**
     * Creates an error thrown when the login_hint, sid or account object is not provided in the ssoSilent API.
     */
    BrowserAuthError.createSilentSSOInsufficientInfoError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.silentSSOInsufficientInfoError.code, BrowserAuthErrorMessage.silentSSOInsufficientInfoError.desc);
    };
    /**
     * Creates an error thrown when a given prompt value is invalid for silent requests.
     */
    BrowserAuthError.createSilentPromptValueError = function (givenPrompt) {
        return new BrowserAuthError(BrowserAuthErrorMessage.silentPromptValueError.code, BrowserAuthErrorMessage.silentPromptValueError.desc + " Given value: " + givenPrompt);
    };
    /**
     * Creates an error thrown when the token request could not be retrieved from the cache
     * @param errDetail
     */
    BrowserAuthError.createTokenRequestCacheError = function (errDetail) {
        return new BrowserAuthError(BrowserAuthErrorMessage.tokenRequestCacheError.code, BrowserAuthErrorMessage.tokenRequestCacheError.desc + " Error Detail: " + errDetail);
    };
    /**
     * Creates an error thrown if cache type is invalid.
     */
    BrowserAuthError.createInvalidCacheTypeError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.invalidCacheType.code, "" + BrowserAuthErrorMessage.invalidCacheType.desc);
    };
    /**
     * Create an error thrown when login and token requests are made from a non-browser environment
     */
    BrowserAuthError.createNonBrowserEnvironmentError = function () {
        return new BrowserAuthError(BrowserAuthErrorMessage.notInBrowserEnvironment.code, BrowserAuthErrorMessage.notInBrowserEnvironment.desc);
    };
    return BrowserAuthError;
}(AuthError));
export { BrowserAuthError };
//# sourceMappingURL=BrowserAuthError.js.map