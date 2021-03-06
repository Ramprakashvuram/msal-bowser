import { PopupRequest } from "../request/PopupRequest";
import { RedirectRequest } from "../request/RedirectRequest";
/**
 * Constants
 */
export declare const BrowserConstants: {
    INTERACTION_IN_PROGRESS_VALUE: string;
    INVALID_GRANT_ERROR: string;
    POPUP_WIDTH: number;
    POPUP_HEIGHT: number;
    POLL_INTERVAL_MS: number;
    MSAL_SKU: string;
};
export declare enum BrowserCacheLocation {
    LocalStorage = "localStorage",
    SessionStorage = "sessionStorage",
    MemoryStorage = "memoryStorage"
}
/**
 * HTTP Request types supported by MSAL.
 */
export declare enum HTTP_REQUEST_TYPE {
    GET = "GET",
    POST = "POST"
}
/**
 * Temporary cache keys for MSAL, deleted after any request.
 */
export declare enum TemporaryCacheKeys {
    AUTHORITY = "authority",
    ACQUIRE_TOKEN_ACCOUNT = "acquireToken.account",
    SESSION_STATE = "session.state",
    REQUEST_STATE = "request.state",
    NONCE_IDTOKEN = "nonce.id_token",
    ORIGIN_URI = "request.origin",
    RENEW_STATUS = "token.renew.status",
    URL_HASH = "urlHash",
    REQUEST_PARAMS = "request.params",
    SCOPES = "scopes",
    INTERACTION_STATUS_KEY = "interaction.status"
}
/**
 * API Codes for Telemetry purposes.
 * Before adding a new code you must claim it in the MSAL Telemetry tracker as these number spaces are shared across all MSALs
 * 0-99 Silent Flow
 * 800-899 Auth Code Flow
 */
export declare enum ApiId {
    acquireTokenRedirect = 861,
    acquireTokenPopup = 862,
    ssoSilent = 863,
    acquireTokenSilent_authCode = 864,
    handleRedirectPromise = 865,
    acquireTokenSilent_silentFlow = 61
}
export declare enum InteractionType {
    Redirect = "redirect",
    Popup = "popup",
    Silent = "silent"
}
export declare const DEFAULT_REQUEST: RedirectRequest | PopupRequest;
export declare const KEY_FORMAT_JWK = "jwk";
