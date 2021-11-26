/*
可转债
cron 0 8 * * 1-5 t_kzz.js
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
                let listingDate = e.LISTING_DATE ? new Date(e.LISTING_DATE.substring(0, 10)).getTime() : Number.MAX_SAFE_INTEGER
        
                if (date >= currDate) {
                    latest.push(e)
                }
                if (Math.abs(currDate - listingDate) < 7 * 24 * 60 * 60 * 1000) {
                    recentListed.push(e)
                }
            }
        
            let allMsg = ''
            if (latest.length != 0) {
                allMsg += '============== 新债 ==============\n'
                latest.forEach(e => {
                    allMsg += `${e.SECURITY_NAME_ABBR}(${e.SECURITY_CODE})\n`
                    allMsg += `申购/中签号发布日：${e.VALUE_DATE.substring(5, 10)}  ${e.BOND_START_DATE.substring(5, 10)}\n`
                    allMsg += `详情：https://data.eastmoney.com/kzz/detail/${e.SECURITY_CODE}.html\n\n`
                })
            }
        
            if (recentListed.length != 0) {
                allMsg += '============ 最近上市 ============\n'
                recentListed.forEach(e => {
                    allMsg += `${e.SECURITY_CODE}\t${e.SECURITY_NAME_ABBR}\n`;
                    allMsg += `上市时间：${e.LISTING_DATE.substring(5, 10)}\n`;
                    allMsg += `详情：https://data.eastmoney.com/kzz/detail/${e.SECURITY_CODE}.html\n\n`;
                })
            }
        
            allMsg = allMsg ? allMsg.trim() : '没有可转债打新！';
            console.log(allMsg)
            await notify.sendNotify(`${name}`, allMsg)
        }
    })
})();