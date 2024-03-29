/*
cron 20 8 * * * t_news.js
new Env('早报');
*/

const request = require('request');
const notify = require('./sendNotify');

const name = '早报'
const url = 'https://www.163.com/dy/media/T1603594732083.html'

!(async () => {
    try {
        request(url, async (err, res) => {
            // let list = res.body.match(/<a class="img" href="(.*)">/g)
            // list[0].match(/<a class="img" href="(.*)">/g)
            // news_url = RegExp.$1
            const news_url = res.body.match(/https:\/\/www.163.com\/dy\/article.*html/g)[1];

            request(news_url, async (err, res) => {
                res.body.match(/<div class="post_body">[^<]*?<p class="f_center">.*?<p id=".*?">.*?<br\/>(.*?)<\/p>/g)[0]
                let news = RegExp.$1.replace(/<br\/>/g, '\n')
                console.log(news)
                await notify.sendNotify(`${name}`, news)
            })
        })
    } catch (error) {
        console.log(`error: ${error}`)
        await notify.sendNotify(`${name}`, '数据抓取失败!')
    }
})();

