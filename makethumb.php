<?php
$path = '/var/www/thjmedia/jones/photos/thumbs';

if (count($argv) == 2) {
    $list = $argv[1];
} else {
	die("No file specified");
}

if (is_file($list)) {

    $images = file($list, FILE_IGNORE_NEW_LINES);

    foreach ($images as $img) {

        echo $img."...";

        if (!is_file($path.$img)) {

            echo "Generating...";

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

        	//save image
        	if (!is_dir(dirname($path.$img)))
        		mkdir(dirname($path.$img), 0777, true);
        	imagejpeg($thumb, $path.$img);

        	//free memory
        	imagedestroy($thumb);
        }

        echo "Done!\n";
    }
}

?>
