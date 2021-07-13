const puppeteer = require('puppeteer');
const ora = require("ora");
const getColors = require("get-image-colors");
let page;

const connect = async (iqEmail, iqPassword) => {
    const loadPage = ora('ACESSANDO A CORRETORA ...').start();
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1500, height: 700 },
        headless: false,
    })
    page = (await browser.pages())[0];
    if (!page) page = await browser.newPage();
    await page.goto("https://login.iqoption.com/en/login");
    await page.waitForSelector(
        "button.Button.Button_green.Button_big.Button_fontBig"
    );
    await page.mouse.click(800, 200);
    await page.keyboard.type(iqEmail);
    await page.mouse.click(800, 270);
    await page.keyboard.type(iqPassword);
    await page.mouse.click(800, 340);
    await page.waitForSelector("button.Button.NavBtn.Button_orange");
    //FUNCTION TO TRY TO CONNECT
    const enterTradeRoom = async (page) => {
        await page.goto("https://iqoption.com/traderoom");
        try {
            await page.waitForSelector("canvas.active");
        } catch (error) {
            await enterTradeRoom(page)
        }
    }
    await enterTradeRoom(page);
    await new Promise((resolve) => setTimeout(resolve, 5000))
    loadPage.succeed('O BOT ESTÁ PRONTO!')
    return page;
};


// 11,1 SECONDS
const runSignal = async (signal) => {
    const loadSend = ora('ENVIANDO SINAL PARA A CORRETORA ...').start();
    try {
        const dtBeg = new Date();

        await page.mouse.click(385, 20, { delay: 500 }); //CLOSE ASSET

        await page.mouse.click(415, 35, { delay: 500 }); //OPEN ASSET SEARCH

        await page.mouse.click(785, 35, { delay: 500 }); //SELECT SERACH BAR

        await page.keyboard.type(signal.pair.split(" ").join().toUpperCase(), { delay: 500 }); //TYPE SEARCH

        await page.mouse.click(785, 120, { delay: 500 }); //SELECT ASSET

        await page.mouse.click(1430, 105, { delay: 500 }); //TIME MENU

        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (signal.m === 1)
            await page.mouse.click(1150, 205, { delay: 500 }) //SELECT (M1)
        else if (signal.m === 5)
            await page.mouse.click(1150, 335, { delay: 500 }) //SELECT (M5)
        else if (signal.m === 15)
            await page.mouse.click(1280, 205, { delay: 500 }) //SELECT (M15)

        let put = 1;
        let call = 1;

        for (let i = 0; i < 25; i++) {
            await page.screenshot({
                path: 'candle.png',
                clip: {
                    x: 855 - i,
                    y: 180,
                    width: 20,
                    height: 360
                }
            });
            await new Promise((resolve) => setTimeout(resolve, 700))
            const colors = await getColors('./candle.png')
            let red = 0;
            let green = 0;
            for (let i = 0; i < colors.length; i++) {
                red += colors[i].rgb()[0];
                green += colors[i].rgb()[1];
            }
            if (red > green && red > 100) {
                put += i
            } else if (green > 400) {
                call += i
            }
        }

        if (signal.action === "CALL" && call > put) {
            await page.mouse.click(1440, 410)
            loadSend.succeed('SINAL ENVIADO PARA A CORRETORA!')
        } else if (signal.action === "PUT" && put > call) {
            await page.mouse.click(1440, 530)
            loadSend.succeed('SINAL ENVIADO PARA A CORRETORA!')
        } else {
            loadSend.succeed('SINAL NÃO FOI ENVIADO!')
        }

        if (call > put) {
            console.log('ÚLTIMA VELA FOI CALL')
        } else {
            console.log('ÚLTIMA VELA FOI PUT')
        }

        console.log('TIME: ', Math.abs(dtBeg - new Date()));
        await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
        loadSend.fail('ERRO AO ENVIAR O SINAL PARA A CORRETORA! ' + error.message)
    }
}

module.exports = {
    connect,
    runSignal
}