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

    if (empty($titulo) || empty($autor)) {
        $result_error = 'Título e autor são obrigatórios.';
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

    $campos  = ['titulo', 'autor', 'natureza', 'tipo_midia', 'paginas', 'mes', 'data_inicio'];
    $valores = [
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

        if (!$row || empty($row['id'])) {
            $result_error = 'Erro ao obter ID da leitura criada.';
            return;
        }

        $id_leitura = (int)$row['id'];

        // Registra entrada inicial em LeiturasEmAndamento (progresso zerado)
        $sqlLA = "
            INSERT INTO [Biblioteca].[dbo].[LeiturasEmAndamento]
                (id_leitura, titulo, autor, paginas, tipo_midia, data_inicio,
                 dt_alteracao, tipo_input, percentual, pagina_atual, tempo_leitura)
            VALUES
                (:id, :titulo, :autor, :paginas, :tipo_midia, :data_inicio,
                 GETDATE(), 'percentual', 0, 0, 0)
        ";

        $paramsLA = [
            ':id'         => $id_leitura,
            ':titulo'     => $titulo,
            ':autor'      => $autor,
            ':paginas'    => $paginas !== '' ? (int)$paginas : null,
            ':tipo_midia' => $tipo_midia ?: null,
            ':data_inicio'=> $data_inicio,
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

        $result_status = true;
        $result_data   = ['message' => 'Leitura registrada com sucesso.', 'id' => $id_leitura];

    } catch (Exception $e) {
        $result_error = 'Erro ao salvar leitura: ' . $e->getMessage();
    }
}
