/**
 * Biblioteca de Modais/Diálogos
 * Funções para criar e gerenciar modais, alertas e diálogos
 */

const Modal = {
    // Modais ativos
    activeModals: [],
    
    // ID counter
    idCounter: 0,

    /**
     * Cria modal customizado
     * @param {Object} options - Opções do modal
     * @returns {Object} Objeto com métodos do modal
     */
    create(options = {}) {
        const defaults = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, xlarge
            closeButton: true,
            backdrop: true,
            keyboard: true,
            centered: true,
            buttons: [],
            onShow: null,
            onHide: null,
            className: ''
        };

        const config = { ...defaults, ...options };
        const modalId = `modal-${++this.idCounter}`;

        // Criar estrutura do modal
        const modalHTML = `
            <div class="modal fade ${config.className}" id="${modalId}" 
                 tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true"
                 data-bs-backdrop="${config.backdrop ? 'true' : 'static'}"
                 data-bs-keyboard="${config.keyboard}">
                <div class="modal-dialog modal-${config.size} ${config.centered ? 'modal-dialog-centered' : ''}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}-label">${config.title}</h5>
                            ${config.closeButton ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>' : ''}
                        </div>
                        <div class="modal-body">
                            ${typeof config.content === 'string' ? config.content : ''}
                        </div>
                        ${config.buttons.length > 0 ? '<div class="modal-footer"></div>' : ''}
                    </div>
                </div>
            </div>
        `;

        // Adicionar ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalElement = document.getElementById(modalId);

        // Adicionar conteúdo se for elemento HTML
        if (typeof config.content !== 'string' && config.content instanceof HTMLElement) {
            const modalBody = modalElement.querySelector('.modal-body');
            modalBody.innerHTML = '';
            modalBody.appendChild(config.content);
        }

        // Adicionar botões
        if (config.buttons.length > 0) {
            const footer = modalElement.querySelector('.modal-footer');
            config.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = btn.className || 'btn btn-secondary';
                button.textContent = btn.text || 'Botão';
                
                if (btn.dismiss) {
                    button.setAttribute('data-bs-dismiss', 'modal');
                }
                
                if (btn.onClick && typeof btn.onClick === 'function') {
                    button.addEventListener('click', (e) => {
                        btn.onClick(e, modalInstance);
                    });
                }
                
                footer.appendChild(button);
            });
        }

        // Criar instância Bootstrap Modal
        const bsModal = new bootstrap.Modal(modalElement);

        // Event listeners
        modalElement.addEventListener('shown.bs.modal', () => {
            this.activeModals.push(modalId);
            if (config.onShow && typeof config.onShow === 'function') {
                config.onShow(modalInstance);
            }
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            const index = this.activeModals.indexOf(modalId);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }
            
            if (config.onHide && typeof config.onHide === 'function') {
                config.onHide(modalInstance);
            }
            
            // Remover do DOM após fechar
            setTimeout(() => {
                modalElement.remove();
            }, 300);
        });

        // Objeto de controle do modal
        const modalInstance = {
            id: modalId,
            element: modalElement,
            bsModal: bsModal,
            
            show() {
                bsModal.show();
                return this;
            },
            
            hide() {
                bsModal.hide();
                return this;
            },
            
            toggle() {
                bsModal.toggle();
                return this;
            },
            
            setTitle(title) {
                const titleEl = modalElement.querySelector('.modal-title');
                if (titleEl) titleEl.textContent = title;
                return this;
            },
            
            setContent(content) {
                const body = modalElement.querySelector('.modal-body');
                if (typeof content === 'string') {
                    body.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    body.innerHTML = '';
                    body.appendChild(content);
                }
                return this;
            },
            
            destroy() {
                bsModal.hide();
                setTimeout(() => {
                    modalElement.remove();
                }, 300);
            }
        };

        return modalInstance;
    },

    /**
     * Alerta simples
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise que resolve quando fechar
     */
    alert(message, title = 'Atenção', options = {}) {
        return new Promise((resolve) => {
            const modal = this.create({
                title: title,
                content: `<p>${message}</p>`,
                size: options.size || 'small',
                buttons: [
                    {
                        text: options.buttonText || 'OK',
                        className: 'btn btn-primary',
                        dismiss: true,
                        onClick: () => resolve(true)
                    }
                ],
                ...options
            });
            
            modal.show();
        });
    },

    /**
     * Confirmação
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise que resolve com true/false
     */
    confirm(message, title = 'Confirmar', options = {}) {
        return new Promise((resolve) => {
            const modal = this.create({
                title: title,
                content: `<p>${message}</p>`,
                size: options.size || 'small',
                buttons: [
                    {
                        text: options.cancelText || 'Cancelar',
                        className: 'btn btn-secondary',
                        dismiss: true,
                        onClick: () => resolve(false)
                    },
                    {
                        text: options.confirmText || 'Confirmar',
                        className: options.confirmClass || 'btn btn-primary',
                        dismiss: true,
                        onClick: () => resolve(true)
                    }
                ],
                ...options
            });
            
            modal.show();
        });
    },

    /**
     * Prompt - solicita entrada do usuário
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise que resolve com valor ou null
     */
    prompt(message, title = 'Digite', options = {}) {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${this.idCounter}`;
            const inputType = options.inputType || 'text';
            const defaultValue = options.defaultValue || '';
            const placeholder = options.placeholder || '';
            
            const content = `
                <p>${message}</p>
                <input type="${inputType}" 
                       id="${inputId}" 
                       class="form-control" 
                       value="${defaultValue}"
                       placeholder="${placeholder}">
            `;

            const modal = this.create({
                title: title,
                content: content,
                size: options.size || 'small',
                buttons: [
                    {
                        text: options.cancelText || 'Cancelar',
                        className: 'btn btn-secondary',
                        dismiss: true,
                        onClick: () => resolve(null)
                    },
                    {
                        text: options.confirmText || 'OK',
                        className: 'btn btn-primary',
                        dismiss: true,
                        onClick: () => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : null);
                        }
                    }
                ],
                onShow: (modalInstance) => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.focus();
                        input.select();
                    }
                },
                ...options
            });
            
            modal.show();
        });
    },

    /**
     * Modal de sucesso
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções
     * @returns {Promise} Promise
     */
    success(message, title = 'Sucesso!', options = {}) {
        const content = `
            <div class="text-center">
                <i class="bi bi-check-circle text-success" style="font-size: 4rem;"></i>
                <p class="mt-3">${message}</p>
            </div>
        `;
        
        return this.alert(content, title, {
            ...options,
            confirmClass: 'btn btn-success'
        });
    },

    /**
     * Modal de erro
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções
     * @returns {Promise} Promise
     */
    error(message, title = 'Erro!', options = {}) {
        const content = `
            <div class="text-center">
                <i class="bi bi-x-circle text-danger" style="font-size: 4rem;"></i>
                <p class="mt-3">${message}</p>
            </div>
        `;
        
        return this.alert(content, title, {
            ...options,
            confirmClass: 'btn btn-danger'
        });
    },

    /**
     * Modal de aviso
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções
     * @returns {Promise} Promise
     */
    warning(message, title = 'Atenção!', options = {}) {
        const content = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                <p class="mt-3">${message}</p>
            </div>
        `;
        
        return this.alert(content, title, {
            ...options,
            confirmClass: 'btn btn-warning'
        });
    },

    /**
     * Modal de informação
     * @param {string} message - Mensagem
     * @param {string} title - Título
     * @param {Object} options - Opções
     * @returns {Promise} Promise
     */
    info(message, title = 'Informação', options = {}) {
        const content = `
            <div class="text-center">
                <i class="bi bi-info-circle text-info" style="font-size: 4rem;"></i>
                <p class="mt-3">${message}</p>
            </div>
        `;
        
        return this.alert(content, title, {
            ...options,
            confirmClass: 'btn btn-info'
        });
    },

    /**
     * Modal de loading
     * @param {string} message - Mensagem
     * @param {Object} options - Opções
     * @returns {Object} Objeto do modal com método close()
     */
    loading(message = 'Carregando...', options = {}) {
        const content = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p>${message}</p>
            </div>
        `;

        const modal = this.create({
            title: '',
            content: content,
            size: 'small',
            closeButton: false,
            backdrop: 'static',
            keyboard: false,
            buttons: [],
            ...options
        });

        modal.show();
        
        return {
            close: () => modal.hide(),
            setMessage: (msg) => {
                const p = modal.element.querySelector('.modal-body p');
                if (p) p.textContent = msg;
            }
        };
    },

    /**
     * Modal com formulário
     * @param {string} title - Título
     * @param {Array} fields - Array de campos do formulário
     * @param {Object} options - Opções
     * @returns {Promise} Promise com dados do formulário
     */
    form(title, fields = [], options = {}) {
        return new Promise((resolve) => {
            const formId = `modal-form-${this.idCounter}`;
            
            let formHTML = `<form id="${formId}">`;
            
            fields.forEach(field => {
                formHTML += `
                    <div class="mb-3">
                        <label for="${field.name}" class="form-label">
                            ${field.label}
                            ${field.required ? '<span class="text-danger">*</span>' : ''}
                        </label>
                        ${this.renderFormField(field)}
                        ${field.help ? `<div class="form-text">${field.help}</div>` : ''}
                    </div>
                `;
            });
            
            formHTML += `</form>`;

            const modal = this.create({
                title: title,
                content: formHTML,
                size: options.size || 'medium',
                buttons: [
                    {
                        text: options.cancelText || 'Cancelar',
                        className: 'btn btn-secondary',
                        dismiss: true,
                        onClick: () => resolve(null)
                    },
                    {
                        text: options.submitText || 'Enviar',
                        className: 'btn btn-primary',
                        onClick: (e, modalInstance) => {
                            const form = document.getElementById(formId);
                            if (form.checkValidity()) {
                                const formData = new FormData(form);
                                const data = Object.fromEntries(formData.entries());
                                modalInstance.hide();
                                resolve(data);
                            } else {
                                form.reportValidity();
                            }
                        }
                    }
                ],
                ...options
            });
            
            modal.show();
        });
    },

    /**
     * Renderiza campo de formulário
     * @param {Object} field - Configuração do campo
     * @returns {string} HTML do campo
     */
    renderFormField(field) {
        const commonAttrs = `
            id="${field.name}" 
            name="${field.name}" 
            class="form-control ${field.className || ''}"
            ${field.required ? 'required' : ''}
            ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
        `;

        switch (field.type) {
            case 'textarea':
                return `<textarea ${commonAttrs} rows="${field.rows || 3}">${field.value || ''}</textarea>`;
            
            case 'select':
                let optionsHTML = '';
                if (field.options) {
                    field.options.forEach(opt => {
                        const selected = opt.value === field.value ? 'selected' : '';
                        optionsHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                    });
                }
                return `<select ${commonAttrs}>${optionsHTML}</select>`;
            
            case 'checkbox':
                return `
                    <div class="form-check">
                        <input type="checkbox" 
                               id="${field.name}" 
                               name="${field.name}" 
                               class="form-check-input"
                               ${field.checked ? 'checked' : ''}
                               ${field.required ? 'required' : ''}>
                        <label class="form-check-label" for="${field.name}">
                            ${field.checkLabel || field.label}
                        </label>
                    </div>
                `;
            
            default:
                return `<input type="${field.type || 'text'}" ${commonAttrs} value="${field.value || ''}">`;
        }
    },

    /**
     * Fecha todos os modais
     */
    closeAll() {
        this.activeModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            }
        });
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}
