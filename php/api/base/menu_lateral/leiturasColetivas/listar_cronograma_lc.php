<?php

require_once __DIR__ . '/../../../../utils/function/database.php';

// Evita que warnings/notices sejam impressos no output JSON
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED & ~E_STRICT);

// Inicia buffer para capturar qualquer saída acidental
ob_start();

$result_status = false;
$result_error = '';
$result_data = null;

try {
    $db = new DataBase();

    $sql = "
        SELECT id, titulo, lc, data_cadastro, data_final, paginas, mes, situacao
        FROM [Biblioteca].[dbo].[CronogramaLCs]
        ORDER BY data_final ASC
    ";

    $result = $db->GetMany($sql);

    $result_status = true;
    $result_data = $result ?: [];

} catch (Exception $e) {
    $result_error = "Erro ao carregar cronograma: " . $e->getMessage();
}

// Captura e limpa qualquer saída gerada durante a execução
$captured = ob_get_clean();
if ($captured) {
    // se houver algo impresso, anexamos ao campo de erro para diagnóstico
    $result_error = trim(($result_error ? $result_error . ' | ' : '') . $captured);
}

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => $result_status,
    'error'  => $result_error,
    'data'   => $result_data
]);
