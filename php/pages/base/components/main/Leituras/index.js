let leituras_view = {

    // ─── Utilitário de formatação de data ───────────────────────
    _fmtData: function (val) {
        if (!val) return '—';
        const s = String(val).split('T')[0].split('-');
        return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : val;
    },

    _fmtDataHora: function (val) {
        if (!val) return '—';
        const partes = String(val).replace('T', ' ').split(' ');
        const data   = partes[0].split('-');
        const hora   = partes[1] ? partes[1].slice(0, 5) : '';
        const dataBR = data.length === 3 ? `${data[2]}/${data[1]}/${data[0]}` : partes[0];
        return hora ? `${dataBR} ${hora}` : dataBR;
    },

    _estrelas: function (val) {
        if (val == null || val === '') return '—';
        const n = Math.round(parseFloat(val));
        return '⭐'.repeat(Math.max(0, Math.min(n, 5)));
    },

    // ─────────────────────────────────────────────────────────────
    //  LEITURAS EM ANDAMENTO
    // ─────────────────────────────────────────────────────────────

    carregarAndamento: async function () {
        $('#leiturasAndamentoTabela').html('<p class="text-muted small">Carregando...</p>');
        try {
            const resp = await fetch('/php/api/base/main/leituras/listar_andamento.php');
            const json = await resp.json();

            if (!json.status) {
                $('#leiturasAndamentoTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Nenhum dado encontrado.'}</div>`
                );
                return;
            }

            this._renderAndamento(json.data || []);
        } catch (e) {
            console.error('Erro ao carregar leituras em andamento:', e);
            $('#leiturasAndamentoTabela').html(
                '<div class="alert alert-danger">Erro ao carregar dados.</div>'
            );
        }
    },

    _renderAndamento: function (lista) {
        const container = $('#leiturasAndamentoTabela');

        if (lista.length === 0) {
            container.html('<p class="text-muted">Nenhuma leitura em andamento.</p>');
            return;
        }

        let html = `
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Título</th>
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Autor</th>
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Mídia</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Início</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Dias lendo</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">% Lido</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Pág. Atual</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Últ. Atualização</th>
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        lista.forEach(l => {
            const dias = parseInt(l.dias_lendo) || 0;

            let diasBg, diasCor;
            if (dias > 30)       { diasBg = '#ffebee'; diasCor = '#c62828'; }
            else if (dias > 15)  { diasBg = '#fff3e0'; diasCor = '#e65100'; }
            else                 { diasBg = '#e8f5e9'; diasCor = '#2e7d32'; }

            const pct = l.percentual != null
                ? `${parseFloat(l.percentual).toFixed(1)}%`
                : '—';
            const pag = l.pagina_atual != null ? l.pagina_atual : '—';

            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:5px 8px;white-space:normal;word-break:break-word;max-width:260px">${l.titulo || ''}</td>
                    <td style="padding:5px 8px;white-space:normal;max-width:160px">${l.autor || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.tipo_midia || '—'}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_inicio)}</td>
                    <td style="padding:5px 8px;text-align:center">
                        <span style="padding:2px 10px;border-radius:4px;background:${diasBg};color:${diasCor};font-weight:bold">${dias}</span>
                    </td>
                    <td style="padding:5px 8px;text-align:center">${pct}</td>
                    <td style="padding:5px 8px;text-align:center">${pag}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap;font-size:0.78rem">${this._fmtDataHora(l.ultima_atualizacao)}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.html(html);
    },

    // ─────────────────────────────────────────────────────────────
    //  LEITURAS DO MÊS
    // ─────────────────────────────────────────────────────────────

    carregarMes: async function (mesISO) {
        if (!mesISO) return;

        // "YYYY-MM" → "MM/YYYY"
        const [ano, mes] = mesISO.split('-');
        const mesFmt = `${mes}/${ano}`;

        $('#leiturasMesTabela').html('<p class="text-muted small">Carregando...</p>');
        $('#leiturasMesBadge').text('0 livros');

        try {
            const resp = await fetch(
                `/php/api/base/main/leituras/listar_mes.php?mes=${encodeURIComponent(mesFmt)}`
            );
            const json = await resp.json();

            const lista = (json.status && json.data) ? json.data : [];
            const qtd   = lista.length;
            $('#leiturasMesBadge').text(`${qtd} livro${qtd !== 1 ? 's' : ''}`);

            if (!json.status || qtd === 0) {
                $('#leiturasMesTabela').html('<p class="text-muted">Nenhum livro registrado neste mês.</p>');
                return;
            }

            this._renderMes(lista);
        } catch (e) {
            console.error('Erro ao carregar leituras do mês:', e);
            $('#leiturasMesTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderMes: function (lista) {
        let html = `
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Título</th>
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Autor</th>
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Natureza</th>
                        <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6">Mídia</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Páginas</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Avaliação</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Início</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Fim</th>
                        <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #dee2e6">Tempo</th>
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        lista.forEach(l => {
            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:5px 8px;white-space:normal;word-break:break-word;max-width:260px">${l.titulo || ''}</td>
                    <td style="padding:5px 8px;white-space:normal;max-width:160px">${l.autor || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.natureza || '—'}</td>
                    <td style="padding:5px 8px;white-space:nowrap">${l.tipo_midia || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${l.paginas || '—'}</td>
                    <td style="padding:5px 8px;text-align:center">${this._estrelas(l.avaliacao)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_inicio)}</td>
                    <td style="padding:5px 8px;text-align:center;white-space:nowrap">${this._fmtData(l.data_fim)}</td>
                    <td style="padding:5px 8px;text-align:center">${l.tempo_dias != null ? l.tempo_dias + 'd' : '—'}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#leiturasMesTabela').html(html);
    }

    // ─────────────────────────────────────────────────────────────
    //  LIVROS POR NACIONALIDADE
    // ─────────────────────────────────────────────────────────────

    carregarNacionalidade: async function () {
        $('#livrosAgrupTabela').html('<p class="text-muted small">Carregando...</p>');
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_nacionalidade.php');
            const json = await resp.json();

            if (!json.status) {
                $('#livrosAgrupTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Erro ao carregar dados.'}</div>`
                );
                return;
            }

            this._renderAgrupamento(json.data, 'nacionalidade', 'Nacionalidade');
        } catch (e) {
            console.error('Erro ao carregar por nacionalidade:', e);
            $('#livrosAgrupTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    // ─────────────────────────────────────────────────────────────
    //  LIVROS POR RAÇA
    // ─────────────────────────────────────────────────────────────

    carregarRaca: async function () {
        $('#livrosAgrupTabela').html('<p class="text-muted small">Carregando...</p>');
        try {
            const resp = await fetch('/php/api/base/main/livros/listar_por_raca.php');
            const json = await resp.json();

            if (!json.status) {
                $('#livrosAgrupTabela').html(
                    `<div class="alert alert-warning">${json.error || 'Erro ao carregar dados.'}</div>`
                );
                return;
            }

            this._renderAgrupamento(json.data, 'raca', 'Raça');
        } catch (e) {
            console.error('Erro ao carregar por raça:', e);
            $('#livrosAgrupTabela').html('<div class="alert alert-danger">Erro ao carregar dados.</div>');
        }
    },

    _renderAgrupamento: function (data, campoChave, labelColuna) {
        const totalGeral = data.total_geral || 0;
        const linhas     = data.linhas      || [];

        if (linhas.length === 0) {
            $('#livrosAgrupTabela').html('<p class="text-muted">Nenhum dado encontrado.</p>');
            return;
        }

        // Cores fixas para as categorias (ciclo)
        const cores = ['#4e79a7','#f28e2b','#e15759','#76b7b2',
                       '#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac'];

        let html = `
            <div class="mb-3">
                <span style="font-size:0.9rem;color:#555">
                    Total de livros no acervo: <strong>${totalGeral}</strong>
                </span>
            </div>
            <div class="tabela-wrapper">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1">
                    <tr style="font-size:0.82rem">
                        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #dee2e6">${labelColuna}</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #dee2e6">Total</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #dee2e6">Lidos</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #dee2e6">Lendo</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #dee2e6">Não Lidos</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #dee2e6;min-width:160px">% Lidos</th>
                        <th style="padding:6px 10px;text-align:center;border-bottom:2px solid #dee2e6">% do Acervo</th>
                    </tr>
                </thead>
                <tbody style="font-size:0.83rem">
        `;

        linhas.forEach((row, idx) => {
            const chave      = row[campoChave] || '—';
            const total      = parseInt(row.total)    || 0;
            const lidos      = parseInt(row.lidos)    || 0;
            const lendo      = parseInt(row.lendo)    || 0;
            const naoLidos   = parseInt(row.nao_lidos) || 0;
            const pctLidos   = total > 0 ? ((lidos / total) * 100).toFixed(1) : '0.0';
            const pctAcervo  = totalGeral > 0 ? ((total / totalGeral) * 100).toFixed(1) : '0.0';
            const cor        = cores[idx % cores.length];

            html += `
                <tr style="border-bottom:1px solid #dee2e6">
                    <td style="padding:6px 10px;font-weight:500">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
                                     background:${cor};margin-right:6px"></span>
                        ${chave}
                    </td>
                    <td style="padding:6px 10px;text-align:center;font-weight:bold">${total}</td>
                    <td style="padding:6px 10px;text-align:center;color:#28a745">${lidos}</td>
                    <td style="padding:6px 10px;text-align:center;color:#fd7e14">${lendo}</td>
                    <td style="padding:6px 10px;text-align:center;color:#6c757d">${naoLidos}</td>
                    <td style="padding:6px 10px">
                        <div style="display:flex;align-items:center;gap:6px">
                            <div style="flex:1;background:#e9ecef;border-radius:4px;height:8px;overflow:hidden">
                                <div style="width:${pctLidos}%;background:${cor};height:100%;border-radius:4px"></div>
                            </div>
                            <span style="white-space:nowrap;font-size:0.8rem">${pctLidos}%</span>
                        </div>
                    </td>
                    <td style="padding:6px 10px;text-align:center;font-size:0.8rem;color:#888">${pctAcervo}%</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        $('#livrosAgrupTabela').html(html);
    }

};

window.leituras_view = leituras_view;
