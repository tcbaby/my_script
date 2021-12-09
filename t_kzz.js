/*
cron 30 8 * * 1-5 t_kzz.js
new Env('可转债');
*/
const request = require('request');
const notify = require('./sendNotify');

const name = '可转债'
const url = 'https://data.eastmoney.com/kzz/default.html'

!(async () => {
    if(!process.env.KZZ || !process.env.KZZ){ 
        console.log('本脚本默认不允许，需要运行请设置环境变量 KZZ=true')
        return;
    }
    request(url, async (err, res) => {
        if (err) {
            console.log('请求失败!')
            await notify.sendNotify(`${name}`, '数据抓取失败!')
        } else {
            res.body.match(/var pagedata= (.*);\n/g)
            const pageData = JSON.parse(RegExp.$1)
            const data = pageData.list.result.data
            const latest = [], recentListed = [];
            for (const e of data) {
                let currDate = new Date().getTime();
                let date = new Date(e.VALUE_DATE.substring(0, 10) + ' 23:59:59+8').getTime();
                e.listingDate = e.LISTING_DATE ? new Date(e.LISTING_DATE.substring(0, 10)).getTime() : Number.MAX_SAFE_INTEGER
        
                if (date >= currDate) {
                    latest.push(e)
                }
                if (Math.abs(currDate - e.listingDate) < 7 * 24 * 60 * 60 * 1000) {
                    recentListed.push(e)
                }
            }
        
            let allMsg = ''
            if (latest.length != 0) {
                allMsg += '******* 新债 *******\n'
                latest.forEach(e => {
                    allMsg += `${e.VALUE_DATE.substring(5, 10)} ${e.SECURITY_NAME_ABBR}(${e.SECURITY_CODE})\n`
                })
            }
        
            if (recentListed.length != 0) {
                allMsg += '\n******* 最近上市 *******\n'
                recentListed
                    .sort((a, b) => b.listingDate - a.listingDate)
                    .forEach(e => {
                        allMsg += `${e.LISTING_DATE.substring(5, 10)} ${e.SECURITY_NAME_ABBR}(${e.SECURITY_CODE})\n`;
                    })
            }
        
            allMsg = allMsg ? allMsg.trim() : '没有可转债打新！';
            console.log(allMsg)
            await notify.sendNotify(`${name}`, allMsg)
        }
    })
})();