<?php

$threads = 4;

class Photo {

    public $lsrc; //local file path
    public $rsrc; //remote URL, if available
    public $date; //date photo taken
    public $name; //filename

    function __construct($lsrc, $rsrc, $date, $name) {

        $this->lsrc = $lsrc;
        $this->rsrc = $rsrc;
        $this->date = $date;
        $this->name = $name;
    }

    function __toString() {

        return "\t\t\"lsrc\":\"".str_replace('"','\"',$this->lsrc)."\",\n"
              ."\t\t\"rsrc\":\"".str_replace('"','\"',$this->rsrc)."\",\n"
              ."\t\t\"date\":\"".str_replace('"','\"',$this->date)."\",\n"
              ."\t\t\"name\":\"".str_replace('"','\"',$this->name)."\"\n";
    }
}


function sortPhotosByDate($a, $b) {
    return strcmp($a->date, $b->date);
}


function makeThumb($img) {

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
	$path = '/var/www/thjmedia/jones/photos/thumbs';
	if (!is_dir(dirname($path.$img)))
		mkdir(dirname($path.$img), 0777, true);
	imagejpeg($thumb, $path.$img);

	//free memory
	imagedestroy($thumb);
}


if (count($argv) == 3) {

    $dir = $argv[1];
    $file = $argv[2];

    echo "Getting exif data...";
    exec('exiftool -S -s -q -f -directory -filename -d "%Y-%m-%d %H:%M:%S" -DateTimeOriginal -fast2 -ext JPG -r '.$dir, $photos);
    echo "Done! (".(count($photos)/3)." images)\n";

    echo "Building array...";
    $lib = array();
    for ($i = 0; $i < count($photos); $i += 3) {

        $lsrc = $photos[$i].'/'.$photos[$i+1];
        $rsrc = '';
        $date = $photos[$i+2];
        $name = $photos[$i+1];

        if ( $date == "0000:00:00 00:00:00" || $date == "-" )
            $date = date("Y-m-d H:i:s", filemtime($lsrc));

        $ymd = substr($date, 0, 10);
        $ym  = substr($date, 0, 7);
        $y   = substr($date, 0, 4);

        $obj = new Photo($lsrc, $rsrc, $date, $name);

        array_push($lib, $obj);
    }
    echo "Done!\n";

    echo "Sorting array...";
    usort($lib, 'sortPhotosByDate');
    echo "Done!\n";

    echo "Writing library file...";
    $output = fopen($file, 'w');
    fwrite($output, "{\n");

    $id = 0;
    $count = count($lib);
    foreach ($lib as $photo) {

        fwrite($output, "\t\"".$id."\": {\n");
        fwrite($output, (string) $photo);
        fwrite($output, "\t}".($id == $count - 1 ? '' : ',')."\n");

        $id++;
    }

    fwrite($output, "}\n");
    fclose($output);
    echo "Done!\n";

    echo "Generating thumbnails...";
    $lists = array();
    for ($i = 0; $i < $threads; $i++)
        $lists[$i] = "";
    foreach ($lib as $i => $photo) {
        $fnum = intval($threads * $i / $count);
        $lists[$fnum] .= $photo->lsrc."\n";
        //exec("php makethumb.php \"".$photo->lsrc."\" > /dev/null &");
    }
    foreach ($lists as $i => $data){
        file_put_contents("thread_".$i.".dat", $data);
        exec("php /var/www/thjmedia/jones/photos/makethumb.php \"thread_".$i.".dat\" > /dev/null &");
    }
    echo "Done!\n";

} else {
    echo "Invalid arguments. Use \"<dir>\" \"<file>\".\n";
}

?>
