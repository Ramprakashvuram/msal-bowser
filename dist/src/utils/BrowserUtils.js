/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { UrlString } from "@azure/msal-common";
import { FetchClient } from "../network/FetchClient";
import { XhrClient } from "../network/XhrClient";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { InteractionType } from "./BrowserConstants";
/**
 * Utility class for browser specific functions
 */
var BrowserUtils = /** @class */ (function () {
    function BrowserUtils() {
    }
    // #region Window Navigation and URL management
    /**
     * Used to redirect the browser to the STS authorization endpoint
     * @param {string} urlNavigate - URL of the authorization endpoint
     * @param {boolean} noHistory - boolean flag, uses .replace() instead of .assign() if true
     */
    BrowserUtils.navigateWindow = function (urlNavigate, navigationTimeout, logger, noHistory) {
        if (noHistory) {
            window.location.replace(urlNavigate);
        }
        else {
            window.location.assign(urlNavigate);
        }
        // To block code from running after navigation, this should not throw if navigation succeeds
        return new Promise(function (resolve) {
            setTimeout(function () {
                logger.warning("Expected to navigate away from the current page but timeout occurred.");
                resolve();
            }, navigationTimeout);
        });
    };
    /**
     * Clears hash from window url.
     */
    BrowserUtils.clearHash = function () {
        // Office.js sets history.replaceState to null
        if (typeof history.replaceState === "function") {
            // Full removes "#" from url
            history.replaceState(null, null, "" + window.location.pathname + window.location.search);
        }
        else {
            window.location.hash = "";
        }
    };
    /**
     * Replaces current hash with hash from provided url
     */
    BrowserUtils.replaceHash = function (url) {
        var urlParts = url.split("#");
        urlParts.shift(); // Remove part before the hash
        window.location.hash = urlParts.length > 0 ? urlParts.join("#") : "";
    };
    /**
     * Returns boolean of whether the current window is in an iframe or not.
     */
    BrowserUtils.isInIframe = function () {
        return window.parent !== window;
    };
    // #endregion
    /**
     * Returns current window URL as redirect uri
     */
    BrowserUtils.getCurrentUri = function () {
        return window.location.href.split("?")[0].split("#")[0];
    };
    /**
     * Gets the homepage url for the current window location.
     */
    BrowserUtils.getHomepage = function () {
        var currentUrl = new UrlString(window.location.href);
        var urlComponents = currentUrl.getUrlComponents();
        return urlComponents.Protocol + "//" + urlComponents.HostNameAndPort + "/";
    };
    /**
     * Returns best compatible network client object.
     */
    BrowserUtils.getBrowserNetworkClient = function () {
        if (window.fetch && window.Headers) {
            return new FetchClient();
        }
        else {
            return new XhrClient();
        }
    };
    /**
     * Throws error if we have completed an auth and are
     * attempting another auth request inside an iframe.
     */
    BrowserUtils.blockReloadInHiddenIframes = function () {
        var isResponseHash = UrlString.hashContainsKnownProperties(window.location.hash);
        // return an error if called from the hidden iframe created by the msal js silent calls
        if (isResponseHash && BrowserUtils.isInIframe()) {
            throw BrowserAuthError.createBlockReloadInHiddenIframeError();
        }
    };
    /**
     * Block redirect operations in iframes unless explicitly allowed
     * @param interactionType Interaction type for the request
     * @param allowRedirectInIframe Config value to allow redirects when app is inside an iframe
     */
    BrowserUtils.blockRedirectInIframe = function (interactionType, allowRedirectInIframe) {
        var isIframedApp = BrowserUtils.isInIframe();
        if (interactionType === InteractionType.Redirect && isIframedApp && !allowRedirectInIframe) {
            // If we are not in top frame, we shouldn't redirect. This is also handled by the service.
            throw BrowserAuthError.createRedirectInIframeError(isIframedApp);
        }
    };
    /**
     * Throws error if token requests are made in non-browser environment
     * @param isBrowserEnvironment Flag indicating if environment is a browser.
     */
    BrowserUtils.blockNonBrowserEnvironment = function (isBrowserEnvironment) {
        if (!isBrowserEnvironment) {
            throw BrowserAuthError.createNonBrowserEnvironmentError();
        }
    };
    /**
     * Returns boolean of whether current browser is an Internet Explorer or Edge browser.
     */
    BrowserUtils.detectIEOrEdge = function () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        var msie11 = ua.indexOf("Trident/");
        var msedge = ua.indexOf("Edge/");
        var isIE = msie > 0 || msie11 > 0;
        var isEdge = msedge > 0;
        return isIE || isEdge;
    };
    return BrowserUtils;
}());
export { BrowserUtils };
//# sourceMappingURL=BrowserUtils.js.map