<?php

include 'php/util/class/database.php';
include 'php/util/class/routes.php';
include 'php/class/assets/js/http.js';



switch($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        GetMethod($routes -> $params);
        break;
    case 'POST':
        // Handle POST request
        echo "Handling POST request";
        break;
    case 'PUT':
        // Handle PUT request
        echo "Handling PUT request";
        break;
    case 'DELETE':
        // Handle DELETE request
        echo "Handling DELETE request";
        break;
    default:
        // Handle unsupported methods
        http_response_code(405);
        echo "Method Not Allowed";
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
echo json_encode($response);

function GetMethod($params) {
    
    global $result_status, $result_error, $result_data;

    $sqlQuery = "SELECT top (100) [id]
      ,[titulo]
      ,[autor]
      ,[serie]
      ,[volume]
      ,[genero]
      ,[tema]
      ,[editora]
      ,[tipo_edicao]
      ,[paginas]
      ,[nacionalidade]
      ,[troca_skoob]
      ,[local]
      ,[status]
      ,[avaliacao]
      ,[emprestimo]
      ,[compra_bienal]
      ,[mes_leitura]
      ,[data_compra]
         FROM [Biblioteca].[dbo].[Livros]";

    try{
      $db = new Database(); 
     // echo $sqlQuery;
      //die();
      $result_data = array_values($db->GetMany($sqlQuery));
      $result_status = 'true';
    } catch(Exception $e){
      $result_status = 'false';
      $result_error = $e->getMessage();
    }
}

