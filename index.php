<?php $start_time = microtime(true);

include 'php/bootstrap.php';

//--- Carrega API ou Painel
if($routes->route_section == 'api' || $routes->route_section == 'php'){
    include_once $routes->server_path . $routes->directory_path . $routes->file_name;
    exit();
}

// Verifica se o cache está atualizado
$cache = new Cache();
if(!$cache->isUpdated()){
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    header("Expires: Tue, 01 Jan 1999 06:00:00 GMT");
}

//--- Geração dos arquivos em Ambiente de Desenvolvimento
if ($config->debug_mode) {
    $build = new Build();
} else {
    $traffic = new Traffic();
    $traffic->save();
}

//--- Configura o título da página
$config->PageInfo($routes->directory_path);
?>

 <!-- Carrega Página -->
<!DOCTYPE html>
<html lang="pt-br">
<?php include_once 'php/utils/components/head/pages.php'; ?>
<body>
    <?php include_once 'php/utils/components/header/index.php' ?>
    <main>
        <?php include_once $routes->server_path . $routes->directory_path . $routes->file_name;
echo '<pre>';
echo 'server_path: ' . $routes->server_path . "\n";
echo 'directory_path: ' . $routes->directory_path . "\n";
echo 'file_name: ' . $routes->file_name . "\n";
echo 'CAMINHO COMPLETO: ' . $routes->server_path . $routes->directory_path . $routes->file_name . "\n";
echo '</pre>';

        ?>
    </main>
    <?php include_once 'php/utils/components/footer/index.php'; ?>
</body>
</html>
<?php $end_time = microtime(true); ?>
<?php //log_file('Time Lapse: ' . $time_diff = $end_time - $start_time); ?>









