
<!-- =============================================
     Modal: Quero Ler Logo
     Fluxo: Origem → Busca por Título → Seleciona Livro → Prioridade
     ============================================= -->
<div class="modal fade" id="modalQueroLerLogo" tabindex="-1" role="dialog"
     aria-labelledby="modalQueroLerLogoLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalQueroLerLogoLabel">Quero Ler Logo</h5>
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
            <select id="ql_local" class="form-control" onchange="quero_ler.onLocalChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Busca do Livro (aparece após escolher origem) -->
        <fieldset id="ql_secao_busca" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <div id="ql_busca_wrapper">
            <div class="input-group mb-2">
              <input type="text" id="ql_busca_titulo" class="form-control"
                     placeholder="Digite parte do título..."
                     onkeyup="quero_ler.onBuscaKeyup(event)">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button"
                        onclick="quero_ler.buscarLivro()">Buscar</button>
              </div>
            </div>
            <div id="ql_resultados"></div>
            <div id="ql_nao_encontrado" class="d-none">
              <div class="alert alert-warning py-2 mb-0">Nenhum livro encontrado.</div>
            </div>
          </div>

          <!-- Livro selecionado -->
          <div id="ql_livro_selecionado" class="d-none">
            <div class="row align-items-start">
              <div class="col-md-9">
                <label class="small text-muted">Título</label>
                <p id="ql_titulo_display" class="mb-1 font-weight-bold"></p>
              </div>
              <div class="col-md-3 text-right">
                <button class="btn btn-sm btn-outline-secondary mt-3"
                        onclick="quero_ler.limparLivro()" title="Trocar livro">Trocar</button>
              </div>
            </div>

            <div class="row mt-1" style="font-size:0.88rem">
              <div class="col-md-4">
                <label class="small text-muted">Autor</label>
                <p id="ql_autor_display" class="mb-1"></p>
              </div>
              <div class="col-md-2">
                <label class="small text-muted">Páginas</label>
                <p id="ql_paginas_display" class="mb-1"></p>
              </div>
              <div class="col-md-3">
                <label class="small text-muted">Tema</label>
                <p id="ql_tema_display" class="mb-1"></p>
              </div>
              <div class="col-md-3">
                <label class="small text-muted">Natureza</label>
                <p id="ql_natureza_display" class="mb-1"></p>
              </div>
            </div>

            <!-- Hidden fields com dados do livro -->
            <input type="hidden" id="ql_livro_titulo">
            <input type="hidden" id="ql_livro_autor">
            <input type="hidden" id="ql_livro_paginas">
            <input type="hidden" id="ql_livro_tema">
            <input type="hidden" id="ql_livro_natureza">
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Prioridade (aparece após selecionar livro) -->
        <fieldset id="ql_secao_prioridade" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Prioridade</legend>

          <div class="form-group mb-0">
            <label>Prioridade de Leitura <span class="text-danger">*</span></label>
            <select id="ql_prioridade" class="form-control">
              <option value="">Selecione...</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </fieldset>

        <div id="ql_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="quero_ler.salvar()">Salvar</button>
      </div>

    </div>
  </div>
</div>
