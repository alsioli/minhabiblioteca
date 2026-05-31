let minhas_resenhas = {

    _livros: [],

    iniciar: async function (mesFiltro) {
        $('#res_secao_livro').addClass('d-none');
        $('#res_secao_resenha').addClass('d-none');
        $('#res_mensagem').empty();
        $('#res_livro').html('<option value="">Selecione o livro...</option>');
        $('#res_id_leitura').val('');
        $('#res_resenha').val('');

        const sel = $('#res_mes');
        sel.html('<option value="">Carregando...</option>');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/listar_meses.php');
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                sel.html('<option value="">Nenhum mês com leituras encerradas</option>');
                return;
            }

            sel.html('<option value="">Selecione o mês...</option>');
            json.data.forEach(function (mes) {
                const opt = $('<option>').val(mes).text(mes);
                sel.append(opt);
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
        const mes = $('#res_mes').val();

        $('#res_secao_livro').addClass('d-none');
        $('#res_secao_resenha').addClass('d-none');
        $('#res_mensagem').empty();
        $('#res_id_leitura').val('');
        $('#res_resenha').val('');

        if (!mes) return;

        const sel = $('#res_livro');
        sel.html('<option value="">Carregando...</option>');
        $('#res_secao_livro').removeClass('d-none');

        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/listar_livros_mes.php?mes=' + encodeURIComponent(mes));
            const json = await resp.json();

            if (!json.status || !json.data || json.data.length === 0) {
                sel.html('<option value="">Nenhum livro encerrado neste mês</option>');
                return;
            }

            this._livros = json.data;
            sel.html('<option value="">Selecione o livro...</option>');
            json.data.forEach(function (l) {
                const opt = $('<option>').val(l.id).text(l.titulo + (l.autor ? ' — ' + l.autor : ''));
                sel.append(opt);
            });
        } catch (e) {
            console.error('Erro ao carregar livros:', e);
            sel.html('<option value="">Erro ao carregar livros</option>');
        }
    },

    onLivroChange: async function () {
        const id = $('#res_livro').val();

        $('#res_secao_resenha').addClass('d-none');
        $('#res_mensagem').empty();
        $('#res_resenha').val('');

        if (!id) return;

        const livro = this._livros.find(function (l) { return String(l.id) === String(id); });
        if (!livro) return;

        $('#res_id_leitura').val(livro.id);
        $('#res_avaliacao').val(livro.avaliacao ?? '');
        $('#res_titulo_display').text(livro.titulo || '');
        $('#res_autor_display').text(livro.autor || '');
        $('#res_secao_resenha').removeClass('d-none');

        // Carrega resenha existente, se houver
        try {
            const resp = await fetch('/php/api/base/menu_lateral/minhasLeituras/resenhas/listar_livros_mes.php?id_leitura=' + encodeURIComponent(id));
            // Reutilizamos o endpoint de livros só para buscar; a resenha vem do create_resenha via GET se implementado.
            // Por simplicidade, deixamos a textarea em branco para nova resenha.
        } catch (e) { /* silencioso */ }
    },

    salvar: async function () {
        const id_leitura  = $('#res_id_leitura').val();
        const mes_leitura = $('#res_mes').val();
        const resenha     = $('#res_resenha').val().trim();
        const titulo      = $('#res_titulo_display').text();
        const autor       = $('#res_autor_display').text();
        const avaliacao   = $('#res_avaliacao').val();

        if (!id_leitura) {
            this._mostrarMensagem('warning', 'Selecione um livro antes de salvar.');
            return;
        }
        if (!resenha) {
            this._mostrarMensagem('warning', 'A resenha não pode estar em branco.');
            return;
        }

        const body = new FormData();
        body.append('id_leitura',  id_leitura);
        body.append('nome_livro',  titulo);
        body.append('autor',       autor);
        body.append('mes_leitura', mes_leitura);
        body.append('avaliacao',   avaliacao);
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

            $('#modalMinhasResenhas').modal('hide');

            Swal.fire({
                title: 'Resenha salva!',
                text: json.data.message,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6a2bbf'
            });

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
