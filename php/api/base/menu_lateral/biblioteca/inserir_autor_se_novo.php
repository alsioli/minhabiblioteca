<?php
/*
 * Insere o autor na tabela Autor SOMENTE se ele não existir.
 * Chamado após cadastro de livro para manter a tabela Autor atualizada com novos autores.
 * Nunca sobrescreve dados de autores já cadastrados (só completa campos vazios).
 */

include_once __DIR__ . '/../../../../utils/function/database.php';
include_once __DIR__ . '/autor_helper.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$nome = normalizarNomeAutor($_POST['nome_autor'] ?? '');

if ($nome === '') {
    echo json_encode(['status' => false, 'error' => 'Nome do autor é obrigatório.']);
    exit;
}

try {
    $db = new DataBase();
    garantirAutor($db, $nome, $_POST['sexo_autor'] ?? '', $_POST['raca'] ?? '', $_POST['nacionalidade'] ?? '');
    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
