const talkFooter = (function() {
    let sendButton = null;
    let textArea = null;
    let container = null;
    let savedRange = null;
    let savedSelection = null;
    let defaultFormat = "<p><br></p>";
    let _fileChooser = null;
    let typingTimer = null;

    ////////////////////////////////////////////////////////////////////
    //file을 클릭했을 때 전용 이벤트 핸들링 함수
    function onFooterButtonClick_file() {
    	document.querySelector('#talk-footer__file-button').style.color = "#6C56E5";
        // 파일 업로드 버튼 누르면 비워진다
        talkData.fileChooserList.splice(0, talkData.fileChooserList.length);
        //TODO : 이런 data를 따로 모은다.
        let renderData = [
//            {
//                "text" : (talkUtil.isMobile()) ? "T-Drive에 저장" : "T-Drive에서 첨부",
//                "onclick" : function(){
//                    OPEN_TDRIVE({
//                        buttonFn1                  : undefined, 
//                        buttonFn2                  : undefined, 
//                        channel_id                 : talkData.talkId,
//                         
//                        preventMultiSelect         : false,
//                        filteringFileExtensionList : [],
//                         
//                        selectedFile               : {},
//                        
//                        successCallback: function(fileMeta) {
//                          // 여러 개 파일을 선택하면 successCallback이 파일 수만큼 온다
//                          // 파일 업로드를 위한 파일 메타 수정 후 talkData.fileChooserList에 넣어준다
//                          talkData.fileChooserList.replace(Array.from(fileMeta));
//                          let targetMessage = talkFileUpload.createTempFileMessage(0);
//                           
//                          let inputData = {
//                                 "ATTACHMENT_TYPE":"file",
//                                 "ATTACHMENT_BODY": talkMessageConverter.storageMetaFormatToAttachmentFormat(fileMeta.storageFileInfo),
//                                 "STATUS":"create",
//                                 "ATTACHMENT_FILE" : null,
//                                 "ROOM_ID" : talkData.selectedRoomId.get()
//                         }
//                     
//                          targetMessage["ATTACHMENT_LIST"].push(inputData)
//                           talkContent.sendMessage(targetMessage, 0);
//                        },
//                        cancelCallback : function(){
//                            notiFeedback("파일 업로드에 실패하였습니다.")
//                        }
//
//                     })
//                }
//            },
            {
//                text: (talkUtil.isMobile()) ? "내 기기에 저장" : "내 로컬에서 첨부",
                text: "내 로컬에서 첨부",
            	onclick: function() {
                	talkFileUpload.openFileChooser(true);
                }
                	
            }
//            ,
//            {
//            	"text" : "T-Drive 저장 후 첨부",
//            	"onclick" : function(){
//            		
//            	}
//            },
        ];

        let margin = 4;
        // footer-wrapper 패딩값
        let _left1 = 10;
        let _left2 = document.querySelector("#talk-footer__file-button").offsetLeft;
        
        let css = {
        		//margin --> 14로 바꿈
            left: _left1 + _left2 + "px",
            bottom: document.querySelector("#talk-footer-wrapper").offsetHeight + margin + "px"
        };
        if (talkUtil.isMobile()) {
            css["left"] = "20px";
        }
        
        const _beforeOpen = function() {
        	document.querySelector('#talk-footer__file-button').classList.add("talk-img__filter");
        }
        
        const _afterClose = function() {
        	document.querySelector('#talk-footer__file-button').classList.remove("talk-img__filter");
        }
        
        talkContextMenu.render(renderData, "#talk", css, _afterClose, _beforeOpen);
    }

    // map에 추가, 삭제 될 때 text 만들어 주는 함수
    mobx.observe(talkData.typingUserList, function(change) {
        //        console.log(change);
        let text = Array.from(talkData.typingUserList.keys())
            .map(function(userId) {
                return userId === talkData.myInfo["userId"] ? "" : talkUtil.getUserNick(replyInfo["origin-msg-owner"]);
            })
            .join(", ");

        if (text.length) {
            text += " is typing...";
        }

        $("#footer__typing-text").text(text);
    });

    // // 해당 user의 timer 업데이트
    // function updateTypingTimer(userId) {
    //     let targetUser = talkData.typingUserList.get(userId);
    //     if (!targetUser) {

    //         // 서버 가서 받아오기 (동기 처리)
    //         targetUser = talkServer.getUserInfo(userId);
    //         talkData.userInfoList.set(userId, targetUser);
    //     }

    //     if (targetUser["TIMER"]) {
    //         clearTimeout(targetUser["TIMER"]);
    //     }

    //     targetUser["TIMER"] = setTimeout(function () {
    //         console.log("끝!");
    //     }, 2000);
    // }

    function clear() {
        let footer = $("#talk-footer__input");
        if (footer.length) {
            $("#talk-footer__input")
                .html("")
                .focus();
            _updateButtonStatus(_isTextAreaEmpty());
        }
    }

    function isImagePasted(dataTransfer){
        if(dataTransfer.items && dataTransfer.items.length){
            const length = dataTransfer.items.length;
            if(dataTransfer.items[0].kind === "file" && dataTransfer.items[0].type.split("/")[0] === "image"){
             return dataTransfer.items[0].getAsFile();
            }
            // html을 복사해도 파일을 만들어 반환하는 과정
            // TODO : crossdomain 문제 
            // else if(dataTransfer.items[0].kind === "string" && dataTransfer.items[0].type.split("/")[1] === "html"){
            //  return null;      
            // }
        }
        return null;
    }

    function pasteText(pastedText){
        // IE용
        if (document.all || (!!window.MSInputMethodContext && !!document.documentMode)) {
            document.execCommand("paste", false, pastedText)
       } else {
           document.execCommand("insertTEXT", false, pastedText);
       }

       // 커서를 끝으로 옮기기
       focusAndSelection();
       if (window.getSelection) {
           //non IE Browsers
           let el = document.getElementById("talk-footer__input");
           let range = document.createRange();
           let selection = window.getSelection();
           let endLine = el.childNodes[el.childNodes.length - 1];
           // not empty인 div tag에 쓸 때
           try {
               range.setStart(endLine, endLine.textContent.length);
           } catch (e) {
               // empty인 div tag에 쓸 때
               range.setStart(endLine, 1);
           }
           range.collapse(true);
           selection.removeAllRanges();
           selection.addRange(range);
       }
    }

    let pasteImage = function (pastedImage){
        let fileChooserList = [pastedImage];
        let fileCount = fileChooserList.length;
        if (fileCount) {
    		let temp=[];
            for (let i = 0; i < fileCount; i++) {
                if (talkFileUpload.isFileNameLong(fileChooserList[i]["name"])) {
                	TeeToast.open({text: '파일명 70자 초과 파일은 업로드할 수 없습니다.'});
                } else {
                	talkData.fileChooserList.push(fileChooserList[i]);
                	temp.push(fileChooserList[i]) // addFileChip할 것
                }
            	if (talkData.fileChooserList.length >= 30) {
                	TeeToast.open({text: '파일 전송은 한번에 30개까지 가능합니다.'});
            		break;
            	}
            }
            if (temp.length) {
    			talkFileUpload.onOpenFileUploadDialog(temp);
            }
        }
    }

    function onPaste() {
        event.stopPropagation();
        event.preventDefault();

        let clipboardData = event.clipboardData || window.clipboardData;
        let pastedImage = null, pastedText = null;
        if(pastedImage = isImagePasted(clipboardData)) pasteImage(pastedImage);
        else if(pastedText = clipboardData.getData("Text")) pasteText(pastedText);
        
        setTimeout(function() {
            $("#talk-footer__input").scrollTop($("#talk-footer__input").prop("scrollHeight"));
        }, 1);
        
    }

    function _updateButtonStatus(isEmpty) {
    	let sendButton = $('#talk-footer__send-button')
    	let sendButtonImg = document.querySelector('.talk-footer__send-image')
    	// 문자 없이 개행/공백만 있는 경우 전송 버튼 비활성화
        if ($("#talk-footer__emoticon-view").css("display") !== "flex" && isEmpty) {
    		sendButton.attr("disabled", true);
    		sendButtonImg.setAttribute('src', './res/talk/rocket.png')
    		return
    	}
    	// null이 아닌지 체크해야하는건가?
//        if (isEmpty !== null && isRoomSelected) { 
    	if (!isEmpty && talkData.selectedRoomId.get()) {
            // 이모티콘을 선택한 상황인지도 확인, talkData.selectedEmoticonTag.get()을 사용하면 mobx가 터져서 태그 체크
            if ($("#talk-footer__emoticon-view").css("display") === "flex") {
                sendButton.attr("disabled", false);
                sendButtonImg.setAttribute('src', './res/talk/rocket_White.png')
            } else {
                sendButton.attr("disabled", isEmpty);
                if (isEmpty) {
                	sendButtonImg.setAttribute('src', './res/talk/rocket.png')
                } else {
                	sendButtonImg.setAttribute('src', './res/talk/rocket_White.png')
                }
                
            }
        }
    }

    // 비더라도 지우지 말아야
    function onKeyUp(event) {
    	
    }
    
    function onKeyDown() {
        // ToGate 올드 버전 호환을 위해 추가한다.
        // 이부분은 Down, Up 양 쪽에서 확인할 필요는 없어 보인다.

        // TODO : DELETE
    	// if (talkUtil.isIE()) {
    	// 	onInput(event)
    	// }
        switch (event.keyCode) {
            // ENTER key
            case 13:
                {
                    event.preventDefault();
                    if (talkMention.isOpened()) {
                        return;
                    }

                    if (event.ctrlKey || isMobile()) {
                        document.execCommand("insertParagraph", false, "p");

                        // 스크롤 제일 아래로 내리기 [IMS : 220358]
                        const input = document.getElementById("talk-footer__input");
                        if(input){
                            input.scrollTop = input.scrollHeight;
                        }
                    } else {
                        if (talkData.selectedRoomId.get()) onSendButtonClick();
                    }
                }
                break;

            // backspace key
            case 8:
                {
                    // 기본 p \u200b p
                    if (document.querySelector('#talk-footer__input').innerHTML === defaultFormat) {
                        event.preventDefault();
                    }
                }
                break;
                
            case 27:
            	{
            		if (talkData.selectedReply.value) {
            			talkData.selectedReply.set(null);
            		}
            	}
            default:
                break;
        }
    }

    function onInput(event) {
        saveSelection();

        // 4000자 이상 글자 수 표시, 5000자 초과 글자 삭제
        let inputTextContainer = document.querySelector('#talk-footer__input');
        let counterContainer = document.querySelector('#talk-footer__message-counter')
        let displayedLengthContainer = document.querySelector('#talk-footer__message-counting');
        let messageLength = inputTextContainer.textContent.length;
        
        if (messageLength >= 4000) {
        	counterContainer.style.display="block"
    		displayedLengthContainer.textContent = messageLength;
            if (messageLength > 5000) {
            	inputTextContainer.textContent = inputTextContainer.textContent.substr(0,5000)
                counterContainer.style.color = "#FF5D5D";
            	displayedLengthContainer.textContent = inputTextContainer.textContent.length;

                focusAndSelection();

                if (window.getSelection) {
                    //non IE Browsers
                    let el = document.getElementById("talk-footer__input");
                    let range = document.createRange();
                    let selection = window.getSelection();
                    range.setStart(el.childNodes[0], el.childNodes[0].length);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } 
//                TeeToast.open({text: '5000자를 초과한 글자는 삭제되었습니다.'});        
            } else if (messageLength < 5000){
            	counterContainer.style.color = "#000000";
            } else {
            	counterContainer.style.color = "#FF5D5D";
            }
            
        } else {
        	counterContainer.style.display = "none"
        }

        if (event.data === "@") {
            // 메일 입력위해 @ 입력시 멘션창 뜨지 않게하기
            let _text = document.querySelector('#talk-footer__input').innerHTML;
            if (!_text.match(/[\w+\-.]@/g)) {
            	talkMention.open(talkFooter.getEmoticonMentionPosition("mention"), false);            	
            }
        }

        resizeSmallEmoticon();
        let emptyLocal = _isTextAreaEmpty();
        _updateButtonStatus(emptyLocal);
        
        // 남은 메시지 저장하기
        
        let remainedMsg = {userId: talkData.myInfo.userId, msg:inputTextContainer.innerHTML}
        
        let _storageItem = localStorage.getItem("teetalk_"+talkData.talkId);
        localStorage.setItem("teetalk_"+talkData.talkId, JSON.stringify(remainedMsg));
        
        if (talkUtil.isMobile() || talkUtil.isSimple()) {
            talkContent.gotoLastMessage();
        }
    }


    function resizeSmallEmoticon() {
        let nodes = document.querySelector('#talk-footer__input').childNodes;
        let nodeCount = nodes.length;

        // image node 하나 && data-size === small
        if (nodeCount === 1 && nodes[0].tagName === "IMG" && nodes[0].getAttribute("data-size") === "small") {
            // 크게
            let target = $(nodes[0]);
            let emoticonIndex = target.attr("data-index") * 1;
            target.css({
                "width": "2.5rem",
                "height": "2.5rem",
                "background-position-x": emoticonIndex * -2.5+"rem"
            });
        } else {
            // 작게
            let smallEmoticonList = $("#talk-footer__input [data-size='small']", textArea);
            let smallEmoticonCount = smallEmoticonList.length;
            for (let i = 0; i < smallEmoticonCount; i++) {
                if (smallEmoticonList.eq(i).width() !== 20) {
                    let emoticonIndex = smallEmoticonList.eq(i).attr("data-index") * 1;
                    smallEmoticonList.eq(i).css({
                        "width": "1.25rem",
                        "height": "1.25rem",
                        "background-position-x": emoticonIndex * -1.25+"rem",
                        "margin-right": "0.25rem"
                    });
                } else {
                	smallEmoticonList.eq(i).css({
                		"margin-right": "0.25rem",
                		"margin-left" : "0.25rem"
                	})
                }
            }
        }
    }

    // 답장 누르면 text 맨 마지막에서 깜빡거리게 하기
    function _setCaret() {
        // contenteditable div tag에 cursor 깜빡거리게 하기
        let el = document.getElementById("talk-footer__input");

        el.focus();
        if (window.getSelection) {
            range = window.document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(el);
            range.select();
        }

        //    	if (window.getSelection) {
        //    		if (!$('#talk-footer__input').html()) {
        //    			// collapse(parentNode, offset) : offset이 0이면 맨 처음, 1이면 맨 끝으로 이동시킴
        //    			window.getSelection().collapse(el,0);
        //    		} else {
        //    			window.getSelection().collapse(el,1);
        //    		}
        //    	}
    }

    function focusAndSelection() {
        if (!savedRange) {
            $("#talk-footer__input").focus();
            saveSelection();
        }
    }

    function saveSelection() {
        if (window.getSelection) {
            //non IE Browsers
            savedSelection = window.getSelection();
            if (savedSelection.getRangeAt && savedSelection.rangeCount) {
                savedRange = savedSelection.getRangeAt(0);
            }
        } else if (document.selection) {
            //IE
            savedSelection = document.selection;
            savedRange = document.selection.createRange();
        }
        return savedRange;
    }

    function insertSavedSelection(htmlNode, attachData) {
        focusAndSelection();

        // insert node in SavedSelection position
        savedRange.insertNode(htmlNode);

        // caret move last position of input
        savedRange.setStartAfter(htmlNode);
        savedRange.setEndAfter(htmlNode);
        savedSelection.removeAllRanges();
        savedSelection.addRange(savedRange);

        document.execCommand("insertHTML", false, "");

        removeEmptyNodes();
        saveSelection();
    }

    function _appendText(targetText) {
        let target = document.createTextNode(targetText);
        insertSavedSelection(target);
    }

    function _appendHTML(target) {
        // insertSavedSelection(target, '\u200b');
        insertSavedSelection(target, "");
    }

    function _isTextAreaEmpty() {
    	// true, false 출력
    	var textArea = $('#talk-footer__input')
    	if (textArea.length) {
    		// 먼저 textArea에 작은 이모티콘이 있는지 확인
    		if (talkFooter.hasEmoticon(textArea.html())) {
        		return false;
        	}
    		
    		// 공백이나 개행문자만 있는 경우 empty 처리
    		var inputText = textArea.text().replace(/\s/g, "");
        	if (inputText === "") {
        		return true;
        	}
            if (textArea && textArea.length) return !(textArea[0].childNodes.length > 0);
    	}    	
    	return false;
    }

    function removeEmptyNodes() {
        // 텍스트 노드 이면
        let nodeList = [];
        if (savedSelection.anchorNode.nodeType === 3) {
            nodeList = savedSelection.anchorNode.parentNode.childNodes;
        } else {
            nodeList = savedSelection.anchorNode.childNodes;
        }

        nodeList.forEach(function(elem) {
            if (elem.nodeType === 3 && !elem.textContent.length) {
                $(elem).remove();
            }
        });

        // br 지우기
        $("#talk-footer__input br").remove();
    }
    
    function _hasEmoticon(inputText) {
    	// Noti해주기 위해 작은 이모티콘이 있는지 확인
    	let arr = inputText.indexOf('data-type="emoticon"');
    	return (arr !== -1) ? true : false;
    }
    
    function onSendButtonClick() {
        // 여기
         if(talkData.messageList.length === 0 && isTempSpace(getRoomIdByUrl())){
        	 jQuery.ajax({
     	        type: "POST",
     	        url: _workspace.url + "SpaceRoom/SpaceRoomTemp?action=Init",
     			dataType : "json",
     			data : JSON.stringify({
     				"dto" :{
     					"WS_ID" : workspaceManager.getWorkspaceId(getRoomIdByUrl())
     				}
     			}),
     	        contentType: "application/json",
     	        async: false,
     	        success: function (result) {
     	        	workspaceManager.update();
     	        }
     	    })

         }

		const textArea = $('#talk-footer__input')
        // 이모티콘 보내기
        let emoticonTag = talkData.selectedEmoticonTag.get(); 
        
    	if (emoticonTag) {
            let emoticonContent = talkMessageConverter.htmlMsgToServerMsg(emoticonTag);
            let targetMessage = talkServer2.createMessageFormat(
                talkData.selectedRoomId.value,
                emoticonContent,
                "create"
            );
            targetMessage["MSG_STATE"] = "sending";
            targetMessage["IS_HEAD"] = false;
            targetMessage["MSG_BODY_TEXT"] = '(이모티콘)';
            
            talkData.tempMessageList.push(targetMessage)            
            talkContent.sendMessage(targetMessage, false)
        }

        // 글자 보내기
        if (_isTextAreaEmpty()) return;

        let content = textArea.html();
        let innerHtml = talkMessageConverter.htmlMsgToServerMsg(content);

        if (innerHtml === "\n" || !innerHtml.length) {
            return;
        }

        // 이모티콘 제외, mention 포함 글자 수
        if (textArea.text().length > 5000) {
//        	TeeToast.open({text: "5000자를 초과한 글자는 삭제되었습니다."});
            textArea.text(textArea.text().substr(0, 5000));
            return;
        }

        let targetMessage = talkServer2.createMessageFormat(talkData.selectedRoomId.value, innerHtml, "create");
        targetMessage["MSG_STATE"] = "sending";
        targetMessage["IS_HEAD"] = false;
        targetMessage["MSG_BODY_TEXT"] = talkContent.convertToMsgBodyText(targetMessage["MSG_BODY"]);
        
        // 옵저버 되게
        talkData.tempMessageList.push(targetMessage)

        talkContent.sendMessage(targetMessage, false)
        // console.log("[before send] : ", targetMessage["TEMP_ID"])

//        (function() {
//            talkServer2
//                .createMessage(targetMessage)
//                .then(function(res) {
//                    if (res.data.dto["RESULT_CODE"] !== "OK") {
//                        throw new Error("Rresult code is not 'ok'");
//                    } else {
//                        let message = res.data.dto;
//                        let idx = talkData.tempMessageList.findIndex(function(elem) {
//                            return elem["TEMP_ID"] === message["TEMP_ID"];
//                        });
//
//                        // 자신이 보낸 메시지에 대한 처리
//                        if (idx !== -1) {
//                            talkData.tempMessageList.splice(idx, 1);
//                        }
//                        talkContent.appendCompleteMessage(message);
//
//                        //attachment로 붙일 답장이 있다면,
//                        if (!!talkData.selectedReply.value) {
//                            sendReplyMsg(message, talkData.selectedReply);
//                        }
//
//                        // 문자열에 link 있는지 확인
//                        let msgBody = res.data.dto["MSG_BODY"];
//                        talkUtil.createLinkAttachment(res.data.dto["MSG_ID"], msgBody);
//                    }                    
//                })
//                .catch(function(err) {
//                    targetMessage["MSG_STATE"] = "fail";
//                })
//                .then(function(res) {
//                    talkData.selectedReply.set(null);
//                    $("#footer__mention-button").css("color", "rgb(113, 115, 118)");
//                });
//        })();
        // talkServer2
        //     .createMessage(targetMessage)
        //     .then(response => {
        //         // console.log("[after send] : ", response.data.dto["TEMP_ID"])

        //         if (response.data.dto.RESULT_CODE !== "OK") {
        //             targetMessage["MSG_STATE"] = "fail";
        //         } else {
        //             let message = response.data.dto;
        //             let idx = talkData.tempMessageList.findIndex(function(elem) {
        //                 return elem["TEMP_ID"] === message["TEMP_ID"];
        //             });
        //             // 자신이 보낸 메시지에 대한 처리
        //             if (idx !== -1) {
        //                 talkData.tempMessageList.splice(idx, 1);
        //             }
        //             talkContent.appendCompleteMessage(message);
        //             //attachment로 붙일 답장이 있다면,
        //             if (talkData.selectedReply.value !== null && talkData.selectedReply.value !== undefined) {
        //                 sendReplyMsg(message, talkData.selectedReply);
        //             }

        //             // 문자열에 link 있는지 확인
        //             let msgBody = response.data.dto["MSG_BODY"];
        //             if (isIncludeLink(msgBody)) {
        //                 let urlList = getLinkURL(msgBody);
        //                 if (urlList && urlList.length) {
        //                     // attachment 추가
        //                     console.log("[CREATE URL ATTACHMENT] : ", urlList);
        //                 }
        //             }
        //         }
        //         // talkContent.removeTempMessage(targetMessage);
        //     })
        //     .catch(function() {
        //         targetMessage["MSG_STATE"] = "fail";
        //     })
        //     .finally(function() {
        //         talkData.selectedReply.set(null);
        //     });

        clear();
    }

    // 앞으로 정책 변경 예정
//    function _isFileNameLong(name) {
//        return name.split(".")[0].length > 70;
//    }
    
    function _getEmoticonMentionPosition(type) {
    	let css = {};
    	
        if (talkUtil.isMobile()) {
        	if (type === "mention") {
        		css["left"] = 0;
                css["bottom"] = $("#talk-footer-wrapper").height();
        	} else if (type === 'emoticon') {
        		$("#talk-content-main").css("height", ($("#talk-content-main").height() - 190) *0.0625+"rem");
                css["left"] = 0;
                css["bottom"] = 0;
        	}            
        } 
        // TODO : 필요없는지 체크
//        else if (talkData.isSimple) {
//        	css["bottom"] = 10;
//            css["right"] = $("#talk-footer").width() + 10;
//        } 
        else {
        	css["left"] = 0;
        	css["bottom"] = document.querySelector("#talk-footer-wrapper").offsetHeight + 4;
        	switch (type) {
        		case "emoticon":
        			css["left"] = $('div#talk-footer__'+ type +'-button').offset().left - $('#talk-main').offset().left;
        			break;
        		case "mention":
        			css["left"] = $('div#talk-footer__'+ type +'-button').offset().left;
        			break
        	} 
        	
        }    
    	return css;
    }
    
    function onFooterButtonClick(type){
        switch(type){
            case "file" :
            	onFooterButtonClick_file();   
	            break;
            case "emoticon" : 
            	talkEmoticon.open("#talk-main", talkFooter.getEmoticonMentionPosition("emoticon"));
            	break;
            case "mention" : 
            	talkMention.open(talkFooter.getEmoticonMentionPosition("mention"), true);
            	break;
        }
    }

    return {
        init: function() {
            container = $("#talk-footer")
            
        	talkRenderer.structure.renderFooter();
            
            setTimeout(function() {            
            	let textArea = document.querySelector('#talk-footer__input');
            	
                textArea.addEventListener('click', () => {
                    if (talkData.messageList.length) {
                        talkServer2.ttalk_readAllMessage(talkData.talkId, userManager.getLoginUserId())
                    }  
                })
                
                const fileButton = document.querySelector('#talk-footer__file-button')
                fileButton.addEventListener('click', () => {
                    onFooterButtonClick("file")
                })
                
                const emoticonButton = document.querySelector('#talk-footer__emoticon-button')
                emoticonButton.addEventListener('click', () => {
                    onFooterButtonClick("emoticon");
                });
                
                const mentionButton = document.querySelector('#talk-footer__mention-button')
                mentionButton.addEventListener('click', () => {
                    onFooterButtonClick("mention");
                });

                sendButton = $("#talk-footer__send-button");
                sendButton[0].onclick = onSendButtonClick;

                textArea = $("#talk-footer__input");
                textArea.off("mousedown mouseup keydown keyup").on("mousedown mouseup keydown keyup", function() {
                    saveSelection();
                });
                // textAreaJQuery.on("keyup", onKeyUp);

                textArea[0].onkeydown = onKeyDown;
                textArea[0].onkeyup = onKeyUp;
                textArea[0].onpaste = onPaste;
                textArea[0].oninput = onInput;

                savedRange = null;
                savedSelection = null;

                document.execCommand("defaultParagraphSeparator", false, "p");
            },1);
        },

        appendHTML: function(html) {
            _appendHTML(html);
        },

        appendText: function(str) {
            _appendText(str);
        },
        removeOneText: function() {
            if (!savedRange) return;

            savedRange.setStart(savedRange.startContainer, savedRange.endOffset - 1);
            savedRange.setEnd(savedRange.startContainer, savedRange.endOffset);
            savedSelection.removeAllRanges();
            savedSelection.addRange(savedRange);
            savedSelection.deleteFromDocument();
            saveSelection();
        },
        hasEmoticon: function(inputText) {
        	return _hasEmoticon(inputText) 
        },
        getEmoticonMentionPosition: function(type) {
        	// type : emoticon, mention
        	return _getEmoticonMentionPosition(type)
        },
        updateButtonStatus: function(isEmpty){
        	_updateButtonStatus(isEmpty);
        },
        isTextAreaEmpty: function() {
            return _isTextAreaEmpty()
        },
        setCaret: function() {
        	_setCaret();
        },
        isFileNameLong: function(name) {
        	return _isFileNameLong(name);
        }        
    };
})();
