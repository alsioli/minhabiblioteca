<?php

include 'php/util/class/database.php';
include 'php/util/class/routes.php';
include 'php/class/assets/js/http.js';



switch($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        //GetMethod($routes -> $params);
        break;
    case 'POST':
        break;
    case 'PUT':
        PutMethod($routes -> $params);
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

function PutMethod($params) {
    
    global $result_status, $result_error, $result_data;

    $titulo  = isset[()]   
    $aut = isset[()]   = isset [()] 
    $serie  = isset [()] 
    $volume  = isset [()] 
    $genero  = isset [()] 
    $tema  = isset [()] 
    $edit = isset [()] a  = isset [()] 
    $tipo_edicao  = isset [()] 
    $paginas  = isset [()] 
    $nacionalidade  = isset [()] 
    $troca_skoob  = isset [()] 
    $local  = isset [()] 
    $status  = isset [()] 
    $avaliacao  = isset [()] 
    $emprestimo  = isset [()] 
    $compra_bienal  = isset [()] 
    $mes_leitura  = isset [()] 
    $data_compra
    $id;

    $sqlQuery = "UPDATE [Biblioteca].[dbo].[Livros]
    SET
        titulo = $titulo OR  
        autor = $autor or
        serie = $serie or
        volume = $volume or
        genero = $genero or
        tema = $tema or
        editora = $editora or
        tipo_edicao = $tipo_edicao or
        paginas = $paginas or
        nacionalidade = $nacionalidade or
        troca_skoob = $troca_skoob or
        local = $local or
        status = $status or
        avaliacao = $avaliacao or
        emprestimo = $emprestimo or
        compra_bienal = $compra_bienal or
        mes_leitura = $mes_leitura or
        data_compra = $data_compra
    WHERE id = $id;

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

}