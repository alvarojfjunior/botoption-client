const fs = require("fs");
const { auth } = require("./services/firebase");
const ora = require("ora");


const handleAuth = async () => {
  const loadAuth = ora('VERIFICANDO CREDENCIAIS DE ACESSO ...').start();
  let credentials = {
    auth: false,
    iqbotEmail: "",
    iqbotPassword: "",
    iqEmail: "",
    iqPassword: ""
  };

  fs.readFileSync("./CREDENCIAIS.txt", "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      line.split("EMAIL DO BOT=")[1]
        ? (credentials.iqbotEmail = String(line.split("EMAIL DO BOT=")[1]))
        : "";
      line.split("SENHA DO BOT=")[1]
        ? (credentials.iqbotPassword = String(line.split("SENHA DO BOT=")[1]))
        : "";
      line.split("EMAIL DA IQ OPTION=")[1]
        ? (credentials.iqEmail = String(line.split("EMAIL DA IQ OPTION=")[1]))
        : "";
      line.split("SENHA DA IQ OPTION=")[1]
        ? (credentials.iqPassword = String(
            line.split("SENHA DA IQ OPTION=")[1]
          ))
        : "";
    });

  try {
    await auth.signInWithEmailAndPassword(
      credentials.iqbotEmail,
      credentials.iqbotPassword,
    );
    credentials.auth = true;
    loadAuth.succeed('AUTORIZADO!')
    return credentials;
  } catch (error) {
    loadAuth.fail('HOUVE UMA FALHA COM AS CREDENCIAIS DE ACESSO!' + error.message)
    return credentials
  }
};

module.exports = {
  handleAuth
}