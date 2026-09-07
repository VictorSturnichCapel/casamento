// js/script.js

// Importando configurações do objeto global definido em config.js
const { pix, google, casamento } = window.EnvConfig;

const csvPresentes = `https://docs.google.com/spreadsheets/d/${google.sheetID}/export?format=csv&gid=${google.gidPresentes}`;
const csvComentarios = `https://docs.google.com/spreadsheets/d/${google.sheetID}/export?format=csv&gid=${google.gidComentarios}`;

// === CLASSE GERADORA DE PIX (CRC16) ===
class PixGenerator {
    constructor(chave, nome, cidade, valor, mensagem) {
        this.chave = chave;
        this.nome = this.limparTexto(nome, 25);
        this.cidade = this.limparTexto(cidade, 15);
        this.valor = valor.toFixed(2);
        this.mensagem = this.limparId(mensagem || "", 25);
    }

    limparTexto(t, m) { return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().substring(0, m); }
    limparId(t, m) { return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, m); }
    formatar(id, valor) { const len = valor.length.toString().padStart(2, "0"); return `${id}${len}${valor}`; }

    gerarPayload() {
        const payloadKey = `0014BR.GOV.BCB.PIX01${this.chave.length.toString().padStart(2, "0")}${this.chave}`;
        const txId = this.mensagem.length > 0 ? this.mensagem : "***";
        
        let payload = this.formatar("00", "01") + 
                      this.formatar("26", payloadKey) + 
                      this.formatar("52", "0000") + 
                      this.formatar("53", "986") +
                      this.formatar("54", this.valor) + 
                      this.formatar("58", "BR") + 
                      this.formatar("59", this.nome) + 
                      this.formatar("60", this.cidade) +
                      this.formatar("62", this.formatar("05", txId)) + "6304";
        
        return payload + this.crc16(payload);
    }

    crc16(payload) {
        let crc = 0xFFFF;
        for (let i = 0; i < payload.length; i++) {
            crc ^= payload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
                else crc = crc << 1;
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    }
}

// === LÓGICA DE INTERFACE ===

document.addEventListener('DOMContentLoaded', () => {
    inicializarContadores();
    carregarPresentes();
    carregarComentarios();
    configurarFormularios();
    configurarModal();
});

function inicializarContadores() {
    const dataNamoro = new Date(casamento.dataNamoro);
    const dataFesta = new Date(casamento.dataFesta);

    function atualizar() {
        const agora = new Date();
        const diasNamoro = Math.floor((agora - dataNamoro) / (1000 * 60 * 60 * 24));
        document.getElementById('tempo-namoro').innerText = `${Math.floor(diasNamoro / 365)} anos`;

        const difFesta = Math.floor((dataFesta - agora) / (1000 * 60 * 60 * 24));
        document.getElementById('tempo-festa').innerText = difFesta > 0 ? `Faltam ${difFesta} dias!` : "É hoje! 🎉";
    }
    atualizar();
}

function enviarParaGoogle(formulario) {
    return fetch(google.scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(formulario)
    });
}

// === FORMULÁRIOS ===
function configurarFormularios() {
    // RSVP
    const formRsvp = document.forms['form-presenca'];
    const btnRsvp = document.getElementById('btn-rsvp');
    const msgRsvp = document.getElementById('msg-rsvp');

    formRsvp.addEventListener('submit', e => {
        e.preventDefault();
        btnRsvp.disabled = true; 
        btnRsvp.innerText = "Enviando...";
        
        enviarParaGoogle(formRsvp)
            .then(() => {
                msgRsvp.style.display = "block";
                msgRsvp.innerText = "Presença confirmada com sucesso! Obrigado.";
                formRsvp.reset();
                btnRsvp.disabled = false;
                btnRsvp.innerText = "Enviar Confirmação";
            })
            .catch(error => { console.error('Erro no envio', error); btnRsvp.disabled = false; });
    });

    // Mensagens
    const formMsg = document.forms['form-comentarios'];
    const btnMsg = document.getElementById('btn-msg');
    const statusMsg = document.getElementById('msg-status');

    formMsg.addEventListener('submit', e => {
        e.preventDefault();
        btnMsg.disabled = true; 
        btnMsg.innerText = "Enviando..."; 
        statusMsg.style.display = "none";
        
        enviarParaGoogle(formMsg)
            .then(() => {
                statusMsg.style.display = "block";
                statusMsg.style.color = "green";
                statusMsg.innerHTML = "Recebemos sua mensagem! ❤️";
                formMsg.reset();
                btnMsg.disabled = false;
                btnMsg.innerText = "Enviar Mensagem";
                setTimeout(carregarComentarios, 4000); 
            })
            .catch(() => { 
                statusMsg.style.display = "block"; 
                statusMsg.innerText = "Erro ao enviar."; 
                btnMsg.disabled = false; 
            });
    });

    const formPresenteLoja = document.forms['form-presente-loja'];
    const btnPresenteLoja = document.getElementById('btn-presente-loja');
    const msgPresenteLoja = document.getElementById('msg-presente-loja');

    formPresenteLoja.addEventListener('submit', e => {
        e.preventDefault();
        btnPresenteLoja.disabled = true;
        btnPresenteLoja.innerText = "Enviando...";
        msgPresenteLoja.style.display = "none";

        enviarParaGoogle(formPresenteLoja)
            .then(() => {
                msgPresenteLoja.style.display = "block";
                msgPresenteLoja.style.color = "green";
                msgPresenteLoja.innerText = "Presente confirmado com sucesso! Obrigado. ❤️";
                formPresenteLoja.reset();
                btnPresenteLoja.disabled = false;
                btnPresenteLoja.innerText = "Enviar Confirmação";
            })
            .catch(() => {
                msgPresenteLoja.style.display = "block";
                msgPresenteLoja.style.color = "#b00020";
                msgPresenteLoja.innerText = "Não foi possível enviar. Tente novamente.";
                btnPresenteLoja.disabled = false;
                btnPresenteLoja.innerText = "Enviar Confirmação";
            });
    });
}

// === GOOGLE SHEETS (PAPA PARSE) ===
function carregarPresentes() {
    Papa.parse(csvPresentes, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const containers = {
                loja: document.getElementById('lista-presentes-loja'),
                pix: document.getElementById('lista-presentes-pix')
            };
            const loader = document.getElementById('loading-presentes');
            const selectPresente = document.getElementById('presente-comprado');
            if(loader) loader.style.display = 'none';

            Object.values(containers).forEach(container => {
                if (container) container.innerHTML = '';
            });

            if (selectPresente) {
                selectPresente.innerHTML = '<option value="">Selecione o presente comprado</option>';
            }

            results.data.forEach(item => {
                if (!item.Item) return;

                const cotasNumericas = obterCotas(item.Cotas);
                if (cotasNumericas === 0) return;
                
                let foto = item.Foto && item.Foto.startsWith('http') ? item.Foto : 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=60';
                let cotas = item.Cotas ? `${item.Cotas} cotas` : "Disponível";
                const linkCompra = obterLinkCompra(item);
                const acao = linkCompra
                    ? `<a class="btn-zap js-link-compra" href="${escaparHtml(linkCompra)}" target="_blank" rel="noopener noreferrer">🛒 Comprar presente</a>`
                    : `<button class="btn-zap js-btn-presentear" data-item="${escaparHtml(item.Item)}" data-valor="${escaparHtml(item.Valor)}">🎁 Presentear</button>`;

                const card = document.createElement('div');
                card.className = 'card';
                
                // Criação segura do botão com event listener
                card.innerHTML = `
                    <img src="${foto}" class="card-img" alt="${item.Item}">
                    <div class="card-body">
                        <div>
                            <div class="card-title">${item.Item}</div>
                            <div class="card-cotas">${cotas}</div>
                            <div class="card-price">R$ ${item.Valor}</div>
                        </div>
                        ${acao}
                    </div>`;
                
                // Adiciona evento ao botão recém criado
                const botaoPresentear = card.querySelector('.js-btn-presentear');
                if (botaoPresentear) {
                    botaoPresentear.addEventListener('click', function() {
                        abrirModalPix(this.dataset.item, this.dataset.valor);
                    });
                }

                const categoria = linkCompra ? 'loja' : 'pix';
                containers[categoria].appendChild(card);

                if (selectPresente) {
                    const option = document.createElement('option');
                    option.value = item.Item;
                    option.textContent = item.Item;
                    selectPresente.appendChild(option);
                }
            });

            configurarBotaoVerMais(containers.loja, document.getElementById('btn-mais-loja'));
            configurarBotaoVerMais(containers.pix, document.getElementById('btn-mais-pix'));

            if (selectPresente && selectPresente.options.length === 1) {
                selectPresente.innerHTML = '<option value="">Nenhum presente disponível no momento</option>';
                selectPresente.disabled = true;
            }
        }
    });
}

function configurarBotaoVerMais(container, botao) {
    if (!container || !botao) return;

    const cards = Array.from(container.children);
    const quantidadeInicial = 3;
    botao.hidden = cards.length <= quantidadeInicial;
    botao.innerText = 'Ver mais presentes';

    cards.slice(quantidadeInicial).forEach(card => card.classList.add('card-oculto'));
    botao.onclick = () => {
        const expandido = botao.dataset.expandido === 'true';
        cards.slice(quantidadeInicial).forEach(card => card.classList.toggle('card-oculto', expandido));
        botao.dataset.expandido = String(!expandido);
        botao.innerText = expandido ? 'Ver mais presentes' : 'Ver menos';
    };
}

function obterCotas(valor) {
    if (valor === undefined || valor === null || String(valor).trim() === '') return null;
    const cotas = Number(String(valor).replace(',', '.').trim());
    return Number.isFinite(cotas) ? cotas : null;
}

function obterLinkCompra(item) {
    const link = (item.Link || item.URL || item.Url || item.Site || '').trim();
    if (!link) return '';

    try {
        const url = new URL(link);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (error) {
        return '';
    }
}

function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function carregarComentarios() {
    Papa.parse(csvComentarios, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const container = document.getElementById('lista-recados');
            container.innerHTML = '';
            
            const msgs = results.data.reverse();
            if (msgs.length === 0) {
                container.innerHTML = '<p class="text-center color-gray">Sem recados.</p>';
                return;
            }

            msgs.forEach(m => {
                if(m.Nome && m.Mensagem) {
                    let d = "";
                    try { d = new Date(m.Data).toLocaleDateString('pt-BR'); } catch(e){}
                    
                    const div = document.createElement('div');
                    div.className = 'recado-item';
                    div.innerHTML = `<strong>${m.Nome} <span class="data">${d}</span></strong><p>${m.Mensagem}</p>`;
                    container.appendChild(div);
                }
            });
        }
    });
}

// === MODAL PIX ===
const modal = document.getElementById('modal-pix');
const btnCopiar = document.querySelector('.btn-copiar');
const divCopiaCola = document.getElementById('pix-copia-cola');

function configurarModal() {
    const closeBtn = document.querySelector('.close-btn');
    const overlay = document.querySelector('.modal-overlay');

    const fechar = () => modal.style.display = "none";
    closeBtn.addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) fechar(); });

    // Botão de copiar
    const copiarAcao = () => {
        navigator.clipboard.writeText(divCopiaCola.innerText)
            .then(() => alert("Código copiado!"))
            .catch(() => alert("Erro ao copiar, tente selecionar manualmente."));
    };

    btnCopiar.addEventListener('click', copiarAcao);
    divCopiaCola.addEventListener('click', copiarAcao);
}

function abrirModalPix(item, valorStr) {
    let valorNumerico = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
    if(isNaN(valorNumerico)) valorNumerico = 0;

    const gerador = new PixGenerator(pix.chave, pix.nomeBeneficiario, pix.cidadeBeneficiario, valorNumerico, `Presente ${item}`);
    const payload = gerador.gerarPayload();

    new QRious({
        element: document.getElementById('qr-code'),
        value: payload,
        size: 200,
        level: 'M'
    });

    document.getElementById('modal-titulo').innerText = item;
    document.getElementById('modal-valor').innerText = `R$ ${valorStr}`;
    divCopiaCola.innerText = payload;

    const btnZap = document.getElementById('btn-zap-confirmar');
    btnZap.onclick = function() {
        const texto = `Olá! Paguei o Pix do presente: *${item}*!`;
        window.open(`https://wa.me/${casamento.telefoneNoivos}?text=${encodeURIComponent(texto)}`, '_blank');
    };

    modal.style.display = "flex";
}

// Tempo total da introdução em milissegundos (16s da animação + 1s do fade out)
    const tempoDaIntro = 17000; 

  setTimeout(() => {
    // Restaura o scroll do site principal
    document.body.style.overflow = 'auto';
    
    // Remove a camada de introdução completamente
    const intro = document.getElementById('intro-sequencia');
    if (intro) {
      intro.remove();
    }
  }, tempoDaIntro);