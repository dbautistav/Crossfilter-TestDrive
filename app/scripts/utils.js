"use strict";

import Q from "q";


export const LOGGER_LEVEL = {
    ERROR: "error",
    INFO: "info",
    LOG: "log",
    WARN: "warn"
};

export const errorHandler = loggerProvider("ERROR!", LOGGER_LEVEL.ERROR);

export function loggerProvider(caller, method) {
    const level = method ? method : LOGGER_LEVEL.LOG;

    return (response) => {
        return Q().then(() => {
            console[level](caller, response);
            return response;
        });
    };
}

export function responseLoggerProvider(caller, method) {
    const label = caller ? `@${caller}` : "";
    return loggerProvider(`response ${label}`, method);
}
