

<script src="/php/pages/base/components/menu_lateral/leituras_coletivas/index.js"></script>
<link rel="stylesheet" href="/public/assets/css/menu_lateral.css">
<link rel="stylesheet" href="/public/assets/css/cronograma.css">
<link rel="stylesheet" href="/public/assets/css/header.css">




<div class="modal fade" id="modalNovaLC" tabindex="-1" role="dialog" aria-labelledby="modalNovaLCLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">

      <div class="cabecalho-biblioteca-modal modal-header">
        <h5 class="modal-title" id="modalNovaLCLabel">Cadastro de Leitura Coletiva</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">

        <form method="POST" id="formLeituraColetiva">

          <div class="grupo">
            <label>Nome da Leitura Coletiva</label>
            <input type="text" name="nome_lc" required>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Participando?</label>
              <select name="participando" required>
                <option value="">Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div class="grupo">
              <label>Natureza</label>
              <input type="text" name="natureza">
            </div>
          </div>

          <div class="linha">
            <div class="grupo">
              <label>Gênero</label>
              <input type="text" name="genero">
            </div>

            <div class="grupo">
              <label>Grupo</label>
              <input type="text" name="grupo">
            </div>
          </div>

        </form>

        <div id="mensagemLC" class="mt-3"></div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="leitura_coletiva.cadastrarLC()">Salvar</button>
      </div>

    </div>
  </div>
</div>
