<html lang="en">
<head>
    <title>Save</title>
</head>

<body>

    <?php

    echo '<p>Saving...</p>';

    if (isset($_GET['name'])) {
        $name = $_GET['name'];
    } elseif (isset($_POST['name'])) {
        $name = $_POST['name'];
    } else {
        die('No Name Specified!');
    }

    if (isset($_GET['str'])) {
        $str = $_GET['str'];
    } elseif (isset($_POST['str'])) {
        $str = $_POST['str'];
    } else {
        die('No Contents Given!');
    }

    $contents = json_decode($str);

    /*
    $new_contents = json_decode($str);

    $contents = array();
    if (is_file($name)) {
        $old_contents = json_decode(file_get_contents($name));
        foreach ($old_contents as $item)
            array_push($contents, $item);
    }

    foreach ($new_contents as $item)
        array_push($contents, $item);
    */

    echo '<p>File: '.$name.' Contents: </p>';
    print_r($contents);

    $output = fopen($name, 'w');
    fwrite($output, "[\n");
    $count = count($contents);
    foreach ($contents as $i => $item) {
        //fwrite($output, "\t\"".$i."\": {\n");
        fwrite($output, "\t{\n");
        fwrite($output, "\t\t\"lsrc\":\"".str_replace('"','\"',$item->lsrc)."\",\n"
                       ."\t\t\"rsrc\":\"".str_replace('"','\"',$item->rsrc)."\",\n"
                       ."\t\t\"date\":\"".str_replace('"','\"',$item->date)."\",\n"
                       ."\t\t\"name\":\"".str_replace('"','\"',$item->name)."\"\n");
        fwrite($output, "\t}".($i == $count - 1 ? '' : ',')."\n");
    }
    fwrite($output, "]");
    fclose($output);

    echo '<p>Saved!</p>';

    ?>

</body>

</html>
