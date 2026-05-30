<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        PostMethod();
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

header('Content-Type: application/json');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
]);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $campos = ['lc', 'titulo', 'paginas', 'data_final', 'mes'];
    foreach ($campos as $campo) {
        if (empty(trim($_POST[$campo] ?? ''))) {
            $result_error = "O campo {$campo} é obrigatório.";
            return;
        }
    }

    $lc             = trim($_POST['lc']);
    $titulo         = trim($_POST['titulo']);
    $paginas        = (int) $_POST['paginas'];
    $data_final     = trim($_POST['data_final']);
    $mes            = trim($_POST['mes']) . '-01'; // "2026-05" → "2026-05-01"
    $situacao       = 'A começar';

    // Dias para o prazo: data_final - hoje
    $hoje       = new DateTime();
    $prazo      = new DateTime($data_final);
    $diff       = (int) $hoje->diff($prazo)->days;
  //  $dias_prazo = $prazo > $hoje ? $diff : 0;

    // Média de páginas: calculada uma vez na criação e não muda
  //  $media_paginas = $dias_prazo > 0 ? (int) ceil($paginas / $dias_prazo) : 0;

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[CronogramaLCs]
            (titulo, lc, data_final, paginas, mes, situacao, data_cadastro)
        VALUES
            (:titulo, :lc, :data_final, :paginas, :mes, :situacao, GETDATE())
    ";

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery($sql, [
            ':titulo'     => $titulo,
            ':lc'         => $lc,
            ':data_final' => $data_final,
            ':paginas'    => $paginas,
            ':mes'        => $mes,
            ':situacao'   => $situacao,
        ]);

        $result_status = true;
        $result_data   = ['message' => 'LC adicionada ao cronograma com sucesso'];
    } catch (Exception $e) {
        $result_error = 'Erro ao salvar: ' . $e->getMessage();
    }
}
