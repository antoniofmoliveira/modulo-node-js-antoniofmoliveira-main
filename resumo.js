/*
Usando as versões promise de fs e envolvendo readline em uma promise
*/
'use strict'
import { createInterface } from "readline";
import { promises as fs } from "fs";
import { EventEmitter } from "node:events";

// um label mais esclarecedor para contagem de tempos
console.time("A execução demorou");

// criando a interface de readline
const leitor = createInterface({
    input: process.stdin,
    output: process.stdout,
});
// envolvendo readline em uma promise
const pergunta = (prompt) => {
    return new Promise((resolve) =>
        leitor.question(prompt, (res) => resolve(res))
    );
};

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

// função que trata apenas um arquivo
const processaUm = async (nomeArquivo) => {
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
};

// função que controla o laço para tramento de vários arquivos
const processaVarios = async () => {
    // controle do loop
    let continua = true;

    while (continua) {
        // obtem nome do arquivo
        const nomeArquivo = await pergunta(`Informe o caminho do arquivo `);
        // processa o arquivo
        const proc = await processaUm(nomeArquivo);
        // executa novamente? somente aceita S maiúscula qualquer outro encerra
        const res = await pergunta("\nNovamente? (S/N) ");
        continua = res === "S";
    }
};

// função de início do programa
const main = async () => {
    // executa rotina principal
    await processaVarios();
    // fecha readline, exibe tempo de execução e termina limpo
    leitor.close();
    console.timeEnd("A execução demorou");
    process.exit(0);
};

main();

/*
$node resumo
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
    at async processaUm (file:///home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/resumo.js:73:22)
    at async processaVarios (file:///home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/resumo.js:106:22)
    at async main (file:///home/antonio/Downloads/modulo-node-js-antoniofmoliveira-main/resumo.js:114:5) {
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
A execução demorou: 35.912s
*/
