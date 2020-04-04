
function initView(rooms) {
    $("#roomlist").text("")
    for(i = 0; i < rooms.length; i++) {
        var visible_color = "blue"
        if(rooms[i].visible == "hide") {
            visible_color = "red"
        }
        
        var encryption_color = "blue"
        if(rooms[i].encryption == "encrypted") {
            encryption_color = "red"
        }

        $("#roomlist").append("<p id='roomlist_line_" + i + "' class='roomlist_line'>" + i + ". " + rooms[i].name + " [<span id='roomlist_status_" + i + "' class='roomlist_status'>" + rooms[i].visible + "</span>] [<span id='roomlist_encryption_" + i + "' class='roomlist_encryption'>" + rooms[i].encryption + "</span>]</p>")
        $("#roomlist_line_" + i).data("name", rooms[i].name)
        $("#roomlist_line_" + i).data("no" , i)
        $("#roomlist_line_" + i).data("id", rooms[i].id)
        $("#roomlist_status_" + i).css('color', visible_color)
        $("#roomlist_encryption_" + i).css('color', encryption_color)
    }
    
    $(".roomlist_status").click(function() {
        var name = $(this).parent().data("name")
        var no = $(this).parent().data("no")
        var id = $(this).parent().data("id")

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_visibility", target : id }, function(response) {
      	        var color = "blue"
       	        if(response.visible == "hide") {
                    color = "red"
                }
        	    $("#roomlist_status_" + no).text(response.visible)
                $("#roomlist_status_" + no).css('color', color)
        	});
        });
    })
    
    $(".roomlist_encryption").click(function() {
        var name = $(this).parent().data("name")
        var no = $(this).parent().data("no")
        var id = $(this).parent().data("id")

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_encryption", target : id }, function(response) {
      	        var color = "blue"
       	        if(response.encryption == "encrypted") {
                    color = "red"
                }
        	    $("#roomlist_encryption_" + no).text(response.encryption)
                $("#roomlist_encryption_" + no).css('color', color)
        	});
        });
    })
}

function onWindowLoad() {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	chrome.tabs.sendMessage(tabs[0].id, { action: "getRooms" }, function(response) {
    	    if(response.rooms) {
    	        initView(response.rooms)
            }
    	});
    });
        
    
/* toggle */
/*
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
    });
*/

}

window.onload = onWindowLoad;
