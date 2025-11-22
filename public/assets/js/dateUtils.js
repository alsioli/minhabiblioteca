/**
 * Biblioteca de Utilitários para Manipulação de Datas
 * Funções reutilizáveis para formatação e validação de datas
 */

const DateUtils = {
    /**
     * Formata uma data no padrão brasileiro (dd/mm/yyyy)
     * @param {Date|string} date - Data a ser formatada
     * @returns {string} Data formatada
     */
    formatToBR(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return `${day}/${month}/${year}`;
    },

    /**
     * Formata data com hora no padrão brasileiro (dd/mm/yyyy HH:mm:ss)
     * @param {Date|string} date - Data a ser formatada
     * @returns {string} Data e hora formatadas
     */
    formatDateTimeToBR(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * Converte data brasileira (dd/mm/yyyy) para formato ISO (yyyy-mm-dd)
     * @param {string} brDate - Data no formato brasileiro
     * @returns {string} Data no formato ISO
     */
    brToISO(brDate) {
        if (!brDate) return '';
        
        const parts = brDate.split('/');
        if (parts.length !== 3) return '';
        
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },

    /**
     * Valida se uma data está no formato brasileiro válido
     * @param {string} date - Data a ser validada (dd/mm/yyyy)
     * @returns {boolean} True se válida
     */
    isValidBRDate(date) {
        if (!date) return false;
        
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = date.match(regex);
        
        if (!match) return false;
        
        const [, day, month, year] = match;
        const d = new Date(year, month - 1, day);
        
        return d.getFullYear() == year && 
               (d.getMonth() + 1) == month && 
               d.getDate() == day;
    },

    /**
     * Adiciona dias a uma data
     * @param {Date|string} date - Data base
     * @param {number} days - Número de dias a adicionar
     * @returns {Date} Nova data
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Adiciona meses a uma data
     * @param {Date|string} date - Data base
     * @param {number} months - Número de meses a adicionar
     * @returns {Date} Nova data
     */
    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },

    /**
     * Calcula diferença em dias entre duas datas
     * @param {Date|string} date1 - Primeira data
     * @param {Date|string} date2 - Segunda data
     * @returns {number} Diferença em dias
     */
    diffInDays(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Verifica se uma data é hoje
     * @param {Date|string} date - Data a verificar
     * @returns {boolean} True se for hoje
     */
    isToday(date) {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },

    /**
     * Obtém o primeiro dia do mês
     * @param {Date|string} date - Data de referência
     * @returns {Date} Primeiro dia do mês
     */
    getFirstDayOfMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    },

    /**
     * Obtém o último dia do mês
     * @param {Date|string} date - Data de referência
     * @returns {Date} Último dia do mês
     */
    getLastDayOfMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    },

    /**
     * Formata data para SQL Server (yyyy-mm-dd HH:mm:ss)
     * @param {Date|string} date - Data a ser formatada
     * @returns {string} Data formatada para SQL
     */
    formatToSQL(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * Retorna nome do mês em português
     * @param {number} month - Número do mês (0-11)
     * @returns {string} Nome do mês
     */
    getMonthName(month) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month];
    },

    /**
     * Retorna nome do dia da semana em português
     * @param {number} day - Número do dia (0-6, começando no domingo)
     * @returns {string} Nome do dia
     */
    getDayName(day) {
        const days = [
            'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado'
        ];
        return days[day];
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateUtils;
}
