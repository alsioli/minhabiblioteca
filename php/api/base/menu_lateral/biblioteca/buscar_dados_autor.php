<?php
/*
 * Busca dados demográficos de um autor (sexo, raça, nacionalidade).
 * Ordem de busca:
 *   1. Tabela [Autores] (se existir)
 *   2. Tabela [Livros] — usa dados do primeiro livro cadastrado com esse autor
 *
 * DDL sugerido para a tabela Autores (execute uma vez no SQL Server):
 *
 *   CREATE TABLE [Biblioteca].[dbo].[Autores] (
 *       id            INT IDENTITY(1,1) PRIMARY KEY,
 *       nome          NVARCHAR(500) NOT NULL,
 *       sexo          NVARCHAR(1),
 *       raca          NVARCHAR(100),
 *       nacionalidade NVARCHAR(200),
 *       CONSTRAINT UQ_Autores_nome UNIQUE (nome)
 *   );
 */

include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$autor     = trim($_GET['autor'] ?? '');
$autorLower = mb_strtolower($autor, 'UTF-8');

if (strlen($autor) < 2) {
    echo json_encode(['status' => false, 'error' => 'Nome muito curto.']);
    exit;
}

try {
    $db = new DataBase();

    // 1. Tenta tabela Autor — comparação case-insensitive via LOWER()
    try {
        $row = $db->GetOne(
            "SELECT ISNULL(sexo_autor, '') AS sexo,
                    ISNULL([raça], '')      AS raca,
                    ISNULL(nacionalidade, '') AS nacionalidade
             FROM [Biblioteca].[dbo].[Autor]
             WHERE LOWER(nome_autor) = LOWER(:nome)",
            [':nome' => $autor]
        );
        if ($row) {
            echo json_encode(['status' => true, 'fonte' => 'autor', 'data' => $row], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Exception $e) {
        // Tabela Autores não existe — continua para fallback
    }

    // 2. Fallback: busca no histórico de Livros — também case-insensitive
    $row = $db->GetOne(
        "SELECT TOP 1
                ISNULL(sexo_autor, '') AS sexo,
                ISNULL([raça], '')     AS raca,
                ISNULL(nacionalidade, '') AS nacionalidade
         FROM [Biblioteca].[dbo].[Livros]
         WHERE LOWER(autor) = LOWER(:autor)
           AND (sexo_autor IS NOT NULL OR [raça] IS NOT NULL OR nacionalidade IS NOT NULL)",
        [':autor' => $autor]
    );

    if ($row) {
        echo json_encode(['status' => true, 'fonte' => 'livros', 'data' => $row], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['status' => false, 'data' => null]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
