#!/bin/bash
cd /srv/photos/Import
readarray -t data <<< "$(exiftool -S -s -q -f -filename -d "%Y-%m-%d" -DateTimeOriginal *)"
let size="${#data[@]}"
let count=($size)/2

I=0
while [ $I -lt $count ]; do

    let fileI=$I*2
    let dateI=$I*2+1
    file="${data[fileI]}"
    date="${data[dateI]}"

    if [ "$date" = "0000:00:00 00:00:00" ] || [ "$date" = "-" ]; then
        date="$(date +"%Y-%m-%d" -r "$file")"
    fi

    ymd="${date:0:10}"
    ym="${date:0:7}"
    y="${date:0:4}"
    path="/srv/photos/Library/$y/$ym/$ymd/"

    mkdir -p "$path"

    if [ -f "$path$file" ]; then
        if cmp -s "$file" "$path$file"; then
            echo "$file was skipped"
        else
            ext="${file##*.}"
            base="${file%.*}"
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
