const { connect, runSignal } = require("./iqoption");
const { handleAuth, } = require("./credentials");
const socket = require("socket.io-client")
const io = socket('https://botoption-server.herokuapp.com')


let isRunningSignal = false;
try {
    handleAuth().then(async credentials => {
        if (!credentials.auth) return;
        const page = await connect(credentials.iqEmail, credentials.iqPassword);
        if (!page) throw ""
        io.on("signal", async msg => {
            if (!isRunningSignal) {
                isRunningSignal = true;
                await runSignal(msg)
                isRunningSignal = false;
            }
        });
    })
} catch (error) {
    console.log('HOUVE UM ERRO: ', error.message)
}
