/**
 * Biblioteca de Utilitários para Filtros e Manipulação de Dados
 * Funções reutilizáveis para filtrar, ordenar e manipular arrays e objetos
 */

const FilterUtils = {
    /**
     * Filtra array por texto (busca em múltiplos campos)
     * @param {Array} array - Array a ser filtrado
     * @param {string} searchText - Texto de busca
     * @param {Array} fields - Campos a serem pesquisados
     * @returns {Array} Array filtrado
     */
    filterByText(array, searchText, fields) {
        if (!searchText) return array;
        
        const search = searchText.toLowerCase().trim();
        
        return array.filter(item => {
            return fields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && String(value).toLowerCase().includes(search);
            });
        });
    },

    /**
     * Obtém valor de propriedade aninhada usando notação de ponto
     * @param {Object} obj - Objeto
     * @param {string} path - Caminho da propriedade (ex: 'user.name')
     * @returns {*} Valor da propriedade
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => 
            current && current[prop] !== undefined ? current[prop] : null, obj
        );
    },

    /**
     * Ordena array por campo específico
     * @param {Array} array - Array a ser ordenado
     * @param {string} field - Campo para ordenação
     * @param {string} order - 'asc' ou 'desc'
     * @returns {Array} Array ordenado
     */
    sortBy(array, field, order = 'asc') {
        const sorted = [...array].sort((a, b) => {
            const valueA = this.getNestedValue(a, field);
            const valueB = this.getNestedValue(b, field);
            
            if (valueA === null || valueA === undefined) return 1;
            if (valueB === null || valueB === undefined) return -1;
            
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return valueA.localeCompare(valueB, 'pt-BR');
            }
            
            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
        
        return order === 'desc' ? sorted.reverse() : sorted;
    },

    /**
     * Filtra por intervalo de datas
     * @param {Array} array - Array a ser filtrado
     * @param {string} dateField - Campo da data
     * @param {Date|string} startDate - Data inicial
     * @param {Date|string} endDate - Data final
     * @returns {Array} Array filtrado
     */
    filterByDateRange(array, dateField, startDate, endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        return array.filter(item => {
            const itemDate = new Date(this.getNestedValue(item, dateField));
            
            if (isNaN(itemDate.getTime())) return false;
            
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            
            return true;
        });
    },

    /**
     * Filtra por múltiplos valores em um campo
     * @param {Array} array - Array a ser filtrado
     * @param {string} field - Campo a filtrar
     * @param {Array} values - Valores permitidos
     * @returns {Array} Array filtrado
     */
    filterByValues(array, field, values) {
        if (!values || values.length === 0) return array;
        
        return array.filter(item => {
            const value = this.getNestedValue(item, field);
            return values.includes(value);
        });
    },

    /**
     * Agrupa array por campo
     * @param {Array} array - Array a ser agrupado
     * @param {string} field - Campo para agrupamento
     * @returns {Object} Objeto com grupos
     */
    groupBy(array, field) {
        return array.reduce((groups, item) => {
            const key = this.getNestedValue(item, field);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    },

    /**
     * Remove duplicatas de array baseado em campo
     * @param {Array} array - Array original
     * @param {string} field - Campo para verificar duplicatas
     * @returns {Array} Array sem duplicatas
     */
    removeDuplicates(array, field) {
        const seen = new Set();
        return array.filter(item => {
            const value = this.getNestedValue(item, field);
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    /**
     * Pagina array
     * @param {Array} array - Array a ser paginado
     * @param {number} page - Página atual (começando em 1)
     * @param {number} perPage - Itens por página
     * @returns {Object} Objeto com dados paginados e metadados
     */
    paginate(array, page = 1, perPage = 10) {
        const total = array.length;
        const totalPages = Math.ceil(total / perPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        return {
            data: array.slice(startIndex, endIndex),
            pagination: {
                currentPage,
                perPage,
                total,
                totalPages,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1
            }
        };
    },

    /**
     * Filtra por intervalo numérico
     * @param {Array} array - Array a ser filtrado
     * @param {string} field - Campo numérico
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {Array} Array filtrado
     */
    filterByRange(array, field, min = null, max = null) {
        return array.filter(item => {
            const value = this.getNestedValue(item, field);
            
            if (value === null || value === undefined) return false;
            
            const numValue = Number(value);
            if (isNaN(numValue)) return false;
            
            if (min !== null && numValue < min) return false;
            if (max !== null && numValue > max) return false;
            
            return true;
        });
    },

    /**
     * Aplica múltiplos filtros em sequência
     * @param {Array} array - Array original
     * @param {Array} filters - Array de objetos com tipo e parâmetros de filtro
     * @returns {Array} Array filtrado
     */
    applyFilters(array, filters) {
        let result = [...array];
        
        filters.forEach(filter => {
            switch (filter.type) {
                case 'text':
                    result = this.filterByText(result, filter.text, filter.fields);
                    break;
                case 'dateRange':
                    result = this.filterByDateRange(result, filter.field, filter.start, filter.end);
                    break;
                case 'values':
                    result = this.filterByValues(result, filter.field, filter.values);
                    break;
                case 'range':
                    result = this.filterByRange(result, filter.field, filter.min, filter.max);
                    break;
                case 'sort':
                    result = this.sortBy(result, filter.field, filter.order);
                    break;
            }
        });
        
        return result;
    },

    /**
     * Obtém valores únicos de um campo
     * @param {Array} array - Array original
     * @param {string} field - Campo
     * @returns {Array} Array com valores únicos
     */
    getUniqueValues(array, field) {
        const values = array
            .map(item => this.getNestedValue(item, field))
            .filter(value => value !== null && value !== undefined);
        
        return [...new Set(values)];
    },

    /**
     * Conta ocorrências de valores em um campo
     * @param {Array} array - Array original
     * @param {string} field - Campo
     * @returns {Object} Objeto com contagem de valores
     */
    countValues(array, field) {
        return array.reduce((counts, item) => {
            const value = this.getNestedValue(item, field);
            if (value !== null && value !== undefined) {
                counts[value] = (counts[value] || 0) + 1;
            }
            return counts;
        }, {});
    },

    /**
     * Normaliza texto removendo acentos e caracteres especiais
     * @param {string} text - Texto a normalizar
     * @returns {string} Texto normalizado
     */
    normalizeText(text) {
        if (!text) return '';
        
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    },

    /**
     * Busca fuzzy (tolerante a erros de digitação)
     * @param {Array} array - Array a ser filtrado
     * @param {string} searchText - Texto de busca
     * @param {Array} fields - Campos a pesquisar
     * @returns {Array} Array filtrado
     */
    fuzzySearch(array, searchText, fields) {
        if (!searchText) return array;
        
        const normalized = this.normalizeText(searchText);
        const terms = normalized.split(' ').filter(t => t.length > 0);
        
        return array.filter(item => {
            return fields.some(field => {
                const value = this.normalizeText(this.getNestedValue(item, field));
                return terms.every(term => value.includes(term));
            });
        });
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterUtils;
}
