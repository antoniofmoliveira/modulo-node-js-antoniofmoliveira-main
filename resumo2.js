/*
Usando as versões promise de readline e fs
*/

import * as readline from "node:readline/promises";
import { promises as fs } from "fs";
import { EventEmitter } from "node:events";
import { stdin as input, stdout as output } from "node:process";

// um label mais esclarecedor para contagem de tempos
console.time("A execução demorou");

// criando a interface promise de readline
process.stdin.setEncoding("utf8");
const rl = readline.createInterface({ input, output });

// tratamento de eventos
const ee = new EventEmitter();
// exibição do resumo de cada arquivo. resposta é um objeto com 3 propriedades
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
// usando on porque vários arquivos podem ser processados
ee.on("finalizado", exibeResumo);

// função principal
const main = async () => {
    // controle do loop
    let continua = true;

    while (continua) {
        // obtem nome do arquivo
        const nomeArquivo = await rl.question(`Informe o caminho do arquivo `);
        try {
            // obtendo conteúdo do arquivo
            const data = await fs.readFile(nomeArquivo, "utf8");
            // acumuladores conforme solicitado pela tarefa
            let linhasTexto = 0;
            let somaNumeros = 0;
            // cria array com as linhas do arquivo. para windows use \r\n
            const linhas = data.split("\n");
            // tratamento de cada linha
            for (const linha of linhas) {
                // a linha está vazia então é ignorada
                if (linha.trim().length === 0) continue;
                const num = parseInt(linha);
                // a linha contém texto ou um número seguido por texto
                if (isNaN(num) || num != linha) {
                    linhasTexto += 1;
                    continue;
                }
                // a linha é um número
                somaNumeros += num;
            }
            // emite evento finalizado para o arquivo com um objeto com as respostas
            ee.emit("finalizado", {
                nomeArquivo,
                somaNumeros,
                linhasTexto,
            });
        } catch (error) {
            console.log(error);
        }
        // executa novamente? somente aceita S maiúscula qualquer outro encerra
        const res = await rl.question("\nNovamente? (S/N) ");
        continua = res === "S";
    }
    // fecha readline, exibe tempo de execução e termina limpo
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
