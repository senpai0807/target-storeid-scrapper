const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function targetIds() {
    const browser = await puppeteer.launch({ 
        args: [
            '--headless=new',
        ] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });

    await page.goto('https://www.target.com/store-locator/store-directory/wisconsin');
    await page.waitForSelector('div[class="styles__StateColumn-sc-xmp04y-0 kmBSQL"]', { visible: true, timeout: 5000 });
    const cityElements = await page.$$('div.h-margin-v-tiny');
    const filePath = path.join(__dirname, 'targetCities.txt');


    for (const cityElement of cityElements) {
        const dataType = await cityElement.evaluate(node => node.getAttribute('data-test'));
        let dataLine = '';

        if (dataType === 'single-city') {
            const href = await cityElement.$eval('a', a => a.getAttribute('href'));
            const formattedHref = href.split('/').slice(3).join('/');
            dataLine = `${formattedHref}\n`;

        } else if (dataType === 'multiple-cities') {
            const dataIds = await cityElement.$eval('button', button => button.getAttribute('data-ids'));
            const idsArray = dataIds.split(',');
            const formattedIds = idsArray.join('\n');
            dataLine = `${formattedIds}\n`;
        }

        fs.appendFileSync(filePath, dataLine);
    }

    await browser.close();
};

targetIds();