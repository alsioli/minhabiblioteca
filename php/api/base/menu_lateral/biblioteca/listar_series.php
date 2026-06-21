<?php
/*
 * Retorna séries distintas de um autor em determinado local de leitura.
 * Parâmetros GET: autor (obrigatório), local (default: Biblioteca)
 */

include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$autor = trim($_GET['autor'] ?? '');
$local = trim($_GET['local'] ?? 'Biblioteca');

if ($autor === '') {
    echo json_encode(['status' => true, 'data' => []]);
    exit;
}

$tabelaMap = [
    'Skeelo'           => '[Biblioteca].[dbo].[LeiturasSKEELO]',
    'Biblion'          => '[Biblioteca].[dbo].[LivrosBiblion]',
    'MEC_Livros'       => '[Biblioteca].[dbo].[LivrosMEC]',
    'Audible'          => '[Biblioteca].[dbo].[LivrosAudible]',
    'Kindle_Unlimited' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    'Biblioteca'       => '[Biblioteca].[dbo].[Livros]',
];

$tabela = $tabelaMap[$local] ?? '[Biblioteca].[dbo].[Livros]';

try {
    $db = new DataBase();
    $rows = $db->GetMany(
        "SELECT DISTINCT serie
         FROM {$tabela}
         WHERE LOWER(autor) = LOWER(:autor)
           AND serie IS NOT NULL
           AND serie <> ''
         ORDER BY serie ASC",
        [':autor' => $autor]
    );

    echo json_encode(
        ['status' => true, 'data' => array_column($rows, 'serie')],
        JSON_UNESCAPED_UNICODE
    );
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
