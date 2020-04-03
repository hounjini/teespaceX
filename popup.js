
function initView(rooms) {
    $("#roomlist").text("")
    for(i = 0; i < rooms.length; i++) {
        var color = "blue"
        if(rooms[i].visible == "hide") {
            color = "red"
        }
        $("#roomlist").append("<p id='roomlist_" + i + "' class='room_list_element'>" + i + ". " + rooms[i].name + " [<span style='color:" + color + "'>" + rooms[i].visible + "</span>]</p>")
        $("#roomlist_" + i).data("name", rooms[i].name)
        $("#roomlist_" + i).data("no" , i)
        $("#roomlist_" + i).data("id", rooms[i].id)
    }
    
    $(".room_list_element").click(function() {
        var name = $(this).data("name")
        var no = $(this).data("no")
        var id = $(this).data("id")

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", target : id }, function(response) {
      	        var color = "blue"
       	        if(response.visible == "hide") {
                    color = "red"
                }
        	    $("#roomlist_" + no).html("<p id='roomlist_" + no + "' class='room_list_element'>" + no + ". " + name + " [<span style='color:" + color + "'>" + response.visible + "</span>]</p>")
                $("#roomlist_" + no).data("name", name)
                $("#roomlist_" + no).data("no", no)
                $("#roomlist_" + no).data("id", id)
        	});
        });
    })
}

function onWindowLoad() {
	$(document).ready(function(){
		$(document).bind("contextmenu", function(e) {
			return false;
		});
	});

	$(document).bind('selectstart',function() {return false;}); 
	$(document).bind('dragstart',function(){return false;});

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
