<?php

include 'php/utils/function/index.php';
include 'php/utils/class/application/autoload.php';

//--- Traz as configurações padrões de sistema
$config = Config::getInstance();

//--- Define as rotas de acesso
$routes = new Routes();
if($routes->error_route){
    _log_file('Entrou em error route');
    exit();
}

//--- Verifica se não foi encontrada uma rota
if (!isset($routes->file_name) || $routes->file_name == '') {
    echo "Path error";
    exit();
}
//-- Verifica se não foi encontrada uma rota
if (!isset($routes->file_name) || $routes->file_name == '') {
    echo "Path error";
    exit();
}