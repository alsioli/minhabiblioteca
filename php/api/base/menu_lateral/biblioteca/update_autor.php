<?php
include_once __DIR__ . '/../../../../utils/function/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$id   = intval($_POST['id_autor']      ?? 0);
$sexo = trim($_POST['sexo_autor']      ?? '');
$raca = trim($_POST['raca']            ?? '');
$nac  = trim($_POST['nacionalidade']   ?? '');
$orig = trim($_POST['origem']          ?? '');

if ($id <= 0) {
    echo json_encode(['status' => false, 'error' => 'ID do autor inválido.']);
    exit;
}

try {
    $db = new DataBase();
    $db->ExecuteNonQuery(
        "UPDATE [Biblioteca].[dbo].[Autor]
            SET sexo_autor    = NULLIF(:sexo,  ''),
                [raça]        = NULLIF(:raca,  ''),
                nacionalidade = NULLIF(:nac,   ''),
                origem        = NULLIF(:orig,  '')
          WHERE id_autor = :id",
        [':id' => $id, ':sexo' => $sexo, ':raca' => $raca, ':nac' => $nac, ':orig' => $orig]
    );
    echo json_encode(['status' => true]);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
