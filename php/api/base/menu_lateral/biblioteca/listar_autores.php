<?php
/*
 * Retorna autores que correspondem à busca parcial (case-insensitive).
 * Busca primeiro em [Autores], depois complementa com nomes únicos de [Livros].
 * Retorna: [{nome, sexo, raca, nacionalidade}]
 */

include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$busca = trim($_GET['busca'] ?? '');

// Busca vazia: retorna todos os autores da tabela Autor (dropdown inicial)
if ($busca === '') {
    try {
        $db = new DataBase();
        $rows = $db->GetMany(
            "SELECT TOP 100 nome_autor        AS nome,
                    ISNULL(sexo_autor, '')    AS sexo,
                    ISNULL([raça], '')        AS raca,
                    ISNULL(nacionalidade, '') AS nacionalidade
             FROM [Biblioteca].[dbo].[Autor]
             ORDER BY nome_autor ASC",
            []
        );
        echo json_encode(['status' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(['status' => true, 'data' => []]);
    }
    exit;
}

if (strlen($busca) < 2) {
    echo json_encode(['status' => true, 'data' => []]);
    exit;
}

$like = '%' . $busca . '%';

try {
    $db = new DataBase();
    $resultado = [];
    $nomesVistos = [];

    // 1. Busca na tabela Autor (tem os dados completos)
    try {
        $rows = $db->GetMany(
            "SELECT TOP 15 nome_autor        AS nome,
                    ISNULL(sexo_autor, '')   AS sexo,
                    ISNULL([raça], '')       AS raca,
                    ISNULL(nacionalidade, '') AS nacionalidade
             FROM [Biblioteca].[dbo].[Autor]
             WHERE LOWER(nome_autor) LIKE LOWER(:busca)
             ORDER BY nome_autor ASC",
            [':busca' => $like]
        );
        foreach ($rows as $r) {
            $key = mb_strtolower($r['nome'], 'UTF-8');
            $nomesVistos[$key] = true;
            $resultado[] = $r;
        }
    } catch (Exception $e) {
        // Tabela Autores não existe — continua
    }

    // 2. Complementa com autores de Livros que ainda não apareceram
    try {
        $rows = $db->GetMany(
            "SELECT TOP 15 DISTINCT
                    autor                    AS nome,
                    ISNULL(sexo_autor, '')   AS sexo,
                    ISNULL([raça], '')       AS raca,
                    ISNULL(nacionalidade, '') AS nacionalidade
             FROM [Biblioteca].[dbo].[Livros]
             WHERE LOWER(autor) LIKE LOWER(:busca)
               AND autor IS NOT NULL
             ORDER BY autor ASC",
            [':busca' => $like]
        );
        foreach ($rows as $r) {
            $key = mb_strtolower($r['nome'], 'UTF-8');
            if (!isset($nomesVistos[$key])) {
                $nomesVistos[$key] = true;
                $resultado[] = $r;
            }
        }
    } catch (Exception $e) { /* silencioso */ }

    // Ordena pelo nome e limita a 15
    usort($resultado, fn($a, $b) => strcasecmp($a['nome'], $b['nome']));
    $resultado = array_slice($resultado, 0, 15);

    echo json_encode(['status' => true, 'data' => $resultado], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
