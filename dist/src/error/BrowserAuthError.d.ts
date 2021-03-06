import { AuthError } from "@azure/msal-common";
/**
 * BrowserAuthErrorMessage class containing string constants used by error codes and messages.
 */
export declare const BrowserAuthErrorMessage: {
    pkceNotGenerated: {
        code: string;
        desc: string;
    };
    cryptoDoesNotExist: {
        code: string;
        desc: string;
    };
    httpMethodNotImplementedError: {
        code: string;
        desc: string;
    };
    emptyNavigateUriError: {
        code: string;
        desc: string;
    };
    hashEmptyError: {
        code: string;
        desc: string;
    };
    interactionInProgress: {
        code: string;
        desc: string;
    };
    popUpWindowError: {
        code: string;
        desc: string;
    };
    emptyWindowError: {
        code: string;
        desc: string;
    };
    userCancelledError: {
        code: string;
        desc: string;
    };
    monitorPopupTimeoutError: {
        code: string;
        desc: string;
    };
    monitorIframeTimeoutError: {
        code: string;
        desc: string;
    };
    redirectInIframeError: {
        code: string;
        desc: string;
    };
    blockTokenRequestsInHiddenIframeError: {
        code: string;
        desc: string;
    };
    iframeClosedPrematurelyError: {
        code: string;
        desc: string;
    };
    silentSSOInsufficientInfoError: {
        code: string;
        desc: string;
    };
    silentPromptValueError: {
        code: string;
        desc: string;
    };
    tokenRequestCacheError: {
        code: string;
        desc: string;
    };
    invalidCacheType: {
        code: string;
        desc: string;
    };
    notInBrowserEnvironment: {
        code: string;
        desc: string;
    };
};
/**
 * Browser library error class thrown by the MSAL.js library for SPAs
 */
export declare class BrowserAuthError extends AuthError {
    constructor(errorCode: string, errorMessage?: string);
    /**
     * Creates an error thrown when PKCE is not implemented.
     * @param errDetail
     */
    static createPkceNotGeneratedError(errDetail: string): BrowserAuthError;
    /**
     * Creates an error thrown when the crypto object is unavailable.
     * @param errDetail
     */
    static createCryptoNotAvailableError(errDetail: string): BrowserAuthError;
    /**
     * Creates an error thrown when an HTTP method hasn't been implemented by the browser class.
     * @param method
     */
    static createHttpMethodNotImplementedError(method: string): BrowserAuthError;
    /**
     * Creates an error thrown when the navigation URI is empty.
     */
    static createEmptyNavigationUriError(): BrowserAuthError;
    /**
     * Creates an error thrown when the hash string value is unexpectedly empty.
     * @param hashValue
     */
    static createEmptyHashError(hashValue: string): BrowserAuthError;
    /**
     * Creates an error thrown when a browser interaction (redirect or popup) is in progress.
     */
    static createInteractionInProgressError(): BrowserAuthError;
    /**
     * Creates an error thrown when the popup window could not be opened.
     * @param errDetail
     */
    static createPopupWindowError(errDetail?: string): BrowserAuthError;
    /**
     * Creates an error thrown when window.open returns an empty window object.
     * @param errDetail
     */
    static createEmptyWindowCreatedError(): BrowserAuthError;
    /**
     * Creates an error thrown when the user closes a popup.
     */
    static createUserCancelledError(): BrowserAuthError;
    /**
     * Creates an error thrown when monitorPopupFromHash times out for a given popup.
     */
    static createMonitorPopupTimeoutError(): BrowserAuthError;
    /**
     * Creates an error thrown when monitorIframeFromHash times out for a given iframe.
     */
    static createMonitorIframeTimeoutError(): BrowserAuthError;
    /**
     * Creates an error thrown when navigateWindow is called inside an iframe.
     * @param windowParentCheck
     */
    static createRedirectInIframeError(windowParentCheck: boolean): BrowserAuthError;
    /**
     * Creates an error thrown when an auth reload is done inside an iframe.
     */
    static createBlockReloadInHiddenIframeError(): BrowserAuthError;
    /**
     * Creates an error thrown when an iframe is found to be closed before the timeout is reached.
     */
    static createIframeClosedPrematurelyError(): BrowserAuthError;
    /**
     * Creates an error thrown when the login_hint, sid or account object is not provided in the ssoSilent API.
     */
    static createSilentSSOInsufficientInfoError(): BrowserAuthError;
    /**
     * Creates an error thrown when a given prompt value is invalid for silent requests.
     */
    static createSilentPromptValueError(givenPrompt: string): BrowserAuthError;
    /**
     * Creates an error thrown when the token request could not be retrieved from the cache
     * @param errDetail
     */
    static createTokenRequestCacheError(errDetail: string): BrowserAuthError;
    /**
     * Creates an error thrown if cache type is invalid.
     */
    static createInvalidCacheTypeError(): BrowserAuthError;
    /**
     * Create an error thrown when login and token requests are made from a non-browser environment
     */
    static createNonBrowserEnvironmentError(): BrowserAuthError;
}
