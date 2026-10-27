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
    $id_livros    = trim($_POST['id_livros']    ?? '');
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

    if (empty($id_leitura)) {  // ESTÁ NA TABELA DE LEITURAS EM ANDAMENTO
        $result_error = 'ID da leitura é obrigatório.';
        return;
    }

    //     if (empty($id_livros)) {  // ESTÁ NA TABELA DE LEITURAS
    //     $result_error = 'ID do livro é obrigatório.';
    //     return;
    // }

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

     try {
        $db = new DataBase();

            $id_local_leitura = null;

            if ($local_leitura !== '') {
                $localMap = $db->GetOne(
                    "SELECT id FROM [Biblioteca].[dbo].[LocalLeitura] WHERE vLocal_Leitura = :local",
                    [':local' => $local_leitura]
                );

                if ($localMap && isset($localMap['id'])) {
                    $id_local_leitura = (int)$localMap['id'];
                }
            }

              if ($id_local_leitura == null) {
            $ultimaAtualizacao = $db->GetOne(
                "SELECT TOP 1 id_local_leitura
                 FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                 WHERE id_leitura = :id_leitura
                 ORDER BY dt_alteracao DESC, id DESC",
                [':id_leitura' => (int)$id_leitura]
            );
            if ($ultimaAtualizacao && isset($ultimaAtualizacao['id_local_leitura'])) {
                $id_local_leitura = (int)$ultimaAtualizacao['id_local_leitura'];
            }
        }

        // Nome do local é necessário para atualizar o status na tabela de origem
        if ($local_leitura === '' && $id_local_leitura) {
            $localNome = $db->GetOne(
                "SELECT vLocal_Leitura FROM [Biblioteca].[dbo].[LocalLeitura] WHERE id = :id",
                [':id' => $id_local_leitura]
            );
            if ($localNome) {
                $local_leitura = (string)$localNome['vLocal_Leitura'];
            }
        }

        // id_leitura (LeiturasEmAndamento) = ID do livro na tabela de origem.
        // IDs se repetem entre origens, então filtra também pelo local.
        $filtroLocal       = $id_local_leitura ? ' AND id_local_leitura = :id_local' : '';
        $paramsFiltroLocal = $id_local_leitura ? [':id_local' => $id_local_leitura] : [];

        // Leitura em aberto (data_fim NULL) deste livro em Leituras — cobre releituras
        $leituraAberta = $db->GetOne(
            "SELECT TOP 1 id FROM [Biblioteca].[dbo].[Leituras]
             WHERE id_livros = :id_livro AND data_fim IS NULL{$filtroLocal}
             ORDER BY data_inicio DESC, id DESC",
            [':id_livro' => (int)$id_leitura] + $paramsFiltroLocal
        );

    $sql = "
        INSERT INTO [Biblioteca].[dbo].[LeiturasEmAndamento]
            (id_leitura, titulo, autor, paginas, id_local_leitura, tipo_midia, data_inicio,
             dt_alteracao, tipo_input, percentual, pagina_atual, tempo_leitura,
             impressoes, avaliacao)
        VALUES
            (:p0, :p1, :p2, :p3, :p12, :p4, :p5,
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
            ':p12' => $id_local_leitura ?: null,
        ];

        // Bloqueia só se o livro já foi finalizado e não há leitura em aberto
        // (se houver uma leitura em aberto, é releitura e pode atualizar)
        $jaFinalizada = false;
        if (!$leituraAberta) {
            $jaFinalizada = $db->GetOne(
                "SELECT TOP 1 id FROM [Biblioteca].[dbo].[Leituras]
                 WHERE id_livros = :id_livro AND data_fim IS NOT NULL{$filtroLocal}",
                [':id_livro' => (int)$id_leitura] + $paramsFiltroLocal
            );
        }

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
                 WHERE id_leitura = :id_leitura{$filtroLocal}
                   AND (percentual >= 100 OR (paginas > 0 AND pagina_atual >= paginas))",
                [':id_leitura' => (int)$id_leitura] + $paramsFiltroLocal
            );
            if ($jaConcluido) {
                $result_error = 'Já existe uma atualização de conclusão registrada para esta leitura.';
                return;
            }
        }

        // Se concluído: remover da LeiturasEmAndamento e marcar Leituras.data_fim
        if ($concluido) {
            // Recomendo usar transação para garantir atomicidade
            if (method_exists($db, 'BeginTransaction')) $db->BeginTransaction();

            try {
                $db->ExecuteNonQuery(
                    "DELETE FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
                     WHERE id_leitura = :id_leitura{$filtroLocal}",
                    [':id_leitura' => (int)$id_leitura] + $paramsFiltroLocal
                );

                // Finaliza a leitura em aberto (Leituras.id), não o ID do livro
                if ($leituraAberta) {
                    $db->ExecuteNonQuery(
                        "UPDATE [Biblioteca].[dbo].[Leituras]
                         SET data_fim   = CAST(GETDATE() AS DATE),
                             tempo_dias = DATEDIFF(day, data_inicio, CAST(GETDATE() AS DATE)),
                             mes        = FORMAT(GETDATE(), 'MM/yyyy'),
                             avaliacao  = COALESCE(:avaliacao, avaliacao)
                         WHERE id = :id",
                        [
                            ':avaliacao' => $avaliacao !== '' ? (float)$avaliacao : null,
                            ':id'        => (int)$leituraAberta['id'],
                        ]
                    );
                    completarDadosLeitura($db, (int)$leituraAberta['id'], (int)$id_leitura, $id_local_leitura);
                }

                atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, 'Lido');

                try {
                    $db->ExecuteNonQuery(
                        "UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                         SET situacao = 'Lido'
                         WHERE titulo = :titulo
                           AND situacao <> 'Lido'",
                        [':titulo' => $titulo]
                    );
                } catch (Exception $e) {
                    error_log('[create_atualizacao_leitura] Erro ao atualizar CronogramaLCs: ' . $e->getMessage());
                }

                if (method_exists($db, 'Commit')) $db->Commit();

                $result_status = true;
                $result_data   = ['message' => 'Leitura concluída e movida para a tabela finalizada.'];
                return;
            } catch (Exception $e) {
                if (method_exists($db, 'Rollback')) $db->Rollback();
                throw $e;
            }
        }

        // Se não concluído, tenta atualizar o registro existente ou inserir novo
        $registroExistente = $db->GetOne(
            "SELECT TOP 1 id FROM [Biblioteca].[dbo].[LeiturasEmAndamento]
             WHERE id_leitura = :id_leitura{$filtroLocal}
             ORDER BY dt_alteracao DESC, id DESC",
            [':id_leitura' => (int)$id_leitura] + $paramsFiltroLocal
        );

        if ($registroExistente) {
            // UPDATE do registro existente
            $sqlUpdate = "
                UPDATE [Biblioteca].[dbo].[LeiturasEmAndamento]
                SET dt_alteracao = GETDATE(),
                    tipo_input = :p6,
                    percentual = :p7,
                    pagina_atual = :p8,
                    tempo_leitura = :p9,
                    impressoes = :p10,
                    avaliacao = :p11,
                    id_local_leitura = :p12,
                    titulo = :p1,
                    autor = :p2,
                    paginas = :p3,
                    tipo_midia = :p4,
                    data_inicio = :p5
                WHERE id = :id_registro
            ";
            $paramsUpdate = $params;
            unset($paramsUpdate[':p0']);
            $paramsUpdate[':id_registro'] = (int)$registroExistente['id'];
            $db->ExecuteNonQuery($sqlUpdate, $paramsUpdate);
        } else {
            // INSERT novo registro
            $db->ExecuteNonQuery($sql, $params);
        }

        if ($leituraAberta) {
            completarDadosLeitura($db, (int)$leituraAberta['id'], (int)$id_leitura, $id_local_leitura);
        }

        $statusTabela = $pctFinal > 0.1 ? ($concluido ? 'Lido' : 'Lendo') : null;

        if ($statusTabela !== null) {
            atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, $statusTabela);

            // Atualiza situação no CronogramaLCs se o livro estiver vinculado
            try {
                $db->ExecuteNonQuery("
                    UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                    SET situacao = :situacao
                    WHERE titulo = :titulo
                      AND situacao <> :situacao
                ", [':situacao' => $statusTabela, ':titulo' => $titulo]);
            } catch (Exception $e) {
                error_log('[create_atualizacao_leitura] Erro ao atualizar CronogramaLCs: ' . $e->getMessage());
            }
        }

        $result_status = true;
        $result_data   = ['message' => 'Atualização registrada com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao salvar atualização: ' . $e->getMessage();
    }
}

/**
 * Preenche em Leituras os campos vazios que vêm do cadastro do livro
 * (tema, tipo_leitura) e marca resenhas = 'S' se já houver resenha.
 * Silencia erros para não quebrar o fluxo principal.
 */
function completarDadosLeitura($db, int $idLeituraRegistro, int $idLivro, ?int $idLocal): void {
    try {
        if ($idLocal) {
            $local  = $db->GetOne(
                "SELECT vTabelaVinculada FROM [Biblioteca].[dbo].[LocalLeitura] WHERE id = :id",
                [':id' => $idLocal]
            );
            $tabela = $local ? trim((string)$local['vTabelaVinculada']) : '';

            if (preg_match('/^dbo\.(\w+)$/', $tabela, $m)) {
                // Só a tabela Livros tem tipo_edicao; nas demais usa tipo_midia
                $colTipo = $m[1] === 'Livros' ? 'tipo_edicao' : 'tipo_midia';

                $db->ExecuteNonQuery(
                    "UPDATE l
                     SET l.tema         = COALESCE(NULLIF(l.tema, ''),         o.tema),
                         l.tipo_leitura = COALESCE(NULLIF(l.tipo_leitura, ''), CAST(o.{$colTipo} AS VARCHAR(100)))
                     FROM [Biblioteca].[dbo].[Leituras] l
                     INNER JOIN [Biblioteca].[dbo].[{$m[1]}] o ON o.id = :id_livro
                     WHERE l.id = :id",
                    [':id_livro' => $idLivro, ':id' => $idLeituraRegistro]
                );
            }
        }

        $db->ExecuteNonQuery(
            "UPDATE [Biblioteca].[dbo].[Leituras]
             SET resenhas = 'S'
             WHERE id = :id
               AND EXISTS (SELECT 1 FROM [Biblioteca].[dbo].[Resenhas] r WHERE r.id_leitura = :id_r)",
            [':id' => $idLeituraRegistro, ':id_r' => $idLeituraRegistro]
        );
    } catch (Exception $e) {
        error_log('[create_atualizacao_leitura] Erro ao completar dados da leitura: ' . $e->getMessage());
    }
}
