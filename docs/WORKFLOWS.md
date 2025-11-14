# Diagramas de Fluxo - Innexar ERP

## 📊 Fluxos Operacionais Detalhados

### 1. Fluxo Completo de Vendas (Order to Cash)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MÓDULO CRM / VENDAS                            │
└─────────────────────────────────────────────────────────────────────────┘

[1] PROSPECÇÃO
    │
    ├─> Lead capturado (Site, Formulário, Importação)
    │   ├─> Qualificação automática (Lead Scoring)
    │   ├─> Atribuição ao vendedor (Round Robin / Regras)
    │   └─> Enrichment (busca dados na Receita Federal)
    │
    └─> Status: "Open" → "Contacted" → "Qualified"

[2] OPORTUNIDADE
    │
    ├─> Lead convertido em Opportunity
    │   ├─> Define produtos/serviços de interesse
    │   ├─> Valor estimado
    │   ├─> Probabilidade de fechamento
    │   └─> Data prevista de fechamento
    │
    ├─> Pipeline de Vendas
    │   Stage 1: Qualificação      (20% probabilidade)
    │   Stage 2: Proposta          (40% probabilidade)
    │   Stage 3: Negociação        (60% probabilidade)
    │   Stage 4: Fechamento        (90% probabilidade)
    │
    └─> Ações automáticas:
        ├─> Lembrete de follow-up (email/task)
        ├─> Notificação de inatividade (>7 dias)
        └─> Alerta de oportunidade "quente"

[3] COTAÇÃO / ORÇAMENTO
    │
    ├─> Quotation criada da Opportunity
    │   ├─> Seleção de produtos (catálogo)
    │   ├─> Tabela de preços automática
    │   │   ├─> Por cliente
    │   │   ├─> Por região
    │   │   ├─> Por volume
    │   │   └─> Promoções ativas
    │   │
    │   ├─> Cálculo de impostos
    │   │   ├─> ICMS (por UF origem/destino)
    │   │   ├─> IPI (NCM do produto)
    │   │   ├─> PIS/COFINS
    │   │   └─> ISS (se serviço)
    │   │
    │   ├─> Desconto
    │   │   ├─> Aprovação automática até X%
    │   │   └─> Workflow se > X%
    │   │
    │   └─> Condições de pagamento
    │       ├─> À vista / Parcelado
    │       └─> Cálculo de juros
    │
    ├─> Envio da cotação
    │   ├─> Email com PDF formatado
    │   ├─> Link para aprovação online
    │   └─> Validade (ex: 7 dias)
    │
    └─> Status:
        ├─> "Sent" → Cliente recebeu
        ├─> "Viewed" → Cliente abriu (tracking)
        ├─> "Accepted" → Cliente aprovou
        └─> "Lost" → Cliente recusou

[4] PEDIDO DE VENDA (Sales Order)
    │
    ├─> Criado da Quotation (se aprovada)
    │   ou manualmente
    │
    ├─> Validações:
    │   ├─> Cliente ativo?
    │   ├─> Limite de crédito OK? ─┐
    │   ├─> Produtos disponíveis? ─┼─> Se NÃO → Workflow de aprovação
    │   └─> Desconto dentro do limite?─┘
    │
    ├─> Reserva de Estoque
    │   ├─> Verifica disponibilidade
    │   ├─> Reserva automática (soft lock)
    │   └─> Se insuficiente:
    │       ├─> Alerta compras
    │       ├─> Backorder automático
    │       └─> Notifica cliente (prazo)
    │
    ├─> Workflow de Aprovação (se necessário)
    │   ├─> Gerente de Vendas (desconto > 10%)
    │   ├─> Financeiro (limite crédito)
    │   └─> Diretoria (valor > R$ 100k)
    │
    └─> Status após aprovação: "To Deliver and Bill"

[5] SEPARAÇÃO / PICKING
    │
    ├─> Delivery Note criada do Sales Order
    │
    ├─> Geração de Pick List
    │   ├─> Agrupa múltiplos pedidos
    │   ├─> Roteirização do armazém
    │   │   (endereço: Rua A, Prateleira 3, Nível 2)
    │   └─> Impressão de etiquetas
    │
    ├─> Conferência (Scanner de código de barras)
    │   ├─> Valida produto correto
    │   ├─> Valida quantidade
    │   ├─> Valida lote/validade (se aplicável)
    │   └─> Registra separador e hora
    │
    └─> Gera Romaneio de Carga
        ├─> Lista de volumes
        ├─> Peso total
        └─> Cubagem

[6] EXPEDIÇÃO
    │
    ├─> Integração Transportadora
    │   ├─> Cálculo de frete (API)
    │   ├─> Geração de etiqueta
    │   └─> Código de rastreio
    │
    ├─> Emissão de NF-e (paralelamente)
    │   └─> [Ver fluxo fiscal detalhado abaixo]
    │
    └─> Baixa de Estoque (efetiva)
        ├─> Atualiza quantidade disponível
        ├─> Atualiza custo médio
        └─> Gera movimento contábil

[7] FATURAMENTO
    │
    ├─> Sales Invoice criada
    │   ├─> Vinculada ao Delivery Note
    │   ├─> Vinculada à NF-e
    │   └─> Dados já preenchidos
    │
    ├─> Emissão Final
    │   ├─> Valida todos os dados
    │   ├─> Gera duplicatas (se parcelado)
    │   └─> Status: "Submitted"
    │
    └─> Integração Contas a Receber
        └─> Gera títulos automaticamente

[8] CONTAS A RECEBER
    │
    ├─> Criação de Payment Entry (a receber)
    │   ├─> Vencimentos conforme condição
    │   ├─> Valor de cada parcela
    │   └─> Juros/multa configurados
    │
    ├─> Geração de Cobranças
    │   ├─> Boleto bancário (API banco)
    │   │   ├─> Registro online
    │   │   ├─> PDF + código de barras
    │   │   └─> Envio por email
    │   │
    │   ├─> PIX (QR Code dinâmico)
    │   │   ├─> Valor exato
    │   │   ├─> Validade
    │   │   └─> Callback de confirmação
    │   │
    │   └─> Link de pagamento (cartão)
    │
    ├─> Lembretes Automáticos
    │   ├─> 3 dias antes: lembrete
    │   ├─> No vencimento: alerta
    │   ├─> 1 dia após: primeiro aviso
    │   ├─> 7 dias após: segundo aviso
    │   └─> 15 dias após: cobrança jurídica
    │
    ├─> Recebimento
    │   ├─> Manual (baixa pelo usuário)
    │   ├─> Automático (importação extrato)
    │   │   ├─> OFX / CNAB
    │   │   ├─> API Open Banking
    │   │   └─> Conciliação automática
    │   │
    │   └─> Webhook (PIX/Cartão)
    │       └─> Baixa instantânea
    │
    └─> Conciliação Bancária
        ├─> Match automático (valor + data)
        ├─> Sugestões de match (ML)
        └─> Manual (se ambíguo)

[9] COMISSÕES
    │
    ├─> Cálculo Automático (após recebimento)
    │   ├─> Regras por vendedor/produto
    │   ├─> % sobre valor líquido
    │   └─> Gatilhos:
    │       ├─> Pagamento integral
    │       └─> Parcela recebida
    │
    ├─> Aprovação de Comissões
    │   └─> Gerente de Vendas
    │
    └─> Pagamento
        ├─> Integra com Folha (CLT)
        └─> Gera Contas a Pagar (PJ)

[10] PÓS-VENDA
     │
     ├─> Pesquisa de Satisfação (NPS)
     │   ├─> Email automático (D+3)
     │   └─> Dashboard de resultados
     │
     ├─> Devoluções / Trocas
     │   ├─> Sales Return criada
     │   ├─> Retorno ao estoque
     │   ├─> NF-e de devolução
     │   └─> Estorno financeiro
     │
     └─> Garantia / Assistência
         └─> Ticket de suporte (Service Desk)

┌─────────────────────────────────────────────────────────────────────────┐
│                        FIM DO FLUXO DE VENDAS                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Fluxo Completo de Compras (Purchase to Pay)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MÓDULO DE COMPRAS                                │
└─────────────────────────────────────────────────────────────────────────┘

[1] NECESSIDADE DE COMPRA
    │
    ├─> Origem da demanda:
    │   │
    │   ├─> [A] Estoque Mínimo Atingido
    │   │   ├─> Sistema alerta automático
    │   │   ├─> Sugere quantidade (MRP)
    │   │   └─> Cria Material Request
    │   │
    │   ├─> [B] Pedido de Venda (sem estoque)
    │   │   ├─> Backorder automático
    │   │   └─> Cria Material Request
    │   │
    │   ├─> [C] Ordem de Produção
    │   │   ├─> Explosão da BOM
    │   │   ├─> Verifica estoque
    │   │   └─> Cria Material Request (faltantes)
    │   │
    │   └─> [D] Requisição Manual
    │       ├─> Departamento solicita
    │       └─> Justificativa obrigatória
    │
    └─> Material Request (MR) criada
        ├─> Itens solicitados
        ├─> Quantidade
        ├─> Data necessária
        └─> Centro de custo (rateio)

[2] APROVAÇÃO DA REQUISIÇÃO
    │
    ├─> Workflow baseado em:
    │   ├─> Valor total
    │   ├─> Tipo de material
    │   └─> Departamento solicitante
    │
    ├─> Exemplo de regras:
    │   ├─> < R$ 1.000: Auto-aprovado
    │   ├─> R$ 1.000 - R$ 10.000: Gerente Depto
    │   ├─> R$ 10.000 - R$ 50.000: Gerente Compras
    │   └─> > R$ 50.000: Diretoria
    │
    └─> Status: "Pending" → "Approved" / "Rejected"

[3] COTAÇÃO DE FORNECEDORES
    │
    ├─> Supplier Quotation (RFQ)
    │   ├─> Seleciona fornecedores (3+ mínimo)
    │   ├─> Envia RFQ por email
    │   └─> Portal para fornecedor responder
    │
    ├─> Fornecedores respondem:
    │   ├─> Preço unitário
    │   ├─> Prazo de entrega
    │   ├─> Condição de pagamento
    │   ├─> Validade da cotação
    │   └─> Observações
    │
    ├─> Comparativo Automático
    │   ├─> Quadro comparativo (tabela)
    │   ├─> Menor preço destacado
    │   ├─> Score do fornecedor
    │   │   ├─> Histórico de entregas
    │   │   ├─> Qualidade (devoluções)
    │   │   └─> Pontualidade
    │   │
    │   └─> Análise de custo total:
    │       ├─> Preço
    │       ├─> Frete
    │       ├─> Impostos
    │       └─> Prazo de pagamento (custo $)
    │
    └─> Seleção do vencedor
        ├─> Justificativa (se não menor preço)
        └─> Aprovação (se necessário)

[4] PEDIDO DE COMPRA (Purchase Order)
    │
    ├─> PO criada da cotação vencedora
    │   ├─> Dados pré-preenchidos
    │   ├─> Condições comerciais
    │   └─> Anexa documentos (specs, desenhos)
    │
    ├─> Validações:
    │   ├─> Fornecedor ativo?
    │   ├─> Dados bancários OK?
    │   ├─> Aprovações obtidas?
    │   └─> Budget disponível?
    │
    ├─> Geração de PDF
    │   ├─> Layout profissional
    │   ├─> QR Code (tracking)
    │   └─> Termos e condições
    │
    ├─> Envio ao Fornecedor
    │   ├─> Email automático
    │   ├─> Portal do fornecedor
    │   └─> API (EDI) se disponível
    │
    └─> Acompanhamento
        ├─> Status: "Sent" → "Confirmed"
        ├─> Previsão de entrega
        └─> Alertas de atraso

[5] RECEBIMENTO DE MERCADORIAS
    │
    ├─> Purchase Receipt criada
    │   ├─> Vinculada ao PO
    │   └─> Pode ser parcial
    │
    ├─> Conferência Física
    │   ├─> Quantidade (contagem)
    │   ├─> Qualidade (inspeção)
    │   │   ├─> Aprovado → Segue fluxo
    │   │   └─> Reprovado → Devolução
    │   │
    │   ├─> Lote e validade (se aplicável)
    │   ├─> Número de série (rastreável)
    │   └─> Scanner de código de barras
    │
    ├─> Divergências
    │   ├─> Quantidade menor:
    │   │   ├─> Recebimento parcial
    │   │   └─> PO permanece aberta
    │   │
    │   ├─> Quantidade maior:
    │   │   └─> Alerta + aprovação
    │   │
    │   ├─> Produto errado:
    │   │   └─> Devolução imediata
    │   │
    │   └─> Avaria:
    │       ├─> Foto do problema
    │       ├─> Comunicação fornecedor
    │       └─> Desconto ou devolução
    │
    └─> Documentação
        ├─> Foto da NF
        ├─> Assinatura digital
        └─> Hora de entrada

[6] NOTA FISCAL DE ENTRADA
    │
    ├─> Recebimento da NF-e (XML)
    │   ├─> Email do fornecedor
    │   ├─> Portal NFe (download)
    │   └─> Upload manual
    │
    ├─> Validação XML
    │   ├─> Assinatura digital (SEFAZ)
    │   ├─> CNPJ emitente = fornecedor?
    │   ├─> Valores conferem com PO?
    │   └─> Produtos corretos?
    │
    ├─> Lançamento Fiscal
    │   ├─> Extrai dados do XML
    │   ├─> Calcula impostos recuperáveis
    │   │   ├─> ICMS (crédito)
    │   │   ├─> IPI (crédito)
    │   │   └─> PIS/COFINS (não-cumulativo)
    │   │
    │   └─> Integração SPED
    │
    └─> Three-Way Match
        ├─> PO = Purchase Receipt = NF?
        ├─> Se OK → Aprova pagamento
        └─> Se divergência → Workflow

[7] ENTRADA NO ESTOQUE
    │
    ├─> Stock Entry criada
    │   ├─> Tipo: "Material Receipt"
    │   └─> Vinculada ao Purchase Receipt
    │
    ├─> Atualização de Estoque
    │   ├─> Incrementa quantidade
    │   ├─> Atualiza custo médio
    │   │   └─> (Estoque Anterior × Custo Ant) + (Compra × Custo Novo)
    │   │       ────────────────────────────────────────────────────
    │   │               Estoque Total
    │   │
    │   └─> Localização (se endereçamento)
    │       ├─> Armazém
    │       ├─> Rua/Corredor
    │       ├─> Prateleira
    │       └─> Nível
    │
    ├─> Rastreabilidade
    │   ├─> Batch/Lote
    │   │   ├─> Data de fabricação
    │   │   ├─> Data de validade
    │   │   └─> Fornecedor
    │   │
    │   └─> Serial Number
    │       └─> Único por unidade
    │
    └─> Lançamento Contábil
        ├─> Débito: Estoque
        ├─> Crédito: Fornecedor (a pagar)
        └─> Centro de custo

[8] CONTAS A PAGAR
    │
    ├─> Purchase Invoice criada
    │   ├─> Da NF-e automaticamente
    │   └─> Valores já validados
    │
    ├─> Geração de Títulos (Duplicatas)
    │   ├─> Conforme condição de pagamento
    │   │   Exemplo: 30/60/90 dias
    │   │   └─> 3 parcelas iguais
    │   │
    │   ├─> Data de vencimento
    │   ├─> Valor de cada parcela
    │   └─> Desconto (se pgto antecipado)
    │
    ├─> Workflow de Aprovação de Pagamento
    │   ├─> Validação 3-way match
    │   ├─> Budget disponível?
    │   ├─> Dados bancários conferem?
    │   │
    │   └─> Aprovadores:
    │       ├─> Comprador (conferência)
    │       ├─> Financeiro (validação)
    │       └─> Diretor (se > limite)
    │
    ├─> Agendamento de Pagamento
    │   ├─> Inclusão na programação
    │   ├─> Análise de fluxo de caixa
    │   └─> Otimização (descontos)
    │
    └─> Pagamento
        └─> [Ver fluxo financeiro abaixo]

[9] PAGAMENTO AO FORNECEDOR
    │
    ├─> Payment Entry criada
    │   ├─> Tipo: "Pay"
    │   ├─> Vinculada à Purchase Invoice
    │   └─> Pode pagar múltiplas faturas
    │
    ├─> Método de Pagamento
    │   │
    │   ├─> [A] Transferência Bancária
    │   │   ├─> API do banco (integração)
    │   │   ├─> Arquivo CNAB 240
    │   │   └─> Manual (internet banking)
    │   │
    │   ├─> [B] Boleto (se fornecedor emitiu)
    │   │   ├─> Pagamento via banco
    │   │   └─> Registro de pagamento
    │   │
    │   ├─> [C] PIX
    │   │   ├─> Chave PIX do fornecedor
    │   │   ├─> Comprovante automático
    │   │   └─> Baixa instantânea
    │   │
    │   └─> [D] Cheque (raro hoje)
    │       └─> Controle de cheques
    │
    ├─> Retenções de Impostos
    │   ├─> IRRF (serviços)
    │   ├─> INSS (construção civil)
    │   ├─> ISS (serviços)
    │   ├─> PIS/COFINS/CSLL (serviços)
    │   │
    │   └─> Cálculo automático
    │       ├─> Desconta do pagamento
    │       └─> Gera guia (DARF/GPS)
    │
    ├─> Execução do Pagamento
    │   ├─> Aprovação final (tesouraria)
    │   ├─> Envio ao banco
    │   └─> Confirmação de débito
    │
    └─> Conciliação
        ├─> Match com extrato bancário
        ├─> Atualização de saldo
        └─> Lançamento contábil

[10] AVALIAÇÃO DO FORNECEDOR
     │
     ├─> Critérios automáticos:
     │   ├─> Prazo de entrega (pontualidade %)
     │   ├─> Qualidade (devoluções %)
     │   ├─> Preço (competitividade)
     │   ├─> Conformidade (NF correta %)
     │   └─> Atendimento (tempo resposta)
     │
     ├─> Score calculado (0-100)
     │   ├─> 90-100: Excelente ⭐⭐⭐⭐⭐
     │   ├─> 70-89: Bom ⭐⭐⭐⭐
     │   ├─> 50-69: Regular ⭐⭐⭐
     │   └─> < 50: Ruim (alerta)
     │
     └─> Ações:
         ├─> Fornecedor ruim → Bloqueio
         ├─> Fornecedor bom → Preferencial
         └─> Review trimestral

┌─────────────────────────────────────────────────────────────────────────┐
│                       FIM DO FLUXO DE COMPRAS                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Fluxo Fiscal / Emissão de NF-e

```
[EMISSÃO DE NF-e - VENDA]

┌─> Gatilho: Delivery Note "submitted"
│
├─> [1] Preparação de Dados
│   ├─> Emitente (empresa)
│   │   ├─> CNPJ, IE, IM
│   │   ├─> Regime tributário
│   │   └─> Certificado digital (A1/A3)
│   │
│   ├─> Destinatário (cliente)
│   │   ├─> CNPJ/CPF
│   │   ├─> Endereço completo
│   │   └─> Indicador IE (contribuinte?)
│   │
│   └─> Produtos
│       ├─> Descrição
│       ├─> NCM
│       ├─> CEST (se aplicável)
│       ├─> CFOP (origem/destino)
│       └─> Unidade tributável
│
├─> [2] Cálculo de Impostos
│   │
│   ├─> ICMS
│   │   ├─> Origem: UF da empresa
│   │   ├─> Destino: UF do cliente
│   │   ├─> Alíquota interna/interestadual
│   │   ├─> CST (Código Situação Tributária)
│   │   ├─> Base de cálculo
│   │   └─> Valor do ICMS
│   │
│   ├─> ICMS-ST (Substituição Tributária)
│   │   ├─> Se produto em regime ST
│   │   ├─> MVA (Margem Valor Agregado)
│   │   └─> Cálculo específico
│   │
│   ├─> IPI
│   │   ├─> Alíquota por NCM (TIPI)
│   │   ├─> Base de cálculo
│   │   └─> Valor do IPI
│   │
│   ├─> PIS
│   │   ├─> Regime: Cumulativo (0,65%) ou
│   │   │            Não-Cumulativo (1,65%)
│   │   └─> CST específico
│   │
│   ├─> COFINS
│   │   ├─> Regime: Cumulativo (3%) ou
│   │   │            Não-Cumulativo (7,6%)
│   │   └─> CST específico
│   │
│   └─> FCP (Fundo Combate Pobreza)
│       └─> Se aplicável (alguns estados)
│
├─> [3] Geração do XML
│   ├─> Biblioteca python-nfe
│   ├─> Layout: 4.00 (atual)
│   ├─> Identificação da NF
│   │   ├─> Série
│   │   ├─> Número (sequencial)
│   │   ├─> Data/hora emissão
│   │   └─> Tipo operação (1=Saída)
│   │
│   ├─> Totalizadores
│   │   ├─> Total produtos
│   │   ├─> Total impostos
│   │   ├─> Frete
│   │   ├─> Seguro
│   │   ├─> Desconto
│   │   └─> Total NF
│   │
│   └─> Transporte
│       ├─> Modalidade (CIF/FOB)
│       ├─> Transportadora
│       └─> Volumes
│
├─> [4] Assinatura Digital
│   ├─> Certificado A1 (arquivo) ou A3 (token)
│   ├─> Assina XML com chave privada
│   └─> Gera hash de segurança
│
├─> [5] Transmissão SEFAZ
│   ├─> Webservice SEFAZ (UF do emitente)
│   ├─> Ambiente: Produção ou Homologação
│   ├─> Envio do XML assinado
│   │
│   └─> Respostas possíveis:
│       │
│       ├─> [A] 100 - Autorizada
│       │   ├─> Recebe protocolo
│       │   ├─> Chave de acesso (44 dígitos)
│       │   ├─> Data/hora autorização
│       │   └─> Status: "Autorizada"
│       │
│       ├─> [B] 110 - Denegada
│       │   ├─> Motivo: Irregularidade fiscal
│       │   ├─> Emitente ou destinatário
│       │   └─> NF fica denegada (registra SEFAZ)
│       │
│       └─> [C] Rejeição (400-799)
│           ├─> Erro nos dados
│           ├─> Corrige e reenvia
│           └─> Não conta numeração
│
├─> [6] Pós-Autorização
│   ├─> Gera PDF (DANFE)
│   │   ├─> Dados da NF
│   │   ├─> Código de barras (chave)
│   │   └─> QR Code (consulta)
│   │
│   ├─> Envia para Cliente
│   │   ├─> Email (XML + PDF)
│   │   ├─> Portal do cliente
│   │   └─> API (EDI)
│   │
│   ├─> Armazena
│   │   ├─> XML assinado (5 anos)
│   │   ├─> Protocolo de autorização
│   │   └─> PDF gerado
│   │
│   └─> Registros Fiscais
│       ├─> Livro de Saídas
│       └─> SPED Fiscal (arquivo digital)
│
└─> [7] Contingência (se SEFAZ offline)
    ├─> FS-DA (Formulário Segurança)
    ├─> Emite offline
    ├─> Transmite depois (até 24h)
    └─> Informa no DANFE

[CANCELAMENTO DE NF-e]

├─> Prazo: Até 24h da autorização
│
├─> Motivo obrigatório (mín 15 caracteres)
│
├─> Evento de Cancelamento
│   ├─> Assina digitalmente
│   ├─> Envia SEFAZ
│   └─> Protocolo de cancelamento
│
└─> Registros
    ├─> Atualiza status NF
    ├─> Estorna impostos
    └─> Estorna financeiro

[CARTA DE CORREÇÃO (CC-e)]

├─> Para erros que não alteram:
│   ├─> Valores
│   ├─> Impostos
│   ├─> Destinatário
│   └─> Data de emissão
│
├─> Pode corrigir:
│   ├─> Descrição produto (erro digitação)
│   ├─> Endereço (complemento)
│   └─> Dados de transporte
│
└─> Limite: 20 CC-e por NF-e
```

---

### 4. Fluxo de Produção

```
[PLANEJAMENTO]

├─> [1] Previsão de Demanda
│   ├─> Histórico de vendas (ML)
│   ├─> Pipeline de oportunidades
│   ├─> Sazonalidade
│   └─> Tendências de mercado
│
├─> [2] MRP (Material Requirements Planning)
│   │
│   ├─> Input:
│   │   ├─> Demanda prevista
│   │   ├─> Estoque atual
│   │   ├─> Pedidos em aberto
│   │   └─> Lead time (produção/compra)
│   │
│   ├─> Processamento:
│   │   ├─> Explosão da BOM
│   │   │   └─> Produto A precisa:
│   │   │       ├─> 2x Componente B
│   │   │       ├─> 1x Componente C
│   │   │       └─> 0.5kg Material D
│   │   │
│   │   ├─> Cálculo de necessidades
│   │   │   └─> Necessidade líquida = 
│   │   │       Demanda - Estoque - Pedidos
│   │   │
│   │   └─> Plano de produção/compra
│   │
│   └─> Output:
│       ├─> Ordens de Produção sugeridas
│       ├─> Ordens de Compra sugeridas
│       └─> Cronograma

[ORDEM DE PRODUÇÃO]

├─> [3] Criação da Work Order
│   ├─> Produto a fabricar
│   ├─> Quantidade
│   ├─> Data prevista conclusão
│   ├─> BOM (versão)
│   └─> Centro de trabalho (linha produção)
│
├─> [4] Requisição de Materiais
│   │
│   ├─> Stock Entry (Material Transfer)
│   │   ├─> Da: Armazém de Matéria-Prima
│   │   ├─> Para: Armazém de Produção (WIP)
│   │   └─> Conforme BOM
│   │
│   ├─> Validações:
│   │   ├─> Material disponível?
│   │   ├─> Lote compatível? (se houver)
│   │   └─> Qualidade OK?
│   │
│   └─> Baixa de estoque
│       └─> Custo → Work in Progress (WIP)
│
├─> [5] Execução da Produção
│   │
│   ├─> Etapas (Operations)
│   │   │
│   │   ├─> Operação 1: Corte
│   │   │   ├─> Centro: Setor Corte
│   │   │   ├─> Tempo padrão: 10 min
│   │   │   ├─> Operadores: 2
│   │   │   └─> Equipamento: Guilhotina
│   │   │
│   │   ├─> Operação 2: Montagem
│   │   │   ├─> Centro: Setor Montagem
│   │   │   ├─> Tempo padrão: 30 min
│   │   │   └─> Operadores: 5
│   │   │
│   │   ├─> Operação 3: Pintura
│   │   │   └─> ...
│   │   │
│   │   └─> Operação N: Embalagem
│   │
│   ├─> Apontamento de Produção
│   │   ├─> Job Card (por operação)
│   │   ├─> Operador registra:
│   │   │   ├─> Hora início
│   │   │   ├─> Hora fim
│   │   │   ├─> Quantidade produzida
│   │   │   ├─> Quantidade rejeitada
│   │   │   └─> Paradas (motivo)
│   │   │
│   │   └─> Métodos de apontamento:
│   │       ├─> Manual (tablet/PC)
│   │       ├─> Terminal de chão (barcode)
│   │       └─> Automático (sensor máquina)
│   │
│   └─> OEE (Overall Equipment Effectiveness)
│       ├─> Disponibilidade
│       ├─> Performance
│       └─> Qualidade
│
├─> [6] Controle de Qualidade
│   │
│   ├─> Plano de Inspeção
│   │   ├─> Pontos de inspeção (por operação)
│   │   ├─> Critérios de aceitação
│   │   └─> Tamanho da amostra
│   │
│   ├─> Quality Inspection
│   │   ├─> Inspetor registra
│   │   ├─> Parâmetros medidos
│   │   ├─> Fotos (se não-conformidade)
│   │   │
│   │   └─> Resultado:
│   │       ├─> Aprovado → Segue
│   │       ├─> Aprovado com ressalva
│   │       └─> Reprovado → Refugo/Retrabalho
│   │
│   └─> Não-Conformidade
│       ├─> Registro detalhado
│       ├─> Análise de causa raiz
│       ├─> Ação corretiva
│       └─> Plano de prevenção
│
└─> [7] Finalização
    │
    ├─> Stock Entry (Manufacture)
    │   ├─> Entrada: Produto Acabado
    │   ├─> Quantidade produzida
    │   ├─> Lote de produção
    │   └─> Validade (se aplicável)
    │
    ├─> Custeio
    │   ├─> Custo de materiais (da BOM)
    │   ├─> Custo de mão de obra (horas × tarifa)
    │   ├─> Custos indiretos (rateio)
    │   │   ├─> Energia
    │   │   ├─> Depreciação máquinas
    │   │   └─> Manutenção
    │   │
    │   └─> Custo unitário =
    │       Total de Custos / Qtd Produzida
    │
    └─> Fechamento da WO
        ├─> Status: "Completed"
        ├─> Análise de variações
        │   ├─> Tempo real vs padrão
        │   ├─> Material real vs padrão
        │   └─> Rendimento
        │
        └─> Disponibiliza para venda
```

---

**Esses fluxos cobrem ~80% das operações de um ERP!**

Próximo passo: Vamos definir a **ordem de implementação** dos módulos? 🚀
