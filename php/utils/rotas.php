<?php

include 'php/utils/functions/index.php';
include 'php/utils/class/application/Routes.php';

// Traz as configurações padrões de sistema
//$config = Config::getInstance();

// Define as rotas de acessos
$routes = new Routes();
if($routes->error_route){
    log_file('Entrou em error route');
    exit();
}

// Verifica se não foi encontrada uma rota
if (!isset($routes->file_name) || $routes->file_name == '') {
    echo "Path error";
    exit();
}

function log_file(string $content, string $file = 'debug')
{
    if (!$content) {
        return;
    }
    $now = new DateTime();
    error_log('[' . $now->format('Y-m-d H:i:s') . ']: ' . $content . "\n", 3, __DIR__ . '/../../logs/' . $file . '.log');
        
}


