const puppeteer = require('puppeteer'); // v23.0.0 or later
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1202,
            height: 1198
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://login.office.hiworks.com/' + process.env.OFFICE_DOMAIN);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(로그인 ID)'),
            targetPage.locator('input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"root\\"]/div/main/div/div[1]/form/fieldset/div[2]/div/input)'),
            targetPage.locator(':scope >>> input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 90,
                y: 11.109375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(로그인 ID)'),
            targetPage.locator('input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"root\\"]/div/main/div/div[1]/form/fieldset/div[2]/div/input)'),
            targetPage.locator(':scope >>> input')
        ])
            .setTimeout(timeout)
            .fill(process.env.HIWORKS_USER_ID);
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Enter');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Enter');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(비밀번호)'),
            targetPage.locator('#mantine-3d735brq0'),
            targetPage.locator('::-p-xpath(//*[@id=\\"mantine-3d735brq0\\"])'),
            targetPage.locator(':scope >>> #mantine-3d735brq0')
        ])
            .setTimeout(timeout)
            .fill(process.env.HIWORKS_PASSWORD);
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await targetPage.keyboard.down('Enter');
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Enter');
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(근무/경비처리) >>>> ::-p-aria([role=\\"image\\"])'),
            targetPage.locator('div.split-wrap div > div > div > div:nth-of-type(3) svg'),
            targetPage.locator('::-p-xpath(//*[@id=\\"contents\\"]/div[1]/div/div/div/div[3]/a/span/span[2]/svg)'),
            targetPage.locator(':scope >>> div.split-wrap div > div > div > div:nth-of-type(3) svg')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 12,
                y: 25,
              },
            });
        await Promise.all(promises);
    }
    {
            const targetPage = page;
            const promises = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            }
            await puppeteer.Locator.race([
                targetPage.locator('::-p-aria(출근하기)'),
                targetPage.locator('li:nth-of-type(1) img'),
                targetPage.locator('::-p-xpath(//*[@id=\\"contents\\"]/div/section[3]/div/div[2]/div[2]/ul/li[1]/button/img)'),
                targetPage.locator(':scope >>> li:nth-of-type(1) img')
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                  offset: {
                    x: 14.6484375,
                    y: 19.25,
                  },
                });
        }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
