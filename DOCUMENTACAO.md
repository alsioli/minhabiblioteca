# Biblioteca Alessandra — Documentação do Sistema

## Visão Geral

Aplicação web para gerenciamento de acervo pessoal de leituras. Stack: PHP + SQL Server + Bootstrap 4 + jQuery + Chart.js.

---

## Arquitetura

```
Biblio/
├── index.php                          ← Ponto de entrada (inclui header + menu + main)
├── php/
│   ├── api/base/                      ← APIs REST (PHP puro, retornam JSON)
│   │   ├── main/leituras/             ← APIs do dashboard: Leituras
│   │   ├── main/livros/               ← APIs do dashboard: Livros
│   │   └── menu_lateral/              ← APIs dos modais do menu
│   └── pages/base/components/
│       ├── header/                    ← Cabeçalho (citações + cards + título)
│       ├── menu_lateral/              ← Menu lateral + todos os modais
│       └── main/                      ← Dashboard principal
└── public/assets/css/                 ← Folhas de estilo
```

**Fluxo de dados:**
1. Página carrega → `header.js` busca citações e contadores
2. `dashboard.js` inicializa e chama 8 APIs em paralelo via `Promise.all`
3. Cada item do menu lateral carrega modal via AJAX + `$.getScript`

---

## Header

### Arquivo: `php/pages/base/components/header/index.php`

Três cards grandes no centro do cabeçalho, populados pelo `header.js`.

| Card | Conteúdo | Fonte |
|------|----------|-------|
| Livros por Ano | Contagem para o ano atual e os 2 anteriores | `Leituras.data_fim` |
| Média Mensal | Média de livros lidos nos últimos 12 meses (excluindo o mês atual) | `Leituras.data_fim` |
| Top Países | Top 3 países com mais leituras concluídas | `Leituras.pais` |

**API:** `GET /php/api/base/main/livros/listar_contadores_header.php`

Resposta:
```json
{
  "anos": { "2026": 12, "2025": 38, "2024": 29 },
  "media_mensal": 3.2,
  "periodo_media_fmt": "Mai/25 – Abr/26",
  "top_paises": [{"pais": "Brasil", "total": 45}]
}
```

**Citações:** Carregadas via `GET /php/api/base/main/livros/listar_citacoes.php` → tabela `FrasesFavoritas`. Rotação a cada 10 s com fade.

---

## Dashboard Principal

### Arquivo: `php/pages/base/components/main/dashboard.js`

8 blocos carregados em paralelo no `init()`. Máximo 7 linhas por bloco, sem scroll.

| Bloco HTML | Função JS | API | Tabela SQL |
|------------|-----------|-----|------------|
| `#bloco-andamento` | `carregarAndamento()` | `listar_andamento.php` | `LeiturasEmAndamento` |
| `#bloco-nao-lidos` | `carregarNaoLidosAntigos()` | `listar_nao_lidos_antigos.php` | `Livros` |
| `#bloco-lc` | `carregarLcVencendo()` | `listar_lc_vencendo.php` | `CronogramaLCs` |
| `#bloco-favoritos` | `carregarFavoritos2025()` | `listar_favoritos_2025.php` | `Livros` |
| `#bloco-tbr-breve` | `carregarTbrEmBreve()` | `listar_tbr_em_breve.php` | `TBR_Mensal` |
| `#bloco-quero-ler` | `carregarQueroLerLogo()` | `listar_quero_ler_logo.php` | `Quero_Ler_Logo` |
| `#bloco-adquiridos` | `carregarAdquiridos()` | `listar_adquiridos_recentes.php` | `Livros` |
| `#bloco-previsoes` | `carregarPrevisoesmes()` | `listar_previsoes_mes.php` | `TBR_Mensal` |

### Detalhes de cada bloco

**Leituras em Andamento**
- Fonte: `LeiturasEmAndamento` — registro mais recente por `id_leitura` (ROW_NUMBER)
- Colunas: Título, Autor, Início, Dias lendo, Progresso (% ou pág), botão ✏️ Atualizar
- Botão abre `#modalAtualizarLeitura` — POST para `create_atualizacao_leitura.php`

**Livros Não Lidos Mais Antigos**
- Filtro: `status NOT IN ('Lido', 'Lendo', 'Não quero ler')`, TOP 5, ORDER BY id ASC
- Colunas: #, Título, Autor, Páginas, Status

**LCs Vencendo em 5 Dias**
- Filtro: `data_final BETWEEN GETDATE() AND DATEADD(day,5,GETDATE())`, excluindo Concluída/Cancelada
- Colunas: Título, LC, Vencimento (vermelho), Situação

**Livros Favoritos em 2025**
- Filtro: `avaliacao LIKE '5%' AND mes_leitura LIKE '%/2025'`
- Compatível com avaliação numérica (5) e textual (5F)
- Colunas: Título, Autor, Mês lido

**Quero Ler em Breve (TBR)**
- Filtro: `mes_referencia = MM/YYYY atual` — formato `MM/YYYY`
- Colunas: Título, Autor, Origem, Quando (previsão)

**Quero Ler Logo**
- Ordenado por prioridade (Alta → Média → Baixa) e depois por id
- Colunas: Título, Autor, Tema, Prioridade (colorida)

**Adquiridos Recentemente**
- Filtro blacklist: `natureza NOT IN ('Presente','Tag') AND tipo_edicao NOT IN ('Epub','E-book','Ebook','Digital')`
- Ordenado pelos últimos ids (mais novos)
- Colunas: #, Título, Autor, Natureza, Data Compra

**Leituras Previstas para o Mês**
- Janela dinâmica de 10 dias à frente de hoje
- Inclui próximo mês (`Começo do mês`) quando estamos nos últimos 10 dias do mês atual
- Formato `mes_referencia`: `MM/YYYY`
- Colunas: Título, Autor, Origem, Previsão

---

## Menu Lateral

### Arquivo: `php/pages/base/components/menu_lateral/index.php + index.js`

Grupos do menu:

| Grupo | Itens |
|-------|-------|
| Biblioteca | Cadastro de livro, Alterar cadastro |
| Leituras Coletivas | Cadastro de Grupo de LC, Nova LC, Acompanhamento das LCs |
| Minhas Leituras | Começando um livro, Atualizando a leitura, Minhas Impressões, Cadastro TBR Mensal, Frase Favorita |
| Consultas | Leituras em Andamento, Leituras do Mês, Leituras por Ano, Livros por Nacionalidade, Livros por Raça, Estatísticas, Lista por Autor |
| Desafios | Cadastro de desafios, Acompanhamento, Desafios em andamento |
| Gráficos | Gráficos de Leituras |

**Padrão de abertura de modais de Minhas Leituras:**
```javascript
_carregarMinhasLeituras('modalId', 'inicFn')
// Remove modais antigos, carrega index.php via AJAX,
// mostra o modal, carrega index.js e chama a função de init
```

---

## Modais

### 1. Começando um Novo Livro (`#modalComecarLivro`)

**Arquivo:** `menu_lateral/minhas_leituras/index.php`  
**JS init:** `minhas_leituras.iniciar()`

**Fluxo:**
1. Seleciona Local de Leitura → popula tabela de busca via `listar_local_leitura.php`
2. Busca livro → POST para `buscar_livro_tbr.php` (whitelist de tabelas)
3. Seleciona livro → revela Dados da Leitura
4. Preenche Tipo de Mídia, Data de Início, Natureza (LC/Desafio/Maratona/Pessoal)
5. Salva → POST para `create_leitura.php`

**API de save:** `POST /php/api/base/menu_lateral/minhasLeituras/create_leitura.php`

Campos enviados:
| Campo POST | Coluna SQL (Leituras) |
|------------|-----------------------|
| titulo | titulo |
| autor | autor |
| paginas | paginas |
| tipo_midia | tipo_midia |
| natureza | natureza |
| data_inicio | data_inicio |
| avaliacao | avaliacao |
| sexo_autor | sexo_autor |
| pais | pais |
| raca | raça |
| tema | tema |

**Efeito colateral:** Também insere em `LeiturasEmAndamento` com `percentual=0` para que o livro apareça no dashboard imediatamente.

---

### 2. Atualizando a Leitura Atual (`#modalAtualizandoLeitura`)

**JS init:** `minhas_leituras.iniciarAtualizacao()`

**Fluxo:**
1. Select popula via `listar_leituras_andamento.php` (Leituras com data_fim IS NULL)
2. Ao selecionar → exibe Título, Autor, Páginas, Tipo de Mídia, Data de Início, Tempo
3. Escolhe tipo de registro: Percentual (%) ou Página atual
4. Campo de Impressões (textarea) e Avaliação (se 100%)
5. Salva → POST para `create_atualizacao_leitura.php`

**API de save:** `POST /php/api/base/menu_lateral/minhasLeituras/create_atualizacao_leitura.php`

| Campo POST | Descrição |
|------------|-----------|
| id_leitura | FK para Leituras |
| tipo_input | `percentual` ou `pagina` |
| percentual | Valor 0-100 |
| pagina_atual | Número da página |
| impressoes | Texto livre (opcional) |
| avaliacao | 1-5 (opcional, aparece ao concluir) |

**Ao concluir (100%):** Dispara automaticamente `sincronizar_leituras.php` para atualizar `data_fim` em Leituras e `status` em Livros.

---

### 3. Minhas Impressões (`#modalMinhasImpressoes`)

**JS init:** `minhas_leituras.iniciarImpressoes()`

Seleciona qualquer leitura em andamento, campo de texto livre para anotações.

**API de save:** `POST /php/api/base/menu_lateral/minhasLeituras/create_impressao.php`

| Campo POST | Coluna |
|------------|--------|
| id_leitura | id_leitura |
| titulo | titulo |
| autor | autor |
| observacoes | observacoes |

---

### 4. Frase Favorita (`#modalFraseFavorita`)

**JS init:** `minhas_leituras.iniciarFraseFavorita()`

Seleciona leitura em andamento, digita a citação.

**API de save:** `POST /php/api/base/menu_lateral/minhasLeituras/cadastrar_frase_favorita.php`

DDL da tabela:
```sql
CREATE TABLE FrasesFavoritas (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    id_leitura  INT,
    titulo      NVARCHAR(500),
    autor       NVARCHAR(300),
    frase       NVARCHAR(MAX) NOT NULL,
    dt_cadastro DATETIME DEFAULT GETDATE()
);
```

As frases são exibidas no cabeçalho com rotação a cada 10 s via `listar_citacoes.php`.

---

### 5. Cadastro TBR Mensal (`#modalTBRMensal`)

**JS init:** `tbr_mensal.iniciar()`

**Fluxo:**
1. Seleciona Local de Leitura (origem)
2. Informa Releitura? (Sim/Não) → filtra livros no select de busca
3. Busca livro → POST para `buscar_livro_tbr.php`
4. Seleciona livro
5. Preenche Mês de Referência (`input[type=month]` → convertido para `MM/YYYY` antes de enviar)
6. Previsão de leitura: Começo do mês / Depois do dia 10 / Antes do dia 20 / Final do mês

**API de save:** `POST /php/api/base/menu_lateral/TBR/create_tbr.php`

Formato de `mes_referencia` armazenado: **`MM/YYYY`** (ex: `05/2026`)

DDL da tabela `TBR_Mensal`:
```sql
mes_referencia   NVARCHAR(7)  -- formato MM/YYYY
previsao_leitura NVARCHAR(50) -- 'Começo do mês' | 'Depois do dia 10' | 'Antes do dia 20' | 'Final do mês'
```

---

### 6. Cadastro de Livro (`#modalNovoLivro`)

**Arquivo:** `menu_lateral/biblioteca/index.php`  
**API de save:** `POST /php/api/base/menu_lateral/biblioteca/create_cadastro.php`

Campo `raca` (sem acento) no formulário → mapeado para coluna `[raça]` no banco.

---

### 7. Alterar Cadastro de Livro (`#modalAtualizarLivro`)

**API:** `POST /php/api/base/menu_lateral/biblioteca/update_cadastro.php`

Busca livro via `GET /php/api/base/menu_lateral/biblioteca/buscar_livro.php?titulo=...`

Campo `name="raca"` (sem acento) no form de atualização → PHP lê `$_POST['raca']` → coluna `[raça]`.

---

### 8. Leituras Coletivas (`#modalNovaLC` / `#modalNovaCronogramaLC`)

**Arquivo:** `menu_lateral/leituras_coletivas/index.php + index.js`

Dois modais:
- **Cadastro de Grupo de LC** (`#modalNovaLC`): Nome, Participando, Natureza, Gênero, Grupo → `create_leitura_coletiva.php`
- **Nova LC no Cronograma** (`#modalNovaCronogramaLC`): Fluxo Grupo → Local → Busca → Datas → Salva → `create_cronograma_lc.php`

**Tabela `CronogramaLCs`:** Colunas relevantes: `id`, `lc` (nome do grupo), `titulo`, `data_final`, `situacao`, `paginas`, `mes`, `percentual`, `pagina_atual`

---

### 9. Quero Ler Logo (`#modalQueroLerLogo`)

**Arquivo:** `menu_lateral/quero_ler/index.php + index.js`  
**API de save:** `POST /php/api/base/menu_lateral/QueroLer/create_quero_ler.php`

| Campo POST | Descrição |
|------------|-----------|
| origem | Local de leitura |
| titulo | Título do livro |
| autor | Autor |
| paginas | Número de páginas |
| tema | Tema |
| natureza | Natureza |
| prioridade | Alta / Média / Baixa |

**Tabela `Quero_Ler_Logo`:** Ordenada por prioridade no dashboard.

---

### 10. Desafios

**Modais:** `#modalNovoDesafio` / `#modalEditarDesafio`  
**Arquivo:** `menu_lateral/desafios/index.php + index.js`  
**APIs:** `create_desafio.php`, `update_desafio.php`, `listar_desafios.php` (em `menu_lateral/desafios/`)

---

## Consultas (via Menu Lateral → Consultas)

Cada consulta substitui o conteúdo de `#mainConteudo`.

| Item | Função | Descrição |
|------|--------|-----------|
| Leituras em Andamento | `abrirLeiturasAndamento()` | Lista de leituras em andamento |
| Leituras do Mês | `abrirLeiturasMes()` | Leituras com `data_fim` no mês selecionado. Seletor de mês no header do bloco |
| Livros por Nacionalidade | `abrirNacionalidade()` | Dashboard agrupado com filtro por país |
| Livros por Raça | `abrirRaca()` | Dashboard agrupado com filtro por raça |
| Estatísticas | `abrirEstatisticasLivros()` | Cards por grupo (Livro Físico, Ebook, Tag) + tabela status × tipo |
| Lista por Autor | `abrirListaPorAutor()` | Seleciona autor → tabela paginada (20/pág) com ordenação por clique |

**Lista por Autor** — autores configurados em `listar_por_autor.php`:
- `livros_autor` → tabela `LivrosAutor` (lista genérica, suporta importação Excel)
- `jo_nesbo_tess` → tabela `ListaJoNesboTess`
- `king` → tabela `King`

Para adicionar novo autor: editar o array `$CONFIG` em `listar_por_autor.php`.

---

## Gráficos (`abrirGraficos()`)

**Arquivo:** `php/pages/base/components/main/graficos.js`  
**Dependência:** Chart.js 4.x (carregado via CDN na abertura)

| Gráfico | Tipo | Dados |
|---------|------|-------|
| Total de Leituras por Mês | Barras | `Leituras.mes` agrupado |
| Concluídas vs Em Andamento | Barras empilhadas | `data_fim` / `data_inicio` |
| Livros Físicos | Rosca | `Livros WHERE natureza IN ('Estante','1a. prateleira','Presente')` |
| Tag | Rosca | `Livros WHERE natureza = 'Tag'` |
| Ebooks / Kindle | Rosca | `Livros WHERE natureza='Compra Kindle' OR tipo_edicao IN (...)` |
| Acervo Geral | Rosca | `Livros GROUP BY status` |

---

## APIs — Referência Rápida

### Dashboard (GET)

| Arquivo | Filtro | Retorna |
|---------|--------|---------|
| `listar_andamento.php` | LeiturasEmAndamento, 1 por leitura | id, titulo, autor, paginas, dias_lendo, percentual, pagina_atual |
| `listar_nao_lidos_antigos.php` | Livros, status excluindo Lido/Lendo/Não quero ler, TOP 5 | id, titulo, autor, paginas, status |
| `listar_lc_vencendo.php` | CronogramaLCs, data_final próximos 5 dias | id, titulo, lc, data_final, situacao |
| `listar_favoritos_2025.php` | Livros, avaliacao LIKE '5%', mes_leitura 2025 | titulo, autor, avaliacao, mes_leitura |
| `listar_tbr_em_breve.php` | TBR_Mensal, mes_referencia atual | titulo, autor, origem, mes_referencia, previsao_leitura |
| `listar_quero_ler_logo.php` | Quero_Ler_Logo, ORDER BY prioridade | id, titulo, autor, paginas, tema, origem, prioridade |
| `listar_adquiridos_recentes.php` | Livros, excluindo Presente/Tag/epub, TOP 7 ORDER BY id DESC | id, titulo, autor, natureza, tipo_edicao, data_compra |
| `listar_previsoes_mes.php` | TBR_Mensal, janela 10 dias + próximo mês | titulo, autor, origem, mes_referencia, previsao_leitura |
| `listar_mes.php` | Leituras, YEAR(data_fim)+MONTH(data_fim) = ?mes (YYYY-MM) | id, titulo, autor, natureza, tipo_midia, paginas, avaliacao, data_inicio, data_fim, tempo_dias |
| `listar_ano.php` | Leituras, YEAR(data_fim) = ?ano | id, titulo, autor, natureza, tipo_midia, paginas, avaliacao, data_inicio, data_fim, tempo_dias |
| `listar_contadores_header.php` | Leituras.data_fim | anos{}, media_mensal, periodo_media_fmt, top_paises[] |

### Menu Lateral (POST)

| Arquivo | Tabela | Campos obrigatórios |
|---------|--------|---------------------|
| `create_leitura.php` | Leituras + LeiturasEmAndamento | titulo, autor, data_inicio |
| `create_atualizacao_leitura.php` | LeiturasEmAndamento | id_leitura, tipo_input, percentual OU pagina_atual |
| `create_impressao.php` | (tabela de impressões) | id_leitura, observacoes |
| `cadastrar_frase_favorita.php` | FrasesFavoritas | frase |
| `TBR/create_tbr.php` | TBR_Mensal | titulo, mes_referencia (MM/YYYY), previsao_leitura |
| `QueroLer/create_quero_ler.php` | Quero_Ler_Logo | titulo, prioridade |
| `leiturasColetivas/create_leitura_coletiva.php` | (grupos LC) | nome_lc |
| `leiturasColetivas/create_cronograma_lc.php` | CronogramaLCs | lc, titulo, paginas, data_final, mes |
| `biblioteca/create_cadastro.php` | Livros | titulo, autor |
| `biblioteca/update_cadastro.php` | Livros | id |

---

## Busca de Livros (Compartilhada)

**API:** `POST /php/api/base/menu_lateral/TBR/buscar_livro_tbr.php`

Usada por: TBR Mensal, Quero Ler Logo, Leituras Coletivas, Começando um Livro

| Campo POST | Descrição |
|------------|-----------|
| tabela | Chave da whitelist (ex: `dbo.Livros`) |
| titulo | Título parcial para busca LIKE |
| releitura | `sim` (inclui Lido) ou `nao` (exclui Lido) |

**Tabelas permitidas:**
- `dbo.Livros` — campos completos (natureza, tema, etc.)
- `dbo.LeiturasSKEELO`, `dbo.LivrosBiblion`, `dbo.LivrosMEC`, `dbo.LivrosAudible`, `dbo.LivrosKindleUnlimited` — campos básicos (natureza/tema retornam NULL)

---

## Importação de Livros por Autor

**Menu:** Consultas → Lista por Autor → botão "+ Cadastrar Livros do Autor"

Aceita colagem de dados copiados do Excel (TSV — separado por tab, primeira linha = cabeçalho).

**Colunas aceitas (tabela `LivrosAutor`):**

| Coluna obrigatória | Colunas opcionais |
|--------------------|-------------------|
| Titulo | TituloPortugues, Autor, Serie, Volume, Genero, Tema, Paginas, Status, Pais, DataPublicacao |

**Mapeamento de cabeçalhos flexível:** aceita variações como `título`, `author`, `páginas`, `ano`, `país`, etc.

**API de save:** `POST /php/api/base/main/livros/cadastrar_livros_autor.php`  
Recebe JSON: `{ "dados": [{Titulo: "...", Autor: "...", ...}] }`  
Processa em transação, ignora linhas sem Titulo, retorna `{inseridos: N, erros: [...]}`.

---

## Notas de Manutenção

### Adicionar novo autor na "Lista por Autor"
Editar `php/api/base/main/livros/listar_por_autor.php`:
```php
$CONFIG['nova_chave'] = [
    'label'   => 'Nome do Autor',
    'tabela'  => 'NomeDaTabela',
    'colunas' => ['autor', 'titulo', 'status', 'created_at'],
];
```

### Adicionar nova tabela de busca de livros
Editar `php/api/base/menu_lateral/TBR/buscar_livro_tbr.php`:
```php
$TABELAS_PERMITIDAS['dbo.NovaTabela'] = '[Biblioteca].[dbo].[NovaTabela]';
```

### Campos retornados por `buscar_livro_tbr.php`
- **dbo.Livros**: `id, titulo, autor, paginas, sexo_autor, pais, natureza, tema, tipo_edicao, status`
- **Outras tabelas**: mesmos campos, mas `sexo_autor, pais, natureza, tema, tipo_edicao` retornam NULL

### Formato de datas
- `mes_referencia` (TBR): `MM/YYYY` — o JS converte de `YYYY-MM` (input type=month) para esse formato antes de enviar
- `data_inicio`, `data_fim` (Leituras): `YYYY-MM-DD`
- `data_compra` (Livros): `YYYY-MM-DD` ou `YYYY-MM-DDTHH:MM:SS` (formatada via `_fmtData()` no JS)

### Convenção de nomes de colunas especiais
- Coluna `[raça]` no banco → campo POST/JS: `raca` (sem acento) → mapeamento feito nas APIs

---

## Bugs Corrigidos nesta Sessão

| # | Arquivo | Problema | Correção |
|---|---------|----------|----------|
| 1 | `biblioteca/index.php` linha 333 | `name="raça"` enviava chave com acento; PHP lia `$_POST['raca']` (sem acento) → campo sempre vazio no update | Alterado para `name="raca"` |
| 2 | `update_cadastro.php` método PUT linha 202 | `'raca' => 'raca'` tentava atualizar coluna `[raca]` inexistente; correto é `[raça]` | Alterado para `'raca' => 'raça'` |
