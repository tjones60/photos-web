<?php
//get the path to the image from get
if (isset($_GET['img'])) {
    $img = $_GET['img'];
} else {
    die('no image specified');
}

//load image
$ext = strtolower(pathinfo($img, PATHINFO_EXTENSION));
if ($ext == 'jpg') {
    $source_image = imagecreatefromjpeg($img);
    header('Content-Type: image/jpeg');
} elseif ($ext == 'png') {
    $source_image = imagecreatefrompng($img);
    header('Content-Type: image/png');
} else {
    die("Unsupported file type");
}
//rotate image based on exif data
$source_image = imagerotate($source_image, array_values([0, 0, 0, 180, 0, 0, -90, 0, 90])[@exif_read_data($img)['Orientation'] ?: 0], 0);

//display image
header('Content-Disposition: filename='.basename($img));
imagejpeg($source_image);

//free memory
imagedestroy($source_image);
?>
