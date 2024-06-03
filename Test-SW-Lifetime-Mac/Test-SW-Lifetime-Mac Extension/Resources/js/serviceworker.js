'use strict';

import {
    isSafari,
    isGecko,
    performsAsyncOperation,
    execRuntimeSendMessages
} from "./commonscript.js";

//#region VARS & CONSTS
const manifest = chrome.runtime.getManifest();

const INTERNAL_TESTALIVE_PORT = "DNA_Internal_alive_test";

const nextSeconds = 25;
const SECONDS = 1000;
const DEBUG = false;

var alivePort = null;
var isFirstStart = true;
var isAlreadyAwake = false;

var timer;
var firstCall;
var lastCall;

var wakeup = undefined;
var wsTest = undefined;
var wCounter = 0;

const starter = `-------- >>> ${convertNoDate(Date.now())} UTC - Service Worker with HIGHLANDER DNA is starting <<< --------`;
//#endregion


// SW is starting
console.log(starter);
start();

//chrome.alarms.onAlarm.addListener( function(alarm) {
//    console.log("Got alarm:", alarm.name)
//    if (alarm.name === "HLAlarm") {
//        updateJobs();
////        const notification = {
////            type: "basic",
////            iconUrl: "/ui/assets/images/eye-48.png",
////            title: "SW Lifetime",
////            message: "Service Worker is alive"
////        };
////        chrome.notifications.create(notification);
//    }
//});

//#region INSTALL EXT LISTENER
chrome.runtime.onInstalled.addListener((details) => {

    async () => await initialize();
    
    switch (details.reason) {
        case chrome.runtime.OnInstalledReason.INSTALL:
            console.log("This runs when the extension is newly installed.");
            start();
        break;

        case chrome.runtime.OnInstalledReason.UPDATE:
            console.log("This runs when an extension is updated.");
            start();
        break;

        default:
        break;
    }
});

//#endregion

//#region MESSAGES LISTENER
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    switch(request.action) {

        case "check-is-alive":
            performsAsyncOperation( function callback() {
                sendResponse("YES! I'm ALIVE!!");
            });
        break;

        case "set-popup-status":
            performsAsyncOperation( function callback() {
                console.log("[SW] ----POPUP IS OPEN:", request.popupstatus);

                sendResponse();
            });
        break;
    }

    return true;
});
//#endregion

//#region BROWSER WINDOWS LISTENERS

// Clears the Highlander interval when browser closes.
// This allows the process associated with the extension to be removed.
// Normally the process associated with the extension once the host browser is closed 
// will be removed after about 30 seconds at maximum (from Chromium 110 up, before was 5 minutes).
// If the browser is reopened before the system has removed the (pending) process, 
// Highlander will be restarted in the same process which will be not removed anymore.
chrome.windows.onRemoved.addListener( (windowId) => {
    wCounter--;          
    if (wCounter > 0) {
        return;
    }

    console.log("Browser is closing");
    
    // Browser is closing: no more windows open. Clear Highlander interval (or leave it active forever).
    // Shutting down Highlander will allow the system to remove the pending process associated with
    // the extension in max. 30 seconds (from Chromium 110 up, before was 5 minutes).
    if (wakeup !== undefined) {
        // If browser will be open before the process associated to this extension is removed, 
        // setting this to false will allow a new call to letsStart() if needed 
        // ( see windows.onCreated listener )
        isAlreadyAwake = false;

        // if you don't need to maintain the service worker running after the browser has been closed,
        // just uncomment the "# shutdown Highlander" rows below
        //clearInterval(wakeup);                      // # shutdown Highlander
        //wakeup = undefined;                         // # shutdown Highlander
        
    }

});

chrome.windows.onCreated.addListener( async (window) => {
    console.log("Browser is creating a new window");
    let w = await chrome.windows.getAll();
    wCounter = w.length;
    if (wCounter == 1) {
        updateJobs();
    }
});
//#endregion

//#region TABS LISTENERS
chrome.tabs.onCreated.addListener(onCreatedTabListener);
chrome.tabs.onUpdated.addListener(onUpdatedTabListener);
chrome.tabs.onRemoved.addListener(onRemovedTabListener);
//#endregion

// ------------------------------------------
// START
// ------------------------------------------

//#region START
async function start() {
    console.log("Hello world");
    startHighlander();
}
//#endregion

async function updateJobs() {
    console.log("In updateJobs() -> isAlreadyAwake=",isAlreadyAwake);
    if (isAlreadyAwake == false) {
        startHighlander();
    }
}

async function checkTabs() {
    let results = await chrome.tabs.query({});
    results.forEach(onCreatedTabListener);
}

async function initialize() {
    await checkTabs();
    updateJobs();
}

function onCreatedTabListener(tab) {
    if (DEBUG) console.log("Created TAB id=", tab.id);
}

function onUpdatedTabListener(tabId, changeInfo, tab) {
    if (DEBUG) console.log("Updated TAB id=", tabId);
}

function onRemovedTabListener(tabId) {
    if (DEBUG) console.log("Removed TAB id=", tabId);
}

function startHighlander() {
    if (wakeup === undefined) {
        isFirstStart = true;
        isAlreadyAwake = true;
        firstCall = Date.now();
        lastCall = firstCall;
        //timer = startSeconds*SECONDS;
        timer = 300;
                
        wakeup = setInterval(Highlander, timer);
        console.log(`-------- >>> Highlander has been started at ${convertNoDate(firstCall)}`);
    }
}
//#endregion

//#region HIGHLANDER
// ---------------------------
// HIGHLANDER FUNCTIONS
// ---------------------------
async function Highlander() {    

    const now = Date.now();
    const age = now - firstCall;
    lastCall = now;

    const str = `HIGHLANDER ------< ROUND >------ Time elapsed from first start: ${convertNoDate(age)}`;
  
    console.log(str)
    
    if (alivePort == null) {
        alivePort = chrome.runtime.connect({name:INTERNAL_TESTALIVE_PORT})

        alivePort.onDisconnect.addListener( (p) => {
            if (chrome.runtime.lastError){
                if (DEBUG) console.log(`(DEBUG Highlander) Expected disconnect error. ServiceWorker status should be still RUNNING.`);
            } else {
                if (DEBUG) console.log(`(DEBUG Highlander): port disconnected`);
            }

            alivePort = null;
        });
    }

    if (alivePort) {
                    
        alivePort.postMessage({content: "ping"});
        
        if (chrome.runtime.lastError) {                              
            if (DEBUG) console.log(`(DEBUG Highlander): postMessage error: ${chrome.runtime.lastError.message}`)                
        } else {                               
            if (DEBUG) console.log(`(DEBUG Highlander): "ping" sent through ${alivePort.name} port`)
        }            
    }         
      
    if (isFirstStart) { 
        isFirstStart = false;        
        setTimeout( () => {
            nextRound();
        }, 100);
    }
    
}

function convertNoDate(long) {
    var dt = new Date(long).toISOString()
    return dt.slice(-13, -5) // HH:MM:SS only
}

function nextRound() {
    clearInterval(wakeup);
    timer = nextSeconds*SECONDS;
    wakeup = setInterval(Highlander, timer);    
}
//#endregion
