let minhas_leituras = {

    _locais: [],
    _tabelaSelecionada: '',
    _localSelecionado: '',
    _grupos: [],
    _desafios: [],
    _listaResultados: [],

    iniciar: async function () {
        this._tabelaSelecionada = '';
        this._localSelecionado  = '';

        $('#cl_secao_livro').addClass('d-none');
        $('#cl_secao_dados').addClass('d-none');
        $('#cl_livro_selecionado').addClass('d-none');
        $('#cl_busca_wrapper').show();
        $('#cl_resultados').empty();
        $('#cl_nao_encontrado').addClass('d-none');
        $('#cl_mensagem').empty();
        $('#cl_busca_titulo').val('');
        $('#cl_mes_display').text('—');
        $('#cl_sub_lc').addClass('d-none');
        $('#cl_sub_desafio').addClass('d-none');
        $('#cl_natureza').val('');
        $('#cl_tipo_midia').val('');
        $('#cl_avaliacao').val('');
        $('#cl_data_inicio').val('');

        await Promise.all([
            this._carregarLocais(),
            this._carregarGrupos(),
            this._carregarDesafios(),
            this._carregarTipoMidia(),
        ]);
    },

    _carregarLocais: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            const json = await resp.json();
            this._locais = json.status ? json.data : [];

            const sel = $('#cl_local');
            sel.empty().append('<option value="">Selecione o local...</option>');
            this._locais.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}"
                                    data-tabela="${l.vTabelaVinculada}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar locais:', e);
        }
    },

    _carregarGrupos: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_grupos_lc.php');
            const json = await resp.json();
            this._grupos = json.status ? json.data : [];

            const sel = $('#cl_lc_grupo');
            sel.empty().append('<option value="">Selecione a LC...</option>');
            this._grupos.forEach(g => {
                sel.append(`<option value="${g.nome_lc}">${g.nome_lc}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar grupos LC:', e);
        }
    },

    _carregarDesafios: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/listar_desafios.php');
            const json = await resp.json();
            this._desafios = json.status ? json.data : [];

            const sel = $('#cl_desafio');
            sel.empty().append('<option value="">Selecione o desafio...</option>');
            this._desafios.forEach(d => {
                sel.append(`<option value="${d.tematica}">${d.tematica}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar desafios:', e);
        }
    },

    _carregarTipoMidia: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/listar_tipo_midia.php');
            const json = await resp.json();

            const sel = $('#cl_tipo_midia');
            sel.empty().append('<option value="">Selecione</option>');

            if (json.status && json.data && json.data.length > 0) {
                json.data.forEach(row => {
                    sel.append(`<option value="${row.tipo_midia}">${row.tipo_midia}</option>`);
                });
            } else {
                // Fallback com valores padrão
                ['Físico', 'Ebook', 'Kindle', 'Audiobook', 'Skeelo'].forEach(v => {
                    sel.append(`<option value="${v}">${v}</option>`);
                });
            }
        } catch (e) {
            console.error('Erro ao carregar tipo mídia:', e);
        }
    },

    onLocalChange: function () {
        const opt = $('#cl_local option:selected');
        const local = opt.val();

        this._localSelecionado  = local;
        this._tabelaSelecionada = opt.data('tabela') || '';

        $('#cl_resultados').empty();
        $('#cl_nao_encontrado').addClass('d-none');
        $('#cl_livro_selecionado').addClass('d-none');
        $('#cl_busca_wrapper').show();
        $('#cl_busca_titulo').val('');
        $('#cl_secao_dados').addClass('d-none');

        if (!local) {
            $('#cl_secao_livro').addClass('d-none');
            return;
        }

        $('#cl_secao_livro').removeClass('d-none');
    },

    onBuscaKeyup: function (event) {
        if (event.key === 'Enter') {
            this.buscarLivro();
        }
    },

    buscarLivro: async function () {
        const titulo = $('#cl_busca_titulo').val().trim();

        $('#cl_resultados').empty();
        $('#cl_nao_encontrado').addClass('d-none');

        if (titulo.length < 3) {
            $('#cl_resultados').html('<div class="alert alert-warning py-1 mb-1">Digite pelo menos 3 caracteres.</div>');
            return;
        }

        if (!this._tabelaSelecionada) {
            $('#cl_resultados').html('<div class="alert alert-warning py-1 mb-1">Selecione o local de leitura.</div>');
            return;
        }

        try {
            const body = new FormData();
            body.append('tabela', this._tabelaSelecionada);
            body.append('titulo', titulo);

            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/buscar_livro_tabela.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                $('#cl_nao_encontrado').removeClass('d-none');
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
                    </tr>
                </thead>
                <tbody>
        `;

        lista.forEach((livro, idx) => {
            tabela += `
                <tr onclick="minhas_leituras.selecionarLivro(${idx})" style="cursor:pointer">
                    <td style="padding:0.25rem">${livro.titulo || ''}</td>
                    <td style="padding:0.25rem">${livro.autor  || ''}</td>
                    <td style="padding:0.25rem">${livro.paginas || ''}</td>
                </tr>
            `;
        });

        tabela += '</tbody></table>';
        $('#cl_resultados').html(tabela);
    },

    selecionarLivro: function (idx) {
        const livro = this._listaResultados[idx];
        if (!livro) return;

        // Preenche hidden inputs com os dados já disponíveis
        $('#cl_livro_id').val(livro.id || '');
        $('#cl_livro_local').val(this._localSelecionado);
        $('#cl_livro_titulo').val(livro.titulo || '');
        $('#cl_livro_autor').val(livro.autor   || '');
        $('#cl_livro_paginas').val(livro.paginas || '');
        $('#cl_livro_sexo_autor').val('');
        $('#cl_livro_pais').val('');
        $('#cl_livro_raca').val('');
        $('#cl_livro_tema').val('');

        // Pré-seleciona o Tipo de Mídia se o livro já tiver tipo_edicao cadastrado
        if (livro.tipo_edicao) {
            $('#cl_tipo_midia').val(livro.tipo_edicao);
        }

        // Exibe informações
        $('#cl_titulo_display').text(livro.titulo  || '');
        $('#cl_autor_display').text(livro.autor    || '');
        $('#cl_paginas_display').text(livro.paginas || '—');
        $('#cl_tema_display').text('—');

        // Mostra bloco de livro selecionado, esconde busca e resultados
        $('#cl_resultados').empty();
        $('#cl_nao_encontrado').addClass('d-none');
        $('#cl_busca_wrapper').hide();
        $('#cl_livro_selecionado').removeClass('d-none');

        // Revela seção de dados
        $('#cl_secao_dados').removeClass('d-none');
    },

    limparLivroSelecionado: function () {
        $('#cl_livro_selecionado').addClass('d-none');
        $('#cl_secao_dados').addClass('d-none');
        $('#cl_busca_wrapper').show();
        $('#cl_resultados').empty();
        $('#cl_busca_titulo').val('');
    },

    abrirCadastroLivro: function () {
        const localAtual = this._localSelecionado;
        const tituloAtual = $('#cl_busca_titulo').val().trim();

        $('#modalComecarLivro').modal('hide');

        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('#modalNovoLivro').remove();
                $('body').append(html);
                $('#modalNovoLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        biblioteca.carregarSelects().then(function () {
                            if (localAtual) {
                                $('#select_local_cadastro').val(localAtual);
                                biblioteca.onLocalCadastroChange();
                            }
                            if (tituloAtual) {
                                $('#livro_titulo').val(tituloAtual);
                            }
                        });
                    });
            }
        });
    },

    onNaturezaChange: function () {
        const val = $('#cl_natureza').val();
        $('#cl_sub_lc').addClass('d-none');
        $('#cl_sub_desafio').addClass('d-none');

        if (val === 'LC') {
            $('#cl_sub_lc').removeClass('d-none');
        } else if (val === 'Desafio') {
            $('#cl_sub_desafio').removeClass('d-none');
        }
    },

    onDataInicioChange: function () {
        const val = $('#cl_data_inicio').val();
        if (!val) {
            $('#cl_mes_display').text('—');
            return;
        }
        const [ano, mes] = val.split('-');
        $('#cl_mes_display').text(`${mes}/${ano}`);
    },

    _getNaturezaFinal: function () {
        const natureza = $('#cl_natureza').val();
        if (natureza === 'LC') {
            return $('#cl_lc_grupo').val() || 'LC';
        }
        if (natureza === 'Desafio') {
            return $('#cl_desafio').val() || 'Desafio';
        }
        return natureza;
    },

    salvarLeitura: async function () {
        const titulo     = $('#cl_livro_titulo').val();
        const autor      = $('#cl_livro_autor').val();
        const data_inicio = $('#cl_data_inicio').val();

        if (!titulo || !autor) {
            this._mostrarMensagem('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        if (!data_inicio) {
            this._mostrarMensagem('danger', 'Data de início é obrigatória.');
            return;
        }

        const natureza = this._getNaturezaFinal();
        const naturezaSel = $('#cl_natureza').val();

        if (naturezaSel === 'LC' && !$('#cl_lc_grupo').val()) {
            this._mostrarMensagem('danger', 'Selecione o grupo de LC.');
            return;
        }
        if (naturezaSel === 'Desafio' && !$('#cl_desafio').val()) {
            this._mostrarMensagem('danger', 'Selecione o desafio.');
            return;
        }

        const body = new FormData();
        body.append('titulo',      titulo);
        body.append('autor',       autor);
        body.append('paginas',     $('#cl_livro_paginas').val());
        body.append('tipo_midia',  $('#cl_tipo_midia').val());
        body.append('natureza',    natureza);
        body.append('data_inicio', data_inicio);
        body.append('avaliacao',   $('#cl_avaliacao').val());
        body.append('sexo_autor',  $('#cl_livro_sexo_autor').val());
        body.append('pais',        $('#cl_livro_pais').val());
        body.append('raca',        $('#cl_livro_raca').val());
        body.append('tema',        $('#cl_livro_tema').val());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/create_leitura.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagem('danger', json.error || 'Erro ao salvar leitura.');
                return;
            }

            $('#modalComecarLivro').modal('hide');

            Swal.fire({
                title: 'Leitura registrada!',
                text: `"${titulo}" foi adicionado às suas leituras.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            console.error('Erro ao salvar leitura:', e);
            this._mostrarMensagem('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagem: function (tipo, texto) {
        $('#cl_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    },

    // ─────────────────────────────────────────────────────────────
    //  ATUALIZANDO A LEITURA ATUAL
    // ─────────────────────────────────────────────────────────────

    _leiturasAndamento: [],

    iniciarAtualizacao: async function () {
        this._leiturasAndamento = [];

        $('#al_secao_progresso').addClass('d-none');
        $('#al_secao_impressoes').addClass('d-none');
        $('#al_secao_avaliacao').addClass('d-none');
        $('#al_wrapper_percentual').addClass('d-none');
        $('#al_wrapper_pagina').addClass('d-none');
        $('#al_mensagem').empty();
        $('#al_tipo_input').val('');
        $('#al_percentual').val('');
        $('#al_pagina_atual').val('');
        $('#al_impressoes').val('');
        $('#al_avaliacao').val('');
        $('#al_pagina_calc_display').text('—');
        $('#al_percentual_calc_display').text('—');

        await this._carregarLeiturasAndamento();
    },

    _carregarLeiturasAndamento: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/listar_leituras_andamento.php');
            const json = await resp.json();
            this._leiturasAndamento = json.status ? (json.data || []) : [];

            const sel = $('#al_leitura');
            sel.empty().append('<option value="">Selecione o livro...</option>');

            if (this._leiturasAndamento.length === 0) {
                sel.append('<option value="" disabled>Nenhuma leitura em andamento</option>');
                return;
            }

            this._leiturasAndamento.forEach((l, idx) => {
                const autor = l.autor ? ` — ${l.autor}` : '';
                sel.append(`<option value="${idx}">${l.titulo}${autor}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar leituras em andamento:', e);
        }
    },

    onLeituraAndamentoChange: function () {
        const idx = $('#al_leitura').val();

        $('#al_secao_progresso').addClass('d-none');
        $('#al_secao_impressoes').addClass('d-none');
        $('#al_secao_avaliacao').addClass('d-none');
        $('#al_wrapper_percentual').addClass('d-none');
        $('#al_wrapper_pagina').addClass('d-none');
        $('#al_tipo_input').val('');
        $('#al_percentual').val('');
        $('#al_pagina_atual').val('');
        $('#al_pagina_calc_display').text('—');
        $('#al_percentual_calc_display').text('—');

        if (idx === '' || idx === null) return;

        const l = this._leiturasAndamento[parseInt(idx)];
        if (!l) return;

        // Preenche hidden inputs
        $('#al_id_leitura').val(l.id);
        $('#al_paginas_total').val(l.paginas || 0);
        $('#al_data_inicio_hidden').val(l.data_inicio || '');

        // Preenche displays
        $('#al_titulo_display').text(l.titulo || '');
        $('#al_autor_display').text(l.autor   || '—');
        $('#al_paginas_display').text(l.paginas || '—');
        $('#al_tipomidia_display').text(l.tipo_midia || '—');

        // Formata data_inicio
        let dataFormatada = '—';
        if (l.data_inicio) {
            const partes = l.data_inicio.split('T')[0].split('-');
            if (partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        $('#al_datainicio_display').text(dataFormatada);

        // Calcula tempo de leitura
        if (l.data_inicio) {
            const inicio  = new Date(l.data_inicio.split('T')[0]);
            const hoje    = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dias    = Math.floor((hoje - inicio) / 86400000);
            $('#al_tempo_display').text(dias >= 0 ? `${dias} dia(s)` : '—');
        } else {
            $('#al_tempo_display').text('—');
        }

        $('#al_secao_progresso').removeClass('d-none');
        $('#al_secao_impressoes').removeClass('d-none');
    },

    onTipoInputChange: function () {
        const tipo = $('#al_tipo_input').val();

        $('#al_wrapper_percentual').addClass('d-none');
        $('#al_wrapper_pagina').addClass('d-none');
        $('#al_percentual').val('');
        $('#al_pagina_atual').val('');
        $('#al_pagina_calc_display').text('—');
        $('#al_percentual_calc_display').text('—');
        $('#al_secao_avaliacao').addClass('d-none');

        if (tipo === 'percentual') {
            $('#al_wrapper_percentual').removeClass('d-none');
        } else if (tipo === 'pagina') {
            $('#al_wrapper_pagina').removeClass('d-none');
        }
    },

    calcularProgresso: function () {
        const tipo    = $('#al_tipo_input').val();
        const paginas = parseInt($('#al_paginas_total').val()) || 0;
        let   completo = false;

        if (tipo === 'percentual') {
            const pct = parseFloat($('#al_percentual').val());
            if (!isNaN(pct) && paginas > 0) {
                const pag = Math.round((pct / 100) * paginas);
                $('#al_pagina_calc_display').text(`pág. ${pag}`);
                completo = pct >= 100;
            } else {
                $('#al_pagina_calc_display').text('—');
            }
        } else if (tipo === 'pagina') {
            const pag = parseInt($('#al_pagina_atual').val());
            if (!isNaN(pag) && paginas > 0) {
                const pct = ((pag / paginas) * 100).toFixed(1);
                $('#al_percentual_calc_display').text(`${pct}%`);
                completo = pag >= paginas;
            } else {
                $('#al_percentual_calc_display').text('—');
            }
        }

        if (completo) {
            $('#al_secao_avaliacao').removeClass('d-none');
        } else {
            $('#al_secao_avaliacao').addClass('d-none');
            $('#al_avaliacao').val('');
        }
    },

    salvarAtualizacao: async function () {
        const id_leitura  = $('#al_id_leitura').val();
        const tipo_input  = $('#al_tipo_input').val();
        const paginas     = parseInt($('#al_paginas_total').val()) || 0;

        if (!id_leitura) {
            this._mostrarMensagemAL('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        if (!tipo_input) {
            this._mostrarMensagemAL('danger', 'Selecione o tipo de registro (Percentual ou Página).');
            return;
        }

        let percentual   = '';
        let pagina_atual = '';

        if (tipo_input === 'percentual') {
            percentual = $('#al_percentual').val();
            if (percentual === '') {
                this._mostrarMensagemAL('danger', 'Informe o percentual lido.');
                return;
            }
            if (paginas > 0) {
                pagina_atual = Math.round((parseFloat(percentual) / 100) * paginas);
            }
        } else {
            pagina_atual = $('#al_pagina_atual').val();
            if (pagina_atual === '') {
                this._mostrarMensagemAL('danger', 'Informe a página atual.');
                return;
            }
            if (paginas > 0) {
                percentual = ((parseInt(pagina_atual) / paginas) * 100).toFixed(2);
            }
        }

        const sel   = $('#al_leitura option:selected');
        const idx   = $('#al_leitura').val();
        const l     = this._leiturasAndamento[parseInt(idx)];

        const body = new FormData();
        body.append('id_leitura',   id_leitura);
        body.append('titulo',       l ? (l.titulo     || '') : '');
        body.append('autor',        l ? (l.autor      || '') : '');
        body.append('paginas',      l ? (l.paginas    || '') : '');
        body.append('tipo_midia',   l ? (l.tipo_midia || '') : '');
        body.append('data_inicio',  $('#al_data_inicio_hidden').val());
        body.append('tipo_input',   tipo_input);
        body.append('percentual',   percentual);
        body.append('pagina_atual', pagina_atual);
        body.append('impressoes',   $('#al_impressoes').val());
        body.append('avaliacao',    $('#al_avaliacao').val());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/create_atualizacao_leitura.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagemAL('danger', json.error || 'Erro ao salvar.');
                return;
            }

            // Verifica se o livro foi concluído para acionar a sincronização automática
            const pct    = parseFloat(percentual)   || 0;
            const pagAtual = parseInt(pagina_atual) || 0;
            const pagTotal = parseInt($('#al_paginas_total').val()) || 0;
            const concluido = pct >= 100 || (pagTotal > 0 && pagAtual >= pagTotal);

            $('#modalAtualizandoLeitura').modal('hide');

            const titulo = l ? l.titulo : '';

            if (concluido) {
                // Sincroniza automaticamente: atualiza Leituras e Livros
                fetch('/php/api/base/menu_lateral/minhasLeituras/sincronizar_leituras.php', {
                    method: 'POST'
                }).catch(() => {});

                Swal.fire({
                    title: 'Livro concluído! 🎉',
                    html: `"${titulo}" foi marcado como lido.<br>
                           <small class="text-muted">Leituras e Livros atualizados automaticamente.</small>
                           <br><br>
                           <strong style="color:#6a2bbf">Lembrar de fazer a resenha!!!</strong>`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Fazer Resenha',
                    cancelButtonText: 'Agora não',
                    confirmButtonColor: '#6a2bbf',
                    cancelButtonColor: '#6c757d',
                    reverseButtons: true
                }).then(function (result) {
                    if (result.isConfirmed) {
                        menuLateral.abrirModalResenha();
                    }
                });
            } else {
                Swal.fire({
                    title: 'Atualizado!',
                    text: `Progresso de "${titulo}" foi registrado.`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745'
                });
            }

        } catch (e) {
            console.error('Erro ao salvar atualização:', e);
            this._mostrarMensagemAL('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagemAL: function (tipo, texto) {
        $('#al_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    },

    // ─────────────────────────────────────────────────────────────
    //  MINHAS IMPRESSÕES
    // ─────────────────────────────────────────────────────────────

    _todasLeituras: [],

    iniciarImpressoes: async function () {
        this._todasLeituras = [];

        $('#imp_secao_livro').addClass('d-none');
        $('#imp_secao_obs').addClass('d-none');
        $('#imp_mensagem').empty();
        $('#imp_filtro').val('');
        $('#imp_observacoes').val('');
        $('#imp_capitulo').val('');
        $('#imp_pagina_percentual').val('');
        $('#imp_id_leitura').val('');

        await this._carregarTodasLeituras();
    },

    _carregarTodasLeituras: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/listar_leituras_andamento.php');
            const json = await resp.json();
            this._todasLeituras = json.status ? (json.data || []) : [];

            this._popularSelectImpressoes(this._todasLeituras);
        } catch (e) {
            console.error('Erro ao carregar leituras:', e);
        }
    },

    _popularSelectImpressoes: function (lista) {
        const sel = $('#imp_leitura');
        sel.empty().append('<option value="">Selecione o livro...</option>');

        if (lista.length === 0) {
            sel.append('<option value="" disabled>Nenhuma leitura encontrada</option>');
            return;
        }

        lista.forEach(l => {
            const autor = l.autor ? ` — ${l.autor}` : '';
            sel.append(`<option value="${l.id}" data-titulo="${(l.titulo || '').replace(/"/g, '&quot;')}" data-autor="${(l.autor || '').replace(/"/g, '&quot;')}">${l.titulo}${autor}</option>`);
        });
    },

    filtrarSelectImpressoes: function () {
        const filtro = $('#imp_filtro').val().toLowerCase().trim();

        if (!filtro) {
            this._popularSelectImpressoes(this._todasLeituras);
            return;
        }

        const filtrados = this._todasLeituras.filter(l =>
            (l.titulo || '').toLowerCase().includes(filtro) ||
            (l.autor  || '').toLowerCase().includes(filtro)
        );

        this._popularSelectImpressoes(filtrados);

        // Limpa seleção e esconde seções se o livro selecionado sumiu do filtro
        $('#imp_leitura').val('');
        $('#imp_secao_livro').addClass('d-none');
        $('#imp_secao_obs').addClass('d-none');
        $('#imp_id_leitura').val('');
    },

    onLeituraImpressaoChange: function () {
        const opt    = $('#imp_leitura option:selected');
        const id     = opt.val();

        if (!id) {
            $('#imp_secao_livro').addClass('d-none');
            $('#imp_secao_obs').addClass('d-none');
            $('#imp_id_leitura').val('');
            return;
        }

        $('#imp_id_leitura').val(id);
        $('#imp_titulo_display').text(opt.data('titulo') || '');
        $('#imp_autor_display').text(opt.data('autor')   || '—');

        $('#imp_secao_livro').removeClass('d-none');
        $('#imp_secao_obs').removeClass('d-none');
    },

    salvarImpressao: async function () {
        const id_leitura  = $('#imp_id_leitura').val();
        const observacoes = $('#imp_observacoes').val().trim();

        if (!id_leitura) {
            this._mostrarMensagemIMP('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        if (!observacoes) {
            this._mostrarMensagemIMP('danger', 'As observações não podem estar em branco.');
            return;
        }

        const opt    = $('#imp_leitura option:selected');
        const titulo = opt.data('titulo') || '';
        const autor  = opt.data('autor')  || '';

        const body = new FormData();
        body.append('id_leitura',        id_leitura);
        body.append('titulo',            titulo);
        body.append('autor',             autor);
        body.append('capitulo',          $('#imp_capitulo').val());
        body.append('pagina_percentual', $('#imp_pagina_percentual').val());
        body.append('observacoes',       observacoes);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/create_impressao.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagemIMP('danger', json.error || 'Erro ao salvar.');
                return;
            }

            $('#modalMinhasImpressoes').modal('hide');

            Swal.fire({
                title: 'Impressão salva!',
                text: `Sua anotação sobre "${titulo}" foi registrada.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            console.error('Erro ao salvar impressão:', e);
            this._mostrarMensagemIMP('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagemIMP: function (tipo, texto) {
        $('#imp_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    },

    // ─────────────────────────────────────────────────────────────
    //  FRASES FAVORITAS
    // ─────────────────────────────────────────────────────────────

    _leiturasFF: [],

    iniciarFraseFavorita: async function () {
        this._leiturasFF = [];

        $('#ff_secao_info').addClass('d-none');
        $('#ff_secao_frase').addClass('d-none');
        $('#ff_frase').val('');
        $('#ff_capitulo').val('');
        $('#ff_pagina_percentual').val('');
        $('#ff_avaliacao_frase').val('');
        $('#ff_tema_display').val('');
        $('#ff_id_leitura').val('');
        $('#ff_titulo').val('');
        $('#ff_autor').val('');
        $('#ff_tema').val('');
        $('#ff_mes').val('');
        $('#ff_mensagem').empty();

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/listar_leituras_andamento.php');
            const json = await resp.json();
            this._leiturasFF = json.status ? (json.data || []) : [];

            const sel = $('#ff_leitura');
            sel.empty().append('<option value="">Selecione o livro...</option>');

            if (this._leiturasFF.length === 0) {
                sel.append('<option value="" disabled>Nenhuma leitura em andamento</option>');
                return;
            }

            this._leiturasFF.forEach((l, idx) => {
                const autor = l.autor ? ` — ${l.autor}` : '';
                sel.append(`<option value="${idx}">${l.titulo}${autor}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar leituras para frase:', e);
        }
    },

    onLeituraFraseChange: function () {
        const idx = $('#ff_leitura').val();

        $('#ff_secao_info').addClass('d-none');
        $('#ff_secao_frase').addClass('d-none');
        $('#ff_id_leitura').val('');
        $('#ff_titulo').val('');
        $('#ff_autor').val('');

        if (idx === '' || idx === null) return;

        const l = this._leiturasFF[parseInt(idx)];
        if (!l) return;

        // Deriva mês de referência a partir de data_inicio (YYYY-MM-DD → MM/YYYY)
        const dataInicio = (l.data_inicio || '').split('T')[0];
        const mes = dataInicio.length >= 7
            ? dataInicio.substring(5, 7) + '/' + dataInicio.substring(0, 4)
            : '';

        $('#ff_id_leitura').val(l.id);
        $('#ff_titulo').val(l.titulo || '');
        $('#ff_autor').val(l.autor  || '');
        $('#ff_tema').val(l.tema    || '');
        $('#ff_mes').val(mes);
        $('#ff_tema_display').val(l.tema || '');
        $('#ff_titulo_display').text(l.titulo || '');
        $('#ff_autor_display').text(l.autor   || '—');

        $('#ff_secao_info').removeClass('d-none');
        $('#ff_secao_frase').removeClass('d-none');
    },

    salvarFraseFavorita: async function () {
        const frase = $('#ff_frase').val().trim();

        if (!frase) {
            this._mostrarMensagemFF('danger', 'Digite a frase antes de salvar.');
            return;
        }

        const body = new FormData();
        body.append('id_leitura',        $('#ff_id_leitura').val());
        body.append('titulo',            $('#ff_titulo').val());
        body.append('autor',             $('#ff_autor').val());
        body.append('tema',              $('#ff_tema').val());
        body.append('mes',               $('#ff_mes').val());
        body.append('capitulo',          $('#ff_capitulo').val());
        body.append('pagina_percentual', $('#ff_pagina_percentual').val());
        body.append('avaliacao_frase',   $('#ff_avaliacao_frase').val());
        body.append('frases',            frase);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/cadastrar_frase_favorita.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagemFF('danger', json.error || 'Erro ao salvar.');
                return;
            }

            $('#modalFraseFavorita').modal('hide');

            Swal.fire({
                title: 'Frase salva!',
                text: 'Sua citação foi cadastrada com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            console.error('Erro ao salvar frase:', e);
            this._mostrarMensagemFF('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagemFF: function (tipo, texto) {
        $('#ff_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }

};

window.minhas_leituras = minhas_leituras;
