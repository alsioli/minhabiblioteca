/**
 * Biblioteca de Gerenciamento de Páginas
 * Funções para navegação, estado de página, loading e lifecycle
 */

const Page = {
    // Estado da página
    state: {
        isLoading: false,
        currentPage: null,
        history: [],
        data: {}
    },

    // Callbacks
    callbacks: {
        onBeforeLoad: [],
        onAfterLoad: [],
        onBeforeUnload: [],
        onError: []
    },

    /**
     * Inicializa gerenciamento de página
     * @param {Object} options - Opções de configuração
     */
    init(options = {}) {
        this.config = {
            loaderSelector: options.loaderSelector || '#page-loader',
            contentSelector: options.contentSelector || '#page-content',
            enableHistory: options.enableHistory !== false,
            scrollToTop: options.scrollToTop !== false,
            ...options
        };

        // Detectar página atual
        this.state.currentPage = window.location.pathname;

        // Listener para navegação
        if (this.config.enableHistory) {
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.page) {
                    this.loadPage(e.state.page, e.state.data, false);
                }
            });
        }

        // Listener para links internos
        if (this.config.interceptLinks) {
            this.interceptLinks();
        }
    },

    /**
     * Intercepta cliques em links para navegação AJAX
     */
    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Ignorar links externos, âncoras e download
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('http') || 
                href.startsWith('mailto:') ||
                link.hasAttribute('download') ||
                link.hasAttribute('target')) {
                return;
            }

            e.preventDefault();
            this.navigate(href);
        });
    },

    /**
     * Navega para uma página
     * @param {string} url - URL da página
     * @param {Object} data - Dados adicionais
     * @param {boolean} pushState - Se deve adicionar ao histórico
     */
    async navigate(url, data = {}, pushState = true) {
        try {
            // Callbacks antes de carregar
            await this.trigger('onBeforeLoad', { url, data });

            // Mostrar loader
            this.showLoader();

            // Fazer requisição
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // Atualizar conteúdo
            const content = document.querySelector(this.config.contentSelector);
            if (content) {
                content.innerHTML = html;
            }

            // Atualizar estado
            this.state.currentPage = url;
            this.state.data = data;

            // Adicionar ao histórico
            if (pushState && this.config.enableHistory) {
                history.pushState({ page: url, data }, '', url);
                this.state.history.push({ page: url, data, timestamp: Date.now() });
            }

            // Scroll to top
            if (this.config.scrollToTop) {
                window.scrollTo(0, 0);
            }

            // Esconder loader
            this.hideLoader();

            // Callbacks após carregar
            await this.trigger('onAfterLoad', { url, data });

            // Re-inicializar scripts se necessário
            if (this.config.reinitScripts) {
                this.reinitScripts();
            }

        } catch (error) {
            console.error('Erro ao navegar:', error);
            this.hideLoader();
            await this.trigger('onError', { url, error });
        }
    },

    /**
     * Carrega conteúdo em elemento específico
     * @param {string} url - URL
     * @param {string|HTMLElement} target - Elemento alvo
     * @param {Object} options - Opções
     */
    async load(url, target, options = {}) {
        const el = typeof target === 'string' ? 
                   document.querySelector(target) : target;
        
        if (!el) return;

        try {
            if (options.showLoader !== false) {
                this.showLoader();
            }

            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();
            
            if (options.append) {
                el.insertAdjacentHTML('beforeend', html);
            } else if (options.prepend) {
                el.insertAdjacentHTML('afterbegin', html);
            } else {
                el.innerHTML = html;
            }

            this.hideLoader();

            if (options.onSuccess) {
                options.onSuccess(html, el);
            }

        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            this.hideLoader();
            
            if (options.onError) {
                options.onError(error);
            }
        }
    },

    /**
     * Mostra loader
     */
    showLoader() {
        this.state.isLoading = true;
        
        const loader = document.querySelector(this.config.loaderSelector);
        if (loader) {
            loader.style.display = 'flex';
        }

        // Adicionar classe ao body
        document.body.classList.add('page-loading');
    },

    /**
     * Esconde loader
     */
    hideLoader() {
        this.state.isLoading = false;
        
        const loader = document.querySelector(this.config.loaderSelector);
        if (loader) {
            loader.style.display = 'none';
        }

        // Remover classe do body
        document.body.classList.remove('page-loading');
    },

    /**
     * Adiciona callback de evento
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função callback
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    },

    /**
     * Remove callback de evento
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função callback
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    },

    /**
     * Dispara callbacks de evento
     * @param {string} event - Nome do evento
     * @param {any} data - Dados do evento
     */
    async trigger(event, data) {
        if (this.callbacks[event]) {
            for (const callback of this.callbacks[event]) {
                await callback(data);
            }
        }
    },

    /**
     * Recarrega página atual
     */
    reload() {
        if (this.state.currentPage) {
            this.navigate(this.state.currentPage, this.state.data, false);
        } else {
            window.location.reload();
        }
    },

    /**
     * Volta para página anterior
     */
    back() {
        if (this.config.enableHistory && this.state.history.length > 1) {
            history.back();
        } else {
            window.history.back();
        }
    },

    /**
     * Avança para próxima página
     */
    forward() {
        window.history.forward();
    },

    /**
     * Reinicializa scripts da página
     */
    reinitScripts() {
        // Re-inicializar tooltips
        if (typeof Tooltip !== 'undefined') {
            Tooltip.init();
        }

        // Re-inicializar popovers
        const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
        popovers.forEach(el => new bootstrap.Popover(el));

        // Disparar evento customizado
        document.dispatchEvent(new CustomEvent('page:reinit'));
    },

    /**
     * Pré-carrega página em background
     * @param {string} url - URL da página
     */
    async prefetch(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                // Armazenar em cache (se suportado)
                if ('caches' in window) {
                    const cache = await caches.open('page-cache');
                    await cache.put(url, response.clone());
                }
            }
        } catch (error) {
            console.warn('Erro ao pré-carregar:', error);
        }
    },

    /**
     * Adiciona dados ao estado da página
     * @param {string} key - Chave
     * @param {any} value - Valor
     */
    setState(key, value) {
        this.state.data[key] = value;
    },

    /**
     * Obtém dado do estado da página
     * @param {string} key - Chave
     * @returns {any} Valor
     */
    getState(key) {
        return this.state.data[key];
    },

    /**
     * Limpa estado da página
     */
    clearState() {
        this.state.data = {};
    },

    /**
     * Scroll suave para elemento
     * @param {string|HTMLElement} target - Elemento alvo
     * @param {Object} options - Opções
     */
    scrollTo(target, options = {}) {
        const el = typeof target === 'string' ? 
                   document.querySelector(target) : target;
        
        if (!el) return;

        const offset = options.offset || 0;
        const duration = options.duration || 500;

        const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    },

    /**
     * Função de easing para scroll suave
     */
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    },

    /**
     * Scroll to top da página
     * @param {boolean} smooth - Se deve ser suave
     */
    scrollToTop(smooth = true) {
        if (smooth) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, 0);
        }
    },

    /**
     * Verifica se usuário scrollou até o final
     * @param {number} threshold - Distância do final (px)
     * @returns {boolean} True se no final
     */
    isAtBottom(threshold = 100) {
        return (window.innerHeight + window.scrollY) >= 
               (document.documentElement.scrollHeight - threshold);
    },

    /**
     * Lazy load ao scroll
     * @param {Function} callback - Função a executar
     * @param {number} threshold - Distância do final
     */
    lazyLoadOnScroll(callback, threshold = 300) {
        let loading = false;

        const checkScroll = () => {
            if (loading) return;

            if (this.isAtBottom(threshold)) {
                loading = true;
                callback().then(() => {
                    loading = false;
                }).catch(() => {
                    loading = false;
                });
            }
        };

        window.addEventListener('scroll', checkScroll);
        
        return {
            destroy: () => {
                window.removeEventListener('scroll', checkScroll);
            }
        };
    },

    /**
     * Breadcrumb automático
     * @param {Array} items - Itens do breadcrumb
     * @param {string|HTMLElement} target - Onde renderizar
     */
    renderBreadcrumb(items, target) {
        const el = typeof target === 'string' ? 
                   document.querySelector(target) : target;
        
        if (!el) return;

        let html = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            
            html += '<li class="breadcrumb-item';
            if (isLast) html += ' active" aria-current="page';
            html += '">';

            if (!isLast && item.url) {
                html += `<a href="${item.url}">${item.text}</a>`;
            } else {
                html += item.text;
            }

            html += '</li>';
        });

        html += '</ol></nav>';
        
        el.innerHTML = html;
    },

    /**
     * Executa código quando página estiver pronta
     * @param {Function} callback - Função a executar
     */
    ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },

    /**
     * Executa código quando window carregar
     * @param {Function} callback - Função a executar
     */
    onLoad(callback) {
        if (document.readyState === 'complete') {
            callback();
        } else {
            window.addEventListener('load', callback);
        }
    },

    /**
     * Ação antes de sair da página
     * @param {Function} callback - Função a executar
     * @param {string} message - Mensagem de confirmação
     */
    beforeUnload(callback, message = null) {
        const handler = (e) => {
            const shouldPrevent = callback ? callback(e) : true;
            
            if (shouldPrevent) {
                e.preventDefault();
                if (message) {
                    e.returnValue = message;
                    return message;
                }
            }
        };

        window.addEventListener('beforeunload', handler);

        return {
            remove: () => {
                window.removeEventListener('beforeunload', handler);
            }
        };
    },

    /**
     * Detecta mudanças de visibilidade da página
     * @param {Function} onVisible - Callback quando visível
     * @param {Function} onHidden - Callback quando escondido
     */
    onVisibilityChange(onVisible, onHidden) {
        const handler = () => {
            if (document.hidden) {
                if (onHidden) onHidden();
            } else {
                if (onVisible) onVisible();
            }
        };

        document.addEventListener('visibilitychange', handler);

        return {
            remove: () => {
                document.removeEventListener('visibilitychange', handler);
            }
        };
    },

    /**
     * Copia texto para clipboard
     * @param {string} text - Texto a copiar
     * @returns {Promise} Promise
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },

    /**
     * Imprime página ou elemento
     * @param {string|HTMLElement} element - Elemento específico (opcional)
     */
    print(element = null) {
        if (element) {
            const el = typeof element === 'string' ? 
                       document.querySelector(element) : element;
            
            if (!el) return;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Impressão</title>
                        <link rel="stylesheet" href="/assets/css/print.css">
                    </head>
                    <body>
                        ${el.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } else {
            window.print();
        }
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Page;
}
