<?php
//get the path to the image from get
if (isset($_GET['img'])) {
    $img = $_GET['img'];
} else {
    die('no image specified');
}

header('Content-Type: image/jpeg');

$thumbname = "thumbs".$img.".JPG";

//display cached thumb if it exists
if ( is_file($thumbname) ) {
    readfile($thumbname);
} else {
    readfile('missing.jpg');
}
?>
