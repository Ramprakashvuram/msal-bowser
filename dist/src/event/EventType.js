/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export var EventType;
(function (EventType) {
    EventType["LOGIN_START"] = "msal:loginStart";
    EventType["LOGIN_SUCCESS"] = "msal:loginSuccess";
    EventType["LOGIN_FAILURE"] = "msal:loginFailure";
    EventType["ACQUIRE_TOKEN_START"] = "msal:acquireTokenStart";
    EventType["ACQUIRE_TOKEN_SUCCESS"] = "msal:acquireTokenSuccess";
    EventType["ACQUIRE_TOKEN_FAILURE"] = "msal:acquireTokenFailure";
    EventType["ACQUIRE_TOKEN_NETWORK_START"] = "msal:acquireTokenFromNetworkStart";
    EventType["SSO_SILENT_START"] = "msal:ssoSilentStart";
    EventType["SSO_SILENT_SUCCESS"] = "msal:ssoSilentSuccess";
    EventType["SSO_SILENT_FAILURE"] = "msal:ssoSilentFailure";
    EventType["HANDLE_REDIRECT_START"] = "msal:handleRedirectStart";
    EventType["HANDLE_REDIRECT_END"] = "msal:handleRedirectEnd";
    EventType["LOGOUT_START"] = "msal:logoutStart";
    EventType["LOGOUT_SUCCESS"] = "msal:logoutSuccess";
    EventType["LOGOUT_FAILURE"] = "msal:logoutFailure";
})(EventType || (EventType = {}));
//# sourceMappingURL=EventType.js.map