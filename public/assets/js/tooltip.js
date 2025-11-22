/**
 * Biblioteca de Tooltips e Popovers
 * Funções para criar e gerenciar tooltips, popovers e dicas contextuais
 */

const Tooltip = {
    /**
     * Inicializa tooltips Bootstrap em elementos
     * @param {string|HTMLElement} selector - Seletor ou elemento
     * @param {Object} options - Opções do tooltip
     */
    init(selector = '[data-bs-toggle="tooltip"]', options = {}) {
        const elements = typeof selector === 'string' ? 
                        document.querySelectorAll(selector) : 
                        [selector];
        
        const tooltips = [];
        
        elements.forEach(el => {
            const tooltip = new bootstrap.Tooltip(el, {
                trigger: 'hover',
                placement: 'top',
                ...options
            });
            tooltips.push(tooltip);
        });
        
        return tooltips;
    },

    /**
     * Cria tooltip programaticamente
     * @param {HTMLElement|string} element - Elemento ou seletor
     * @param {string} content - Conteúdo do tooltip
     * @param {Object} options - Opções
     * @returns {Object} Instância do tooltip
     */
    create(element, content, options = {}) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return null;

        const config = {
            title: content,
            placement: options.placement || 'top',
            trigger: options.trigger || 'hover',
            html: options.html || false,
            animation: options.animation !== false,
            delay: options.delay || 0,
            ...options
        };

        const tooltip = new bootstrap.Tooltip(el, config);

        return {
            show: () => tooltip.show(),
            hide: () => tooltip.hide(),
            toggle: () => tooltip.toggle(),
            dispose: () => tooltip.dispose(),
            enable: () => tooltip.enable(),
            disable: () => tooltip.disable(),
            update: () => tooltip.update(),
            setContent: (newContent) => {
                tooltip.setContent({ '.tooltip-inner': newContent });
            }
        };
    },

    /**
     * Tooltip com HTML customizado
     * @param {HTMLElement|string} element - Elemento
     * @param {string} htmlContent - Conteúdo HTML
     * @param {Object} options - Opções
     * @returns {Object} Instância do tooltip
     */
    html(element, htmlContent, options = {}) {
        return this.create(element, htmlContent, {
            ...options,
            html: true
        });
    },

    /**
     * Tooltip de confirmação
     * @param {HTMLElement|string} element - Elemento
     * @param {string} message - Mensagem
     * @param {Function} onConfirm - Callback ao confirmar
     * @param {Object} options - Opções
     */
    confirm(element, message, onConfirm, options = {}) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return;

        const confirmHTML = `
            <div class="tooltip-confirm">
                <p class="mb-2">${message}</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-danger tooltip-confirm-yes">Sim</button>
                    <button class="btn btn-sm btn-secondary tooltip-confirm-no">Não</button>
                </div>
            </div>
        `;

        const popover = new bootstrap.Popover(el, {
            content: confirmHTML,
            html: true,
            trigger: 'manual',
            placement: options.placement || 'top',
            ...options
        });

        // Mostrar popover
        el.addEventListener('click', (e) => {
            e.preventDefault();
            popover.show();

            // Event listeners para botões
            setTimeout(() => {
                const yesBtn = document.querySelector('.tooltip-confirm-yes');
                const noBtn = document.querySelector('.tooltip-confirm-no');

                if (yesBtn) {
                    yesBtn.addEventListener('click', () => {
                        popover.hide();
                        if (onConfirm) onConfirm(el);
                    });
                }

                if (noBtn) {
                    noBtn.addEventListener('click', () => {
                        popover.hide();
                    });
                }
            }, 100);
        });

        return {
            show: () => popover.show(),
            hide: () => popover.hide(),
            dispose: () => popover.dispose()
        };
    },

    /**
     * Tooltip com ícone de ajuda
     * @param {string} content - Conteúdo da ajuda
     * @param {Object} options - Opções
     * @returns {HTMLElement} Elemento do ícone
     */
    helpIcon(content, options = {}) {
        const icon = document.createElement('i');
        icon.className = options.iconClass || 'bi bi-question-circle text-muted ms-1';
        icon.style.cursor = 'pointer';

        this.create(icon, content, {
            placement: 'right',
            html: true,
            ...options
        });

        return icon;
    },

    /**
     * Tooltip de erro/validação
     * @param {HTMLElement|string} element - Campo de formulário
     * @param {string} message - Mensagem de erro
     * @param {Object} options - Opções
     */
    error(element, message, options = {}) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return;

        // Adicionar classe de erro
        el.classList.add('is-invalid');

        const tooltip = this.create(el, message, {
            placement: 'right',
            trigger: 'manual',
            customClass: 'tooltip-error',
            ...options
        });

        tooltip.show();

        // Auto-hide ao corrigir
        const hideOnInput = () => {
            el.classList.remove('is-invalid');
            tooltip.hide();
            el.removeEventListener('input', hideOnInput);
        };

        el.addEventListener('input', hideOnInput);

        return tooltip;
    },

    /**
     * Tooltip de sucesso
     * @param {HTMLElement|string} element - Elemento
     * @param {string} message - Mensagem
     * @param {number} duration - Duração em ms
     */
    success(element, message, duration = 2000) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return;

        const tooltip = this.create(el, `✓ ${message}`, {
            placement: 'top',
            trigger: 'manual',
            customClass: 'tooltip-success'
        });

        tooltip.show();

        setTimeout(() => {
            tooltip.hide();
            setTimeout(() => tooltip.dispose(), 300);
        }, duration);
    },

    /**
     * Popover (tooltip mais elaborado)
     * @param {HTMLElement|string} element - Elemento
     * @param {Object} config - Configuração do popover
     * @returns {Object} Instância do popover
     */
    popover(element, config = {}) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return null;

        const options = {
            title: config.title || '',
            content: config.content || '',
            placement: config.placement || 'right',
            trigger: config.trigger || 'click',
            html: config.html || false,
            ...config
        };

        const popover = new bootstrap.Popover(el, options);

        return {
            show: () => popover.show(),
            hide: () => popover.hide(),
            toggle: () => popover.toggle(),
            dispose: () => popover.dispose(),
            enable: () => popover.enable(),
            disable: () => popover.disable(),
            update: () => popover.update()
        };
    },

    /**
     * Popover com formulário
     * @param {HTMLElement|string} element - Elemento
     * @param {Object} config - Configuração
     * @returns {Object} Instância do popover
     */
    popoverForm(element, config = {}) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return null;

        const formId = `popover-form-${Date.now()}`;
        
        let formHTML = `<form id="${formId}" class="p-2" style="min-width: 250px;">`;
        
        if (config.fields) {
            config.fields.forEach(field => {
                formHTML += `
                    <div class="mb-2">
                        <label class="form-label small">${field.label}</label>
                        <input type="${field.type || 'text'}" 
                               name="${field.name}" 
                               class="form-control form-control-sm"
                               ${field.required ? 'required' : ''}>
                    </div>
                `;
            });
        }

        formHTML += `
            <div class="d-flex gap-2 mt-2">
                <button type="submit" class="btn btn-sm btn-primary flex-fill">
                    ${config.submitText || 'Enviar'}
                </button>
                <button type="button" class="btn btn-sm btn-secondary popover-cancel">
                    Cancelar
                </button>
            </div>
        </form>`;

        const popover = new bootstrap.Popover(el, {
            title: config.title || '',
            content: formHTML,
            html: true,
            trigger: 'manual',
            placement: config.placement || 'bottom'
        });

        el.addEventListener('click', () => {
            popover.show();

            setTimeout(() => {
                const form = document.getElementById(formId);
                const cancelBtn = document.querySelector('.popover-cancel');

                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        
                        if (config.onSubmit) {
                            config.onSubmit(data);
                        }
                        
                        popover.hide();
                    });
                }

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        popover.hide();
                    });
                }
            }, 100);
        });

        return {
            show: () => popover.show(),
            hide: () => popover.hide(),
            dispose: () => popover.dispose()
        };
    },

    /**
     * Tooltip contextual (mostra ao clicar com botão direito)
     * @param {HTMLElement|string} element - Elemento
     * @param {Array} items - Itens do menu
     */
    contextMenu(element, items = []) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return;

        let menuHTML = '<div class="list-group">';
        
        items.forEach(item => {
            if (item.divider) {
                menuHTML += '<hr class="my-1">';
            } else {
                menuHTML += `
                    <a href="#" class="list-group-item list-group-item-action py-2 context-menu-item" 
                       data-action="${item.action || ''}">
                        ${item.icon ? `<i class="${item.icon} me-2"></i>` : ''}
                        ${item.text}
                    </a>
                `;
            }
        });
        
        menuHTML += '</div>';

        const popover = new bootstrap.Popover(el, {
            content: menuHTML,
            html: true,
            trigger: 'manual',
            placement: 'right'
        });

        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            popover.show();

            setTimeout(() => {
                const menuItems = document.querySelectorAll('.context-menu-item');
                
                menuItems.forEach(menuItem => {
                    menuItem.addEventListener('click', (e) => {
                        e.preventDefault();
                        const action = e.currentTarget.dataset.action;
                        
                        const item = items.find(i => i.action === action);
                        if (item && item.onClick) {
                            item.onClick(el);
                        }
                        
                        popover.hide();
                    });
                });

                // Fechar ao clicar fora
                document.addEventListener('click', function closeMenu(e) {
                    if (!e.target.closest('.popover')) {
                        popover.hide();
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 100);
        });
    },

    /**
     * Tooltip com delay customizado
     * @param {HTMLElement|string} element - Elemento
     * @param {string} content - Conteúdo
     * @param {number} showDelay - Delay para mostrar (ms)
     * @param {number} hideDelay - Delay para esconder (ms)
     */
    delayed(element, content, showDelay = 500, hideDelay = 100) {
        return this.create(element, content, {
            delay: {
                show: showDelay,
                hide: hideDelay
            }
        });
    },

    /**
     * Tooltip que segue o mouse
     * @param {HTMLElement|string} element - Elemento
     * @param {string} content - Conteúdo
     */
    followMouse(element, content) {
        const el = typeof element === 'string' ? 
                   document.querySelector(element) : element;
        
        if (!el) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip bs-tooltip-auto fade';
        tooltip.innerHTML = `
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">${content}</div>
        `;
        tooltip.style.position = 'fixed';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '9999';

        const showTooltip = (e) => {
            document.body.appendChild(tooltip);
            tooltip.classList.add('show');
            updatePosition(e);
        };

        const hideTooltip = () => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 150);
        };

        const updatePosition = (e) => {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
        };

        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('mousemove', updatePosition);

        return {
            destroy: () => {
                el.removeEventListener('mouseenter', showTooltip);
                el.removeEventListener('mouseleave', hideTooltip);
                el.removeEventListener('mousemove', updatePosition);
                hideTooltip();
            }
        };
    },

    /**
     * Destroi todos os tooltips de um container
     * @param {HTMLElement|string} container - Container
     */
    destroyAll(container = document) {
        const cont = typeof container === 'string' ? 
                    document.querySelector(container) : container;
        
        const tooltips = cont.querySelectorAll('[data-bs-toggle="tooltip"]');
        
        tooltips.forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) {
                tooltip.dispose();
            }
        });

        const popovers = cont.querySelectorAll('[data-bs-toggle="popover"]');
        
        popovers.forEach(el => {
            const popover = bootstrap.Popover.getInstance(el);
            if (popover) {
                popover.dispose();
            }
        });
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tooltip;
}
