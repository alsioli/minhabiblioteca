<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

// ── Configuração dos autores e suas tabelas ──────────────────────────────────
// Para adicionar novo autor: insira entrada neste array.
// 'colunas'    → chaves retornadas no JSON (usadas pelo JS para render)
// 'sql_select' → SQL completo (use para tabelas com colunas em PascalCase ou aliases)
// Se 'sql_select' não for definido, o sistema monta SELECT automático com 'colunas'
$CONFIG = [
    'livros_autor' => [
        'label'      => 'Lista Geral de Autores',
        'sql_select' => "
            SELECT
                Titulo          AS titulo,
                TituloPortugues AS titulo_portugues,
                Autor           AS autor,
                Serie           AS serie,
                Volume          AS volume,
                Genero          AS genero,
                Tema            AS tema,
                Paginas         AS paginas,
                Status          AS status,
                Pais            AS pais,
                DataPublicacao  AS data_publicacao
            FROM [Biblioteca].[dbo].[LivrosAutor]
            ORDER BY Titulo ASC
        ",
        'colunas' => [
            'titulo', 'titulo_portugues', 'autor', 'serie', 'volume',
            'genero', 'tema', 'paginas', 'status', 'pais', 'data_publicacao',
        ],
    ],
    'jo_nesbo_tess' => [
        'label'   => 'Jo Nesbo / Tess Gerritsen',
        'tabela'  => 'ListaJoNesboTess',
        'colunas' => ['autor', 'titulo', 'status', 'created_at'],
    ],
    'king' => [
        'label'   => 'Stephen King',
        'tabela'  => 'King',
        'colunas' => ['autor', 'titulo', 'data_lancamento', 'serie', 'seq', 'situacao', 'data_registro', 'created_at'],
    ],
];

$result_status = false;
$result_error  = null;
$result_data   = null;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$acao = trim($_GET['acao'] ?? '');

// ── Lista de autores para o <select> ────────────────────────────────────────
if ($acao === 'autores') {
    $lista = [];
    foreach ($CONFIG as $chave => $cfg) {
        $lista[] = ['chave' => $chave, 'label' => $cfg['label']];
    }
    echo json_encode(['status' => true, 'data' => $lista]);
    exit;
}

// ── Livros de um autor ───────────────────────────────────────────────────────
if ($acao === 'livros') {
    $chave = trim($_GET['chave'] ?? '');

    if (empty($chave) || !isset($CONFIG[$chave])) {
        echo json_encode(['status' => false, 'error' => 'Autor não encontrado.']);
        exit;
    }

    $cfg = $CONFIG[$chave];

    // Monta SQL: usa sql_select personalizado ou gera automaticamente
    if (!empty($cfg['sql_select'])) {
        $sql = $cfg['sql_select'];
    } else {
        $tabela = $cfg['tabela'];
        // Usa aliases explícitos em minúscula para garantir que o JS encontre as chaves
        $cols   = array_map(fn($c) => "[{$c}] AS {$c}", $cfg['colunas']);
        $sql    = "SELECT " . implode(', ', $cols) .
                  " FROM [Biblioteca].[dbo].[{$tabela}] ORDER BY titulo ASC";
    }

    try {
        $db   = new DataBase();
        $rows = $db->GetMany($sql);
        echo json_encode([
            'status'  => true,
            'colunas' => $cfg['colunas'],
            'data'    => $rows,
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['status' => false, 'error' => 'Erro ao consultar: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['status' => false, 'error' => 'Parâmetro "acao" inválido.']);
