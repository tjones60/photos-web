//slideshow.js

var library = {};
var total   = 0;
var id      = -1;
if (window.opener) {
    id      = window.opener.selected;
    album   = window.opener.album;
}

function initSlideshow() {

    var file = 'library.json';
    if (album !== null)
        file = 'albums/'+album;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            library = JSON.parse(this.responseText);
            for (var photo in library)
                total++;
            loadImage(id);
        }
    };
    xhttp.open('POST', 'load.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('file='+file);
}


document.onkeydown = function(event) {
    switch (event.keyCode) {
        case 37:
            previous();
            break;
        case 39:
            next();
            break;
    }
};


function previous() {
    if (id <= 0) {
        loadImage(total - 1);
    } else {
        loadImage(id - 1);
    }
}


function next() {
    if (id >= total - 1) {
        loadImage(0);
    } else {
        loadImage(id + 1);
    }
}


function loadImage(newId) {
    if (arguments.length == 1) { id = newId; }
    if (id >= 0 && id < total) {
        document.getElementById('info').innerHTML = 'Loading...';
        image.onload = function() {
            document.getElementById('info').innerHTML = library[id].name+' | '+library[id].date;
            if (id + 1 < total)
                document.getElementById('preload2').src = 'dispimg.php?img='+library[id + 1].lsrc;
            if (id - 1 >= 0)
                document.getElementById('preload1').src = 'dispimg.php?img='+library[id - 1].lsrc;
        }
        document.getElementById('image').src = 'dispimg.php?img='+library[id].lsrc;
    }
}
