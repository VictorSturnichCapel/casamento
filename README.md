# 💍 Site de Casamento - Ana & Victor

Este é o site oficial para o casamento de Ana & Victor. O projeto é um site estático(frontend-only) moderno e responsivo, focado em interatividade e facilidade para os convidados, com integração direta ao Google Sheets para gerenciamento de dados.

## 🚀 Funcionalidades

* **Contagem Regressiva:** Cronômetro dinâmico para o dia da festa e contador de tempo de relacionamento.
* **Lista de Presentes (Pix):**
    * Carrega a lista de presentes via planilha do Google (CSV).
    * **Gerador de Pix Automático:** Cria o QR Code e o código "Copia e Cola" instantaneamente no navegador (sem backend), calculado com base no valor do presente.
    * Botão de envio de comprovante via WhatsApp.
* **RSVP (Confirmação de Presença):** Formulário integrado que envia os dados diretamente para uma aba da planilha.
* **Mural de Recados:** Espaço para convidados deixarem mensagens, que são exibidas dinamicamente após aprovação/envio.
* **Vibe da Festa:** Integração com Spotify para dar o tom do evento.

## 📂 Estrutura de Arquivos

O projeto foi refatorado para separar responsabilidades e facilitar a manutenção:

```text
/projeto-casamento
│
├── index.html          # Arquivo principal (Estrutura)
├── README.md           # Documentação do projeto
│
├── css/
│   └── style.css       # Estilos visuais (Cores, Fontes, Responsividade)
│
└── js/
    ├── config.js       # CONFIGURAÇÕES (Edite seus dados aqui)
    └── script.js       # Lógica do site (Não edite a menos que necessário)

