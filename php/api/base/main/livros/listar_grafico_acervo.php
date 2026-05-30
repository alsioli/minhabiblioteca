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
], JSON_UNESCAPED_UNICODE);

function contarPorStatus($db, $where, $params = []) {
    $sql = "
        SELECT
            SUM(CASE WHEN [status] = 'Lido'  THEN 1 ELSE 0 END) AS lidos,
            SUM(CASE WHEN [status] = 'Lendo' THEN 1 ELSE 0 END) AS lendo,
            SUM(CASE WHEN [status] NOT IN ('Lido','Lendo')
                      OR [status] IS NULL THEN 1 ELSE 0 END)     AS nao_lidos,
            COUNT(*) AS total
        FROM [Biblioteca].[dbo].[Livros]
        WHERE {$where}
    ";
    return $db->GetOne($sql, $params);
}

function GetMethod() {
    global $result_status, $result_error, $result_data;

    try {
        $db = new DataBase();

        // ── Livros físicos (estante, 1a. prateleira, presente) ─────
        $fisicos = contarPorStatus($db,
            "natureza IN ('Estante', '1a. prateleira', 'Presente')"
        );

        // ── Tag ────────────────────────────────────────────────────
        $tag = contarPorStatus($db,
            "natureza = 'Tag'"
        );

        // ── Ebooks / Kindle ────────────────────────────────────────
        $ebooks = contarPorStatus($db,
            "natureza = 'Compra Kindle'
              OR tipo_edicao IN ('Ebook', 'Digital', 'Kindle', 'E-book')"
        );

        // ── Geral por status (para o gráfico de rosca geral) ──────
        $sqlGeral = "
            SELECT
                ISNULL(NULLIF(TRIM([status]),''), 'Não informado') AS status,
                COUNT(*) AS total
            FROM [Biblioteca].[dbo].[Livros]
            GROUP BY ISNULL(NULLIF(TRIM([status]),''), 'Não informado')
            ORDER BY total DESC
        ";
        $geral = $db->GetMany($sqlGeral);

        $result_status = true;
        $result_data   = [
            'fisicos' => $fisicos,
            'tag'     => $tag,
            'ebooks'  => $ebooks,
            'geral'   => $geral,
        ];

    } catch (Exception $e) {
        $result_error = 'Erro ao carregar dados do acervo: ' . $e->getMessage();
    }
}
