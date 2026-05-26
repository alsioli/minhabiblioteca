<?php

include_once __DIR__ . "/../../../../utils/function/database.php";

$result_status = false;
$result_error = null;
$result_data = null;

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        GetMethod();
        break;
    case 'POST':
        http_response_code(501);
        $result_error = 'POST is not implemented';
        break;
    case 'PUT':
        http_response_code(501);
        $result_error = 'PUT is not implemented';
        break;
    case 'DELETE':
        http_response_code(501);
        $result_error = 'DELETE is not implemented';
        break;
    default:
        http_response_code(405);
        $result_error = 'Method Not Allowed';
        break;
}

$response = array(
    'status' => $result_status,
    'error' => $result_error,
    'data' => $result_data,
);

header('Content-Type: application/json');
echo json_encode($response);

function GetMethod() {
    
    global $result_status, $result_error, $result_data;

    $sqlQuery_tema = "SELECT DISTINCT tema
        FROM [Biblioteca].[dbo].[Livros]";

    $sqlQuery_tipo_edicao = "SELECT DISTINCT tipo_edicao
        FROM [Biblioteca].[dbo].[Livros]";
    
    $sqlQuery_natureza = "SELECT DISTINCT natureza
         FROM [Biblioteca].[dbo].[Livros]"; 

 try{
    $db = new DataBase();
    $tema = $db->GetMany("SELECT DISTINCT tema FROM [Biblioteca].[dbo].[Livros]");
    $tipo = $db->GetMany("SELECT DISTINCT tipo_edicao FROM [Biblioteca].[dbo].[Livros]");
    $natureza = $db->GetMany("SELECT DISTINCT natureza FROM [Biblioteca].[dbo].[Livros]");

        $result_data = [
            "tema" => array_column($tema, "tema"),
            "tipo_edicao" => array_column($tipo, "tipo_edicao"),
            "natureza" => array_column($natureza, "natureza")
        ];

        $result_status = true;
    } catch(Exception $e){
      $result_status = 'false';
      $result_error = $e->getMessage();
    }






}