let desafios = {

    _lista: [],               // cache da lista atual
    _livrosDesafioCache: {},  // cache livros por local

    // ─── Formata data ISO → DD/MM/YYYY ───────────────────────────
    _fmtData: function (val) {
        if (!val) return '—';
        const s = String(val).split('T')[0].split('-');
        return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : val;
    },

    // ─── Mensagens ───────────────────────────────────────────────
    _msg: function (prefixo, tipo, texto) {
        $(`#${prefixo}_mensagem`).html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    },

    // ─── NOVO DESAFIO ────────────────────────────────────────────

    iniciarNovoDesafio: function () {
        $('#nd_tematica').val('');
        $('#nd_descricao').val('');
        $('#nd_ano').val('');
        $('#nd_meta_livros').val('');
        $('#nd_situacao').val('Em andamento');
        $('#nd_data_inicio').val('');
        $('#nd_data_fim').val('');
        $('#nd_mensagem').empty();
    },

    salvarNovo: async function () {
        const tematica = $('#nd_tematica').val().trim();
        if (!tematica) {
            this._msg('nd', 'danger', 'A temática é obrigatória.');
            return;
        }

        const body = new FormData();
        body.append('tematica',    tematica);
        body.append('descricao',   $('#nd_descricao').val());
        body.append('ano',         $('#nd_ano').val());
        body.append('meta_livros', $('#nd_meta_livros').val());
        body.append('situacao',    $('#nd_situacao').val());
        body.append('data_inicio', $('#nd_data_inicio').val());
        body.append('data_fim',    $('#nd_data_fim').val());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/create_desafio.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                this._msg('nd', 'danger', json.error || 'Erro ao salvar.');
                return;
            }

            $('#modalNovoDesafio').modal('hide');
            Swal.fire({
                title: 'Desafio criado!',
                text: `"${tematica}" foi cadastrado com sucesso.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            }).then(() => {
                // Se a view de acompanhamento estiver aberta, recarrega
                if ($('#desafiosContainer').length) desafios.carregarAcompanhamento();
            });
        } catch (e) {
            console.error('Erro ao salvar desafio:', e);
            this._msg('nd', 'danger', 'Erro inesperado. Tente novamente.');
        }
    },

    // ─── ACOMPANHAMENTO (tabela com botão editar) ─────────────────

    carregarAcompanhamento: async function () {
        const container = $('#desafiosContainer');
        if (!container.length) return;

        container.html('<p class="text-muted small">Carregando...</p>');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/listar_desafios.php');
            const json = await resp.json();

            if (!json.status) {
                container.html(`<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`);
                return;
            }

            this._lista = json.data || [];
            this._renderTabela(this._lista);
        } catch (e) {
            console.error('Erro ao carregar desafios:', e);
            container.html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderTabela: function (lista) {
        const container = $('#desafiosContainer');

        if (lista.length === 0) {
            container.html('<p class="text-muted">Nenhum desafio cadastrado.</p>');
            return;
        }

        const corSituacao = {
            'Em andamento': { bg: '#e8f5e9', cor: '#2e7d32' },
            'Pausado':      { bg: '#fff3e0', cor: '#e65100' },
            'Concluído':    { bg: '#e3f2fd', cor: '#1565c0' },
        };

        let html = `
            <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
                    <tr>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:left">Temática</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Ano</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Meta</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Lidos</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:left;min-width:120px">Progresso</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Situação</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Início</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Fim</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        lista.forEach((d, idx) => {
            const ativo  = parseInt(d.bAtivo) === 1;
            const meta   = parseInt(d.meta_livros) || 0;
            const lidos  = parseInt(d.livros_lidos) || 0;
            const pct    = meta > 0 ? Math.min((lidos / meta) * 100, 100).toFixed(1) : null;
            const cores  = corSituacao[d.situacao] || { bg: '#f5f5f5', cor: '#555' };
            const rowStyle = ativo ? '' : 'opacity:0.5;background:#fafafa';

            const progressBar = pct !== null
                ? `<div style="display:flex;align-items:center;gap:5px">
                       <div style="flex:1;background:#e9ecef;border-radius:4px;height:8px;overflow:hidden">
                           <div style="width:${pct}%;background:#28a745;height:100%;border-radius:4px"></div>
                       </div>
                       <span style="font-size:0.78rem;white-space:nowrap">${pct}%</span>
                   </div>`
                : '—';

            html += `
                <tr style="border-bottom:1px solid #dee2e6;${rowStyle}">
                    <td style="padding:6px 10px;font-weight:500;max-width:240px;word-break:break-word">
                        ${d.tematica || ''}
                        ${!ativo ? '<br><span style="font-size:0.72rem;background:#f8d7da;color:#842029;padding:1px 6px;border-radius:8px">Inativa</span>' : ''}
                        ${d.descricao ? `<br><small class="text-muted">${d.descricao}</small>` : ''}
                    </td>
                    <td style="padding:6px 10px;text-align:center">${d.ano || '—'}</td>
                    <td style="padding:6px 10px;text-align:center">${meta || '—'}</td>
                    <td style="padding:6px 10px;text-align:center;font-weight:bold;color:#28a745">${lidos}</td>
                    <td style="padding:6px 10px">${progressBar}</td>
                    <td style="padding:6px 10px;text-align:center">
                        <span style="padding:2px 10px;border-radius:12px;font-size:0.78rem;font-weight:600;
                                     background:${cores.bg};color:${cores.cor}">
                            ${d.situacao || '—'}
                        </span>
                    </td>
                    <td style="padding:6px 10px;text-align:center;white-space:nowrap;font-size:0.8rem">${desafios._fmtData(d.data_inicio)}</td>
                    <td style="padding:6px 10px;text-align:center;white-space:nowrap;font-size:0.8rem">${desafios._fmtData(d.data_fim)}</td>
                    <td style="padding:6px 10px;text-align:center">
                        <button class="btn btn-sm btn-outline-secondary"
                                style="padding:2px 10px;font-size:0.8rem"
                                onclick="desafios.abrirEdicao(${idx})">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#desafiosContainer').html(html);
    },

    // ─── EDITAR DESAFIO ──────────────────────────────────────────

    abrirEdicao: function (idx) {
        const d = this._lista[idx];
        if (!d) return;

        $('#ed_id').val(d.id);
        $('#ed_tematica').val(d.tematica || '');
        $('#ed_descricao').val(d.descricao || '');
        $('#ed_ano').val(d.ano || '');
        $('#ed_meta_livros').val(d.meta_livros || '');
        $('#ed_situacao').val(d.situacao || 'Em andamento');
        $('#ed_data_inicio').val(d.data_inicio ? String(d.data_inicio).slice(0, 10) : '');
        $('#ed_data_fim').val(d.data_fim ? String(d.data_fim).slice(0, 10) : '');
        $('#ed_bAtivo').val(String(parseInt(d.bAtivo) === 1 ? '1' : '0'));
        $('#ed_mensagem').empty();

        $('#modalEditarDesafio').modal('show');
    },

    salvarEdicao: async function () {
        const id       = $('#ed_id').val();
        const tematica = $('#ed_tematica').val().trim();

        if (!id) { this._msg('ed', 'danger', 'ID não encontrado.'); return; }
        if (!tematica) { this._msg('ed', 'danger', 'A temática é obrigatória.'); return; }

        const body = new FormData();
        body.append('id',          id);
        body.append('tematica',    tematica);
        body.append('descricao',   $('#ed_descricao').val());
        body.append('ano',         $('#ed_ano').val());
        body.append('meta_livros', $('#ed_meta_livros').val());
        body.append('situacao',    $('#ed_situacao').val());
        body.append('data_inicio', $('#ed_data_inicio').val());
        body.append('data_fim',    $('#ed_data_fim').val());
        body.append('bAtivo',      $('#ed_bAtivo').val());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/update_desafio.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                this._msg('ed', 'danger', json.error || 'Erro ao atualizar.');
                return;
            }

            $('#modalEditarDesafio').modal('hide');
            Swal.fire({
                title: 'Atualizado!',
                text: `"${tematica}" foi atualizado com sucesso.`,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            }).then(() => {
                desafios.carregarAcompanhamento();
            });
        } catch (e) {
            console.error('Erro ao atualizar desafio:', e);
            this._msg('ed', 'danger', 'Erro inesperado. Tente novamente.');
        }
    },

    // ─── LIVROS DOS DESAFIOS ─────────────────────────────────────

    carregarLivrosDesafios: async function () {
        const container = $('#livrosDesafiosContainer');
        if (!container.length) return;
        container.html('<p class="text-muted small">Carregando...</p>');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/listar_livros_desafios.php');
            const json = await resp.json();

            if (!json.status) {
                container.html(`<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`);
                return;
            }

            this._renderLivrosDesafios(json.data || []);
        } catch (e) {
            console.error('Erro ao carregar livros dos desafios:', e);
            container.html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderLivrosDesafios: function (lista) {
        const container = $('#livrosDesafiosContainer');

        if (!lista.length) {
            container.html('<p class="text-muted">Nenhum livro encontrado nos desafios.</p>');
            return;
        }

        const corStatus = {
            'Lido':  { bg: '#e8f5e9', cor: '#2e7d32' },
            'Lendo': { bg: '#fff3e0', cor: '#e65100' },
        };

        // Conta totais por desafio para o rodapé
        const totais = {};
        lista.forEach(item => {
            if (!totais[item.tematica]) totais[item.tematica] = { total: 0, lidos: 0 };
            totais[item.tematica].total++;
            if (item.status_leitura === 'Lido') totais[item.tematica].lidos++;
        });

        let html = `<div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
                    <tr>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:left">Desafio</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center;white-space:nowrap">#</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:left">Título</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:left">Autor</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center">Status</th>
                        <th style="padding:7px 10px;border-bottom:2px solid #dee2e6;text-align:center;white-space:nowrap">Data</th>
                    </tr>
                </thead>
                <tbody>`;

        let ultimaTematica = null;
        let bgAlterna      = false;

        lista.forEach(item => {
            if (item.tematica !== ultimaTematica) {
                ultimaTematica = item.tematica;
                bgAlterna      = !bgAlterna;
            }

            const rowBg = bgAlterna ? 'background:#fafafa' : '';
            const cores  = corStatus[item.status_leitura] || { bg: '#f5f5f5', cor: '#555' };

            html += `<tr style="border-bottom:1px solid #dee2e6;${rowBg}">
                <td style="padding:6px 10px;font-weight:500;max-width:200px;word-break:break-word">${item.tematica || ''}</td>
                <td style="padding:6px 10px;text-align:center;color:#6c757d;font-size:0.8rem;white-space:nowrap">Leitura ${item.sequencia}</td>
                <td style="padding:6px 10px;max-width:260px;word-break:break-word">${item.titulo || ''}</td>
                <td style="padding:6px 10px;color:#555;max-width:180px;word-break:break-word">${item.autor || '—'}</td>
                <td style="padding:6px 10px;text-align:center">
                    <span style="padding:2px 10px;border-radius:12px;font-size:0.78rem;font-weight:600;
                                 background:${cores.bg};color:${cores.cor}">
                        ${item.status_leitura}
                    </span>
                </td>
                <td style="padding:6px 10px;text-align:center;font-size:0.8rem;white-space:nowrap">${item.data_referencia || '—'}</td>
            </tr>`;
        });

        html += '</tbody></table></div>';

        // Rodapé com totais por desafio
        html += '<div style="margin-top:16px;border-top:1px solid #dee2e6;padding-top:12px">';
        Object.entries(totais).forEach(([tematica, t]) => {
            const faltam = t.total - t.lidos;
            const pct    = t.total > 0 ? ((t.lidos / t.total) * 100).toFixed(1) : '0.0';
            const cor    = parseFloat(pct) >= 100 ? '#155724' : parseFloat(pct) >= 50 ? '#856404' : '#721c24';
            const bg     = parseFloat(pct) >= 100 ? '#d4edda'  : parseFloat(pct) >= 50 ? '#fff3cd'  : '#f8d7da';
            html += `
                <div style="margin-bottom:10px">
                    <div style="display:flex;align-items:center;gap:10px;font-size:0.83rem;margin-bottom:4px">
                        <span style="font-weight:600;min-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                              title="${tematica}">${tematica}</span>
                        <span style="flex:1;background:#e9ecef;border-radius:4px;height:10px;overflow:hidden">
                            <span style="display:block;width:${pct}%;height:100%;background:${parseFloat(pct) >= 100 ? '#28a745' : '#6f42c1'};border-radius:4px"></span>
                        </span>
                        <span style="padding:1px 8px;border-radius:4px;background:${bg};color:${cor};font-weight:bold;font-size:0.8rem">${pct}%</span>
                        <span style="color:#555;white-space:nowrap">${t.lidos} lid${t.lidos !== 1 ? 'os' : 'o'} · ${faltam} falt${faltam !== 1 ? 'am' : 'a'} de ${t.total}</span>
                    </div>
                </div>`;
        });
        html += '</div>';

        container.html(html);
    },

    // ─── DESAFIOS EM ANDAMENTO (dashboard inline) ─────────────────
    // Renderiza na div #bloco-desafios-andamento se existir

    carregarAndamento: async function () {
        const el = document.getElementById('desafiosAndamentoContainer');
        if (!el) return;

        el.innerHTML = '<p class="text-muted small" style="margin:6px 0">Carregando...</p>';

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/listar_desafios.php?ativos=1');
            const json = await resp.json();

            const lista = (json.status ? json.data : []).filter(d => d.situacao === 'Em andamento');

            if (lista.length === 0) {
                el.innerHTML = '<p class="text-muted small" style="margin:6px 0">Nenhum desafio em andamento.</p>';
                return;
            }

            let html = `<div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:#f8f9fa">
                        <tr>
                            <th style="padding:4px 8px;border-bottom:1px solid #dee2e6">Desafio</th>
                            <th style="padding:4px 8px;border-bottom:1px solid #dee2e6;text-align:center">Meta</th>
                            <th style="padding:4px 8px;border-bottom:1px solid #dee2e6;text-align:center">Lidos</th>
                            <th style="padding:4px 8px;border-bottom:1px solid #dee2e6;min-width:120px">Progresso</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(d => {
                const meta  = parseInt(d.meta_livros) || 0;
                const lidos = parseInt(d.livros_lidos) || 0;
                const pct   = meta > 0 ? Math.min((lidos / meta) * 100, 100).toFixed(1) : null;

                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:4px 8px;font-weight:500">${d.tematica || ''}</td>
                    <td style="padding:4px 8px;text-align:center">${meta || '—'}</td>
                    <td style="padding:4px 8px;text-align:center;color:#28a745;font-weight:bold">${lidos}</td>
                    <td style="padding:4px 8px">
                        ${pct !== null
                            ? `<div style="display:flex;align-items:center;gap:5px">
                                   <div style="flex:1;background:#e9ecef;border-radius:4px;height:7px;overflow:hidden">
                                       <div style="width:${pct}%;background:#28a745;height:100%;border-radius:4px"></div>
                                   </div>
                                   <span style="font-size:0.78rem">${pct}%</span>
                               </div>`
                            : '—'}
                    </td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            el.innerHTML = html;
        } catch (e) {
            console.error('Erro ao carregar desafios em andamento:', e);
            el.innerHTML = '<div class="alert alert-danger py-1 mb-0" style="font-size:0.82rem">Erro ao carregar.</div>';
        }
    },

    // ─── INCLUIR LIVRO NO DESAFIO ────────────────────────────────

    iniciarModalLivroDesafio: function () {
        $('#ld_local').val('');
        $('#ld_livro').val('').prop('disabled', true)
            .html('<option value="">— Selecione o local primeiro —</option>');
        $('#ld_painel_dados').hide();
        $('#ld_autor, #ld_sexo, #ld_paginas, #ld_nacionalidade, #ld_tema, #ld_mes').val('');
        const seq = $('#ld_sequencia').empty().append('<option value="">—</option>');
        for (let i = 1; i <= 60; i++) seq.append(`<option value="${i}">${i}</option>`);
        $('#ld_natureza').val('');
        $('#ld_mensagem').empty();
        this.carregarDesafiosSelect();
    },

    carregarDesafiosSelect: async function () {
        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/listar_desafios.php?ativos=1');
            const json = await resp.json();
            const lista = json.status ? (json.data || []) : [];
            const sel = $('#ld_nome_desafio').html('<option value="">— Selecione —</option>');
            lista.forEach(d => {
                sel.append(`<option value="${d.tematica}">${d.tematica}${d.ano ? ' (' + d.ano + ')' : ''}</option>`);
            });
        } catch (e) {
            console.error('Erro ao carregar desafios:', e);
        }
    },

    carregarLivrosPorLocal: async function () {
        const local = $('#ld_local').val();
        const sel   = $('#ld_livro');

        sel.prop('disabled', true).html('<option value="">Carregando...</option>');
        $('#ld_painel_dados').hide();
        $('#ld_autor, #ld_sexo, #ld_paginas, #ld_nacionalidade, #ld_tema, #ld_mes').val('');

        if (!local) {
            sel.html('<option value="">— Selecione o local primeiro —</option>');
            return;
        }

        if (this._livrosDesafioCache[local]) {
            this._popularSelectLivros(sel, this._livrosDesafioCache[local]);
            return;
        }

        try {
            const resp = await fetch(
                '/php/api/base/menu_lateral/desafios/buscar_leituras_desafio.php?local_leitura=' +
                encodeURIComponent(local)
            );
            const json = await resp.json();

            if (!json.status) {
                sel.html('<option value="">Erro ao carregar</option>');
                return;
            }

            this._livrosDesafioCache[local] = json.data || [];
            this._popularSelectLivros(sel, this._livrosDesafioCache[local]);
        } catch (e) {
            console.error('Erro ao carregar livros:', e);
            sel.html('<option value="">Erro ao carregar</option>');
        }
    },

    _popularSelectLivros: function (sel, lista) {
        sel.html('<option value="">— Selecione —</option>');
        lista.forEach(l => {
            sel.append(`<option value="${l.id}">${l.titulo}${l.autor ? ' — ' + l.autor : ''}</option>`);
        });
        sel.prop('disabled', false);
    },

    preencherDadosLivro: function () {
        const local = $('#ld_local').val();
        const id    = parseInt($('#ld_livro').val());
        const lista = this._livrosDesafioCache[local] || [];
        const livro = lista.find(l => parseInt(l.id) === id);

        if (!livro) { $('#ld_painel_dados').hide(); return; }

        $('#ld_autor').val(livro.autor || '');
        $('#ld_sexo').val(livro.sexo_autor || '');
        $('#ld_paginas').val(livro.paginas || '');
        $('#ld_nacionalidade').val(livro.nacionalidade || '');
        $('#ld_tema').val(livro.tema || '');
        $('#ld_mes').val(livro.mes || '');
        $('#ld_painel_dados').show();
    },

    salvarLivroDesafio: async function () {
        const id_leitura   = $('#ld_livro').val();
        const nome_desafio = $('#ld_nome_desafio').val();
        const sequencia    = $('#ld_sequencia').val();

        if (!id_leitura)   { this._msg('ld', 'danger', 'Selecione um livro.'); return; }
        if (!nome_desafio) { this._msg('ld', 'danger', 'Selecione o nome do desafio.'); return; }
        if (!sequencia)    { this._msg('ld', 'danger', 'Selecione a sequência.'); return; }

        const body = new FormData();
        body.append('id_leitura',       id_leitura);
        body.append('local_leitura',    $('#ld_local').val());
        body.append('nome_desafio',     nome_desafio);
        body.append('sequencia',        sequencia);
        body.append('natureza_desafio', $('#ld_natureza').val().trim());

        try {
            const resp = await fetch('/php/api/base/menu_lateral/desafios/create_desafio_leitura.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                this._msg('ld', 'danger', json.error || 'Erro ao incluir.');
                return;
            }

            $('#modalLivroDesafio').modal('hide');
            Swal.fire({
                title: 'Incluído!',
                text: 'Livro incluído no desafio com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745'
            }).then(() => {
                if ($('#livrosDesafiosContainer').length) desafios.carregarLivrosDesafios();
            });
        } catch (e) {
            console.error('Erro ao incluir livro no desafio:', e);
            this._msg('ld', 'danger', 'Erro inesperado. Tente novamente.');
        }
    },

};

window.desafios = desafios;
