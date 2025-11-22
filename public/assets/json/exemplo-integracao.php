<?php
/**
 * Exemplo de Uso Integrado das Bibliotecas JSON
 * 
 * Este arquivo demonstra como usar js_map.json, build.json, 
 * menu_links.json e route_map.json de forma integrada em PHP
 */

// Simular sessão de usuário
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'admin';
$_SESSION['user_name'] = 'Alessandra';

// ============================================================================
// CLASSE AUXILIAR PARA GERENCIAR CONFIGURAÇÕES JSON
// ============================================================================

class JsonConfig {
    private static $cache = [];
    private static $basePath = __DIR__;
    
    /**
     * Carrega um arquivo JSON
     */
    public static function load($name) {
        if (!isset(self::$cache[$name])) {
            $file = self::$basePath . '/' . $name . '.json';
            
            if (!file_exists($file)) {
                throw new Exception("Arquivo não encontrado: $file");
            }
            
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Erro ao decodificar JSON: " . json_last_error_msg());
            }
            
            self::$cache[$name] = $data;
        }
        
        return self::$cache[$name];
    }
    
    /**
     * Obtém valor usando notação de ponto
     */
    public static function get($name, $path = null) {
        $data = self::load($name);
        
        if ($path === null) {
            return $data;
        }
        
        $keys = explode('.', $path);
        foreach ($keys as $key) {
            if (!isset($data[$key])) {
                return null;
            }
            $data = $data[$key];
        }
        
        return $data;
    }
}

// ============================================================================
// CLASSE DE ROTEAMENTO
// ============================================================================

class Router {
    private $routes;
    
    public function __construct() {
        $routeMap = JsonConfig::load('route_map');
        $this->routes = array_merge(
            $routeMap['routes']['public'] ?? [],
            $routeMap['routes']['protected'] ?? []
        );
    }
    
    /**
     * Encontra rota baseada na URI
     */
    public function findRoute($uri) {
        foreach ($this->routes as $route) {
            $pattern = preg_replace('/\{[a-z]+\}/', '([^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';
            
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                return [
                    'route' => $route,
                    'params' => $matches
                ];
            }
        }
        
        return null;
    }
    
    /**
     * Verifica se usuário tem permissão
     */
    public function checkPermission($route, $userRole) {
        if (!isset($route['roles'])) {
            return true;
        }
        
        return in_array($userRole, $route['roles']);
    }
}

// ============================================================================
// CLASSE PARA RENDERIZAR MENU
// ============================================================================

class MenuBuilder {
    private $menuData;
    private $userRole;
    
    public function __construct($userRole) {
        $this->menuData = JsonConfig::load('menu_links');
        $this->userRole = $userRole;
    }
    
    /**
     * Renderiza menu principal
     */
    public function renderMainMenu() {
        $items = $this->menuData['mainMenu'];
        return $this->renderMenuItems($items);
    }
    
    /**
     * Renderiza items do menu recursivamente
     */
    private function renderMenuItems($items, $level = 0) {
        $html = '<ul class="nav-menu level-' . $level . '">';
        
        foreach ($items as $item) {
            // Verificar permissão
            if (!in_array($this->userRole, $item['roles'])) {
                continue;
            }
            
            // Verificar visibilidade
            if (!$item['visible']) {
                continue;
            }
            
            $hasChildren = !empty($item['children']);
            $html .= '<li class="nav-item' . ($hasChildren ? ' has-children' : '') . '">';
            
            if ($item['route']) {
                $html .= '<a href="/' . $item['route'] . '" class="nav-link">';
            } else {
                $html .= '<span class="nav-link">';
            }
            
            // Ícone
            if ($item['icon']) {
                $html .= '<i class="' . $item['icon'] . '"></i> ';
            }
            
            // Label
            $html .= $item['label'];
            
            // Badge
            if ($item['badge']) {
                $html .= ' <span class="badge badge-' . $item['badge']['type'] . '">';
                $html .= $item['badge']['text'];
                $html .= '</span>';
            }
            
            if ($item['route']) {
                $html .= '</a>';
            } else {
                $html .= '</span>';
            }
            
            // Submenu
            if ($hasChildren) {
                $html .= $this->renderMenuItems($item['children'], $level + 1);
            }
            
            $html .= '</li>';
        }
        
        $html .= '</ul>';
        return $html;
    }
    
    /**
     * Renderiza menu do usuário
     */
    public function renderUserMenu() {
        $items = $this->menuData['userMenu'];
        $html = '<div class="user-menu">';
        
        foreach ($items as $item) {
            if (!in_array($this->userRole, $item['roles'])) {
                continue;
            }
            
            $html .= '<a href="/' . $item['route'] . '" class="user-menu-item">';
            $html .= '<i class="' . $item['icon'] . '"></i> ';
            $html .= $item['label'];
            $html .= '</a>';
            
            if (isset($item['dividerAfter']) && $item['dividerAfter']) {
                $html .= '<hr>';
            }
        }
        
        $html .= '</div>';
        return $html;
    }
}

// ============================================================================
// CLASSE PARA GERENCIAR SCRIPTS
// ============================================================================

class ScriptLoader {
    private $jsMap;
    private $loadedScripts = [];
    
    public function __construct() {
        $this->jsMap = JsonConfig::load('js_map');
    }
    
    /**
     * Carrega scripts necessários para uma rota
     */
    public function getScriptsForRoute($route) {
        $scripts = [];
        
        // Scripts globais
        foreach ($this->jsMap['libraries'] as $category => $libs) {
            foreach ($libs as $name => $config) {
                if ($config['global']) {
                    $scripts[] = [
                        'file' => $config['file'],
                        'priority' => $config['loadPriority']
                    ];
                }
            }
        }
        
        // Scripts requeridos pela rota
        if (isset($route['requiredScripts'])) {
            foreach ($route['requiredScripts'] as $scriptRef) {
                $script = $this->getScriptByReference($scriptRef);
                if ($script) {
                    $scripts[] = $script;
                    
                    // Carregar dependências
                    if (!empty($script['dependencies'])) {
                        foreach ($script['dependencies'] as $depRef) {
                            $depScript = $this->getScriptByReference($depRef);
                            if ($depScript) {
                                $scripts[] = $depScript;
                            }
                        }
                    }
                }
            }
        }
        
        // Ordenar por prioridade
        usort($scripts, function($a, $b) {
            return $a['priority'] - $b['priority'];
        });
        
        // Remover duplicatas
        $uniqueScripts = [];
        foreach ($scripts as $script) {
            if (!in_array($script['file'], $uniqueScripts)) {
                $uniqueScripts[] = $script['file'];
            }
        }
        
        return $uniqueScripts;
    }
    
    /**
     * Obtém script por referência (ex: "core.dateUtils")
     */
    private function getScriptByReference($ref) {
        list($category, $name) = explode('.', $ref);
        
        if (isset($this->jsMap['libraries'][$category][$name])) {
            $config = $this->jsMap['libraries'][$category][$name];
            return [
                'file' => $config['file'],
                'priority' => $config['loadPriority'],
                'dependencies' => $config['dependencies'] ?? []
            ];
        }
        
        return null;
    }
    
    /**
     * Renderiza tags script
     */
    public function renderScriptTags($scripts) {
        $html = '';
        foreach ($scripts as $script) {
            $html .= '<script src="/' . $script . '"></script>' . "\n";
        }
        return $html;
    }
}

// ============================================================================
// CLASSE PARA GERAR BREADCRUMB
// ============================================================================

class BreadcrumbBuilder {
    private $config;
    
    public function __construct() {
        $this->config = JsonConfig::get('menu_links', 'breadcrumbConfig');
    }
    
    /**
     * Gera breadcrumb para uma rota
     */
    public function generate($route) {
        if (!isset($route['breadcrumb'])) {
            return '';
        }
        
        $items = $route['breadcrumb'];
        $separator = $this->config['separator'];
        
        $html = '<nav aria-label="breadcrumb">';
        $html .= '<ol class="breadcrumb">';
        
        // Home
        $html .= '<li class="breadcrumb-item">';
        $html .= '<a href="/' . $this->config['home']['route'] . '">';
        $html .= '<i class="' . $this->config['home']['icon'] . '"></i> ';
        $html .= $this->config['home']['label'];
        $html .= '</a>';
        $html .= '</li>';
        
        // Items
        foreach ($items as $index => $item) {
            $isLast = ($index === count($items) - 1);
            
            $html .= '<li class="breadcrumb-item';
            if ($isLast) {
                $html .= ' active" aria-current="page';
            }
            $html .= '">';
            
            if (!$isLast) {
                $html .= '<a href="#">' . $item . '</a>';
            } else {
                $html .= $item;
            }
            
            $html .= '</li>';
        }
        
        $html .= '</ol>';
        $html .= '</nav>';
        
        return $html;
    }
}

// ============================================================================
// EXEMPLO DE USO - SIMULANDO UMA PÁGINA
// ============================================================================

// Simular URI atual
$currentUri = '/usuarios/lista';
$userRole = $_SESSION['user_role'];

// Encontrar rota
$router = new Router();
$match = $router->findRoute($currentUri);

if (!$match) {
    die("Rota não encontrada!");
}

$route = $match['route'];

// Verificar permissão
if (!$router->checkPermission($route, $userRole)) {
    die("Acesso negado!");
}

// Renderizar menu
$menuBuilder = new MenuBuilder($userRole);
$mainMenu = $menuBuilder->renderMainMenu();
$userMenu = $menuBuilder->renderUserMenu();

// Carregar scripts
$scriptLoader = new ScriptLoader();
$scripts = $scriptLoader->getScriptsForRoute($route);
$scriptTags = $scriptLoader->renderScriptTags($scripts);

// Gerar breadcrumb
$breadcrumbBuilder = new BreadcrumbBuilder();
$breadcrumb = $breadcrumbBuilder->generate($route);

// Obter configurações de ambiente
$buildConfig = JsonConfig::load('build');
$env = 'development'; // ou 'production'
$envConfig = $buildConfig['environment'][$env];

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $route['title'] ?> - Sistema</title>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    
    <style>
        body { font-family: Arial, sans-serif; }
        .sidebar { background: #2c3e50; color: white; min-height: 100vh; padding: 20px; }
        .nav-menu { list-style: none; padding: 0; }
        .nav-item { margin: 5px 0; }
        .nav-link { color: white; text-decoration: none; display: block; padding: 10px; border-radius: 5px; }
        .nav-link:hover { background: #34495e; color: white; }
        .nav-link i { margin-right: 10px; }
        .has-children > .nav-link::after { content: " ▼"; float: right; }
        .level-1 { padding-left: 20px; }
        .badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; }
        .badge-danger { background: #dc3545; color: white; }
        .badge-warning { background: #ffc107; color: black; }
        .badge-success { background: #28a745; color: white; }
        .user-menu { background: white; border: 1px solid #ddd; border-radius: 5px; padding: 10px; margin: 20px 0; }
        .user-menu-item { display: block; padding: 8px; color: #333; text-decoration: none; }
        .user-menu-item:hover { background: #f5f5f5; color: #333; }
        .content { padding: 30px; }
        .breadcrumb { background: #f5f5f5; padding: 10px 15px; border-radius: 5px; }
        .environment-badge { position: fixed; top: 10px; right: 10px; padding: 5px 10px; background: #ff9800; color: white; border-radius: 5px; z-index: 1000; }
    </style>
</head>
<body>
    <!-- Badge de Ambiente -->
    <div class="environment-badge">
        <?= strtoupper($env) ?>
        <?php if ($envConfig['debug']): ?>
        | DEBUG ON
        <?php endif; ?>
    </div>

    <div class="container-fluid">
        <div class="row">
            <!-- SIDEBAR -->
            <div class="col-md-3 sidebar">
                <h3>Sistema Web</h3>
                <p>Olá, <?= $_SESSION['user_name'] ?>!</p>
                
                <hr>
                
                <!-- Menu Principal -->
                <?= $mainMenu ?>
                
                <hr>
                
                <!-- Menu do Usuário -->
                <?= $userMenu ?>
            </div>
            
            <!-- CONTEÚDO -->
            <div class="col-md-9 content">
                <!-- Breadcrumb -->
                <?= $breadcrumb ?>
                
                <h1><?= $route['title'] ?></h1>
                <p class="text-muted"><?= $route['description'] ?></p>
                
                <hr>
                
                <!-- Informações da Rota -->
                <div class="alert alert-info">
                    <h5>Informações da Rota Atual</h5>
                    <ul>
                        <li><strong>Nome:</strong> <?= $route['name'] ?></li>
                        <li><strong>Path:</strong> <?= $route['path'] ?></li>
                        <li><strong>Controller:</strong> <?= $route['controller'] ?></li>
                        <li><strong>Action:</strong> <?= $route['action'] ?></li>
                        <li><strong>Método:</strong> <?= $route['method'] ?></li>
                    </ul>
                </div>
                
                <!-- Scripts Carregados -->
                <div class="alert alert-secondary">
                    <h5>Scripts JavaScript Carregados</h5>
                    <ul>
                        <?php foreach ($scripts as $script): ?>
                        <li><code><?= $script ?></code></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                
                <!-- Configurações de Ambiente -->
                <div class="alert alert-warning">
                    <h5>Configurações de Ambiente (<?= $env ?>)</h5>
                    <ul>
                        <li><strong>Debug:</strong> <?= $envConfig['debug'] ? 'Sim' : 'Não' ?></li>
                        <li><strong>Minify:</strong> <?= $envConfig['minify'] ? 'Sim' : 'Não' ?></li>
                        <li><strong>API URL:</strong> <?= $envConfig['apiUrl'] ?></li>
                        <li><strong>Log Level:</strong> <?= $envConfig['logLevel'] ?></li>
                    </ul>
                </div>
                
                <!-- Conteúdo da Página -->
                <div class="card">
                    <div class="card-header">
                        <i class="bi bi-people"></i> Lista de Usuários
                    </div>
                    <div class="card-body">
                        <p>Este é o conteúdo da página. Aqui seria renderizado o módulo de usuários.</p>
                        <p>Os scripts necessários já foram carregados automaticamente baseado na configuração da rota.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Scripts carregados automaticamente baseado na rota -->
    <?= $scriptTags ?>
    
    <script>
        // Configurações vindas do PHP
        const APP_CONFIG = {
            environment: '<?= $env ?>',
            debug: <?= $envConfig['debug'] ? 'true' : 'false' ?>,
            apiUrl: '<?= $envConfig['apiUrl'] ?>',
            currentRoute: '<?= $route['name'] ?>'
        };
        
        console.log('Configurações da aplicação:', APP_CONFIG);
        
        // Testar bibliotecas carregadas
        if (typeof DateUtils !== 'undefined') {
            console.log('DateUtils carregado!', DateUtils.formatToBR(new Date()));
        }
        
        if (typeof FilterUtils !== 'undefined') {
            console.log('FilterUtils carregado!');
        }
    </script>
</body>
</html>
