<?php
//get the path to the image from get
if (isset($_GET['img'])) {
    $img = $_GET['img'];
} else {
    die('no image specified');
}

header('Content-Type: image/jpeg');

if ( is_file('thumbs'.$img) ) {

    readfile('thumbs'.$img);

} else {

    //load image
    $source_image = imagecreatefromjpeg($img);

    //get the width and height of original image
    $width = imagesx($source_image);
    $height = imagesy($source_image);

    //calculate the width and height
    if ($width > $height) {
        $desired_width = 160;
        $desired_height = floor($height * ($desired_width / $width));
        $dst_x = 0;
        $dst_y = ($desired_width - $desired_height) / 2;
    } else {
        $desired_height = 160;
        $desired_width = floor($width * ($desired_height / $height));
        $dst_x = ($desired_height - $desired_width) / 2;
        $dst_y = 0;
    }

    //create the thumbnail image
    $thumb = imagecreatetruecolor(160, 160);
    $white  = imagecolorallocate($thumb,255,255,255);
    imagefilledrectangle($thumb, 0, 0, 159, 159, $white);
    //shrink the original to fit the thumbnail size
    imagecopyresampled($thumb, $source_image, $dst_x, $dst_y, 0, 0, $desired_width, $desired_height, $width, $height);
    //rotate image based on exif data
    $thumb = imagerotate($thumb, array_values([0, 0, 0, 180, 0, 0, -90, 0, 90])[@exif_read_data($img)['Orientation'] ?: 0], 0);
    //display image
    imagejpeg($thumb);
    //save image
    if (!is_dir(dirname('thumbs'.$img)))
        mkdir(dirname('thumbs'.$img), 0777, true);
    imagejpeg($thumb, 'thumbs'.$img);
    //free memory
    imagedestroy($thumb);
}
?>
