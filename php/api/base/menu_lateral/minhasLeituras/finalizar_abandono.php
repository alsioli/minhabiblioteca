<?php

include_once __DIR__ . "/../../../../utils/function/database.php";
include_once __DIR__ . "/../../../../utils/function/atualizar_status_tabela.php";

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
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $id_leitura    = trim($_POST['id_leitura']    ?? '');
    $motivo        = trim($_POST['motivo']        ?? '');
    $titulo        = trim($_POST['titulo']        ?? '');
    $autor         = trim($_POST['autor']         ?? '');
    $paginas       = trim($_POST['paginas']       ?? '');
    $tipo_midia    = trim($_POST['tipo_midia']    ?? '');
    $data_inicio   = trim($_POST['data_inicio']   ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');

    if (empty($id_leitura)) {
        $result_error = 'ID da leitura e obrigatorio.';
        return;
    }

    if (!in_array($motivo, ['Abandonado', 'Interrompido'])) {
        $result_error = 'Motivo invalido. Use "Abandonado" ou "Interrompido".';
        return;
    }

    try {
        $db = new DataBase();

        // 1. Atualiza apenas o motivo — data_fim NÃO é definida para abandono/interrupção
        $db->ExecuteNonQuery("
            UPDATE [Biblioteca].[dbo].[Leituras]
            SET natureza = :p0
            WHERE id = :p1
        ", [
            ':p0' => $motivo,
            ':p1' => (int)$id_leitura,
        ]);

        // 2. Remove todas as entradas de andamento deste livro
        $db->ExecuteNonQuery(
            "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento] WHERE id_leitura = :id",
            [':id' => (int)$id_leitura]
        );

        // 3. Atualiza status na tabela correspondente ao local de leitura
        atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, $motivo);

        $result_status = true;
        $result_data   = ['message' => "Leitura marcada como {$motivo} com sucesso."];

    } catch (Exception $e) {
        $result_error = 'Erro ao finalizar leitura: ' . $e->getMessage();
    }
}
