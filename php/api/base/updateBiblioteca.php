<?php

include_once 'php/util/database.php';
include_once 'php/util/routes.php';

//Inicializar variáveis de resposta
$result_status = 'false';
$result_error = '';
$result_data = null;


switch($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        //GetMethod($routes->$params);
        break;
    case 'POST':
        break;
    case 'PUT':
        PutMethod();
        break;
    case 'DELETE':
        break;
    default:
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

//header('Content-Type: application/json');
echo json_encode($response);

function PutMethod($params) {
    
    global $result_status, $result_error, $result_data;

    $id = isset($_GET['id']);
    $titulo  = isset($_GET['titulo']) ? $_GET['titulo'] : null;  
    $autor = isset ($_GET['autor']) ? $_GET['autor'] : null;
    $serie  = isset($_GET['serie']) ? $_GET['serie']: null;
    $volume  = isset($_GET['volume']) ? $_GET['volume']: null;
    $genero  = isset($_GET['genero']) ? $_GET['genero']: null;
    $tema  = isset($_GET['tema']) ? $_GET['tema']: null;
    $editora = isset($_GET['editora']) ? $_GET['editora']: null;
    $tipo_edicao  = isset($_GET['tipo_edicao']) ? $_GET['tipo_edicao']: null;
    $paginas  = isset($_GET['paginas']) ? $_GET['paginas']: null;
    $nacionalidade  = isset($_GET['nacionalidade']) ? $_GET['nacionalidade']: null;
    $troca_skoob  = isset($_GET['troca_skoob']) ? $_GET['troca_skoob']: null;
    $local  = isset($_GET['local']) ? $_GET['local']: null;
    $status  = isset($_GET['status']) ? $_GET['status']: null;
    $avaliacao  = isset($_GET['avaliacao']) ? $_GET['avaliacao']: null;
    $emprestimo  = isset($_GET['emprestimo']) ? $_GET['emprestimo']: null;
    $compra_bienal  = isset($_GET['compra_bienal']) ? $_GET['compra_bienal']: null;
    $mes_leitura  = isset($_GET['mes_leitura']) ? $_GET['mes_leitura']: null;
    $data_compra = isset($_GET['data_compra']) ? $_GET['data_compra']: null;

    $sqlQuery = "UPDATE [Biblioteca].[dbo].[Livros]
        SET titulo = $titulo',
            autor = '$autor',
            serie = '$serie',
            volume = '$volume',
            genero = '$genero',
            tema = '$tema',
            editora = '$editora',
            tipo_edicao = '$tipo_edicao',
            paginas = '$paginas',
            nacionalidade = '$nacionalidade',
            troca_skoob = '$troca_skoob',
            local = '$local',
            status = '$status',
            avaliacao = '$avaliacao',
            emprestimo = '$emprestimo',
            compra_bienal = '$compra_bienal',
            mes_leitura = '$mes_leitura',
            data_compra = '$data_compra'
        WHERE id = $id;";

    try{
      $db = new Database(); 
        // echo $sqlQuery;
      //die();
      $result_data = $db->ExecuteNonQuery($sqlQuery, $params = []);
      $result_status = 'true';
    } catch(Exception $e){
      $result_status = 'false';
      $result_error = $e->getMessage();
    }
}