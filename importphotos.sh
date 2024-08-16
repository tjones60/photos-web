#!/bin/bash
importdir="/srv/photos/Import/"
cd $importdir
exifcmd="exiftool -S -s -q -f -filename -d "%Y-%m-%d" -DateTimeOriginal -CreateDate -FileModifyDate -fast2 -ext JPG -ext PNG -ext MP4 -ext MOV -ext HEIC -ext MTS -r $importdir"
readarray -t data <<< "$($exifcmd)"
let size="${#data[@]}"
let count=($size)/4
date=$(date '+%Y%m%d%H%M%S')
dups="/srv/photos/Temp/duplicates/$date/"
unsups="/srv/photos/Temp/unsupported/$date/"

if [ "$count" -eq "0" ]; then
    echo "Nothing to import"
else
    echo "Importing $count photos"
    echo

    mkdir -p "$dups"

    I=0
    while [ $I -lt $count ]; do

        let fileI=$I*4
        let dateI=$I*4+1
        file="${data[fileI]}"
        date="${data[dateI]}"

        if [ "$date" = "0000:00:00 00:00:00" ] || [ "$date" = "-" ]; then
            let dateI=$I*4+2
            date="${data[dateI]}"
        fi
        if [ "$date" = "0000:00:00 00:00:00" ] || [ "$date" = "-" ]; then
            let dateI=$I*4+3
            date="${data[dateI]}"
        fi

        ymd="${date:0:10}"
        ym="${date:0:7}"
        y="${date:0:4}"
        path="/srv/photos/Library/$y/$ym/$ymd/"

        mkdir -p "$path"

        ext="${file##*.}"
        base="${file%.*}"

        if [ -f "$path$file" ] || [ -f "$path$base.${ext^^}" ] || [ -f "$path$base.${ext,,}" ]; then
            if cmp -s "$file" "$path$file"; then
                if mv "$file" "$dups"; then
                    echo "$file has already been imported, moved to $dups"
                else
                    echo "failed to move duplicate $file"
                fi
            else
                N=0
                while [ -e "$path$base-$N.$ext" ]; do
                    let N=N+1
                done
                if mv "$file" "$path$base-$N.$ext"; then
                    echo "$file was renamed $base-$N.$ext and imported to $path"
                else
                    echo "failed to import $file"
                fi
            fi
        else
            if mv "$file" "$path"; then
                echo "$file was imported to $path"
            else
                echo "failed to import $file"
            fi
        fi

        let I=I+1
    done

    if [ "$(ls -A $dups)" ]; then
        true
    else 
        rmdir "$dups"
    fi

    echo

    bash /var/www/thjmedia/jones/photos/convert.sh

    echo

    php /var/www/thjmedia/jones/photos/photolibrary.php "/srv/photos/Library/" "/var/www/thjmedia/jones/photos/library.json"

fi

if [ "$(ls -A $importdir)" ]; then
    echo "Moving unsupported files to $unsups"
    mkdir -p "$unsups"
    mv "$importdir"* "$unsups"
    find "$unsups" -type f 
fi