# Documentação - Bibliotecas JSON de Configuração

## Índice
1. [Visão Geral](#visão-geral)
2. [js_map.json](#js_mapjson)
3. [build.json](#buildjson)
4. [menu_links.json](#menu_linksjson)
5. [route_map.json](#route_mapjson)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Integração com PHP](#integração-com-php)

---

## Visão Geral

Estes arquivos JSON servem como **configurações centralizadas** do sistema, permitindo que você gerencie aspectos importantes da aplicação sem modificar código. Eles funcionam como "fontes únicas de verdade" para diferentes aspectos do sistema.

### Benefícios:
- ✅ **Manutenção facilitada**: Altere configurações em um único lugar
- ✅ **Reutilização**: Use em PHP, JavaScript e outros contextos
- ✅ **Documentação viva**: Os arquivos servem como documentação da estrutura
- ✅ **Versionamento**: Rastreie mudanças de configuração no Git
- ✅ **Validação**: Estrutura JSON permite validação automática

---

## js_map.json

### Propósito
Mapeia todos os arquivos JavaScript do sistema, suas dependências, prioridades de carregamento e agrupamentos (bundles).

### Estrutura Principal

#### 1. **libraries** - Organização dos Scripts
```json
{
  "libraries": {
    "core": {       // Scripts fundamentais do sistema
      "dateUtils": { ... }
    },
    "modules": {    // Scripts específicos de módulos
      "usuarios": { ... }
    },
    "vendors": {    // Bibliotecas de terceiros
      "jquery": { ... }
    }
  }
}
```

#### 2. **Propriedades de cada Script**
```json
{
  "file": "assets/js/dateUtils.js",           // Caminho do arquivo
  "description": "Utilitários de data",       // Descrição
  "dependencies": ["otherScript"],            // Dependências
  "loadPriority": 1,                          // Prioridade (0-10)
  "global": true,                             // Carregar em todas as páginas
  "requiredFor": ["usuarios/lista"],          // Páginas que precisam
  "version": "1.0.0"                          // Versão
}
```

#### 3. **bundles** - Agrupamento de Scripts
```json
{
  "bundles": {
    "common": {
      "description": "Bundle comum",
      "files": ["vendors.jquery", "core.dateUtils"],
      "minify": true,
      "output": "assets/dist/common.bundle.js"
    }
  }
}
```

### Quando Usar
- Adicionar novo script JavaScript ao sistema
- Definir dependências entre scripts
- Criar bundles otimizados para produção
- Controlar ordem de carregamento de scripts
- Configurar CDNs para bibliotecas externas

### Exemplo de Uso em PHP
```php
<?php
// Carregar mapa de JavaScript
$jsMap = json_decode(file_get_contents('js_map.json'), true);

// Obter scripts necessários para uma página
function getScriptsForPage($page, $jsMap) {
    $scripts = [];
    
    foreach ($jsMap['libraries'] as $category => $libs) {
        foreach ($libs as $name => $config) {
            // Scripts globais
            if ($config['global']) {
                $scripts[] = $config['file'];
            }
            
            // Scripts específicos da página
            if (isset($config['requiredFor']) && 
                in_array($page, $config['requiredFor'])) {
                $scripts[] = $config['file'];
            }
        }
    }
    
    return $scripts;
}

// Uso
$scripts = getScriptsForPage('usuarios/lista', $jsMap);
foreach ($scripts as $script) {
    echo "<script src='$script'></script>\n";
}
?>
```

---

## build.json

### Propósito
Centraliza todas as configurações de build, compilação e deploy do projeto. Define como os assets são processados, otimizados e preparados para diferentes ambientes.

### Estrutura Principal

#### 1. **environment** - Configurações por Ambiente
```json
{
  "environment": {
    "development": {
      "debug": true,              // Modo debug
      "minify": false,            // Não minificar
      "apiUrl": "http://localhost/api"
    },
    "production": {
      "debug": false,
      "minify": true,             // Minificar tudo
      "apiUrl": "https://exemplo.com/api"
    }
  }
}
```

#### 2. **paths** - Estrutura de Diretórios
```json
{
  "paths": {
    "source": {
      "js": "src/js",
      "css": "src/css"
    },
    "output": {
      "js": "assets/dist/js",
      "css": "assets/dist/css"
    }
  }
}
```

#### 3. **build.tasks** - Tarefas de Build
```json
{
  "build": {
    "tasks": [
      {
        "name": "compileJS",
        "description": "Compila JavaScript",
        "enabled": true,
        "source": "src/js/**/*.js",
        "destination": "assets/dist/js",
        "options": {
          "minify": true,
          "transpile": true
        }
      }
    ]
  }
}
```

#### 4. **optimization** - Otimizações
```json
{
  "optimization": {
    "js": {
      "minify": {
        "compress": { "dead_code": true },
        "mangle": true
      }
    },
    "images": {
      "jpeg": { "quality": 85 }
    }
  }
}
```

### Quando Usar
- Configurar processo de build do projeto
- Definir otimizações de assets
- Configurar diferentes ambientes (dev, staging, produção)
- Automatizar tarefas de deploy
- Configurar cache e versionamento de assets

### Exemplo de Uso em PHP
```php
<?php
// Carregar configurações de build
$build = json_decode(file_get_contents('build.json'), true);

// Obter ambiente atual
$env = $_ENV['APP_ENV'] ?? 'development';
$config = $build['environment'][$env];

// Usar URL da API baseado no ambiente
define('API_URL', $config['apiUrl']);

// Verificar se deve minificar
$shouldMinify = $config['minify'];

// Obter caminho de assets
$jsPath = $build['paths']['output']['js'];

echo "API URL: " . API_URL . "\n";
echo "JS Path: " . $jsPath . "\n";
?>
```

---

## menu_links.json

### Propósito
Define toda a estrutura de navegação do sistema, incluindo menus principais, submenus, permissões por perfil e ações rápidas.

### Estrutura Principal

#### 1. **mainMenu** - Menu Principal
```json
{
  "mainMenu": [
    {
      "id": "dashboard",              // ID único
      "label": "Dashboard",           // Texto exibido
      "icon": "bi bi-speedometer2",   // Ícone (Bootstrap Icons)
      "route": "dashboard",           // Rota (do route_map.json)
      "order": 1,                     // Ordem de exibição
      "visible": true,                // Visível ou não
      "roles": ["admin", "user"],     // Perfis com acesso
      "badge": null,                  // Badge opcional
      "children": []                  // Submenus
    }
  ]
}
```

#### 2. **Submenus (children)**
```json
{
  "id": "cadastros",
  "label": "Cadastros",
  "children": [
    {
      "id": "usuarios",
      "label": "Usuários",
      "route": "usuarios/lista",
      "roles": ["admin"]
    }
  ]
}
```

#### 3. **Badges** - Notificações
```json
{
  "badge": {
    "text": "5",              // Texto do badge
    "type": "danger"         // Cor: success, warning, danger, info
  }
}
```

#### 4. **userMenu** - Menu do Usuário
```json
{
  "userMenu": [
    {
      "id": "perfil",
      "label": "Meu Perfil",
      "route": "perfil",
      "dividerAfter": false    // Linha separadora depois
    }
  ]
}
```

#### 5. **quickActions** - Ações Rápidas
```json
{
  "quickActions": [
    {
      "id": "nova-venda-rapida",
      "label": "Nova Venda",
      "icon": "bi bi-plus-circle-fill",
      "route": "vendas/nova",
      "color": "primary"
    }
  ]
}
```

### Quando Usar
- Adicionar nova página ao menu
- Alterar permissões de acesso
- Reorganizar estrutura de navegação
- Adicionar badges de notificação
- Configurar ações rápidas

### Exemplo de Uso em PHP
```php
<?php
// Carregar menu
$menuData = json_decode(file_get_contents('menu_links.json'), true);

// Função para renderizar menu baseado no perfil do usuário
function renderMenu($menuItems, $userRole) {
    $html = '<ul class="nav">';
    
    foreach ($menuItems as $item) {
        // Verificar permissão
        if (!in_array($userRole, $item['roles'])) {
            continue;
        }
        
        // Verificar visibilidade
        if (!$item['visible']) {
            continue;
        }
        
        $html .= '<li class="nav-item">';
        $html .= '<a href="' . $item['route'] . '" class="nav-link">';
        $html .= '<i class="' . $item['icon'] . '"></i> ';
        $html .= $item['label'];
        
        // Badge
        if ($item['badge']) {
            $html .= ' <span class="badge bg-' . $item['badge']['type'] . '">';
            $html .= $item['badge']['text'];
            $html .= '</span>';
        }
        
        $html .= '</a>';
        
        // Submenu
        if (!empty($item['children'])) {
            $html .= renderMenu($item['children'], $userRole);
        }
        
        $html .= '</li>';
    }
    
    $html .= '</ul>';
    return $html;
}

// Uso
$userRole = $_SESSION['user_role'] ?? 'user';
echo renderMenu($menuData['mainMenu'], $userRole);
?>
```

---

## route_map.json

### Propósito
Mapeia todas as rotas (URLs) do sistema, definindo controllers, ações, métodos HTTP, middlewares e permissões. É o "mapa de navegação" completo da aplicação.

### Estrutura Principal

#### 1. **routes.public** - Rotas Públicas
```json
{
  "routes": {
    "public": [
      {
        "name": "login",                    // Nome da rota
        "path": "/login",                   // URL
        "controller": "AuthController",     // Controller PHP
        "action": "login",                  // Método do controller
        "method": ["GET", "POST"],          // Métodos HTTP permitidos
        "middleware": ["guest"],            // Middlewares
        "title": "Login",                   // Título da página
        "description": "Página de login"    // Descrição
      }
    ]
  }
}
```

#### 2. **routes.protected** - Rotas Protegidas (Requer Login)
```json
{
  "routes": {
    "protected": [
      {
        "name": "usuarios.lista",
        "path": "/usuarios/lista",
        "controller": "UsuariosController",
        "action": "listar",
        "method": "GET",
        "middleware": ["auth", "role:admin"],
        "roles": ["admin"],                      // Perfis permitidos
        "breadcrumb": ["Dashboard", "Usuários"], // Breadcrumb
        "requiredScripts": ["modules.usuarios"]  // Scripts necessários
      }
    ]
  }
}
```

#### 3. **routes.api** - Rotas de API (REST)
```json
{
  "routes": {
    "api": [
      {
        "name": "api.usuarios.listar",
        "path": "/api/usuarios",
        "controller": "Api\\UsuariosController",
        "action": "index",
        "method": "GET",
        "middleware": ["api", "auth:api"],
        "rateLimit": {                    // Limite de requisições
          "maxAttempts": 60,
          "decayMinutes": 1
        },
        "cache": {                        // Cache de resposta
          "enabled": true,
          "ttl": 300
        }
      }
    ]
  }
}
```

#### 4. **Parâmetros Dinâmicos na URL**
```json
{
  "path": "/usuarios/editar/{id}",    // {id} é um parâmetro
  "patterns": {
    "id": "[0-9]+"                    // Pattern de validação
  }
}
```

#### 5. **errorPages** - Páginas de Erro
```json
{
  "errorPages": {
    "404": {
      "controller": "ErrorController",
      "action": "notFound",
      "view": "errors/404",
      "title": "Página não encontrada"
    }
  }
}
```

#### 6. **redirects** - Redirecionamentos
```json
{
  "redirects": {
    "/home": "/dashboard",        // Redireciona /home para /dashboard
    "/admin": "/dashboard"
  }
}
```

### Quando Usar
- Adicionar nova página/funcionalidade
- Definir permissões de acesso
- Configurar APIs RESTful
- Criar redirecionamentos
- Definir rate limiting para APIs
- Configurar breadcrumbs

### Exemplo de Uso em PHP
```php
<?php
// Sistema de Roteamento Simples baseado em route_map.json

class Router {
    private $routes;
    
    public function __construct($routeMapFile) {
        $data = json_decode(file_get_contents($routeMapFile), true);
        $this->routes = array_merge(
            $data['routes']['public'],
            $data['routes']['protected'],
            $data['routes']['api']
        );
    }
    
    public function match($uri, $method = 'GET') {
        foreach ($this->routes as $route) {
            // Verificar método HTTP
            $methods = is_array($route['method']) ? 
                       $route['method'] : [$route['method']];
            
            if (!in_array($method, $methods)) {
                continue;
            }
            
            // Converter rota para regex
            $pattern = preg_replace('/\{([a-z]+)\}/', '([^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';
            
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Remove primeira correspondência
                return [
                    'route' => $route,
                    'params' => $matches
                ];
            }
        }
        
        return null;
    }
    
    public function dispatch($uri, $method = 'GET') {
        $match = $this->match($uri, $method);
        
        if (!$match) {
            // Rota não encontrada - 404
            http_response_code(404);
            include 'views/errors/404.php';
            return;
        }
        
        $route = $match['route'];
        $params = $match['params'];
        
        // Verificar middleware de autenticação
        if (in_array('auth', $route['middleware'])) {
            if (!isset($_SESSION['user_id'])) {
                header('Location: /login');
                exit;
            }
        }
        
        // Verificar role
        if (isset($route['roles'])) {
            $userRole = $_SESSION['user_role'] ?? null;
            if (!in_array($userRole, $route['roles'])) {
                http_response_code(403);
                include 'views/errors/403.php';
                return;
            }
        }
        
        // Instanciar controller e executar action
        $controllerName = $route['controller'];
        $action = $route['action'];
        
        $controller = new $controllerName();
        call_user_func_array([$controller, $action], $params);
    }
}

// Uso
$router = new Router('route_map.json');

// Obter URI atual
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Despachar rota
$router->dispatch($uri, $method);
?>
```

---

## Exemplos de Uso

### Exemplo 1: Renderizar Menu com Permissões
```php
<?php
function buildMenu($menuFile, $routeFile, $userRole) {
    $menu = json_decode(file_get_contents($menuFile), true);
    $routes = json_decode(file_get_contents($routeFile), true);
    
    $html = '<nav class="sidebar">';
    
    foreach ($menu['mainMenu'] as $item) {
        // Verificar permissão
        if (!in_array($userRole, $item['roles'])) continue;
        
        $html .= '<div class="menu-item">';
        $html .= '<i class="' . $item['icon'] . '"></i>';
        $html .= '<span>' . $item['label'] . '</span>';
        
        if ($item['badge']) {
            $html .= '<span class="badge-' . $item['badge']['type'] . '">';
            $html .= $item['badge']['text'];
            $html .= '</span>';
        }
        
        // Submenu
        if (!empty($item['children'])) {
            $html .= '<ul class="submenu">';
            foreach ($item['children'] as $child) {
                if (in_array($userRole, $child['roles'])) {
                    $html .= '<li><a href="/' . $child['route'] . '">';
                    $html .= $child['label'] . '</a></li>';
                }
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
    }
    
    $html .= '</nav>';
    return $html;
}

echo buildMenu('menu_links.json', 'route_map.json', $_SESSION['role']);
?>
```

### Exemplo 2: Carregar Scripts Baseado na Rota
```php
<?php
function loadScriptsForRoute($currentRoute, $jsMapFile, $routeMapFile) {
    $jsMap = json_decode(file_get_contents($jsMapFile), true);
    $routeMap = json_decode(file_get_contents($routeMapFile), true);
    
    $scripts = [];
    
    // Encontrar rota atual
    $route = null;
    foreach ($routeMap['routes']['protected'] as $r) {
        if ($r['name'] === $currentRoute) {
            $route = $r;
            break;
        }
    }
    
    if (!$route) return [];
    
    // Scripts globais
    foreach ($jsMap['libraries']['core'] as $name => $script) {
        if ($script['global']) {
            $scripts[] = $script['file'];
        }
    }
    
    // Scripts requeridos pela rota
    if (isset($route['requiredScripts'])) {
        foreach ($route['requiredScripts'] as $scriptRef) {
            list($category, $name) = explode('.', $scriptRef);
            if (isset($jsMap['libraries'][$category][$name])) {
                $scripts[] = $jsMap['libraries'][$category][$name]['file'];
            }
        }
    }
    
    return $scripts;
}

// Uso
$scripts = loadScriptsForRoute('usuarios.lista', 'js_map.json', 'route_map.json');
foreach ($scripts as $script) {
    echo "<script src='/$script'></script>\n";
}
?>
```

### Exemplo 3: Breadcrumb Automático
```php
<?php
function generateBreadcrumb($currentRoute, $routeMapFile) {
    $routeMap = json_decode(file_get_contents($routeMapFile), true);
    
    // Encontrar rota
    $route = null;
    foreach ($routeMap['routes']['protected'] as $r) {
        if ($r['name'] === $currentRoute) {
            $route = $r;
            break;
        }
    }
    
    if (!$route || !isset($route['breadcrumb'])) {
        return '';
    }
    
    $html = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
    
    foreach ($route['breadcrumb'] as $index => $crumb) {
        $isLast = ($index === count($route['breadcrumb']) - 1);
        
        $html .= '<li class="breadcrumb-item';
        if ($isLast) $html .= ' active';
        $html .= '">';
        
        if (!$isLast) {
            $html .= '<a href="#">' . $crumb . '</a>';
        } else {
            $html .= $crumb;
        }
        
        $html .= '</li>';
    }
    
    $html .= '</ol></nav>';
    return $html;
}

echo generateBreadcrumb('usuarios.lista', 'route_map.json');
?>
```

---

## Integração com PHP

### Classe Helper para Gerenciar Configs
```php
<?php
class ConfigManager {
    private static $configs = [];
    
    public static function load($name, $file) {
        if (!isset(self::$configs[$name])) {
            $path = __DIR__ . '/config/' . $file;
            self::$configs[$name] = json_decode(
                file_get_contents($path), 
                true
            );
        }
        return self::$configs[$name];
    }
    
    public static function get($name, $key = null) {
        $config = self::$configs[$name] ?? null;
        
        if ($key === null) {
            return $config;
        }
        
        // Suporta notação de ponto: "routes.public"
        $keys = explode('.', $key);
        foreach ($keys as $k) {
            $config = $config[$k] ?? null;
            if ($config === null) break;
        }
        
        return $config;
    }
}

// Carregar configurações
ConfigManager::load('routes', 'route_map.json');
ConfigManager::load('menu', 'menu_links.json');
ConfigManager::load('js', 'js_map.json');
ConfigManager::load('build', 'build.json');

// Usar
$publicRoutes = ConfigManager::get('routes', 'routes.public');
$mainMenu = ConfigManager::get('menu', 'mainMenu');
$environment = ConfigManager::get('build', 'environment.production');
?>
```

---

## Melhores Práticas

1. **Versionamento**: Sempre inclua `version` nos arquivos JSON
2. **Validação**: Valide JSONs antes de fazer deploy
3. **Cache**: Cache as configurações em produção
4. **Documentação**: Comente mudanças importantes
5. **Backup**: Mantenha backups antes de mudanças grandes
6. **Ambiente**: Use diferentes configs para dev/staging/prod

---

## Validação de JSON

Sempre valide seus arquivos JSON:

```php
<?php
function validateJson($file) {
    $json = file_get_contents($file);
    json_decode($json);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("Erro no JSON $file: " . json_last_error_msg());
    }
    
    echo "✓ $file é válido\n";
}

validateJson('js_map.json');
validateJson('build.json');
validateJson('menu_links.json');
validateJson('route_map.json');
?>
```
