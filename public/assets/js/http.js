/**
 * Biblioteca HTTP - Requisições AJAX/Fetch
 * Funções para comunicação com servidor via HTTP/AJAX
 * MUITO IMPORTANTE: Principal biblioteca para comunicação com backend
 */

const HTTP = {
    // Configurações padrão
    config: {
        baseURL: '',
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        showLoader: true,
        loaderElement: null
    },

    /**
     * Configurar opções globais
     * @param {Object} options - Opções de configuração
     */
    setup(options) {
        Object.assign(this.config, options);
    },

    /**
     * Mostra/esconde loader
     * @param {boolean} show - Mostrar ou esconder
     */
    toggleLoader(show) {
        if (!this.config.showLoader) return;
        
        if (this.config.loaderElement) {
            const loader = document.querySelector(this.config.loaderElement);
            if (loader) {
                loader.style.display = show ? 'block' : 'none';
            }
        }
    },

    /**
     * Requisição HTTP genérica
     * @param {string} url - URL da requisição
     * @param {Object} options - Opções da requisição
     * @returns {Promise} Promise com resposta
     */
    async request(url, options = {}) {
        // Preparar URL completa
        const fullURL = this.config.baseURL + url;
        
        // Preparar opções
        const fetchOptions = {
            method: options.method || 'GET',
            headers: { ...this.config.headers, ...options.headers },
            credentials: this.config.credentials,
            ...options
        };

        // Adicionar corpo da requisição
        if (options.data) {
            if (fetchOptions.headers['Content-Type'] === 'application/json') {
                fetchOptions.body = JSON.stringify(options.data);
            } else if (options.data instanceof FormData) {
                fetchOptions.body = options.data;
                // Remove Content-Type para FormData (browser define automaticamente)
                delete fetchOptions.headers['Content-Type'];
            } else {
                fetchOptions.body = options.data;
            }
        }

        // Mostrar loader
        this.toggleLoader(true);

        try {
            // Timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), this.config.timeout);
            });

            // Fazer requisição
            const response = await Promise.race([
                fetch(fullURL, fetchOptions),
                timeoutPromise
            ]);

            // Esconder loader
            this.toggleLoader(false);

            // Verificar status
            if (!response.ok) {
                const error = new Error(`HTTP Error ${response.status}`);
                error.status = response.status;
                error.response = response;
                
                // Tentar obter mensagem de erro do servidor
                try {
                    const errorData = await response.json();
                    error.data = errorData;
                    error.message = errorData.message || error.message;
                } catch (e) {
                    // Não conseguiu parsear JSON de erro
                }
                
                throw error;
            }

            // Parse da resposta
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else if (contentType && contentType.includes('text/')) {
                return await response.text();
            } else if (contentType && contentType.includes('blob')) {
                return await response.blob();
            } else {
                return response;
            }

        } catch (error) {
            this.toggleLoader(false);
            
            // Callback de erro global
            if (this.config.onError && typeof this.config.onError === 'function') {
                this.config.onError(error);
            }
            
            throw error;
        }
    },

    /**
     * Requisição GET
     * @param {string} url - URL
     * @param {Object} params - Parâmetros de query string
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise com resposta
     */
    async get(url, params = {}, options = {}) {
        // Adicionar parâmetros à URL
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        return this.request(url, { method: 'GET', ...options });
    },

    /**
     * Múltiplas requisições GET em paralelo
     * @param {Array} requests - Array de objetos { url, params?, options? } ou array de URLs
     * @param {Object} config - Configurações adicionais
     * @param {number} config.concurrency - Limite de requisições simultâneas (0 = sem limite)
     * @param {boolean} config.stopOnError - Parar ao encontrar primeiro erro
     * @param {Function} config.onProgress - Callback chamado a cada requisição completada
     * @param {boolean} config.returnErrors - Incluir erros no resultado ao invés de rejeitar
     * @returns {Promise<Array>} Promise com array de respostas
     * 
     * @example
     * // Simples - array de URLs
     * const results = await HTTP.GetMany(['/api/users/1', '/api/users/2', '/api/users/3']);
     * 
     * // Com parâmetros
     * const results = await HTTP.GetMany([
     *   { url: '/api/users', params: { page: 1 } },
     *   { url: '/api/users', params: { page: 2 } },
     *   { url: '/api/posts', params: { limit: 10 } }
     * ]);
     * 
     * // Com controle de concorrência
     * const results = await HTTP.GetMany(urls, {
     *   concurrency: 3,
     *   onProgress: (completed, total) => console.log(`${completed}/${total}`)
     * });
     * 
     * // Com tratamento de erros
     * const results = await HTTP.GetMany(urls, {
     *   returnErrors: true,
     *   stopOnError: false
     * });
     */
    async GetMany(requests, config = {}) {
        const {
            concurrency = 0,
            stopOnError = false,
            onProgress = null,
            returnErrors = false
        } = config;

        // Normalizar requests para formato padrão
        const normalizedRequests = requests.map(req => {
            if (typeof req === 'string') {
                return { url: req, params: {}, options: {} };
            }
            return {
                url: req.url,
                params: req.params || {},
                options: req.options || {}
            };
        });

        const total = normalizedRequests.length;
        let completed = 0;
        const results = [];
        const errors = [];

        // Função para executar uma requisição com índice
        const executeRequest = async (request, index) => {
            try {
                const result = await this.get(request.url, request.params, request.options);
                
                completed++;
                if (onProgress && typeof onProgress === 'function') {
                    onProgress(completed, total, index, null);
                }
                
                return { success: true, data: result, index };
            } catch (error) {
                completed++;
                
                if (onProgress && typeof onProgress === 'function') {
                    onProgress(completed, total, index, error);
                }
                
                errors.push({ index, error, request });
                
                if (stopOnError && !returnErrors) {
                    throw error;
                }
                
                return { success: false, error, index };
            }
        };

        // Sem limite de concorrência - todas em paralelo
        if (concurrency === 0 || concurrency >= total) {
            const promises = normalizedRequests.map((req, idx) => executeRequest(req, idx));
            const allResults = await Promise.all(promises);
            
            // Ordenar resultados pelo índice original
            allResults.sort((a, b) => a.index - b.index);
            
            if (returnErrors) {
                return allResults.map(r => r.success ? r.data : r.error);
            } else {
                // Se há erros e não deve retorná-los, lançar o primeiro erro
                const firstError = allResults.find(r => !r.success);
                if (firstError) {
                    throw firstError.error;
                }
                return allResults.map(r => r.data);
            }
        }

        // Com limite de concorrência
        const queue = [...normalizedRequests];
        const executing = [];
        let currentIndex = 0;

        while (queue.length > 0 || executing.length > 0) {
            // Preencher slots de execução
            while (executing.length < concurrency && queue.length > 0) {
                const request = queue.shift();
                const index = currentIndex++;
                
                const promise = executeRequest(request, index)
                    .then(result => {
                        results[result.index] = result;
                        const idx = executing.indexOf(promise);
                        if (idx > -1) {
                            executing.splice(idx, 1);
                        }
                        return result;
                    });
                
                executing.push(promise);
            }

            // Aguardar pelo menos uma requisição completar
            if (executing.length > 0) {
                await Promise.race(executing);
            }

            // Verificar se deve parar por erro
            if (stopOnError && errors.length > 0 && !returnErrors) {
                // Cancelar pendentes (não há como cancelar fetch, mas paramos de processar)
                throw errors[0].error;
            }
        }

        // Retornar resultados ordenados
        if (returnErrors) {
            return results.map(r => r.success ? r.data : r.error);
        } else {
            if (errors.length > 0) {
                throw errors[0].error;
            }
            return results.map(r => r.data);
        }
    },

    /**
     * Requisição POST
     * @param {string} url - URL
     * @param {Object} data - Dados a enviar
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise com resposta
     */
    async post(url, data = {}, options = {}) {
        return this.request(url, { method: 'POST', data, ...options });
    },

    /**
     * Requisição PUT
     * @param {string} url - URL
     * @param {Object} data - Dados a enviar
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise com resposta
     */
    async put(url, data = {}, options = {}) {
        return this.request(url, { method: 'PUT', data, ...options });
    },

    /**
     * Requisição PATCH
     * @param {string} url - URL
     * @param {Object} data - Dados a enviar
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise com resposta
     */
    async patch(url, data = {}, options = {}) {
        return this.request(url, { method: 'PATCH', data, ...options });
    },

    /**
     * Requisição DELETE
     * @param {string} url - URL
     * @param {Object} options - Opções adicionais
     * @returns {Promise} Promise com resposta
     */
    async delete(url, options = {}) {
        return this.request(url, { method: 'DELETE', ...options });
    },

    /**
     * Upload de arquivo
     * @param {string} url - URL
     * @param {File|FileList} files - Arquivo(s)
     * @param {Object} additionalData - Dados adicionais
     * @param {Function} onProgress - Callback de progresso
     * @returns {Promise} Promise com resposta
     */
    async upload(url, files, additionalData = {}, onProgress = null) {
        const formData = new FormData();

        // Adicionar arquivos
        if (files instanceof FileList) {
            Array.from(files).forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
        } else if (files instanceof File) {
            formData.append('file', files);
        }

        // Adicionar dados adicionais
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        // Se tem callback de progresso, usar XMLHttpRequest
        if (onProgress && typeof onProgress === 'function') {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete, e.loaded, e.total);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject(new Error(`HTTP Error ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network Error'));
                });

                xhr.open('POST', this.config.baseURL + url);
                
                // Adicionar headers (exceto Content-Type)
                Object.keys(this.config.headers).forEach(key => {
                    if (key !== 'Content-Type') {
                        xhr.setRequestHeader(key, this.config.headers[key]);
                    }
                });

                xhr.send(formData);
            });
        }

        // Sem progresso, usar fetch normal
        return this.post(url, formData);
    },

    /**
     * Download de arquivo
     * @param {string} url - URL do arquivo
     * @param {string} filename - Nome do arquivo
     * @param {Object} params - Parâmetros
     */
    async download(url, filename = null, params = {}) {
        // Adicionar parâmetros à URL
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        const fullURL = this.config.baseURL + url;

        try {
            const response = await fetch(fullURL, {
                method: 'GET',
                headers: this.config.headers,
                credentials: this.config.credentials
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            const blob = await response.blob();
            
            // Determinar nome do arquivo
            if (!filename) {
                const contentDisposition = response.headers.get('content-disposition');
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?(.+)"?/);
                    if (match) {
                        filename = match[1];
                    }
                }
            }

            // Criar link temporário e fazer download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('Erro no download:', error);
            throw error;
        }
    },

    /**
     * Requisições em paralelo
     * @param {Array} requests - Array de requisições
     * @returns {Promise} Promise com array de respostas
     */
    async all(requests) {
        return Promise.all(requests);
    },

    /**
     * Busca dados com debounce (útil para autocomplete)
     * @param {string} url - URL
     * @param {Object} params - Parâmetros
     * @param {number} delay - Delay em ms
     * @returns {Promise} Promise com resposta
     */
    debounceGet(url, params = {}, delay = 300) {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        return new Promise((resolve, reject) => {
            this._debounceTimer = setTimeout(async () => {
                try {
                    const result = await this.get(url, params);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    },

    /**
     * Polling - requisição repetida em intervalo
     * @param {string} url - URL
     * @param {Function} callback - Função chamada a cada resposta
     * @param {number} interval - Intervalo em ms
     * @param {Object} options - Opções
     * @returns {Function} Função para parar polling
     */
    poll(url, callback, interval = 5000, options = {}) {
        let running = true;
        let timer = null;

        const execute = async () => {
            if (!running) return;

            try {
                const response = await this.get(url, options.params || {});
                
                if (callback && typeof callback === 'function') {
                    const shouldContinue = callback(response);
                    if (shouldContinue === false) {
                        running = false;
                        return;
                    }
                }

                if (running) {
                    timer = setTimeout(execute, interval);
                }
            } catch (error) {
                console.error('Erro no polling:', error);
                if (running) {
                    timer = setTimeout(execute, interval);
                }
            }
        };

        // Iniciar
        execute();

        // Retornar função para parar
        return () => {
            running = false;
            if (timer) {
                clearTimeout(timer);
            }
        };
    },

    /**
     * Retry automático em caso de falha
     * @param {Function} requestFn - Função de requisição
     * @param {number} maxRetries - Máximo de tentativas
     * @param {number} delay - Delay entre tentativas
     * @returns {Promise} Promise com resposta
     */
    async retry(requestFn, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    },

    /**
     * Cache de requisições
     */
    _cache: new Map(),
    _cacheExpiry: new Map(),

    /**
     * Requisição com cache
     * @param {string} url - URL
     * @param {Object} params - Parâmetros
     * @param {number} ttl - Tempo de vida do cache em ms
     * @returns {Promise} Promise com resposta
     */
    async getCached(url, params = {}, ttl = 60000) {
        const cacheKey = url + JSON.stringify(params);
        const now = Date.now();

        // Verificar se existe em cache e não expirou
        if (this._cache.has(cacheKey)) {
            const expiry = this._cacheExpiry.get(cacheKey);
            if (expiry > now) {
                return this._cache.get(cacheKey);
            }
        }

        // Fazer requisição
        const response = await this.get(url, params);

        // Armazenar em cache
        this._cache.set(cacheKey, response);
        this._cacheExpiry.set(cacheKey, now + ttl);

        return response;
    },

    /**
     * Limpar cache
     * @param {string} url - URL específica ou null para limpar tudo
     */
    clearCache(url = null) {
        if (url) {
            // Limpar cache específico
            for (let key of this._cache.keys()) {
                if (key.startsWith(url)) {
                    this._cache.delete(key);
                    this._cacheExpiry.delete(key);
                }
            }
        } else {
            // Limpar todo cache
            this._cache.clear();
            this._cacheExpiry.clear();
        }
    },

    /**
     * Interceptor de requisição (executado antes)
     * @param {Function} fn - Função interceptora
     */
    addRequestInterceptor(fn) {
        if (!this._requestInterceptors) {
            this._requestInterceptors = [];
        }
        this._requestInterceptors.push(fn);
    },

    /**
     * Interceptor de resposta (executado depois)
     * @param {Function} fn - Função interceptora
     */
    addResponseInterceptor(fn) {
        if (!this._responseInterceptors) {
            this._responseInterceptors = [];
        }
        this._responseInterceptors.push(fn);
    },

    /**
     * Helpers para tratamento de erros comum
     */
    errors: {
        /**
         * Verifica se é erro de rede
         * @param {Error} error - Erro
         * @returns {boolean} True se erro de rede
         */
        isNetworkError(error) {
            return error.message === 'Failed to fetch' || 
                   error.message === 'Network request failed' ||
                   error.message === 'Timeout';
        },

        /**
         * Verifica se é erro de autenticação
         * @param {Error} error - Erro
         * @returns {boolean} True se erro de autenticação
         */
        isAuthError(error) {
            return error.status === 401 || error.status === 403;
        },

        /**
         * Verifica se é erro de servidor
         * @param {Error} error - Erro
         * @returns {boolean} True se erro de servidor
         */
        isServerError(error) {
            return error.status >= 500 && error.status < 600;
        },

        /**
         * Extrai mensagem de erro
         * @param {Error} error - Erro
         * @returns {string} Mensagem de erro
         */
        getMessage(error) {
            if (error.data && error.data.message) {
                return error.data.message;
            }
            
            if (this.isNetworkError(error)) {
                return 'Erro de conexão. Verifique sua internet.';
            }
            
            if (this.isAuthError(error)) {
                return 'Você não tem permissão para acessar este recurso.';
            }
            
            if (this.isServerError(error)) {
                return 'Erro no servidor. Tente novamente mais tarde.';
            }
            
            return error.message || 'Erro desconhecido.';
        }
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTTP;
}