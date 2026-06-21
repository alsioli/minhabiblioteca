<?php
include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$nome   = trim($_POST['nome_autor']    ?? '');
$sexo   = trim($_POST['sexo_autor']    ?? '');
$raca   = trim($_POST['raca']          ?? '');
$nac    = trim($_POST['nacionalidade'] ?? '');
$origem = trim($_POST['origem']        ?? '');

if ($nome === '') {
    http_response_code(400);
    echo json_encode(['status' => false, 'error' => 'Nome do autor é obrigatório.']);
    exit;
}

try {
    $db = new DataBase();

    // Verifica se o autor já existe
    $rows = $db->GetMany(
        "SELECT nome_autor FROM [Biblioteca].[dbo].[Autor] WHERE LOWER(nome_autor) = LOWER(:nome)",
        [':nome' => $nome]
    );

    if (count($rows) === 0) {
        // Novo autor
        $db->ExecuteNonQuery(
            "INSERT INTO [Biblioteca].[dbo].[Autor] (nome_autor, sexo_autor, [raça], nacionalidade, origem)
             VALUES (:nome, NULLIF(:sexo,''), NULLIF(:raca,''), NULLIF(:nac,''), NULLIF(:origem,''))",
            [
                ':nome'   => $nome,
                ':sexo'   => $sexo,
                ':raca'   => $raca,
                ':nac'    => $nac,
                ':origem' => $origem,
            ]
        );
    } else {
        // Autor existente — atualiza apenas os campos preenchidos
        $db->ExecuteNonQuery(
            "UPDATE [Biblioteca].[dbo].[Autor]
                SET sexo_autor    = COALESCE(NULLIF(:sexo,   ''), sexo_autor),
                    [raça]        = COALESCE(NULLIF(:raca,   ''), [raça]),
                    nacionalidade = COALESCE(NULLIF(:nac,    ''), nacionalidade),
                    origem        = COALESCE(NULLIF(:origem, ''), origem)
              WHERE LOWER(nome_autor) = LOWER(:nome)",
            [
                ':nome'   => $nome,
                ':sexo'   => $sexo,
                ':raca'   => $raca,
                ':nac'    => $nac,
                ':origem' => $origem,
            ]
        );
    }

    echo json_encode(['status' => true, 'data' => ['message' => 'Autor salvo com sucesso.']]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
