<?php

function zipFolder($list) {
    $zip = new ZipArchive();
    $ret = $zip->open('tmp/pictures.zip', ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE);
    if (is_resource($ret)) {
        printf('Failed with code %d', $ret);
    } else {
        foreach ($list as $f)
            $zip->addFile($f,basename($f));
        $zip->close();
        return 'tmp/pictures.zip';
    }
}

if (isset($_GET['str'])) {
    $str = $_GET['str'];
} elseif (isset($_POST['str'])) {
    $str = $_POST['str'];
} else {
    die('No Contents Given!');
}

$contents = json_decode($str);
$count = count(get_object_vars($contents));

if ($count > 1) {
    $list = array();
    foreach ($contents as $pic)
        array_push($list, $pic->lsrc);
    $file = zipFolder($list);
} elseif ($count == 1) {
    $list = array();
    foreach ($contents as $pic)
        $file = $pic->lsrc;
} else {
    die('No files in contents');
}

if (file_exists($file)) {
    header('Content-Description: Picture Download');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: '.filesize($file));
    readfile($file);
} else {
    die('File not found');
}

?>
