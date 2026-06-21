<?php
/*
 * Insere o autor na tabela Autor SOMENTE se ele não existir.
 * Chamado após cadastro de livro para manter a tabela Autor atualizada com novos autores.
 * Nunca sobrescreve dados de autores já cadastrados.
 */

include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$nome = trim($_POST['nome_autor']    ?? '');
$sexo = trim($_POST['sexo_autor']    ?? '');
$raca = trim($_POST['raca']          ?? '');
$nac  = trim($_POST['nacionalidade'] ?? '');

if ($nome === '') {
    echo json_encode(['status' => false, 'error' => 'Nome do autor é obrigatório.']);
    exit;
}

try {
    $db = new DataBase();
    $db->ExecuteNonQuery(
        "IF NOT EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Autor] WHERE LOWER(nome_autor) = LOWER(:nome))
             INSERT INTO [Biblioteca].[dbo].[Autor] (nome_autor, sexo_autor, [raça], nacionalidade)
             VALUES (:nome2, NULLIF(:sexo,''), NULLIF(:raca,''), NULLIF(:nac,''))",
        [':nome' => $nome, ':nome2' => $nome, ':sexo' => $sexo, ':raca' => $raca, ':nac' => $nac]
    );
    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
