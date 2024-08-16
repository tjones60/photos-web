<?php

if (isset($_GET['file'])) {
    $file = $_GET['file'];
} elseif (isset($_POST['file'])) {
    $file = $_POST['file'];
} else {
    die('No File Specified!');
}

if (is_file($file)) {
    echo file_get_contents($file);
} elseif (is_dir($file)) {

    $files = glob($file.'/*');
    $i = 0;
    $c = count($files);
    echo "{\n";
    foreach ($files as $f) {
        echo "\t\"".basename($f)."\": ";
        if ($i == $c - 1) {
            echo file_get_contents($f)."\n";
        } else {
            echo file_get_contents($f).",\n";
        }
        $i++;
    }
    echo "}";

} else {
    die('File Not Found!');
}

?>
