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
]);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    //$id_leitura    = trim($_POST['id'] ?? $_POST['id_leitura'] ?? '');
    $id_leitura    = trim($_POST['id'] ?? '');
    $titulo      = trim($_POST['titulo']      ?? '');
    $autor       = trim($_POST['autor']       ?? '');
    $paginas     = trim($_POST['paginas']     ?? '');
    $tipo_midia  = trim($_POST['tipo_midia']  ?? '');
    $natureza    = trim($_POST['natureza']    ?? '');
    $data_inicio = trim($_POST['data_inicio'] ?? '');
    $avaliacao   = trim($_POST['avaliacao']   ?? '');

    $local_leitura = trim($_POST['local_leitura'] ?? '');

    $sexo_autor = trim($_POST['sexo_autor'] ?? '');
    $pais       = trim($_POST['pais']       ?? '');
    $raca       = trim($_POST['raca']       ?? '');
    $tema       = trim($_POST['tema']       ?? '');

    if (empty($id_leitura)) {
        $result_error = 'ID do livro é obrigatório.';
        return;
    }    

    if (empty($titulo)) {
        $result_error = 'Título é obrigatório.';
        return;
    }

    if (empty($data_inicio)) {
        $result_error = 'Data de início é obrigatória.';
        return;
    }

    $dt = DateTime::createFromFormat('Y-m-d', $data_inicio);
    if (!$dt) {
        $result_error = 'Data de início inválida.';
        return;
    }
    $mes = $dt->format('m/Y');

    $campos  = ['id_leitura', 'titulo', 'autor', 'natureza', 'tipo_midia', 'paginas', 'mes', 'data_inicio'];
    $valores = [        
        $id_leitura,
        $titulo,
        $autor,
        $natureza   ?: null,
        $tipo_midia ?: null,
        $paginas !== '' ? (int)$paginas : null,
        $mes,
        $data_inicio,
    ];

    if ($sexo_autor    !== '') { $campos[] = 'sexo_autor';    $valores[] = $sexo_autor; }
    if ($pais          !== '') { $campos[] = 'pais';          $valores[] = $pais; }
    if ($raca          !== '') { $campos[] = 'raça';          $valores[] = $raca; }
    if ($tema          !== '') { $campos[] = 'tema';          $valores[] = $tema; }
    if ($avaliacao     !== '') { $campos[] = 'avaliacao';     $valores[] = (float)$avaliacao; }

    // Campos sem local_leitura (fallback caso a coluna não exista ainda)
    $camposSemLocal = $campos;
    $valoresSemLocal = $valores;


    if ($local_leitura !== '') { $campos[] = 'local_leitura'; $valores[] = $local_leitura; }

    function buildInsert(array $campos, array $valores): array {
        $colList   = implode(', ', array_map(fn($c) => "[{$c}]", $campos));
        $paramList = implode(', ', array_map(fn($i) => ':p' . $i, range(0, count($campos) - 1)));
        $sql       = "INSERT INTO [Biblioteca].[dbo].[Leituras] ({$colList}) OUTPUT INSERTED.id VALUES ({$paramList})";
        $params    = [];
        foreach ($valores as $i => $v) { $params[':p' . $i] = $v; }
        return [$sql, $params];
    }

    try {
        $db = new DataBase();

        [$sql, $params] = buildInsert($campos, $valores);
        try {
            $row = $db->GetOne($sql, $params);
        } catch (Exception $e) {
            // local_leitura pode não existir — tenta sem ela
            [$sql, $params] = buildInsert($camposSemLocal, $valoresSemLocal);
            $row = $db->GetOne($sql, $params);
        }

        $idLeitura = isset($row['id']) ? (int)$row['id'] : 0;
        if ($idLeitura <= 0) {
            throw new Exception('Não foi possível obter o ID da leitura criada.');
        }

        // Registra entrada inicial em LeiturasEmAndamento (progresso zerado)
        $sqlLA = "
            INSERT INTO [Biblioteca].[dbo].[LeiturasEmAndamento]
                (id_leitura, titulo, autor, paginas, tipo_midia, data_inicio,
                 dt_alteracao, tipo_input, percentual, pagina_atual, tempo_leitura, local_leitura)
            VALUES
                (:id, :titulo, :autor, :paginas, :tipo_midia, :data_inicio,
                 GETDATE(), 'percentual', 0, 0, 0, :local_leitura)
        ";

        $paramsLA = [
            ':id'         => $idLeitura,
            ':titulo'     => $titulo,
            ':autor'      => $autor,
            ':paginas'    => $paginas !== '' ? (int)$paginas : null,
            ':tipo_midia' => $tipo_midia ?: null,
            ':data_inicio'=> $data_inicio,
            ':local_leitura' => $local_leitura ?: null,
        ];

        $db->ExecuteNonQuery($sqlLA, $paramsLA);

        // Remove automaticamente da fila "Quero Ler Logo" se estiver lá
        try {
            $db->ExecuteNonQuery(
                "DELETE FROM [Biblioteca].[dbo].[Quero_Ler_Logo] WHERE titulo = :titulo",
                [':titulo' => $titulo]
            );
        } catch (Exception $e) {
            // Tabela pode não existir — ignora silenciosamente
        }

        // Atualiza status para 'Lendo' na tabela correspondente ao local de leitura
        atualizarStatusNaTabela($db, $local_leitura, $titulo, $autor, 'Lendo');

        // Atualiza situação no CronogramaLCs se o livro estiver vinculado
        try {
            $db->ExecuteNonQuery("
                UPDATE [Biblioteca].[dbo].[CronogramaLCs]
                SET situacao = 'Lendo'
                WHERE titulo = :titulo
                  AND situacao <> 'Lendo'
            ", [':titulo' => $titulo]);
        } catch (Exception $e) {
            error_log('[create_leitura] Erro ao atualizar CronogramaLCs: ' . $e->getMessage());
        }

        $result_status = true;
        $result_data   = ['message' => 'Leitura registrada com sucesso.', 'id' => $idLeitura];

    } catch (Exception $e) {
        $result_error = 'Erro ao salvar leitura: ' . $e->getMessage();
    }
}
