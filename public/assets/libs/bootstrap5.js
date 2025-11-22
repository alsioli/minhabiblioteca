/**
 * Biblioteca Bootstrap 5.3.8 Wrapper
 * Funções helpers para componentes Bootstrap 5
 * Versão: 5.3.8
 */

const BS5 = {
    version: '5.3.8',
    
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
                    ${options.icon ? `<i class="${options.icon} me-2"></i>` : ''}
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
            } else {
                alert.innerHTML = `${options.icon ? `<i class="${options.icon} me-2"></i>` : ''}${message}`;
            }
            
            if (options.container) {
                const container = typeof options.container === 'string' ? 
                                document.querySelector(options.container) : options.container;
                container.appendChild(alert);
            }
            
            // Auto-dismiss
            if (options.autoDismiss) {
                setTimeout(() => {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }, options.autoDismiss);
            }
            
            return alert;
        },

        success(message, options = {}) {
            return this.create(message, 'success', {
                icon: 'bi bi-check-circle-fill',
                ...options
            });
        },

        error(message, options = {}) {
            return this.create(message, 'danger', {
                icon: 'bi bi-x-circle-fill',
                ...options
            });
        },

        warning(message, options = {}) {
            return this.create(message, 'warning', {
                icon: 'bi bi-exclamation-triangle-fill',
                ...options
            });
        },

        info(message, options = {}) {
            return this.create(message, 'info', {
                icon: 'bi bi-info-circle-fill',
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
            badge.className = `badge bg-${type}`;
            
            if (options.pill) {
                badge.classList.add('rounded-pill');
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
            
            const collapse = new bootstrap.Collapse(element, {
                toggle: options.toggle !== false,
                ...options
            });
            
            return {
                show: () => collapse.show(),
                hide: () => collapse.hide(),
                toggle: () => collapse.toggle(),
                dispose: () => collapse.dispose()
            };
        }
    },

    /**
     * DROPDOWN - Menu suspenso
     */
    Dropdown: {
        create(buttonText, items, options = {}) {
            const div = document.createElement('div');
            div.className = 'dropdown';
            
            // Botão
            const button = document.createElement('button');
            button.className = `btn btn-${options.buttonType || 'secondary'} dropdown-toggle`;
            button.type = 'button';
            button.setAttribute('data-bs-toggle', 'dropdown');
            button.setAttribute('aria-expanded', 'false');
            button.textContent = buttonText;
            
            if (options.buttonSize) {
                button.classList.add(`btn-${options.buttonSize}`);
            }
            
            div.appendChild(button);
            
            // Menu
            const menu = document.createElement('ul');
            menu.className = 'dropdown-menu';
            
            items.forEach(item => {
                if (item.divider) {
                    const divider = document.createElement('li');
                    divider.innerHTML = '<hr class="dropdown-divider">';
                    menu.appendChild(divider);
                } else if (item.header) {
                    const header = document.createElement('li');
                    header.innerHTML = `<h6 class="dropdown-header">${item.header}</h6>`;
                    menu.appendChild(header);
                } else {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.className = 'dropdown-item';
                    a.href = item.href || '#';
                    
                    if (item.icon) {
                        a.innerHTML = `<i class="${item.icon} me-2"></i>${item.text}`;
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
                    
                    li.appendChild(a);
                    menu.appendChild(li);
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
                <div class="modal fade" id="${modalId}" tabindex="-1" 
                     aria-labelledby="${modalId}Label" aria-hidden="true"
                     data-bs-backdrop="${options.backdrop !== false ? 'true' : 'static'}"
                     data-bs-keyboard="${options.keyboard !== false}">
                    <div class="modal-dialog ${options.size ? 'modal-' + options.size : ''} 
                                ${options.centered ? 'modal-dialog-centered' : ''}
                                ${options.scrollable ? 'modal-dialog-scrollable' : ''}">
                        <div class="modal-content">
                            ${options.header !== false ? `
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${modalId}Label">${options.title || ''}</h5>
                                    ${options.closeButton !== false ? 
                                        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' 
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
            const modal = new bootstrap.Modal(modalElement);
            
            return {
                element: modalElement,
                show: () => modal.show(),
                hide: () => modal.hide(),
                toggle: () => modal.toggle(),
                dispose: () => {
                    modal.dispose();
                    modalElement.remove();
                }
            };
        }
    },

    /**
     * TOAST - Notificações
     */
    Toast: {
        container: null,

        init(containerId = 'toast-container') {
            if (!this.container) {
                this.container = document.getElementById(containerId);
                
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = containerId;
                    this.container.className = 'toast-container position-fixed top-0 end-0 p-3';
                    this.container.style.zIndex = '9999';
                    document.body.appendChild(this.container);
                }
            }
        },

        create(message, options = {}) {
            this.init();
            
            const toastId = `toast-${Date.now()}`;
            
            const toastHTML = `
                <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    ${options.header !== false ? `
                        <div class="toast-header ${options.headerClass || ''}">
                            ${options.icon ? `<i class="${options.icon} me-2"></i>` : ''}
                            <strong class="me-auto">${options.title || 'Notificação'}</strong>
                            ${options.time ? `<small>${options.time}</small>` : ''}
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                    ` : ''}
                    <div class="toast-body ${options.bodyClass || ''}">
                        ${message}
                    </div>
                </div>
            `;
            
            this.container.insertAdjacentHTML('beforeend', toastHTML);
            const toastElement = document.getElementById(toastId);
            
            const toast = new bootstrap.Toast(toastElement, {
                autohide: options.autohide !== false,
                delay: options.delay || 5000
            });
            
            toast.show();
            
            // Remover após esconder
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
            
            return toast;
        },

        success(message, title = 'Sucesso') {
            return this.create(message, {
                title,
                icon: 'bi bi-check-circle-fill text-success',
                headerClass: 'bg-success text-white'
            });
        },

        error(message, title = 'Erro') {
            return this.create(message, {
                title,
                icon: 'bi bi-x-circle-fill text-danger',
                headerClass: 'bg-danger text-white'
            });
        },

        warning(message, title = 'Atenção') {
            return this.create(message, {
                title,
                icon: 'bi bi-exclamation-triangle-fill text-warning',
                headerClass: 'bg-warning'
            });
        },

        info(message, title = 'Informação') {
            return this.create(message, {
                title,
                icon: 'bi bi-info-circle-fill text-info',
                headerClass: 'bg-info text-white'
            });
        }
    },

    /**
     * TOOLTIP - Dicas
     */
    Tooltip: {
        init(selector = '[data-bs-toggle="tooltip"]') {
            const tooltips = document.querySelectorAll(selector);
            return Array.from(tooltips).map(el => new bootstrap.Tooltip(el));
        },

        create(element, title, options = {}) {
            const el = typeof element === 'string' ? 
                      document.querySelector(element) : element;
            
            return new bootstrap.Tooltip(el, {
                title,
                placement: options.placement || 'top',
                trigger: options.trigger || 'hover',
                ...options
            });
        }
    },

    /**
     * POPOVER - Popovers
     */
    Popover: {
        init(selector = '[data-bs-toggle="popover"]') {
            const popovers = document.querySelectorAll(selector);
            return Array.from(popovers).map(el => new bootstrap.Popover(el));
        },

        create(element, options = {}) {
            const el = typeof element === 'string' ? 
                      document.querySelector(element) : element;
            
            return new bootstrap.Popover(el, {
                title: options.title || '',
                content: options.content || '',
                placement: options.placement || 'right',
                trigger: options.trigger || 'click',
                html: options.html || false,
                ...options
            });
        }
    },

    /**
     * OFFCANVAS - Menu lateral
     */
    Offcanvas: {
        create(options = {}) {
            const id = options.id || `offcanvas-${Date.now()}`;
            
            const html = `
                <div class="offcanvas offcanvas-${options.placement || 'start'}" 
                     tabindex="-1" id="${id}" aria-labelledby="${id}Label">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="${id}Label">${options.title || ''}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        ${options.body || ''}
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', html);
            const element = document.getElementById(id);
            const offcanvas = new bootstrap.Offcanvas(element);
            
            return {
                element,
                show: () => offcanvas.show(),
                hide: () => offcanvas.hide(),
                toggle: () => offcanvas.toggle()
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
            
            if (options.size) {
                spinner.classList.add(`spinner-${type}-${options.size}`);
            }
            
            spinner.innerHTML = '<span class="visually-hidden">Carregando...</span>';
            
            return spinner;
        },

        button(text, type = 'primary', options = {}) {
            const button = document.createElement('button');
            button.className = `btn btn-${type}`;
            button.type = 'button';
            button.disabled = true;
            
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
            BS5.Tooltip.init();
            BS5.Popover.init();
        },

        /**
         * Destroy todos tooltips e popovers
         */
        disposeAll() {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                const tooltip = bootstrap.Tooltip.getInstance(el);
                if (tooltip) tooltip.dispose();
            });
            
            document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
                const popover = bootstrap.Popover.getInstance(el);
                if (popover) popover.dispose();
            });
        }
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BS5;
}
