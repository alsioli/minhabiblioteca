/**
 * Biblioteca de Manipulação HTML/DOM
 * Funções para criar, manipular e trabalhar com elementos HTML
 */

const HTML = {
    /**
     * Cria elemento HTML com atributos e conteúdo
     * @param {string} tag - Tag HTML
     * @param {Object} attrs - Atributos
     * @param {string|HTMLElement|Array} content - Conteúdo
     * @returns {HTMLElement} Elemento criado
     */
    create(tag, attrs = {}, content = null) {
        const element = document.createElement(tag);
        
        // Adicionar atributos
        Object.keys(attrs).forEach(key => {
            if (key === 'className') {
                element.className = attrs[key];
            } else if (key === 'style' && typeof attrs[key] === 'object') {
                Object.assign(element.style, attrs[key]);
            } else if (key.startsWith('on') && typeof attrs[key] === 'function') {
                const event = key.substring(2).toLowerCase();
                element.addEventListener(event, attrs[key]);
            } else {
                element.setAttribute(key, attrs[key]);
            }
        });
        
        // Adicionar conteúdo
        if (content !== null) {
            this.setContent(element, content);
        }
        
        return element;
    },

    /**
     * Define conteúdo de um elemento
     * @param {HTMLElement} element - Elemento
     * @param {string|HTMLElement|Array} content - Conteúdo
     */
    setContent(element, content) {
        // Limpar conteúdo anterior
        element.innerHTML = '';
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.appendChild(document.createTextNode(item));
                } else if (item instanceof HTMLElement) {
                    element.appendChild(item);
                }
            });
        } else if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }
    },

    /**
     * Seleciona elemento(s) do DOM
     * @param {string} selector - Seletor CSS
     * @param {HTMLElement} context - Contexto (padrão: document)
     * @returns {HTMLElement|null} Elemento encontrado
     */
    select(selector, context = document) {
        return context.querySelector(selector);
    },

    /**
     * Seleciona múltiplos elementos do DOM
     * @param {string} selector - Seletor CSS
     * @param {HTMLElement} context - Contexto
     * @returns {Array} Array de elementos
     */
    selectAll(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Adiciona classe(s) a um elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string|Array} classes - Classe(s)
     */
    addClass(element, classes) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        const classList = Array.isArray(classes) ? classes : [classes];
        el.classList.add(...classList);
    },

    /**
     * Remove classe(s) de um elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string|Array} classes - Classe(s)
     */
    removeClass(element, classes) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        const classList = Array.isArray(classes) ? classes : [classes];
        el.classList.remove(...classList);
    },

    /**
     * Alterna classe(s) em um elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} className - Classe
     * @returns {boolean} True se classe foi adicionada
     */
    toggleClass(element, className) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return false;
        
        return el.classList.toggle(className);
    },

    /**
     * Verifica se elemento tem classe
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} className - Classe
     * @returns {boolean} True se tem a classe
     */
    hasClass(element, className) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return false;
        
        return el.classList.contains(className);
    },

    /**
     * Mostra elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} display - Tipo de display (padrão: block)
     */
    show(element, display = 'block') {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.style.display = display;
    },

    /**
     * Esconde elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     */
    hide(element) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.style.display = 'none';
    },

    /**
     * Alterna visibilidade de elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} display - Tipo de display quando visível
     */
    toggle(element, display = 'block') {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        if (el.style.display === 'none') {
            el.style.display = display;
        } else {
            el.style.display = 'none';
        }
    },

    /**
     * Remove elemento do DOM
     * @param {HTMLElement|string} element - Elemento ou seletor
     */
    remove(element) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.remove();
    },

    /**
     * Insere HTML em elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} position - Posição (beforebegin, afterbegin, beforeend, afterend)
     * @param {string} html - HTML a inserir
     */
    insertHTML(element, position, html) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.insertAdjacentHTML(position, html);
    },

    /**
     * Adiciona elemento como filho
     * @param {HTMLElement|string} parent - Elemento pai
     * @param {HTMLElement} child - Elemento filho
     */
    append(parent, child) {
        const el = typeof parent === 'string' ? this.select(parent) : parent;
        if (!el) return;
        
        el.appendChild(child);
    },

    /**
     * Adiciona elemento como primeiro filho
     * @param {HTMLElement|string} parent - Elemento pai
     * @param {HTMLElement} child - Elemento filho
     */
    prepend(parent, child) {
        const el = typeof parent === 'string' ? this.select(parent) : parent;
        if (!el) return;
        
        el.insertBefore(child, el.firstChild);
    },

    /**
     * Limpa conteúdo de elemento
     * @param {HTMLElement|string} element - Elemento ou seletor
     */
    empty(element) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.innerHTML = '';
    },

    /**
     * Obtém/define atributo
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} name - Nome do atributo
     * @param {string} value - Valor (opcional, para definir)
     * @returns {string|null} Valor do atributo
     */
    attr(element, name, value = undefined) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return null;
        
        if (value === undefined) {
            return el.getAttribute(name);
        } else {
            el.setAttribute(name, value);
            return value;
        }
    },

    /**
     * Remove atributo
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} name - Nome do atributo
     */
    removeAttr(element, name) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.removeAttribute(name);
    },

    /**
     * Obtém/define dado (data-attribute)
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} key - Chave do dado
     * @param {any} value - Valor (opcional)
     * @returns {any} Valor do dado
     */
    data(element, key, value = undefined) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return null;
        
        if (value === undefined) {
            return el.dataset[key];
        } else {
            el.dataset[key] = value;
            return value;
        }
    },

    /**
     * Define múltiplos estilos CSS
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {Object} styles - Objeto com estilos
     */
    css(element, styles) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        Object.assign(el.style, styles);
    },

    /**
     * Adiciona event listener
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} event - Nome do evento
     * @param {Function} handler - Função handler
     * @param {Object} options - Opções do evento
     */
    on(element, event, handler, options = {}) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.addEventListener(event, handler, options);
    },

    /**
     * Remove event listener
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} event - Nome do evento
     * @param {Function} handler - Função handler
     */
    off(element, event, handler) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return;
        
        el.removeEventListener(event, handler);
    },

    /**
     * Delegação de eventos
     * @param {HTMLElement|string} parent - Elemento pai
     * @param {string} selector - Seletor dos filhos
     * @param {string} event - Nome do evento
     * @param {Function} handler - Função handler
     */
    delegate(parent, selector, event, handler) {
        const el = typeof parent === 'string' ? this.select(parent) : parent;
        if (!el) return;
        
        el.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target && el.contains(target)) {
                handler.call(target, e);
            }
        });
    },

    /**
     * Cria tabela HTML
     * @param {Array} data - Array de objetos com dados
     * @param {Array} columns - Array de colunas {key, label}
     * @param {Object} options - Opções da tabela
     * @returns {HTMLElement} Tabela criada
     */
    createTable(data, columns, options = {}) {
        const table = this.create('table', {
            className: options.className || 'table'
        });
        
        // Cabeçalho
        const thead = this.create('thead');
        const headerRow = this.create('tr');
        
        columns.forEach(col => {
            const th = this.create('th', {}, col.label || col.key);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Corpo
        const tbody = this.create('tbody');
        
        data.forEach(row => {
            const tr = this.create('tr');
            
            columns.forEach(col => {
                const td = this.create('td');
                const value = row[col.key];
                
                if (col.render && typeof col.render === 'function') {
                    const rendered = col.render(value, row);
                    if (typeof rendered === 'string') {
                        td.innerHTML = rendered;
                    } else {
                        td.appendChild(rendered);
                    }
                } else {
                    td.textContent = value;
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        return table;
    },

    /**
     * Cria lista (ul/ol)
     * @param {Array} items - Array de itens
     * @param {boolean} ordered - Se é lista ordenada
     * @param {Object} options - Opções
     * @returns {HTMLElement} Lista criada
     */
    createList(items, ordered = false, options = {}) {
        const list = this.create(ordered ? 'ol' : 'ul', {
            className: options.className || ''
        });
        
        items.forEach(item => {
            const li = this.create('li', {}, 
                typeof item === 'string' ? item : item.text
            );
            
            if (typeof item === 'object' && item.className) {
                li.className = item.className;
            }
            
            list.appendChild(li);
        });
        
        return list;
    },

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Desfaz escape de HTML
     * @param {string} html - HTML escapado
     * @returns {string} Texto original
     */
    unescape(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    },

    /**
     * Serializa formulário para objeto
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @returns {Object} Objeto com dados do formulário
     */
    serializeForm(form) {
        const el = typeof form === 'string' ? this.select(form) : form;
        if (!el) return {};
        
        const formData = new FormData(el);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Se já existe, transforma em array
            if (data.hasOwnProperty(key)) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    },

    /**
     * Preenche formulário com dados
     * @param {HTMLFormElement|string} form - Formulário ou seletor
     * @param {Object} data - Dados para preencher
     */
    fillForm(form, data) {
        const el = typeof form === 'string' ? this.select(form) : form;
        if (!el) return;
        
        Object.keys(data).forEach(key => {
            const input = el.elements[key];
            if (!input) return;
            
            if (input.type === 'checkbox') {
                input.checked = !!data[key];
            } else if (input.type === 'radio') {
                const radio = el.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                input.value = data[key];
            }
        });
    },

    /**
     * Obtém posição do elemento na página
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @returns {Object} {top, left, width, height}
     */
    getPosition(element) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return null;
        
        const rect = el.getBoundingClientRect();
        
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    },

    /**
     * Verifica se elemento está visível no viewport
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @returns {boolean} True se visível
     */
    isInViewport(element) {
        const el = typeof element === 'string' ? this.select(element) : element;
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTML;
}
