<?php
/*
 * Retorna todos os autores da tabela [Autor] para a lista de escritores.
 */

include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

try {
    $db   = new DataBase();
    $rows = $db->GetMany(
        "SELECT TOP 1000
                id_autor,
                nome_autor,
                ISNULL(sexo_autor, '')    AS sexo_autor,
                ISNULL([raça], '')        AS raca,
                ISNULL(nacionalidade, '') AS nacionalidade,
                ISNULL(origem, '')        AS origem
         FROM [Biblioteca].[dbo].[Autor]
         ORDER BY nome_autor ASC",
        []
    );
    echo json_encode(['status' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
