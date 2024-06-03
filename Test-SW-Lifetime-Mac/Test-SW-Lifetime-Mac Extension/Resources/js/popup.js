
'use strict';

import {
    isSafari,
    isGecko
} from "./commonscript.js";

document.addEventListener('visibilitychange', () => {
    console.log("Visibility status:", document.visibilityState)
    if (document.visibilityState === "visible") {
        chrome.runtime.sendMessage({action:"set-popup-status", popupstatus:true});
    } else {
        chrome.runtime.sendMessage({action:"set-popup-status", popupstatus:false});
    }
});

if (!isSafari) {
    chrome.runtime.sendMessage({action:"set-popup-status", popupstatus:true});
}

function checkWorkerLives() {
    
    chrome.runtime.sendMessage({action: 'check-is-alive'}).then( (isAlive) => {
        if (typeof isAlive !== 'string' || isAlive === null) {
            console.log("Worker is death! ", isAlive)
            $("#checkresult").val("Worker is death!" + isAlive);
        } else {
            console.log("Worker is alive! ", isAlive);
            $("#checkresult").val("Worker is alive!" + isAlive);
        }
    });
    
}


// ---------------------------------------------------------
// DOM
// ---------------------------------------------------------

$('#isswalive').click(function(e) {
    checkWorkerLives();
});

$('#resumesw').click(function(e) {
    resumeDeadWorker();
});
