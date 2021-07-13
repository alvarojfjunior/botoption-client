const puppeteer = require('puppeteer');
const ora = require("ora");
const getColors = require("get-image-colors");
const moment = require("moment");

let page;

const connect = async (iqEmail, iqPassword) => {
    try {
        const loadPage = ora('ACESSANDO A CORRETORA ...').start();
        const browser = await puppeteer.launch({
            defaultViewport: { width: 1500, height: 700 },
            headless: true,
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
    } catch (error) {
        console.log(error.message)
        return false
    }
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

        const minutsDif = moment(signal.time, 'HH:mm:ss').minutes() - moment().minutes();
        if (minutsDif < -1 || moment(signal.time, 'HH:mm:ss').hours() < moment().hours()) {
            loadSend.fail('O SINAL CHEGOU TARDE DE MAIS!')
            return
        }

        loadSend.text = 'AGUARDANDO ' + minutsDif + ' MINUTOS PARA ENVIAR O SINAL ', signal.string

        await new Promise((resolve) => setTimeout(resolve, minutsDif * 30000))

        if (String(signal.lastCandle).length > 2) {
            loadSend.text = 'VERIFICANDO ÚLTIMA VELA, AGUARDANDO VELA EM ' + signal.lastCandle + ' ... '
            let lastCandle = await getLastCandles()
            if (lastCandle !== signal.lastCandle) {
                await new Promise((resolve) => setTimeout(resolve, 50000))
                lastCandle = await getLastCandles()
                if (lastCandle !== signal.lastCandle) {
                    await new Promise((resolve) => setTimeout(resolve, 50000))
                    lastCandle = await getLastCandles()
                    if (lastCandle !== signal.lastCandle) {
                        await new Promise((resolve) => setTimeout(resolve, 50000))
                        lastCandle = await getLastCandles()
                        if (lastCandle !== signal.lastCandle) {
                            loadSend.fail('SINAL NÃO PASSOU NA ANALISE!')
                            await new Promise((resolve) => setTimeout(resolve, 5000))
                            return
                        }
                    }
                }
            }

            if (signal.action === "CALL") {
                await page.mouse.click(1440, 410)
                loadSend.succeed('SINAL ' + signal.string + ' ENVIADO AS ' + moment().format('HH:mm:ss'))
            } else if (signal.action === "PUT") {
                await page.mouse.click(1440, 530)
                loadSend.succeed('SINAL ' + signal.string + ' ENVIADO AS ' + moment().format('HH:mm:ss'))
            } else {
                loadSend.fail('SINAL NÃO PASSOU NA ANALISE!')
            }

            await new Promise((resolve) => setTimeout(resolve, 5000))
        } catch (error) {
            loadSend.fail('ERRO AO ENVIAR O SINAL PARA A CORRETORA! ' + error.message)
        }
    }


const getLastCandles = async () => {
        await page.screenshot({
            path: 'candle.png',
            clip: {
                x: 835,
                y: 180,
                width: 15,
                height: 360
            }
        });
        await new Promise((resolve) => setTimeout(resolve, 500))
        const colors = await getColors('./candle.png')
        let red = 0;
        let green = 0;
        for (let i = 0; i < colors.length; i++) {
            red += colors[i].rgb()[0] + 10;
            green += colors[i].rgb()[1];
        }

        if (red > green) {
            return 'PUT'
        } else
            return 'CALL'

    }


    module.exports = {
        connect,
        runSignal
    }