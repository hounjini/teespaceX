// "use strict";

const talkContent = (function() {
    let container = null;
    let messageContainer = null;
    let tempMessageContainer = null;
    let defaultImg = "./res/bi_favicon.ico";
    let gotoLastButton = null;
    function _scrollToMsg(msgId){
        var container = $("#talk-content");
        var messageLayout = $("talk-message-layout[data-message-id=" + msgId + "]");
        var halfH = container.height() / 2;
        var cur, loc; // 현재 스크롤 위치
        cur = container.scrollTop();
        // 클라이언트 화면단(0,0) 기준으로 어디에 위치하고 있는지 : 위에 있으면 더 올라가야해(-)
        loc = messageLayout.offset().top;
        let tmp = cur + loc - halfH <=0 ? 10 : cur + loc - halfH;
        container.animate(
            {
                scrollTop: tmp,
                //msgId에 해당하는 메시지에 스크롤 가져다 두기
        },10);
    }
    // get first 20 Messages
     function _getFirstMessageListFromServer() {    	
     	talkServer2.ttalk_getMessageList(0,20)	        
 	        .then(function(res) {
 	        	// 2번째인자 : isPrepend, false(아래로 붙인다)
 	        	let messageList = res.data.dto["MSG_LIST"];
 	        	let messageCount = messageList.length;
 	        	
 	        	if (messageCount) {
 	        		for (let i = 0; i < messageCount; i++) {
 					     messageList[i]["IS_HEAD"] = true;
 					     messageList[i]["MSG_STATE"] = "success";
 					}
 					   
 			        for (let _index = 0; _index <messageCount; _index++) {
 			      	// header를 넣을지 체크한 후 talkData.messageList에 최종적으로 넣는다
 			          _addMessages(false, messageList[_index]);
 			        }
 	        	}
				
 	        })
 	        .catch(function(err) {})
 	        .then(function() {
 	            let messageList = mobx.toJS(talkData.messageList);

 	            Top.Loader.stop();
 	            //읽지 않은 메시지 시작 부분으로 scroll 이동
 	            if($('talk-system-message-layout.talk-new-message').length>0){
 	            	$("#talk-content").animate({scrollTop :  $("#talk-content").scrollTop()+ $('talk-system-message-layout.talk-new-message').position().top},500)
 	            }
 //	            if (messageList.length) {
 //	                displayDate(messageList[0]["CREATE_TIME"] * 1);
 //	            } else {
 //	                displayDate(new Date().getTime() * 1);
 //	            }
         }); 
     }

//    async function _getFirstMessageListFromServer() {    	
//        const res = await talkServer2.ttalk_getMessageList(0,20);	        
//            // 2번째인자 : isPrepend, false(아래로 붙인다)
//        _getMessagePostProcess(res.data.dto["MSG_LIST"], false);
//    }

    function getMoreMessages() {
        let firstMessageTime = "0";
//        console.log('here is getmoremessages()');
        if (talkData.messageList.length) firstMessageTime = talkData.messageList[0]["CREATE_TIME"];

        talkServer2.ttalk_getMessageList(firstMessageTime,20).then(function(res) {
            if (!res.data.dto["HAS_MORE"]) {
                $(container).off("scroll", infiniteScroll);
            }

            var content = $("#talk-content")[0];
            var prevHeight = content.scrollHeight;
            
            // isPrepend : true(위로 붙인다)
            _getMessagePostProcess(res.data.dto["MSG_LIST"], true);
            
            var currHeight = content.scrollHeight;
            content.scrollTo(0, currHeight - prevHeight);
        });
    }
    
	 // 일단 is_head: true, msg_state : success 처리해주는 곳
	 // addmessage로 간다
	 // addMessage에서 is_head를 일단 true로 설정해주는데 이곳과 중복이라 삭제해놓음
    
    function _getMessagePostProcess(messageList, isPrepend) {
    	const messageCount = messageList.length;
        if (messageCount) {
    		for (let i = 0; i < messageCount; i++) {
			     messageList[i]["IS_HEAD"] = true;
			     messageList[i]["MSG_STATE"] = "success";
			}
            _addMessages(isPrepend, messageList);
            // for (let i = 0; i < messageCount; i++) {
            //     messageList[i]["IS_HEAD"] = true;
            //     messageList[i]["MSG_STATE"] = "success";
            // }
           
            // if (isPrepend) {
            //     //for (let index = messageCount - 1; index >= 0; index--) {
            //         // header를 넣을지 체크한 후 talkData.messageList에 최종적으로 넣는다
            //         //_addMessages(isPrepend, messageList[index]);
            //     //}
            //     _addMessages(isPrepend, messageList);
            // } else {
            //     // for (let _index = 0; _index <messageCount; _index++) {
            //     //     // header를 넣을지 체크한 후 talkData.messageList에 최종적으로 넣는다
            //     //     _addMessages(isPrepend, messageList[_index]);
            //     //     //console.log(_index);
            //     // }
            //     _addMessages(isPrepend, messageList);
            // }
        }
    }
    
    
    /**
     * 	@description     data.messageList에 메세지 추가, timeline 추가
     * 	is_head true/false 설정해주고 timeline도 넣어주는 곳, talkData.messageList에 message를 넣어준다
     */

    function _addMessages(isPrepend, messageList) {
        let _talkData$messageList;
        let insertIndex = -1;

        if (messageList.constructor !== Array) {
            messageList = new Array(messageList);
        }

        let msgCount = messageList.length;
        let originMsgCount = talkData.messageList.length;
        let timeInsertedMessageList = new Array();
        timeInsertedMessageList.push(messageList[0]);

        if (msgCount) {
            // msgCount가 1개일 때 안 탄다
            for (var i = 1; i < msgCount; i++) {
                // header 조건 : 날짜, 보낸사람, 분 같아야 함
                // 날짜 다르면 time line 추가
                var prevMsg = messageList[i - 1];
                var currMsg = messageList[i];

                if (isSameDate(prevMsg, currMsg)) {
                    if (isSameSender(prevMsg, currMsg) && isSameMinute(prevMsg, currMsg)) {
                        currMsg["IS_HEAD"] = false;
                    } else {
                        currMsg["IS_HEAD"] = true;
                    }

                    timeInsertedMessageList.push(currMsg);
                } else {
                    timeInsertedMessageList.push({
                        CREATE_TIME: currMsg["CREATE_TIME"],
                        MSG_BODY: currMsg["CREATE_TIME"],
                        MSG_TYPE: "timeLine"
                    });
                    currMsg["IS_HEAD"] = true;
                    timeInsertedMessageList.push(currMsg);
                }
            }
        }
        
        msgCount = timeInsertedMessageList.length; // 후 처리, 경계선 체크

        // 이미 메시지를 받아온 경우
        if (originMsgCount && msgCount) {
            var _prevMsg = isPrepend ? timeInsertedMessageList[msgCount - 1] : talkData.messageList[originMsgCount - 1];

            var _currMsg = isPrepend ? talkData.messageList[0] : timeInsertedMessageList[0];

            var timeLineIndex = isPrepend ? msgCount : 0;
            insertIndex = isPrepend ? 0 : originMsgCount;

            if (isSameDate(_prevMsg, _currMsg)) {
                if (isSameSender(_prevMsg, _currMsg) && isSameMinute(_prevMsg, _currMsg)) {
                    _currMsg["IS_HEAD"] = false;
                } else {
                    _currMsg["IS_HEAD"] = true;
                }
            } else {
                timeInsertedMessageList.splice(timeLineIndex, 0, {
                    CREATE_TIME: _currMsg["CREATE_TIME"],
                    MSG_BODY: _currMsg["CREATE_TIME"],
                    MSG_TYPE: "timeLine"
                });
                _currMsg["IS_HEAD"] = true;
            }
        } 
        // 실제 insert

        (_talkData$messageList = talkData.messageList).splice.apply(
            _talkData$messageList,
            [insertIndex, 0].concat(timeInsertedMessageList)
        );
    }

    function _remove(messageList) {
        var count = messageList.length;

        for (var i = 0; i < count; i++) {
            var tempId = messageList[i]["TEMP_ID"];
            var timerId = $("talk-message-layout[data-temp-id='" + tempId + "']").attr("data-timer-id");
            clearTimeout(timerId * 1); // console.log("[MESSAGE CLEAR TIMER ID] : ", timerId)

            $("talk-message-layout[data-temp-id='" + tempId + "']").remove();
        }
    }

    function _replaceOgImg(imgTag, title) {
        if (title.toLowerCase() === "youtube") {
            $(imgTag).attr("src", "https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png");
        } else if (title.includes("네이버") || title.toLowerCase().includes("naver")) {
            $(imgTag).attr("src", "https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png");
        } else {
            $(imgTag).remove();
        }
    }
    
    function _isReply(msgId) {
    	let targetMessage = talkData.messageList.find((elem) => {
    		return elem["MSG_ID"] === msgId;
    	}) 
    	
    	if (targetMessage) {
    		let targetAttachment = targetMessage["ATTACHMENT_LIST"];
        	for (let i=0; i<targetAttachment.length;i++) {
        		if (targetAttachment[i]["ATTACHMENT_TYPE"] === "reply") {
        			return true
        		}
        	}
    	}
    	return false;
    }

    function _renderAttachment(targetMessage, targetAttachment, messageLayout, i) {
    	// i : 몇 번째 attachment인지 확인
    	// updateMessageElement가 여러 번 불리므로 이미 그려져 있는지 먼저 체크하고 그린다
        
        let msgId = targetAttachment["MSG_ID"];
        let attachmentId = targetAttachment["ATTACHMENT_ID"];
        let isMyMessage = talk.isMyMessage(targetMessage)
        
    	switch (targetAttachment["ATTACHMENT_TYPE"]) {
    		case "file": {
    			if ($('.message__attachment-layout[data-attachment-id="'+ targetAttachment["ATTACHMENT_ID"] + '"]').length){
    				return
    			}
    			talkFileUpload.renderFile(targetMessage, targetAttachment, messageLayout);      
    			
				document.querySelector('[data-message-id="'+msgId+'"] .message__content-body__items').style.maxWidth = "15rem";
				document.querySelector('[data-message-id="'+msgId+'"] .message__attachment-container').style.maxWidth = "13.75rem";
	            // 파일 첨부된 메시지가 답장인 경우 화살표 없애기
				if (talkContent.isReply(msgId) && !targetMessage["MSG_BODY"]) {
	            	document.querySelector('[data-message-id="'+msgId+'"] .message__content-body__content').style.display = "none"
	            }
				break;
    		}

    		case "fileList": {
    			if ($('div[data-attachment-id="'+ targetAttachment["ATTACHMENT_ID"]+'"]').length) {
    				return
    			}
    			
    			// 파일 묶어보내기인 경우, 먼저 layout을 그린다
    			let _isFirst = !document.querySelector('[data-message-id="'+msgId+'"] .message__attachment-container').children.length;
    			if (_isFirst){
    				talkFileUpload.renderBundleLayout(targetMessage, targetAttachment, messageLayout);
    				// 파일 첨부된 메시지가 답장인 경우 화살표 없애기
    				if (talkContent.isReply(msgId) && !targetMessage["MSG_BODY"]) {
    	            	document.querySelector('[data-message-id="'+msgId+'"] .message__content-body__content').style.display = "none"
    	            }
    				
    				if (talkUtil.isMobile()) {
    					document.querySelector('[data-message-id="'+msgId+'"] .message__content-body').style.maxWidth = "unset";
    				}
    			} else {
    				talkFileUpload.renderBundledFileItem(targetMessage, targetAttachment, messageLayout, i);
    			}
    			
    			break;
    		}    
    		case "reply" : {
    			talkRenderer.component.renderReply(targetMessage, targetAttachment);
    			break;
    		}
    		case "og": {
    			if (document.querySelector('.attachment__og-container[data-attachment-id="'+ targetAttachment["ATTACHMENT_ID"] + '"]')) {
    				return
    			}
                talkRenderer.component.renderOg(targetMessage,targetAttachment);
				break;
    		}
    		case "startMeeting": {
    			if (document.querySelector('[data-attachment-id="'+ attachmentId + '"]')){
    				return
    			}
    			
    			talkRenderer.component.renderStartMeeting(targetAttachment, isMyMessage);
    			messageLayout.querySelector('.message__sub-menu__item[data-menu="reply"]').remove();
    			
    			break;
    		}
    		case "endMeeting" : {
    			if (document.querySelector('[data-attachment-id="'+ attachmentId + '"]')){
    				return
    			}
    			talkRenderer.component.renderEndMeeting(targetAttachment);
    			messageLayout.querySelector('.message__sub-menu__item[data-menu="reply"]').remove();
    			
    			break;
    		}
            case "schedule" : {
                break;
            }
        }

        
    }
    
    function _loadImageEvent(targetMessage, messageLayout, className) {
    	// 마지막 5개 메세지에 대하여 image load시 마지막으로 스크롤한다.
    	if (talkData.messageList.indexOf(targetMessage) >= talkData.messageList.length-5) {
    		(function() {
//                var img = $(".message__image-file", messageLayout);
    			var img = $(className, messageLayout)

    			var _loop3 = function _loop3(i) {
                        $(img[i]).one("load", function() {
                            talkContent.gotoLastMessage(); 
                        });
                    };
                    
                if (img.length) {
                    for (var i = 0; i < img.length; i++) {
                        _loop3(i);
                    }
                }
            })();
    	}
    }
	
    function isMyClicked(targetMessage) {
        if (targetMessage["MSG_TYPE"] === "create" || targetMessage["MSG_TYPE"] === "file") {
            var reactionUserList = targetMessage["REACTION_USER_LIST"];

            if (!reactionUserList) {
                return false;
            }

            for (var i = 0; i < reactionUserList.length; i++) {
                if (reactionUserList[i] === talkData.myInfo.userId) {
                    return true;
                }
            }
        }

        return false;
    }

    function _changeMessage(msgId, msg) {
        var targetIndex = talkData.messageList.findIndex(function(element) {
            return element["MSG_ID"] === msgId;
        });
        talkData.messageList.splice(targetIndex, 1, msg);
    }

    function _updateMessage(msgId, key, value) {
        let targetMessage = talkData.messageList.find(function(elem) {
            return elem["MSG_ID"] === msgId;
        });
        if (targetMessage) {
        	targetMessage[key] = value;
        }
    }

    function _updateUnreadMsg(msgId, userId) {
        let targetMessage = talkData.messageList.find(function(elem) {
            return elem["MSG_ID"] === msgId;
        });
        
        if (targetMessage && targetMessage["UNREAD_USER_COUNT"] > 0) {
	        let idx = targetMessage["UNREAD_USER_LIST"].indexOf(userId)
	        if (idx !== -1) {
	            targetMessage["UNREAD_USER_LIST"].splice(idx, 1);
	            targetMessage["UNREAD_USER_COUNT"] = targetMessage["UNREAD_USER_LIST"].length;
	        }
        }
    }
    
    function _updateUnreadMessages(msgId, userId) {
    	let flag = false;
    	let idx;
    	
    	for (let i=talkData.messageList.length-1;i>=0;i--) {
    		if (talkData.messageList[i]["MSG_ID"] === msgId) {
    			flag = true;
    		}
    		if (flag && talkData.messageList[i]["UNREAD_USER_COUNT"] > 0) {
    			idx = talkData.messageList[i]["UNREAD_USER_LIST"].indexOf(userId)
    			if (idx !== -1) {
	    			talkData.messageList[i]["UNREAD_USER_LIST"].splice(idx, 1);
	    			talkData.messageList[i]["UNREAD_USER_COUNT"] = talkData.messageList[i]["UNREAD_USER_LIST"].length;
    			}
    		}
    		// read처리 모두 하면 return
    	}
    }
    
    function _updateAttachment(msgId, value) {
        var targetMessage = talkData.messageList.find(function(elem) {
            return elem["MSG_ID"] === msgId;
        });
        targetMessage["ATTACHMENT_LIST"].push(value);
    }

    function _updateTempMessage(tempId, key, value) {
        var targetMessage = talkData.tempMessageList.find(function(elem) {
            return elem["TEMP_ID"] === tempId;
        });
        targetMessage[key] = value;
    }

    function _isIntoView(elem) {
        var contentLayout = $("#talk-content");

        var _elem = $(elem);

        return 0 < _elem.position().top + _elem.height() && _elem.position().top < contentLayout.height();
    }

    // TODO : ver.2에서 timeline 없어지는거 확실하면 삭제
//    function displayDate(unixtime) {
//        time = new Date(unixtime);
//        today = new Date();
//
//        if (today.getMonth() === time.getMonth()) {
//            if (today.getDate() === time.getDate()) {
//                var dsp = "오늘";
//            } else if (today.getDate() === time.getDate() + 1) {
//                var dsp = "어제";
//            } else {
//                var dsp = talkUtil.getCustomFormatDate(time);
//            }
//        } else {
//            var dsp = talkUtil.getCustomFormatDate(time);
//        }
//
//        $("#talk-timeline").text(dsp);
//    }

    function updateTimeScreen() {
        var messageList = $("talk-message-layout");
        var idx = 0;

        while (idx < messageList.length) {
            if (_isIntoView(messageList[idx])) {
                var targetMessage = talkData.messageList.find(function(elem) {
                    return elem["MSG_ID"] === messageList[idx].getAttribute("data-message-id");
                }); // error 해결 임시코드 -> 모바일에서만 발생하는 error

//                if (targetMessage) {
//                    displayDate(talkUtil.parseInt(targetMessage["CREATE_TIME"]));
//                } //            	displayDate(talkUtil.parseInt(talkData.messageList.find(function (elem) { return elem["MSG_ID"] === messageList[idx].getAttribute("data-message-id") })["CREATE_TIME"]));

                break;
            }

            idx++;
        }
    }

    function _onCopyClick(messageId) {
        var targetMessage = talkData.messageList.find(function(elem) {
            return elem["MSG_ID"] === messageId;
        });

        if (targetMessage) {
            var text = talkContent.msgToPlainText(targetMessage["MSG_BODY"])
            var dummy = document.createElement("textarea");
            document.body.append(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
        TeeToast.open({text: '복사 되었습니다.'});
    }

    function _hasText(str) {
    	// text가 있으면 text 길이만큼 0 아닌 number반환, 이모티콘/멘션 등등이 있으면 이를 제외한 나머지 text 길이 반환
        return !str ? false : str.replace(/<(.*?)>/g, "").length;
    } // url만 있는 경우도 복사 가능

    function _hasOnlyaEmoticon(msgBody) {
    	// text가 없이 이모티콘만 있을 때
        if (msgBody && !_hasText(msgBody)) {
            let tagArray = msgBody.match(/<(.*?)>/g);

            if (tagArray) {
                let targetEmoticonArray = tagArray.filter(function(elem) {
                    if (elem.indexOf('"data-type":"emoticon"') !== -1) {
                        return elem;
                    }
                });
                if (targetEmoticonArray.length ===1) {
                	return true;
                }
            }
        }
        return false;
    }
    
    function _isOnlyLink(msgBody) {
        // 좋은 코드는 아닌 것 같아 추후 수정 예정
        return msgBody && msgBody.includes('<{"data-type":"url","data-url":"') && msgBody.includes('"}>')
            ? true
            : false;
    }
    
    // 메시지 생성시 msg_body_text 만들어주는 함수
    // [TODO]파일 등 다른 attachment도 이리로 가져와야한다.
    function userInOutToMsgBodyText(inputText, msgType, userId){
        let _user, result='';
    	switch (msgType) {
	    	case "userEnter":
	    		_user = talkUtil.getUserNick(userId);
    			if (inputText.includes(',')) inputText = inputText.split(',');
                else inputText = [inputText];
    			result = `${_user}님이 ${talkUtil.getUserNick(inputText[0])}님`
				if (inputText.length>1) {
				    for (let i=1;i<inputText.length;i++) {
	    			    result += `, ${talkUtil.getUserNick(inputText[i])}님`;
	    		    }
				}
				result += `을 초대하였습니다.`;
	    		break;
	    	case "userLeave":
	    		_user = talkUtil.getUserNick(userId);
                result = `${_user}님이 나갔습니다.`; 
                break;
        }
        return result;
    }
    
    function textToMsgBodyText(inputText){
        inputText = inputText.replace(/<{"data-type":"emoticon".+?}>/g, '(이모티콘)');
		inputText = inputText.replace(/<.*?\"data-user-name\":\"(.*?)\"}>/g, "(@$1)");
		inputText = inputText.replace(/<.*?\"data-url\":\"(.*?)\"}>/g, "($1)");
        inputText = inputText.replace(/&nbsp;/g, " ");
        inputText = inputText.replace(/&amp;/g, "&");
        return inputText;
    }

    function AttachmentToMsgBodyText(MessengerLastMsgInfo){
        let lastMsgAttachmentList = MessengerLastMsgInfo["ATTACHMENT_LIST"];
        let lastMsgAttachmentListLength = lastMsgAttachmentList.length;
        let idx,lastMsgAttachmentType = null;
        let fileCount = 0;
        for(idx=0;idx<lastMsgAttachmentListLength;idx++){
            lastMsgAttachmentType = lastMsgAttachmentList[idx]["ATTACHMENT_TYPE"];
            switch(lastMsgAttachmentType){
                case "file":
                case "fileList":
                    fileCount++;
                    break;
                case 'startMeeting':
                    return 'TeeMeeting을 시작합니다';
                case 'endMeeting':    
                    return 'TeeMeeting을 종료합니다';
                default:
                    break;
            }
        }
        return fileCount >0 ? "(파일" + fileCount +"개) " : " "; 
    }
    // function _convertToMsgBodyText(inputText, msgType, userId) {


    function _convertToMsgBodyText(MessengerLastMsgInfo) { 
    if(MessengerLastMsgInfo ==null) return null;
    let inputText = MessengerLastMsgInfo.MSG_BODY || null;
    let msgType = MessengerLastMsgInfo["MSG_TYPE"] || null;
    let userId = MessengerLastMsgInfo["USER_ID"] || null;
    let AttachmentInfo ='', plainText='';

    //메시지의 내용이 없을 때 --> 메시지 내용은 신경을 쓰지 않아도 될떄
    //////////user inout 시스템 메시지일 때/////////////////////
       if(msgType === "userLeave" || msgType === "userEnter"){
           return userInOutToMsgBodyText(inputText, msgType, userId);
       }
       /////삭제된 메시지일때///////
       if(msgType === "delete"){
        return '삭제된 메시지입니다.';
        }
      //Attachment가 있다면 AttachmentToMsgBodyText 호출
       //let MessengerLastMsgInfo = targetMessengerInfo["LAST_MESSAGE"];
       if(MessengerLastMsgInfo.ATTACHMENT_LIST!==undefined &&
         MessengerLastMsgInfo.ATTACHMENT_LIST!==null && 
         MessengerLastMsgInfo.ATTACHMENT_LIST.length!==0) 
        AttachmentInfo = AttachmentToMsgBodyText(MessengerLastMsgInfo);
        //////메시지의 내용이 있을 때 ----> 메시지 내용을 신경 써야할 때
       ///메시지 내용 있으면 textToMsgBodyText(inputText) 호출 없으면 '' 담는다 
        plainText = (inputText == null ? '' : textToMsgBodyText(inputText));
        return AttachmentInfo + plainText;
    }
    
    // 메시지 copy할 때 쓰는 함수
    function _msgToPlainText(inputText) {
    	inputText = inputText.replace(/<{"data-type":"emoticon".+?}>/g, '')
		inputText = inputText.replace(/<.*?\"data-user-name\":\"(.*?)\"}>/g, "@$1")
		inputText = inputText.replace(/<.*?\"data-url\":\"(.*?)\"}>/g, "$1")
    	return inputText;
    }

    function _gotoLastMessage() {
    	// talk.js에서 initMobx할 때 부른다. 아직 talkContent.init이 실행되어 container가 있기 전
    	container = document.querySelector('#talk-content')
        container.scrollTop = container.scrollHeight;
    }
    
    function _gotoMessage(event,msgId) { 
    	// scroll 함수 바꿈
       let messageLayout = document.querySelector('[data-message-id="' + msgId + '"]');
	       
       if (!messageLayout) {
    	   TeeToast.open({text:`최근 ${talkData.messageList.length} 개 메시지에 없는 메시지입니다`});
    	   return;
       }
       messageLayout.scrollIntoView({
    	   behavior:"smooth",
    	   block : "center"
       });
       
	    let content = document.querySelector("[data-message-id='" + msgId + "'] .message__content-body__content")	    
        
	    let _font = document.createElement('font');
        _font.classList.add("talk-original__message")
	    
        // 이미 css 처리된 경우
        let isColored=false;
        if (document.querySelector("[data-message-id='" + msgId + "'] font.talk-original__message")) {
        	isColored = true;
        }
        
        // 답장일 때는 화살표 img 다음에 font tag 붙여준다
        if (!isColored) {
    	    if (content.firstElementChild && content.firstElementChild.classList.contains("talk__reply-arrow")) {
    	    	let temp = content.cloneNode(true); // 자식 노드 함께 복사
    	    	talkUtil.removeChildrenNodes(content);
    	    	content.appendChild(temp.children[0]); // temp에서 content로 이동, child 1개 줄어든다
    	    	
    	    	_font.insertAdjacentHTML('beforeend',temp.innerHTML);
    	    	
    	    } else {
    	    	_font.insertAdjacentHTML('beforeend',content.innerHTML);
    	    	talkUtil.removeChildrenNodes(content);
    	    }

            content.appendChild(_font)
        }
        
        let targetNode = event.currentTarget;
        
        // 효과준거 원래대로 돌아오기
        setTimeout(function() {
        	let _click = (function(currentTarget, msgId, content) {
        	    let handler = function(event) {
        	    	if (currentTarget && currentTarget === event.target.closest('.message__reply-container')) {
        	    		document.body.removeEventListener('click', handler);
        	    		return
        	    	}
        	    	
        	    	let temp = content.cloneNode(true);
        	    	talkUtil.removeChildrenNodes(content);
        	    	// 답장일 때는 2개(화살표랑 원래 메시지), 답장 아닐 때는 1개
        	    	// 화살표를 붙여준다
        	    	if (temp.children.length > 1) {
        	    		content.appendChild(temp.children[0]);
        	    	}	
    	    		// temp.children[0]인 font 안에 있는 것들을 붙여준다
        	    	content.insertAdjacentHTML("beforeend", temp.children[0].innerHTML);        	    	
        	    	document.body.removeEventListener('click', handler);
        	    };
        	    
        	    return handler;
        	})(targetNode, msgId, content);

        	document.body.addEventListener('click', _click, false);
        }, 100);
    }
    /**
     * @description     판별 함수들
     */

    function isScrollEnd() {
    	const container = $("#talk-content");
        return hasScroll() && Math.abs(container.height() + container.scrollTop() - container[0].scrollHeight) <= 1;
    }
    function hasScroll() {
    	const container = $("#talk-content");
    	if(container&&container[0])
    	{
            return container && container[0].scrollHeight > container[0].clientHeight;
    	}
    	else
    	{
    		return null;
    	}
    }

    function isIntoView(elem) {
        return 0 < _elem.position().top + _elem.height() && _elem.position().top < container.height();
    }

    function isSameDate(prevMsg, currMsg) {
        return new Date(prevMsg["CREATE_TIME"] * 1).getDate() === new Date(currMsg["CREATE_TIME"] * 1).getDate();
    }

    function isSameMinute(prevMsg, currMsg) {
        return new Date(prevMsg["CREATE_TIME"] * 1).getMinutes() === new Date(currMsg["CREATE_TIME"] * 1).getMinutes();
    }

    function isSameSender(prevMsg, currMsg) {
        return prevMsg["USER_ID"] === currMsg["USER_ID"];
    }

    function infiniteScroll() {    	
        // 스크롤 상단이면서, 스크롤이 있는경우
        if (container.scrollTop === 0 && hasScroll() && talkData.messageList.length) {
            getMoreMessages();
        }
    }

    function _talk_parseFile(attachBody) {
        attachBody = attachBody.replace(/[\<\>]/g, "");
        attachBody = attachBody.replace(/'/g,'"');
        
        try {
            return JSON.parse(attachBody);
        } catch (err) {
            return;
        }
    } 
   
    function _isChatMessage(msgType) {
    	switch (msgType) {
	        case "create":
	        case "file":
	        	
            case "delete":
            	return true;
        	default:
        		return false;
    	}
    }
    

    function _removeTempMessage(tempId) {
        var targetIndex = talkData.tempMessageList.findIndex(function(element) {
            return element["TEMP_ID"] === tempId;
        });

        if (targetIndex !== -1) {
            talkData.tempMessageList.splice(targetIndex, 1);
        }
    }
    
    // handle Message, sendMessage로 받은 메시지 render 처리 + 
    function _receiveMessage(message) {
        before_receiveMessage(message)
    	// wwms 안될 때를 대비한다
    	// 메시지가 이미 그려져있는 경우 이후 처리하지 않는다
    	let msgId = message["MSG_ID"];
    	
    	let targetMessage = talkData.messageList.find(function(elem) {
    		return elem["MSG_ID"] === msgId;
    	});
    	
    	let messageLayout = document.querySelector('[data-message-id="'+msgId+'"]');
    	let _talkWindow = document.querySelector('#talk');
    	
    	if (!targetMessage || targetMessage === -1) {
    		// 아직 안받아온 메시지 : 아직 메시지 레이아웃 없어, 그 방 보고 있을 때 render Message
        	if (_talkWindow && talk.isSameRoom(message["CH_ID"])) {
    			talkContent.getMessagePostProcess([message], false);
    			
            	//여기서 messagepost하고 tmepmessage지울꺼에요
            	if (message["TEMP_ID"]) {
                	talkContent.removeTempMessage(message["TEMP_ID"]);
            	}
        	}
        	
        	// talk focus시 읽음 처리
        	let _activeElement = document.activeElement;
        	if (_talkWindow && _talkWindow.contains(_activeElement)) {
                talkServer2.ttalk_readOneMessage(talkData.talkId, msgId, userManager.getLoginUserId())
        	}  		
    		
    	} else if (messageLayout) {
    		// 이미 있는 메시지 && 메시지 레이아웃 있는 경우
			talkContent.updateMessage(msgId, "MSG_STATE", "success");
    	}
    }
    
    // idx : 로컬에서 파일 첨부시(묶어보내기 아닐시) 파일 하나당 메세지 하나가 생성되어야 한다
    function _sendMessage(targetMessage, idx) {
        talkServer2
            .createMessage(targetMessage)
            .then(function(response) {
                if (response.data.dto["RESULT_CODE"] === "OK") {
                    targetMessage["MSG_STATE"] = "success";
                    
                    let message = response.data.dto;
                    
                    // 두번째 인자 : isHandleMessage(lnb 갱신 때문에 필요)
                    talkContent.receiveMessage(message);
                    
                    
                    // test하려는데 websocket안 될 때 주석 풀고 테스트하기
//                    talkContent.getMessagePostProcess([message], false);
                    
                    // 로컬에서 첨부는 storageManager에 업로드해야
                    if (talkData.fileChooserList.length) {
                    	talkFileUpload.uploadFiles(message["MSG_ID"], idx);
                    }
                    
                    // 문자열에 link 있는지 확인
                    talkUtil.createLinkAttachment(message["MSG_ID"], message["MSG_BODY"]);                    
                    
                } else {
                    targetMessage["MSG_STATE"] = "fail";
                }
            })
            .catch(function() {
                targetMessage["MSG_STATE"] = "fail";
            })
        	.then(function() {
                localStorage.removeItem("teetalk_" + talkData.talkId);
        		talkData.selectedReply.set(null);
        		talkData.selectedEmoticonTag.set(null);
                document.querySelector('#talk-footer__emoticon-button').classList.remove("talk-img__filter");
                document.querySelector('#talk-footer__mention-button').classList.remove("talk-img__filter");
        		if (!$('#talk-footer__input').html()){
        			$('#talk__message-counter').css('display', 'none')
        		}
        	})
    }
    
    function _showGotoLastButton() {
    	const gotoLastButton = document.querySelector('#goto-last-button');
    	
    	if (hasScroll()) {
    		isScrollEnd() ? gotoLastButton.style.display = "none" : gotoLastButton.style.display = "flex";            				
        }
    }
    
    function _deleteMessage(msgId) {
    	if (document.querySelector('top-dialog#talk__delete-message-dialog')) {
    		document.querySelector('top-dialog#talk__delete-message-dialog').remove()
    	} 

    	let _openCallback = function() {
			talkRenderer.dialog.renderDeleteDialog();
			
			// delete button click event
			let _actionBtnClick = (function(msgId) {
				let handler = function() {
					talkServer2
		                .deleteMessage(talkData.selectedRoomId.get(), msgId)
		                .then(function(response) {
		                	let targetMessage = talkData.messageList.find(function(elem) {
	                            return elem["MSG_ID"] === msgId;
	                        });
		                	
		                	// file attachment 있으면 삭제하기
		                	// drive meta도 지워준다
		        			let _length = targetMessage["ATTACHMENT_LIST"].length;
		        			if (_length) {
		        				let targetAttachment;
		        				let parsedData;
		        				let attachBody;
		        				let fileId;
		        				let serviceUrl = _workspace.fileUrl + "DriveFile?action=Delete";
		        	            let _driveChId = workspaceManager.getChannelList(getRoomIdByUrl(), "CHN0006");
		        	            let inputDTO = [];
		        	            
		        				for (let i=0;i<_length;i++) {
		        					targetAttachment = targetMessage["ATTACHMENT_LIST"][i];                						
		        					if (targetAttachment["ATTACHMENT_TYPE"].includes('file')) {
		        						attachBody = targetAttachment["ATTACHMENT_BODY"].replace(/'/g,'"');
		        						parsedData = JSON.parse(attachBody.substring(1,attachBody.length-1));
		        						fileId = parsedData["data-file-id"];
		        						talkServer2.deleteStorageFile(talkFileUpload.deleteFileMetaFormat(fileId));
		        						
		        						// drive meta 삭제
		        						 inputDTO.push({
		        			            	workspace_id: talkData.workspaceId,
		        			                ch_id: _driveChId,
		        			                file_id: fileId,
		        			                file_parent_id: _driveChId,
		        			                is_folder: "false"
		        			            });
		        					}
		        				}
        			            
		        				// 한꺼번에 보내기
        			            axios.post(serviceUrl, {
        			                dto: {
        			                    user_id: talkData.myInfo.userId,
        			                    teeDriveDtoList: inputDTO
        			                }
        			            });
		        			}
		        			
		                    if (response.data.dto["RESULT_CODE"] === "OK") {
		                    	targetMessage["MSG_TYPE"] = 'delete';
		                    	TeeToast.open({text: '삭제 되었습니다.'});
		                    } else {
		                    	TeeToast.open({text: '삭제 실패했습니다.'});
		                    }
		                    
		                })
		                .catch(function() {
		                	TeeToast.open({text: '삭제 실패했습니다.'});
		                })
						.finally(function() {
							 Top.Dom.selectById("talk__delete-message-dialog").close(true);
						})
				}
				return handler;
				
			})(msgId)
			
			// addEvent
			let btn = document.querySelector("#talk-dialog__action-btn");
			btn.addEventListener("click", _actionBtnClick);
    	};
    	
		// 메시지 삭제 팝업 생성
		talkRenderer.dialog.createTopDialog("talk__delete-message-dialog", "22.5rem", "10.875rem", "", "talk__dialog-layout", () => {
			_openCallback()
		});

		// dialog open
    	Top.Dom.selectById("talk__delete-message-dialog").open(); 
//    	TeeAlarm.open({title: "", content: "hi"}); 
    }
    
    function _clickRetryButton(e) {    	
    	if (document.querySelector('top-dialog#talk__resend-message-dialog')) {
    		document.querySelector('top-dialog#talk__resend-message-dialog').remove()
    	} 
    	
    	// create message를 했지만 file upload, create attachment가 실패한 경우
        let msgId, tempId;
        let messageLayout = e.target.closest("talk-message-layout")
        msgId = messageLayout.getAttribute("data-message-id");
        tempId = messageLayout.getAttribute("data-temp-id");
        
        let _openCallback = function(msgId,tempId) {
        	talkRenderer.dialog.renderResendDialog();
        	
        	// retry button click event
        	let _actionBtnClick = (function(msgId, tempId) {
            	let handler = function() {
        			if (msgId) {
	                	// 하나도 업로드되지 않았을 때
	                	if (talkData.fileChooserList.length > 0) {
	                		talkFileUpload.uploadFiles(msgId)
	                	}
	                } // message가 생성되지 않은 경우
	                else {
	                    if (tempId) {
	                        let targetMessage = talkData.tempMessageList.find(function(temp) {
	                            return temp["TEMP_ID"] === tempId;
	                        });
	                        
	                        targetMessage["MSG_STATE"] = "sending";
	                        talkContent.sendMessage(targetMessage,false);
	                    }
	                }
        			
        			Top.Dom.selectById("talk__resend-message-dialog").close(true);
        		}
        		return handler;
        		
            })(msgId, tempId)
             
        	// add event
            let btn = document.querySelector("#talk-dialog__action-btn");
        	btn.addEventListener("click", _actionBtnClick);
        }
        
    	// 메시지 재전송 팝업
		talkRenderer.dialog.createTopDialog("talk__resend-message-dialog", "24.375rem", "auto", "", "talk__dialog-layout", () => {
			_openCallback(msgId,tempId)
		})
				
        // dialog open
    	Top.Dom.selectById("talk__resend-message-dialog").open();
    }
    
    function _clickCancelButton(e) {
        var tempId = $(e.target)
	        .closest("talk-message-layout")
	        .attr("data-temp-id");

        _removeTempMessage(tempId);
    }
    
    function _clickEventHandler(e) {
    	// 답장 꺼지게 하기
    	if (talkData.selectedReply.value) {
    		talkData.selectedReply.set(null);
    	}
    	
        let userId = $(e.target).closest("talk-message-layout").attr("data-user-id");
    	// TODO : 더 깔끔하게 정리할 수 있을까?!
    	// mention, 답장 대상 메시지 클릭시 이벤트는 해당 메시지 id를 따로 부착하여야 하므로 create시 add event
    	if (e.target.classList.contains("message__photo") || e.target.classList.contains("message__photo-container")) {
    		talk.talk__setProfilePopup(userId);
    	} else if (e.target.classList.contains("message__content-header__name")) {
            talk.talk__setProfilePopup(userId);
    	} else if (e.target.classList.contains("fail-message__retry-button") || e.target.parentNode.classList.contains("fail-message__retry-button")) {
    		_clickRetryButton(e)
    	} else if (e.target.parentElement.classList.contains("fail-message__cancel-button") || e.target.classList.contains("fail-message__cancel-button")) {
    		_clickCancelButton(e)
    	} else if (e.target.classList.contains("talk-file-message__arrow")) {
    		talkMessageConverter.unfoldImage(e)
    	} 
    	// 이미지 파일인 경우 file-info 흰박스 클릭하면 미리보기 호출
    	// 이미지 아닌 파일은 태그 생성시 onclick attr로 context menu를 연다
    	// TODO : 파일명 클릭시 미리보기 호출(이미지만), 나중에는 다른 파일도
    	else if (e.target.classList.contains("file-info")) {
    		let _unfoldArrow = e.target.nextElementSibling;
    		if (_unfoldArrow.style.display !== "none") {
    			talkMessageConverter.unfoldImage(e)
    		}
    	} else if (e.target.classList.contains("file-message__file-name") || e.target.classList.contains("file-message__file-extension")) {
    		let _unfoldArrow = $(e.target).closest('div.file-info')[0].nextElementSibling;
    		if (_unfoldArrow .style.display !== "none") {
    			talkMessageConverter.unfoldImage(e)
    		}
    	}
    }
    
    // 자식 요소에 포인터가 와도 발생
    function _mouseoverEventHandler(e) {
    	//  currentTarget : 이벤트가 바인딩된 div 요소를 반환
    	const msgId = e.currentTarget.getAttribute("data-message-id");
		let subMenuContainer = document.querySelector('[data-message-id="'+msgId+'"] .message__sub-menu-container');
    	let msgSuccessState = document.querySelector('[data-message-id="'+msgId+'"] .message__content-body__state--success');
    	// 성공 메시지에 대해서만 수행
    	if (msgSuccessState && msgSuccessState.style.display !== "none" && subMenuContainer) {
    		subMenuContainer.style.visibility = "visible";
    	}
    }
    
    function _mouseoutEventHandler(e) {
    	const msgId = e.currentTarget.getAttribute("data-message-id");
    	let subMenuContainer = document.querySelector('[data-message-id="'+msgId+'"] .message__sub-menu-container');
    	if (subMenuContainer) {
    		subMenuContainer.style.visibility = "hidden";
    	}
    }
    
    // TODO : init 부분 정리하고 object.freeze로 바꾸기
    return {
        init: function init() {
        	// TODO : 새로운 버전의 file drop down 함수 생성 후 삭제 
//            $(function() {
//                // 파일 드롭 다운
//                talkContent.fileDropDown();
//            }); // file drag & drop 가능 영역
        	//search에서 space 이동할 때에 리셋해야하는 부분 여기서 초기화
        	 talkData.searchedMsgList=null;
        	 talkData.IdxOfsearchedMsg= 0;
        	 talkData.curCategoryName= "전체";
        	
        	
        	// 변수 정의
        	container = document.querySelector("#talk-content");
        	
    		talkRenderer.structure.renderContent();
        	
        	setTimeout(function() {
	        	// 스크롤 맨 아래로 내리는 동작
	            const gotoLastButton = document.querySelector('#goto-last-button');
	            gotoLastButton.style.display = "none";
	            gotoLastButton.addEventListener("click", _gotoLastMessage)
        	},1);
        	setTimeout(function() {
        		
        		let wrapper = document.querySelector('#talk-content-main')
                wrapper.classList.add("dnd__container")
                wrapper.setAttribute("data-dnd-app", "talk");
                // .addClass("talk__drop-zone");
                
                
                // scroll 위치에 따라 맨마짐가으로 가는 버튼 show or hide
                const contentContainer = document.querySelector('#talk-content');
                contentContainer.addEventListener("scroll", _showGotoLastButton)
                
                // 메시지에 붙이는 click 이벤트 이 곳으로!
                contentContainer.addEventListener("click", _clickEventHandler, false);
                
                messageContainer = document.querySelector(".content__complete-message-container");
                tempMessageContainer = document.querySelector(".content__temp-message-container");
        	},1);
        },
        
        // TODO : object.freeze로 정리하기
        getFirstMessageListFromServer: function() {
        	_getFirstMessageListFromServer();
        },
        loadImageEvent: function loadImageEvent(targetMessage, messageLayout, className) {
        	_loadImageEvent(targetMessage, messageLayout, className)
        },
        replaceOgImg: function replaceOgImg(imgTag, title) {
            _replaceOgImg(imgTag, title);
        },
        addFileMeta: function addFileMeta(fileChooserList) {
            _talk_addFileMeta(fileChooserList);
        },
//        fileDropDown: function fileDropDown() {
//            _fileDropDown();
//        },
        hasText: function (str) {
            return _hasText(str);
        },
        isChatMessage: function (msgType){
        	return _isChatMessage(msgType)
        },
        isOnlyLink: function isOnlyLink(msgBody) {
            return _isOnlyLink(msgBody);
        },
        talk_parseFile: function talk_parseFile(attachBody) {
            return _talk_parseFile(attachBody);
        },
        // 이모티콘 하나뿐인 메시지인지
        hasOnlyaEmoticon: function (msgBody) {
            return _hasOnlyaEmoticon(msgBody);
        },
        // 로컬에서 첨부시 파일 하나당 메세지 하나 생성되어야해서, 필요할 때 idx 넣어준다
        sendMessage: function sendMessage(targetMessage, idx) {
            return _sendMessage(targetMessage, idx);
        },
        receiveMessage(message){
        	_receiveMessage(message)
        },
        updateTempMessage: function updateTempMessage(msgId, key, value) {
            _updateTempMessage(msgId, key, value);
        },
        changeMessage: function changeMessage(msgId, msg) {
            _changeMessage(msgId, msg);
        },
        updateMessage: function updateMessage(msgId, key, value) {
            _updateMessage(msgId, key, value);
        },
        updateUnreadMsg: function updateUnreadMsg(msgId, userId) {
            _updateUnreadMsg(msgId, userId);
        },
        updateUnreadMessages : function updateUnreadMessages(msgId, userId) {
        	_updateUnreadMessages(msgId, userId)
        },
        updateAttachment: function updateAttachment(msgId, value) {
            _updateAttachment(msgId, value);
        },
        removeTempMessage: function removeTempMessage(tempId) {
            _removeTempMessage(tempId);
        },
        
        // 일단 is_head: true, msg_state : success 처리해주는 곳
        // addmessage로 간다
        // addMessage에서 is_head를 일단 true로 설정해주는데 이곳과 중복이라 삭제해놓음
        getMessagePostProcess: function(targetMessageArray, isPrepend) {
        	_getMessagePostProcess(targetMessageArray, isPrepend);
        },
        // is_head true/false 설정해주고 timeline도 넣어주는 곳, talkData.messageList에 message를 넣어준다
        // mobx타고 talkRenderer.component.renderMessage(messageList, isPrepend, isCompleteContainer)로 간다
        addMessages: function(isPrepend, messageList){
        	_addMessages(isPrepend, messageList)
        },
        
        renderAttachment : function(targetMessage, targetAttachment, messageLayout, i) {
        	_renderAttachment(targetMessage, targetAttachment, messageLayout, i)
        },
        
        deleteMessage: function(msgId) {
        	_deleteMessage(msgId)
        },
        onCopyClick : function(messageId) {
        	_onCopyClick(messageId);
        },
        infiniteScroll : function() {
        	infiniteScroll();
        },
        getMoreMessages : function(){
        	return getMoreMessages();
        },
        
        // event
        mouseoverEventHandler : function(e) {
        	_mouseoverEventHandler(e)
        },
        mouseoutEventHandler : function(e) {
        	_mouseoutEventHandler(e)
        },
        clickRetryButton: function(e) {
        	_clickRetryButton(e)
        },
        remove: function(messageList) {
        	_remove(messageList);
        },
        updateTimeScreen : function() {
        	updateTimeScreen();
        },
        gotoLastMessage: function() {
            _gotoLastMessage();
        },
        gotoMessage: function(event,msgId) {
            _gotoMessage(event,msgId);
        },
        convertToMsgBodyText(targetMessengerInfo) {
        	return _convertToMsgBodyText(targetMessengerInfo);
        },
        msgToPlainText: function(msgBody) {
        	return _msgToPlainText(msgBody);
        }, 
        isReply: function(msgId){
        	return _isReply(msgId)
        },
        
        ///chk
        removeTempMessage:function(msgId){
        	_removeTempMessage(msgId);
        },
        scrollToMsg:function(msgId){
            _scrollToMsg(msgId);
        },
        hasScroll:function(){
            hasScroll();
        },
        getMoreMessagesForSearch: function(msgIdOfKeyword, isFlag){
            _getMoreMessagesForSearch(msgIdOfKeyword, isFlag);
        }
    };
})();
