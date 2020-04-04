chrome.webRequest.onCompleted.addListener(function(details) {
    if(details.url.indexOf("spaceListLayout.html") >= 0) {
	    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "restoreVisibility" })
        });
    } else if(details.url.indexOf("ttalkrooms?") >= 0) {
	    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "enterRoom" })
        });
    }
},  { urls: ["*://tmax.teespace.net/*"], }, [] );


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(details.url.indexOf("talkFooter.js") >= 0 || details.url.indexOf("talkContent.js") >=0 ) {
/*
//          아래 코드는 injection을 하긴 하지만, html에서 불러온 js와 다른 namespace에서 동작한다.
//          즉, manifest의 content_scripts와 같은 수준에서 동작한다.
//          그리고 이럴경우 같은 페이지의 dom에는 접근 가능하지만 자바스크립트 VM끼리는 격리되어있다.
//          우리는 같은 VM에서 동작하는 js가 필요하므로 아래 코드를 쓸 수 없다.
            chrome.tabs.executeScript({
                file: 'talkFooter.js'
            });
*/
            //talkFooter.js에 대한 리퀘스트는 막고 injtected.js에서 html에 직접 수정된 talkFooter를 넣어주자.
            return {cancel: true}
            //만약 리퀘스트를 리다이렉션 하고싶다면 아래 코드를 쓰면된다.
            //그런데 이러면 https를 http에 보내면 mixed context로 block된다.
            //그러니까, 우리상황에선 못쓴단 얘기지.
            //return {redirectUrl: talk_footer_base_url + talk_footer_name };
        }
    },
    {
        urls: ["*://tmax.teespace.net/*"],
        types: ["script"]
    },
    ["blocking"]
);