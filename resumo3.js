//versão totalmente orientada a evento

"use strict";
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
//emite evento resumoExibido
const exibeResumo = async (resposta) => {
    try {
        console.log(
            `A soma dos números isolado nas linhas do arquivo é ${resposta.somaNumeros}.`
        );
        console.log(
            `${resposta.linhasTexto} linhas contém texto que não são apenas números.\n`
        );
        ee.emit("resumoExibido", null);
    } catch (erro) {
        console.log(erro);
    }
};

// faz a leitura do arquivo
// emite evento dadosDisponiveis ou falhaNaLeitura
const obtemConteudo = async (nomeArquivo) => {
    try {
        // obtendo conteúdo do arquivo
        const data = await fs.readFile(nomeArquivo.nomeArquivo, "utf8");
        ee.emit("dadosDisponiveis", data);
    } catch (err) {
        console.log("Erro na leitura do arquivo: " + err);
        ee.emit("falhaNaLeitura", null);
    }
};

// processa arquivo
// emite evento finalizado
const processaArquivo = async (data) => {
    try {
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
            somaNumeros,
            linhasTexto,
        });
    } catch (error) {
        console.log(error);
    }
};

// obtem nome do arquivo
// emite eventos temNovoNome
const obtemNomeArquivo = async () => {
    const nomeArquivo = await rl.question(`Informe o caminho do arquivo `);
    console.log(`\nResumo do tratamento do arquivo '${nomeArquivo}':`);
    ee.emit("temNovoNome", {
        nomeArquivo,
    });
};

// pergunda se processa novo arquivo
// emite eventos pegarNomeArquivo
const perguntaSeContinua = async () => {
    // executa novamente? somente aceita S maiúscula qualquer outro encerra
    const res = await rl.question("\nNovamente? (S/N) ");
    const continua = res === "S";
    if (continua) ee.emit("pegarNomeArquivo", null);
    else {
        finalizaPrograma();
    }
};

const finalizaPrograma = () => {
    rl.close();
    console.timeEnd("A execução demorou");
    process.exit(0);
};

// usando on porque vários arquivos podem ser processados
ee.on("pegarNomeArquivo", obtemNomeArquivo);
ee.on("temNovoNome", obtemConteudo);
ee.on("dadosDisponiveis", processaArquivo);
ee.on("finalizado", exibeResumo);
ee.on("resumoExibido", perguntaSeContinua);
ee.on("falhaNaLeitura", perguntaSeContinua);

ee.emit("pegarNomeArquivo", null);
