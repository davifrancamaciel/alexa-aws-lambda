'use strict';

const puppeteer = require('puppeteer');
const { handlerResponse, handlerErrResponse } = require("../utils/handleResponse");

module.exports.handler = async (event) => {
    try {

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://meurh.qualityrhrio.com.br/FrameHTMLQuality/web/app/RH/PortalMeuRH/#/login');
        await sleep(3)

        const { USER, PASSWORD } = process.env;

        await page.$eval('input[name=user]', el => el.value = `${USER} `);
        await page.focus("input[name=user]");
        await page.keyboard.press('Backspace');

        await page.focus("input[name=password]");
        await page.$eval('input[name=password]', el => el.value = `${PASSWORD} `);
        await page.keyboard.press('Backspace');

        await page.$eval('.po-button', el => el.disabled = false);
        await page.click('.po-button');


        await sleep(5)
        const [buttonDot] = await page.$x("//a[contains(., 'Ponto')]");
        if (buttonDot)
            await buttonDot.click();

        await sleep(5)
        const [buttonWatch] = await page.$x("//p[contains(., 'Relógio')]");
        if (buttonWatch)
            await buttonWatch.click();

        await sleep(5)
        const context = browser.defaultBrowserContext()
        await context.overridePermissions("https://meurh.qualityrhrio.com.br/FrameHTMLQuality/web/app/RH/PortalMeuRH/#/timesheet/clockingsGeo/register", ['geolocation'])

        await sleep(25)
        await page.screenshot({ path: 'example.png' });

        await browser.close();
        return handlerResponse(200, {})
    } catch (err) {
        return handlerErrResponse(err)
    }
};

const sleep = async (sec) => {
    const msec = 1000 * sec
    return new Promise(resolve => setTimeout(resolve, msec));
}