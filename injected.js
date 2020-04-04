let visibility = []

/* html에 직접 talkFooter를 넣자. */
//https://medium.com/@radu.dita/chrome-extension-when-to-use-content-scripts-and-injected-scripts-238563dce8af
//https://developer.chrome.com/extensions/manifest/web_accessible_resources
var script_addon = document.createElement('script'); 
script_addon.src = chrome.extension.getURL('talk.addon.js');
(document.head||document.documentElement).appendChild(script_addon);

var script_talkfooter = document.createElement('script'); 
script_talkfooter.src = chrome.extension.getURL('talkFooter.200404.js');
(document.head||document.documentElement).appendChild(script_talkfooter);

var script_talkContent = document.createElement('script'); 
script_talkContent.src = chrome.extension.getURL('talkContent.200404.js');
(document.head||document.documentElement).appendChild(script_talkContent);


function setVisibility(id, status) {
    visibility[id] = status
}

function getVisibility(id) {
    if(visibility[id]) {
        return visibility[id];
    }
    return "unknown"
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "toggle") {
        var each_room = $(".lnbSpaceList")
        for(i = 0; i < each_room.length; i++) {
            if($(each_room[i]).attr('id') == request.target) {
                $(each_room[i]).toggle()
                if($(each_room[i]).is(":visible")) {
                    setVisibility($(each_room[i]).attr('id'), "show")
                } else {
                    setVisibility($(each_room[i]).attr('id'), "hide")
                }
                sendResponse({res : "finished", visible : getVisibility($(each_room[i]).attr('id')) });
            }
        }
    } else if(request.action == "restoreVisibility") {
        $(".lnbSpaceList").each(function() {
            if(getVisibility($(this).attr('id')) == "hide") {
                $(this).hide()
            } else {
                $(this).show()
            }
        })
    } else if(request.action == "getRooms") {
        var ret = []
        var each_room = $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName")
        for(i = 0; i < each_room.length; i++) {
            var _name = $(each_room[i]).text()
            var _visible = "show"
            var _id = $(each_room[i]).parent().parent().parent().attr('id')
            if(getVisibility(_id) != "unknown") {
                _visible = getVisibility(_id)
            } else {
                setVisibility(_id, "show")
            }
            ret[i] = {name : _name, visible : _visible, id : _id}
        }
        sendResponse({res : "finished", rooms : ret });
    }
});

