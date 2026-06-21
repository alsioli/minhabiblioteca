<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Whitelist: chave → tabela, coluna de status, coluna chave para WHERE
$TABELA_CONFIG = [
    'livros_autor'  => ['tabela' => 'LivrosAutor',      'status_col' => 'Status',   'key_col' => 'Titulo'],
    'jo_nesbo_tess' => ['tabela' => 'ListaJoNesboTess', 'status_col' => 'status',   'key_col' => 'titulo'],
    'king'          => ['tabela' => 'King',              'status_col' => 'situacao', 'key_col' => 'titulo'],
];

$chave  = trim($_POST['chave']  ?? '');
$titulo = trim($_POST['titulo'] ?? '');
$status = trim($_POST['status'] ?? 'Lido');

if (empty($chave) || !isset($TABELA_CONFIG[$chave])) {
    echo json_encode(['status' => false, 'error' => 'Lista inválida.']);
    exit;
}

if (empty($titulo)) {
    echo json_encode(['status' => false, 'error' => 'Título é obrigatório.']);
    exit;
}

$cfg = $TABELA_CONFIG[$chave];

try {
    $db = new DataBase();
    $db->ExecuteNonQuery(
        "UPDATE [Biblioteca].[dbo].[{$cfg['tabela']}]
         SET [{$cfg['status_col']}] = :status
         WHERE [{$cfg['key_col']}] = :titulo",
        [':status' => $status, ':titulo' => $titulo]
    );
    echo json_encode(['status' => true, 'data' => ['message' => 'Status atualizado.', 'novo_status' => $status]]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
