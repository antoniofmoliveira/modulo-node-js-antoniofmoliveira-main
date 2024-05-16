import { createInterface } from "readline";
import fs from "fs";
import { EventEmitter, once } from "node:events";

console.time("A execução demorou");

let linhasTexto = 0;
let somaNumeros = 0;
const ee = new EventEmitter();

const exibeResumo = async () => {
    try {
        const [event] = await once(ee, "finalizado");
        console.log(`\nResumo do tratamento do arquivo '${event}':`);
        console.log(
            `A soma dos números isolado nas linhas do arquivo é ${somaNumeros}.`
        );
        console.log(
            `${linhasTexto} linhas contém texto que não são apenas números.\n`
        );
        linhasTexto = 0;
        somaNumeros = 0;
        console.log("\nNovamente? (S/N) ");
    } catch (erro) {
        console.log(erro);
    }
};

const leitor = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const pergunta = (prompt) => {
    return new Promise((resolve) =>
        leitor.question(prompt, (res) => resolve(res))
    );
};

const processaUm = async (nomeArquivo) => {
    exibeResumo();
    fs.readFile(nomeArquivo, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const linhas = data.split("\n");
        for (const linha of linhas) {
            // console.log(linha);
            if (linha.trim() === "") continue;
            const num = parseInt(linha);
            if (isNaN(num) || num != linha) {
                linhasTexto += 1;
                continue;
            }
            somaNumeros += isNaN(parseInt(linha)) ? 0 : parseInt(linha);
        }
        ee.emit("finalizado", nomeArquivo);
    });
    return true;
};

const processaVarios = async () => {
    let continua = true;
    while (continua) {
        const nomeArquivo = await pergunta(`Informe o caminho do arquivo `);
        const proc = await processaUm(nomeArquivo);
        const res = await pergunta("");
        continua = res === "S";
    }
};

const main = async () => {
    await processaVarios();
    leitor.close();
    console.timeEnd("A execução demorou");
    process.exit(0);
};

main();

// /home/antonio/DEV/modulo-node-js-antoniofmoliveira/arquivo.txt

/*
$ node resumo.js 
Informe o caminho do arquivo /home/antonio/DEV/modulo-node-js-antoniofmoliveira/arquivo.txt
 
Resumo do tratamento do arquivo '/home/antonio/DEV/modulo-node-js-antoniofmoliveira/arquivo.txt':
A soma dos números isolado nas linhas do arquivo é 55.
3 linhas contém texto que não são apenas números.


Novamente? (S/N) 
S
Informe o caminho do arquivo /home/antonio/DEV/modulo-node-js-antoniofmoliveira/arquivo.txt
 
Resumo do tratamento do arquivo '/home/antonio/DEV/modulo-node-js-antoniofmoliveira/arquivo.txt':
A soma dos números isolado nas linhas do arquivo é 55.
3 linhas contém texto que não são apenas números.


Novamente? (S/N) 
n
A execução demorou: 16.600s
*/