var SALT="this_is_the_salt"
var PAYLOAD_HEADER="_#_o_#_"

/*
    cipher from stackoverflow
    https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
*/
const cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

const decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}

const myCipher = cipher(SALT)
const myDecipher = decipher(SALT)

/*
 using base64.js from https://github.com/beatgammit/base64-js
 using base64encoding korean, https://min9nim.github.io/2018/11/base64-encode/
*/

function Base64Encode(str, encoding = 'utf-8') {
    var bytes = new (TextEncoder || TextEncoderLite)(encoding).encode(str);        
    return base64js.fromByteArray(bytes);
}

function Base64Decode(str, encoding = 'utf-8') {
    var bytes = base64js.toByteArray(str);
    return new (TextDecoder || TextDecoderLite)(encoding).decode(bytes);
}


function before_onSendButtonClickHandler() {
    var is_good = true
    var plain_text = $('#talk-footer__input').text()
    console.log("[SEND] plain text - " + plain_text)
     
    var encryption = $("#current_room_status_encryption").text()
    if(encryption == "encrypted") {
        console.log("[SEND] base64 text - " + Base64Encode(plain_text))
        console.log("[SEND] encrypted text - " + myCipher(Base64Encode(plain_text)))
        console.log("[SEND] final text - " + PAYLOAD_HEADER + myCipher(Base64Encode(plain_text)))
        $('#talk-footer__input').text(PAYLOAD_HEADER + myCipher(Base64Encode(plain_text)))
    }
}

var msg_decrypted = ""
function decrypt_message_body(msg) {
/*
서버로부터 들어온 암호화된 데이터에 대해서 보여주고
채팅에서도 쓰고...하기위해서 여기는 그냥 무조건 payload있으면 decode하자.
*/
    msg_decrypted = msg;
    console.log("[RECV] recv text - " + msg)
    if(msg && msg.indexOf(PAYLOAD_HEADER) == 0) {
        //this is encrypted text.
        console.log("[RECV] recv text has payload")
        var length = msg.length
        var msg_to_decrypt = msg.substring(PAYLOAD_HEADER.length, length)
        console.log("[RECV] text to decrypt - " + msg_to_decrypt)
        console.log("[RECV] text decrypted - " + myDecipher(msg_to_decrypt))
        console.log("[RECV] base64 decoded - " + Base64Decode(myDecipher(msg_to_decrypt)))
        msg_decrypted = Base64Decode(myDecipher(msg_to_decrypt))
    }
    return msg_decrypted
}