
<!-- Modal: Minhas Resenhas -->
<div class="modal fade" id="modalMinhasResenhas" tabindex="-1" role="dialog" aria-labelledby="modalMinhasResenhasLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalMinhasResenhasLabel">Minhas Resenhas</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <!-- SEÇÃO 1: Mês / Leitura -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Mês / Leitura</legend>

          <div class="form-group mb-0">
            <label>Mês em que leu <span class="text-danger">*</span></label>
            <select id="res_mes" class="form-control" onchange="minhas_resenhas.onMesChange()">
              <option value="">Carregando...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 2: Livro (oculto até selecionar mês) -->
        <fieldset id="res_secao_livro" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livro</legend>

          <div class="form-group mb-0">
            <label>Livro lido neste mês <span class="text-danger">*</span></label>
            <select id="res_livro" class="form-control" onchange="minhas_resenhas.onLivroChange()">
              <option value="">Selecione o livro...</option>
            </select>
          </div>
        </fieldset>

        <!-- SEÇÃO 3: Resenha (oculto até selecionar livro) -->
        <fieldset id="res_secao_resenha" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Resenha</legend>

          <div class="row mb-3">
            <div class="col-md-8">
              <label class="small text-muted">Título</label>
              <p id="res_titulo_display" class="mb-0 font-weight-bold"></p>
            </div>
            <div class="col-md-4">
              <label class="small text-muted">Autor</label>
              <p id="res_autor_display" class="mb-0"></p>
            </div>
          </div>

          <div class="form-group mb-0">
            <label>Escreva sua resenha <span class="text-danger">*</span></label>
            <textarea id="res_resenha" class="form-control" rows="6"
                      placeholder="Compartilhe o que achou do livro..."></textarea>
          </div>
        </fieldset>

        <input type="hidden" id="res_id_leitura">
        <input type="hidden" id="res_avaliacao">
        <div id="res_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="minhas_resenhas.salvar()">Salvar Resenha</button>
      </div>

    </div>
  </div>
</div>
