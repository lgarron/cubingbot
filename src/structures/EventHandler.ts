import { ClientEvents } from "discord.js";

export class EventHandler{
    private _handlerFunction: (...args: any) => any;
    private _eventHandled: keyof ClientEvents;

    constructor(event: keyof ClientEvents, code: (...args: any) => any) {
        this._eventHandled = event;
        this._handlerFunction = code;
    }

    get handler(): (...args:any) => any {
        return this._handlerFunction;
    }

    get event(): keyof ClientEvents {
        return this._eventHandled;
    }
}