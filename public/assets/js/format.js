/**
 * Biblioteca de Formatação de Dados
 * Funções para formatar números, moedas, CPF, CNPJ, telefones, etc.
 */

const Format = {
    /**
     * Formata número como moeda brasileira
     * @param {number|string} value - Valor a formatar
     * @param {boolean} showSymbol - Mostrar símbolo R$
     * @returns {string} Valor formatado
     */
    currency(value, showSymbol = true) {
        const num = parseFloat(value) || 0;
        const formatted = num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return showSymbol ? `R$ ${formatted}` : formatted;
    },

    /**
     * Formata número com separadores de milhar
     * @param {number|string} value - Valor a formatar
     * @param {number} decimals - Casas decimais
     * @returns {string} Número formatado
     */
    number(value, decimals = 0) {
        const num = parseFloat(value) || 0;
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formata CPF (000.000.000-00)
     * @param {string} cpf - CPF sem formatação
     * @returns {string} CPF formatado
     */
    cpf(cpf) {
        if (!cpf) return '';
        
        const cleaned = cpf.replace(/\D/g, '');
        
        if (cleaned.length !== 11) return cpf;
        
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    /**
     * Formata CNPJ (00.000.000/0000-00)
     * @param {string} cnpj - CNPJ sem formatação
     * @returns {string} CNPJ formatado
     */
    cnpj(cnpj) {
        if (!cnpj) return '';
        
        const cleaned = cnpj.replace(/\D/g, '');
        
        if (cleaned.length !== 14) return cnpj;
        
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },

    /**
     * Formata CPF ou CNPJ automaticamente
     * @param {string} value - CPF ou CNPJ
     * @returns {string} Documento formatado
     */
    cpfCnpj(value) {
        if (!value) return '';
        
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return this.cpf(cleaned);
        } else if (cleaned.length === 14) {
            return this.cnpj(cleaned);
        }
        
        return value;
    },

    /**
     * Formata telefone (00) 0000-0000 ou (00) 00000-0000
     * @param {string} phone - Telefone sem formatação
     * @returns {string} Telefone formatado
     */
    phone(phone) {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            // Fixo: (00) 0000-0000
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 11) {
            // Celular: (00) 00000-0000
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    },

    /**
     * Formata CEP (00000-000)
     * @param {string} cep - CEP sem formatação
     * @returns {string} CEP formatado
     */
    cep(cep) {
        if (!cep) return '';
        
        const cleaned = cep.replace(/\D/g, '');
        
        if (cleaned.length !== 8) return cep;
        
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    },

    /**
     * Formata porcentagem
     * @param {number|string} value - Valor (0-100 ou 0-1)
     * @param {number} decimals - Casas decimais
     * @param {boolean} isDecimal - Se valor está entre 0-1
     * @returns {string} Porcentagem formatada
     */
    percent(value, decimals = 2, isDecimal = false) {
        let num = parseFloat(value) || 0;
        
        if (isDecimal) {
            num = num * 100;
        }
        
        return num.toFixed(decimals) + '%';
    },

    /**
     * Formata tamanho de arquivo
     * @param {number} bytes - Tamanho em bytes
     * @param {number} decimals - Casas decimais
     * @returns {string} Tamanho formatado
     */
    fileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },

    /**
     * Capitaliza primeira letra de cada palavra
     * @param {string} text - Texto
     * @returns {string} Texto capitalizado
     */
    capitalize(text) {
        if (!text) return '';
        
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    },

    /**
     * Trunca texto com reticências
     * @param {string} text - Texto
     * @param {number} length - Tamanho máximo
     * @param {string} suffix - Sufixo (padrão: ...)
     * @returns {string} Texto truncado
     */
    truncate(text, length, suffix = '...') {
        if (!text) return '';
        
        if (text.length <= length) return text;
        
        return text.substring(0, length) + suffix;
    },

    /**
     * Remove formatação de CPF
     * @param {string} cpf - CPF formatado
     * @returns {string} Apenas números
     */
    unformatCpf(cpf) {
        return cpf ? cpf.replace(/\D/g, '') : '';
    },

    /**
     * Remove formatação de CNPJ
     * @param {string} cnpj - CNPJ formatado
     * @returns {string} Apenas números
     */
    unformatCnpj(cnpj) {
        return cnpj ? cnpj.replace(/\D/g, '') : '';
    },

    /**
     * Remove formatação de telefone
     * @param {string} phone - Telefone formatado
     * @returns {string} Apenas números
     */
    unformatPhone(phone) {
        return phone ? phone.replace(/\D/g, '') : '';
    },

    /**
     * Remove formatação de CEP
     * @param {string} cep - CEP formatado
     * @returns {string} Apenas números
     */
    unformatCep(cep) {
        return cep ? cep.replace(/\D/g, '') : '';
    },

    /**
     * Remove formatação de moeda
     * @param {string} currency - Valor formatado
     * @returns {number} Valor numérico
     */
    unformatCurrency(currency) {
        if (!currency) return 0;
        
        const cleaned = currency
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        return parseFloat(cleaned) || 0;
    },

    /**
     * Formata número de cartão de crédito
     * @param {string} cardNumber - Número do cartão
     * @returns {string} Cartão formatado (0000 0000 0000 0000)
     */
    creditCard(cardNumber) {
        if (!cardNumber) return '';
        
        const cleaned = cardNumber.replace(/\D/g, '');
        
        return cleaned.replace(/(\d{4})/g, '$1 ').trim();
    },

    /**
     * Mascara número de cartão (mostra apenas últimos 4 dígitos)
     * @param {string} cardNumber - Número do cartão
     * @returns {string} Cartão mascarado
     */
    maskCreditCard(cardNumber) {
        if (!cardNumber) return '';
        
        const cleaned = cardNumber.replace(/\D/g, '');
        
        if (cleaned.length < 4) return cardNumber;
        
        const lastFour = cleaned.slice(-4);
        const masked = '**** **** **** ' + lastFour;
        
        return masked;
    },

    /**
     * Formata placa de veículo (ABC-1234 ou ABC1D23)
     * @param {string} plate - Placa
     * @returns {string} Placa formatada
     */
    plate(plate) {
        if (!plate) return '';
        
        const cleaned = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        
        if (cleaned.length === 7) {
            // Verifica se é Mercosul (letra na 5ª posição)
            if (/[A-Z]/.test(cleaned[4])) {
                // Mercosul: ABC1D23
                return cleaned.replace(/(\w{3})(\w)(\w{2})/, '$1$2$3');
            } else {
                // Antiga: ABC-1234
                return cleaned.replace(/(\w{3})(\w{4})/, '$1-$2');
            }
        }
        
        return plate;
    },

    /**
     * Formata RG
     * @param {string} rg - RG sem formatação
     * @returns {string} RG formatado (00.000.000-0)
     */
    rg(rg) {
        if (!rg) return '';
        
        const cleaned = rg.replace(/\D/g, '');
        
        if (cleaned.length === 9) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
        }
        
        return rg;
    },

    /**
     * Formata título de eleitor
     * @param {string} titulo - Título sem formatação
     * @returns {string} Título formatado (0000 0000 0000)
     */
    tituloEleitor(titulo) {
        if (!titulo) return '';
        
        const cleaned = titulo.replace(/\D/g, '');
        
        if (cleaned.length === 12) {
            return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
        }
        
        return titulo;
    },

    /**
     * Formata código de barras
     * @param {string} barcode - Código de barras
     * @returns {string} Código formatado
     */
    barcode(barcode) {
        if (!barcode) return '';
        
        const cleaned = barcode.replace(/\D/g, '');
        
        // Boleto (47 dígitos)
        if (cleaned.length === 47) {
            return cleaned.replace(
                /(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
                '$1.$2 $3.$4 $5.$6 $7 $8'
            );
        }
        
        return barcode;
    },

    /**
     * Aplica máscara personalizada
     * @param {string} value - Valor
     * @param {string} mask - Máscara (ex: "###.###.###-##")
     * @returns {string} Valor formatado
     */
    applyMask(value, mask) {
        if (!value || !mask) return value;
        
        const cleaned = value.replace(/\D/g, '');
        let formatted = '';
        let valueIndex = 0;
        
        for (let i = 0; i < mask.length && valueIndex < cleaned.length; i++) {
            if (mask[i] === '#') {
                formatted += cleaned[valueIndex];
                valueIndex++;
            } else {
                formatted += mask[i];
            }
        }
        
        return formatted;
    }
};

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Format;
}
