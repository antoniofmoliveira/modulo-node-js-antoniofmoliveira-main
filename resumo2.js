import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { promises as fs } from "fs";
import { EventEmitter } from "node:events";

console.time("A execução demorou");

const ee = new EventEmitter();

process.stdin.setEncoding("utf8");

const exibeResumo = async (resposta) => {
    try {
        console.log(
            `\nResumo do tratamento do arquivo '${resposta.nomeArquivo}':`
        );
        console.log(
            `A soma dos números isolado nas linhas do arquivo é ${resposta.somaNumeros}.`
        );
        console.log(
            `${resposta.linhasTexto} linhas contém texto que não são apenas números.\n`
        );
    } catch (erro) {
        console.log(erro);
    }
};

ee.on("finalizado", exibeResumo);

const rl = readline.createInterface({ input, output });

const main = async () => {
    let continua = true;

    while (continua) {
        const nomeArquivo = await rl.question(`Informe o caminho do arquivo `);
        try {
            const data = await fs.readFile(nomeArquivo, "utf8");

            let linhasTexto = 0;
            let somaNumeros = 0;

            const linhas = data.split("\n");
            for (const linha of linhas) {
                if (linha.trim().length === 0) continue;
                const num = parseInt(linha);
                if (isNaN(num) || num != linha) {
                    linhasTexto += 1;
                    continue;
                }
                somaNumeros += num;
            }

            ee.emit("finalizado", {
                nomeArquivo,
                somaNumeros,
                linhasTexto,
            });
        } catch (error) {
            console.log(error);
        }
        const res = await rl.question("\nNovamente? (S/N) ");
        continua = res === "S";
    }

    rl.close;
    console.timeEnd("A execução demorou");
    process.exit(0);
};

main();

/*
$ node resumo2
Informe o caminho do arquivo /home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.txt

Resumo do tratamento do arquivo '/home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.txt':
A soma dos números isolado nas linhas do arquivo é 55.
3 linhas contém texto que não são apenas números.


Novamente? (S/N) S
Informe o caminho do arquivo /home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo2.txt

Resumo do tratamento do arquivo '/home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo2.txt':
A soma dos números isolado nas linhas do arquivo é 75.
3 linhas contém texto que não são apenas números.


Novamente? (S/N) S
Informe o caminho do arquivo /home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.tx
Error: ENOENT: no such file or directory, open '/home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.tx'
    at async open (node:internal/fs/promises:641:25)
    at async Object.readFile (node:internal/fs/promises:1254:14)
    at async main (file:///home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/resumo2.js:38:26) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.tx'
}

Novamente? (S/N) S
Informe o caminho do arquivo /home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.txt

Resumo do tratamento do arquivo '/home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/arquivo.txt':
A soma dos números isolado nas linhas do arquivo é 55.
3 linhas contém texto que não são apenas números.


Novamente? (S/N) 
A execução demorou: 35.594s
*/
