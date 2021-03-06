/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils, ClientAuthError, ProtocolUtils, UrlString } from "@azure/msal-common";
var BrowserProtocolUtils = /** @class */ (function () {
    function BrowserProtocolUtils() {
    }
    /**
     * Extracts the BrowserStateObject from the state string.
     * @param browserCrypto
     * @param state
     */
    BrowserProtocolUtils.extractBrowserRequestState = function (browserCrypto, state) {
        if (StringUtils.isEmpty(state)) {
            return null;
        }
        try {
            var requestStateObj = ProtocolUtils.parseRequestState(browserCrypto, state);
            return requestStateObj.libraryState.meta;
        }
        catch (e) {
            throw ClientAuthError.createInvalidStateError(state, e);
        }
    };
    /**
     * Parses properties of server response from url hash
     * @param locationHash Hash from url
     */
    BrowserProtocolUtils.parseServerResponseFromHash = function (locationHash) {
        if (!locationHash) {
            return {};
        }
        var hashUrlString = new UrlString(locationHash);
        return UrlString.getDeserializedHash(hashUrlString.getHash());
    };
    return BrowserProtocolUtils;
}());
export { BrowserProtocolUtils };
//# sourceMappingURL=BrowserProtocolUtils.js.map