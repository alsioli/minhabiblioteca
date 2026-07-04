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

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data,
], JSON_UNESCAPED_UNICODE);

function GetMethod() {
    global $result_status, $result_error, $result_data;

    $titulo = trim($_GET['titulo'] ?? '');

    if (strlen($titulo) < 3) {
        $result_error = 'Digite pelo menos 3 caracteres.';
        return;
    }

    $like = '%' . $titulo . '%';

    try {
        $db = new DataBase();

        // Tentativa 1: com colunas opcionais (sexo_autor, pais, tema, local_leitura)
        try {
            $rows = $db->GetMany(
                "SELECT id, titulo,
                        ISNULL(autor, '')                       AS autor,
                        ISNULL(sexo_autor, '')                  AS sexo_autor,
                        ISNULL(pais, '')                        AS nacionalidade,
                        ISNULL(CAST(paginas AS NVARCHAR), '')   AS paginas,
                        ISNULL(tema, '')                        AS tema,
                        ISNULL(mes, '')                         AS mes,
                        ISNULL(local_leitura, 'Biblioteca')     AS local_leitura,
                        CASE WHEN data_fim IS NOT NULL THEN 'Lido' ELSE 'Em andamento' END AS status_leitura
                 FROM [Biblioteca].[dbo].[Leituras]
                 WHERE titulo LIKE :titulo
                 ORDER BY titulo ASC, data_fim DESC",
                [':titulo' => $like]
            );
            $result_status = true;
            $result_data   = $rows;
            return;
        } catch (Exception $e) { /* colunas opcionais ausentes — tenta sem elas */ }

        // Tentativa 2: somente colunas garantidas (sem sexo_autor, pais, tema, local_leitura)
        $rows = $db->GetMany(
            "SELECT id, titulo,
                    ISNULL(autor, '')                     AS autor,
                    ''                                    AS sexo_autor,
                    ''                                    AS nacionalidade,
                    ISNULL(CAST(paginas AS NVARCHAR), '') AS paginas,
                    ''                                    AS tema,
                    ISNULL(mes, '')                       AS mes,
                    'Biblioteca'                          AS local_leitura,
                    CASE WHEN data_fim IS NOT NULL THEN 'Lido' ELSE 'Em andamento' END AS status_leitura
             FROM [Biblioteca].[dbo].[Leituras]
             WHERE titulo LIKE :titulo
             ORDER BY titulo ASC, data_fim DESC",
            [':titulo' => $like]
        );
        $result_status = true;
        $result_data   = $rows;

    } catch (Exception $e) {
        $result_error = 'Erro ao buscar leituras: ' . $e->getMessage();
    }
}
