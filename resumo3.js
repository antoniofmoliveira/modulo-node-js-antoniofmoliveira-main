//versão orientada a evento

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
//eventos
const EVENTO_MENSAGEM = "mensagem";
const EVENTO_PEGAR_NOME_ARQUIVO = "pegarNomeArquivo";
const EVENTO_NOME_ARQUIVO_DISPONIVEL = "nomeArquivoDisponivel";
const EVENTO_DADOS_DISPONIVEIS = "dadosDisponiveis";
const EVENTO_PROCESSAMENTO_FINALIZADO = "ProcessamentoFinalizado";
const EVENTO_RESUMO_DISPONIVEL = "resumoExibido";
const EVENTO_FINALIZAR_PROGRAMA = "finalizarPrograma";
const EVENTO_HOUVE_FALHA = "houveFalha";


// exibe uma mensagem na tela
const mensagem = async (texto) => {
    console.log(texto);
};

// exibição do resumo de cada arquivo. resposta é um objeto com 2 propriedades
// emite evento EVENTO_RESUMO_DISPONIVEL
const exibeResumo = async (resposta) => {
    try {
        ee.emit(
            EVENTO_MENSAGEM,
            `A soma dos números isolado nas linhas do arquivo é ${resposta.somaNumeros}.
${resposta.linhasTexto} linhas contém texto que não são apenas números.\n`
        );
    } catch (erro) {
        ee.emit(EVENTO_MENSAGEM, erro);
    }
    ee.emit(EVENTO_RESUMO_DISPONIVEL, null);
};

// faz a leitura do arquivo
// emite evento EVENTO_DADOS_DISPONIVEIS ou EVENTO_HOUVE_FALHA
const obtemConteudo = async (nomeArquivo) => {
    try {
        // obtendo conteúdo do arquivo
        const data = await fs.readFile(nomeArquivo.nomeArquivo, "utf8");
        ee.emit(EVENTO_DADOS_DISPONIVEIS, data);
    } catch (err) {
        ee.emit(EVENTO_MENSAGEM, "Erro na leitura do arquivo: " + err);
        ee.emit(EVENTO_HOUVE_FALHA, null);
    }
};

// processa arquivo
// emite evento EVENTO_PROCESSAMENTO_FINALIZADO
const processaArquivo = async (data) => {
    try {
        // acumuladores conforme solicitado pela tarefa
        let linhasTexto = 0;
        let somaNumeros = 0;
        // cria array com as linhas do arquivo
        const linhas = data.split(/\r?\n/);
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
        ee.emit(EVENTO_PROCESSAMENTO_FINALIZADO, {
            somaNumeros,
            linhasTexto,
        });
    } catch (error) {
        ee.emit(EVENTO_MENSAGEM, "Erro no processamento do arquivo" + error);
        ee.emit(EVENTO_HOUVE_FALHA, null);
    }
};

// obtem nome do arquivo
// emite eventos EVENTO_NOME_ARQUIVO_DISPONIVEL
const obtemNomeArquivo = async () => {
    const nomeArquivo = await rl.question(`Informe o caminho do arquivo `);
    ee.emit(EVENTO_MENSAGEM, `\nResumo do tratamento do arquivo '${nomeArquivo}':`);
    ee.emit(EVENTO_NOME_ARQUIVO_DISPONIVEL, {
        nomeArquivo,
    });
};

// pergunda se processa novo arquivo
// emite eventos EVENTO_PEGAR_NOME_ARQUIVO e EVENTO_FINALIZAR_PROGRAMA 
const perguntaSeContinua = async () => {
    // executa novamente? somente aceita S maiúscula qualquer outro encerra
    const res = await rl.question("\nNovamente? (S/N) ");
    const continua = res === "S";
    if (continua) ee.emit(EVENTO_PEGAR_NOME_ARQUIVO, null);
    else {
        ee.emit(EVENTO_FINALIZAR_PROGRAMA, null);
    }
};

const finalizaPrograma = () => {
    rl.close();
    console.timeEnd("A execução demorou");
    process.exit(0);
};

// usando on porque vários arquivos podem ser processados
ee.on(EVENTO_MENSAGEM, mensagem);
ee.on(EVENTO_PEGAR_NOME_ARQUIVO, obtemNomeArquivo);
ee.on(EVENTO_NOME_ARQUIVO_DISPONIVEL, obtemConteudo);
ee.on(EVENTO_DADOS_DISPONIVEIS, processaArquivo);
ee.on(EVENTO_PROCESSAMENTO_FINALIZADO, exibeResumo);
ee.on(EVENTO_RESUMO_DISPONIVEL, perguntaSeContinua);
ee.on(EVENTO_HOUVE_FALHA, perguntaSeContinua);
ee.on(EVENTO_FINALIZAR_PROGRAMA, finalizaPrograma);

ee.emit(EVENTO_PEGAR_NOME_ARQUIVO, null);
