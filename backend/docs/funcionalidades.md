# Catálogo de Funcionalidades - Backend API

Este documento cataloga todas as funcionalidades implementadas no backend do sistema Ademir.

## Visão Geral

O backend atual utiliza armazenamento em arquivos JSON para persistência de dados. Todas as rotas estão implementadas em um único arquivo `server.js` e utilizam funções auxiliares `readDataFile()` e `writeDataFile()` para manipulação de dados.

**Porta padrão:** 3100  
**Base URL:** `http://localhost:3100/api`

---

## 1. Menu

### GET `/api/menu`
Retorna o menu completo com todas as categorias e itens.

**Resposta:**
```json
[
  {
    "id": "string",
    "titulo": "string",
    "img": "string (URL)",
    "ativo": boolean,
    "itens": [
      {
        "nome": "string",
        "preco": "string (formato R$ X,XX)",
        "desc": "string",
        "ativo": boolean,
        "id": number
      }
    ]
  }
]
```

**Nota:** Retorna array vazio quando não há arquivo `menu.json`. Dados mockados foram removidos.

### POST `/api/menu`
Salva/atualiza o menu completo.

**Request Body:**
```json
[
  {
    "id": "string",
    "titulo": "string",
    "img": "string",
    "ativo": boolean,
    "itens": [...]
  }
]
```

**Resposta:**
```json
{
  "success": true,
  "message": "Menu atualizado com sucesso"
}
```

**Arquivo de dados:** `backend/data/menu.json`

---

## 2. Cartões

### GET `/api/cartoes`
Lista todos os cartões cadastrados.

**Resposta:**
```json
[
  {
    "id": number,
    "numero": "string",
    "nome": "string",
    "documento": "string",
    "saldo": number,
    "ativo": number (1 ou 0),
    "created_at": "ISO string"
  }
]
```

### POST `/api/cartoes`
Salva/atualiza a lista completa de cartões.

**Request Body:** Array de cartões (mesma estrutura do GET)

**Resposta:**
```json
{
  "success": true,
  "message": "Cartões atualizados com sucesso"
}
```

### GET `/api/cartoes/:numero`
Busca um cartão específico por número.

**Parâmetros:**
- `numero` (path): Número do cartão (aceita busca exata ou parcial pelos últimos 4 dígitos)

**Resposta:**
```json
{
  "id": number,
  "numero": "string",
  "nome": "string",
  "documento": "string",
  "saldo": number,
  "ativo": number,
  "created_at": "ISO string"
}
```

**Erros:**
- `400`: Número de cartão inválido
- `404`: Cartão não encontrado

### POST `/api/cartoes/:id/debitar`
Debita valor do saldo do cartão (compra).

**Parâmetros:**
- `id` (path): ID do cartão

**Request Body:**
```json
{
  "valor": number,
  "itens": [
    {
      "nome": "string",
      "quantidade": number,
      "preco": number,
      "total": number
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "cartao": { ... }
}
```

**Erros:**
- `400`: Saldo insuficiente
- `404`: Cartão não encontrado

**Ações:**
- Registra transação no histórico (`cartoes-transacoes.json`)
- Atualiza saldo do cartão
- Mantém apenas últimos 10000 registros de transações

### POST `/api/cartoes/:id/recarregar`
Recarrega saldo no cartão.

**Parâmetros:**
- `id` (path): ID do cartão

**Request Body:**
```json
{
  "valor": number,
  "descricao": "string (opcional)"
}
```

**Resposta:**
```json
{
  "success": true,
  "cartao": { ... }
}
```

**Ações:**
- Registra transação tipo "recarga" no histórico
- Atualiza saldo do cartão

### GET `/api/cartoes/:id/transacoes`
Lista todas as transações de um cartão específico.

**Parâmetros:**
- `id` (path): ID do cartão

**Resposta:**
```json
[
  {
    "id": number,
    "cartaoId": number,
    "cartaoNumero": "string",
    "tipo": "compra" | "recarga" | "estorno",
    "valor": number,
    "saldoAnterior": number,
    "saldoAtual": number,
    "data": "ISO string",
    "itens": [...],
    "descricao": "string",
    "estornado": boolean (opcional),
    "dataEstorno": "ISO string (opcional)"
  }
]
```

### POST `/api/cartoes/:id/estornar`
Estorna uma ou mais transações de compra.

**Parâmetros:**
- `id` (path): ID do cartão

**Request Body:**
```json
{
  "transacoesIds": [number, number, ...]
}
```

**Resposta:**
```json
{
  "success": true,
  "cartao": { ... },
  "valorEstornado": number,
  "transacoesEstornadas": number
}
```

**Ações:**
- Apenas estorna transações tipo "compra" que não foram estornadas
- Recalcula saldo do cartão
- Marca transações como estornadas
- Cria nova transação tipo "estorno" no histórico

**Arquivos de dados:**
- `backend/data/cartoes.json`
- `backend/data/cartoes-transacoes.json`

---

## 3. Estoque

### GET `/api/estoque`
Retorna o estoque completo.

**Resposta:**
```json
{
  "geladeiras": [
    {
      "id": number,
      "nome": "string",
      "categoria": "string",
      "quantidade": number,
      "valorUnitario": number,
      "estoqueMinimo": number,
      "observacao": "string",
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  ],
  "cameraFria": [...]
}
```

### POST `/api/estoque`
Salva/atualiza o estoque completo.

**Request Body:** Mesma estrutura do GET

**Resposta:**
```json
{
  "success": true,
  "message": "Estoque atualizado com sucesso"
}
```

### GET `/api/estoque/historico`
Retorna o histórico de movimentações de estoque.

**Resposta:**
```json
[
  {
    "id": number,
    "data": "ISO string",
    "tipo": "entrada" | "saida",
    "local": "geladeiras" | "cameraFria",
    "produtoId": number,
    "produtoNome": "string",
    "quantidade": number,
    "valorUnitario": number,
    "total": number,
    "observacao": "string"
  }
]
```

### POST `/api/estoque/historico`
Salva/atualiza o histórico de movimentações.

**Request Body:** Array de movimentações (mesma estrutura do GET)

### GET `/api/estoque/verificar/:produtoNome`
Verifica disponibilidade de um produto específico.

**Parâmetros:**
- `produtoNome` (path): Nome do produto (URL encoded)

**Resposta:**
```json
{
  "disponivel": boolean,
  "quantidade": number
}
```

### POST `/api/estoque/reduzir`
Reduz quantidade do estoque (venda realizada).

**Request Body:**
```json
{
  "produtoNome": "string",
  "quantidade": number
}
```

**Resposta:**
```json
{
  "success": true,
  "produto": { ... }
}
```

**Erros:**
- `400`: Estoque insuficiente
- `404`: Produto não encontrado

**Ações:**
- Reduz quantidade do produto
- Registra movimentação no histórico (tipo "saida")
- Mantém apenas últimos 1000 registros de histórico

**Arquivos de dados:**
- `backend/data/estoque.json`
- `backend/data/estoque-historico.json`

---

## 4. Eventos

### GET `/api/eventos`
Lista todos os eventos cadastrados.

**Resposta:**
```json
[
  {
    "id": number,
    "nome": "string",
    "data": "YYYY-MM-DD",
    "descricao": "string",
    "finalizado": boolean,
    "dataCriacao": "ISO string",
    "dataFinalizacao": "ISO string (opcional)",
    "itens": [
      {
        "produtoId": number,
        "produtoNome": "string",
        "quantidadeInicial": number,
        "quantidadeAtual": number,
        "reposicoes": [
          {
            "quantidade": number,
            "data": "ISO string"
          }
        ],
        "quantidadeFisicaRestante": number,
        "quantidadeConsumida": number,
        "totalDisponivel": number
      }
    ]
  }
]
```

### POST `/api/eventos`
Salva/atualiza a lista de eventos.

**Request Body:** Array de eventos (mesma estrutura do GET)

**Resposta:**
```json
{
  "success": true,
  "message": "Eventos atualizados com sucesso"
}
```

**Arquivo de dados:** `backend/data/eventos.json`

---

## 5. Bilheteria

### GET `/api/bilheteria/config`
Retorna configurações de preços da bilheteria.

**Resposta:**
```json
{
  "precoNormal": number,
  "precoMeio": number,
  "precoPassaporte": number
}
```

**Nota:** Retorna objeto vazio quando não há configuração salva. Valores padrão mockados foram removidos.

### POST `/api/bilheteria/config`
Salva configurações de preços.

**Request Body:**
```json
{
  "precoNormal": number,
  "precoMeio": number,
  "precoPassaporte": number
}
```

**Resposta:**
```json
{
  "success": true,
  "config": { ... }
}
```

### POST `/api/bilheteria/processar-pagamento`
Processa pagamento de ingressos (simulado).

**Request Body:**
```json
{
  "valor": number,
  "tipos": ["normal" | "meio" | "passaporte"],
  "formaPagamento": "dinheiro" | "pix" | "credito" | "debito"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "message": "string",
  "valor": number,
  "formaPagamento": "string",
  "transacaoId": "string",
  "data": "ISO string"
}
```

**Resposta (erro):**
```json
{
  "success": false,
  "message": "string",
  "valor": number
}
```

**Comportamento:**
- Dinheiro: aprovação imediata (1 segundo de delay)
- PIX: simulação com 98% de aprovação (2-4 segundos)
- Cartão: simulação com 95% de aprovação (2-5 segundos)

**Nota:** Esta é uma simulação. Para produção, integrar com APIs reais de pagamento.

### POST `/api/bilheteria/vender`
Registra venda de ingressos.

**Request Body:**
```json
{
  "tipo": "normal" | "meio" | "passaporte",
  "quantidade": number
}
```

**Resposta:**
```json
{
  "success": true,
  "ingressos": [
    {
      "id": number,
      "codigo": "string",
      "tipo": "string",
      "valor": number,
      "dataVenda": "ISO string",
      "dataVendaDate": "YYYY-MM-DD",
      "liberado": boolean,
      "dataLiberacao": "ISO string | null"
    }
  ],
  "total": number
}
```

**Ações:**
- Gera código único para cada ingresso (formato: `ING{timestamp}{random}`)
- Mantém apenas últimos 10000 ingressos

### GET `/api/bilheteria/ingressos`
Lista ingressos vendidos (últimos 100).

**Resposta:**
```json
[
  {
    "id": number,
    "codigo": "string",
    "tipo": "string",
    "valor": number,
    "dataVenda": "ISO string",
    "dataVendaDate": "YYYY-MM-DD",
    "liberado": boolean,
    "dataLiberacao": "ISO string | null"
  }
]
```

**Ordenação:** Mais recentes primeiro

### POST `/api/bilheteria/liberar`
Libera entrada de um ingresso (marca como utilizado).

**Request Body:**
```json
{
  "codigo": "string"
}
```

**Resposta:**
```json
{
  "success": true,
  "ingresso": { ... }
}
```

**Erros:**
- `400`: Código não informado ou ingresso já utilizado
- `404`: Ingresso não encontrado

**Arquivos de dados:**
- `backend/data/bilheteria-ingressos.json`
- `backend/data/bilheteria-config.json` (criado dinamicamente)

---

## 6. Controle e Relatórios

### GET `/api/controle/dashboard`
Retorna estatísticas gerais do sistema.

**Resposta:**
```json
{
  "cartoes": {
    "total": number,
    "ativos": number
  },
  "saldo": {
    "total": number,
    "medio": number
  },
  "vendas": {
    "hoje": number,
    "mes": number
  },
  "transacoes": {
    "hoje": number,
    "mes": number
  },
  "eventos": {
    "ativos": number,
    "total": number
  },
  "estoque": {
    "itens": number,
    "baixo": number
  },
  "ingressos": {
    "hoje": {
      "quantidade": number,
      "valor": number
    },
    "mes": {
      "quantidade": number,
      "valor": number
    },
    "total": number
  }
}
```

**Cálculos:**
- Vendas: soma de transações tipo "compra"
- Estoque baixo: itens com quantidade < 10
- Eventos ativos: eventos com `finalizado === false`

### GET `/api/controle/logs`
Retorna logs de atividades do sistema.

**Resposta:**
```json
[
  {
    "time": "ISO string",
    "type": "info" | "success" | "warning",
    "message": "string"
  }
]
```

**Fontes:**
- Transações de cartões (últimas 100)
- Eventos (últimos 50)
- Histórico de estoque (últimos 50)

**Limite:** 200 logs (mais recentes primeiro)

### GET `/api/controle/relatorio/cartoes`
Relatório detalhado de cartões.

**Resposta:**
```json
[
  {
    "numero": "string",
    "nome": "string",
    "saldo": number,
    "status": "Ativo" | "Inativo",
    "transacoes": number,
    "ultimaAtividade": "ISO string | null"
  }
]
```

### GET `/api/controle/relatorio/vendas`
Relatório de vendas realizadas.

**Resposta:**
```json
[
  {
    "data": "ISO string",
    "cartao": "string",
    "valor": number,
    "itens": "string",
    "tipo": "Compra"
  }
]
```

**Limite:** Últimas 500 vendas (mais recentes primeiro)

### GET `/api/controle/relatorio/estoque`
Relatório de situação do estoque.

**Resposta:**
```json
[
  {
    "produto": "string",
    "quantidade": number,
    "status": "Normal" | "Baixo" | "Esgotado",
    "ultimaMovimentacao": "ISO string | null"
  }
]
```

**Status:**
- Esgotado: quantidade === 0
- Baixo: quantidade < 10
- Normal: quantidade >= 10

### GET `/api/controle/relatorio/eventos`
Relatório de eventos.

**Resposta:**
```json
[
  {
    "nome": "string",
    "data": "ISO string",
    "status": "Ativo" | "Finalizado",
    "bebidas": number,
    "consumo": number
  }
]
```

**Cálculos:**
- bebidas: soma de `quantidadeInicial` de todos os itens
- consumo: soma de `quantidadeConsumida` (apenas eventos finalizados)

---

## Estrutura de Dados Atual

### Arquivos JSON

Todos os dados são armazenados em `backend/data/`:

1. **menu.json** - Array de categorias com itens
2. **cartoes.json** - Array de cartões
3. **cartoes-transacoes.json** - Array de transações
4. **estoque.json** - Objeto com `geladeiras` e `cameraFria`
5. **estoque-historico.json** - Array de movimentações
6. **eventos.json** - Array de eventos
7. **bilheteria-ingressos.json** - Array de ingressos
8. **bilheteria-config.json** - Configurações de preços (criado dinamicamente)

### Funções Auxiliares

- `readDataFile(filename, defaultValue)` - Lê arquivo JSON, retorna defaultValue se não existir
- `writeDataFile(filename, data)` - Escreve dados em arquivo JSON

---

## Upload de Imagens - TODO

**Status:** Não implementado

**Planejado para:**
- Upload de imagens de categorias do menu
- Upload de imagens de produtos/itens
- Armazenamento local ou em serviço de cloud storage
- Validação de tipos de arquivo (jpg, png, webp)
- Redimensionamento automático
- Geração de URLs públicas

**Arquivos preparados:**
- `backend/src/services/imageService.js` (estrutura com TODOs)
- Rota de upload será criada em `backend/src/routes/upload.js` quando implementado

**Dependências futuras:**
- `multer` para upload de arquivos
- Biblioteca de processamento de imagens (ex: `sharp`)
- Configuração de storage (local ou cloud)

---

## Migração para Banco de Dados - TODO

**Status:** Planejado para futuro

**Documentação:** Ver `backend/docs/migracao-db.md`

**Considerações:**
- Manter compatibilidade com frontend atual
- Migrar dados dos arquivos JSON
- Implementar modelos de dados
- Criar scripts de migração

---

## Notas Técnicas

- Todas as rotas retornam JSON
- CORS habilitado para todas as origens
- Porta padrão: 3100 (configurável via `PORT`)
- Logs detalhados no console para debugging
- Validações básicas implementadas
- Tratamento de erros genérico (500 para erros não tratados)

---

**Última atualização:** 2025-12-16  
**Versão do backend:** 1.0.0

