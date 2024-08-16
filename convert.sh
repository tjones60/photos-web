#!/bin/bash

echo "Converting HEIC files to JPG"

for i in /srv/photos/Library/*/*/*/*.{HEIC,heic}; do
    if [ -f "${i%.*}.JPG" ] || [ -f "${i%.*}.jpg" ] || [ -f "${i%.*}.JPEG" ] || [ -f "${i%.*}.jpeg" ]; then
        # echo "$i already converted"
        true
    else
        echo "Converting $i to ${i%.*}.JPG"
        heif-convert "$i" "${i%.*}.JPG" > /dev/null
    fi
done

echo

echo "Converting MTS files to MP4"

for i in /srv/photos/Library/*/*/*/*.MTS; do
    if [ -f "${i%.*}.MP4" ] || [ -f "${i%.*}.mp4" ] || [ -f "${i%.*}.MOV" ] || [ -f "${i%.*}.mov" ]; then
        # echo "$i already converted"
        true
    else
        echo "Converting $i to ${i%.*}.MP4"
        ffmpeg -y -loglevel warning -hide_banner -i "$i" -c:v copy -c:a aac -strict experimental -b:a 256k "${i%.*}.MP4"
        exiftool -q -m -TagsFromFile $i "${i%.*}.MP4"
    fi
done

echo