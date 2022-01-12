const notify = require('./sendNotify')

let cookiesArr = [], allMsg = '';
const author = 'tcbaby'

!(async () => {
    requireConfig();

    if (notify.sendNotifybyWxPucher) {
        for (let i = 0; i < cookiesArr.length; i++) {
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                const pin = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                await notify.sendNotifybyWxPucher('tips', allMsg, pin, author)
            }
        }
    }
    await notify.sendNotify('tips', allMsg, author)
})()

function requireConfig () {
    console.log(`commend: ${process.argv.join(' ')}`)
    if (process.argv.length > 2 && process.env.JD_COOKIE) {
        cookiesArr = process.env.JD_COOKIE.split('&');
        allMsg = process.argv.slice(2).join('\n');
    } else {
        console.log(`没有需要通知的消息！`)
        process.exit(0);
    }
}