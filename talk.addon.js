var bad_words = ["씨발", "존나", "좆", "병신", "개새끼", "시발", "ㅗ", "영감님", "새끼", "ㅅㅂ"]
var good_words = ["뀨우!?", "뀨뀨!?", "뀨!?", "콰!?", "멍멍멍!?", "머엉!?", "호!?", "교수님!?", "아이야!?", "스봉!?"]

function before_onSendButtonClickHandler() {
    var is_good = true
    var text = $('#talk-footer__input').text()
    
    for(i in bad_words) {
        if(text.indexOf(bad_words[i]) >= 0) {
            console.log("지금 보내려는 문장에 비속어가 들어있습니다.")
            is_good = false
            break
        }
    }

    for(i in bad_words) {
        text = text.replace(bad_words[i], good_words[i])
    }
    $('#talk-footer__input').text(text)
}

var msg_replaced = ""
function before_receiveMessage(msg) {
    msg_replaced = msg.MSG_BODY
    for(i in good_words) {
        msg_replaced = msg_replaced.replace(good_words[i], bad_words[i])
    }
    msg.MSG_BODY = msg_replaced
}