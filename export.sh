#!/bin/bash
root="/var/www/thjmedia"
private="jones/photos"
share="share"
cd $root
echo "Exporting $1"
if [ -f "$root/$private/albums/$1" ]; then
    dest="${1// /_}"
    if [ -d $root/$share/$dest ]; then
        echo "Destination already exists"
    else
        mkdir $root/$share/$dest
        mkdir $root/$share/$dest/thumbs
        chmod 777 $root/$share/$dest/thumbs
        mkdir $root/$share/$dest/tmp
        chmod 777 $root/$share/$dest/tmp
        ln -s $root/$private/*.html $root/$private/*.php $root/$private/*.js $root/$share/$dest/
        ln -s "$root/$private/albums/$1" $root/$share/$dest/library.json
    fi
else
    echo "File not found."
fi