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
       
        break;
    case 'PUT':
       
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
    $tema    = $db->GetMany("SELECT DISTINCT tema        FROM [Biblioteca].[dbo].[Livros] WHERE tema          IS NOT NULL AND tema          <> '' ORDER BY tema");
    $tipo    = $db->GetMany("SELECT DISTINCT tipo_edicao FROM [Biblioteca].[dbo].[Livros] WHERE tipo_edicao   IS NOT NULL AND tipo_edicao   <> '' ORDER BY tipo_edicao");
    $natureza= $db->GetMany("SELECT DISTINCT natureza   FROM [Biblioteca].[dbo].[Livros] WHERE natureza      IS NOT NULL AND natureza      <> '' ORDER BY natureza");
    $genero  = $db->GetMany("SELECT DISTINCT genero     FROM [Biblioteca].[dbo].[Livros] WHERE genero        IS NOT NULL AND genero        <> '' ORDER BY genero");
    $editora = $db->GetMany("SELECT DISTINCT editora    FROM [Biblioteca].[dbo].[Livros] WHERE editora       IS NOT NULL AND editora       <> '' ORDER BY editora");
    $raca    = $db->GetMany("SELECT DISTINCT [raça]     FROM [Biblioteca].[dbo].[Livros] WHERE [raça]        IS NOT NULL AND [raça]        <> '' ORDER BY [raça]");
    $pais    = $db->GetMany("SELECT DISTINCT nacionalidade FROM [Biblioteca].[dbo].[Livros] WHERE nacionalidade IS NOT NULL AND nacionalidade <> '' ORDER BY nacionalidade");

        $result_data = [
            "tema"          => array_values(array_filter(array_column($tema,    "tema"))),
            "tipo_edicao"   => array_values(array_filter(array_column($tipo,    "tipo_edicao"))),
            "natureza"      => array_values(array_filter(array_column($natureza,"natureza"))),
            "genero"        => array_values(array_filter(array_column($genero,  "genero"))),
            "editora"       => array_values(array_filter(array_column($editora, "editora"))),
            "raca"          => array_values(array_filter(array_column($raca,    "raça"))),
            "nacionalidade" => array_values(array_filter(array_column($pais,    "nacionalidade"))),
        ];

        $result_status = true;
    } catch(Exception $e){
      $result_status = false;
      $result_error = $e->getMessage();
    }






}