<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[LeiturasEmAndamento] (
 *     id            INT IDENTITY(1,1) PRIMARY KEY,
 *     id_leitura    INT NOT NULL,
 *     titulo        NVARCHAR(500),
 *     autor         NVARCHAR(300),
 *     paginas       INT,
 *     tipo_midia    NVARCHAR(100),
 *     data_inicio   DATE,
 *     dt_alteracao  DATETIME DEFAULT GETDATE(),
 *     tipo_input    NVARCHAR(20),
 *     percentual    DECIMAL(5,2),
 *     pagina_atual  INT,
 *     tempo_leitura INT,
 *     impressoes    NVARCHAR(MAX),
 *     avaliacao     DECIMAL(3,1)
 * );
 */

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
]);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $id_leitura    = trim($_POST['id_leitura']    ?? '');
    $titulo        = trim($_POST['titulo']        ?? '');
    $autor         = trim($_POST['autor']         ?? '');
    $paginas       = trim($_POST['paginas']       ?? '');
    $tipo_midia    = trim($_POST['tipo_midia']    ?? '');
    $data_inicio   = trim($_POST['data_inicio']   ?? '');
    $tipo_input    = trim($_POST['tipo_input']    ?? '');
    $percentual    = trim($_POST['percentual']    ?? '');
    $pagina_atual  = trim($_POST['pagina_atual']  ?? '');
    $impressoes    = trim($_POST['impressoes']    ?? '');
    $avaliacao     = trim($_POST['avaliacao']     ?? '');
    $local_leitura = trim($_POST['local_leitura'] ?? '');

    if (empty($id_leitura)) {
        $result_error = 'ID da leitura é obrigatório.';
        return;
    }

    if (empty($tipo_input) || !in_array($tipo_input, ['percentual', 'pagina'])) {
        $result_error = 'Tipo de input inválido.';
        return;
    }

    if ($tipo_input === 'percentual' && $percentual === '') {
        $result_error = 'Informe o percentual lido.';
        return;
    }

    if ($tipo_input === 'pagina' && $pagina_atual === '') {
        $result_error = 'Informe a página atual.';
        return;
    }

    // Auto-calcula o campo faltante com base no total de páginas
    $pagTotal = $paginas !== '' ? (int)$paginas : 0;
    if ($tipo_input === 'percentual' && $percentual !== '' && $pagina_atual === '' && $pagTotal > 0) {
        $pagina_atual = (string)round((float)$percentual / 100 * $pagTotal);
    } elseif ($tipo_input === 'pagina' && $pagina_atual !== '' && $percentual === '' && $pagTotal > 0) {
        $percentual = (string)round((int)$pagina_atual / $pagTotal * 100, 2);
    }

    // Calcula tempo_leitura em dias
    $tempo_leitura = null;
    if (!empty($data_inicio)) {
        try {
            $dt_inicio = new DateTime($data_inicio);
            $hoje      = new DateTime();
            $tempo_leitura = (int)$hoje->diff($dt_inicio)->days;
        } catch (Exception $e) {
            // silencioso — campo fica null
        }
    }

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[LeiturasEmAndamento]
            (id_leitura, titulo, autor, paginas, tipo_midia, data_inicio,
             dt_alteracao, tipo_input, percentual, pagina_atual, tempo_leitura,
             impressoes, avaliacao)
        VALUES
            (:p0, :p1, :p2, :p3, :p4, :p5,
             GETDATE(), :p6, :p7, :p8, :p9,
             :p10, :p11)
    ";

    $params = [
        ':p0'  => (int)$id_leitura,
        ':p1'  => $titulo    ?: null,
        ':p2'  => $autor     ?: null,
        ':p3'  => $paginas   !== '' ? (int)$paginas : null,
        ':p4'  => $tipo_midia ?: null,
        ':p5'  => $data_inicio ?: null,
        ':p6'  => $tipo_input,
        ':p7'  => $percentual  !== '' ? (float)$percentual  : null,
        ':p8'  => $pagina_atual !== '' ? (int)$pagina_atual : null,
        ':p9'  => $tempo_leitura,
        ':p10' => $impressoes  ?: null,
        ':p11' => $avaliacao   !== '' ? (float)$avaliacao : null,
    ];

    try {
        $db = new DataBase();

        // Bloqueia se a leitura já foi finalizada em Leituras
        $jaFinalizada = $db->GetOne(
            "SELECT id FROM [Biblioteca].[dbo].[Leituras] WHERE id = :id AND data_fim IS NOT NULL",
            [':id' => (int)$id_leitura]
        );
        if ($jaFinalizada) {
            $result_error = 'Esta leitura já foi finalizada e não aceita novas atualizações.';
            return;
        }

        // Calcula conclusão antes do INSERT para poder checar duplicata
        $pctFinal  = $percentual !== '' ? (float)$percentual : 0;
        $pagFinal  = $pagina_atual !== '' ? (int)$pagina_atual : 0;
        $pagTotal  = $paginas !== '' ? (int)$paginas : 0;
        $concluido = $pctFinal >= 100 || ($pagTotal > 0 && $pagFinal >= $pagTotal);

        // Bloqueia duplicata de conclusão (100% ou total de páginas)
        if ($concluido) {
            $jaConcluido = $db->GetOne(
                "SELECT TOP 1 id FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                 WHERE id_leitura = :id
                   AND (percentual >= 100 OR (paginas > 0 AND pagina_atual >= paginas))",
                [':id' => (int)$id_leitura]
            );
            if ($jaConcluido) {
                $result_error = 'Já existe uma atualização de conclusão registrada para esta leitura.';
                return;
            }
        }

        $db->ExecuteNonQuery($sql, $params);

        $statusTabela = $pctFinal > 0.1 ? ($concluido ? 'Lido' : 'Lendo') : null;

        if ($statusTabela !== null) {
            atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, $statusTabela);
        }

        $result_status = true;
        $result_data   = ['message' => 'Atualização registrada com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao salvar atualização: ' . $e->getMessage();
    }
}
