<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h5>TESTE BIBLIOTECA</h5>

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
</html