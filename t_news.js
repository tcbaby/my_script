/*
早报
cron 20 8 * * * t_news.js
*/

const request = require('request');
const notify = require('./sendNotify');

const name = '早报'
const url = 'https://www.163.com/dy/media/T1603594732083.html'

!(async () => {
    try {
        request(url, async (err, res) => {
            let list = res.body.match(/<a href="(.*)" class="media_article_img">/g)
            list[0].match(/<a href="(.*)" class="media_article_img">/g)
            news_url = RegExp.$1

            request(news_url, async (err, res) => {
                const reg = /<div class="post_body">[^<]*?<p class="f_center">.*?<p id=".*?">(.*?)<\/p>/g
                let news = res.body.match(reg)[0].replace(reg, '$1').replace(/<br\/>/g, '\n')
                console.log(news)
                await notify.sendNotify(`${name}`, news)
            })
        })
    } catch (error) {
        console.log(`error: ${error}`)
        await notify.sendNotify(`${name}`, '数据抓取失败!')
    }
})();

