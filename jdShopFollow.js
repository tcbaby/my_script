const fs = require('fs')
const { chromium, devices } = require("playwright-chromium");
const phone = devices['iPhone 13 Pro']
const waitTime = 200;
const htmlUrl = 'https://home.m.jd.com'
const shopFile = './shop.txt'

!(async () => {
    if (!process.env.JD_COOKIE) {
        console.log(`请设置 JD_COOKIE 变量`);
        return;
    }
    if (!fs.existsSync(shopFile)) {
        console.log(`${shopFile} 不存在`);
        return;
    }
    const cks = process.env.JD_COOKIE.split('&')
    const data = fs.readFileSync('./shop.txt', { encoding: 'utf-8' });

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ ...phone });
    const page = await context.newPage();

    const urls = data.split('\n').filter(l => l.indexOf('https') != -1)
    for (let j = 0; j < cks.length; ++j) {
        console.log(`开始 ${cks[j].match(/pt_pin=(.*?)[; ]/)[1]}`);
        await page.context().clearCookies();
        await page.context().addCookies(getCookies(cks[j]))
        for (let i = 0; i < urls.length; ++i) {
            await page.goto(urls[i], { timeout: 120000 });
            await page.waitForTimeout(waitTime * 3);
            if (await page.isVisible('.shop_gift_modal_button')) {
                await page.click('.shop_gift_modal_button')
                if (await await page.isVisible('.shop_gift_list_name')) {
                    const res = await page.innerText('.shop_gift_list_name')
                    console.log(res);
                }
            }
        }
    }
    await browser.close();
})();

function getCookies (ck) {
    const buildCookie = (name, value) => {
        return {
            sameSite: 'Lax',
            name: name,
            value: value,
            domain: '.jd.com',
            path: '/',
            // expires: 1645420969.120811,
            httpOnly: true,
            secure: false
        }
    }
    const pin = ck.match(/pt_pin=(.*?)[; ]/)[1]
    const key = ck.match(/pt_key=(.*?)[; ]/)[1]
    return [buildCookie('pt_pin', pin), buildCookie('pt_key', key)];
}