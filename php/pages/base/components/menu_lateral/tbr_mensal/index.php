
<script src="/php/pages/base/components/menu_lateral/tbr_mensal/index.js"></script>

<!-- =============================================
     Modal: Cadastro de TBR Mensal
     Fluxo: Origem → Releitura → Busca → Livro → Previsão
     ============================================= -->
<div class="modal fade" id="modalTBRMensal" tabindex="-1" role="dialog"
     aria-labelledby="modalTBRMensalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalTBRMensalLabel">Cadastro de TBR Mensal</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Origem (Local de Leitura) -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Origem</legend>

          <div class="form-group mb-0">
            <label>Local de Leitura <span class="text-danger">*</span></label>
            <select id="tbr_local" class="form-control" onchange="tbr_mensal.onLocalChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Releitura (aparece após escolher origem) -->
        <fieldset id="tbr_secao_releitura" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Releitura?</legend>

          <div class="d-flex">
            <div class="form-check form-check-inline p-2">
              <input class="form-check-input" type="radio" name="tbr_releitura" id="tbr_rel_nao"
                     value="nao" checked onchange="tbr_mensal.onReleituraChange()">
              <label class="form-check-label" for="tbr_rel_nao">Não</label>
            </div>
            <div class="form-check form-check-inline p-2">
              <input class="form-check-input" type="radio" name="tbr_releitura" id="tbr_rel_sim"
                     value="sim" onchange="tbr_mensal.onReleituraChange()">
              <label class="form-check-label" for="tbr_rel_sim">Sim</label>
            </div>
          </div>
          <small class="text-muted mt-1 d-block">
            <span id="tbr_releitura_hint">
              Serão exibidos livros ainda não lidos.
            </span>
          </small>
        </fieldset>

        <!-- SEÇÃO 3: Busca do Livro (aparece após escolher releitura) -->
        <fieldset id="tbr_secao_busca" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <div id="tbr_busca_wrapper">
            <div class="input-group mb-2">
              <input type="text" id="tbr_busca_titulo" class="form-control"
                     placeholder="Digite parte do título..."
                     onkeyup="tbr_mensal.onBuscaKeyup(event)">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button"
                        onclick="tbr_mensal.buscarLivro()">Buscar</button>
              </div>
            </div>
            <div id="tbr_resultados"></div>
            <div id="tbr_nao_encontrado" class="d-none">
              <div class="alert alert-warning py-2 mb-0">Nenhum livro encontrado.</div>
            </div>
          </div>

          <!-- Livro selecionado -->
          <div id="tbr_livro_selecionado" class="d-none">
            <div class="row align-items-start">
              <div class="col-md-8">
                <label class="small text-muted">Título</label>
                <p id="tbr_titulo_display" class="mb-1 font-weight-bold"></p>
              </div>
              <div class="col-md-3">
                <label class="small text-muted">Autor</label>
                <p id="tbr_autor_display" class="mb-1"></p>
              </div>
              <div class="col-md-1 text-right">
                <button class="btn btn-sm btn-outline-secondary mt-3"
                        onclick="tbr_mensal.limparLivro()" title="Trocar livro">✕</button>
              </div>
            </div>

            <div class="row mt-1" style="font-size:0.88rem">
              <div class="col-md-2">
                <label class="small text-muted">Sexo Autor</label>
                <p id="tbr_sexo_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">País</label>
                <p id="tbr_pais_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Páginas</label>
                <p id="tbr_paginas_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Natureza</label>
                <p id="tbr_natureza_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Tema</label>
                <p id="tbr_tema_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Tipo Edição</label>
                <p id="tbr_tipo_edicao_display" class="mb-1"></p>
              </div>
            </div>

            <!-- Hidden fields com dados do livro -->
            <input type="hidden" id="tbr_livro_titulo">
            <input type="hidden" id="tbr_livro_autor">
            <input type="hidden" id="tbr_livro_sexo_autor">
            <input type="hidden" id="tbr_livro_pais">
            <input type="hidden" id="tbr_livro_natureza">
            <input type="hidden" id="tbr_livro_tema">
            <input type="hidden" id="tbr_livro_tipo_edicao">
            <input type="hidden" id="tbr_livro_paginas">
          </div>
        </fieldset>

        <!-- SEÇÃO 4: Dados da Previsão (aparece após selecionar livro) -->
        <fieldset id="tbr_secao_previsao" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Previsão de Leitura</legend>

          <div class="row">
            <div class="col-md-5 form-group">
              <label>Mês de Referência <span class="text-danger">*</span></label>
              <input type="month" id="tbr_mes_referencia" class="form-control" min="2020-01">
              <small class="text-muted">Mês/ano em que planeja ler o livro.</small>
            </div>
            <div class="col-md-7 form-group">
              <label>Quando no mês? <span class="text-danger">*</span></label>
              <select id="tbr_previsao_leitura" class="form-control">
                <option value="">Selecione...</option>
                <option value="Começo do mês">Começo do mês</option>
                <option value="Depois do dia 10">Depois do dia 10</option>
                <option value="Antes do dia 20">Antes do dia 20</option>
                <option value="Final do mês">Final do mês</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div id="tbr_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="tbr_mensal.salvar()">Salvar</button>
      </div>

    </div>
  </div>
</div>
