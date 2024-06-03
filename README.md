# Test-SW-Lifetime

##### Testing a method to extend the Service Worker life of a browser extension indefinitely

###### What is Test-SW-Lifetime

All browsers render Service Workers inactive after a certain period of time (5 seconds, 30 seconds, 5 minutes), which depends on the type of browser and its version.

After this period of time, whatever service worker becomes inactive and no longer responds to any events or features such as timeouts and intervals.


**Test-SW-Lifetime** is an extension created to test (on any browser) a method for *extending the life of a Service Worker indefinitely*.


This repo contains, in different folders, the XCode projects for testing on Mac and iOS, as well as the extension to install and test in other browsers (Chromium and Firefox).

**Note**: the extension code is identical for all browsers.

###### References

[GitHub - radiolondra/ServiceWorker-Highlander: MV3 Extension: Service Worker awakened once stays alive forever](https://github.com/radiolondra/ServiceWorker-Highlander)

[GitHub - radiolondra/ServiceWorker-Highlander-DNA: MV3 Extension: Service Worker stays alive forever](https://github.com/radiolondra/ServiceWorker-Highlander-DNA)

[javascript - Persistent Service Worker in Chrome Extension - Stack Overflow](https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension/75082732#75082732)
