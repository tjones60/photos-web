<?php
//get the path to the image from get
$img = $_GET['img'];
//load image
$source_image = imagecreatefromjpeg($img);
//rotate image based on exif data
$source_image = imagerotate($source_image, array_values([0, 0, 0, 180, 0, 0, -90, 0, 90])[@exif_read_data($img)['Orientation'] ?: 0], 0);
//display image
header('Content-Type: image/jpeg');
header('Content-Disposition: filename='.basename($img));
imagejpeg($source_image);
//free memory
imagedestroy($source_image);
?>
