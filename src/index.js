const { connect, runSignal } = require("./iqoption");
const { handleAuth, } = require("./credentials");
const net = require("net");


const signal = {
    m: 5,
    pair: 'EURUSD',
    action: 'PUT'
}

try {
    handleAuth().then(async credentials => {
        if (!credentials.auth) return;
        const page = await connect(credentials.iqEmail, credentials.iqPassword);
        await runSignal(signal)
        await runSignal(signal)
        await runSignal(signal)
        await runSignal(signal)
        await runSignal(signal)
    })
} catch (error) {
    console.log('HOUVE UM ERRO: ', error.message)
}
