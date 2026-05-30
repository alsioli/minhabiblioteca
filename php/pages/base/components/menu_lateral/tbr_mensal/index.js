let tbr_mensal = {

    _locais:          [],
    _tabelaSelecionada: '',
    _localSelecionado:  '',
    _listaResultados:   [],

    // ─── Inicialização ───────────────────────────────────────────
    iniciar: async function () {
        this._tabelaSelecionada = '';
        this._localSelecionado  = '';
        this._listaResultados   = [];

        // Reset de seções
        $('#tbr_secao_releitura').addClass('d-none');
        $('#tbr_secao_busca').addClass('d-none');
        $('#tbr_secao_previsao').addClass('d-none');
        $('#tbr_livro_selecionado').addClass('d-none');
        $('#tbr_busca_wrapper').show();
        $('#tbr_resultados').empty();
        $('#tbr_nao_encontrado').addClass('d-none');
        $('#tbr_busca_titulo').val('');
        $('#tbr_mensagem').empty();
        $('#tbr_mes_referencia').val('');
        $('#tbr_previsao_leitura').val('');
        $('#tbr_rel_nao').prop('checked', true);
        this._atualizarHintReleitura();

        await this._carregarLocais();
    },

    // ─── Carrega origens da tabela LocalLeitura ──────────────────
    _carregarLocais: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            const json = await resp.json();
            this._locais = json.status ? (json.data || []) : [];

            const sel = $('#tbr_local');
            sel.empty().append('<option value="">Selecione a origem...</option>');
            this._locais.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}"
                                    data-tabela="${l.vTabelaVinculada}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar locais:', e);
        }
    },

    // ─── Eventos de seleção ──────────────────────────────────────
    onLocalChange: function () {
        const opt = $('#tbr_local option:selected');
        this._localSelecionado  = opt.val();
        this._tabelaSelecionada = opt.data('tabela') || '';

        this._limparBusca();
        $('#tbr_secao_busca').addClass('d-none');
        $('#tbr_secao_previsao').addClass('d-none');

        if (!this._localSelecionado) {
            $('#tbr_secao_releitura').addClass('d-none');
            return;
        }

        $('#tbr_secao_releitura').removeClass('d-none');
        $('#tbr_secao_busca').removeClass('d-none');
    },

    onReleituraChange: function () {
        this._atualizarHintReleitura();
        this._limparBusca();
    },

    _atualizarHintReleitura: function () {
        const releitura = $('input[name="tbr_releitura"]:checked').val();
        const hint = releitura === 'sim'
            ? 'Serão exibidos livros com status Lido, Abandonado ou Interrompido.'
            : 'Serão exibidos livros ainda não lidos.';
        $('#tbr_releitura_hint').text(hint);
    },

    // ─── Busca de livros ─────────────────────────────────────────
    onBuscaKeyup: function (event) {
        if (event.key === 'Enter') this.buscarLivro();
    },

    buscarLivro: async function () {
        const titulo = $('#tbr_busca_titulo').val().trim();

        $('#tbr_resultados').empty();
        $('#tbr_nao_encontrado').addClass('d-none');

        if (titulo.length < 3) {
            $('#tbr_resultados').html(
                '<div class="alert alert-warning py-1 mb-1">Digite pelo menos 3 caracteres.</div>'
            );
            return;
        }

        if (!this._tabelaSelecionada) {
            $('#tbr_resultados').html(
                '<div class="alert alert-warning py-1 mb-1">Selecione a origem.</div>'
            );
            return;
        }

        const releitura = $('input[name="tbr_releitura"]:checked').val() || 'nao';

        try {
            const body = new FormData();
            body.append('tabela',    this._tabelaSelecionada);
            body.append('titulo',    titulo);
            body.append('releitura', releitura);

            const resp = await fetch('/php/api/base/menu_lateral/TBR/buscar_livro_tbr.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                $('#tbr_nao_encontrado').removeClass('d-none');
                return;
            }

            this._montarResultados(json.data);
        } catch (e) {
            console.error('Erro ao buscar:', e);
        }
    },

    _montarResultados: function (lista) {
        this._listaResultados = lista;

        let tabela = `
            <table class="table table-sm table-hover mt-1 mb-1" style="font-size:0.85rem">
                <thead>
                    <tr>
                        <th style="padding:0.25rem">Título</th>
                        <th style="padding:0.25rem">Autor</th>
                        <th style="padding:0.25rem">Páginas</th>
                        <th style="padding:0.25rem">Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        lista.forEach((livro, idx) => {
            tabela += `
                <tr onclick="tbr_mensal.selecionarLivro(${idx})" style="cursor:pointer">
                    <td style="padding:0.25rem">${livro.titulo || ''}</td>
                    <td style="padding:0.25rem">${livro.autor  || ''}</td>
                    <td style="padding:0.25rem">${livro.paginas || '—'}</td>
                    <td style="padding:0.25rem">${livro.status  || '—'}</td>
                </tr>
            `;
        });

        tabela += '</tbody></table>';
        $('#tbr_resultados').html(tabela);
    },

    selecionarLivro: function (idx) {
        const livro = this._listaResultados[idx];
        if (!livro) return;

        // Preenche hidden fields
        $('#tbr_livro_titulo').val(livro.titulo      || '');
        $('#tbr_livro_autor').val(livro.autor        || '');
        $('#tbr_livro_sexo_autor').val(livro.sexo_autor  || '');
        $('#tbr_livro_pais').val(livro.pais          || '');
        $('#tbr_livro_natureza').val(livro.natureza  || '');
        $('#tbr_livro_tema').val(livro.tema          || '');
        $('#tbr_livro_tipo_edicao').val(livro.tipo_edicao || '');
        $('#tbr_livro_paginas').val(livro.paginas    || '');

        // Preenche displays
        $('#tbr_titulo_display').text(livro.titulo      || '');
        $('#tbr_autor_display').text(livro.autor        || '—');
        $('#tbr_sexo_display').text(livro.sexo_autor    || '—');
        $('#tbr_pais_display').text(livro.pais          || '—');
        $('#tbr_paginas_display').text(livro.paginas    || '—');
        $('#tbr_natureza_display').text(livro.natureza  || '—');
        $('#tbr_tema_display').text(livro.tema          || '—');
        $('#tbr_tipo_edicao_display').text(livro.tipo_edicao || '—');

        // Mostra livro selecionado e seção de previsão; esconde busca
        $('#tbr_resultados').empty();
        $('#tbr_nao_encontrado').addClass('d-none');
        $('#tbr_busca_wrapper').hide();
        $('#tbr_livro_selecionado').removeClass('d-none');
        $('#tbr_secao_previsao').removeClass('d-none');
    },

    limparLivro: function () {
        $('#tbr_livro_selecionado').addClass('d-none');
        $('#tbr_secao_previsao').addClass('d-none');
        $('#tbr_busca_wrapper').show();
        $('#tbr_busca_titulo').val('');
        $('#tbr_resultados').empty();
    },

    _limparBusca: function () {
        this._listaResultados = [];
        $('#tbr_resultados').empty();
        $('#tbr_nao_encontrado').addClass('d-none');
        $('#tbr_busca_titulo').val('');
        $('#tbr_livro_selecionado').addClass('d-none');
        $('#tbr_secao_previsao').addClass('d-none');
        $('#tbr_busca_wrapper').show();
    },

    // ─── Salvar TBR ──────────────────────────────────────────────
    salvar: async function () {
        const titulo          = $('#tbr_livro_titulo').val().trim();
        const mesInput        = $('#tbr_mes_referencia').val();       // "YYYY-MM"
        const previsao        = $('#tbr_previsao_leitura').val();
        const releitura       = $('input[name="tbr_releitura"]:checked').val() || '';

        if (!titulo) {
            this._mostrarMensagem('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        if (!mesInput) {
            this._mostrarMensagem('danger', 'Informe o mês de referência.');
            return;
        }

        if (!previsao) {
            this._mostrarMensagem('danger', 'Selecione quando no mês planeja ler o livro.');
            return;
        }

        // Converte "YYYY-MM" → "MM/YYYY"
        const [ano, mes] = mesInput.split('-');
        const mesReferencia = `${mes}/${ano}`;

        const body = new FormData();
        body.append('origem',           this._localSelecionado);
        body.append('releitura',        releitura === 'sim' ? 'Sim' : 'Não');
        body.append('titulo',           titulo);
        body.append('autor',            $('#tbr_livro_autor').val());
        body.append('sexo_autor',       $('#tbr_livro_sexo_autor').val());
        body.append('pais',             $('#tbr_livro_pais').val());
        body.append('natureza',         $('#tbr_livro_natureza').val());
        body.append('tema',             $('#tbr_livro_tema').val());
        body.append('tipo_edicao',      $('#tbr_livro_tipo_edicao').val());
        body.append('paginas',          $('#tbr_livro_paginas').val());
        body.append('mes_referencia',   mesReferencia);
        body.append('previsao_leitura', previsao);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/TBR/create_tbr.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagem('danger', json.error || 'Erro ao salvar.');
                return;
            }

            $('#modalTBRMensal').modal('hide');

            Swal.fire({
                title: 'TBR salvo!',
                text: `"${titulo}" foi adicionado ao TBR de ${mes}/${ano}.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            console.error('Erro ao salvar TBR:', e);
            this._mostrarMensagem('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    // ─── Mensagens ───────────────────────────────────────────────
    _mostrarMensagem: function (tipo, texto) {
        $('#tbr_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }

};

window.tbr_mensal = tbr_mensal;
