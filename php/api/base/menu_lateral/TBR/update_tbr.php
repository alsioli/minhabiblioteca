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

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $acao = trim($_POST['acao'] ?? '');
    $id   = trim($_POST['id']   ?? '');

    if (empty($id) || !is_numeric($id)) {
        $result_error = 'ID inválido.';
        return;
    }

    $db = new DataBase();

    try {
        if ($acao === 'delete') {
            $db->ExecuteNonQuery(
                "DELETE FROM [Biblioteca].[dbo].[TBR_Mensal] WHERE id = :id",
                [':id' => (int)$id]
            );
            $result_status = true;
            $result_data   = ['message' => 'Livro removido da TBR.'];
            return;
        }

        if ($acao === 'update') {
            $mes_referencia   = trim($_POST['mes_referencia']   ?? '');
            $previsao_leitura = trim($_POST['previsao_leitura'] ?? '');

            if (empty($mes_referencia) || !preg_match('/^\d{2}\/\d{4}$/', $mes_referencia)) {
                $result_error = 'Mês de referência inválido. Use MM/YYYY.';
                return;
            }

            $opcoesValidas = ['Começo do mês', 'Depois do dia 10', 'Antes do dia 20', 'Final do mês'];
            if (empty($previsao_leitura) || !in_array($previsao_leitura, $opcoesValidas)) {
                $result_error = 'Previsão de leitura inválida.';
                return;
            }

            $db->ExecuteNonQuery(
                "UPDATE [Biblioteca].[dbo].[TBR_Mensal]
                 SET mes_referencia = :mes, previsao_leitura = :prev
                 WHERE id = :id",
                [
                    ':mes'  => $mes_referencia,
                    ':prev' => $previsao_leitura,
                    ':id'   => (int)$id,
                ]
            );
            $result_status = true;
            $result_data   = ['message' => 'TBR atualizada com sucesso.'];
            return;
        }

        $result_error = 'Ação inválida.';

    } catch (Exception $e) {
        $result_error = 'Erro ao atualizar TBR: ' . $e->getMessage();
    }
}
