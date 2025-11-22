/**
 * Biblioteca para Manipulação de Textarea
 * Funções avançadas para trabalhar com textareas (autosize, contador, etc)
 */

const Textarea = {
    /**
     * Auto-resize de textarea conforme conteúdo
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {Object} options - Opções
     */
    autoResize(textarea, options = {}) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const config = {
            minHeight: options.minHeight || 50,
            maxHeight: options.maxHeight || 500,
            extraPadding: options.extraPadding || 0
        };

        const resize = () => {
            el.style.height = 'auto';
            const scrollHeight = el.scrollHeight + config.extraPadding;
            
            if (scrollHeight < config.minHeight) {
                el.style.height = config.minHeight + 'px';
            } else if (scrollHeight > config.maxHeight) {
                el.style.height = config.maxHeight + 'px';
                el.style.overflowY = 'auto';
            } else {
                el.style.height = scrollHeight + 'px';
                el.style.overflowY = 'hidden';
            }
        };

        el.addEventListener('input', resize);
        el.addEventListener('change', resize);
        
        // Resize inicial
        resize();

        return {
            destroy: () => {
                el.removeEventListener('input', resize);
                el.removeEventListener('change', resize);
            }
        };
    },

    /**
     * Contador de caracteres
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {Object} options - Opções
     * @returns {Object} Objeto com método destroy
     */
    charCounter(textarea, options = {}) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const config = {
            maxLength: options.maxLength || null,
            showRemaining: options.showRemaining !== false,
            warningThreshold: options.warningThreshold || 0.9,
            position: options.position || 'bottom', // top, bottom
            className: options.className || 'char-counter'
        };

        // Criar elemento contador
        const counter = document.createElement('div');
        counter.className = config.className;
        counter.style.cssText = `
            font-size: 0.875rem;
            color: #6c757d;
            margin-top: 0.25rem;
        `;

        // Inserir contador
        if (config.position === 'top') {
            el.parentNode.insertBefore(counter, el);
        } else {
            el.parentNode.insertBefore(counter, el.nextSibling);
        }

        // Definir maxlength se configurado
        if (config.maxLength) {
            el.setAttribute('maxlength', config.maxLength);
        }

        const update = () => {
            const length = el.value.length;
            const maxLength = config.maxLength || 
                             parseInt(el.getAttribute('maxlength')) || 
                             Infinity;
            
            let text = `${length}`;
            
            if (maxLength !== Infinity) {
                if (config.showRemaining) {
                    const remaining = maxLength - length;
                    text = `${remaining} caracteres restantes`;
                } else {
                    text = `${length} / ${maxLength}`;
                }

                // Mudar cor se próximo do limite
                if (length >= maxLength * config.warningThreshold) {
                    counter.style.color = '#dc3545';
                } else {
                    counter.style.color = '#6c757d';
                }
            } else {
                text = `${length} caracteres`;
            }

            counter.textContent = text;
        };

        el.addEventListener('input', update);
        el.addEventListener('change', update);
        
        // Update inicial
        update();

        return {
            destroy: () => {
                el.removeEventListener('input', update);
                el.removeEventListener('change', update);
                counter.remove();
            },
            update: update
        };
    },

    /**
     * Contador de palavras
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {HTMLElement|string} target - Elemento onde mostrar contador
     */
    wordCounter(textarea, target = null) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        let counterEl;
        
        if (target) {
            counterEl = typeof target === 'string' ? 
                       document.querySelector(target) : target;
        } else {
            counterEl = document.createElement('div');
            counterEl.className = 'word-counter';
            counterEl.style.cssText = `
                font-size: 0.875rem;
                color: #6c757d;
                margin-top: 0.25rem;
            `;
            el.parentNode.insertBefore(counterEl, el.nextSibling);
        }

        const update = () => {
            const text = el.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            counterEl.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        };

        el.addEventListener('input', update);
        el.addEventListener('change', update);
        
        update();

        return {
            destroy: () => {
                el.removeEventListener('input', update);
                el.removeEventListener('change', update);
                if (!target) counterEl.remove();
            }
        };
    },

    /**
     * Inserir texto na posição do cursor
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {string} text - Texto a inserir
     */
    insertAtCursor(textarea, text) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const startPos = el.selectionStart;
        const endPos = el.selectionEnd;
        const value = el.value;

        el.value = value.substring(0, startPos) + 
                   text + 
                   value.substring(endPos);

        // Posicionar cursor após texto inserido
        el.selectionStart = el.selectionEnd = startPos + text.length;
        el.focus();

        // Disparar evento input
        el.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Envolve texto selecionado com delimitadores
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {string} before - Texto antes
     * @param {string} after - Texto depois
     */
    wrapSelection(textarea, before, after = before) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const startPos = el.selectionStart;
        const endPos = el.selectionEnd;
        const selectedText = el.value.substring(startPos, endPos);
        const value = el.value;

        const newText = before + selectedText + after;

        el.value = value.substring(0, startPos) + 
                   newText + 
                   value.substring(endPos);

        // Selecionar texto modificado
        el.selectionStart = startPos;
        el.selectionEnd = startPos + newText.length;
        el.focus();

        el.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Formatar como lista (adiciona prefixo em cada linha)
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {string} prefix - Prefixo (ex: "- " ou "1. ")
     */
    formatAsList(textarea, prefix = '- ') {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const startPos = el.selectionStart;
        const endPos = el.selectionEnd;
        const selectedText = el.value.substring(startPos, endPos);

        if (!selectedText) return;

        const lines = selectedText.split('\n');
        const formatted = lines.map((line, index) => {
            if (line.trim()) {
                // Se for lista numerada
                if (prefix.includes('#')) {
                    return prefix.replace('#', index + 1) + line;
                }
                return prefix + line;
            }
            return line;
        }).join('\n');

        const value = el.value;
        el.value = value.substring(0, startPos) + 
                   formatted + 
                   value.substring(endPos);

        el.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Indentação de texto
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {boolean} unindent - Se true, remove indentação
     */
    indent(textarea, unindent = false) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const startPos = el.selectionStart;
        const endPos = el.selectionEnd;
        const value = el.value;

        // Encontrar início da linha
        let lineStart = startPos;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }

        // Encontrar fim da linha
        let lineEnd = endPos;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }

        const selectedLines = value.substring(lineStart, lineEnd);
        const lines = selectedLines.split('\n');

        const processedLines = lines.map(line => {
            if (unindent) {
                // Remover indentação (até 4 espaços ou 1 tab)
                return line.replace(/^(\t|    )/, '');
            } else {
                // Adicionar indentação (4 espaços)
                return '    ' + line;
            }
        });

        el.value = value.substring(0, lineStart) + 
                   processedLines.join('\n') + 
                   value.substring(lineEnd);

        el.dispatchEvent(new Event('input', { bubbles: true }));
    },

    /**
     * Suporte a atalhos de teclado
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {Object} shortcuts - Mapa de atalhos
     */
    addShortcuts(textarea, shortcuts = {}) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const defaultShortcuts = {
            'Ctrl+B': () => this.wrapSelection(el, '**'), // Negrito
            'Ctrl+I': () => this.wrapSelection(el, '_'),  // Itálico
            'Ctrl+U': () => this.wrapSelection(el, '__'), // Sublinhado
            'Tab': (e) => {
                e.preventDefault();
                this.insertAtCursor(el, '    '); // 4 espaços
            },
            'Shift+Tab': (e) => {
                e.preventDefault();
                this.indent(el, true);
            }
        };

        const allShortcuts = { ...defaultShortcuts, ...shortcuts };

        const handleKeyDown = (e) => {
            const key = [];
            
            if (e.ctrlKey) key.push('Ctrl');
            if (e.shiftKey) key.push('Shift');
            if (e.altKey) key.push('Alt');
            key.push(e.key);

            const combo = key.join('+');

            if (allShortcuts[combo]) {
                const result = allShortcuts[combo](e, el);
                if (result !== false) {
                    e.preventDefault();
                }
            }
        };

        el.addEventListener('keydown', handleKeyDown);

        return {
            destroy: () => {
                el.removeEventListener('keydown', handleKeyDown);
            }
        };
    },

    /**
     * Toolbar de formatação para textarea
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {Object} options - Opções da toolbar
     */
    createToolbar(textarea, options = {}) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        const config = {
            buttons: options.buttons || [
                'bold', 'italic', 'underline', '|',
                'list-ul', 'list-ol', '|',
                'link', 'image'
            ],
            className: options.className || 'textarea-toolbar'
        };

        const toolbar = document.createElement('div');
        toolbar.className = config.className;
        toolbar.style.cssText = `
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f8f9fa;
        `;

        const buttonActions = {
            'bold': () => this.wrapSelection(el, '**'),
            'italic': () => this.wrapSelection(el, '_'),
            'underline': () => this.wrapSelection(el, '__'),
            'list-ul': () => this.formatAsList(el, '- '),
            'list-ol': () => this.formatAsList(el, '#. '),
            'link': () => {
                const url = prompt('URL do link:');
                if (url) this.wrapSelection(el, '[', `](${url})`);
            },
            'image': () => {
                const url = prompt('URL da imagem:');
                if (url) this.insertAtCursor(el, `![alt](${url})`);
            },
            'code': () => this.wrapSelection(el, '`'),
            'quote': () => this.formatAsList(el, '> ')
        };

        config.buttons.forEach(btn => {
            if (btn === '|') {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    width: 1px;
                    background: #ddd;
                    margin: 0 5px;
                `;
                toolbar.appendChild(separator);
            } else {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-sm btn-outline-secondary';
                button.innerHTML = `<i class="bi bi-type-${btn}"></i>`;
                button.title = btn;
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (buttonActions[btn]) {
                        buttonActions[btn]();
                    }
                });
                
                toolbar.appendChild(button);
            }
        });

        el.parentNode.insertBefore(toolbar, el);

        return {
            destroy: () => {
                toolbar.remove();
            }
        };
    },

    /**
     * Preview de Markdown
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {HTMLElement|string} previewElement - Elemento de preview
     */
    markdownPreview(textarea, previewElement) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        const preview = typeof previewElement === 'string' ? 
                       document.querySelector(previewElement) : previewElement;
        
        if (!el || !preview) return;

        const update = () => {
            let html = el.value
                // Headers
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Italic
                .replace(/\_(.*?)\_/g, '<em>$1</em>')
                // Links
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                // Line breaks
                .replace(/\n/g, '<br>');
            
            preview.innerHTML = html;
        };

        el.addEventListener('input', update);
        el.addEventListener('change', update);
        
        update();

        return {
            destroy: () => {
                el.removeEventListener('input', update);
                el.removeEventListener('change', update);
            }
        };
    },

    /**
     * Salvar automaticamente
     * @param {HTMLTextAreaElement|string} textarea - Textarea ou seletor
     * @param {string} storageKey - Chave no localStorage
     * @param {number} delay - Delay em ms
     */
    autoSave(textarea, storageKey, delay = 1000) {
        const el = typeof textarea === 'string' ? 
                   document.querySelector(textarea) : textarea;
        
        if (!el) return;

        let timeout;

        // Restaurar conteúdo salvo
        const saved = localStorage.getItem(storageKey);
        if (saved && !el.value) {
            el.value = saved;
        }

        const save = () => {
            localStorage.setItem(storageKey, el.value);
        };

        const debouncedSave = () => {
            clearTimeout(timeout);
            timeout = setTimeout(save, delay);
        };

        el.addEventListener('input', debouncedSave);

        return {
            destroy: () => {
                el.removeEventListener('input', debouncedSave);
                clearTimeout(timeout);
            },
            clear: () => {
                localStorage.removeItem(storageKey);
            }
        };
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Textarea;
}
