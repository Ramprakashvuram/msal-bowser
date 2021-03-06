import { AuthenticationResult, AuthError, EndSessionRequest } from "@azure/msal-common";
import { EventType } from "./EventType";
import { InteractionType } from "../utils/BrowserConstants";
import { PopupRequest, RedirectRequest, SilentRequest, SsoSilentRequest } from "..";
export declare type EventMessage = {
    eventType: EventType;
    interactionType: InteractionType | null;
    payload: EventPayload;
    error: EventError;
    timestamp: number;
};
export declare type EventPayload = PopupRequest | RedirectRequest | SilentRequest | SsoSilentRequest | EndSessionRequest | AuthenticationResult | null;
export declare type EventError = AuthError | Error | null;
export declare type EventCallbackFunction = (message: EventMessage) => void;
