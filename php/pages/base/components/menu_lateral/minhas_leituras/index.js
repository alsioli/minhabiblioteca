window.minhas_leituras = {

    _locais: [],
    _tabelaSelecionada: '',
    _localSelecionado: '',
    _grupos: [],
    _desafios: [],
    _listaResultados: [],
    _cronograma_lc_id:   null,
    _cronograma_lc_nome: null,

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

        // Restaura visibilidade caso tenha sido aberto via fluxo da LC
        $('#cl_local').closest('fieldset').show();
        this._cronograma_lc_id   = null;
        this._cronograma_lc_nome = null;

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
//A FUNÇÃO ABAIXO Reage à mudança do <select> chamado #cl_local e atualiza elementos da tela.
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

    // livro: { titulo, paginas, autor, sexo_autor, pais, natureza, tema, tipo_edicao, local_leitura }
    // contexto: { cronograma_id, cronograma_lc } — opcional, usado ao abrir via cronograma
    abrirComLivroPreenchido: async function (livro, contexto) {
        try {
            this._tabelaSelecionada  = '';
            this._localSelecionado   = (livro && livro.local_leitura) || '';
            this._listaResultados    = [];
            this._cronograma_lc_id   = (contexto && contexto.cronograma_id)  || null;
            this._cronograma_lc_nome = (contexto && contexto.cronograma_lc)  || null;

            $('#cl_resultados').empty();
            $('#cl_nao_encontrado').addClass('d-none');
            $('#cl_mensagem').empty();
            $('#cl_busca_titulo').val('');
            $('#cl_mes_display').text('-');
            $('#cl_sub_lc').addClass('d-none');
            $('#cl_sub_desafio').addClass('d-none');
            $('#cl_natureza').val('');
            $('#cl_tipo_midia').val('');
            $('#cl_avaliacao').val('');
            $('#cl_data_inicio').val('');

            await Promise.all([
                this._carregarGrupos(),
                this._carregarDesafios(),
                this._carregarTipoMidia(),
            ]);

            $('#cl_local').closest('fieldset').hide();

            const titulo      = (livro && livro.titulo)      || '';
            const paginas     = (livro && livro.paginas)     || '';
            const autor       = (livro && livro.autor)       || '';
            const sexo_autor  = (livro && livro.sexo_autor)  || '';
            const pais        = (livro && livro.pais)        || '';
            const tema        = (livro && livro.tema)        || '';

            $('#cl_livro_id').val((livro && livro.id) || '');
            $('#cl_livro_local').val(this._localSelecionado);
            $('#cl_livro_titulo').val(titulo);
            $('#cl_livro_autor').val(autor);
            $('#cl_livro_paginas').val(paginas);
            $('#cl_livro_sexo_autor').val(sexo_autor);
            $('#cl_livro_pais').val(pais);
            $('#cl_livro_raca').val('');
            $('#cl_livro_tema').val(tema);

            $('#cl_titulo_display').text(titulo  || '-');
            $('#cl_autor_display').text(autor    || '-');
            $('#cl_paginas_display').text(paginas || '-');
            $('#cl_tema_display').text(tema      || '-');

            // Pré-seleciona natureza LC e o grupo quando vem do cronograma
            if (this._cronograma_lc_nome) {
                $('#cl_natureza').val('LC');
                this.onNaturezaChange();
                // Aguarda o select de grupos ser populado para selecionar o correto
                const lcNome = this._cronograma_lc_nome;
                setTimeout(function () {
                    $('#cl_lc_grupo option').filter(function () {
                        return $(this).val() === lcNome;
                    }).prop('selected', true);
                }, 150);
            }

            $('#cl_secao_livro').removeClass('d-none');
            $('#cl_busca_wrapper').hide();
            $('#cl_livro_selecionado').removeClass('d-none');
            $('#cl_secao_dados').removeClass('d-none');

            $('#modalComecarLivro').modal('show');
        } catch (e) {
            console.error('[Iniciar] Erro em abrirComLivroPreenchido:', e);
            alert('Erro ao preparar modal Iniciar: ' + e.message);
        }
    },

    salvarLeitura: async function () {
        const titulo     = $('#cl_livro_titulo').val();
        const autor      = $('#cl_livro_autor').val();
        const data_inicio = $('#cl_data_inicio').val();

        if (!titulo) {
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

        const livroId = String($('#cl_livro_id').val() || '').trim();
        if (!livroId) {
            this._mostrarMensagem('danger', 'Não foi possível obter o ID do livro. Selecione o livro novamente.');
            return;
        }

        const body = new FormData();
        body.append('id',             livroId);
        body.append('titulo',         titulo);
        body.append('autor',          autor);
        body.append('paginas',        $('#cl_livro_paginas').val());
        body.append('tipo_midia',     $('#cl_tipo_midia').val());
        body.append('natureza',       natureza);
        body.append('data_inicio',    data_inicio);
        body.append('avaliacao',      $('#cl_avaliacao').val());
        body.append('sexo_autor',     $('#cl_livro_sexo_autor').val());
        body.append('pais',           $('#cl_livro_pais').val());
        body.append('raca',           $('#cl_livro_raca').val());
        body.append('tema',           $('#cl_livro_tema').val());
        body.append('local_leitura',  this._localSelecionado || '');

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

            // Atualiza situacao no CronogramaLCs se iniciado via cronograma
            if (this._cronograma_lc_id) {
                const fd = new FormData();
                fd.append('id',       this._cronograma_lc_id);
                fd.append('situacao', 'Lendo');
                fetch('/php/api/base/menu_lateral/leiturasColetivas/update_situacao_cronograma.php', {
                    method: 'POST', body: fd
                }).catch(e => console.error('[Cronograma] Erro ao atualizar situacao:', e));
                this._cronograma_lc_id   = null;
                this._cronograma_lc_nome = null;
            }

            Swal.fire({
                title: 'Leitura registrada!',
                text: `"${titulo}" foi adicionado às suas leituras.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            }).then(() => {
                // Recarrega o cronograma se estiver visível
                if ($('#tabelaCronogramaLC').length && window.leitura_coletiva && typeof leitura_coletiva.carregarCronogramaLC === 'function') {
                    leitura_coletiva.carregarCronogramaLC();
                }
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
        $('#al_abandonar').val('');
        $('#al_tipo_input').val('').prop('disabled', false);
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
        $('#al_abandonar').val('');
        $('#al_tipo_input').val('').prop('disabled', false);
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

    onAbandonarChange: function () {
        const motivo = $('#al_abandonar').val();

        if (motivo) {
            // Desativa e oculta "Registrar por" e seus inputs
            $('#al_tipo_input').val('').prop('disabled', true);
            $('#al_wrapper_percentual').addClass('d-none');
            $('#al_wrapper_pagina').addClass('d-none');
            $('#al_secao_avaliacao').addClass('d-none');
            $('#al_percentual').val('');
            $('#al_pagina_atual').val('');
            $('#al_pagina_calc_display').text('—');
            $('#al_percentual_calc_display').text('—');
        } else {
            // Reativa "Registrar por"
            $('#al_tipo_input').prop('disabled', false);
        }
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
        const id_leitura = $('#al_id_leitura').val();
        const motivo     = $('#al_abandonar').val();

        if (!id_leitura) {
            this._mostrarMensagemAL('danger', 'Selecione um livro antes de salvar.');
            return;
        }

        // ── Fluxo de abandono / interrupção ──────────────────────
        if (motivo === 'Abandonado' || motivo === 'Interrompido') {
            await this._finalizarAbandonoOuInterrupcao(id_leitura, motivo);
            return;
        }

        const tipo_input = $('#al_tipo_input').val();
        const paginas    = parseInt($('#al_paginas_total').val()) || 0;

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
        body.append('id_leitura',    id_leitura);
        body.append('titulo',        l ? (l.titulo        || '') : '');
        body.append('autor',         l ? (l.autor         || '') : '');
        body.append('paginas',       l ? (l.paginas       || '') : '');
        body.append('tipo_midia',    l ? (l.tipo_midia    || '') : '');
        body.append('data_inicio',   $('#al_data_inicio_hidden').val());
        body.append('tipo_input',    tipo_input);
        body.append('percentual',    percentual);
        body.append('pagina_atual',  pagina_atual);
        body.append('impressoes',    $('#al_impressoes').val());
        body.append('avaliacao',     $('#al_avaliacao').val());
        body.append('local_leitura', l ? (l.local_leitura || '') : '');

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
                }).then(function () {
                    // Atualiza os cards do header com os novos totais
                    if (typeof window.atualizarHeaderContadores === 'function') {
                        window.atualizarHeaderContadores();
                    }
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

    _finalizarAbandonoOuInterrupcao: async function (id_leitura, motivo) {
        try {
            const idx = $('#al_leitura').val();
            const l   = this._leiturasAndamento[parseInt(idx)];

            const body = new FormData();
            body.append('id_leitura',    id_leitura);
            body.append('motivo',        motivo);
            body.append('titulo',        l ? (l.titulo        || '') : '');
            body.append('autor',         l ? (l.autor         || '') : '');
            body.append('paginas',       l ? (l.paginas       || '') : '');
            body.append('tipo_midia',    l ? (l.tipo_midia    || '') : '');
            body.append('data_inicio',   $('#al_data_inicio_hidden').val());
            body.append('local_leitura', l ? (l.local_leitura || '') : '');

            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/finalizar_abandono.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagemAL('danger', json.error || 'Erro ao finalizar leitura.');
                return;
            }

            $('#modalAtualizandoLeitura').modal('hide');

            const titulo = l ? l.titulo : '';
            const icone  = motivo === 'Abandonado' ? '📕' : '⏸️';

            Swal.fire({
                title: icone + ' ' + motivo + '!',
                html: `"${titulo}" foi marcado como <strong>${motivo}</strong>.<br>
                       <small class="text-muted">Removido das leituras em andamento.</small>`,
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: motivo === 'Abandonado' ? '#dc3545' : '#fd7e14'
            });

        } catch (e) {
            console.error('[Abandono] Erro:', e);
            this._mostrarMensagemAL('danger', 'Erro inesperado ao finalizar leitura: ' + e.message);
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
    },

    // ─────────────────────────────────────────────────────────────
    //  ATUALIZAR LEITURAS REALIZADAS
    // ─────────────────────────────────────────────────────────────

    _leiturasBuscadas: [],
    _tabelaULR: '',
    _livroULR: null,

    iniciarAtualizarLeituras: async function () {
        this._leiturasBuscadas = [];
        this._tabelaULR = '';
        this._livroULR  = null;

        $('#ulr_busca_titulo').val('');
        $('#ulr_resultados').empty();
        $('#ulr_nao_encontrado').addClass('d-none');
        $('#ulr_busca_wrapper').show();
        $('#ulr_livro_selecionado').addClass('d-none');
        $('#ulr_secao_dados').addClass('d-none');
        $('#ulr_id_leitura').val('');
        $('#ulr_mensagem').empty();
        $('#ulr_data_inicio').val('');
        $('#ulr_data_fim').val('');
        $('#ulr_natureza').val('');
        $('#ulr_avaliacao').val('');
        $('#ulr_impressoes').val('');
        $('#ulr_mes_display').text('—');
        $('#ulr_tempo_display').text('—');

        await this._carregarLocaisULR();
    },

    _carregarLocaisULR: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            const json = await resp.json();
            const locais = json.status ? json.data : [];

            const sel = $('#ulr_local');
            sel.empty().append('<option value="">Selecione o local...</option>');
            locais.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}" data-tabela="${l.vTabelaVinculada}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('[ULR] Erro ao carregar locais:', e);
        }
    },

    onLocalULRChange: function () {
        const opt = $('#ulr_local option:selected');
        this._tabelaULR = opt.data('tabela') || '';

        $('#ulr_resultados').empty();
        $('#ulr_nao_encontrado').addClass('d-none');
        $('#ulr_livro_selecionado').addClass('d-none');
        $('#ulr_secao_dados').addClass('d-none');
        $('#ulr_busca_titulo').val('');
        $('#ulr_id_leitura').val('');
    },

    buscarLeituraParaAtualizar: async function () {
        const titulo = $('#ulr_busca_titulo').val().trim();

        $('#ulr_resultados').empty();
        $('#ulr_nao_encontrado').addClass('d-none');

        if (!this._tabelaULR) {
            $('#ulr_resultados').html('<div class="alert alert-warning py-1 mb-1">Selecione o Local de Leitura antes de buscar.</div>');
            return;
        }

        if (titulo.length < 3) {
            $('#ulr_resultados').html('<div class="alert alert-warning py-1 mb-1">Digite pelo menos 3 caracteres.</div>');
            return;
        }

        try {
            // Busca na tabela da plataforma selecionada (igual aos outros modais)
            const body = new FormData();
            body.append('tabela', this._tabelaULR);
            body.append('titulo', titulo);

            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/buscar_livro_tabela.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                $('#ulr_resultados').html('<div class="alert alert-danger py-1 mb-1">' + (json.error || 'Erro ao buscar.') + '</div>');
                return;
            }

            if (!json.data || json.data.length === 0) {
                $('#ulr_nao_encontrado').removeClass('d-none');
                return;
            }

            this._leiturasBuscadas = json.data;
            this._montarResultadosULR(json.data);
        } catch (e) {
            console.error('[ULR] Erro ao buscar:', e);
            $('#ulr_resultados').html('<div class="alert alert-danger py-1 mb-1">Erro inesperado: ' + e.message + '</div>');
        }
    },

    _montarResultadosULR: function (lista) {
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
                <tr onclick="minhas_leituras.selecionarLeituraParaAtualizar(${idx})" style="cursor:pointer">
                    <td style="padding:0.25rem">${livro.titulo || ''}</td>
                    <td style="padding:0.25rem">${livro.autor  || ''}</td>
                    <td style="padding:0.25rem">${livro.paginas || ''}</td>
                </tr>
            `;
        });

        tabela += '</tbody></table>';
        $('#ulr_resultados').html(tabela);
    },

    selecionarLeituraParaAtualizar: async function (idx) {
        const livro = this._leiturasBuscadas[idx];
        if (!livro) return;
        this._livroULR = livro;

        // Mostra o livro selecionado e oculta resultados imediatamente
        $('#ulr_resultados').empty();
        $('#ulr_nao_encontrado').addClass('d-none');
        $('#ulr_busca_wrapper').hide();
        $('#ulr_livro_selecionado').removeClass('d-none');
        $('#ulr_titulo_display').text(livro.titulo || '');
        $('#ulr_autor_display').text(livro.autor   || '—');
        $('#ulr_local_display').text($('#ulr_local option:selected').text());
        $('#ulr_data_inicio_display').text('Carregando...');
        $('#ulr_data_fim_display').text('—');

        // Busca o registro em Leituras pelo título do livro selecionado
        try {
            const body = new FormData();
            body.append('titulo', livro.titulo || '');
            body.append('local_leitura', $('#ulr_local').val() || '');

            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/buscar_leituras_para_atualizar.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (json.status && json.data && json.data.length > 0) {
                const l = json.data[0]; // registro mais recente

                $('#ulr_id_leitura').val(l.id);

                const inicio = l.data_inicio || '';
                const fim    = l.data_fim    || '';
                $('#ulr_data_inicio_display').text(inicio || '—');
                $('#ulr_data_fim_display').text(fim || 'Não registrado');

                $('#ulr_data_inicio').val(inicio);
                $('#ulr_data_fim').val(fim);
                $('#ulr_natureza').val(l.natureza  || '');
                $('#ulr_avaliacao').val(l.avaliacao || '');
            } else {
                $('#ulr_data_inicio_display').text('—');
                $('#ulr_id_leitura').val('');
                this._mostrarMensagemULR('warning', 'Nenhum registro encontrado em Leituras para este livro.');
            }
        } catch (e) {
            console.error('[ULR] Erro ao buscar leitura:', e);
            $('#ulr_data_inicio_display').text('—');
        }

        this.onDataULRChange();
        $('#ulr_secao_dados').removeClass('d-none');
    },

    limparLivroSelecionadoULR: function () {
        $('#ulr_livro_selecionado').addClass('d-none');
        $('#ulr_secao_dados').addClass('d-none');
        $('#ulr_busca_wrapper').show();
        $('#ulr_resultados').empty();
        $('#ulr_busca_titulo').val('');
        $('#ulr_id_leitura').val('');
    },

    onDataULRChange: function () {
        const inicio = $('#ulr_data_inicio').val();
        const fim    = $('#ulr_data_fim').val();

        // Mês calculado
        if (inicio) {
            const [ano, mes] = inicio.split('-');
            $('#ulr_mes_display').text(`${mes}/${ano}`);
        } else {
            $('#ulr_mes_display').text('—');
        }

        // Tempo calculado
        if (inicio && fim) {
            const dtInicio = new Date(inicio);
            const dtFim    = new Date(fim);
            const dias     = Math.round((dtFim - dtInicio) / 86400000);
            $('#ulr_tempo_display').text(dias >= 0 ? `${dias} dia(s)` : '—');
        } else {
            $('#ulr_tempo_display').text('—');
        }
    },

    salvarAtualizarLeitura: async function () {
        const id          = $('#ulr_id_leitura').val();
        const data_inicio = $('#ulr_data_inicio').val();
        const livro       = this._livroULR;

        if (!livro) {
            this._mostrarMensagemULR('danger', 'Selecione um livro antes de salvar.');
            return;
        }
        if (!data_inicio) {
            this._mostrarMensagemULR('danger', 'Data de início é obrigatória.');
            return;
        }

        const body = new FormData();
        body.append('id',            id);
        body.append('titulo',        livro.titulo  || '');
        body.append('autor',         livro.autor   || '');
        body.append('paginas',       livro.paginas || '');
        body.append('local_leitura', $('#ulr_local').val() || '');
        body.append('data_inicio',   data_inicio);
        body.append('data_fim',      $('#ulr_data_fim').val());
        body.append('natureza',      $('#ulr_natureza').val());
        body.append('avaliacao',     $('#ulr_avaliacao').val());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/update_leitura_realizada.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagemULR('danger', json.error || 'Erro ao salvar.');
                return;
            }

            const titulo = $('#ulr_titulo_display').text();

            this._mostrarMensagemULR('success',
                `"${titulo}" atualizada! Mês: ${json.data.mes || '—'} · Tempo: ${json.data.tempo_dias != null ? json.data.tempo_dias + ' dia(s)' : '—'}`
            );

            // Limpa para nova operação após 2s
            const self = this;
            setTimeout(function () {
                $('#ulr_mensagem').empty();
                self.limparLivroSelecionadoULR();
            }, 3000);

        } catch (e) {
            console.error('[ULR] Erro ao salvar:', e);
            this._mostrarMensagemULR('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagemULR: function (tipo, texto) {
        $('#ulr_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }

};
