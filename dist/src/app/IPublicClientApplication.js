/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BrowserConfigurationAuthError } from "../error/BrowserConfigurationAuthError";
export var stubbedPublicClientApplication = {
    acquireTokenPopup: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    acquireTokenRedirect: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    acquireTokenSilent: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    getAllAccounts: function () {
        return [];
    },
    getAccountByHomeId: function () {
        return null;
    },
    getAccountByUsername: function () {
        return null;
    },
    getAccountByLocalId: function () {
        return null;
    },
    handleRedirectPromise: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    loginPopup: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    loginRedirect: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    logout: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    ssoSilent: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError);
    },
    addEventCallback: function () {
        return null;
    },
    removeEventCallback: function () {
        return;
    },
    getLogger: function () {
        throw BrowserConfigurationAuthError.createStubPcaInstanceCalledError();
    },
    setLogger: function () {
        return;
    }
};
//# sourceMappingURL=IPublicClientApplication.js.map