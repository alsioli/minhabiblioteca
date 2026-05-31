let tbr_view = {

    _dados: [],
    _mesAtual: '',
    _editando: null,

    init: async function () {
        this._injetarModal();
        await this._carregarMeses();
    },

    _injetarModal: function () {
        if (document.getElementById('modalEditarTBR')) return;

        const html = `
            <div class="modal fade" id="modalEditarTBR" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header" style="background:#343a40;color:#fff;padding:12px 16px">
                    <h5 class="modal-title" style="font-size:0.95rem;font-weight:700">Editar TBR</h5>
                    <button type="button" class="close" style="color:#fff;opacity:1" data-dismiss="modal">
                      <span>&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p id="tbrEditTitulo" style="font-weight:600;font-size:0.95rem;margin-bottom:16px"></p>

                    <div class="form-group">
                      <label style="font-size:0.85rem;font-weight:600">Mês de referência</label>
                      <input type="month" id="tbrEditMes" class="form-control" style="width:200px">
                    </div>

                    <div class="form-group">
                      <label style="font-size:0.85rem;font-weight:600">Previsão de leitura</label>
                      <select id="tbrEditPrevisao" class="form-control">
                        <option value="Começo do mês">Começo do mês</option>
                        <option value="Depois do dia 10">Depois do dia 10</option>
                        <option value="Antes do dia 20">Antes do dia 20</option>
                        <option value="Final do mês">Final do mês</option>
                      </select>
                    </div>

                    <div id="tbrEditMsg" class="mt-2" style="font-size:0.85rem"></div>
                  </div>
                  <div class="modal-footer" style="justify-content:space-between">
                    <button type="button" class="btn btn-danger btn-sm"
                            onclick="tbr_view.excluir()"
                            style="font-size:0.85rem">
                        Excluir da TBR
                    </button>
                    <div style="display:flex;gap:8px">
                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary btn-sm"
                                onclick="tbr_view.salvarEdicao()"
                                style="font-size:0.85rem">
                            Salvar
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    _carregarMeses: async function () {
        const sel = document.getElementById('tbrMesFiltro');
        if (!sel) return;

        try {
            const resp = await fetch('/php/api/base/main/tbr/listar_tbr.php?acao=meses');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                sel.innerHTML = '<option value="">Nenhum mês cadastrado</option>';
                return;
            }

            sel.innerHTML = '<option value="">— Selecione um mês —</option>';
            json.data.forEach(function (r) {
                const opt = document.createElement('option');
                opt.value       = r.mes_referencia;
                opt.textContent = r.mes_referencia;
                sel.appendChild(opt);
            });

            // Seleciona o primeiro mês automaticamente
            if (json.data.length > 0) {
                sel.value = json.data[0].mes_referencia;
                await this.carregarTBR(json.data[0].mes_referencia);
            }
        } catch (e) {
            console.error('Erro ao carregar meses TBR:', e);
        }
    },

    carregarTBR: async function (mes) {
        this._mesAtual = mes;
        const box = document.getElementById('tbrTabela');
        if (!box) return;

        if (!mes) {
            box.innerHTML = '<p class="text-muted small">Selecione um mês para ver a TBR.</p>';
            return;
        }

        box.innerHTML = '<p class="text-muted small">Carregando...</p>';

        try {
            const resp = await fetch('/php/api/base/main/tbr/listar_tbr.php?acao=tbr&mes=' + encodeURIComponent(mes));
            const json = await resp.json();

            if (!json.status) {
                box.innerHTML = `<div class="alert alert-warning">${json.error || 'Erro ao carregar.'}</div>`;
                return;
            }

            this._dados = json.data || [];
            this._renderTabela();
        } catch (e) {
            console.error('Erro ao carregar TBR:', e);
            box.innerHTML = '<div class="alert alert-danger">Erro ao carregar TBR.</div>';
        }
    },

    _renderTabela: function () {
        const box = document.getElementById('tbrTabela');
        const dados = this._dados;

        if (!dados || dados.length === 0) {
            box.innerHTML = '<p class="text-muted small">Nenhum livro na TBR para este mês.</p>';
            return;
        }

        const thSt  = 'padding:6px 8px;text-align:left;border-bottom:2px solid #dee2e6;font-size:0.8rem;background:#f8f9fa;position:sticky;top:0;z-index:1;white-space:nowrap';
        const tdSt  = 'padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:0.8rem;vertical-align:middle';
        const tdCtr = 'padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:0.8rem;text-align:center;white-space:nowrap;vertical-align:middle';

        const corPrevisao = function (prev) {
            switch (prev) {
                case 'Começo do mês':    return '#28a745';
                case 'Depois do dia 10': return '#17a2b8';
                case 'Antes do dia 20':  return '#fd7e14';
                case 'Final do mês':     return '#6c757d';
                default:                 return '#333';
            }
        };

        const corStatus = function (status) {
            if (!status) return '#aaa';
            if (status === 'Lido')       return '#28a745';
            if (status === 'Lendo')      return '#fd7e14';
            if (status === 'Abandonado') return '#dc3545';
            return '#6c757d';
        };

        let html = `
            <div style="margin-bottom:6px;font-size:0.82rem;color:#666">
                ${dados.length} livro(s) na TBR de ${this._mesAtual}
            </div>
            <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;table-layout:auto">
                <thead>
                    <tr>
                        <th style="${thSt}">Título</th>
                        <th style="${thSt}">Autor</th>
                        <th style="${thSt}">Sexo</th>
                        <th style="${thSt}">País</th>
                        <th style="${thSt}">Natureza</th>
                        <th style="${thSt}">Tema</th>
                        <th style="${thSt}">Tipo</th>
                        <th style="${thSt};width:55px">Págs.</th>
                        <th style="${thSt}">Origem</th>
                        <th style="${thSt}">Releitura</th>
                        <th style="${thSt}">Previsão</th>
                        <th style="${thSt}">Status</th>
                        <th style="${thSt};width:60px">Av.</th>
                        <th style="${thSt};width:65px"></th>
                    </tr>
                </thead>
                <tbody>
        `;

        dados.forEach(function (row, idx) {
            const cor = corPrevisao(row.previsao_leitura);
            const corSt = corStatus(row.status);

            html += `
                <tr onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                    <td style="${tdSt};font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.titulo || '').replace(/"/g, '&quot;')}">
                        ${row.titulo || '—'}
                    </td>
                    <td style="${tdSt};max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(row.autor || '').replace(/"/g, '&quot;')}">
                        ${row.autor || '—'}
                    </td>
                    <td style="${tdCtr}">${row.sexo_autor || '—'}</td>
                    <td style="${tdSt};white-space:nowrap">${row.pais || '—'}</td>
                    <td style="${tdSt};white-space:nowrap">${row.natureza || '—'}</td>
                    <td style="${tdSt};max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row.tema || '—'}</td>
                    <td style="${tdSt};white-space:nowrap">${row.tipo_edicao || '—'}</td>
                    <td style="${tdCtr}">${row.paginas || '—'}</td>
                    <td style="${tdSt};white-space:nowrap">${row.origem || '—'}</td>
                    <td style="${tdCtr}">${row.releitura || '—'}</td>
                    <td style="${tdCtr}">
                        <span style="color:${cor};font-weight:500;font-size:0.78rem">
                            ${row.previsao_leitura || '—'}
                        </span>
                    </td>
                    <td style="${tdCtr}">
                        ${row.status
                            ? '<span style="color:' + corSt + ';font-weight:500;font-size:0.78rem">' + row.status + '</span>'
                            : '<span style="color:#aaa;font-size:0.78rem">—</span>'}
                    </td>
                    <td style="${tdCtr}">${row.avaliacao != null ? row.avaliacao : '—'}</td>
                    <td style="${tdCtr}">
                        <button class="btn btn-sm btn-warning"
                                style="font-size:0.75rem;padding:2px 7px;color:#333"
                                onclick="tbr_view.abrirEdicao(${idx})">
                            ✏️
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        box.innerHTML = html;
    },

    abrirEdicao: function (idx) {
        const row = this._dados[idx];
        if (!row) return;

        this._editando = row;

        document.getElementById('tbrEditTitulo').textContent = row.titulo || '';
        document.getElementById('tbrEditPrevisao').value     = row.previsao_leitura || 'Começo do mês';
        document.getElementById('tbrEditMsg').textContent    = '';

        // Converte MM/YYYY para YYYY-MM para o input[type=month]
        const partes = (row.mes_referencia || '').split('/');
        if (partes.length === 2) {
            document.getElementById('tbrEditMes').value = partes[1] + '-' + partes[0];
        } else {
            document.getElementById('tbrEditMes').value = '';
        }

        $('#modalEditarTBR').modal('show');
    },

    salvarEdicao: async function () {
        const row = this._editando;
        if (!row) return;

        const mesInput = document.getElementById('tbrEditMes').value;
        if (!mesInput) {
            document.getElementById('tbrEditMsg').innerHTML =
                '<span style="color:#dc3545">Informe o mês de referência.</span>';
            return;
        }

        // Converte YYYY-MM → MM/YYYY
        const [ano, mes] = mesInput.split('-');
        const mesReferencia = mes + '/' + ano;

        const previsao = document.getElementById('tbrEditPrevisao').value;
        const msgEl    = document.getElementById('tbrEditMsg');

        msgEl.innerHTML = '<span style="color:#6c757d">Salvando...</span>';

        const form = new FormData();
        form.append('acao',             'update');
        form.append('id',               row.id);
        form.append('mes_referencia',   mesReferencia);
        form.append('previsao_leitura', previsao);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/TBR/update_tbr.php', {
                method: 'POST',
                body:   form,
            });
            const json = await resp.json();

            if (!json.status) {
                msgEl.innerHTML = '<span style="color:#dc3545">' + (json.error || 'Erro ao salvar.') + '</span>';
                return;
            }

            $('#modalEditarTBR').modal('hide');

            // Recarrega o mês atual ou o novo mês se mudou
            const mesFiltro = document.getElementById('tbrMesFiltro');
            if (mesFiltro && mesReferencia !== this._mesAtual) {
                // Adiciona nova opção se não existir e seleciona
                let existe = false;
                for (let i = 0; i < mesFiltro.options.length; i++) {
                    if (mesFiltro.options[i].value === mesReferencia) { existe = true; break; }
                }
                if (!existe) {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = mesReferencia;
                    mesFiltro.insertBefore(opt, mesFiltro.options[1]);
                }
                mesFiltro.value = this._mesAtual; // Mantém o mês atual exibido
            }

            await this.carregarTBR(this._mesAtual);

        } catch (e) {
            console.error('Erro ao salvar TBR:', e);
            msgEl.innerHTML = '<span style="color:#dc3545">Erro inesperado ao salvar.</span>';
        }
    },

    excluir: async function () {
        const row = this._editando;
        if (!row) return;

        if (!confirm('Remover "' + row.titulo + '" da TBR?')) return;

        const msgEl = document.getElementById('tbrEditMsg');
        msgEl.innerHTML = '<span style="color:#6c757d">Removendo...</span>';

        const form = new FormData();
        form.append('acao', 'delete');
        form.append('id',   row.id);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/TBR/update_tbr.php', {
                method: 'POST',
                body:   form,
            });
            const json = await resp.json();

            if (!json.status) {
                msgEl.innerHTML = '<span style="color:#dc3545">' + (json.error || 'Erro ao remover.') + '</span>';
                return;
            }

            $('#modalEditarTBR').modal('hide');
            await this.carregarTBR(this._mesAtual);

        } catch (e) {
            console.error('Erro ao excluir TBR:', e);
            msgEl.innerHTML = '<span style="color:#dc3545">Erro inesperado ao remover.</span>';
        }
    },

};

window.tbr_view = tbr_view;
