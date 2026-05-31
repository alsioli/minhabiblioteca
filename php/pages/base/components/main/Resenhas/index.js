let resenhas_view = {

    _dados: [],

    init: async function () {
        await this._carregarMeses();
    },

    _carregarMeses: async function () {
        const sel = document.getElementById('resenhasMesFiltro');
        if (!sel) return;

        try {
            const resp = await fetch('/php/api/base/main/resenhas/listar_resenhas.php?acao=meses');
            const json = await resp.json();

            if (!json.status || !json.data) return;

            sel.innerHTML = '<option value="">— Todos os meses —</option>';
            json.data.forEach(function (r) {
                const opt = document.createElement('option');
                opt.value       = r.mes_leitura;
                opt.textContent = r.mes_leitura;
                sel.appendChild(opt);
            });
        } catch (e) {
            console.error('Erro ao carregar meses:', e);
        }
    },

    buscar: async function () {
        const mes   = (document.getElementById('resenhasMesFiltro') || {}).value || '';
        const busca = (document.getElementById('resenhasBuscaTitulo') || {}).value || '';

        const box = document.getElementById('resenhasTabela');
        if (!box) return;

        box.innerHTML = '<p class="text-muted small">Carregando...</p>';

        const params = new URLSearchParams();
        if (mes)   params.set('mes',   mes);
        if (busca) params.set('busca', busca);

        try {
            const resp = await fetch('/php/api/base/main/resenhas/listar_resenhas.php?' + params.toString());
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = `<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`;
                return;
            }

            this._dados = json.data || [];
            this._renderTabela(this._dados);
        } catch (e) {
            console.error('Erro ao carregar resenhas:', e);
            box.innerHTML = '<div class="alert alert-danger">Erro ao carregar resenhas.</div>';
        }
    },

    _renderTabela: function (dados) {
        const box = document.getElementById('resenhasTabela');

        if (!dados || dados.length === 0) {
            box.innerHTML = '<p class="text-muted small">Nenhuma resenha encontrada.</p>';
            return;
        }

        const thSt  = 'padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6;font-size:0.82rem;background:#f8f9fa;position:sticky;top:0;z-index:1';
        const tdSt  = 'padding:5px 8px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;vertical-align:top';
        const tdCtr = 'padding:5px 8px;border-bottom:1px solid #f0f0f0;font-size:0.83rem;text-align:center;white-space:nowrap;vertical-align:top';

        let html = `
            <div style="margin-bottom:6px;font-size:0.82rem;color:#666">
                ${dados.length} resenha(s) encontrada(s)
            </div>
            <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead>
                    <tr>
                        <th style="${thSt}">Livro</th>
                        <th style="${thSt}">Autor</th>
                        <th style="${thSt};width:100px">Mês</th>
                        <th style="${thSt};width:80px">Avaliação</th>
                        <th style="${thSt}">Resenha (prévia)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        dados.forEach(function (row, idx) {
            const preview = (row.resenhas || '').length > 120
                ? row.resenhas.substring(0, 120) + '...'
                : (row.resenhas || '—');

            html += `
                <tr style="cursor:pointer"
                    onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''"
                    onclick="resenhas_view.abrirModal(${idx})"
                    title="Clique para ler a resenha completa">
                    <td style="${tdSt};font-weight:500;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.nome_livro || '').replace(/"/g, '&quot;')}">
                        ${row.nome_livro || '—'}
                    </td>
                    <td style="${tdSt};max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.autor || '').replace(/"/g, '&quot;')}">
                        ${row.autor || '—'}
                    </td>
                    <td style="${tdCtr}">${row.mes_leitura || '—'}</td>
                    <td style="${tdCtr}">${row.avaliacao != null ? row.avaliacao : '—'}</td>
                    <td style="${tdSt};max-width:400px;color:#555">${preview}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        box.innerHTML = html;
    },

    abrirModal: function (idx) {
        const row = this._dados[idx];
        if (!row) return;

        document.getElementById('modalResenhaLivro').textContent     = row.nome_livro   || '—';
        document.getElementById('modalResenhaAutor').textContent     = row.autor         || '—';
        document.getElementById('modalResenhaMes').textContent       = row.mes_leitura   || '—';
        document.getElementById('modalResenhaAvaliacao').textContent = row.avaliacao != null ? row.avaliacao : '—';
        document.getElementById('modalResenhaTexto').textContent     = row.resenhas      || '';

        this._modalAtual = row;
        $('#modalVerResenha').modal('show');
    },

    gerarPDF: function () {
        const row = this._modalAtual;
        if (!row) return;

        const janela = window.open('', '_blank', 'width=860,height=700');
        if (!janela) return;

        const texto = (row.resenhas || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        janela.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Resenha — ${row.nome_livro || ''}</title>
                <style>
                    body { font-family: Georgia, serif; padding: 40px; color: #222; max-width: 780px; margin: 0 auto; }
                    h1 { font-size: 1.2rem; margin: 0 0 4px; }
                    .meta { font-size: 0.88rem; color: #555; margin-bottom: 28px; }
                    .meta span { margin-right: 20px; }
                    .resenha-texto { font-size: 0.92rem; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
                    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
                    @media print { body { padding: 10px; } }
                </style>
            </head>
            <body>
                <h1>${row.nome_livro || ''}</h1>
                <div class="meta">
                    <span><strong>Autor:</strong> ${row.autor || '—'}</span>
                    <span><strong>Mês de leitura:</strong> ${row.mes_leitura || '—'}</span>
                    <span><strong>Avaliação:</strong> ${row.avaliacao != null ? row.avaliacao : '—'}</span>
                </div>
                <hr>
                <div class="resenha-texto">${texto}</div>
                <script>window.onload = function () { window.print(); };<\/script>
            </body>
            </html>
        `);
        janela.document.close();
    },

    _modalAtual: null,

};

window.resenhas_view = resenhas_view;
