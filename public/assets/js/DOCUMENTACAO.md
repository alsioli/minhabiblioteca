# Documentação - Bibliotecas JavaScript

## Índice
1. [Instalação](#instalação)
2. [DateUtils - Utilitários de Data](#dateutilsutilitários-de-data)
3. [FilterUtils - Utilitários de Filtros](#filterutilsutilitários-de-filtros)
4. [Exemplos de Uso](#exemplos-de-uso)

---

## Instalação

### No HTML
```html
<!-- Incluir as bibliotecas antes do seu código -->
<script src="dateUtils.js"></script>
<script src="filterUtils.js"></script>

<script>
    // Agora você pode usar DateUtils e FilterUtils
    const dataFormatada = DateUtils.formatToBR(new Date());
</script>
```

### No Node.js / PHP (via AJAX)
```javascript
// Importar as bibliotecas
const DateUtils = require('./dateUtils.js');
const FilterUtils = require('./filterUtils.js');
```
---

## DateUtils - Utilitários de Data

### Métodos Disponíveis

#### `formatToBR(date)`
Formata uma data no padrão brasileiro (dd/mm/yyyy).

```javascript
const data = new Date('2025-11-15');
DateUtils.formatToBR(data); // "15/11/2025"
```

#### `formatDateTimeToBR(date)`
Formata data com hora no padrão brasileiro (dd/mm/yyyy HH:mm:ss).

```javascript
const agora = new Date();
DateUtils.formatDateTimeToBR(agora); // "15/11/2025 14:30:45"
```

#### `brToISO(brDate)`
Converte data brasileira para formato ISO (yyyy-mm-dd).

```javascript
DateUtils.brToISO('15/11/2025'); // "2025-11-15"
```

#### `isValidBRDate(date)`
Valida se uma data está no formato brasileiro válido.

```javascript
DateUtils.isValidBRDate('15/11/2025'); // true
DateUtils.isValidBRDate('32/13/2025'); // false
DateUtils.isValidBRDate('15-11-2025'); // false
```

#### `addDays(date, days)`
Adiciona dias a uma data.

```javascript
const hoje = new Date('2025-11-15');
const futuro = DateUtils.addDays(hoje, 30);
DateUtils.formatToBR(futuro); // "15/12/2025"
```

#### `addMonths(date, months)`
Adiciona meses a uma data.

```javascript
const hoje = new Date('2025-11-15');
const futuro = DateUtils.addMonths(hoje, 3);
DateUtils.formatToBR(futuro); // "15/02/2026"
```

#### `diffInDays(date1, date2)`
Calcula diferença em dias entre duas datas.

```javascript
const data1 = new Date('2025-11-15');
const data2 = new Date('2025-12-15');
DateUtils.diffInDays(data1, data2); // 30
```

#### `isToday(date)`
Verifica se uma data é hoje.

```javascript
DateUtils.isToday(new Date()); // true
DateUtils.isToday(new Date('2024-01-01')); // false
```

#### `getFirstDayOfMonth(date)`
Obtém o primeiro dia do mês.

```javascript
const data = new Date('2025-11-15');
const primeiro = DateUtils.getFirstDayOfMonth(data);
DateUtils.formatToBR(primeiro); // "01/11/2025"
```

#### `getLastDayOfMonth(date)`
Obtém o último dia do mês.

```javascript
const data = new Date('2025-11-15');
const ultimo = DateUtils.getLastDayOfMonth(data);
DateUtils.formatToBR(ultimo); // "30/11/2025"
```

#### `formatToSQL(date)`
Formata data para SQL Server (yyyy-mm-dd HH:mm:ss).

```javascript
const agora = new Date();
DateUtils.formatToSQL(agora); // "2025-11-15 14:30:45"
```

#### `getMonthName(month)`
Retorna nome do mês em português (0-11).

```javascript
DateUtils.getMonthName(10); // "Novembro"
DateUtils.getMonthName(0);  // "Janeiro"
```

#### `getDayName(day)`
Retorna nome do dia da semana em português (0-6).

```javascript
DateUtils.getDayName(5); // "Sexta-feira"
DateUtils.getDayName(0); // "Domingo"
```

---

## FilterUtils - Utilitários de Filtros

### Métodos Disponíveis

#### `filterByText(array, searchText, fields)`
Filtra array por texto em múltiplos campos.

```javascript
const usuarios = [
    { nome: 'Ana Silva', email: 'ana@example.com' },
    { nome: 'Bruno Santos', email: 'bruno@example.com' }
];

FilterUtils.filterByText(usuarios, 'ana', ['nome', 'email']);
// Retorna: [{ nome: 'Ana Silva', email: 'ana@example.com' }]
```

#### `sortBy(array, field, order)`
Ordena array por campo específico.

```javascript
const produtos = [
    { nome: 'Caneta', preco: 2.50 },
    { nome: 'Caderno', preco: 15.00 },
    { nome: 'Lápis', preco: 1.20 }
];

FilterUtils.sortBy(produtos, 'preco', 'asc');
// Ordena por preço crescente

FilterUtils.sortBy(produtos, 'nome', 'desc');
// Ordena por nome decrescente
```

#### `filterByDateRange(array, dateField, startDate, endDate)`
Filtra por intervalo de datas.

```javascript
const pedidos = [
    { id: 1, data: '2025-11-10' },
    { id: 2, data: '2025-11-15' },
    { id: 3, data: '2025-11-20' }
];

FilterUtils.filterByDateRange(pedidos, 'data', '2025-11-12', '2025-11-18');
// Retorna: [{ id: 2, data: '2025-11-15' }]
```

#### `filterByValues(array, field, values)`
Filtra por múltiplos valores em um campo.

```javascript
const funcionarios = [
    { nome: 'Ana', departamento: 'TI' },
    { nome: 'Bruno', departamento: 'RH' },
    { nome: 'Carlos', departamento: 'Vendas' }
];

FilterUtils.filterByValues(funcionarios, 'departamento', ['TI', 'RH']);
// Retorna Ana e Bruno
```

#### `groupBy(array, field)`
Agrupa array por campo.

```javascript
const vendas = [
    { produto: 'Caneta', categoria: 'Papelaria' },
    { produto: 'Caderno', categoria: 'Papelaria' },
    { produto: 'Mouse', categoria: 'Informática' }
];

const grupos = FilterUtils.groupBy(vendas, 'categoria');
// Retorna:
// {
//   'Papelaria': [{ produto: 'Caneta', ... }, { produto: 'Caderno', ... }],
//   'Informática': [{ produto: 'Mouse', ... }]
// }
```

#### `removeDuplicates(array, field)`
Remove duplicatas baseado em campo.

```javascript
const clientes = [
    { id: 1, email: 'ana@example.com' },
    { id: 2, email: 'bruno@example.com' },
    { id: 3, email: 'ana@example.com' }
];

FilterUtils.removeDuplicates(clientes, 'email');
// Remove o terceiro item (duplicado)
```

#### `paginate(array, page, perPage)`
Pagina array.

```javascript
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const resultado = FilterUtils.paginate(items, 1, 3);
// Retorna:
// {
//   data: [1, 2, 3],
//   pagination: {
//     currentPage: 1,
//     perPage: 3,
//     total: 10,
//     totalPages: 4,
//     hasNext: true,
//     hasPrev: false
//   }
// }
```

#### `filterByRange(array, field, min, max)`
Filtra por intervalo numérico.

```javascript
const produtos = [
    { nome: 'A', preco: 10 },
    { nome: 'B', preco: 25 },
    { nome: 'C', preco: 50 }
];

FilterUtils.filterByRange(produtos, 'preco', 20, 40);
// Retorna apenas o produto B
```

#### `getUniqueValues(array, field)`
Obtém valores únicos de um campo.

```javascript
const funcionarios = [
    { nome: 'Ana', departamento: 'TI' },
    { nome: 'Bruno', departamento: 'TI' },
    { nome: 'Carlos', departamento: 'RH' }
];

FilterUtils.getUniqueValues(funcionarios, 'departamento');
// Retorna: ['TI', 'RH']
```

#### `countValues(array, field)`
Conta ocorrências de valores.

```javascript
const vendas = [
    { produto: 'Caneta' },
    { produto: 'Caderno' },
    { produto: 'Caneta' }
];

FilterUtils.countValues(vendas, 'produto');
// Retorna: { 'Caneta': 2, 'Caderno': 1 }
```

---

## Exemplos de Uso

### Exemplo 1: Sistema de Validação de Formulário
```html
<form onsubmit="return validarFormulario(event)">
    <input type="text" id="dataNascimento" placeholder="dd/mm/yyyy">
    <button type="submit">Enviar</button>
</form>

<script src="dateUtils.js"></script>
<script>
function validarFormulario(event) {
    event.preventDefault();
    
    const data = document.getElementById('dataNascimento').value;
    
    if (!DateUtils.isValidBRDate(data)) {
        alert('Data inválida! Use o formato dd/mm/yyyy');
        return false;
    }
    
    // Converter para ISO antes de enviar ao servidor
    const dataISO = DateUtils.brToISO(data);
    console.log('Data para enviar:', dataISO);
    
    return true;
}
</script>
```

### Exemplo 2: Tabela com Filtros Múltiplos
```javascript
// Dados
let dados = [
    { nome: 'Ana Silva', idade: 25, cidade: 'São Paulo' },
    { nome: 'Bruno Santos', idade: 30, cidade: 'Rio de Janeiro' },
    { nome: 'Carlos Oliveira', idade: 28, cidade: 'São Paulo' }
];

// Aplicar múltiplos filtros
const filtros = [
    { type: 'text', text: 'silva', fields: ['nome'] },
    { type: 'values', field: 'cidade', values: ['São Paulo'] },
    { type: 'range', field: 'idade', min: 20, max: 26 }
];

const resultado = FilterUtils.applyFilters(dados, filtros);
// Retorna apenas Ana Silva (nome contém 'silva', cidade SP, idade entre 20-26)
```

### Exemplo 3: Relatório com Datas
```javascript
// Calcular período do relatório
const hoje = new Date();
const inicioMes = DateUtils.getFirstDayOfMonth(hoje);
const fimMes = DateUtils.getLastDayOfMonth(hoje);

console.log('Relatório de ' + DateUtils.formatToBR(inicioMes) + 
            ' a ' + DateUtils.formatToBR(fimMes));

// Filtrar vendas do mês
const vendas = [
    { valor: 100, data: '2025-11-05' },
    { valor: 200, data: '2025-11-15' },
    { valor: 150, data: '2025-10-20' }
];

const vendasMes = FilterUtils.filterByDateRange(
    vendas, 
    'data', 
    DateUtils.formatToSQL(inicioMes),
    DateUtils.formatToSQL(fimMes)
);

console.log('Vendas do mês:', vendasMes);
```

### Exemplo 4: Busca Fuzzy (Tolerante a Erros)
```javascript
const produtos = [
    { nome: 'Café Solúvel' },
    { nome: 'Café Moído' },
    { nome: 'Chá Verde' }
];

// Busca sem acentos
FilterUtils.fuzzySearch(produtos, 'cafe soluvel', ['nome']);
// Encontra 'Café Solúvel' mesmo sem acentos
```

### Exemplo 5: Dashboard com Estatísticas
```javascript
const vendas = [
    { vendedor: 'Ana', valor: 1000, regiao: 'Sul' },
    { vendedor: 'Bruno', valor: 1500, regiao: 'Sul' },
    { vendedor: 'Carlos', valor: 2000, regiao: 'Norte' }
];

// Agrupar por região
const porRegiao = FilterUtils.groupBy(vendas, 'regiao');

// Contar vendedores por região
const contagemRegiao = FilterUtils.countValues(vendas, 'regiao');

// Obter regiões únicas
const regioes = FilterUtils.getUniqueValues(vendas, 'regiao');

console.log('Vendas por região:', porRegiao);
console.log('Quantidade por região:', contagemRegiao);
console.log('Regiões:', regioes);
```

---

## Integração com PHP

### Enviar data formatada para PHP
```javascript
// No JavaScript
const data = DateUtils.brToISO('15/11/2025');

fetch('salvar.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: data })
});
```

```php
// No PHP (salvar.php)
<?php
$dados = json_decode(file_get_contents('php://input'), true);
$data = $dados['data']; // "2025-11-15"

// Usar em query SQL Server
$query = "INSERT INTO tabela (data) VALUES (?)";
$stmt = sqlsrv_prepare($conn, $query, array($data));
sqlsrv_execute($stmt);
?>
```

---

## Dicas e Boas Práticas

1. **Sempre valide datas antes de processar**
   ```javascript
   if (DateUtils.isValidBRDate(input)) {
       // Processar...
   }
   ```

2. **Use ISO para armazenar no banco**
   ```javascript
   const dataParaBanco = DateUtils.brToISO(inputUsuario);
   ```

3. **Combine filtros para buscas complexas**
   ```javascript
   let resultado = dados;
   resultado = FilterUtils.filterByText(resultado, busca, ['nome']);
   resultado = FilterUtils.filterByRange(resultado, 'preco', min, max);
   resultado = FilterUtils.sortBy(resultado, 'nome', 'asc');
   ```

4. **Use paginação para grandes volumes**
   ```javascript
   const pagina = FilterUtils.paginate(dados, 1, 20);
   ```

5. **Normalize texto em buscas**
   ```javascript
   const buscaNormalizada = FilterUtils.normalizeText(input);
   ```

---

## Suporte

Para dúvidas ou sugestões, consulte os arquivos:
- `dateUtils.js` - código fonte com comentários
- `filterUtils.js` - código fonte com comentários
- `exemplo-uso.html` - exemplo prático funcionando
