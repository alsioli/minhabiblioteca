let quero_ler = {

    _tabelaSelecionada: '',
    _localSelecionado:  '',
    _listaResultados:   [],

    // ─── Inicialização ───────────────────────────────────────────
    iniciar: async function () {
        this._tabelaSelecionada = '';
        this._localSelecionado  = '';
        this._listaResultados   = [];

        // Reset de seções
        $('#ql_secao_busca').addClass('d-none');
        $('#ql_secao_prioridade').addClass('d-none');
        $('#ql_livro_selecionado').addClass('d-none');
        $('#ql_busca_wrapper').show();
        $('#ql_resultados').empty();
        $('#ql_nao_encontrado').addClass('d-none');
        $('#ql_busca_titulo').val('');
        $('#ql_mensagem').empty();
        $('#ql_prioridade').val('');

        await this._carregarLocais();
    },

    // ─── Carrega origens da tabela LocalLeitura ──────────────────
    _carregarLocais: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            const json = await resp.json();
            const locais = json.status ? (json.data || []) : [];

            const sel = $('#ql_local');
            sel.empty().append('<option value="">Selecione a origem...</option>');
            locais.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}"
                                    data-tabela="${l.vTabelaVinculada}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar locais:', e);
        }
    },

    // ─── Evento de seleção da origem ─────────────────────────────
    onLocalChange: function () {
        const opt = $('#ql_local option:selected');
        this._localSelecionado  = opt.val();
        this._tabelaSelecionada = opt.data('tabela') || '';

        this._limparBusca();
        $('#ql_secao_busca').addClass('d-none');
        $('#ql_secao_prioridade').addClass('d-none');

        if (!this._localSelecionado) return;

        $('#ql_secao_busca').removeClass('d-none');
    },

    // ─── Busca de livros ─────────────────────────────────────────
    onBuscaKeyup: function (event) {
        if (event.key === 'Enter') this.buscarLivro();
    },

    buscarLivro: async function () {
        const titulo = $('#ql_busca_titulo').val().trim();

        $('#ql_resultados').empty();
        $('#ql_nao_encontrado').addClass('d-none');

        if (titulo.length < 3) {
            $('#ql_resultados').html(
                '<div class="alert alert-warning py-1 mb-1">Digite pelo menos 3 caracteres.</div>'
            );
            return;
        }

        if (!this._tabelaSelecionada) {
            $('#ql_resultados').html(
                '<div class="alert alert-warning py-1 mb-1">Selecione a origem antes de buscar.</div>'
            );
            return;
        }

        try {
            const body = new FormData();
            body.append('tabela',    this._tabelaSelecionada);
            body.append('titulo',    titulo);
            body.append('releitura', 'todos');

            const resp = await fetch('/php/api/base/menu_lateral/TBR/buscar_livro_tbr.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                $('#ql_nao_encontrado').removeClass('d-none');
                return;
            }

            this._montarResultados(json.data);
        } catch (e) {
            console.error('Erro ao buscar livro:', e);
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
                <tr onclick="quero_ler.selecionarLivro(${idx})" style="cursor:pointer">
                    <td style="padding:0.25rem">${livro.titulo  || ''}</td>
                    <td style="padding:0.25rem">${livro.autor   || ''}</td>
                    <td style="padding:0.25rem">${livro.paginas || '—'}</td>
                    <td style="padding:0.25rem">${livro.status  || '—'}</td>
                </tr>
            `;
        });

        tabela += '</tbody></table>';
        $('#ql_resultados').html(tabela);
    },

    selecionarLivro: function (idx) {
        const livro = this._listaResultados[idx];
        if (!livro) return;

        // Preenche hidden fields
        $('#ql_livro_titulo').val(livro.titulo   || '');
        $('#ql_livro_autor').val(livro.autor     || '');
        $('#ql_livro_paginas').val(livro.paginas || '');
        $('#ql_livro_tema').val(livro.tema       || '');
        $('#ql_livro_natureza').val(livro.natureza || '');

        // Preenche displays
        $('#ql_titulo_display').text(livro.titulo   || '');
        $('#ql_autor_display').text(livro.autor     || '—');
        $('#ql_paginas_display').text(livro.paginas || '—');
        $('#ql_tema_display').text(livro.tema       || '—');
        $('#ql_natureza_display').text(livro.natureza || '—');

        // Mostra livro selecionado e seção de prioridade; esconde busca
        $('#ql_resultados').empty();
        $('#ql_nao_encontrado').addClass('d-none');
        $('#ql_busca_wrapper').hide();
        $('#ql_livro_selecionado').removeClass('d-none');
        $('#ql_secao_prioridade').removeClass('d-none');
    },

    limparLivro: function () {
        $('#ql_livro_selecionado').addClass('d-none');
        $('#ql_secao_prioridade').addClass('d-none');
        $('#ql_busca_wrapper').show();
        $('#ql_busca_titulo').val('');
        $('#ql_resultados').empty();
    },

    _limparBusca: function () {
        this._listaResultados = [];
        $('#ql_resultados').empty();
        $('#ql_nao_encontrado').addClass('d-none');
        $('#ql_busca_titulo').val('');
        $('#ql_livro_selecionado').addClass('d-none');
        $('#ql_secao_prioridade').addClass('d-none');
        $('#ql_busca_wrapper').show();
    },

    // ─── Salvar ──────────────────────────────────────────────────
    salvar: async function () {
        const titulo     = $('#ql_livro_titulo').val().trim();
        const prioridade = $('#ql_prioridade').val();

        if (!titulo) {
            this._mostrarMensagem('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        if (!prioridade) {
            this._mostrarMensagem('danger', 'Selecione a prioridade de leitura.');
            return;
        }

        const body = new FormData();
        body.append('origem',     this._localSelecionado);
        body.append('titulo',     titulo);
        body.append('autor',      $('#ql_livro_autor').val());
        body.append('paginas',    $('#ql_livro_paginas').val());
        body.append('tema',       $('#ql_livro_tema').val());
        body.append('natureza',   $('#ql_livro_natureza').val());
        body.append('prioridade', prioridade);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/QueroLer/create_quero_ler.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagem('danger', json.error || 'Erro ao salvar.');
                return;
            }

            $('#modalQueroLerLogo').modal('hide');

            Swal.fire({
                title: 'Salvo!',
                text: `"${titulo}" foi adicionado à lista Quero Ler Logo.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            console.error('Erro ao salvar Quero Ler Logo:', e);
            this._mostrarMensagem('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    // ─── Mensagens ───────────────────────────────────────────────
    _mostrarMensagem: function (tipo, texto) {
        $('#ql_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }

};

window.quero_ler = quero_ler;
