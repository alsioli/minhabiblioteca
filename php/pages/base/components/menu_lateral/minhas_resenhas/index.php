
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

        <!-- SEÇÃO 2: Lista de livros sem resenha (oculto até selecionar mês) -->
        <fieldset id="res_secao_livros" class="border rounded p-3 mb-3 d-none">
          <legend class="w-auto px-2" style="font-size:0.9rem;font-weight:bold;">Livros sem resenha</legend>

          <div id="res_lista_livros">
            <!-- Tabela gerada dinamicamente pelo JS -->
          </div>
        </fieldset>

        <div id="res_mensagem" class="mt-2"></div>

      </div><!-- /.modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Fechar</button>
      </div>

    </div>
  </div>
</div>
