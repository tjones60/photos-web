<?php

class Photo {

    private $lsrc;
    private $rsrc;
    private $date;
    private $name;

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

    public function getDate() {

        return (string) $this->date;
    }
}


function sortPhotosByDate($a, $b) {
    return strcmp($a->getDate(), $b->getDate());
}

if (count($argv) == 3) {

    $dir = $argv[1];
    $file = $argv[2];

    echo "Getting exif data...";
    exec('exiftool -S -s -q -f -directory -filename -d "%Y-%m-%d %H:%M:%S" -DateTimeOriginal '.$dir, $photos);
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

} else {
    echo "Invalid arguments. Use \"<dir>\" \"<file>\".\n";
}

?>
