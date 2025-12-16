// js/config.js
const CONFIG = {
    pix: {
        chave: "afa3a946-b3c1-43ae-bc97-4f1b7387fe8f",
        nomeBeneficiario: "VICTOR CAPEL",
        cidadeBeneficiario: "SAO PAULO"
    },
    google: {
        sheetID: '1NryZ06jny6ugQ4Fefnr0c5KYZWKz8qDJfeaDBVQ_pJI',
        scriptURL: 'https://script.google.com/macros/s/AKfycbzw4VwRUZR8wCTz9mJNWyV3hmaH8XnUFsIBqMV7ybBo-K0ln3LWErl1vl-5ElB2L-dH1Q/exec',
        // IDs das abas (gids)
        gidPresentes: '0',
        gidComentarios: '608484924'
    },
    casamento: {
        telefoneNoivos: '5511998531136',
        dataNamoro: "2019-03-09T00:00:00",
        dataFesta: "2026-11-28T00:00:00"
    }
};

// Exporta para uso global (janela do navegador)
window.EnvConfig = CONFIG;