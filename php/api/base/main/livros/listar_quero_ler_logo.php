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

function GetMethod() {
    global $result_status, $result_error, $result_data;

    // ── Mapa de tabelas permitidas (mesmo whitelist das buscas) ─────
    $TABELAS = [
        'dbo.Livros'                => '[Biblioteca].[dbo].[Livros]',
        'Livros'                    => '[Biblioteca].[dbo].[Livros]',
        'dbo.LeiturasSKEELO'        => '[Biblioteca].[dbo].[LeiturasSKEELO]',
        'LeiturasSKEELO'            => '[Biblioteca].[dbo].[LeiturasSKEELO]',
        'dbo.LivrosBiblion'         => '[Biblioteca].[dbo].[LivrosBiblion]',
        'LivrosBiblion'             => '[Biblioteca].[dbo].[LivrosBiblion]',
        'dbo.LivrosMEC'             => '[Biblioteca].[dbo].[LivrosMEC]',
        'LivrosMEC'                 => '[Biblioteca].[dbo].[LivrosMEC]',
        'dbo.LivrosAudible'         => '[Biblioteca].[dbo].[LivrosAudible]',
        'LivrosAudible'             => '[Biblioteca].[dbo].[LivrosAudible]',
        'dbo.LivrosKindleUnlimited' => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
        'LivrosKindleUnlimited'     => '[Biblioteca].[dbo].[LivrosKindleUnlimited]',
    ];

    try {
        $db = new DataBase();

        // ── 1. Busca registros da fila, excluindo os já em leitura ──
        $sql = "
            SELECT
                q.id,
                q.titulo,
                q.autor,
                q.paginas,
                q.tema,
                q.natureza,
                q.origem,
                q.prioridade,
                q.dt_cadastro,
                ll.vTabelaVinculada AS tabela_vinculada
            FROM [Biblioteca].[dbo].[Quero_Ler_Logo] q
            LEFT JOIN [Biblioteca].[dbo].[LocalLeitura] ll
                ON ll.vLocal_Leitura = q.origem
            WHERE q.titulo NOT IN (
                SELECT titulo FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
            )
            ORDER BY
                CASE q.prioridade
                    WHEN 'Alta'  THEN 1
                    WHEN 'Média' THEN 2
                    ELSE 3
                END,
                q.id ASC
        ";

        $lista = $db->GetMany($sql);

        // ── 2. Para cada registro, enriquece com dados da tabela de origem ──
        foreach ($lista as &$item) {
            $tabelaVinc = $item['tabela_vinculada'] ?? '';
            if (empty($tabelaVinc) || !isset($TABELAS[$tabelaVinc])) continue;

            $tabelaSQL = $TABELAS[$tabelaVinc];
            try {
                $livro = $db->GetOne(
                    "SELECT titulo, autor, paginas, status
                     FROM {$tabelaSQL}
                     WHERE titulo = :titulo",
                    [':titulo' => $item['titulo']]
                );
                if ($livro) {
                    $item['autor']   = $livro['autor']   ?? $item['autor'];
                    $item['paginas'] = $livro['paginas'] ?? $item['paginas'];
                    $item['status']  = $livro['status']  ?? null;
                }
            } catch (Exception $e) {
                // coluna status pode não existir — ignora
                $item['status'] = null;
            }
        }
        unset($item);

        $result_data   = $lista;
        $result_status = true;

    } catch (Exception $e) {
        $result_error = 'Erro ao listar Quero Ler Logo: ' . $e->getMessage();
    }
}
