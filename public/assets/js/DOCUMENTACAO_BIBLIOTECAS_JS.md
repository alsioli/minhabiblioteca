# Documentação - Bibliotecas JavaScript Reutilizáveis

## Índice
1. [format.js](#formatjs---formatação-de-dados)
2. [html.js](#htmljs---manipulação-htmldom)
3. [http.js](#httpjs---requisições-http)
4. [modal.js](#modaljs---modais-e-diálogos)
5. [textarea.js](#textareajs---manipulação-de-textarea)
6. [tooltip.js](#tooltipjs---tooltips-e-popovers)
7. [page.js](#pagejs---gerenciamento-de-páginas)
8. [Exemplos Integrados](#exemplos-integrados)

---

## format.js - Formatação de Dados

### Propósito
Formata números, moedas, documentos (CPF/CNPJ), telefones e outros dados.

### Principais Funções

#### Formatação de Moeda
```javascript
Format.currency(1500);              // "R$ 1.500,00"
Format.currency(1500, false);       // "1.500,00" (sem símbolo)
Format.unformatCurrency("R$ 1.500,00"); // 1500
```

#### Formatação de Documentos
```javascript
Format.cpf("12345678901");          // "123.456.789-01"
Format.cnpj("12345678000190");      // "12.345.678/0001-90"
Format.cpfCnpj("12345678901");      // Detecta e formata automaticamente

Format.unformatCpf("123.456.789-01");  // "12345678901"
```

#### Telefones e Endereços
```javascript
Format.phone("11987654321");        // "(11) 98765-4321"
Format.phone("1133334444");         // "(11) 3333-4444"
Format.cep("12345678");             // "12345-678"
```

#### Números e Porcentagens
```javascript
Format.number(1234567.89, 2);      // "1.234.567,89"
Format.percent(0.856, 2, true);    // "85,60%" (de decimal)
Format.percent(85.6, 2);           // "85,60%" (de 0-100)
```

#### Outros Formatos
```javascript
Format.fileSize(1536000);          // "1.46 MB"
Format.capitalize("maria silva");  // "Maria Silva"
Format.truncate("Texto longo", 10); // "Texto long..."
Format.creditCard("1234567812345678"); // "1234 5678 1234 5678"
Format.plate("ABC1234");           // "ABC-1234"
```

---

## html.js - Manipulação HTML/DOM

### Propósito
Manipulação avançada de DOM, criação de elementos e utilitários HTML.

### Principais Funções

#### Criar Elementos
```javascript
// Criar elemento
const div = HTML.create('div', {
    className: 'card',
    id: 'meu-card',
    style: { padding: '20px' },
    onClick: () => console.log('Clicou!')
}, 'Conteúdo do card');

document.body.appendChild(div);
```

#### Selecionar Elementos
```javascript
const elemento = HTML.select('.minha-classe');
const varios = HTML.selectAll('.item');  // Retorna array
```

#### Manipular Classes
```javascript
HTML.addClass('#elemento', 'active');
HTML.removeClass('#elemento', 'hidden');
HTML.toggleClass('#elemento', 'expanded');
HTML.hasClass('#elemento', 'active'); // true/false
```

#### Mostrar/Esconder
```javascript
HTML.show('#elemento');              // display: block
HTML.hide('#elemento');              // display: none
HTML.toggle('#elemento', 'flex');    // Alterna visibilidade
```

#### Atributos e Dados
```javascript
HTML.attr('#input', 'placeholder', 'Digite aqui');
const valor = HTML.attr('#input', 'value');
HTML.data('#elemento', 'userId', '123');
const userId = HTML.data('#elemento', 'userId');
```

#### Criar Tabela
```javascript
const dados = [
    { nome: 'Ana', idade: 25, cidade: 'SP' },
    { nome: 'Bruno', idade: 30, cidade: 'RJ' }
];

const colunas = [
    { key: 'nome', label: 'Nome' },
    { key: 'idade', label: 'Idade' },
    { 
        key: 'cidade', 
        label: 'Cidade',
        render: (valor) => `<span class="badge">${valor}</span>`
    }
];

const tabela = HTML.createTable(dados, colunas, {
    className: 'table table-striped'
});

document.body.appendChild(tabela);
```

#### Formulários
```javascript
// Serializar formulário
const dados = HTML.serializeForm('#meu-form');
// { nome: 'João', email: 'joao@email.com' }

// Preencher formulário
HTML.fillForm('#meu-form', {
    nome: 'João',
    email: 'joao@email.com'
});
```

---

## http.js - Requisições HTTP

### Propósito
**MUITO IMPORTANTE**: Biblioteca principal para comunicação com backend via AJAX/Fetch.

### Configuração Inicial
```javascript
// Configurar uma vez no início da aplicação
HTTP.setup({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
    },
    showLoader: true,
    loaderElement: '#global-loader',
    onError: (error) => {
        console.error('Erro global:', error);
        Modal.error(HTTP.errors.getMessage(error));
    }
});
```

### Requisições Básicas

#### GET
```javascript
// GET simples
const usuarios = await HTTP.get('/usuarios');

// GET com parâmetros
const resultado = await HTTP.get('/produtos', {
    categoria: 'eletronicos',
    limite: 10
});
// URL: /api/produtos?categoria=eletronicos&limite=10
```

#### POST
```javascript
// POST com JSON
const novoUsuario = await HTTP.post('/usuarios', {
    nome: 'João Silva',
    email: 'joao@email.com'
});

// POST com FormData
const formData = new FormData();
formData.append('nome', 'João');
const resultado = await HTTP.post('/upload', formData);
```

#### PUT / PATCH / DELETE
```javascript
// Atualizar
await HTTP.put('/usuarios/123', { nome: 'Novo Nome' });
await HTTP.patch('/usuarios/123', { ativo: true });

// Deletar
await HTTP.delete('/usuarios/123');
```

### Upload de Arquivos
```javascript
const input = document.querySelector('#arquivo');

// Upload com progresso
HTTP.upload('/upload', input.files[0], 
    { descricao: 'Meu arquivo' },
    (percent, loaded, total) => {
        console.log(`${percent}% enviado`);
        document.querySelector('#progress').value = percent;
    }
).then(response => {
    console.log('Upload concluído:', response);
});
```

### Download de Arquivos
```javascript
// Download automático
await HTTP.download('/relatorios/vendas.pdf', 'vendas-2025.pdf');

// Com parâmetros
await HTTP.download('/exportar', 'dados.xlsx', {
    formato: 'xlsx',
    periodo: '2025-01'
});
```

### Funcionalidades Avançadas

#### Requisições em Paralelo
```javascript
const [usuarios, produtos, vendas] = await HTTP.all([
    HTTP.get('/usuarios'),
    HTTP.get('/produtos'),
    HTTP.get('/vendas')
]);
```

#### Debounce (Autocomplete)
```javascript
// Busca com delay
document.querySelector('#busca').addEventListener('input', async (e) => {
    const resultados = await HTTP.debounceGet('/buscar', {
        q: e.target.value
    }, 300); // 300ms de delay
    
    mostrarResultados(resultados);
});
```

#### Polling (Atualização Periódica)
```javascript
// Verificar status a cada 5 segundos
const stopPolling = HTTP.poll('/status/processo', (data) => {
    console.log('Status:', data.status);
    
    // Parar quando concluir
    if (data.status === 'concluido') {
        return false; // Para o polling
    }
}, 5000);

// Para manualmente
// stopPolling();
```

#### Retry Automático
```javascript
// Tenta até 3 vezes em caso de falha
const dados = await HTTP.retry(
    () => HTTP.get('/dados-importantes'),
    3,    // máximo de tentativas
    1000  // delay entre tentativas
);
```

#### Cache de Requisições
```javascript
// Cache por 60 segundos
const usuarios = await HTTP.getCached('/usuarios', {}, 60000);

// Limpar cache
HTTP.clearCache('/usuarios'); // Específico
HTTP.clearCache();            // Todo cache
```

### Tratamento de Erros
```javascript
try {
    const dados = await HTTP.get('/dados');
} catch (error) {
    if (HTTP.errors.isNetworkError(error)) {
        alert('Sem conexão com internet');
    } else if (HTTP.errors.isAuthError(error)) {
        window.location = '/login';
    } else if (HTTP.errors.isServerError(error)) {
        alert('Erro no servidor');
    }
    
    console.log(HTTP.errors.getMessage(error));
}
```

---

## modal.js - Modais e Diálogos

### Propósito
Criação e gerenciamento de modais, alertas e diálogos.

### Modais Simples

#### Alert
```javascript
await Modal.alert('Operação concluída!');
await Modal.alert('Mensagem', 'Título Customizado');
```

#### Confirm
```javascript
const confirmado = await Modal.confirm(
    'Deseja realmente excluir?',
    'Confirmar Exclusão'
);

if (confirmado) {
    // Usuário clicou em Sim
    await HTTP.delete('/item/123');
}
```

#### Prompt
```javascript
const nome = await Modal.prompt('Digite seu nome:', 'Cadastro');

if (nome) {
    console.log('Nome digitado:', nome);
}

// Com valor padrão
const email = await Modal.prompt('Email:', 'Contato', {
    defaultValue: 'user@example.com',
    inputType: 'email'
});
```

### Modais com Ícones

```javascript
// Sucesso
await Modal.success('Cadastro realizado com sucesso!');

// Erro
await Modal.error('Falha ao salvar os dados.');

// Aviso
await Modal.warning('Atenção! Esta ação não pode ser desfeita.');

// Informação
await Modal.info('Seus dados foram atualizados.');
```

### Modal de Loading
```javascript
const loading = Modal.loading('Processando...');

// Fazer algo demorado
await processarDados();

// Fechar
loading.close();

// Atualizar mensagem
loading.setMessage('Quase lá...');
```

### Modal Customizado
```javascript
const modal = Modal.create({
    title: 'Detalhes do Produto',
    content: '<p>Informações do produto...</p>',
    size: 'large',  // small, medium, large, xlarge
    buttons: [
        {
            text: 'Cancelar',
            className: 'btn btn-secondary',
            dismiss: true
        },
        {
            text: 'Salvar',
            className: 'btn btn-primary',
            onClick: (e, modal) => {
                console.log('Salvar clicado');
                modal.hide();
            }
        }
    ],
    onShow: (modal) => {
        console.log('Modal aberto');
    },
    onHide: (modal) => {
        console.log('Modal fechado');
    }
});

modal.show();
```

### Modal com Formulário
```javascript
const dados = await Modal.form('Novo Usuário', [
    {
        name: 'nome',
        label: 'Nome Completo',
        type: 'text',
        required: true
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true
    },
    {
        name: 'tipo',
        label: 'Tipo de Usuário',
        type: 'select',
        options: [
            { value: 'admin', label: 'Administrador' },
            { value: 'user', label: 'Usuário' }
        ]
    },
    {
        name: 'observacoes',
        label: 'Observações',
        type: 'textarea',
        rows: 3
    }
]);

if (dados) {
    await HTTP.post('/usuarios', dados);
}
```

---

## textarea.js - Manipulação de Textarea

### Auto-resize
```javascript
// Textarea cresce conforme conteúdo
Textarea.autoResize('#comentario', {
    minHeight: 50,
    maxHeight: 300
});
```

### Contadores
```javascript
// Contador de caracteres
Textarea.charCounter('#mensagem', {
    maxLength: 500,
    showRemaining: true,
    warningThreshold: 0.9  // Vermelho aos 90%
});

// Contador de palavras
Textarea.wordCounter('#texto');
```

### Inserir e Formatar Texto
```javascript
// Inserir na posição do cursor
Textarea.insertAtCursor('#editor', 'Texto inserido');

// Envolver seleção
Textarea.wrapSelection('#editor', '**');  // **texto**
Textarea.wrapSelection('#editor', '[', ']');  // [texto]

// Formatar como lista
Textarea.formatAsList('#editor', '- ');   // Lista não ordenada
Textarea.formatAsList('#editor', '#. ');  // Lista numerada
```

### Atalhos de Teclado
```javascript
Textarea.addShortcuts('#editor', {
    'Ctrl+B': () => Textarea.wrapSelection('#editor', '**'),
    'Ctrl+I': () => Textarea.wrapSelection('#editor', '_'),
    'Ctrl+L': () => Textarea.formatAsList('#editor', '- ')
});
```

### Toolbar de Formatação
```javascript
Textarea.createToolbar('#editor', {
    buttons: ['bold', 'italic', '|', 'list-ul', 'list-ol', '|', 'link']
});
```

### Auto-save
```javascript
// Salva automaticamente no localStorage
Textarea.autoSave('#rascunho', 'draft-post', 1000);
```

---

## tooltip.js - Tooltips e Popovers

### Tooltips Simples
```javascript
// Inicializar todos tooltips
Tooltip.init();

// Criar tooltip programaticamente
const tip = Tooltip.create('#botao', 'Texto do tooltip', {
    placement: 'top',  // top, bottom, left, right
    trigger: 'hover'   // hover, click, focus
});
```

### Tooltip de Erro
```javascript
// Mostrar erro em campo de formulário
Tooltip.error('#email', 'Email inválido');

// Mostrar sucesso temporário
Tooltip.success('#salvar', 'Dados salvos!', 3000);
```

### Tooltip de Ajuda
```javascript
// Adicionar ícone de ajuda
const helpIcon = Tooltip.helpIcon(
    'Esta funcionalidade permite...',
    { placement: 'right' }
);

document.querySelector('label').appendChild(helpIcon);
```

### Popover
```javascript
Tooltip.popover('#info', {
    title: 'Informações',
    content: '<p>Conteúdo do popover...</p>',
    html: true,
    placement: 'right'
});
```

### Tooltip de Confirmação
```javascript
Tooltip.confirm(
    '#excluir',
    'Deseja realmente excluir?',
    (elemento) => {
        console.log('Confirmado!');
        // Executar exclusão
    }
);
```

---

## page.js - Gerenciamento de Páginas

### Inicialização
```javascript
Page.init({
    loaderSelector: '#page-loader',
    contentSelector: '#main-content',
    enableHistory: true,
    scrollToTop: true
});
```

### Navegação
```javascript
// Navegar para página
Page.navigate('/usuarios/lista');

// Carregar conteúdo em elemento
Page.load('/fragmento.html', '#container');

// Recarregar página atual
Page.reload();

// Voltar
Page.back();
```

### Eventos de Lifecycle
```javascript
// Antes de carregar página
Page.on('onBeforeLoad', (data) => {
    console.log('Carregando:', data.url);
});

// Depois de carregar
Page.on('onAfterLoad', (data) => {
    console.log('Carregado:', data.url);
    // Re-inicializar componentes
    Tooltip.init();
});

// Em caso de erro
Page.on('onError', (data) => {
    console.error('Erro:', data.error);
});
```

### Scroll
```javascript
// Scroll para topo
Page.scrollToTop();

// Scroll para elemento
Page.scrollTo('#secao-contato', {
    offset: 80,  // Compensar header fixo
    duration: 500
});

// Lazy load ao chegar no final
Page.lazyLoadOnScroll(async () => {
    const maisDados = await HTTP.get('/mais-dados');
    renderizarDados(maisDados);
}, 200);
```

### Utilitários
```javascript
// Executar quando DOM pronto
Page.ready(() => {
    console.log('DOM pronto');
});

// Copiar para clipboard
await Page.copyToClipboard('Texto copiado');

// Imprimir página
Page.print();

// Imprimir elemento específico
Page.print('#relatorio');

// Detectar visibilidade
Page.onVisibilityChange(
    () => console.log('Página visível'),
    () => console.log('Página escondida')
);

// Aviso antes de sair
Page.beforeUnload(() => {
    return confirm('Tem certeza que deseja sair?');
});
```

---

## Exemplos Integrados

### Exemplo 1: CRUD Completo
```javascript
// Listar usuários
async function listarUsuarios() {
    try {
        const usuarios = await HTTP.get('/usuarios');
        
        const tabela = HTML.createTable(usuarios, [
            { key: 'nome', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { 
                key: 'id', 
                label: 'Ações',
                render: (id) => `
                    <button onclick="editarUsuario(${id})" class="btn btn-sm btn-primary">
                        Editar
                    </button>
                    <button onclick="excluirUsuario(${id})" class="btn btn-sm btn-danger">
                        Excluir
                    </button>
                `
            }
        ]);
        
        HTML.empty('#lista-usuarios');
        HTML.append('#lista-usuarios', tabela);
        
    } catch (error) {
        Modal.error('Erro ao carregar usuários');
    }
}

// Criar usuário
async function criarUsuario() {
    const dados = await Modal.form('Novo Usuário', [
        { name: 'nome', label: 'Nome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true }
    ]);
    
    if (dados) {
        try {
            await HTTP.post('/usuarios', dados);
            Modal.success('Usuário criado com sucesso!');
            listarUsuarios();
        } catch (error) {
            Modal.error('Erro ao criar usuário');
        }
    }
}

// Excluir usuário
async function excluirUsuario(id) {
    const confirmado = await Modal.confirm(
        'Deseja realmente excluir este usuário?',
        'Confirmar Exclusão'
    );
    
    if (confirmado) {
        try {
            await HTTP.delete(`/usuarios/${id}`);
            Modal.success('Usuário excluído!');
            listarUsuarios();
        } catch (error) {
            Modal.error('Erro ao excluir usuário');
        }
    }
}
```

### Exemplo 2: Validação de Formulário
```javascript
const form = document.querySelector('#formulario-cadastro');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar CPF
    const cpfInput = form.elements['cpf'];
    const cpf = Format.unformatCpf(cpfInput.value);
    
    if (cpf.length !== 11) {
        Tooltip.error(cpfInput, 'CPF inválido');
        return;
    }
    
    // Serializar formulário
    const dados = HTML.serializeForm(form);
    
    // Formatar dados
    dados.cpf = Format.unformatCpf(dados.cpf);
    dados.telefone = Format.unformatPhone(dados.telefone);
    
    // Enviar
    const loading = Modal.loading('Salvando...');
    
    try {
        await HTTP.post('/cadastro', dados);
        loading.close();
        Modal.success('Cadastro realizado!');
        form.reset();
    } catch (error) {
        loading.close();
        Modal.error(HTTP.errors.getMessage(error));
    }
});
```

### Exemplo 3: Upload com Progresso
```javascript
const inputFile = document.querySelector('#arquivo');
const progressBar = document.querySelector('#progress');

inputFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    HTML.show(progressBar.parentElement);
    
    try {
        const response = await HTTP.upload(
            '/upload',
            file,
            { categoria: 'documentos' },
            (percent) => {
                progressBar.value = percent;
                progressBar.textContent = `${Math.round(percent)}%`;
            }
        );
        
        Modal.success(`Arquivo enviado: ${response.filename}`);
        
    } catch (error) {
        Modal.error('Erro no upload');
    } finally {
        HTML.hide(progressBar.parentElement);
    }
});
```

### Exemplo 4: Busca com Debounce
```javascript
const inputBusca = document.querySelector('#busca');
const resultados = document.querySelector('#resultados');

inputBusca.addEventListener('input', async (e) => {
    const termo = e.target.value;
    
    if (termo.length < 3) {
        HTML.empty(resultados);
        return;
    }
    
    try {
        const dados = await HTTP.debounceGet('/buscar', { q: termo }, 300);
        
        HTML.empty(resultados);
        
        dados.forEach(item => {
            const div = HTML.create('div', { className: 'result-item' }, 
                `${item.nome} - ${item.descricao}`
            );
            HTML.append(resultados, div);
        });
        
    } catch (error) {
        console.error('Erro na busca:', error);
    }
});
```

---

## Boas Práticas

1. **Sempre use try-catch com HTTP**
```javascript
try {
    const dados = await HTTP.get('/dados');
} catch (error) {
    Modal.error(HTTP.errors.getMessage(error));
}
```

2. **Configure HTTP uma vez no início**
```javascript
// No início da aplicação
HTTP.setup({
    baseURL: '/api',
    showLoader: true
});
```

3. **Use modais para feedback ao usuário**
```javascript
await Modal.success('Operação concluída!');
await Modal.error('Algo deu errado');
```

4. **Formate dados antes de enviar**
```javascript
const dados = {
    cpf: Format.unformatCpf(cpfInput.value),
    valor: Format.unformatCurrency(valorInput.value)
};
```

5. **Valide formulários antes de enviar**
```javascript
if (!form.checkValidity()) {
    form.reportValidity();
    return;
}
```
