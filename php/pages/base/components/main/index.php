
<div class="layout">

    <main id="mainConteudo" class="conteudo">
        <div class="container-fluid pt-3 pb-4">

            <!-- Linha 1: Leituras em Andamento | Livros Não Lidos Antigos -->
            <div class="row align-items-stretch">

                <div class="col-12 col-md-7 mb-3 d-flex flex-column">
                    <div style="border:1px solid #e8e0f5;border-left:4px solid #6a2bbf;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(106,43,191,0.07);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#6a2bbf">Leituras em Andamento</h5>
                        </div>
                        <div id="bloco-andamento" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

                <div class="col-12 col-md-5 mb-3 d-flex flex-column">
                    <div style="border:1px solid #dce8f5;border-left:4px solid #4a76a8;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(74,118,168,0.07);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#4a76a8">Livros Não Lidos Mais Antigos</h5>
                        </div>
                        <div id="bloco-nao-lidos" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

            </div>

            <!-- Linha 2: Favoritos 2025 | MINHA TBR -->
            <div class="row align-items-stretch">

                <div class="col-12 col-md-5 mb-3 d-flex flex-column">
                    <div style="border:1px solid #fdecc8;border-left:4px solid #d97706;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(217,119,6,0.07);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#d97706">Livros Favoritos em 2026</h5>
                        </div>
                        <div id="bloco-favoritos" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

                <div class="col-12 col-md-7 mb-3 d-flex flex-column">
                    <div style="border:1px solid #cdf0f8;border-left:4px solid #0891b2;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(8,145,178,0.07);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#0891b2">MINHA TBR de <span id="mes-tbr-atual"></span></h5>
                        </div>
                        <div id="bloco-tbr-breve" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

            </div>

            <!-- Linha 3: LCs Vencendo | Quero Ler Logo -->
            <div class="row align-items-stretch">

                <div class="col-12 col-md-5 mb-3 d-flex flex-column">
                    <div style="border:1px solid #fce0e0;border-left:4px solid #dc2626;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(220,38,38,0.06);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#dc2626">LCs Vencendo em 5 Dias</h5>
                        </div>
                        <div id="bloco-lc" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

                <div class="col-12 col-md-7 mb-3 d-flex flex-column">
                    <div style="border:1px solid #ccf0e3;border-left:4px solid #059669;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(5,150,105,0.07);padding:8px 12px 7px;display:flex;justify-content:space-between;align-items:center">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#059669">Quero Ler Logo</h5>
                            <button class="btn btn-sm"
                                    style="padding:1px 10px;font-size:0.82rem;line-height:1.5;background:#059669;color:#fff;border:none;border-radius:4px"
                                    onclick="menuLateral.abrirModalQueroLerLogo()"
                                    title="Adicionar livro">+</button>
                        </div>
                        <div id="bloco-quero-ler" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

            </div>

            <!-- Linha 4: Adquiridos Recentemente | Gráfico Livros TAG -->
            <div class="row align-items-stretch">

                <div class="col-12 col-md-7 mb-3 d-flex flex-column">
                    <div style="border:1px solid #e5d8f8;border-left:4px solid #7c3aed;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(124,58,237,0.07);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#7c3aed">Adquiridos Recentemente</h5>
                        </div>
                        <div id="bloco-adquiridos" style="padding:10px 12px 12px"></div>
                    </div>
                </div>

                <div class="col-12 col-md-5 mb-3 d-flex flex-column">
                    <div style="border:1px solid #ffe8cc;border-left:4px solid #ff9d4d;border-radius:6px;padding:0;background:#fff;overflow:hidden;flex:1">
                        <div style="background:rgba(255,157,77,0.08);padding:8px 12px 7px">
                            <h5 class="mb-0" style="font-size:0.95rem;font-weight:700;color:#c2690a">Gráfico Livros TAG</h5>
                        </div>
                        <div id="bloco-tag-chart" style="padding:6px 12px 12px"></div>
                    </div>
                </div>

            </div>

        </div><!-- /.container-fluid -->
    </main>

</div>

<!-- Modal: Atualizar Leitura em Andamento -->
<div class="modal fade" id="modalAtualizarLeitura" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title">Atualizar Leitura</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <p id="atualizar_titulo_display" class="font-weight-bold mb-3" style="font-size:0.95rem"></p>

        <!-- Tipo de input -->
        <div class="form-group mb-3">
          <label style="font-size:0.88rem">Como quer registrar?</label>
          <div class="d-flex" style="gap:24px">
            <div class="form-check form-check-inline p-2">
              <input class="form-check-input" type="radio" name="atualizar_tipo" id="atualizar_tipo_percentual"
                     value="percentual" checked onchange="dashboard.onTipoInputChange()">
              <label class="form-check-label" for="atualizar_tipo_percentual">Percentual (%)</label>
            </div>
            <div class="form-check form-check-inline p-2">
              <input class="form-check-input" type="radio" name="atualizar_tipo" id="atualizar_tipo_pagina"
                     value="pagina" onchange="dashboard.onTipoInputChange()">
              <label class="form-check-label" for="atualizar_tipo_pagina">Página atual</label>
            </div>
          </div>
        </div>

        <!-- Campo percentual -->
        <div id="atualizar_campo_percentual" class="form-group">
          <label>Percentual lido (%) <span class="text-danger">*</span></label>
          <input type="number" id="atualizar_percentual" class="form-control" min="0" max="100" step="1" placeholder="Ex: 45">
        </div>

        <!-- Campo página -->
        <div id="atualizar_campo_pagina" class="form-group d-none">
          <label>Página atual <span class="text-danger">*</span></label>
          <input type="number" id="atualizar_pagina_atual" class="form-control" min="0" placeholder="Ex: 120">
          <small class="text-muted" id="atualizar_total_paginas"></small>
        </div>

        <!-- Impressões -->
        <div class="form-group">
          <label>Impressões <small class="text-muted">(opcional)</small></label>
          <textarea id="atualizar_impressoes" class="form-control" rows="2"
                    placeholder="Anotações sobre a leitura..."></textarea>
        </div>

        <!-- Avaliação -->
        <div class="form-group">
          <label>Avaliação <small class="text-muted">(opcional, 0–5)</small></label>
          <input type="number" id="atualizar_avaliacao" class="form-control" min="0" max="5" step="0.5" placeholder="Ex: 4.5">
        </div>

        <!-- Hidden fields -->
        <input type="hidden" id="atualizar_id_leitura">
        <input type="hidden" id="atualizar_id_livros">
        <input type="hidden" id="atualizar_titulo">
        <input type="hidden" id="atualizar_autor">
        <input type="hidden" id="atualizar_paginas">
        <input type="hidden" id="atualizar_tipo_midia">
        <input type="hidden" id="atualizar_data_inicio">
        <input type="hidden" id="atualizar_local_leitura">

        <div id="atualizar_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="dashboard.salvarAtualizacaoLeitura()">Salvar</button>
      </div>

    </div>
  </div>
</div>

<script>
    $.getScript('/php/pages/base/components/main/dashboard.js')
        .done(function () {
            if (window.dashboard) dashboard.init();
        })
        .fail(function () {
            console.error('Erro ao carregar dashboard.js');
        });

    // Registra abrirModalQueroLerLogo no menuLateral caso ainda não exista
    if (window.menuLateral && typeof menuLateral.abrirModalQueroLerLogo !== 'function') {
        menuLateral.abrirModalQueroLerLogo = function () {
            $('#modalQueroLerLogo').remove();
            $.ajax({
                url: '/php/pages/base/components/menu_lateral/quero_ler/index.php',
                method: 'GET',
                success: function (html) {
                    $('body').append(html);
                    $('#modalQueroLerLogo').modal('show');
                    $.getScript('/php/pages/base/components/menu_lateral/quero_ler/index.js')
                        .done(function () {
                            if (window.quero_ler) quero_ler.iniciar();
                        });
                }
            });
        };
    }
</script>
