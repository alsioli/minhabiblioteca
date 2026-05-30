<?php

/*
 * DDL — execute no SQL Server antes de usar este endpoint:
 *
 * CREATE TABLE [Biblioteca].[dbo].[TBR_Mensal] (
 *     id               INT IDENTITY(1,1) PRIMARY KEY,
 *     origem           NVARCHAR(100)  NULL,
 *     releitura        NVARCHAR(3)    NULL,         -- 'Sim' ou 'Não'
 *     titulo           NVARCHAR(500)  NOT NULL,
 *     autor            NVARCHAR(300)  NULL,
 *     sexo_autor       NVARCHAR(10)   NULL,
 *     pais             NVARCHAR(100)  NULL,
 *     natureza         NVARCHAR(100)  NULL,
 *     tema             NVARCHAR(100)  NULL,
 *     tipo_edicao      NVARCHAR(100)  NULL,
 *     paginas          INT            NULL,
 *     mes_referencia   NVARCHAR(7)    NOT NULL,     -- formato MM/YYYY
 *     previsao_leitura NVARCHAR(50)   NOT NULL,
 *     dt_cadastro      DATETIME       DEFAULT GETDATE()
 * );
 */

include_once __DIR__ . "/../../../../utils/function/database.php";

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
], JSON_UNESCAPED_UNICODE);

function PostMethod() {
    global $result_status, $result_error, $result_data;

    $origem           = trim($_POST['origem']           ?? '');
    $releitura        = trim($_POST['releitura']        ?? '');
    $titulo           = trim($_POST['titulo']           ?? '');
    $autor            = trim($_POST['autor']            ?? '');
    $sexo_autor       = trim($_POST['sexo_autor']       ?? '');
    $pais             = trim($_POST['pais']             ?? '');
    $natureza         = trim($_POST['natureza']         ?? '');
    $tema             = trim($_POST['tema']             ?? '');
    $tipo_edicao      = trim($_POST['tipo_edicao']      ?? '');
    $paginas          = trim($_POST['paginas']          ?? '');
    $mes_referencia   = trim($_POST['mes_referencia']   ?? '');
    $previsao_leitura = trim($_POST['previsao_leitura'] ?? '');

    if (empty($titulo)) {
        $result_error = 'Título é obrigatório.';
        return;
    }

    if (empty($mes_referencia) || !preg_match('/^\d{2}\/\d{4}$/', $mes_referencia)) {
        $result_error = 'Mês de referência inválido. Use o formato MM/YYYY.';
        return;
    }

    $opcoesValidas = ['Começo do mês', 'Depois do dia 10', 'Antes do dia 20', 'Final do mês'];
    if (empty($previsao_leitura) || !in_array($previsao_leitura, $opcoesValidas)) {
        $result_error = 'Previsão de leitura inválida.';
        return;
    }

    try {
        $db = new DataBase();
        $db->ExecuteNonQuery("
            INSERT INTO [Biblioteca].[dbo].[TBR_Mensal]
                (origem, releitura, titulo, autor, sexo_autor, pais,
                 natureza, tema, tipo_edicao, paginas, mes_referencia, previsao_leitura)
            VALUES
                (:p0, :p1, :p2, :p3, :p4, :p5,
                 :p6, :p7, :p8, :p9, :p10, :p11)
        ", [
            ':p0'  => $origem        ?: null,
            ':p1'  => $releitura     ?: null,
            ':p2'  => $titulo,
            ':p3'  => $autor         ?: null,
            ':p4'  => $sexo_autor    ?: null,
            ':p5'  => $pais          ?: null,
            ':p6'  => $natureza      ?: null,
            ':p7'  => $tema          ?: null,
            ':p8'  => $tipo_edicao   ?: null,
            ':p9'  => $paginas !== '' ? (int)$paginas : null,
            ':p10' => $mes_referencia,
            ':p11' => $previsao_leitura,
        ]);

        $result_status = true;
        $result_data   = ['message' => 'Livro adicionado ao TBR Mensal com sucesso.'];
    } catch (Exception $e) {
        $result_error = 'Erro ao cadastrar TBR: ' . $e->getMessage();
    }
}
