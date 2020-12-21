/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { __extends } from "tslib";
import { Constants, PersistentCacheKeys, StringUtils, AccountEntity, IdTokenEntity, AccessTokenEntity, RefreshTokenEntity, AppMetadataEntity, CacheManager, ServerTelemetryEntity, ThrottlingEntity, ProtocolUtils } from "@azure/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { BrowserCacheLocation, TemporaryCacheKeys } from "../utils/BrowserConstants";
import { BrowserStorage } from "./BrowserStorage";
import { MemoryStorage } from "./MemoryStorage";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils";
/**
 * This class implements the cache storage interface for MSAL through browser local or session storage.
 * Cookies are only used if storeAuthStateInCookie is true, and are only used for
 * parameters such as state and nonce, generally.
 */
var BrowserCacheManager = /** @class */ (function (_super) {
    __extends(BrowserCacheManager, _super);
    function BrowserCacheManager(clientId, cacheConfig, cryptoImpl, logger) {
        var _this = _super.call(this, clientId, cryptoImpl) || this;
        // Cookie life calculation (hours * minutes * seconds * ms)
        _this.COOKIE_LIFE_MULTIPLIER = 24 * 60 * 60 * 1000;
        _this.cacheConfig = cacheConfig;
        _this.logger = logger;
        _this.browserStorage = _this.setupBrowserStorage(cacheConfig.cacheLocation);
        // Migrate any cache entries from older versions of MSAL.
        _this.migrateCacheEntries();
        return _this;
    }
    /**
     * Returns a window storage class implementing the IWindowStorage interface that corresponds to the configured cacheLocation.
     * @param cacheLocation
     */
    BrowserCacheManager.prototype.setupBrowserStorage = function (cacheLocation) {
        switch (cacheLocation) {
            case BrowserCacheLocation.LocalStorage:
            case BrowserCacheLocation.SessionStorage:
                try {
                    return new BrowserStorage(cacheLocation);
                }
                catch (e) {
                    this.logger.verbose(e);
                    this.cacheConfig.cacheLocation = BrowserCacheLocation.MemoryStorage;
                    return new MemoryStorage();
                }
            case BrowserCacheLocation.MemoryStorage:
            default:
                return new MemoryStorage();
        }
    };
    /**
     * Migrate all old cache entries to new schema. No rollback supported.
     * @param storeAuthStateInCookie
     */
    BrowserCacheManager.prototype.migrateCacheEntries = function () {
        var _this = this;
        var idTokenKey = Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ID_TOKEN;
        var clientInfoKey = Constants.CACHE_PREFIX + "." + PersistentCacheKeys.CLIENT_INFO;
        var errorKey = Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ERROR;
        var errorDescKey = Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ERROR_DESC;
        var idTokenValue = this.browserStorage.getItem(idTokenKey);
        var clientInfoValue = this.browserStorage.getItem(clientInfoKey);
        var errorValue = this.browserStorage.getItem(errorKey);
        var errorDescValue = this.browserStorage.getItem(errorDescKey);
        var values = [idTokenValue, clientInfoValue, errorValue, errorDescValue];
        var keysToMigrate = [PersistentCacheKeys.ID_TOKEN, PersistentCacheKeys.CLIENT_INFO, PersistentCacheKeys.ERROR, PersistentCacheKeys.ERROR_DESC];
        keysToMigrate.forEach(function (cacheKey, index) { return _this.migrateCacheEntry(cacheKey, values[index]); });
    };
    /**
     * Utility function to help with migration.
     * @param newKey
     * @param value
     * @param storeAuthStateInCookie
     */
    BrowserCacheManager.prototype.migrateCacheEntry = function (newKey, value) {
        if (value) {
            this.setTemporaryCache(newKey, value, true);
        }
    };
    /**
     * Parses passed value as JSON object, JSON.parse() will throw an error.
     * @param input
     */
    BrowserCacheManager.prototype.validateAndParseJson = function (jsonValue) {
        try {
            var parsedJson = JSON.parse(jsonValue);
            /**
             * There are edge cases in which JSON.parse will successfully parse a non-valid JSON object
             * (e.g. JSON.parse will parse an escaped string into an unescaped string), so adding a type check
             * of the parsed value is necessary in order to be certain that the string represents a valid JSON object.
             *
             */
            return (parsedJson && typeof parsedJson === "object") ? parsedJson : null;
        }
        catch (error) {
            return null;
        }
    };
    /**
     * fetches the entry from the browser storage based off the key
     * @param key
     */
    BrowserCacheManager.prototype.getItem = function (key) {
        return this.browserStorage.getItem(key);
    };
    /**
     * sets the entry in the browser storage
     * @param key
     * @param value
     */
    BrowserCacheManager.prototype.setItem = function (key, value) {
        this.browserStorage.setItem(key, value);
    };
    /**
     * fetch the account entity from the platform cache
     * @param accountKey
     */
    BrowserCacheManager.prototype.getAccount = function (accountKey) {
        var account = this.getItem(accountKey);
        if (StringUtils.isEmpty(account)) {
            return null;
        }
        var parsedAccount = this.validateAndParseJson(account);
        var accountEntity = CacheManager.toObject(new AccountEntity(), parsedAccount);
        if (AccountEntity.isAccountEntity(accountEntity)) {
            return accountEntity;
        }
        return null;
    };
    /**
     * set account entity in the platform cache
     * @param key
     * @param value
     */
    BrowserCacheManager.prototype.setAccount = function (account) {
        var key = account.generateAccountKey();
        this.setItem(key, JSON.stringify(account));
    };
    /**
     * generates idToken entity from a string
     * @param idTokenKey
     */
    BrowserCacheManager.prototype.getIdTokenCredential = function (idTokenKey) {
        var value = this.getItem(idTokenKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedIdToken = this.validateAndParseJson(value);
        var idToken = CacheManager.toObject(new IdTokenEntity(), parsedIdToken);
        if (IdTokenEntity.isIdTokenEntity(idToken)) {
            return idToken;
        }
        return null;
    };
    /**
     * set IdToken credential to the platform cache
     * @param idToken
     */
    BrowserCacheManager.prototype.setIdTokenCredential = function (idToken) {
        var idTokenKey = idToken.generateCredentialKey();
        this.setItem(idTokenKey, JSON.stringify(idToken));
    };
    /**
     * generates accessToken entity from a string
     * @param key
     */
    BrowserCacheManager.prototype.getAccessTokenCredential = function (accessTokenKey) {
        var value = this.getItem(accessTokenKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedAccessToken = this.validateAndParseJson(value);
        var accessToken = CacheManager.toObject(new AccessTokenEntity(), parsedAccessToken);
        if (AccessTokenEntity.isAccessTokenEntity(accessToken)) {
            return accessToken;
        }
        return null;
    };
    /**
     * set accessToken credential to the platform cache
     * @param accessToken
     */
    BrowserCacheManager.prototype.setAccessTokenCredential = function (accessToken) {
        var accessTokenKey = accessToken.generateCredentialKey();
        this.setItem(accessTokenKey, JSON.stringify(accessToken));
    };
    /**
     * generates refreshToken entity from a string
     * @param refreshTokenKey
     */
    BrowserCacheManager.prototype.getRefreshTokenCredential = function (refreshTokenKey) {
        var value = this.getItem(refreshTokenKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedRefreshToken = this.validateAndParseJson(value);
        var refreshToken = CacheManager.toObject(new RefreshTokenEntity(), parsedRefreshToken);
        if (RefreshTokenEntity.isRefreshTokenEntity(refreshToken)) {
            return refreshToken;
        }
        return null;
    };
    /**
     * set refreshToken credential to the platform cache
     * @param refreshToken
     */
    BrowserCacheManager.prototype.setRefreshTokenCredential = function (refreshToken) {
        var refreshTokenKey = refreshToken.generateCredentialKey();
        this.setItem(refreshTokenKey, JSON.stringify(refreshToken));
    };
    /**
     * fetch appMetadata entity from the platform cache
     * @param appMetadataKey
     */
    BrowserCacheManager.prototype.getAppMetadata = function (appMetadataKey) {
        var value = this.getItem(appMetadataKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedMetadata = this.validateAndParseJson(value);
        var appMetadata = CacheManager.toObject(new AppMetadataEntity(), parsedMetadata);
        if (AppMetadataEntity.isAppMetadataEntity(appMetadataKey, appMetadata)) {
            return appMetadata;
        }
        return null;
    };
    /**
     * set appMetadata entity to the platform cache
     * @param appMetadata
     */
    BrowserCacheManager.prototype.setAppMetadata = function (appMetadata) {
        var appMetadataKey = appMetadata.generateAppMetadataKey();
        this.setItem(appMetadataKey, JSON.stringify(appMetadata));
    };
    /**
     * fetch server telemetry entity from the platform cache
     * @param serverTelemetryKey
     */
    BrowserCacheManager.prototype.getServerTelemetry = function (serverTelemetryKey) {
        var value = this.getItem(serverTelemetryKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedMetadata = this.validateAndParseJson(value);
        var serverTelemetryEntity = CacheManager.toObject(new ServerTelemetryEntity(), parsedMetadata);
        if (ServerTelemetryEntity.isServerTelemetryEntity(serverTelemetryKey, serverTelemetryEntity)) {
            return serverTelemetryEntity;
        }
        return null;
    };
    /**
     * set server telemetry entity to the platform cache
     * @param serverTelemetryKey
     * @param serverTelemetry
     */
    BrowserCacheManager.prototype.setServerTelemetry = function (serverTelemetryKey, serverTelemetry) {
        this.setItem(serverTelemetryKey, JSON.stringify(serverTelemetry));
    };
    /**
     * fetch throttling entity from the platform cache
     * @param throttlingCacheKey
     */
    BrowserCacheManager.prototype.getThrottlingCache = function (throttlingCacheKey) {
        var value = this.getItem(throttlingCacheKey);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        var parsedThrottlingCache = this.validateAndParseJson(value);
        var throttlingCache = CacheManager.toObject(new ThrottlingEntity(), parsedThrottlingCache);
        if (ThrottlingEntity.isThrottlingEntity(throttlingCacheKey, throttlingCache)) {
            return throttlingCache;
        }
        return null;
    };
    /**
     * set throttling entity to the platform cache
     * @param throttlingCacheKey
     * @param throttlingCache
     */
    BrowserCacheManager.prototype.setThrottlingCache = function (throttlingCacheKey, throttlingCache) {
        this.setItem(throttlingCacheKey, JSON.stringify(throttlingCache));
    };
    /**
     * Gets cache item with given key.
     * Will retrieve frm cookies if storeAuthStateInCookie is set to true.
     * @param key
     */
    BrowserCacheManager.prototype.getTemporaryCache = function (cacheKey, generateKey) {
        var key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
        if (this.cacheConfig.storeAuthStateInCookie) {
            var itemCookie = this.getItemCookie(key);
            if (itemCookie) {
                return itemCookie;
            }
        }
        var value = this.getItem(key);
        if (StringUtils.isEmpty(value)) {
            return null;
        }
        return value;
    };
    /**
     * Sets the cache item with the key and value given.
     * Stores in cookie if storeAuthStateInCookie is set to true.
     * This can cause cookie overflow if used incorrectly.
     * @param key
     * @param value
     */
    BrowserCacheManager.prototype.setTemporaryCache = function (cacheKey, value, generateKey) {
        var key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
        this.setItem(key, value);
        if (this.cacheConfig.storeAuthStateInCookie) {
            this.setItemCookie(key, value);
        }
    };
    /**
     * Removes the cache item with the given key.
     * Will also clear the cookie item if storeAuthStateInCookie is set to true.
     * @param key
     */
    BrowserCacheManager.prototype.removeItem = function (key) {
        this.browserStorage.removeItem(key);
        if (this.cacheConfig.storeAuthStateInCookie) {
            this.clearItemCookie(key);
        }
        return true;
    };
    /**
     * Checks whether key is in cache.
     * @param key
     */
    BrowserCacheManager.prototype.containsKey = function (key) {
        return this.browserStorage.containsKey(key);
    };
    /**
     * Gets all keys in window.
     */
    BrowserCacheManager.prototype.getKeys = function () {
        return this.browserStorage.getKeys();
    };
    /**
     * Clears all cache entries created by MSAL (except tokens).
     */
    BrowserCacheManager.prototype.clear = function () {
        var _this = this;
        this.removeAllAccounts();
        this.removeAppMetadata();
        this.browserStorage.getKeys().forEach(function (cacheKey) {
            // Check if key contains msal prefix; For now, we are clearing all the cache items created by MSAL.js
            if (_this.browserStorage.containsKey(cacheKey) && ((cacheKey.indexOf(Constants.CACHE_PREFIX) !== -1) || (cacheKey.indexOf(_this.clientId) !== -1))) {
                _this.removeItem(cacheKey);
            }
        });
    };
    /**
     * Add value to cookies
     * @param cookieName
     * @param cookieValue
     * @param expires
     */
    BrowserCacheManager.prototype.setItemCookie = function (cookieName, cookieValue, expires) {
        var cookieStr = encodeURIComponent(cookieName) + "=" + encodeURIComponent(cookieValue) + ";path=/;";
        if (expires) {
            var expireTime = this.getCookieExpirationTime(expires);
            cookieStr += "expires=" + expireTime + ";";
        }
        document.cookie = cookieStr;
    };
    /**
     * Get one item by key from cookies
     * @param cookieName
     */
    BrowserCacheManager.prototype.getItemCookie = function (cookieName) {
        var name = encodeURIComponent(cookieName) + "=";
        var cookieList = document.cookie.split(";");
        for (var i = 0; i < cookieList.length; i++) {
            var cookie = cookieList[i];
            while (cookie.charAt(0) === " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return decodeURIComponent(cookie.substring(name.length, cookie.length));
            }
        }
        return "";
    };
    /**
     * Clear an item in the cookies by key
     * @param cookieName
     */
    BrowserCacheManager.prototype.clearItemCookie = function (cookieName) {
        this.setItemCookie(cookieName, "", -1);
    };
    /**
     * Clear all msal cookies
     */
    BrowserCacheManager.prototype.clearMsalCookie = function (stateString) {
        var nonceKey = stateString ? this.generateNonceKey(stateString) : this.generateStateKey(TemporaryCacheKeys.NONCE_IDTOKEN);
        this.clearItemCookie(this.generateStateKey(stateString));
        this.clearItemCookie(nonceKey);
        this.clearItemCookie(this.generateCacheKey(TemporaryCacheKeys.ORIGIN_URI));
    };
    /**
     * Get cookie expiration time
     * @param cookieLifeDays
     */
    BrowserCacheManager.prototype.getCookieExpirationTime = function (cookieLifeDays) {
        var today = new Date();
        var expr = new Date(today.getTime() + cookieLifeDays * this.COOKIE_LIFE_MULTIPLIER);
        return expr.toUTCString();
    };
    /**
     * Gets the cache object referenced by the browser
     */
    BrowserCacheManager.prototype.getCache = function () {
        return this.browserStorage;
    };
    /**
     * interface compat, we cannot overwrite browser cache; Functionality is supported by individual entities in browser
     */
    BrowserCacheManager.prototype.setCache = function () {
        // sets nothing
    };
    /**
     * Prepend msal.<client-id> to each key; Skip for any JSON object as Key (defined schemas do not need the key appended: AccessToken Keys or the upcoming schema)
     * @param key
     * @param addInstanceId
     */
    BrowserCacheManager.prototype.generateCacheKey = function (key) {
        var generatedKey = this.validateAndParseJson(key);
        if (!generatedKey) {
            if (StringUtils.startsWith(key, Constants.CACHE_PREFIX) || StringUtils.startsWith(key, PersistentCacheKeys.ADAL_ID_TOKEN)) {
                return key;
            }
            return Constants.CACHE_PREFIX + "." + this.clientId + "." + key;
        }
        return JSON.stringify(key);
    };
    /**
     * Create authorityKey to cache authority
     * @param state
     */
    BrowserCacheManager.prototype.generateAuthorityKey = function (stateString) {
        var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString).libraryState.id;
        return this.generateCacheKey(TemporaryCacheKeys.AUTHORITY + "." + stateId);
    };
    /**
     * Create Nonce key to cache nonce
     * @param state
     */
    BrowserCacheManager.prototype.generateNonceKey = function (stateString) {
        var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString).libraryState.id;
        return this.generateCacheKey(TemporaryCacheKeys.NONCE_IDTOKEN + "." + stateId);
    };
    /**
     * Creates full cache key for the request state
     * @param stateString State string for the request
     */
    BrowserCacheManager.prototype.generateStateKey = function (stateString) {
        // Use the library state id to key temp storage for uniqueness for multiple concurrent requests
        var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString).libraryState.id;
        return this.generateCacheKey(TemporaryCacheKeys.REQUEST_STATE + "." + stateId);
    };
    /**
     * Sets the cacheKey for and stores the authority information in cache
     * @param state
     * @param authority
     */
    BrowserCacheManager.prototype.setAuthorityCache = function (authority, state) {
        // Cache authorityKey
        var authorityCacheKey = this.generateAuthorityKey(state);
        this.setItem(authorityCacheKey, authority);
    };
    /**
     * Gets the cached authority based on the cached state. Returns empty if no cached state found.
     */
    BrowserCacheManager.prototype.getCachedAuthority = function (cachedState) {
        var stateCacheKey = this.generateStateKey(cachedState);
        var state = this.getTemporaryCache(stateCacheKey);
        if (!state) {
            return null;
        }
        var authorityCacheKey = this.generateAuthorityKey(state);
        return this.getTemporaryCache(authorityCacheKey);
    };
    /**
     * Updates account, authority, and state in cache
     * @param serverAuthenticationRequest
     * @param account
     */
    BrowserCacheManager.prototype.updateCacheEntries = function (state, nonce, authorityInstance) {
        // Cache the request state
        var stateCacheKey = this.generateStateKey(state);
        this.setTemporaryCache(stateCacheKey, state, false);
        // Cache the nonce
        var nonceCacheKey = this.generateNonceKey(state);
        this.setTemporaryCache(nonceCacheKey, nonce, false);
        // Cache authorityKey
        this.setAuthorityCache(authorityInstance, state);
    };
    /**
     * Reset all temporary cache items
     * @param state
     */
    BrowserCacheManager.prototype.resetRequestCache = function (state) {
        var _this = this;
        // check state and remove associated cache items
        this.getKeys().forEach(function (key) {
            if (!StringUtils.isEmpty(state) && key.indexOf(state) !== -1) {
                _this.removeItem(key);
            }
        });
        // delete generic interactive request parameters
        if (state) {
            this.removeItem(this.generateStateKey(state));
            this.removeItem(this.generateNonceKey(state));
            this.removeItem(this.generateAuthorityKey(state));
        }
        this.removeItem(this.generateCacheKey(TemporaryCacheKeys.REQUEST_PARAMS));
        this.removeItem(this.generateCacheKey(TemporaryCacheKeys.ORIGIN_URI));
        this.removeItem(this.generateCacheKey(TemporaryCacheKeys.URL_HASH));
        this.removeItem(this.generateCacheKey(TemporaryCacheKeys.INTERACTION_STATUS_KEY));
    };
    BrowserCacheManager.prototype.cleanRequestByState = function (stateString) {
        // Interaction is completed - remove interaction status.
        if (stateString) {
            var stateKey = this.generateStateKey(stateString);
            var cachedState = this.getItem(stateKey);
            this.resetRequestCache(cachedState || "");
        }
    };
    BrowserCacheManager.prototype.cleanRequestByInteractionType = function (interactionType) {
        var _this = this;
        this.getKeys().forEach(function (key) {
            if (key.indexOf(TemporaryCacheKeys.REQUEST_STATE) === -1) {
                return;
            }
            var value = _this.browserStorage.getItem(key);
            var parsedState = BrowserProtocolUtils.extractBrowserRequestState(_this.cryptoImpl, value);
            if (parsedState.interactionType === interactionType) {
                _this.resetRequestCache(value);
            }
        });
    };
    BrowserCacheManager.prototype.cacheCodeRequest = function (authCodeRequest, browserCrypto) {
        var encodedValue = browserCrypto.base64Encode(JSON.stringify(authCodeRequest));
        this.setTemporaryCache(TemporaryCacheKeys.REQUEST_PARAMS, encodedValue, true);
    };
    /**
     * Gets the token exchange parameters from the cache. Throws an error if nothing is found.
     */
    BrowserCacheManager.prototype.getCachedRequest = function (state, browserCrypto) {
        try {
            // Get token request from cache and parse as TokenExchangeParameters.
            var encodedTokenRequest = this.getTemporaryCache(TemporaryCacheKeys.REQUEST_PARAMS, true);
            var parsedRequest = JSON.parse(browserCrypto.base64Decode(encodedTokenRequest));
            this.removeItem(this.generateCacheKey(TemporaryCacheKeys.REQUEST_PARAMS));
            // Get cached authority and use if no authority is cached with request.
            if (StringUtils.isEmpty(parsedRequest.authority)) {
                var authorityCacheKey = this.generateAuthorityKey(state);
                var cachedAuthority = this.getTemporaryCache(authorityCacheKey);
                parsedRequest.authority = cachedAuthority;
            }
            return parsedRequest;
        }
        catch (err) {
            throw BrowserAuthError.createTokenRequestCacheError(err);
        }
    };
    return BrowserCacheManager;
}(CacheManager));
export { BrowserCacheManager };
//# sourceMappingURL=BrowserCacheManager.js.map