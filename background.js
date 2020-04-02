chrome.webRequest.onCompleted.addListener(function(details) {
    if(details.url.indexOf("spaceListLayout.html") >= 0) {
	    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "restoreVisibility" })
        });
    }
},  { urls: ["<all_urls>"] }, [] );
