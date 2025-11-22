# Documentação - Bootstrap Datepicker Wrapper

## Índice
1. [Instalação](#instalação)
2. [Configuração Básica](#configuração-básica)
3. [Tipos de Datepicker](#tipos-de-datepicker)
4. [Funções Avançadas](#funções-avançadas)
5. [Validações](#validações)
6. [Eventos](#eventos)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Integração com Formulários](#integração-com-formulários)

---

## Instalação

### Opção 1: Via CDN (Recomendado)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>DatePicker Example</title>
    
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    
    <!-- Bootstrap Datepicker CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/css/bootstrap-datepicker.min.css">
</head>
<body>
    <!-- Seu conteúdo -->

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Bootstrap Datepicker JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/js/bootstrap-datepicker.min.js"></script>
    
    <!-- Locale PT-BR -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/locales/bootstrap-datepicker.pt-BR.min.js"></script>
    
    <!-- Nossa biblioteca wrapper -->
    <script src="bootstrap-datepicker.js"></script>
</body>
</html>
```

### Opção 2: Arquivos Locais

```html
<link rel="stylesheet" href="assets/css/bootstrap-datepicker.min.css">
<script src="assets/js/bootstrap-datepicker.min.js"></script>
<script src="assets/js/locales/bootstrap-datepicker.pt-BR.min.js"></script>
<script src="assets/js/bootstrap-datepicker.js"></script>
```

---

## Configuração Básica

### Datepicker Simples

```html
<input type="text" class="form-control" id="data-simples" placeholder="dd/mm/aaaa">

<script>
    // Inicializar
    const datepicker = DatePicker.simple('#data-simples');
</script>
```

### Com Opções Customizadas

```javascript
const datepicker = DatePicker.init('#minha-data', {
    format: 'dd/mm/yyyy',
    autoclose: true,
    todayHighlight: true,
    language: 'pt-BR',
    orientation: 'bottom auto',
    clearBtn: true,
    todayBtn: 'linked'
});
```

---

## Tipos de Datepicker

### 1. Datepicker Simples (Dia/Mês/Ano)

```html
<input type="text" id="data1" class="form-control">

<script>
    DatePicker.simple('#data1');
</script>
```

### 2. Seleção de Mês e Ano

```html
<input type="text" id="mes-ano" class="form-control" placeholder="mm/aaaa">

<script>
    DatePicker.monthYear('#mes-ano');
</script>
```

### 3. Seleção Apenas de Ano

```html
<input type="text" id="ano" class="form-control" placeholder="aaaa">

<script>
    DatePicker.yearOnly('#ano');
</script>
```

### 4. Range de Datas (Período)

```html
<div class="row">
    <div class="col-md-6">
        <label>Data Início</label>
        <input type="text" id="data-inicio" class="form-control">
    </div>
    <div class="col-md-6">
        <label>Data Fim</label>
        <input type="text" id="data-fim" class="form-control">
    </div>
</div>

<script>
    const range = DatePicker.range('#data-inicio', '#data-fim');
    
    // Obter período selecionado
    const periodo = range.getRange();
    console.log('Início:', periodo.start);
    console.log('Fim:', periodo.end);
    
    // Definir período
    range.setRange('01/01/2025', '31/12/2025');
    
    // Limpar
    range.clear();
</script>
```

### 5. Datepicker Inline (Embutido)

```html
<div id="calendario-inline"></div>

<script>
    const inline = DatePicker.inline('#calendario-inline');
    
    // Ouvir mudanças
    inline.on('changeDate', function(e) {
        console.log('Data selecionada:', e.date);
    });
</script>
```

### 6. Múltiplas Datas

```html
<input type="text" id="multiplas-datas" class="form-control">

<script>
    const multi = DatePicker.multidate('#multiplas-datas');
    
    // Usuário pode selecionar várias datas
    // Resultado: "15/11/2025, 20/11/2025, 25/11/2025"
</script>
```

---

## Funções Avançadas

### Apenas Datas Futuras

```javascript
// Só permite selecionar datas a partir de hoje
DatePicker.futureOnly('#agendamento');
```

### Apenas Datas Passadas

```javascript
// Só permite datas até hoje
DatePicker.pastOnly('#data-evento-passado');
```

### Sem Fins de Semana

```javascript
// Desabilita sábados e domingos
DatePicker.weekdaysOnly('#data-entrega');
```

### Data de Nascimento

```javascript
// Configurado para seleção de data de nascimento
// Limita entre 120 anos atrás e hoje
DatePicker.birthDate('#data-nascimento');
```

### Idade Mínima

```javascript
// Apenas maiores de 18 anos
DatePicker.minAge('#data-nasc', 18);

// Apenas maiores de 21 anos
DatePicker.minAge('#data-nasc-bebida', 21);
```

### Desabilitar Datas Específicas

```javascript
// Desabilitar feriados
DatePicker.disableDates('#data-reuniao', [
    '2025-01-01', // Ano Novo
    '2025-12-25', // Natal
    '2025-04-21'  // Tiradentes
]);
```

### Desabilitar Feriados Brasileiros

```javascript
// Desabilita feriados nacionais automaticamente
DatePicker.disableHolidays('#data-trabalho', 2025);
```

---

## Validações

### Validar Data

```javascript
// Verificar se data é válida
const dataValida = DatePicker.isValid('15/11/2025'); // true
const dataInvalida = DatePicker.isValid('32/13/2025'); // false
```

### Parse de Data

```javascript
// Converter string para Date
const data = DatePicker.parseDate('15/11/2025');
console.log(data); // Date object
```

### Formatar Data

```javascript
const data = new Date();

// Formatar em diferentes padrões
DatePicker.formatDate(data, 'dd/mm/yyyy'); // "15/11/2025"
DatePicker.formatDate(data, 'mm/yyyy');    // "11/2025"
DatePicker.formatDate(data, 'yyyy');        // "2025"
```

### Diferença entre Datas

```javascript
const diff = DatePicker.diff('01/01/2025', '31/12/2025');

console.log(diff.days);   // 364
console.log(diff.weeks);  // 52
console.log(diff.months); // 12
console.log(diff.years);  // 0
```

---

## Eventos

### Eventos Disponíveis

```javascript
const picker = DatePicker.simple('#data');

// Ao mudar data
picker.on('changeDate', function(e) {
    console.log('Data alterada:', e.date);
    console.log('Data formatada:', e.format());
});

// Ao limpar
picker.on('clearDate', function(e) {
    console.log('Data limpa');
});

// Ao mostrar calendário
picker.on('show', function(e) {
    console.log('Calendário aberto');
});

// Ao esconder calendário
picker.on('hide', function(e) {
    console.log('Calendário fechado');
});
```

---

## Exemplos Práticos

### Exemplo 1: Formulário de Agendamento

```html
<form id="form-agendamento">
    <div class="form-group">
        <label>Data do Agendamento</label>
        <input type="text" id="data-agendamento" class="form-control" required>
        <small class="form-text text-muted">Apenas dias úteis</small>
    </div>
    
    <button type="submit" class="btn btn-primary">Agendar</button>
</form>

<script>
    // Só dias úteis, só datas futuras
    const agendamento = DatePicker.weekdaysOnly('#data-agendamento', {
        startDate: new Date()
    });
    
    // Validar ao submeter
    document.getElementById('form-agendamento').onsubmit = function(e) {
        e.preventDefault();
        
        const data = agendamento.getFormattedValue();
        
        if (!data) {
            alert('Selecione uma data');
            return;
        }
        
        console.log('Agendamento para:', data);
        // Enviar formulário...
    };
</script>
```

### Exemplo 2: Filtro de Período

```html
<div class="card">
    <div class="card-header">
        <h5>Filtrar por Período</h5>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-5">
                <label>De</label>
                <input type="text" id="filtro-inicio" class="form-control">
            </div>
            <div class="col-md-5">
                <label>Até</label>
                <input type="text" id="filtro-fim" class="form-control">
            </div>
            <div class="col-md-2">
                <label>&nbsp;</label>
                <button class="btn btn-primary btn-block" onclick="aplicarFiltro()">
                    Filtrar
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    const filtro = DatePicker.range('#filtro-inicio', '#filtro-fim');
    
    function aplicarFiltro() {
        const periodo = filtro.getRange();
        
        if (!periodo.start || !periodo.end) {
            alert('Selecione o período completo');
            return;
        }
        
        console.log('Filtrar de', periodo.start, 'até', periodo.end);
        
        // Buscar dados
        HTTP.get('/api/relatorio', {
            inicio: DatePicker.formatDate(periodo.start, 'yyyy-mm-dd'),
            fim: DatePicker.formatDate(periodo.end, 'yyyy-mm-dd')
        }).then(dados => {
            console.log('Dados filtrados:', dados);
        });
    }
</script>
```

### Exemplo 3: Cadastro com Validação de Idade

```html
<form id="form-cadastro">
    <div class="form-group">
        <label>Nome Completo</label>
        <input type="text" class="form-control" id="nome" required>
    </div>
    
    <div class="form-group">
        <label>Data de Nascimento</label>
        <input type="text" class="form-control" id="data-nascimento" required>
        <small class="form-text text-muted">Você deve ter pelo menos 18 anos</small>
    </div>
    
    <button type="submit" class="btn btn-primary">Cadastrar</button>
</form>

<script>
    // Apenas maiores de 18 anos
    const nascimento = DatePicker.minAge('#data-nascimento', 18);
    
    document.getElementById('form-cadastro').onsubmit = function(e) {
        e.preventDefault();
        
        const dataNasc = nascimento.getValue();
        
        if (!dataNasc) {
            alert('Informe sua data de nascimento');
            return;
        }
        
        // Calcular idade
        const idade = DatePicker.diff(dataNasc, new Date()).years;
        
        if (idade < 18) {
            alert('Você deve ter pelo menos 18 anos');
            return;
        }
        
        console.log('Cadastro aprovado, idade:', idade);
        // Enviar formulário...
    };
</script>
```

### Exemplo 4: Auto-inicialização com Data Attributes

```html
<!-- Inicializa automaticamente -->
<input type="text" 
       data-datepicker="simple" 
       class="form-control"
       placeholder="Data simples">

<input type="text" 
       data-datepicker="month-year" 
       class="form-control"
       placeholder="Mês/Ano">

<input type="text" 
       data-datepicker="future" 
       class="form-control"
       placeholder="Apenas datas futuras">

<input type="text" 
       data-datepicker="birthdate" 
       class="form-control"
       placeholder="Data de nascimento">

<script>
    // Inicializa todos automaticamente
    DatePicker.initAll();
</script>
```

### Exemplo 5: Integração com Formulário Dinâmico

```html
<div id="container-datas"></div>
<button onclick="adicionarCampoData()">+ Adicionar Data</button>

<script>
    let contador = 0;
    
    function adicionarCampoData() {
        contador++;
        
        const html = `
            <div class="form-group" id="campo-${contador}">
                <label>Data ${contador}</label>
                <div class="input-group">
                    <input type="text" 
                           id="data-${contador}" 
                           class="form-control">
                    <div class="input-group-append">
                        <button class="btn btn-danger" 
                                onclick="removerCampo(${contador})" 
                                type="button">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('container-datas').insertAdjacentHTML('beforeend', html);
        
        // Inicializar datepicker no novo campo
        DatePicker.simple(`#data-${contador}`);
    }
    
    function removerCampo(id) {
        const campo = document.getElementById(`campo-${id}`);
        const picker = DatePicker.init(`#data-${id}`);
        
        // Destruir datepicker antes de remover
        picker.destroy();
        campo.remove();
    }
</script>
```

---

## Integração com Formulários

### Com Validação HTML5

```html
<form>
    <div class="form-group">
        <label>Data Obrigatória</label>
        <input type="text" 
               id="data-obrig" 
               class="form-control" 
               required>
    </div>
    <button type="submit" class="btn btn-primary">Enviar</button>
</form>

<script>
    DatePicker.simple('#data-obrig');
</script>
```

### Com Bootstrap Validation

```html
<form class="needs-validation" novalidate>
    <div class="form-group">
        <label>Data</label>
        <input type="text" 
               id="data-valid" 
               class="form-control" 
               required>
        <div class="invalid-feedback">
            Por favor, selecione uma data válida.
        </div>
    </div>
    <button type="submit" class="btn btn-primary">Enviar</button>
</form>

<script>
    const picker = DatePicker.simple('#data-valid');
    
    // Adicionar validação customizada
    picker.on('changeDate', function() {
        document.getElementById('data-valid').classList.remove('is-invalid');
        document.getElementById('data-valid').classList.add('is-valid');
    });
</script>
```

### Com Nossa Biblioteca HTTP.js

```javascript
async function salvarEvento() {
    const datepicker = DatePicker.simple('#data-evento');
    const data = datepicker.getValue();
    
    if (!data) {
        alert('Selecione uma data');
        return;
    }
    
    try {
        const resultado = await HTTP.post('/api/eventos', {
            titulo: document.getElementById('titulo').value,
            data: DatePicker.formatDate(data, 'yyyy-mm-dd'),
            descricao: document.getElementById('desc').value
        });
        
        BS5.Toast.success('Evento criado com sucesso!');
        datepicker.clear();
        
    } catch (error) {
        BS5.Toast.error('Erro ao criar evento');
    }
}
```

---

## Métodos da Instância

Quando você cria um datepicker, ele retorna uma instância com métodos:

```javascript
const picker = DatePicker.simple('#data');

// Obter valor como Date
picker.getValue();

// Obter valor formatado (string)
picker.getFormattedValue();

// Definir valor
picker.setValue(new Date());
picker.setValue('15/11/2025');

// Limpar
picker.clear();

// Mostrar calendário
picker.show();

// Esconder calendário
picker.hide();

// Atualizar
picker.update();

// Definir data mínima
picker.setStartDate('01/01/2025');

// Definir data máxima
picker.setEndDate('31/12/2025');

// Desabilitar datas
picker.setDatesDisabled(['25/12/2025', '01/01/2026']);

// Desabilitar dias da semana (0=Dom, 6=Sáb)
picker.setDaysOfWeekDisabled([0, 6]);

// Habilitar
picker.enable();

// Desabilitar
picker.disable();

// Destruir
picker.destroy();

// Event listeners
picker.on('changeDate', callback);
picker.off('changeDate');
```

---

## Customização Visual

### CSS Customizado Incluído

A biblioteca já injeta estilos melhorados automaticamente:

- Bordas arredondadas
- Sombra suave
- Cores do Bootstrap
- Destaque de hoje
- Estado de datas desabilitadas
- Marcação de feriados

### Adicionar Estilos Próprios

```css
/* Customizar cor principal */
.datepicker table tr td.active.active {
    background-color: #28a745 !important;
}

/* Customizar hoje */
.datepicker table tr td.today {
    background-color: #ffc107 !important;
}

/* Feriados */
.datepicker table tr td.holiday {
    background-color: #ffe5e5;
    font-weight: bold;
}
```

---

## Dicas e Boas Práticas

1. **Sempre use locale pt-BR**
```javascript
// Já incluído por padrão na biblioteca
```

2. **Destrua datepickers ao remover elementos**
```javascript
picker.destroy();
elemento.remove();
```

3. **Use formato ISO para enviar ao servidor**
```javascript
const dataISO = DatePicker.formatDate(data, 'yyyy-mm-dd');
```

4. **Valide datas antes de enviar**
```javascript
if (!DatePicker.isValid(dataStr)) {
    alert('Data inválida');
    return;
}
```

5. **Combine com outras bibliotecas**
```javascript
// Com Format.js
const dataBR = Format.brToISO(picker.getFormattedValue());

// Com Modal.js
const data = await Modal.prompt('Digite a data:', 'Data', {
    inputType: 'text'
});
DatePicker.simple(inputElement).setValue(data);
```

---

## Compatibilidade

- ✅ Bootstrap 3.x
- ✅ Bootstrap 4.x
- ✅ Bootstrap 5.x (com adaptações)
- ✅ jQuery 1.7+
- ✅ Todos navegadores modernos
- ✅ IE 9+

---

## Troubleshooting

### Datepicker não aparece
- Verifique se jQuery está carregado antes
- Verifique se CSS do datepicker está incluído
- Verifique console do navegador por erros

### Locale não funciona
- Certifique-se de incluir o arquivo de locale pt-BR
- Carregue após o bootstrap-datepicker.js

### Datas não formatam corretamente
- Use sempre o formato 'dd/mm/yyyy' para PT-BR
- Verifique se locale está configurado

### Conflito com outros plugins
- Use `$.noConflict()` se necessário
- Carregue datepicker após outros plugins
