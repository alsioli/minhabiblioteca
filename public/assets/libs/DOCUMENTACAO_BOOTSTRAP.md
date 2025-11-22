# Documentação - Bibliotecas Bootstrap Wrapper

## Índice
1. [Visão Geral](#visão-geral)
2. [Bootstrap 5.3.8](#bootstrap-538)
3. [Bootstrap 4.6.2](#bootstrap-462)
4. [Comparação entre Versões](#comparação-entre-versões)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Migração BS4 → BS5](#migração-bs4--bs5)

---

## Visão Geral

Estas bibliotecas são **wrappers** (invólucros) que facilitam o uso dos componentes Bootstrap através de funções JavaScript, tornando o código mais limpo e reutilizável.

### Vantagens:
- ✅ **Sintaxe simplificada**: Crie componentes com menos código
- ✅ **Programático**: Crie componentes via JavaScript sem HTML
- ✅ **Reutilizável**: Use as mesmas funções em todo projeto
- ✅ **Documentado**: Todas funções têm exemplos
- ✅ **Compatível**: Funciona com Bootstrap original

---

## Bootstrap 5.3.8

### Instalação

```html
<!-- CSS do Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons (opcional) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

<!-- JavaScript do Bootstrap 5 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

<!-- Nossa biblioteca wrapper -->
<script src="bootstrap5.js"></script>
```

### Componentes Disponíveis

#### 1. Alerts (Alertas)

```javascript
// Alert simples
const alert = BS5.Alert.create('Mensagem importante!', 'primary');
document.body.appendChild(alert);

// Alert dismissível
BS5.Alert.create('Pode ser fechado', 'info', {
    dismissible: true,
    container: '#alerts-container'
});

// Alert com auto-dismiss
BS5.Alert.success('Salvo com sucesso!', {
    dismissible: true,
    autoDismiss: 3000,  // 3 segundos
    container: '#messages'
});

// Tipos de alertas
BS5.Alert.success('Operação bem-sucedida!', { dismissible: true });
BS5.Alert.error('Erro ao processar!', { dismissible: true });
BS5.Alert.warning('Atenção com isso!', { dismissible: true });
BS5.Alert.info('Informação útil', { dismissible: true });
```

#### 2. Badges (Crachás)

```javascript
// Badge simples
const badge = BS5.Badge.create('Novo', 'primary');

// Badge pill (arredondado)
const pillBadge = BS5.Badge.create('5', 'danger', { pill: true });

// Usar em HTML
document.querySelector('h1').appendChild(badge);
```

#### 3. Buttons (Botões)

```javascript
// Botão básico
const btn = BS5.Button.create('Clique aqui', 'primary', {
    onClick: () => alert('Clicou!')
});

// Botão com ícone
const btnIcon = BS5.Button.create('Salvar', 'success', {
    icon: 'bi bi-save',
    size: 'lg'  // sm, lg
});

// Botão outline
const btnOutline = BS5.Button.create('Cancelar', 'secondary', {
    outline: true
});

// Grupo de botões
const group = BS5.Button.group([
    BS5.Button.create('Esquerda', 'primary'),
    BS5.Button.create('Centro', 'primary'),
    BS5.Button.create('Direita', 'primary')
]);

// Botão desabilitado
const btnDisabled = BS5.Button.create('Desabilitado', 'primary', {
    disabled: true
});
```

#### 4. Cards (Cartões)

```javascript
// Card completo
const card = BS5.Card.create({
    header: 'Cabeçalho do Card',
    title: 'Título Principal',
    subtitle: 'Subtítulo',
    text: 'Conteúdo do card aqui...',
    footer: 'Rodapé do card',
    image: 'imagem.jpg',
    imageAlt: 'Descrição da imagem'
});

// Card simples
const simpleCard = BS5.Card.create({
    title: 'Produto',
    text: 'Descrição do produto',
    content: `
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    `
});

document.querySelector('#cards').appendChild(card);
```

#### 5. Modal (Janelas modais)

```javascript
// Modal básico
const modal = BS5.Modal.create({
    title: 'Confirmar Ação',
    body: '<p>Deseja realmente continuar?</p>',
    footer: `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary">Confirmar</button>
    `,
    size: 'lg',  // sm, lg, xl
    centered: true
});

modal.show();

// Modal sem backdrop
const staticModal = BS5.Modal.create({
    title: 'Modal Estático',
    body: 'Só fecha pelo botão',
    backdrop: false,
    keyboard: false
});

// Modal scrollable
const scrollModal = BS5.Modal.create({
    title: 'Conteúdo Longo',
    body: 'Muito texto...',
    scrollable: true
});
```

#### 6. Toast (Notificações)

```javascript
// Toast básico
BS5.Toast.create('Notificação importante!', {
    title: 'Sistema',
    delay: 5000
});

// Toast de sucesso
BS5.Toast.success('Dados salvos com sucesso!');

// Toast de erro
BS5.Toast.error('Falha ao conectar com servidor');

// Toast de aviso
BS5.Toast.warning('Sessão expirando em 5 minutos');

// Toast de informação
BS5.Toast.info('Nova mensagem recebida');

// Toast sem auto-hide
BS5.Toast.create('Mensagem permanente', {
    autohide: false
});
```

#### 7. Dropdown (Menu suspenso)

```javascript
const dropdown = BS5.Dropdown.create('Opções', [
    { text: 'Editar', icon: 'bi bi-pencil', onClick: () => editar() },
    { text: 'Duplicar', icon: 'bi bi-files' },
    { divider: true },
    { header: 'Ações perigosas' },
    { text: 'Excluir', icon: 'bi bi-trash', onClick: () => excluir() }
], {
    buttonType: 'primary',
    buttonSize: 'sm'
});

document.body.appendChild(dropdown);
```

#### 8. Progress (Barra de progresso)

```javascript
// Progress básica
const progress = BS5.Progress.create(75, {
    color: 'success',
    label: true,
    striped: true,
    animated: true
});

document.querySelector('#container').appendChild(progress.element);

// Atualizar valor
progress.setValue(90);

// Upload com progresso
let currentProgress = 0;
const uploadProgress = BS5.Progress.create(0, {
    color: 'info',
    label: true,
    animated: true
});

const interval = setInterval(() => {
    currentProgress += 10;
    uploadProgress.setValue(currentProgress);
    
    if (currentProgress >= 100) {
        clearInterval(interval);
        BS5.Toast.success('Upload concluído!');
    }
}, 500);
```

#### 9. Pagination (Paginação)

```javascript
const pagination = BS5.Pagination.create(1, 10, {
    maxVisible: 5,
    size: 'lg',  // sm, lg
    align: 'center',  // center, end
    onChange: (page) => {
        console.log('Mudou para página:', page);
        carregarDados(page);
    }
});

document.querySelector('#pagination').appendChild(pagination);
```

#### 10. Spinner (Loading)

```javascript
// Spinner simples
const spinner = BS5.Spinner.create('border', {
    color: 'primary',
    size: 'sm'
});

// Botão com spinner
const loadingBtn = BS5.Spinner.button('Carregando...', 'primary');

// Mostrar spinner durante operação
const container = document.querySelector('#content');
container.innerHTML = '';
container.appendChild(BS5.Spinner.create('border'));

// Fazer operação assíncrona
await fazerAlgo();

// Remover spinner
container.innerHTML = 'Conteúdo carregado!';
```

#### 11. Tooltip

```javascript
// Inicializar todos tooltips
BS5.Tooltip.init();

// Criar tooltip programaticamente
const tooltip = BS5.Tooltip.create('#meu-botao', 'Texto da dica', {
    placement: 'top',  // top, bottom, left, right
    trigger: 'hover'   // hover, click, focus
});
```

#### 12. Popover

```javascript
// Inicializar todos popovers
BS5.Popover.init();

// Criar popover
const popover = BS5.Popover.create('#botao', {
    title: 'Título do Popover',
    content: 'Conteúdo detalhado aqui...',
    placement: 'right',
    html: true
});
```

#### 13. Offcanvas (Menu lateral)

```javascript
const offcanvas = BS5.Offcanvas.create({
    title: 'Menu Lateral',
    body: `
        <ul class="list-group">
            <li class="list-group-item">Item 1</li>
            <li class="list-group-item">Item 2</li>
            <li class="list-group-item">Item 3</li>
        </ul>
    `,
    placement: 'start'  // start, end, top, bottom
});

// Abrir
offcanvas.show();

// Fechar
offcanvas.hide();
```

#### 14. Collapse (Recolhível)

```javascript
const collapse = BS5.Collapse.create('meu-collapse', {
    toggle: false
});

// Controlar
document.querySelector('#btn-show').onclick = () => collapse.show();
document.querySelector('#btn-hide').onclick = () => collapse.hide();
document.querySelector('#btn-toggle').onclick = () => collapse.toggle();
```

---

## Bootstrap 4.6.2

### Instalação

```html
<!-- CSS do Bootstrap 4 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">

<!-- Font Awesome (opcional) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

<!-- jQuery (OBRIGATÓRIO para BS4) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- JavaScript do Bootstrap 4 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>

<!-- Nossa biblioteca wrapper -->
<script src="bootstrap4.js"></script>
```

**IMPORTANTE**: Bootstrap 4 requer jQuery!

### Uso Similar ao BS5

A API é praticamente idêntica, apenas troque `BS5` por `BS4`:

```javascript
// Bootstrap 5
BS5.Alert.success('Mensagem', { dismissible: true });

// Bootstrap 4
BS4.Alert.success('Mensagem', { dismissible: true });
```

### Diferenças Principais

#### Toast (BS4 não tem toast nativo)

```javascript
// BS4 usa alerts estilizados como toast
BS4.Toast.success('Mensagem de sucesso!');
BS4.Toast.error('Mensagem de erro!');

// Funciona igual, mas usa alerts por baixo dos panos
```

#### Classes CSS Diferentes

```javascript
// BS5 usa 'me-2' (margin-end)
BS5.Alert.create('Texto', 'primary', { icon: 'bi bi-check me-2' });

// BS4 usa 'mr-2' (margin-right)
BS4.Alert.create('Texto', 'primary', { icon: 'fa fa-check mr-2' });
```

---

## Comparação entre Versões

| Recurso | Bootstrap 4 | Bootstrap 5 |
|---------|------------|-------------|
| jQuery | ✅ Obrigatório | ❌ Não usa |
| Toast | ❌ Não nativo | ✅ Nativo |
| Offcanvas | ❌ Não tem | ✅ Tem |
| Icons | Font Awesome | Bootstrap Icons |
| Classes de margem | mr-, ml- | me-, ms- |
| Data attributes | data-toggle | data-bs-toggle |
| Tamanho | ~150KB | ~130KB |

---

## Exemplos de Uso

### Exemplo 1: Sistema de Notificações

```javascript
// Função genérica para notificar
function notificar(mensagem, tipo = 'info') {
    BS5.Toast[tipo](mensagem);
}

// Uso
async function salvarDados(dados) {
    try {
        await HTTP.post('/api/salvar', dados);
        notificar('Dados salvos com sucesso!', 'success');
    } catch (error) {
        notificar('Erro ao salvar dados', 'error');
    }
}
```

### Exemplo 2: Confirmação com Modal

```javascript
async function confirmarExclusao(id) {
    return new Promise((resolve) => {
        const modal = BS5.Modal.create({
            title: 'Confirmar Exclusão',
            body: '<p>Deseja realmente excluir este item?</p>',
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Cancelar
                </button>
                <button type="button" class="btn btn-danger" id="btn-confirm">
                    Excluir
                </button>
            `,
            centered: true
        });
        
        modal.show();
        
        modal.element.querySelector('#btn-confirm').onclick = () => {
            modal.hide();
            resolve(true);
        };
        
        modal.element.addEventListener('hidden.bs.modal', () => {
            resolve(false);
            modal.dispose();
        });
    });
}

// Uso
async function excluirItem(id) {
    const confirmado = await confirmarExclusao(id);
    
    if (confirmado) {
        await HTTP.delete(`/api/items/${id}`);
        BS5.Toast.success('Item excluído!');
        recarregarLista();
    }
}
```

### Exemplo 3: Upload com Progresso

```javascript
async function uploadArquivo(file) {
    // Criar modal com progress bar
    const progress = BS5.Progress.create(0, {
        color: 'primary',
        label: true,
        animated: true
    });
    
    const modal = BS5.Modal.create({
        title: 'Enviando Arquivo',
        body: progress.element,
        footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>',
        backdrop: 'static',
        keyboard: false
    });
    
    modal.show();
    
    try {
        await HTTP.upload('/api/upload', file, {}, (percent) => {
            progress.setValue(Math.round(percent));
        });
        
        modal.hide();
        BS5.Toast.success('Upload concluído!');
        
    } catch (error) {
        modal.hide();
        BS5.Toast.error('Erro no upload');
    }
}
```

### Exemplo 4: Lista com Paginação

```javascript
let paginaAtual = 1;
const itensPorPagina = 10;

async function carregarLista(pagina = 1) {
    const dados = await HTTP.get('/api/items', {
        page: pagina,
        per_page: itensPorPagina
    });
    
    // Renderizar items
    renderizarItems(dados.items);
    
    // Criar paginação
    const paginacao = BS5.Pagination.create(
        dados.current_page,
        dados.total_pages,
        {
            align: 'center',
            onChange: (novaPagina) => {
                paginaAtual = novaPagina;
                carregarLista(novaPagina);
            }
        }
    );
    
    document.querySelector('#pagination').innerHTML = '';
    document.querySelector('#pagination').appendChild(paginacao);
}

function renderizarItems(items) {
    const container = document.querySelector('#items');
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = BS5.Card.create({
            title: item.nome,
            text: item.descricao,
            footer: `
                <button class="btn btn-sm btn-primary" onclick="editar(${item.id})">
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluir(${item.id})">
                    Excluir
                </button>
            `
        });
        
        container.appendChild(card);
    });
}
```

### Exemplo 5: Dropdown de Ações

```javascript
function criarDropdownAcoes(itemId) {
    return BS5.Dropdown.create('Ações', [
        {
            text: 'Visualizar',
            icon: 'bi bi-eye',
            onClick: () => visualizar(itemId)
        },
        {
            text: 'Editar',
            icon: 'bi bi-pencil',
            onClick: () => editar(itemId)
        },
        {
            text: 'Duplicar',
            icon: 'bi bi-files',
            onClick: () => duplicar(itemId)
        },
        { divider: true },
        {
            header: 'Zona de Perigo'
        },
        {
            text: 'Excluir',
            icon: 'bi bi-trash',
            onClick: () => excluir(itemId)
        }
    ], {
        buttonType: 'secondary',
        buttonSize: 'sm'
    });
}

// Uso
const dropdown = criarDropdownAcoes(123);
document.querySelector('#acoes').appendChild(dropdown);
```

---

## Migração BS4 → BS5

### Mudanças Necessárias

#### 1. Remover jQuery

```html
<!-- BS4 - ANTES -->
<script src="jquery.min.js"></script>
<script src="bootstrap.bundle.min.js"></script>

<!-- BS5 - DEPOIS -->
<script src="bootstrap.bundle.min.js"></script>
```

#### 2. Atualizar Data Attributes no HTML

```html
<!-- BS4 -->
<button data-toggle="modal" data-target="#myModal">Abrir</button>

<!-- BS5 -->
<button data-bs-toggle="modal" data-bs-target="#myModal">Abrir</button>
```

#### 3. Classes de Spacing

```html
<!-- BS4 -->
<div class="mr-3 ml-2">Texto</div>

<!-- BS5 -->
<div class="me-3 ms-2">Texto</div>
```

#### 4. Código JavaScript

```javascript
// BS4
BS4.Alert.success('Mensagem', { dismissible: true });
$('#modal').modal('show');

// BS5
BS5.Alert.success('Mensagem', { dismissible: true });
const modal = new bootstrap.Modal('#modal');
modal.show();
```

### Tabela de Substituições

| BS4 | BS5 | Descrição |
|-----|-----|-----------|
| `data-toggle` | `data-bs-toggle` | Toggle |
| `data-target` | `data-bs-target` | Target |
| `ml-` | `ms-` | Margin start |
| `mr-` | `me-` | Margin end |
| `pl-` | `ps-` | Padding start |
| `pr-` | `pe-` | Padding end |
| `text-left` | `text-start` | Align left |
| `text-right` | `text-end` | Align right |
| `float-left` | `float-start` | Float left |
| `float-right` | `float-end` | Float right |

---

## Dicas e Boas Práticas

1. **Inicialize componentes no DOM Ready**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    BS5.Utils.initAll();
});
```

2. **Dispose de componentes ao remover elementos**
```javascript
// Antes de remover elemento
BS5.Utils.disposeAll();
elemento.remove();
```

3. **Use toasts para feedback rápido**
```javascript
BS5.Toast.success('Ação concluída!');
```

4. **Use modals para confirmações importantes**
```javascript
const confirmado = await confirmarAcao();
```

5. **Combine com outras bibliotecas**
```javascript
try {
    const dados = await HTTP.post('/api/save', dados);
    BS5.Toast.success('Salvo!');
} catch (error) {
    BS5.Toast.error(HTTP.errors.getMessage(error));
}
```
