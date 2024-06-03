'use strict';

export const isGecko = chrome.runtime.getURL('').startsWith('moz-extension://');
export const isSafari = chrome.runtime.getURL('').startsWith('safari-web-extension://');

export function performsAsyncOperation(callback) {
    return new Promise( (resolve) => {
        resolve(callback());
    });
}

export function execRuntimeSendMessages(obj) {
    return new Promise( (resolve) => {
        chrome.runtime.sendMessage(obj, function(data) {
            if (chrome.runtime.lastError) {}
            resolve(data);
        });
    });
}
