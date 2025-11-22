/**
 * Biblioteca Bootstrap Datepicker Wrapper
 * Funções helpers para Bootstrap Datepicker em Português
 * Versão: 1.10.0
 * 
 * Requer:
 * - jQuery
 * - Bootstrap Datepicker
 * - Locales pt-BR
 */

const DatePicker = {
    version: '1.10.0',
    
    // Configuração padrão
    defaults: {
        language: 'pt-BR',
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true,
        orientation: 'bottom auto',
        clearBtn: true,
        todayBtn: 'linked',
        weekStart: 0, // Domingo
        daysOfWeekDisabled: [], // Dias desabilitados (0=Domingo, 6=Sábado)
        datesDisabled: [], // Datas específicas desabilitadas
        startDate: null,
        endDate: null,
        container: 'body'
    },

    /**
     * Configuração de localização PT-BR
     */
    locales: {
        'pt-BR': {
            days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            daysMin: ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sa"],
            months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                     "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                         "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            today: "Hoje",
            clear: "Limpar",
            format: "dd/mm/yyyy",
            titleFormat: "MM yyyy",
            weekStart: 0
        }
    },

    /**
     * Inicializa datepicker básico
     * @param {string|HTMLElement} selector - Seletor ou elemento
     * @param {Object} options - Opções customizadas
     * @returns {Object} Instância do datepicker
     */
    init(selector, options = {}) {
        const element = typeof selector === 'string' ? 
                       $(selector) : $(selector);
        
        if (!element.length) {
            console.error('DatePicker: Elemento não encontrado');
            return null;
        }

        const config = { ...this.defaults, ...options };
        
        element.datepicker(config);
        
        return this.createInstance(element);
    },

    /**
     * Cria instância com métodos auxiliares
     * @param {jQuery} element - Elemento jQuery
     * @returns {Object} Objeto com métodos
     */
    createInstance(element) {
        return {
            element: element,
            
            // Obter valor
            getValue() {
                return element.datepicker('getDate');
            },
            
            // Obter valor formatado
            getFormattedValue() {
                return element.val();
            },
            
            // Definir valor
            setValue(date) {
                element.datepicker('setDate', date);
                return this;
            },
            
            // Limpar
            clear() {
                element.datepicker('clearDates');
                return this;
            },
            
            // Atualizar
            update() {
                element.datepicker('update');
                return this;
            },
            
            // Destruir
            destroy() {
                element.datepicker('destroy');
                return this;
            },
            
            // Mostrar
            show() {
                element.datepicker('show');
                return this;
            },
            
            // Esconder
            hide() {
                element.datepicker('hide');
                return this;
            },
            
            // Definir data inicial
            setStartDate(date) {
                element.datepicker('setStartDate', date);
                return this;
            },
            
            // Definir data final
            setEndDate(date) {
                element.datepicker('setEndDate', date);
                return this;
            },
            
            // Definir datas desabilitadas
            setDatesDisabled(dates) {
                element.datepicker('setDatesDisabled', dates);
                return this;
            },
            
            // Definir dias da semana desabilitados
            setDaysOfWeekDisabled(days) {
                element.datepicker('setDaysOfWeekDisabled', days);
                return this;
            },
            
            // Habilitar
            enable() {
                element.prop('disabled', false);
                element.datepicker('update');
                return this;
            },
            
            // Desabilitar
            disable() {
                element.prop('disabled', true);
                element.datepicker('update');
                return this;
            },
            
            // Event listeners
            on(event, callback) {
                element.on(event, callback);
                return this;
            },
            
            off(event) {
                element.off(event);
                return this;
            }
        };
    },

    /**
     * Datepicker simples (apenas seleção de data)
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    simple(selector, options = {}) {
        return this.init(selector, {
            format: 'dd/mm/yyyy',
            autoclose: true,
            todayHighlight: true,
            ...options
        });
    },

    /**
     * Datepicker com mês e ano
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    monthYear(selector, options = {}) {
        return this.init(selector, {
            format: 'mm/yyyy',
            viewMode: 'months',
            minViewMode: 'months',
            autoclose: true,
            ...options
        });
    },

    /**
     * Datepicker apenas ano
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    yearOnly(selector, options = {}) {
        return this.init(selector, {
            format: 'yyyy',
            viewMode: 'years',
            minViewMode: 'years',
            autoclose: true,
            ...options
        });
    },

    /**
     * Datepicker com hora (requer datetime picker)
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    dateTime(selector, options = {}) {
        return this.init(selector, {
            format: 'dd/mm/yyyy hh:ii',
            autoclose: true,
            todayHighlight: true,
            showMeridian: false,
            ...options
        });
    },

    /**
     * Range de datas (início e fim)
     * @param {string|HTMLElement} startSelector - Campo início
     * @param {string|HTMLElement} endSelector - Campo fim
     * @param {Object} options - Opções
     */
    range(startSelector, endSelector, options = {}) {
        const startElement = $(startSelector);
        const endElement = $(endSelector);

        if (!startElement.length || !endElement.length) {
            console.error('DatePicker.range: Elementos não encontrados');
            return null;
        }

        const startPicker = this.init(startSelector, {
            ...options,
            endDate: options.maxDate || '+0d'
        });

        const endPicker = this.init(endSelector, {
            ...options,
            startDate: options.minDate || '-0d'
        });

        // Sincronizar datas
        startElement.on('changeDate', function(e) {
            endPicker.setStartDate(e.date);
        });

        endElement.on('changeDate', function(e) {
            startPicker.setEndDate(e.date);
        });

        return {
            start: startPicker,
            end: endPicker,
            
            getRange() {
                return {
                    start: startPicker.getValue(),
                    end: endPicker.getValue()
                };
            },
            
            setRange(startDate, endDate) {
                startPicker.setValue(startDate);
                endPicker.setValue(endDate);
                return this;
            },
            
            clear() {
                startPicker.clear();
                endPicker.clear();
                return this;
            },
            
            destroy() {
                startPicker.destroy();
                endPicker.destroy();
                return this;
            }
        };
    },

    /**
     * Datepicker inline (embutido na página)
     * @param {string|HTMLElement} selector - Container
     * @param {Object} options - Opções
     */
    inline(selector, options = {}) {
        const element = $(selector);
        
        const datepicker = this.init(selector, {
            ...options,
            container: selector,
            orientation: 'auto'
        });

        element.datepicker('show');
        
        return datepicker;
    },

    /**
     * Datepicker que só permite datas futuras
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    futureOnly(selector, options = {}) {
        return this.init(selector, {
            startDate: new Date(),
            ...options
        });
    },

    /**
     * Datepicker que só permite datas passadas
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    pastOnly(selector, options = {}) {
        return this.init(selector, {
            endDate: new Date(),
            ...options
        });
    },

    /**
     * Datepicker sem fins de semana
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    weekdaysOnly(selector, options = {}) {
        return this.init(selector, {
            daysOfWeekDisabled: [0, 6], // Domingo e Sábado
            ...options
        });
    },

    /**
     * Datepicker com validação de idade mínima
     * @param {string|HTMLElement} selector - Seletor
     * @param {number} minAge - Idade mínima
     * @param {Object} options - Opções
     */
    minAge(selector, minAge = 18, options = {}) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - minAge);

        return this.init(selector, {
            endDate: maxDate,
            ...options
        });
    },

    /**
     * Datepicker com validação de idade máxima
     * @param {string|HTMLElement} selector - Seletor
     * @param {number} maxAge - Idade máxima
     * @param {Object} options - Opções
     */
    maxAge(selector, maxAge = 100, options = {}) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - maxAge);

        return this.init(selector, {
            startDate: minDate,
            ...options
        });
    },

    /**
     * Datepicker para data de nascimento
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    birthDate(selector, options = {}) {
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120); // Máximo 120 anos

        return this.init(selector, {
            startDate: minDate,
            endDate: today,
            defaultViewDate: { year: today.getFullYear() - 25 },
            ...options
        });
    },

    /**
     * Datepicker com múltiplas datas
     * @param {string|HTMLElement} selector - Seletor
     * @param {Object} options - Opções
     */
    multidate(selector, options = {}) {
        return this.init(selector, {
            multidate: true,
            multidateSeparator: ', ',
            ...options
        });
    },

    /**
     * Desabilitar datas específicas
     * @param {string|HTMLElement} selector - Seletor
     * @param {Array} dates - Array de datas a desabilitar
     * @param {Object} options - Opções
     */
    disableDates(selector, dates = [], options = {}) {
        return this.init(selector, {
            datesDisabled: dates,
            ...options
        });
    },

    /**
     * Desabilitar feriados brasileiros comuns
     * @param {string|HTMLElement} selector - Seletor
     * @param {number} year - Ano
     * @param {Object} options - Opções
     */
    disableHolidays(selector, year = new Date().getFullYear(), options = {}) {
        const holidays = this.getBrazilianHolidays(year);
        
        return this.init(selector, {
            datesDisabled: holidays.map(h => h.date),
            beforeShowDay: function(date) {
                const dateStr = date.toISOString().split('T')[0];
                const holiday = holidays.find(h => h.date === dateStr);
                
                if (holiday) {
                    return {
                        enabled: false,
                        classes: 'holiday',
                        tooltip: holiday.name
                    };
                }
                
                return { enabled: true };
            },
            ...options
        });
    },

    /**
     * Obtém feriados brasileiros de um ano
     * @param {number} year - Ano
     * @returns {Array} Array de feriados
     */
    getBrazilianHolidays(year) {
        const holidays = [
            { date: `${year}-01-01`, name: 'Ano Novo' },
            { date: `${year}-04-21`, name: 'Tiradentes' },
            { date: `${year}-05-01`, name: 'Dia do Trabalho' },
            { date: `${year}-09-07`, name: 'Independência do Brasil' },
            { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida' },
            { date: `${year}-11-02`, name: 'Finados' },
            { date: `${year}-11-15`, name: 'Proclamação da República' },
            { date: `${year}-12-25`, name: 'Natal' }
        ];

        // Adicionar feriados móveis (Carnaval, Páscoa, Corpus Christi)
        // Estas datas variam por ano e precisariam de cálculo específico
        
        return holidays;
    },

    /**
     * Formata data do datepicker
     * @param {Date} date - Data
     * @param {string} format - Formato (dd/mm/yyyy, mm/yyyy, etc)
     * @returns {string} Data formatada
     */
    formatDate(date, format = 'dd/mm/yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('dd', day)
            .replace('mm', month)
            .replace('yyyy', year)
            .replace('yy', String(year).slice(-2));
    },

    /**
     * Parse data do formato brasileiro
     * @param {string} dateStr - Data em string (dd/mm/yyyy)
     * @returns {Date} Objeto Date
     */
    parseDate(dateStr) {
        if (!dateStr) return null;
        
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        
        const [day, month, year] = parts;
        return new Date(year, month - 1, day);
    },

    /**
     * Valida data do datepicker
     * @param {string} dateStr - Data em string
     * @returns {boolean} True se válida
     */
    isValid(dateStr) {
        const date = this.parseDate(dateStr);
        return date && !isNaN(date.getTime());
    },

    /**
     * Calcula diferença entre duas datas
     * @param {Date|string} date1 - Primeira data
     * @param {Date|string} date2 - Segunda data
     * @returns {Object} Diferença em anos, meses e dias
     */
    diff(date1, date2) {
        const d1 = typeof date1 === 'string' ? this.parseDate(date1) : new Date(date1);
        const d2 = typeof date2 === 'string' ? this.parseDate(date2) : new Date(date2);
        
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            days: diffDays,
            weeks: Math.floor(diffDays / 7),
            months: Math.floor(diffDays / 30),
            years: Math.floor(diffDays / 365)
        };
    },

    /**
     * Adiciona CSS customizado para melhorar aparência
     */
    injectStyles() {
        if (document.getElementById('datepicker-custom-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'datepicker-custom-styles';
        style.textContent = `
            .datepicker {
                border-radius: 0.5rem;
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            }
            
            .datepicker table tr td.active.active,
            .datepicker table tr td.active.highlighted.active,
            .datepicker table tr td.active.highlighted:hover.active,
            .datepicker table tr td.active:hover.active {
                background-color: #007bff;
                background-image: linear-gradient(to bottom, #007bff, #0056b3);
            }
            
            .datepicker table tr td.today {
                background-color: #ffc107;
            }
            
            .datepicker table tr td.today:hover {
                background-color: #e0a800;
            }
            
            .datepicker table tr td.disabled,
            .datepicker table tr td.disabled:hover {
                color: #999;
                cursor: not-allowed;
            }
            
            .datepicker table tr td.holiday {
                background-color: #ffe5e5;
            }
            
            .datepicker .datepicker-switch:hover,
            .datepicker .prev:hover,
            .datepicker .next:hover,
            .datepicker tfoot tr th:hover {
                background-color: #e9ecef;
            }
        `;
        
        document.head.appendChild(style);
    },

    /**
     * Inicializa todos datepickers na página com data-datepicker
     */
    initAll() {
        this.injectStyles();
        
        $('[data-datepicker]').each((index, element) => {
            const $el = $(element);
            const type = $el.data('datepicker');
            const options = $el.data('datepicker-options') || {};
            
            switch (type) {
                case 'simple':
                    this.simple(element, options);
                    break;
                case 'month-year':
                    this.monthYear(element, options);
                    break;
                case 'year-only':
                    this.yearOnly(element, options);
                    break;
                case 'future':
                    this.futureOnly(element, options);
                    break;
                case 'past':
                    this.pastOnly(element, options);
                    break;
                case 'weekdays':
                    this.weekdaysOnly(element, options);
                    break;
                case 'birthdate':
                    this.birthDate(element, options);
                    break;
                default:
                    this.init(element, options);
            }
        });
    }
};

// Auto-inicializar ao carregar DOM
$(document).ready(function() {
    // Registrar locale pt-BR se não existir
    if ($.fn.datepicker && $.fn.datepicker.dates && !$.fn.datepicker.dates['pt-BR']) {
        $.fn.datepicker.dates['pt-BR'] = DatePicker.locales['pt-BR'];
    }
    
    // Injetar estilos
    DatePicker.injectStyles();
});

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatePicker;
}
