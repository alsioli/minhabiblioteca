let leitura_coletiva = {

    // ── Estado interno do modal Nova LC ─────────────────────────────────────
    _grupos: [],           // lista de grupos carregados da API
    _locais: [],           // lista de locais de leitura
    _tabelaSelecionada: '',// vTabelaVinculada do local escolhido
    _localSelecionado: '', // nome do local escolhido (para repassar ao cadastro de livros)

    // Abre o modal e carrega os selects iniciais
    iniciarModalNovaCronogramaLC: async function () {
        // Limpa estado
        this._tabelaSelecionada = '';
        this._localSelecionado  = '';
        $('#nlc_info_grupo').addClass('d-none');
        $('#nlc_busca_wrapper').addClass('d-none');
        $('#nlc_livro_selecionado').addClass('d-none');
        $('#nlc_secao_datas').addClass('d-none');
        $('#nlc_nao_encontrado').addClass('d-none');
        $('#nlc_resultados').empty();
        $('#nlc_mensagem').empty();
        $('#nlc_dias_prazo_display').text('—');
        $('#nlc_media_display').text('—');

        await this._carregarGruposLC();
        await this._carregarLocaisLeitura();
    },

    // Carrega o select de grupos de LC
    _carregarGruposLC: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_grupos_lc.php');
            const json = await resp.json();
            this._grupos = json.status ? json.data : [];

            const sel = $('#nlc_grupo');
            sel.empty().append('<option value="">Selecione a LC...</option>');
            this._grupos.forEach(g => {
                sel.append(`<option value="${g.nome_lc}"
                                    data-participando="${g.participando || ''}"
                                    data-natureza="${g.natureza || ''}">${g.nome_lc}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar grupos LC:', e);
        }
    },

    // Carrega o select de locais de leitura
    _carregarLocaisLeitura: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_local_leitura.php');
            const json = await resp.json();
            this._locais = json.status ? json.data : [];

            const sel = $('#nlc_local');
            sel.empty().append('<option value="">Selecione o local...</option>');
            this._locais.forEach(l => {
                sel.append(`<option value="${l.vLocal_Leitura}"
                                    data-tabela="${l.vTabelaVinculada}">${l.vLocal_Leitura}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar locais:', e);
        }
    },

    // Reage à mudança no select de grupo — exibe participando e natureza
    onGrupoLCChange: function () {
        const opt = $('#nlc_grupo option:selected');
        const nome = opt.val();
        if (!nome) {
            $('#nlc_info_grupo').addClass('d-none');
            return;
        }
        $('#nlc_participando').text(opt.data('participando') || '—');
        $('#nlc_natureza').text(opt.data('natureza') || '—');
        $('#nlc_info_grupo').removeClass('d-none');
    },

    // Reage à mudança no select de local — guarda a tabela e exibe campo de busca
    onLocalChange: function () {
        const opt = $('#nlc_local option:selected');
        this._tabelaSelecionada = opt.data('tabela') || '';
        this._localSelecionado  = opt.val() || '';

        $('#nlc_resultados').empty();
        $('#nlc_nao_encontrado').addClass('d-none');
        $('#nlc_busca_titulo').val('');
        this.limparLivroSelecionado();

        if (this._tabelaSelecionada) {
            $('#nlc_busca_wrapper').removeClass('d-none');
        } else {
            $('#nlc_busca_wrapper').addClass('d-none');
        }
    },

    // Dispara busca ao pressionar Enter no campo de título
    onBuscaKeyup: function (e) {
        if (e.key === 'Enter') this.buscarLivroNaTabela();
    },

    // Pesquisa o livro na tabela do local selecionado
    buscarLivroNaTabela: async function () {
        const titulo = $('#nlc_busca_titulo').val().trim();
        if (titulo.length < 3) {
            $('#nlc_resultados').html('<p class="text-danger small">Digite pelo menos 3 caracteres.</p>');
            return;
        }

        $('#nlc_resultados').html('<p class="text-muted small">Buscando...</p>');
        $('#nlc_nao_encontrado').addClass('d-none');

        const body = new FormData();
        body.append('tabela', this._tabelaSelecionada);
        body.append('titulo', titulo);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/buscar_livro_tabela.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                // Livro não encontrado — oferece cadastro
                $('#nlc_resultados').empty();
                $('#nlc_nao_encontrado').removeClass('d-none');
                return;
            }

            $('#nlc_nao_encontrado').addClass('d-none');
            this._montarResultadosBusca(json.data);
        } catch (e) {
            $('#nlc_resultados').html('<p class="text-danger small">Erro ao buscar. Tente novamente.</p>');
        }
    },

    // Monta a tabela de resultados da busca
    _montarResultadosBusca: function (lista) {
        let html = `
            <table class="table table-sm table-hover mt-1 mb-1">
                <thead style="font-size:0.82rem">
                    <tr><th>Título</th><th style="width:70px">Páginas</th></tr>
                </thead>
                <tbody style="font-size:0.82rem">
        `;
        lista.forEach((livro, idx) => {
            html += `<tr data-idx="${idx}" style="cursor:pointer">
                        <td>${livro.titulo}</td>
                        <td>${livro.paginas || '—'}</td>
                    </tr>`;
        });
        html += '</tbody></table>';

        const self = this;
        $('#nlc_resultados').html(html).find('tr[data-idx]').on('click', function () {
            const livro = lista[parseInt($(this).data('idx'))];
            if (livro) self.selecionarLivroLC(livro.titulo, livro.paginas || 0);
        });
    },

    // Seleciona um livro do resultado e prepara a seção de datas
    selecionarLivroLC: function (titulo, paginas) {
        $('#nlc_titulo').val(titulo);
        $('#nlc_paginas').val(paginas);
        $('#nlc_titulo_display').text(titulo);
        $('#nlc_paginas_display').text(paginas || '—');
        $('#nlc_resultados').empty();
        $('#nlc_busca_wrapper').addClass('d-none');
        $('#nlc_nao_encontrado').addClass('d-none');
        $('#nlc_livro_selecionado').removeClass('d-none');
        $('#nlc_secao_datas').removeClass('d-none');
        this.calcularAutomaticos();
    },

    // Limpa o livro selecionado e volta para a busca
    limparLivroSelecionado: function () {
        $('#nlc_titulo').val('');
        $('#nlc_paginas').val('');
        $('#nlc_titulo_display').text('');
        $('#nlc_paginas_display').text('');
        $('#nlc_livro_selecionado').addClass('d-none');
        $('#nlc_secao_datas').addClass('d-none');
        if (this._tabelaSelecionada) {
            $('#nlc_busca_wrapper').removeClass('d-none');
        }
    },

    // Recalcula prazo e média quando a data final muda
    calcularAutomaticos: function () {
        const dataFinal = $('#nlc_data_final').val();
        const paginas   = parseInt($('#nlc_paginas').val()) || 0;

        if (!dataFinal) {
            $('#nlc_dias_prazo_display').text('—');
            $('#nlc_media_display').text('—');
            return;
        }

        const hoje  = new Date();
        const prazo = new Date(dataFinal);
        const diff  = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
        const dias  = diff > 0 ? diff : 0;
        const media = dias > 0 ? Math.ceil(paginas / dias) : 0;

        $('#nlc_dias_prazo_display').text(dias > 0 ? dias : 'Encerrado');
        $('#nlc_media_display').text(dias > 0 ? media : '—');
    },

    // Abre o cadastro de livros com o local pré-selecionado
    abrirCadastroLivro: function () {
        $('#modalNovaCronogramaLC').modal('hide');
        menuLateral.abrirModalNovoLivro();
        // Após o modal de livro abrir, pré-seleciona o local (aguarda renderização)
        setTimeout(() => {
            if ($('#select_local_cadastro').length) {
                $('#select_local_cadastro').val(this._localSelecionado);
            }
        }, 600);
    },

    // Salva a nova entrada no CronogramaLCs
    salvarNovaCronogramaLC: async function () {
        const lc         = $('#nlc_grupo').val();
        const titulo     = $('#nlc_titulo').val();
        const paginas    = $('#nlc_paginas').val();
        const data_final = $('#nlc_data_final').val();
        const mes        = $('#nlc_mes').val();

        if (!lc || !titulo || !paginas || !data_final || !mes) {
            $('#nlc_mensagem').html('<div class="alert alert-danger">Preencha todos os campos obrigatórios.</div>');
            return;
        }

        const body = new FormData();
        body.append('lc',         lc);
        body.append('titulo',     titulo);
        body.append('paginas',    paginas);
        body.append('data_final', data_final);
        body.append('mes',        mes);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/create_cronograma_lc.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                $('#nlc_mensagem').html(`<div class="alert alert-danger">${json.error}</div>`);
                return;
            }

            $('#modalNovaCronogramaLC').modal('hide');
            Swal.fire({
                title: 'LC adicionada!',
                text: 'A leitura foi adicionada ao cronograma com sucesso.',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });

            // Se o cronograma estiver aberto, recarrega a tabela
            if (window.leitura_coletiva && typeof leitura_coletiva.carregarCronogramaLC === 'function') {
                leitura_coletiva.carregarCronogramaLC();
            }
        } catch (e) {
            $('#nlc_mensagem').html('<div class="alert alert-danger">Erro ao salvar. Tente novamente.</div>');
        }
    },

    // ── Fim das funções Nova LC ──────────────────────────────────────────────

    cadastrarLC: async function () {
       
        try {

            const $form = $('#formLeituraColetiva');

            if ($form.length === 0) {
                console.error('Formulário de LC não encontrado.');
                return;
            }

            const body = new FormData($form[0]);
            $('#mensagemLC').empty();

            $.ajax({
                url: '/php/api/base/menu_lateral/leiturasColetivas/create_leitura_coletiva.php',
                type: 'POST',
                data: body,
                processData: false,
                contentType: false,
                success: (response) => {
                    console.log('Resposta LC:', response);

                    if (typeof response === 'string') {
                        try { response = JSON.parse(response); } catch (e) {}
                    }

                    if (!response.status) {
                        $('#mensagemLC').html(`
                            <div class="alert alert-danger">${response.error}</div>
                        `);
                        return;
                    }

                    Swal.fire({
                        title: 'Leitura Coletiva Cadastrada!',
                        text: 'A nova LC foi adicionada com sucesso.',
                        icon: 'success',
                        confirmButtonColor: '#28a745'
                    });

                    $form.trigger('reset');
                    $('#modalNovaLC').modal('hide');
                },
                error: () => {
                    $('#mensagemLC').html(`
                        <div class="alert alert-danger">Erro ao cadastrar LC. Tente novamente.</div>
                    `);
                }
            });

        } catch (error) {
            console.error('Erro inesperado:', error);
            $('#mensagemLC').html(`
                <div class="alert alert-danger">Erro inesperado. Tente novamente.</div>
            `);
        }
    },

    carregarCronogramaLC: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/listar_cronograma_lc.php');

            const text = await resp.text();

            let response;
            try {
                response = text ? JSON.parse(text) : null;
            } catch (e) {
                // Tenta recuperar JSON mesmo que haja mensagens antes/ depois
                try {
                    const start = text.indexOf('{');
                    const end = text.lastIndexOf('}');
                    if (start !== -1 && end !== -1 && end > start) {
                        const sub = text.substring(start, end + 1);
                        response = JSON.parse(sub);
                        console.warn('Resposta limpada de ruído antes do JSON.');
                    } else {
                        throw e;
                    }
                } catch (e2) {
                    console.error('Resposta inválida JSON ao carregar cronograma:', e, text);
                    $('#tabelaCronogramaLC').html(`
                        <div class="alert alert-danger">Erro ao carregar dados (resposta inválida).</div>
                    `);
                    return;
                }
            }

            if (!resp.ok) {
                console.error('Erro HTTP ao carregar cronograma:', resp.status, text);
                $('#tabelaCronogramaLC').html(`
                    <div class="alert alert-danger">Erro ao carregar dados (código ${resp.status}).</div>
                `);
                return;
            }

            if (!response || !response.status) {
                const errMsg = response && response.error ? response.error : 'Resposta vazia do servidor.';
                $('#tabelaCronogramaLC').html(`
                    <div class="alert alert-danger">${errMsg}</div>
                `);
                return;
            }

            this.montarTabelaCronograma(response.data || []);

        } catch (error) {
            console.error("Erro ao carregar cronograma:", error);
            $('#tabelaCronogramaLC').html(`
                <div class="alert alert-danger">Erro ao carregar dados.</div>
            `);
        }
    },

    _lista: [],
    _sortCol: 7,
    _sortDir: 1,

    ordenar: function (col) {
        if (this._sortCol === col) {
            this._sortDir *= -1;
        } else {
            this._sortCol = col;
            this._sortDir = 1;
        }
        this.montarTabelaCronograma(this._lista);
    },

    montarTabelaCronograma: function (lista) {

        this._lista = lista;

        const col = this._sortCol;
        const dir = this._sortDir;
        const hoje = new Date();
        const MS_DIA = 1000 * 60 * 60 * 24;

        const calcDiff  = item => Math.ceil((new Date(item.data_final) - hoje) / MS_DIA);
        const calcMedia = item => {
            const tot = Math.ceil((new Date(item.data_final) - new Date(item.data_cadastro)) / MS_DIA);
            return (item.paginas && tot > 0) ? Math.ceil(item.paginas / tot) : 0;
        };

        const sorted = [...lista].sort((a, b) => {
            let vA, vB;
            switch (col) {
                case 0: return dir * (a.titulo  || '').localeCompare(b.titulo  || '', 'pt-BR');
                case 1: return dir * (a.lc      || '').localeCompare(b.lc      || '', 'pt-BR');
                case 2: vA = new Date(a.data_cadastro); vB = new Date(b.data_cadastro); break;
                case 3: vA = new Date(a.data_final);    vB = new Date(b.data_final);    break;
                case 4: vA = a.paginas  || 0; vB = b.paginas  || 0; break;
                case 5: vA = new Date(a.mes);           vB = new Date(b.mes);           break;
                case 6: return dir * (a.situacao || '').localeCompare(b.situacao || '', 'pt-BR');
                case 7: vA = calcDiff(a);  vB = calcDiff(b);  break;
                case 8: vA = calcMedia(a); vB = calcMedia(b); break;
                default: return 0;
            }
            return dir * (vA < vB ? -1 : vA > vB ? 1 : 0);
        });

        const seta = c => c === col ? (dir === 1 ? ' ▲' : ' ▼') : '';
        const th = (c, label) =>
            `<th onclick="leitura_coletiva.ordenar(${c})" style="cursor:pointer;white-space:nowrap">${label}${seta(c)}</th>`;

        let html = `
            <table class="table table-striped table-hover">
                <thead class="thead-dark">
                    <tr>
                        ${th(0,'Título')}
                        ${th(1,'LC')}
                        ${th(2,'Data Cadastro')}
                        ${th(3,'Data Final')}
                        ${th(4,'Páginas')}
                        ${th(5,'Mês')}
                        ${th(6,'Situação')}
                        ${th(7,'Prazo(dias)')}
                        ${th(8,'Média Páginas')}
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sorted.forEach(item => {

            const dataFinal = new Date(item.data_final);
            const diff  = calcDiff(item);
            const media = calcMedia(item);

            let diasTexto, diasStyle;
            if (diff <= 0) {
                diasTexto = '<strong>Encerrado</strong>';
                diasStyle = 'background-color:#add8e6;';
            } else if (diff <= 5) {
                diasTexto = diff;
                diasStyle = 'background-color:#e53935; color:#fff;';
            } else if (diff <= 10) {
                diasTexto = diff;
                diasStyle = 'background-color:#ff9800;';
            } else if (diff <= 15) {
                diasTexto = diff;
                diasStyle = 'background-color:#ffeb3b;';
            } else {
                diasTexto = diff;
                diasStyle = 'background-color:#a5d6a7;';
            }

            html += `
                <tr>
                    <td>${item.titulo}</td>
                    <td>${item.lc}</td>
                    <td>${this.formatarDataBR(item.data_cadastro)}</td>
                    <td>${this.formatarDataBR(item.data_final)}</td>
                    <td>${item.paginas}</td>
                    <td>${this.formatarMes(item.mes)}</td>
                    <td>${item.situacao}</td>
                    <td style="${diasStyle}">${diasTexto}</td>
                    <td>${media}</td>
                    <td style="white-space:nowrap">
                        <button class="btn btn-sm btn-warning text-dark fw-bold"
                                style="background-color:#ff9800; border-color:#e68900;"
                                onclick="leitura_coletiva.abrirModalEditarLC(${item.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-danger text-white fw-bold ml-1"
                                onclick="leitura_coletiva.excluirLC(${item.id}, '${(item.titulo || '').replace(/'/g, "\\'")}')">
                            🗑️ Excluir
                        </button>
                        <button class="btn btn-sm btn-info text-dark fw-bold ml-1"
                                onclick="leitura_coletiva.abrirTBRdaLC(${item.id})">
                            📚 TBR
                        </button>
                        ${item.situacao === 'A começar'
                            ? `<button class="btn btn-sm btn-success text-white fw-bold ml-1"
                                       onclick="leitura_coletiva.abrirIniciarDaLC(${item.id})">
                                   ▶ Iniciar
                               </button>`
                            : `<button class="btn btn-sm btn-secondary text-white fw-bold ml-1" disabled
                                       title="Disponível apenas para livros 'A começar'">
                                   ▶ Iniciar
                               </button>`
                        }
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';

        $('#tabelaCronogramaLC').html(`
            <div class="tabela-wrapper">
                ${html}
            </div>
        `);
    },

    abrirModalEditarLC: function (id) {
        const item = this._lista.find(i => i.id == id);
        if (!item) return;

        $('#editarLCId').val(item.id);
        $('#editarLCTitulo').val(item.titulo);
        $('#editarLCNome').val(item.lc);
        $('#editarLCDataFinal').val(item.data_final ? item.data_final.substring(0, 10) : '');
        $('#mensagemEditarLC').empty();
        $('#modalEditarCronogramaLC').modal('show');
    },

    salvarEdicaoLC: async function () {
        const id         = $('#editarLCId').val();
        const titulo     = $('#editarLCTitulo').val().trim();
        const data_final = $('#editarLCDataFinal').val();

        if (!titulo || !data_final) {
            $('#mensagemEditarLC').html('<div class="alert alert-danger">Preencha todos os campos.</div>');
            return;
        }

        const body = new FormData();
        body.append('id', id);
        body.append('titulo', titulo);
        body.append('data_final', data_final);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/leiturasColetivas/update_cronograma_lc.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                $('#mensagemEditarLC').html(`<div class="alert alert-danger">${json.error}</div>`);
                return;
            }

            $('#modalEditarCronogramaLC').modal('hide');
            await this.carregarCronogramaLC();

            Swal.fire({
                title: 'Atualizado!',
                text: 'Os dados da LC foram atualizados com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            });

        } catch (e) {
            $('#mensagemEditarLC').html('<div class="alert alert-danger">Erro ao salvar. Tente novamente.</div>');
        }
    },

    excluirLC: async function (id, titulo) {
        const confirm = await Swal.fire({
            title: 'Excluir do Cronograma?',
            text: titulo || 'Este registro será removido permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
        });

        if (!confirm.isConfirmed) return;

        try {
            const body = new FormData();
            body.append('id', id);

            const resp = await fetch(
                '/php/api/base/menu_lateral/leiturasColetivas/delete_cronograma_lc.php',
                { method: 'POST', body }
            );
            const json = await resp.json();

            if (!json.status) {
                Swal.fire({ icon: 'error', title: 'Erro', text: json.error || 'Falha ao excluir.' });
                return;
            }

            await this.carregarCronogramaLC();

            Swal.fire({
                icon: 'success',
                title: 'Excluído!',
                text: 'Registro removido do cronograma.',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro inesperado ao excluir.' });
        }
    },

    _buscarDadosLivro: async function (titulo) {
        try {
            const resp = await fetch(
                '/php/api/base/menu_lateral/leiturasColetivas/buscar_dados_livro.php?titulo=' +
                encodeURIComponent(titulo)
            );
            const json = await resp.json();
            return (json.status && json.data) ? json.data : null;
        } catch (e) {
            console.error('[LC] Erro ao buscar dados do livro:', e);
            return null;
        }
    },

    abrirTBRdaLC: async function (id) {
        try {
            const item = this._lista.find(i => i.id == id);
            if (!item) throw new Error('Item id=' + id + ' nao encontrado na lista.');

            // Busca dados completos nas tabelas de acervo
            const dadosLivro = await this._buscarDadosLivro(item.titulo);
            const livro = {
                titulo:      (dadosLivro && dadosLivro.titulo)      || item.titulo,
                paginas:     (dadosLivro && dadosLivro.paginas)     || item.paginas || '',
                autor:       (dadosLivro && dadosLivro.autor)       || item.autor || '',
                sexo_autor:  (dadosLivro && dadosLivro.sexo_autor)  || '',
                pais:        (dadosLivro && dadosLivro.pais)        || '',
                natureza:    (dadosLivro && dadosLivro.natureza)    || item.natureza || '',
                tema:        (dadosLivro && dadosLivro.tema)        || item.tema || '',
                tipo_edicao: (dadosLivro && dadosLivro.tipo_edicao) || item.tipo_edicao || ''
            };

            $('#modalTBRMensal').remove();

            $.ajax({
                url: '/php/pages/base/components/menu_lateral/tbr_mensal/index.php',
                method: 'GET',
                success: function (html) {
                    try {
                        $('body').append(html);
                        $.getScript('/php/pages/base/components/menu_lateral/tbr_mensal/index.js')
                            .done(function () {
                                try {
                                    if (!window.tbr_mensal || typeof tbr_mensal.abrirComLivroPreenchido !== 'function') {
                                        throw new Error('tbr_mensal.abrirComLivroPreenchido nao disponivel.');
                                    }
                                    tbr_mensal.abrirComLivroPreenchido(livro);
                                } catch (e) {
                                    console.error('[TBR] Erro ao abrir modal:', e);
                                    alert('Erro ao abrir modal TBR: ' + e.message);
                                }
                            })
                            .fail(function () {
                                console.error('[TBR] Falha ao carregar tbr_mensal/index.js');
                                alert('Erro ao carregar script do modal TBR.');
                            });
                    } catch (e) {
                        console.error('[TBR] Erro ao injetar HTML:', e);
                        alert('Erro ao montar modal TBR: ' + e.message);
                    }
                },
                error: function (xhr, status, err) {
                    console.error('[TBR] Erro AJAX:', status, err);
                    alert('Erro ao carregar modal TBR.');
                }
            });
        } catch (e) {
            console.error('[TBR] Erro geral em abrirTBRdaLC:', e);
            alert('Erro: ' + e.message);
        }
    },

    abrirIniciarDaLC: async function (id) {
        try {
            const item = this._lista.find(i => i.id == id);
            if (!item) throw new Error('Item id=' + id + ' nao encontrado na lista.');

            // Busca dados completos nas tabelas de acervo
            const dadosLivro = await this._buscarDadosLivro(item.titulo);
            const livro = {
                id:            (dadosLivro && dadosLivro.id)            || '',
                titulo:        (dadosLivro && dadosLivro.titulo)        || item.titulo,
                paginas:       (dadosLivro && dadosLivro.paginas)       || item.paginas || '',
                autor:         (dadosLivro && dadosLivro.autor)         || item.autor || '',
                sexo_autor:    (dadosLivro && dadosLivro.sexo_autor)    || '',
                pais:          (dadosLivro && dadosLivro.pais)          || '',
                natureza:      (dadosLivro && dadosLivro.natureza)      || '',
                tema:          (dadosLivro && dadosLivro.tema)          || item.tema || '',
                tipo_edicao:   (dadosLivro && dadosLivro.tipo_edicao)   || item.tipo_edicao || '',
                local_leitura: (dadosLivro && dadosLivro.local_leitura) || '',
            };

            const contexto = { cronograma_id: item.id, cronograma_lc: item.lc };

            $('#modalComecarLivro').remove();

            $.ajax({
                url: '/php/pages/base/components/menu_lateral/minhas_leituras/index.php',
                method: 'GET',
                success: function (html) {
                    try {
                        $('body').append(html);
                        $.getScript('/php/pages/base/components/menu_lateral/minhas_leituras/index.js')
                            .done(function () {
                                try {
                                    if (!window.minhas_leituras || typeof minhas_leituras.abrirComLivroPreenchido !== 'function') {
                                        throw new Error('minhas_leituras.abrirComLivroPreenchido nao disponivel.');
                                    }
                                    minhas_leituras.abrirComLivroPreenchido(livro, contexto);
                                } catch (e) {
                                    console.error('[Iniciar] Erro ao abrir modal:', e);
                                    alert('Erro ao abrir modal Iniciar: ' + e.message);
                                }
                            })
                            .fail(function () {
                                console.error('[Iniciar] Falha ao carregar minhas_leituras/index.js');
                                alert('Erro ao carregar script do modal Iniciar.');
                            });
                    } catch (e) {
                        console.error('[Iniciar] Erro ao injetar HTML:', e);
                        alert('Erro ao montar modal Iniciar: ' + e.message);
                    }
                },
                error: function (xhr, status, err) {
                    console.error('[Iniciar] Erro AJAX:', status, err);
                    alert('Erro ao carregar modal Iniciar.');
                }
            });
        } catch (e) {
            console.error('[Iniciar] Erro geral em abrirIniciarDaLC:', e);
            alert('Erro: ' + e.message);
        }
    },

    formatarDataBR: function (dataISO) {
        const d = new Date(dataISO);
        if (isNaN(d)) return dataISO;
        return d.toLocaleDateString('pt-BR');
    },

    formatarMes: function (dataISO) {
        if (!dataISO) return '';
        const partes = dataISO.toString().split('-');
        if (partes.length < 2) return dataISO;
        return `${partes[1]}/${partes[0]}`;
    },
};

if (typeof window !== 'undefined') {
    window.leitura_coletiva = leitura_coletiva;
}
