let minhas_resenhas = {

    _livros: [],
    _mes: '',

 iniciar: async function (mesFiltro) {
    $('#res_secao_livros').addClass('d-none');
    $('#res_lista_livros').empty();
    $('#res_mensagem').empty();

    const sel = $('#res_mes');
    sel.html('<option value="">Carregando...</option>');

    try {
        const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/listar_meses.php');
        const json = await resp.json();

        if (!json.status) {
            sel.html('<option value="">Erro ao carregar meses</option>');
            this._mostrarMensagem('danger', 'Erro API meses: ' + (json.error || 'desconhecido'));
            return;
        }
        if (!json.data || json.data.length === 0) {
            sel.html('<option value="">Nenhum mês com leituras sem resenha</option>');
            return;
        }

        sel.html('<option value="">Selecione o mês...</option>');

        json.data.forEach(function (mes) {
            sel.append($('<option>').val(mes).text(mes));
        });

        if (mesFiltro) {
            sel.val(mesFiltro);
            if (sel.val() === mesFiltro) {
                this.onMesChange();
            }
        }
    } catch (e) {
        console.error('Erro ao carregar meses:', e);
        sel.html('<option value="">Erro ao carregar meses</option>');
    }
},


    onMesChange: async function () {
    let mes = $('#res_mes').val(); // MM/yyyy — igual ao valor armazenado na tabela

    $('#res_secao_livros').addClass('d-none');
    $('#res_lista_livros').empty();
    $('#res_mensagem').empty();

    if (!mes) return;

    this._mes = mes;
    $('#res_lista_livros').html('<p class="text-muted mb-0">Carregando...</p>');
    $('#res_secao_livros').removeClass('d-none');

    try {
        const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/listar_livros_mes.php?mes=' + encodeURIComponent(mes));

        if (!resp.ok) {
            throw new Error("Erro HTTP: " + resp.status);
        }

        const json = await resp.json();

        if (!json.status) {
            $('#res_lista_livros').html('<p class="text-danger mb-0">Erro: ' + (json.error || 'falha ao carregar livros') + '</p>');
            return;
        }
        if (!json.data || json.data.length === 0) {
            $('#res_lista_livros').html('<p class="text-muted mb-0">Nenhum livro sem resenha neste mês.</p>');
            return;
        }

        this._livros = json.data;
        this._renderTabela(json.data);
    } catch (e) {
        console.error('Erro ao carregar livros:', e);
        $('#res_lista_livros').html('<p class="text-danger mb-0">Erro ao carregar livros.</p>');
    }
},


    _renderTabela: function (livros) {
        let html = '<table class="table table-sm table-bordered mb-0">';
        html += '<thead class="thead-light"><tr>'
              + '<th>Título</th>'
              + '<th>Autor</th>'
              + '<th class="text-center" style="width:90px;">Ação</th>'
              + '</tr></thead><tbody>';

        livros.forEach(function (l) {
            const id = l.id;
            const titulo = $('<span>').text(l.titulo || '').html();
            const autor  = $('<span>').text(l.autor  || '').html();

            html += `<tr id="res_row_${id}">
                <td>${titulo}</td>
                <td>${autor}</td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-xs py-0 px-2"
                            onclick="minhas_resenhas.abrirEditar(${id})">
                        Editar
                    </button>
                </td>
            </tr>
            <tr id="res_edit_${id}" class="d-none bg-light">
                <td colspan="3" class="p-2">
                    <textarea id="res_texto_${id}" class="form-control mb-2" rows="5"
                              placeholder="Escreva sua resenha..."></textarea>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-secondary btn-sm mr-2"
                                onclick="minhas_resenhas.fecharEditar(${id})">
                            Cancelar
                        </button>
                        <button class="btn btn-primary btn-sm"
                                onclick="minhas_resenhas.salvar(${id})">
                            Salvar
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        $('#res_lista_livros').html(html);
    },

    abrirEditar: function (id) {
        // Fecha qualquer outro editor aberto
        this._livros.forEach(function (l) {
            if (String(l.id) !== String(id)) {
                $('#res_edit_' + l.id).addClass('d-none');
            }
        });
        $('#res_edit_' + id).toggleClass('d-none');
        if (!$('#res_edit_' + id).hasClass('d-none')) {
            $('#res_texto_' + id).focus();
        }
    },

    fecharEditar: function (id) {
        $('#res_edit_' + id).addClass('d-none');
        $('#res_texto_' + id).val('');
    },

    salvar: async function (id) {
        const resenha = $('#res_texto_' + id).val().trim();

        if (!resenha) {
            this._mostrarMensagem('warning', 'A resenha não pode estar em branco.');
            return;
        }

        const livro = this._livros.find(function (l) { return String(l.id) === String(id); });
        if (!livro) return;

        const body = new FormData();
        body.append('id_leitura',  id);
        body.append('nome_livro',  livro.titulo  || '');
        body.append('autor',       livro.autor   || '');
        body.append('mes_leitura', this._mes);
        body.append('avaliacao',   livro.avaliacao ?? '');
        body.append('resenha',     resenha);

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/create_resenha.php', {
                method: 'POST',
                body
            });
            const json = await resp.json();

            if (!json.status) {
                this._mostrarMensagem('danger', json.error || 'Erro ao salvar resenha.');
                return;
            }

            // Remove as linhas do livro salvo da tabela
            $('#res_row_' + id).remove();
            $('#res_edit_' + id).remove();

            // Remove da lista interna
            this._livros = this._livros.filter(function (l) { return String(l.id) !== String(id); });

            // Se não restar livros, atualiza o select de meses e oculta a seção
            if (this._livros.length === 0) {
                $('#res_secao_livros').addClass('d-none');
                $('#res_lista_livros').empty();
                await this.iniciar();
            }

            this._mostrarMensagem('success', json.data.message || 'Resenha salva com sucesso.');

        } catch (e) {
            console.error('Erro ao salvar resenha:', e);
            this._mostrarMensagem('danger', 'Erro inesperado. Tente novamente.');
        }
    },

    _mostrarMensagem: function (tipo, texto) {
        $('#res_mensagem').html(`
            <div class="alert alert-${tipo} alert-dismissible fade show py-2" role="alert">
                ${texto}
                <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }

};

window.minhas_resenhas = minhas_resenhas;
