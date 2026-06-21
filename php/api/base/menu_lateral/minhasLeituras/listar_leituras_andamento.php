<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error  = null;
$result_data   = null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        GetMethod();
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

function GetMethod() {
    global $result_status, $result_error, $result_data;

    // LeiturasEmAndamento é a fonte de verdade para livros em leitura.
    // Pega o registro mais recente por livro e faz JOIN com Leituras para obter local_leitura.
    $sqlComLocal = "
        WITH ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY id_leitura ORDER BY dt_alteracao DESC) AS rn
            FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
        )
        SELECT
            r.id_leitura                        AS id,
            r.titulo,
            r.autor,
            r.paginas,
            r.tipo_midia,
            r.data_inicio,
            ISNULL(lt.tema,          '')        AS tema,
            ISNULL(lt.local_leitura, '')        AS local_leitura
        FROM ranked r
        LEFT JOIN [Biblioteca].[dbo].[Leituras] lt ON lt.id = r.id_leitura
        WHERE r.rn = 1
        ORDER BY r.dt_alteracao DESC
    ";

    $sqlSemLocal = "
        WITH ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY id_leitura ORDER BY dt_alteracao DESC) AS rn
            FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
        )
        SELECT
            r.id_leitura AS id,
            r.titulo,
            r.autor,
            r.paginas,
            r.tipo_midia,
            r.data_inicio,
            '' AS tema,
            '' AS local_leitura
        FROM ranked r
        WHERE r.rn = 1
        ORDER BY r.dt_alteracao DESC
    ";

    try {
        $db = new DataBase();
        try {
            $result_data = $db->GetMany($sqlComLocal);
        } catch (Exception $e) {
            // local_leitura pode não existir em Leituras — fallback sem ela
            $result_data = $db->GetMany($sqlSemLocal);
        }
        $result_status = true;
    } catch (Exception $e) {
        $result_error = 'Erro ao listar leituras em andamento: ' . $e->getMessage();
    }
}
