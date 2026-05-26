let menuLateral = {

    init: function () {
    },  

    abrirModalNovoLivro: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html); // injeta o modal no DOM
                $('#modalNovoLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal Biblioteca - Novo.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal.');
            }
        });
    
    },

       abrirModalAtualizarLivro: async function () {
        $.ajax({
            url: '/php/pages/base/components/menu_lateral/biblioteca/index.php',
            method: 'GET',
            success: function (html) {
                $('body').append(html); // injeta o modal no DOM
                $('#modalAtualizarLivro').modal('show');

                $.getScript('/php/pages/base/components/menu_lateral/biblioteca/index.js')
                    .done(function () {
                        if (window.biblioteca && typeof biblioteca.carregarSelects === 'function') {
                            biblioteca.carregarSelects();
                        }
                    })
                    .fail(function () {
                        console.error('Erro ao carregar o script do modal Biblioteca - Alterar.');
                    });
            },
            error: function () {
                console.error('Erro ao carregar o modal.');
            }
        });
    },
}
 
// $(document).ready(function () {
//     menuLateral.abrirModalNovoLivro();
// });