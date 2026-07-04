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

    $titulo        = trim($_POST['titulo']        ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');

    if (strlen($titulo) < 3) {
        $result_error = 'Digite pelo menos 3 caracteres para buscar.';
        return;
    }

    $params = [':titulo' => '%' . $titulo . '%'];
    $localFilter = '';
    if ($local_leitura !== '') {
        $localFilter = ' AND local_leitura = :local_leitura';
        $params[':local_leitura'] = $local_leitura;
    }

    // Query completa — inclui data_fim e avaliacao com cast seguro
    $sqlCompleta = "
        SELECT
            id,
            titulo,
            autor,
            ISNULL(CONVERT(VARCHAR(10), data_inicio, 23), '') AS data_inicio,
            ISNULL(CONVERT(VARCHAR(10), data_fim,    23), '') AS data_fim,
            ISNULL(natureza, '')                              AS natureza,
            ISNULL(CAST(avaliacao AS NVARCHAR(10)), '')       AS avaliacao,
            ISNULL(local_leitura, '')                         AS local_leitura
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE titulo LIKE :titulo
          AND data_fim IS NULL{$localFilter}
        ORDER BY data_inicio DESC
    ";

    // Fallback mínimo — apenas colunas garantidas do schema base
    $sqlMinima = "
        SELECT
            id,
            titulo,
            autor,
            ISNULL(CONVERT(VARCHAR(10), data_inicio, 23), '') AS data_inicio,
            ''                                                AS data_fim,
            ISNULL(natureza, '')                              AS natureza,
            ''                                                AS avaliacao,
            ''                                                AS local_leitura
        FROM [Biblioteca].[dbo].[Leituras]
        WHERE titulo LIKE :titulo
          AND data_fim IS NULL{$localFilter}
        ORDER BY data_inicio DESC
    ";

    try {
        $db = new DataBase();

        try {
            $result_data = $db->GetMany($sqlCompleta, $params);
        } catch (Exception $e) {
            $result_data = $db->GetMany($sqlMinima, $params);
        }

        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao buscar leituras: ' . $e->getMessage();
    }
}
