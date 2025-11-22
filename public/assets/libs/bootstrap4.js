/**
 * Biblioteca Bootstrap 4 Wrapper
 * Funções helpers para componentes Bootstrap 4
 * Versão: 4.6.2
 */

const BS4 = {
    version: '4.6.2',
    
    /**
     * ALERTS - Alertas e mensagens
     */
    Alert: {
        /**
         * Cria um alerta
         * @param {string} message - Mensagem
         * @param {string} type - Tipo (primary, secondary, success, danger, warning, info, light, dark)
         * @param {Object} options - Opções
         * @returns {HTMLElement} Elemento do alerta
         */
        create(message, type = 'primary', options = {}) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.setAttribute('role', 'alert');
            
            if (options.dismissible) {
                alert.classList.add('alert-dismissible', 'fade', 'show');
                alert.innerHTML = `
                    ${options.icon ? `<i class="${options.icon} mr-2"></i>` : ''}
                    ${message}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                `;
            } else {
                alert.innerHTML = `${options.icon ? `<i class="${options.icon} mr-2"></i>` : ''}${message}`;
            }
            
            if (options.container) {
                const container = typeof options.container === 'string' ? 
                                document.querySelector(options.container) : options.container;
                container.appendChild(alert);
            }
            
            // Auto-dismiss
            if (options.autoDismiss) {
                setTimeout(() => {
                    $(alert).alert('close');
                }, options.autoDismiss);
            }
            
            return alert;
        },

        success(message, options = {}) {
            return this.create(message, 'success', {
                icon: 'fa fa-check-circle',
                ...options
            });
        },

        error(message, options = {}) {
            return this.create(message, 'danger', {
                icon: 'fa fa-exclamation-circle',
                ...options
            });
        },

        warning(message, options = {}) {
            return this.create(message, 'warning', {
                icon: 'fa fa-exclamation-triangle',
                ...options
            });
        },

        info(message, options = {}) {
            return this.create(message, 'info', {
                icon: 'fa fa-info-circle',
                ...options
            });
        }
    },

    /**
     * BADGES - Crachás e etiquetas
     */
    Badge: {
        create(text, type = 'primary', options = {}) {
            const badge = document.createElement('span');
            badge.className = `badge badge-${type}`;
            
            if (options.pill) {
                badge.classList.add('badge-pill');
            }
            
            badge.textContent = text;
            
            return badge;
        }
    },

    /**
     * BUTTONS - Botões
     */
    Button: {
        create(text, type = 'primary', options = {}) {
            const button = document.createElement('button');
            button.type = options.type || 'button';
            button.className = `btn btn-${type}`;
            
            if (options.size) {
                button.classList.add(`btn-${options.size}`); // sm, lg
            }
            
            if (options.outline) {
                button.classList.remove(`btn-${type}`);
                button.classList.add(`btn-outline-${type}`);
            }
            
            if (options.block) {
                button.classList.add('btn-block');
            }
            
            if (options.disabled) {
                button.disabled = true;
            }
            
            if (options.icon) {
                button.innerHTML = `<i class="${options.icon}"></i> ${text}`;
            } else {
                button.textContent = text;
            }
            
            if (options.onClick) {
                button.addEventListener('click', options.onClick);
            }
            
            return button;
        },

        group(buttons, options = {}) {
            const group = document.createElement('div');
            group.className = 'btn-group';
            group.setAttribute('role', 'group');
            
            if (options.vertical) {
                group.classList.add('btn-group-vertical');
            }
            
            if (options.size) {
                group.classList.add(`btn-group-${options.size}`);
            }
            
            buttons.forEach(btn => {
                group.appendChild(btn);
            });
            
            return group;
        }
    },

    /**
     * CARDS - Cartões
     */
    Card: {
        create(options = {}) {
            const card = document.createElement('div');
            card.className = 'card';
            
            if (options.className) {
                card.className += ' ' + options.className;
            }
            
            // Header
            if (options.header) {
                const header = document.createElement('div');
                header.className = 'card-header';
                header.innerHTML = options.header;
                card.appendChild(header);
            }
            
            // Image
            if (options.image) {
                const img = document.createElement('img');
                img.src = options.image;
                img.className = 'card-img-top';
                img.alt = options.imageAlt || '';
                card.appendChild(img);
            }
            
            // Body
            const body = document.createElement('div');
            body.className = 'card-body';
            
            if (options.title) {
                const title = document.createElement('h5');
                title.className = 'card-title';
                title.textContent = options.title;
                body.appendChild(title);
            }
            
            if (options.subtitle) {
                const subtitle = document.createElement('h6');
                subtitle.className = 'card-subtitle mb-2 text-muted';
                subtitle.textContent = options.subtitle;
                body.appendChild(subtitle);
            }
            
            if (options.text) {
                const text = document.createElement('p');
                text.className = 'card-text';
                text.innerHTML = options.text;
                body.appendChild(text);
            }
            
            if (options.content) {
                if (typeof options.content === 'string') {
                    body.innerHTML += options.content;
                } else {
                    body.appendChild(options.content);
                }
            }
            
            card.appendChild(body);
            
            // Footer
            if (options.footer) {
                const footer = document.createElement('div');
                footer.className = 'card-footer';
                footer.innerHTML = options.footer;
                card.appendChild(footer);
            }
            
            return card;
        }
    },

    /**
     * COLLAPSE - Recolhível
     */
    Collapse: {
        create(targetId, options = {}) {
            const element = document.getElementById(targetId);
            if (!element) return null;
            
            if (options.show) {
                $(element).collapse('show');
            }
            
            return {
                show: () => $(element).collapse('show'),
                hide: () => $(element).collapse('hide'),
                toggle: () => $(element).collapse('toggle')
            };
        }
    },

    /**
     * DROPDOWN - Menu suspenso
     */
    Dropdown: {
        create(buttonText, items, options = {}) {
            const div = document.createElement('div');
            div.className = options.dropup ? 'dropup' : 'dropdown';
            
            // Botão
            const button = document.createElement('button');
            button.className = `btn btn-${options.buttonType || 'secondary'} dropdown-toggle`;
            button.type = 'button';
            button.setAttribute('data-toggle', 'dropdown');
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.textContent = buttonText;
            
            if (options.buttonSize) {
                button.classList.add(`btn-${options.buttonSize}`);
            }
            
            div.appendChild(button);
            
            // Menu
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            
            if (options.menuAlign === 'right') {
                menu.classList.add('dropdown-menu-right');
            }
            
            items.forEach(item => {
                if (item.divider) {
                    const divider = document.createElement('div');
                    divider.className = 'dropdown-divider';
                    menu.appendChild(divider);
                } else if (item.header) {
                    const header = document.createElement('h6');
                    header.className = 'dropdown-header';
                    header.textContent = item.header;
                    menu.appendChild(header);
                } else {
                    const a = document.createElement('a');
                    a.className = 'dropdown-item';
                    a.href = item.href || '#';
                    
                    if (item.icon) {
                        a.innerHTML = `<i class="${item.icon} mr-2"></i>${item.text}`;
                    } else {
                        a.textContent = item.text;
                    }
                    
                    if (item.onClick) {
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            item.onClick(e);
                        });
                    }
                    
                    if (item.active) {
                        a.classList.add('active');
                    }
                    
                    if (item.disabled) {
                        a.classList.add('disabled');
                    }
                    
                    menu.appendChild(a);
                }
            });
            
            div.appendChild(menu);
            
            return div;
        }
    },

    /**
     * MODAL - Modais
     */
    Modal: {
        create(options = {}) {
            const modalId = options.id || `modal-${Date.now()}`;
            
            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" 
                     aria-labelledby="${modalId}Label" aria-hidden="true"
                     data-backdrop="${options.backdrop !== false ? 'true' : 'static'}"
                     data-keyboard="${options.keyboard !== false}">
                    <div class="modal-dialog ${options.size ? 'modal-' + options.size : ''} 
                                ${options.centered ? 'modal-dialog-centered' : ''}" 
                         role="document">
                        <div class="modal-content">
                            ${options.header !== false ? `
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${modalId}Label">${options.title || ''}</h5>
                                    ${options.closeButton !== false ? 
                                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' 
                                        : ''}
                                </div>
                            ` : ''}
                            <div class="modal-body">
                                ${options.body || ''}
                            </div>
                            ${options.footer ? `
                                <div class="modal-footer">
                                    ${options.footer}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modalElement = document.getElementById(modalId);
            
            return {
                element: modalElement,
                show: () => $(modalElement).modal('show'),
                hide: () => $(modalElement).modal('hide'),
                toggle: () => $(modalElement).modal('toggle'),
                dispose: () => {
                    $(modalElement).modal('dispose');
                    modalElement.remove();
                }
            };
        }
    },

    /**
     * TOAST - Notificações (BS4 não tem toast nativo, usando alerts)
     */
    Toast: {
        container: null,

        init(containerId = 'toast-container') {
            if (!this.container) {
                this.container = document.getElementById(containerId);
                
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = containerId;
                    this.container.className = 'position-fixed';
                    this.container.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
                    document.body.appendChild(this.container);
                }
            }
        },

        create(message, options = {}) {
            this.init();
            
            const alert = BS4.Alert.create(message, options.type || 'info', {
                dismissible: true,
                icon: options.icon
            });
            
            alert.style.marginBottom = '10px';
            this.container.appendChild(alert);
            
            if (options.autohide !== false) {
                setTimeout(() => {
                    $(alert).alert('close');
                }, options.delay || 5000);
            }
            
            return alert;
        },

        success(message, title = 'Sucesso') {
            return this.create(`<strong>${title}</strong><br>${message}`, {
                type: 'success',
                icon: 'fa fa-check-circle'
            });
        },

        error(message, title = 'Erro') {
            return this.create(`<strong>${title}</strong><br>${message}`, {
                type: 'danger',
                icon: 'fa fa-exclamation-circle'
            });
        },

        warning(message, title = 'Atenção') {
            return this.create(`<strong>${title}</strong><br>${message}`, {
                type: 'warning',
                icon: 'fa fa-exclamation-triangle'
            });
        },

        info(message, title = 'Informação') {
            return this.create(`<strong>${title}</strong><br>${message}`, {
                type: 'info',
                icon: 'fa fa-info-circle'
            });
        }
    },

    /**
     * TOOLTIP - Dicas
     */
    Tooltip: {
        init(selector = '[data-toggle="tooltip"]') {
            $(selector).tooltip();
        },

        create(element, title, options = {}) {
            const el = typeof element === 'string' ? 
                      document.querySelector(element) : element;
            
            $(el).tooltip({
                title,
                placement: options.placement || 'top',
                trigger: options.trigger || 'hover',
                ...options
            });
            
            return {
                show: () => $(el).tooltip('show'),
                hide: () => $(el).tooltip('hide'),
                toggle: () => $(el).tooltip('toggle'),
                dispose: () => $(el).tooltip('dispose')
            };
        }
    },

    /**
     * POPOVER - Popovers
     */
    Popover: {
        init(selector = '[data-toggle="popover"]') {
            $(selector).popover();
        },

        create(element, options = {}) {
            const el = typeof element === 'string' ? 
                      document.querySelector(element) : element;
            
            $(el).popover({
                title: options.title || '',
                content: options.content || '',
                placement: options.placement || 'right',
                trigger: options.trigger || 'click',
                html: options.html || false,
                ...options
            });
            
            return {
                show: () => $(el).popover('show'),
                hide: () => $(el).popover('hide'),
                toggle: () => $(el).popover('toggle'),
                dispose: () => $(el).popover('dispose')
            };
        }
    },

    /**
     * SPINNER - Loading
     */
    Spinner: {
        create(type = 'border', options = {}) {
            const spinner = document.createElement('div');
            spinner.className = `spinner-${type}`;
            
            if (options.color) {
                spinner.classList.add(`text-${options.color}`);
            }
            
            if (options.size === 'sm') {
                spinner.classList.add(`spinner-${type}-sm`);
            }
            
            spinner.innerHTML = '<span class="sr-only">Carregando...</span>';
            
            return spinner;
        },

        button(text, type = 'primary', options = {}) {
            const button = document.createElement('button');
            button.className = `btn btn-${type}`;
            button.type = 'button';
            button.disabled = true;
            
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                ${text}
            `;
            
            return button;
        }
    },

    /**
     * PROGRESS - Barra de progresso
     */
    Progress: {
        create(value = 0, options = {}) {
            const container = document.createElement('div');
            container.className = 'progress';
            
            if (options.height) {
                container.style.height = options.height;
            }
            
            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            bar.setAttribute('role', 'progressbar');
            bar.style.width = value + '%';
            bar.setAttribute('aria-valuenow', value);
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
            
            if (options.color) {
                bar.classList.add(`bg-${options.color}`);
            }
            
            if (options.striped) {
                bar.classList.add('progress-bar-striped');
            }
            
            if (options.animated) {
                bar.classList.add('progress-bar-striped', 'progress-bar-animated');
            }
            
            if (options.label) {
                bar.textContent = value + '%';
            }
            
            container.appendChild(bar);
            
            return {
                element: container,
                bar: bar,
                setValue: (newValue) => {
                    bar.style.width = newValue + '%';
                    bar.setAttribute('aria-valuenow', newValue);
                    if (options.label) {
                        bar.textContent = newValue + '%';
                    }
                }
            };
        }
    },

    /**
     * PAGINATION - Paginação
     */
    Pagination: {
        create(currentPage, totalPages, options = {}) {
            const nav = document.createElement('nav');
            nav.setAttribute('aria-label', 'Navegação de página');
            
            const ul = document.createElement('ul');
            ul.className = `pagination ${options.size ? 'pagination-' + options.size : ''}`;
            
            if (options.align === 'center') {
                ul.classList.add('justify-content-center');
            } else if (options.align === 'end') {
                ul.classList.add('justify-content-end');
            }
            
            // Previous
            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>`;
            ul.appendChild(prevLi);
            
            // Pages
            const maxVisible = options.maxVisible || 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
                ul.appendChild(li);
            }
            
            // Next
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Próxima</a>`;
            ul.appendChild(nextLi);
            
            // Event listener
            if (options.onChange) {
                ul.addEventListener('click', (e) => {
                    e.preventDefault();
                    const link = e.target.closest('a');
                    if (link && !link.parentElement.classList.contains('disabled')) {
                        const page = parseInt(link.dataset.page);
                        options.onChange(page);
                    }
                });
            }
            
            nav.appendChild(ul);
            return nav;
        }
    },

    /**
     * UTILITIES - Utilitários gerais
     */
    Utils: {
        /**
         * Inicializa todos componentes Bootstrap na página
         */
        initAll() {
            BS4.Tooltip.init();
            BS4.Popover.init();
        },

        /**
         * Destroy todos tooltips e popovers
         */
        disposeAll() {
            $('[data-toggle="tooltip"]').tooltip('dispose');
            $('[data-toggle="popover"]').popover('dispose');
        }
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BS4;
}
