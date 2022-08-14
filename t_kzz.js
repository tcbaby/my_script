/*
cron 30 8 * * 1-5 t_kzz.js
new Env('可转债');
*/
const request = require('request');
const notify = require('./sendNotify');

const name = '可转债'
const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=PUBLIC_START_DATE&sortTypes=-1&pageSize=50&pageNumber=1&reportName=RPT_BOND_CB_LIST&columns=ALL&quoteColumns=f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO&quoteType=0&source=WEB&client=WEB'

!(async () => {
    if(!process.env.KZZ || !process.env.KZZ){ 
        console.log('本脚本默认不允许，需要运行请设置环境变量 KZZ=true')
        return;
    }
    request(url, async (err, res) => {
        if (err || !res || !res.body) {
            console.log('请求失败!')
            await notify.sendNotify(`${name}`, '数据抓取失败!')
        } else {
            const data = JSON.parse(res.body).result.data;
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

            if ((allMsg = allMsg.trim()) != '') {
                console.log(allMsg)
                await notify.sendNotify(`${name}`, allMsg)
            }
        }
    })
})();