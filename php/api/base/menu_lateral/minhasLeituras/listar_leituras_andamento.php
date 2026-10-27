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
    // Pega o registro mais recente por livro + local.
    // id_leitura = ID do livro na origem; casa com Leituras.id_livros (leitura em aberto)
    // e o nome do local vem de LocalLeitura.
  $sqlComLocal = "
    WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY id_leitura, id_local_leitura ORDER BY dt_alteracao DESC) AS rn
        FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
    )
    SELECT
        r.id_leitura                        AS id,
        r.titulo,
        r.autor,
        r.paginas,
        r.tipo_midia,
        r.data_inicio,
        ISNULL(lt.tema,           '')       AS tema,
        ISNULL(ll.vLocal_Leitura, '')       AS local_leitura,
        r.id_leitura                        AS id_livros
    FROM ranked r
    LEFT JOIN [Biblioteca].[dbo].[LocalLeitura] ll ON ll.id = r.id_local_leitura
    OUTER APPLY (
        SELECT TOP 1 l.tema
        FROM [Biblioteca].[dbo].[Leituras] l
        WHERE l.id_livros        = r.id_leitura
          AND l.id_local_leitura = r.id_local_leitura
          AND l.data_fim IS NULL
        ORDER BY l.data_inicio DESC, l.id DESC
    ) lt
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
        '' AS local_leitura,
        r.id_leitura AS id_livros
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
