let dashboard = {

    _andamentoDados: [],
    _andSortCol: '',
    _andSortDir: 'asc',

    // ─── Utilitários ────────────────────────────────────────────
    _fmtData: function (val) {
        if (!val) return '—';
        const s = String(val).split('T')[0].split('-');
        return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : val;
    },

    _carregando: function (id) {
        document.getElementById(id).innerHTML =
            '<p class="text-muted small" style="margin:6px 0">Carregando...</p>';
    },

    _erro: function (id, msg) {
        document.getElementById(id).innerHTML =
            `<div class="alert alert-danger py-1 mb-0" style="font-size:0.82rem">${msg}</div>`;
    },

    _vazio: function (id, msg) {
        document.getElementById(id).innerHTML =
            `<p class="text-muted small" style="margin:6px 0">${msg}</p>`;
    },

    // ─── Init ────────────────────────────────────────────────────
    init: function () {
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const elMes = document.getElementById('mes-tbr-atual');
        if (elMes) elMes.textContent = meses[new Date().getMonth()];

        Promise.all([
            this.carregarAndamento(),
            this.carregarNaoLidosAntigos(),
            this.carregarLcVencendo(),
            this.carregarFavoritos2025(),
            this.carregarTbrEmBreve(),
            this.carregarQueroLerLogo(),
            this.carregarAdquiridos(),
            this.carregarGraficoTag(),
        ]).catch(function (e) {
            console.error('Erro no dashboard.init:', e);
        });
    },

    // ─── Leituras em Andamento ───────────────────────────────────
    carregarAndamento: async function () {
        const id = 'bloco-andamento';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/leituras/listar_andamento.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhuma leitura em andamento.');
                return;
            }

            this._andamentoDados = json.data;
            this._andSortCol = '';
            this._andSortDir = 'asc';
            this._renderAndamento();
        } catch (e) {
            console.error('carregarAndamento:', e);
            this._erro(id, 'Erro ao carregar leituras em andamento.');
        }
    },

    _sortAndamento: function (col) {
        if (this._andSortCol === col) {
            this._andSortDir = this._andSortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this._andSortCol = col;
            this._andSortDir = 'asc';
        }
        const dir    = this._andSortDir === 'asc' ? 1 : -1;
        const numCol = col === 'dias_lendo' || col === 'percentual';
        this._andamentoDados.sort(function (a, b) {
            const va = numCol ? (parseFloat(a[col]) || 0) : String(a[col] || '').toLowerCase();
            const vb = numCol ? (parseFloat(b[col]) || 0) : String(b[col] || '').toLowerCase();
            return va < vb ? -dir : va > vb ? dir : 0;
        });
        this._renderAndamento();
    },

    _renderAndamento: function () {
        const el = document.getElementById('bloco-andamento');
        if (!el || !this._andamentoDados) return;

        if (this._andamentoDados.length === 0) {
            this._vazio('bloco-andamento', 'Nenhuma leitura em andamento.');
            return;
        }

        const sc  = this._andSortCol;
        const sd  = this._andSortDir;
        const thSt = 'padding:4px 6px;border-bottom:2px solid #6a2bbf;cursor:pointer;user-select:none;white-space:nowrap;color:#6a2bbf';
        const thC  = thSt + ';text-align:center';

        function thEl(col, label, center) {
            const ind = col === sc ? (sd === 'asc' ? ' ↑' : ' ↓') : '';
            return `<th style="${center ? thC : thSt}" onclick="dashboard._sortAndamento('${col}')" title="Clique para ordenar">${label}${ind}</th>`;
        }

        let html = `<div style="max-height:280px;overflow-y:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                <thead style="background:rgba(106,43,191,0.07);position:sticky;top:0;z-index:1">
                    <tr>
                        ${thEl('titulo',      'Título',    false)}
                        ${thEl('autor',       'Autor',     false)}
                        ${thEl('data_inicio', 'Início',    true)}
                        ${thEl('dias_lendo',  'Dias',      true)}
                        ${thEl('percentual',  'Progresso', true)}
                        <th style="padding:4px 6px;border-bottom:2px solid #6a2bbf"></th>
                    </tr>
                </thead>
                <tbody>`;

        this._andamentoDados.forEach(function (l) {
            const dias   = parseInt(l.dias_lendo) || 0;
            const diasCor = dias > 30 ? '#c62828' : (dias > 15 ? '#e65100' : '#2e7d32');
            const diasBg  = dias > 30 ? '#ffebee' : (dias > 15 ? '#fff3e0' : '#e8f5e9');

            let progresso = '—';
            if (l.percentual != null) {
                progresso = `${parseFloat(l.percentual).toFixed(0)}%`;
            } else if (l.pagina_atual != null && l.paginas) {
                progresso = `${l.pagina_atual}/${l.paginas}`;
            } else if (l.pagina_atual != null) {
                progresso = `pág. ${l.pagina_atual}`;
            }

            html += `<tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:3px 6px;max-width:180px;word-break:break-word">${l.titulo || ''}</td>
                <td style="padding:3px 6px;max-width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.autor || '—'}</td>
                <td style="padding:3px 6px;text-align:center;white-space:nowrap">${dashboard._fmtData(l.data_inicio)}</td>
                <td style="padding:3px 6px;text-align:center">
                    <span style="padding:1px 7px;border-radius:4px;background:${diasBg};color:${diasCor};font-weight:bold">${dias}</span>
                </td>
                <td style="padding:3px 6px;text-align:center;font-weight:bold;color:#1565c0">${progresso}</td>
                <td style="padding:3px 4px;text-align:center">
                    <button onclick="dashboard.abrirModalAtualizar(${l.id})"
                            style="padding:2px 7px;font-size:0.73rem;border:1px solid #1976d2;background:#e3f2fd;color:#1565c0;border-radius:4px;cursor:pointer;white-space:nowrap">
                        ✏️ Atualizar
                    </button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        el.innerHTML = html;
    },

    abrirModalAtualizar: function (id) {
        const item = this._andamentoDados.find(function (i) { return i.id == id; });
        if (!item) return;

        $('#atualizar_id_leitura').val(item.id);
        $('#atualizar_titulo').val(item.titulo || '');
        $('#atualizar_autor').val(item.autor || '');
        $('#atualizar_paginas').val(item.paginas || '');
        $('#atualizar_tipo_midia').val(item.tipo_midia || '');
        $('#atualizar_data_inicio').val(item.data_inicio || '');
        $('#atualizar_local_leitura').val(item.local_leitura || '');
        $('#atualizar_titulo_display').text(item.titulo || '');
        $('#atualizar_total_paginas').text(item.paginas ? 'Total: ' + item.paginas + ' páginas' : '');
        $('#atualizar_percentual').val('');
        $('#atualizar_pagina_atual').val('');
        $('#atualizar_impressoes').val('');
        $('#atualizar_avaliacao').val('');
        $('#atualizar_mensagem').empty();
        $('#atualizar_tipo_percentual').prop('checked', true);
        this.onTipoInputChange();
        $('#modalAtualizarLeitura').modal('show');
    },

    onTipoInputChange: function () {
        const tipo = $('input[name="atualizar_tipo"]:checked').val();
        if (tipo === 'percentual') {
            $('#atualizar_campo_percentual').removeClass('d-none');
            $('#atualizar_campo_pagina').addClass('d-none');
        } else {
            $('#atualizar_campo_percentual').addClass('d-none');
            $('#atualizar_campo_pagina').removeClass('d-none');
        }
    },

    salvarAtualizacaoLeitura: async function () {
        const tipo = $('input[name="atualizar_tipo"]:checked').val();
        const body = new FormData();
        body.append('id_leitura',    $('#atualizar_id_leitura').val());
        body.append('titulo',        $('#atualizar_titulo').val());
        body.append('autor',         $('#atualizar_autor').val());
        body.append('paginas',       $('#atualizar_paginas').val());
        body.append('tipo_midia',    $('#atualizar_tipo_midia').val());
        body.append('data_inicio',   $('#atualizar_data_inicio').val());
        body.append('local_leitura', $('#atualizar_local_leitura').val());
        body.append('tipo_input',    tipo);

        if (tipo === 'percentual') {
            body.append('percentual', $('#atualizar_percentual').val());
        } else {
            body.append('pagina_atual', $('#atualizar_pagina_atual').val());
        }

        const impressoes = $('#atualizar_impressoes').val().trim();
        const avaliacao  = $('#atualizar_avaliacao').val().trim();
        if (impressoes) body.append('impressoes', impressoes);
        if (avaliacao)  body.append('avaliacao', avaliacao);

        $('#atualizar_mensagem').html('<p class="text-muted small mb-0">Salvando...</p>');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/create_atualizacao_leitura.php', {
                method: 'POST', body
            });
            const json = await resp.json();

            if (!json.status) {
                $('#atualizar_mensagem').html(`<div class="alert alert-danger py-1 mb-0">${json.error}</div>`);
                return;
            }

            $('#modalAtualizarLeitura').modal('hide');
            this.carregarAndamento();

            Swal.fire({
                title: 'Atualizado!',
                text: 'Progresso de leitura registrado com sucesso.',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
        } catch (e) {
            $('#atualizar_mensagem').html('<div class="alert alert-danger py-1 mb-0">Erro ao salvar. Tente novamente.</div>');
        }
    },

    // ─── Livros Não Lidos Antigos ────────────────────────────────
    carregarNaoLidosAntigos: async function () {
        const id = 'bloco-nao-lidos';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_nao_lidos_antigos.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum livro não lido antigo encontrado.');
                return;
            }

            const lista = json.data.slice(0, 5);
            let html = `<div>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(74,118,168,0.07)">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:2px solid #4a76a8;color:#4a76a8">#</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #4a76a8;color:#4a76a8">Título</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #4a76a8;color:#4a76a8">Autor</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #4a76a8;color:#4a76a8;text-align:center">Págs</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #4a76a8;color:#4a76a8">Status</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;color:#aaa">${l.id}</td>
                    <td style="padding:3px 6px;max-width:180px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;text-align:center">${l.paginas || '—'}</td>
                    <td style="padding:3px 6px">${l.status || 'Não iniciado'}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarNaoLidosAntigos:', e);
            this._erro(id, 'Erro ao carregar livros não lidos.');
        }
    },

    // ─── LCs Vencendo ────────────────────────────────────────────
    carregarLcVencendo: async function () {
        const id = 'bloco-lc';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_lc_vencendo.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhuma LC vencendo nos proximos 5 dias.');
                return;
            }

            const lista = json.data.slice(0, 7);
            let html = `<div>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(220,38,38,0.06)">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:2px solid #dc2626;color:#dc2626">Título</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #dc2626;color:#dc2626">LC</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #dc2626;color:#dc2626;text-align:center">Vencimento</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #dc2626;color:#dc2626">Situação</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;max-width:200px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px">${l.lc || '—'}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap;color:#c62828;font-weight:bold">${dashboard._fmtData(l.data_final)}</td>
                    <td style="padding:3px 6px">${l.situacao || '—'}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarLcVencendo:', e);
            this._erro(id, 'Erro ao carregar LCs vencendo.');
        }
    },

    // ─── Favoritos 2026 ──────────────────────────────────────────
    carregarFavoritos2025: async function () {
        const id = 'bloco-favoritos';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_favoritos_2025.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum favorito em 2026 ainda.');
                return;
            }

            const lista = json.data.slice(0, 5);
            let html = `<div style="max-height:185px;overflow-y:auto">
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(217,119,6,0.07);position:sticky;top:0;z-index:1">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:2px solid #d97706;color:#d97706">Título</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #d97706;color:#d97706">Autor</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #d97706;color:#d97706;text-align:center">Lido em</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                // Usa data_fim_fmt (YYYY-MM) se disponível, senão mes_leitura (nome do mês)
                const quando = l.data_fim_fmt || l.mes_leitura || '—';
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;max-width:200px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${quando}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarFavoritos2026:', e);
            this._erro(id, 'Erro ao carregar favoritos.');
        }
    },

    // ─── TBR em Breve ────────────────────────────────────────────
    carregarTbrEmBreve: async function () {
        const id = 'bloco-tbr-breve';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_tbr_em_breve.php');
            const json = await resp.json();

            if (!json.status) {
                this._erro(id, json.error || 'Erro ao carregar TBR.');
                return;
            }

            if (!json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum livro no TBR do mês atual.');
                return;
            }

            const lista = json.data.slice(0, 7);
            const thS = 'padding:4px 6px;border-bottom:2px solid #0891b2;color:#0891b2;white-space:nowrap';
            let html = `<div style="max-height:220px;overflow-y:auto">
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(8,145,178,0.07);position:sticky;top:0;z-index:1">
                        <tr>
                            <th style="${thS}">Título</th>
                            <th style="${thS}">Autor</th>
                            <th style="${thS}">Tipo</th>
                            <th style="${thS};text-align:center">Pág.</th>
                            <th style="${thS}">Origem</th>
                            <th style="${thS}">Quando</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                const tipo   = l.tipo_edicao || '—';
                const pag    = (l.paginas && l.paginas > 0) ? l.paginas : '—';
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${l.titulo || ''}">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;white-space:nowrap;font-size:0.78rem">${tipo}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${pag}</td>
                    <td style="padding:3px 6px;white-space:nowrap">${l.origem || '—'}</td>
                    <td style="padding:3px 6px;white-space:nowrap;font-size:0.78rem;color:#555">${l.previsao_leitura || '—'}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarTbrEmBreve:', e);
            this._erro(id, 'Erro ao carregar TBR do mes.');
        }
    },

    // ─── Quero Ler Logo ──────────────────────────────────────────
    carregarQueroLerLogo: async function () {
        const id = 'bloco-quero-ler';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_quero_ler_logo.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Lista Quero Ler Logo vazia.');
                return;
            }

            const lista = json.data.slice(0, 7);
            const corPrioridade = { 'Alta': '#c62828', 'Média': '#e65100', 'Baixa': '#2e7d32' };

            let html = `<div>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(5,150,105,0.07)">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:2px solid #059669;color:#059669">Título</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #059669;color:#059669">Autor</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #059669;color:#059669">Tema</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #059669;color:#059669;text-align:center">Prioridade</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                const cor = corPrioridade[l.prioridade] || '#555';
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;max-width:190px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;white-space:nowrap">${l.tema || '—'}</td>
                    <td style="padding:3px 6px;text-align:center">
                        <span style="color:${cor};font-weight:bold;font-size:0.78rem">${l.prioridade || '—'}</span>
                    </td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarQueroLerLogo:', e);
            this._erro(id, 'Erro ao carregar Quero Ler Logo.');
        }
    },

    // ─── Adquiridos Recentemente ─────────────────────────────────
    carregarAdquiridos: async function () {
        const id = 'bloco-adquiridos';
        this._carregando(id);
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_adquiridos_recentes.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum livro adquirido recentemente.');
                return;
            }

            const lista = json.data.slice(0, 7);
            let html = `<div>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:rgba(124,58,237,0.07)">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:2px solid #7c3aed;color:#7c3aed">#</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #7c3aed;color:#7c3aed">Título</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #7c3aed;color:#7c3aed">Autor</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #7c3aed;color:#7c3aed">Natureza</th>
                            <th style="padding:4px 6px;border-bottom:2px solid #7c3aed;color:#7c3aed;text-align:center">Data Compra</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;color:#aaa">${l.id}</td>
                    <td style="padding:3px 6px;max-width:180px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;white-space:nowrap">${l.natureza || '—'}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${dashboard._fmtData(l.data_compra)}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarAdquiridos:', e);
            this._erro(id, 'Erro ao carregar adquiridos recentes.');
        }
    },

    // ─── Gráfico Livros TAG ──────────────────────────────────────
    carregarGraficoTag: async function () {
        const id = 'bloco-tag-chart';
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<p class="text-muted small" style="margin:6px 0">Carregando...</p>';

        try {
            if (!window.Chart) {
                await new Promise(function (resolve, reject) {
                    var s = document.createElement('script');
                    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }

            const resp = await fetch('/php/api/base/main/livros/listar_grafico_acervo.php');
            const json = await resp.json();

            if (!json.status || !json.data || !json.data.tag) {
                el.innerHTML = '<p class="text-muted small" style="margin:6px 0">Sem dados TAG.</p>';
                return;
            }

            const tag     = json.data.tag;
            const lidos   = parseInt(tag.lidos     || 0);
            const lendo   = parseInt(tag.lendo     || 0);
            const naoLido = parseInt(tag.nao_lidos || 0);
            const total   = lidos + lendo + naoLido;

            if (total === 0) {
                el.innerHTML = '<p class="text-muted small" style="margin:6px 0">Nenhum livro TAG cadastrado.</p>';
                return;
            }

            el.innerHTML = '';

            // Wrapper do canvas com altura fixa
            const chartWrap = document.createElement('div');
            chartWrap.style.cssText = 'position:relative;height:150px';
            const canvas = document.createElement('canvas');
            chartWrap.appendChild(canvas);
            el.appendChild(chartWrap);

            new Chart(canvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Lidos', 'Lendo', 'Não lidos'],
                    datasets: [{
                        data: [lidos, lendo, naoLido],
                        backgroundColor: ['#28a745', '#fd7e14', '#adb5bd'],
                        borderWidth: 2,
                        borderColor: '#fff',
                        hoverOffset: 6,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (c) {
                                    const pct = total > 0 ? ((c.parsed / total) * 100).toFixed(1) : 0;
                                    return ' ' + c.label + ': ' + c.parsed + ' (' + pct + '%)';
                                }
                            }
                        }
                    }
                }
            });

            // Legenda HTML simples
            function pct(n) { return total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%'; }
            const cores = ['#28a745', '#fd7e14', '#adb5bd'];
            const itens = [
                { label: 'Lidos',     valor: lidos   },
                { label: 'Lendo',     valor: lendo   },
                { label: 'Não lidos', valor: naoLido },
            ];
            const legend = document.createElement('div');
            legend.style.cssText = 'display:flex;justify-content:center;flex-wrap:wrap;gap:8px 14px;margin-top:8px';
            itens.forEach(function (it, i) {
                const span = document.createElement('span');
                span.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:0.78rem;color:#444';
                span.innerHTML =
                    '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:' +
                    cores[i] + ';flex-shrink:0"></span>' +
                    it.label + ': <strong>' + it.valor + '</strong>&nbsp;<span style="color:#888">(' + pct(it.valor) + ')</span>';
                legend.appendChild(span);
            });
            el.appendChild(legend);
        } catch (e) {
            console.error('carregarGraficoTag:', e);
            if (el) el.innerHTML = '<div class="alert alert-danger py-1 mb-0" style="font-size:0.82rem">Erro ao carregar gráfico TAG.</div>';
        }
    },

    // ─── Leituras do Mês (consultas — não está no init principal) ─
    carregarLeiturasMes: async function (mes) {
        const id = 'bloco-previsoes';
        this._carregando(id);

        if (!mes) {
            const hoje = new Date();
            const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
            mes = `${hoje.getFullYear()}-${mm}`;
        }

        // Sincroniza o input do mês com o valor usado
        const inputMes = document.getElementById('input-mes-leituras');
        if (inputMes && !inputMes.value) inputMes.value = mes;

        try {
            const resp = await fetch(`/php/api/base/main/leituras/listar_mes.php?mes=${mes}`);
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum livro concluído neste mês.');
                return;
            }

            const lista = json.data;
            let html = `<div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
                    <thead style="background:#f8f9fa">
                        <tr>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6">Título</th>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6">Autor</th>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6;text-align:center">Início</th>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6;text-align:center">Término</th>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6;text-align:center">Dias</th>
                            <th style="padding:4px 6px;border-bottom:1px solid #dee2e6;text-align:center">Nota</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lista.forEach(function (l) {
                const dias = (l.tempo_dias !== null && l.tempo_dias !== undefined) ? l.tempo_dias : '—';
                const nota = l.avaliacao ? parseFloat(l.avaliacao).toFixed(1) + ' ⭐' : '—';
                html += `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:3px 6px;max-width:180px;word-break:break-word">${l.titulo || ''}</td>
                    <td style="padding:3px 6px;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.autor || '—'}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${dashboard._fmtData(l.data_inicio)}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${dashboard._fmtData(l.data_fim)}</td>
                    <td style="padding:3px 6px;text-align:center">${dias}</td>
                    <td style="padding:3px 6px;text-align:center;white-space:nowrap">${nota}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            document.getElementById(id).innerHTML = html;
        } catch (e) {
            console.error('carregarLeiturasMes:', e);
            this._erro(id, 'Erro ao carregar leituras do mês.');
        }
    },

    // ─── Leituras Agrupadas (Raça / Nacionalidade / Sexo) ────────
    _agrupCfg: {
        raca: { bloco: 'bloco-raca', filtroCol: 'raça',      filtroId: 'filtro-raca', filtroPlaceholder: 'Todas as raças'  },
        pais: { bloco: 'bloco-pais', filtroCol: 'pais',       filtroId: 'filtro-pais', filtroPlaceholder: 'Todos os países' },
        sexo: { bloco: 'bloco-sexo', filtroCol: 'sexo_autor', filtroId: 'filtro-sexo', filtroPlaceholder: 'Todos os sexos'  },
    },

    _agrupDados: [],

    _agrupEstado: {
        raca: { pagina: 1, sortCol: 'raça',      sortDir: 1, filtro: '' },
        pais: { pagina: 1, sortCol: 'pais',       sortDir: 1, filtro: '' },
        sexo: { pagina: 1, sortCol: 'sexo_autor', sortDir: 1, filtro: '' },
    },

    carregarAgrupado: async function () {
        const self  = this;
        const tipos = ['raca', 'pais', 'sexo'];
        tipos.forEach(function (t) { self._carregando(self._agrupCfg[t].bloco); });

        try {
            const resp = await fetch('/php/api/base/main/leituras/listar_leituras_agrupado.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                tipos.forEach(function (t) { self._vazio(self._agrupCfg[t].bloco, 'Nenhum livro encontrado.'); });
                return;
            }

            this._agrupDados = json.data;

            // Popula os selects de filtro com valores únicos de cada dimensão
            tipos.forEach(function (tipo) {
                const cfg  = self._agrupCfg[tipo];
                const vals = [...new Set(
                    self._agrupDados.map(function (d) { return d[cfg.filtroCol] || ''; }).filter(Boolean)
                )].sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

                const sel = document.getElementById(cfg.filtroId);
                if (!sel) return;
                sel.innerHTML = '<option value="">' + cfg.filtroPlaceholder + '</option>';
                vals.forEach(function (v) {
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v;
                    sel.appendChild(opt);
                });

                self._renderAgrupado(tipo);
            });

        } catch (e) {
            console.error('carregarAgrupado:', e);
            tipos.forEach(function (t) { self._erro(self._agrupCfg[t].bloco, 'Erro ao carregar dados.'); });
        }
    },

    _filtrarAgrupado: function (tipo, valor) {
        this._agrupEstado[tipo].filtro = valor;
        this._agrupEstado[tipo].pagina = 1;
        this._renderAgrupado(tipo);
    },

    _ordenarAgrupado: function (tipo, col) {
        const est = this._agrupEstado[tipo];
        est.sortDir = est.sortCol === col ? est.sortDir * -1 : 1;
        est.sortCol = col;
        est.pagina  = 1;
        this._renderAgrupado(tipo);
    },

    _paginarAgrupado: function (tipo, delta) {
        const perPag  = 20;
        const total   = Math.ceil(this._agrupFiltrados(tipo).length / perPag) || 1;
        const nova    = this._agrupEstado[tipo].pagina + delta;
        if (nova < 1 || nova > total) return;
        this._agrupEstado[tipo].pagina = nova;
        this._renderAgrupado(tipo);
    },

    _agrupFiltrados: function (tipo) {
        const cfg    = this._agrupCfg[tipo];
        const est    = this._agrupEstado[tipo];
        const numCols = ['paginas', 'avaliacao'];

        let dados = this._agrupDados;
        if (est.filtro) {
            dados = dados.filter(function (d) { return (d[cfg.filtroCol] || '') === est.filtro; });
        }

        const col = est.sortCol;
        const dir = est.sortDir;
        return [...dados].sort(function (a, b) {
            let vA = a[col] != null ? a[col] : '';
            let vB = b[col] != null ? b[col] : '';
            if (numCols.includes(col)) {
                return dir * ((parseFloat(vA) || 0) - (parseFloat(vB) || 0));
            }
            return dir * String(vA).localeCompare(String(vB), 'pt-BR');
        });
    },

    _renderAgrupado: function (tipo) {
        const cfg    = this._agrupCfg[tipo];
        const est    = this._agrupEstado[tipo];
        const perPag = 20;
        const dados  = this._agrupFiltrados(tipo);
        const total  = dados.length;
        const totPag = Math.ceil(total / perPag) || 1;
        const inicio = (est.pagina - 1) * perPag;
        const pagina = dados.slice(inicio, inicio + perPag);

        const col  = est.sortCol;
        const dir  = est.sortDir;
        const seta = function (c) { return c === col ? (dir === 1 ? ' ▲' : ' ▼') : ''; };

        const thSt = 'padding:4px 6px;border-bottom:2px solid #dee2e6;cursor:pointer;user-select:none;white-space:nowrap;font-size:0.8rem';
        const th   = function (c, label, pct) {
            return '<th style="' + thSt + ';width:' + pct + '%" ' +
                   'onclick="dashboard._ordenarAgrupado(\'' + tipo + '\',\'' + c + '\')">' +
                   label + seta(c) + '</th>';
        };

        let html = '<div style="overflow-x:hidden">' +
            '<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:0.81rem">' +
            '<thead style="background:#f8f9fa">' +
            '<tr>' +
            th('titulo',     'Título',   22) +
            th('autor',      'Autor',    15) +
            th('raça',       'Raça',      7) +
            th('pais',       'País',      9) +
            th('sexo_autor', 'Sexo',      7) +
            th('natureza',   'Natureza',  9) +
            th('tema',       'Tema',      9) +
            th('paginas',    'Págs',      5) +
            th('mes',        'Mês',       7) +
            th('avaliacao',  'Nota',      5) +
            th('bAtivo',     'Ativo',     5) +
            '</tr></thead><tbody>';

        const tdTxt = 'padding:3px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
        const tdCtr = 'padding:3px 6px;text-align:center;white-space:nowrap';

        pagina.forEach(function (l) {
            const nota  = l.avaliacao ? parseFloat(l.avaliacao).toFixed(1) + ' ⭐' : '—';
            const ativo = (l.bAtivo == 1)
                ? '<span style="background:#c8e6c9;color:#2e7d32;padding:1px 5px;border-radius:3px;font-size:0.72rem">Sim</span>'
                : '<span style="background:#f5f5f5;color:#888;padding:1px 5px;border-radius:3px;font-size:0.72rem">Não</span>';
            const esc = function (s) { return String(s || '').replace(/"/g, '&quot;'); };

            html += '<tr style="border-bottom:1px solid #f0f0f0">' +
                '<td style="' + tdTxt + '" title="' + esc(l.titulo)     + '">' + (l.titulo     || '')  + '</td>' +
                '<td style="' + tdTxt + '" title="' + esc(l.autor)      + '">' + (l.autor      || '—') + '</td>' +
                '<td style="' + tdTxt + '">'                                  + (l['raça']    || '—') + '</td>' +
                '<td style="' + tdTxt + '">'                                  + (l.pais       || '—') + '</td>' +
                '<td style="' + tdCtr + '">'                                  + (l.sexo_autor || '—') + '</td>' +
                '<td style="' + tdTxt + '">'                                  + (l.natureza   || '—') + '</td>' +
                '<td style="' + tdTxt + '">'                                  + (l.tema       || '—') + '</td>' +
                '<td style="' + tdCtr + '">'                                  + (l.paginas    || '—') + '</td>' +
                '<td style="' + tdCtr + '">'                                  + (l.mes        || '—') + '</td>' +
                '<td style="' + tdCtr + '">'                                  + nota                  + '</td>' +
                '<td style="' + tdCtr + '">'                                  + ativo                 + '</td>' +
                '</tr>';
        });

        html += '</tbody></table></div>';

        // Paginação
        const btnSt   = 'padding:2px 10px;font-size:0.8rem;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer';
        const btnAnt  = est.pagina <= 1
            ? '<button style="' + btnSt + ';opacity:0.4" disabled>‹ Anterior</button>'
            : '<button style="' + btnSt + '" onclick="dashboard._paginarAgrupado(\'' + tipo + '\',-1)">‹ Anterior</button>';
        const btnProx = est.pagina >= totPag
            ? '<button style="' + btnSt + ';opacity:0.4" disabled>Próximo ›</button>'
            : '<button style="' + btnSt + '" onclick="dashboard._paginarAgrupado(\'' + tipo + '\',1)">Próximo ›</button>';
        const fim     = Math.min(inicio + perPag, total);
        const filtMsg = est.filtro ? ' filtrado' + (total !== 1 ? 's' : '') : '';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:0.8rem;color:#555">' +
            '<span>' + total + ' livro' + (total !== 1 ? 's' : '') + filtMsg +
            ' — mostrando ' + (total > 0 ? inicio + 1 : 0) + '–' + fim + '</span>' +
            '<div style="display:flex;gap:8px">' +
            btnAnt +
            '<span style="padding:2px 6px">Pág. ' + est.pagina + ' / ' + totPag + '</span>' +
            btnProx +
            '</div></div>';

        document.getElementById(cfg.bloco).innerHTML = html;
    },

    // ─── Leituras por Ano ────────────────────────────────────────
    _anoDados:    [],
    _anoPagina:   1,
    _anoSortCol:  'data_fim',
    _anoSortDir:  1,
    _anoPorPagina: 20,

    carregarLeiturasAno: async function (ano) {
        const id = 'bloco-ano';
        this._carregando(id);

        if (!ano) {
            ano = new Date().getFullYear();
        }

        const inputAno = document.getElementById('input-ano-leituras');
        if (inputAno && !inputAno.value) inputAno.value = ano;

        try {
            const resp = await fetch(`/php/api/base/main/leituras/listar_ano.php?ano=${ano}`);
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                this._vazio(id, 'Nenhum livro concluído neste ano.');
                return;
            }

            this._anoDados   = json.data;
            this._anoPagina  = 1;
            this._renderLeiturasAno();
        } catch (e) {
            console.error('carregarLeiturasAno:', e);
            this._erro(id, 'Erro ao carregar leituras do ano.');
        }
    },

    _anoOrdenar: function (col) {
        if (this._anoSortCol === col) {
            this._anoSortDir *= -1;
        } else {
            this._anoSortCol = col;
            this._anoSortDir = 1;
        }
        this._anoPagina = 1;
        this._renderLeiturasAno();
    },

    _anoPaginar: function (delta) {
        const totalPags = Math.ceil(this._anoDados.length / this._anoPorPagina);
        const nova = this._anoPagina + delta;
        if (nova < 1 || nova > totalPags) return;
        this._anoPagina = nova;
        this._renderLeiturasAno();
    },

    _renderLeiturasAno: function () {
        const id      = 'bloco-ano';
        const col     = this._anoSortCol;
        const dir     = this._anoSortDir;
        const numCols = ['paginas', 'tempo_dias', 'avaliacao'];
        const dtCols  = ['data_inicio', 'data_fim'];

        const sorted = [...this._anoDados].sort(function (a, b) {
            let vA = a[col], vB = b[col];
            if (vA == null) vA = '';
            if (vB == null) vB = '';
            if (dtCols.includes(col)) {
                vA = vA ? new Date(vA) : new Date(0);
                vB = vB ? new Date(vB) : new Date(0);
                return dir * (vA - vB);
            }
            if (numCols.includes(col)) {
                return dir * ((parseFloat(vA) || 0) - (parseFloat(vB) || 0));
            }
            return dir * String(vA).localeCompare(String(vB), 'pt-BR');
        });

        const total     = sorted.length;
        const totalPags = Math.ceil(total / this._anoPorPagina);
        const inicio    = (this._anoPagina - 1) * this._anoPorPagina;
        const pagina    = sorted.slice(inicio, inicio + this._anoPorPagina);

        const seta = function (c) {
            if (c !== col) return '';
            return dir === 1 ? ' ▲' : ' ▼';
        };

        const thStyle = 'padding:4px 6px;border-bottom:2px solid #dee2e6;cursor:pointer;user-select:none;white-space:nowrap;font-size:0.8rem';
        const th = function (c, label, pct) {
            return `<th style="${thStyle};width:${pct}%" onclick="dashboard._anoOrdenar('${c}')">${label}${seta(c)}</th>`;
        };

        let html = `
        <div style="overflow-x:hidden">
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:0.81rem">
            <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
              <tr>
                ${th('titulo',      'Título',   28)}
                ${th('autor',       'Autor',    18)}
                ${th('natureza',    'Natureza', 11)}
                ${th('tipo_midia',  'Mídia',     8)}
                ${th('paginas',     'Págs',      5)}
                ${th('data_inicio', 'Início',    9)}
                ${th('data_fim',    'Término',   9)}
                ${th('tempo_dias',  'Dias',      5)}
                ${th('avaliacao',   'Nota',      7)}
              </tr>
            </thead>
            <tbody>`;

        const self = dashboard;
        pagina.forEach(function (l) {
            const dias = (l.tempo_dias !== null && l.tempo_dias !== undefined) ? l.tempo_dias : '—';
            const nota = l.avaliacao ? parseFloat(l.avaliacao).toFixed(1) + ' ⭐' : '—';
            const tdTxt = 'padding:3px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
            const tdCtr = 'padding:3px 6px;text-align:center;white-space:nowrap';
            html += `<tr style="border-bottom:1px solid #f0f0f0">
                <td style="${tdTxt}" title="${(l.titulo || '').replace(/"/g, '&quot;')}">${l.titulo || ''}</td>
                <td style="${tdTxt}" title="${(l.autor  || '').replace(/"/g, '&quot;')}">${l.autor  || '—'}</td>
                <td style="${tdTxt}">${l.natureza  || '—'}</td>
                <td style="${tdTxt}">${l.tipo_midia || '—'}</td>
                <td style="${tdCtr}">${l.paginas    || '—'}</td>
                <td style="${tdCtr}">${self._fmtData(l.data_inicio)}</td>
                <td style="${tdCtr}">${self._fmtData(l.data_fim)}</td>
                <td style="${tdCtr}">${dias}</td>
                <td style="${tdCtr}">${nota}</td>
            </tr>`;
        });

        html += `</tbody></table></div>`;

        // Rodapé de paginação
        const btnStyle = 'padding:2px 10px;font-size:0.8rem;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer';
        const btnAntes = this._anoPagina <= 1
            ? `<button style="${btnStyle};opacity:0.4" disabled>‹ Anterior</button>`
            : `<button style="${btnStyle}" onclick="dashboard._anoPaginar(-1)">‹ Anterior</button>`;
        const btnProx = this._anoPagina >= totalPags
            ? `<button style="${btnStyle};opacity:0.4" disabled>Próximo ›</button>`
            : `<button style="${btnStyle}" onclick="dashboard._anoPaginar(1)">Próximo ›</button>`;

        html += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:0.8rem;color:#555">
            <span>${total} livro${total !== 1 ? 's' : ''} — mostrando ${inicio + 1}–${Math.min(inicio + this._anoPorPagina, total)}</span>
            <div style="display:flex;gap:8px">
                ${btnAntes}
                <span style="padding:2px 6px;font-size:0.8rem">Pág. ${this._anoPagina} / ${totalPags}</span>
                ${btnProx}
            </div>
        </div>`;

        document.getElementById(id).innerHTML = html;
    },

};

window.dashboard = dashboard;
