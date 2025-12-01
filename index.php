<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    
    <!-- Bootstrap 4 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">

<!-- Bootstrap 5 -->
<link rel="stylesheet" href="public/assets/libs/bootstrap5.js">

<!-- Datepicker -->
<script src="public/assets/libs/bootstrap-datepicker.js"></script>

  <link rel="stylesheet" href="public/assets/css/blocks.css">
  <link rel="stylesheet" href="public/assets/css/colors.css">
  <link rel="stylesheet" href="public/assets/css/fonts.css">
  <link rel="stylesheet" href="public/assets/css/global.css">
  <link rel="stylesheet" href="public/assets/css/modifiers.css">
</head>
<body>
    <h5>TESTE BIBLIOTECA</h5>


<div class="d-flex flex-row card-custom align-items-start">

        <h4 class="ml-2 mr-4">Painel de Vistorias</h4>
   
        <textarea class="textarea" rows="6">
        Atenção - Alterações referentes aos prazos das vistorias conforme CE GERLO 0143/2025

        - Extensão do prazo de adequação: 90 para 180 dias até 28/02/2026.
        - Suspensão de notificações e PDQs até 28/02/2026.
        - Vistorias por alteração contratual e reguladores continuam normalmente.
        </textarea>
    </div>
    <h5>#INTERNO.CONFIDENCIAL</h5>
  </div>
</div>

    
<?php
$texto = "5";
echo str_pad($texto, 3, "0", STR_PAD_RIGHT);
?>
<br>
<?php

$texto = "5";
echo str_pad($texto, 3, "0", STR_PAD_LEFT);

?>

</body>
</html>


<style>
    .card-custom {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .linha-decorativa {
      height: 3px;
      width: 14rem;
      background-color: #bbb;
      margin-left: 1rem;
    }
    textarea {
      width: 400px;
      white-space: pre-wrap;
    }
  </style>
