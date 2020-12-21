/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __extends } from "tslib";
import { UrlString, StringUtils, Constants } from "@azure/msal-common";
import { InteractionHandler } from "./InteractionHandler";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { BrowserConstants, InteractionType, TemporaryCacheKeys } from "../utils/BrowserConstants";
import { DEFAULT_POPUP_TIMEOUT_MS } from "../config/Configuration";
/**
 * This class implements the interaction handler base class for browsers. It is written specifically for handling
 * popup window scenarios. It includes functions for monitoring the popup window for a hash.
 */
var PopupHandler = /** @class */ (function (_super) {
    __extends(PopupHandler, _super);
    function PopupHandler(authCodeModule, storageImpl) {
        var _this = _super.call(this, authCodeModule, storageImpl) || this;
        // Properly sets this reference for the unload event.
        _this.unloadWindow = _this.unloadWindow.bind(_this);
        return _this;
    }
    /**
     * Opens a popup window with given request Url.
     * @param requestUrl
     */
    PopupHandler.prototype.initiateAuthRequest = function (requestUrl, authCodeRequest, params) {
        // Check that request url is not empty.
        if (!StringUtils.isEmpty(requestUrl)) {
            // Save auth code request
            this.authCodeRequest = authCodeRequest;
            // Set interaction status in the library.
            this.browserStorage.setTemporaryCache(TemporaryCacheKeys.INTERACTION_STATUS_KEY, BrowserConstants.INTERACTION_IN_PROGRESS_VALUE, true);
            this.authModule.logger.infoPii("Navigate to:" + requestUrl);
            // Open the popup window to requestUrl.
            return this.openPopup(requestUrl, params.popup);
        }
        else {
            // Throw error if request URL is empty.
            this.authModule.logger.error("Navigate url is empty");
            throw BrowserAuthError.createEmptyNavigationUriError();
        }
    };
    /**
     * Monitors a window until it loads a url with a known hash, or hits a specified timeout.
     * @param popupWindow - window that is being monitored
     * @param timeout - milliseconds until timeout
     * @param urlNavigate - url that was navigated to
     */
    PopupHandler.prototype.monitorPopupForHash = function (popupWindow, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (timeout < DEFAULT_POPUP_TIMEOUT_MS) {
                _this.authModule.logger.warning("system.loadFrameTimeout or system.windowHashTimeout set to lower (" + timeout + "ms) than the default (" + DEFAULT_POPUP_TIMEOUT_MS + "ms). This may result in timeouts.");
            }
            var maxTicks = timeout / BrowserConstants.POLL_INTERVAL_MS;
            var ticks = 0;
            var intervalId = setInterval(function () {
                if (popupWindow.closed) {
                    // Window is closed
                    _this.cleanPopup();
                    clearInterval(intervalId);
                    reject(BrowserAuthError.createUserCancelledError());
                    return;
                }
                var href;
                try {
                    /*
                     * Will throw if cross origin,
                     * which should be caught and ignored
                     * since we need the interval to keep running while on STS UI.
                     */
                    href = popupWindow.location.href;
                }
                catch (e) { }
                // Don't process blank pages or cross domain
                if (StringUtils.isEmpty(href) || href === "about:blank") {
                    return;
                }
                // Only run clock when we are on same domain
                ticks++;
                var contentHash = popupWindow.location.hash;
                if (UrlString.hashContainsKnownProperties(contentHash)) {
                    // Success case
                    _this.cleanPopup(popupWindow);
                    clearInterval(intervalId);
                    resolve(contentHash);
                    return;
                }
                else if (ticks > maxTicks) {
                    // Timeout error
                    _this.cleanPopup(popupWindow);
                    clearInterval(intervalId);
                    reject(BrowserAuthError.createMonitorPopupTimeoutError());
                    return;
                }
            }, BrowserConstants.POLL_INTERVAL_MS);
        });
    };
    /**
     * @hidden
     *
     * Configures popup window for login.
     *
     * @param urlNavigate
     * @param title
     * @param popUpWidth
     * @param popUpHeight
     * @ignore
     * @hidden
     */
    PopupHandler.prototype.openPopup = function (urlNavigate, popup) {
        try {
            var popupWindow = void 0;
            // Popup window passed in, setting url to navigate to
            if (popup) {
                popupWindow = popup;
                popupWindow.location.assign(urlNavigate);
            }
            else if (typeof popup === "undefined") {
                // Popup will be undefined if it was not passed in
                popupWindow = PopupHandler.openSizedPopup(urlNavigate);
            }
            // Popup will be null if popups are blocked
            if (!popupWindow) {
                throw BrowserAuthError.createEmptyWindowCreatedError();
            }
            if (popupWindow.focus) {
                popupWindow.focus();
            }
            this.currentWindow = popupWindow;
            window.addEventListener("beforeunload", this.unloadWindow);
            return popupWindow;
        }
        catch (e) {
            this.authModule.logger.error("error opening popup " + e.message);
            this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.INTERACTION_STATUS_KEY));
            throw BrowserAuthError.createPopupWindowError(e.toString());
        }
    };
    PopupHandler.openSizedPopup = function (urlNavigate) {
        if (urlNavigate === void 0) { urlNavigate = "about:blank"; }
        /**
         * adding winLeft and winTop to account for dual monitor
         * using screenLeft and screenTop for IE8 and earlier
         */
        var winLeft = window.screenLeft ? window.screenLeft : window.screenX;
        var winTop = window.screenTop ? window.screenTop : window.screenY;
        /**
         * window.innerWidth displays browser window"s height and width excluding toolbars
         * using document.documentElement.clientWidth for IE8 and earlier
         */
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var left = Math.max(0, ((width / 2) - (BrowserConstants.POPUP_WIDTH / 2)) + winLeft);
        var top = Math.max(0, ((height / 2) - (BrowserConstants.POPUP_HEIGHT / 2)) + winTop);
        return window.open(urlNavigate, Constants.LIBRARY_NAME, "width=" + BrowserConstants.POPUP_WIDTH + ", height=" + BrowserConstants.POPUP_HEIGHT + ", top=" + top + ", left=" + left);
    };
    /**
     * Event callback to unload main window.
     */
    PopupHandler.prototype.unloadWindow = function (e) {
        this.browserStorage.cleanRequestByInteractionType(InteractionType.Popup);
        this.currentWindow.close();
        // Guarantees browser unload will happen, so no other errors will be thrown.
        delete e["returnValue"];
    };
    /**
     * Closes popup, removes any state vars created during popup calls.
     * @param popupWindow
     */
    PopupHandler.prototype.cleanPopup = function (popupWindow) {
        if (popupWindow) {
            // Close window.
            popupWindow.close();
        }
        // Remove window unload function
        window.removeEventListener("beforeunload", this.unloadWindow);
        // Interaction is completed - remove interaction status.
        this.browserStorage.removeItem(this.browserStorage.generateCacheKey(TemporaryCacheKeys.INTERACTION_STATUS_KEY));
    };
    return PopupHandler;
}(InteractionHandler));
export { PopupHandler };
//# sourceMappingURL=PopupHandler.js.map