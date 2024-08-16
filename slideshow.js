//slideshow.js

var library = [];
var total   = 0;
var id      = 0;
var touch   = false;
var album   = null;
if (parent) {
    id      = parent.selected;
    album   = parent.album;
    touch   = parent.touch;
}


function initSlideshow() {

    if (touch) {
        document.getElementById('banner').style.display = 'none';
        document.getElementById('prevbtn').style.display = 'none';
        document.getElementById('nextbtn').style.display = 'none';
        document.getElementById('banner').style.opacity = 0.8;
        document.getElementById('prevbtn').style.opacity = 0.8;
        document.getElementById('nextbtn').style.opacity = 0.8;
        document.body.onclick = changevisibility;
    } else {
        document.getElementById('banner').classList.add('hoverable');
        document.getElementById('prevbtn').classList.add('hoverable');
        document.getElementById('nextbtn').classList.add('hoverable');
    }

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


function preload() {
    if (id + 1 < total) {
        ext = library[id + 1].lsrc.split('.').pop().toLowerCase();
        if (ext == 'jpg' || ext == 'png') {
            document.getElementById('preload1').src = 'dispimg.php?img='+library[id + 1].lsrc;
        }
    }
    if (id - 1 < total) {
        ext = library[id - 1].lsrc.split('.').pop().toLowerCase();
        if (ext == 'jpg' || ext == 'png') {
            document.getElementById('preload2').src = 'dispimg.php?img='+library[id - 1].lsrc;
        }
    }
}


function loadImage(newId) {
    if (arguments.length == 1) { id = newId; }
    ext = library[id].lsrc.split('.').pop().toLowerCase();
    if (id >= 0 && id < total) {
        info.innerHTML = 'Loading...';
        if (ext == 'jpg' || ext == 'png') {
            movie.pause();
            image.onload = function() {
                image.style.display = 'inline-block';
                movie.style.display = 'none';
                info.innerHTML = library[id].name+'<br>'+library[id].date;
                preload();
            }
            image.src = 'dispimg.php?img='+library[id].lsrc;
        } else if (ext == 'mp4' || ext == 'mov') {
            movie.src = '/jones'+library[id].lsrc;
            movie.style.display = 'inline-block';
            image.style.display = 'none';
            movie.play();
            info.innerHTML = library[id].name+'<br>'+library[id].date;
            preload();
        }
    }
}


var show;
function playshow() {
    show = setInterval(next, interval.value * 1000);
    showbtn.onclick = pauseshow;
    showbtn.innerHTML = '<b>||</b>';
}
function pauseshow() {
    clearInterval(show);
    showbtn.onclick = playshow;
    showbtn.innerHTML = '&#9658';
}


var visible = false;
function changevisibility() {
    if (visible) {
        document.getElementById('banner').style.display = 'none';
        document.getElementById('prevbtn').style.display = 'none';
        document.getElementById('nextbtn').style.display = 'none';
        visible = false;
    } else {
        document.getElementById('banner').style.display = 'block';
        document.getElementById('prevbtn').style.display = 'block';
        document.getElementById('nextbtn').style.display = 'block';
        visible = true;
    }
}