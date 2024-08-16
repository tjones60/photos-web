//browser.js

var library   = [];
var dates     = {};
var selection = {};
var albums    = {};
var max       = 200;
var total     = 0;
var loaded    = 0;
var first     = true;
var tmp       = document.createElement('tmp');
var scroll    = 0;
var start     = 0;
var end       = 0;
var selected  = -1;
var selecting = false;
var album     = null;
var share     = false;
var touch     = false;

function initBrowser() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '/var/www/thjmedia/jones/photos') {
                getAlbums();
                document.getElementById('album').style.display = 'inline-block';
                document.getElementById('y').style.display = 'inline-block';
                document.getElementById('m').style.display = 'inline-block';
                document.getElementById('d').style.display = 'inline-block';
            } else {
                share = true;
            }
        }
    };
    xhttp.open('POST', 'pwd.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send();

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            library = JSON.parse(this.responseText);
            getAvailableDates();
            if (window.opener) {
                scroll = window.opener.scroll;
                updateView(window.opener.start, window.opener.end)
            } else {
                updateView(total - 101, total - 1);
            }
        }
    };
    xhttp.open('POST', 'load.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('file=library.json');
}


function getAvailableDates() {
    var y, m, d;
    for (var id in library) {
        total++;
        y = parseInt(library[id].date.substr(0,4));
        m = parseInt(library[id].date.substr(5,2));
        d = parseInt(library[id].date.substr(8,2));
        if (typeof dates[y] === 'undefined')
            dates[y] = {};
        if (typeof dates[y][m] === 'undefined')
            dates[y][m] = {};
        if (typeof dates[y][m][d] === 'undefined')
            dates[y][m][d] = id;
    }

    var yearOptions = '<option>Y</option>';
    for (var year in dates)
        yearOptions += '<option value="'+year+'">'+year+'</option>';
    document.getElementById('y').innerHTML = yearOptions;
}


function getAlbums() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            albums = JSON.parse(this.responseText);
            var albumOptions = '<option>Album</option>';
            for (var a in albums)
                albumOptions += '<option value="'+a+'">'+a+'</option>';
            document.getElementById('album').innerHTML = albumOptions;

            if (album !== null) {
                if (albums.hasOwnProperty(album)) {
                    document.getElementById('album').value = album;
                    selAlbum();
                }
            }
        }
    };
    xhttp.open('POST', 'load.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('file=albums');
}


function updateView(newStart, newEnd) {

    if (share == false) {

        start = newStart > 0 ? newStart : 0;
        end = newEnd > total - 1 ? total - 1: newEnd;

        var date;

        date = library[start].date.substr(0,10);
        while (start > 0 && date == library[start - 1].date.substr(0,10))
            start--;

        date = library[end].date.substr(0,10);
        while (end < total - 1 && date == library[end + 1].date.substr(0,10))
            end++;
    
    } else {

        start = 0;
        end = total - 1;
    }

    date = '';
    var content = '';
    for (var id = start; id <= end; id++) {
        if (date != library[id].date.substr(0,10)) {
            date = library[id].date.substr(0,10);
            content += '<p>'+date+'</p>';
        }
        content += '<a href="javascript:void(0)" onclick="imgClk('+id+')">';
        content += '<img id="img_'+id+'" src="dispthumb.php?img='+library[id].lsrc+'" onload="countLoads()"></a> ';
    }

    tmp.innerHTML = content;
}


function selAlbum() {
    if (document.getElementById('album').value != 'Album') {
        album = document.getElementById('album').value;
        start = 0;
        end = Object.keys(albums[album]).length - 1;
        document.getElementById('y').style.display = 'none';
        document.getElementById('m').style.display = 'none';
        document.getElementById('d').style.display = 'none';
        document.getElementById('close').style.display = 'inline-block';
        select(false);
        var content = '';
        for (id in albums[album]) {
            content += '<a href="javascript:void(0)" onclick="imgClk('+id+')">';
            content += '<img id="img_'+id+'" src="dispthumb.php?img='+albums[album][id].lsrc+'" onload="countLoads()"></a> ';
        }
        tmp.innerHTML = content;
    } else {
        closeAlbum();
    }
}


function closeAlbum() {
    album = null;
    document.getElementById('album').value = 'Album'
    document.getElementById('y').style.display = 'inline-block';
    document.getElementById('m').style.display = 'inline-block';
    document.getElementById('d').style.display = 'inline-block';
    document.getElementById('close').style.display = 'none';
    updateView(total - 101, total - 1);
    first = true;
}


function countLoads() {
    loaded++;
    if (loaded == end - start + 1) {
        loaded = 0;
        var e = document.scrollingElement;
        document.getElementById('bdiv').innerHTML = tmp.innerHTML.replace(/ onload="countLoads\(\)"/g, '');
        if (scroll > 0) {
            e.scrollTop = e.scrollHeight - scroll;
        } else if (scroll < 0) {
            e.scrollTop = 0;
        }

        if (first) {
            first = false;
            e.scrollTop = e.scrollHeight - e.clientHeight;
            document.getElementById('loading').style.visibility = 'hidden';
            document.getElementById('bdiv').style.visibility = 'visible';
        } else {
            for (var id in selection)
                document.getElementById('img_'+id).className = 'selected';
        }
    }
}


function scrolled() {
    if (album === null && share == false) {
        var e = document.documentElement;
        if (e.scrollTop == 0) {
            scroll = e.scrollHeight;
            updateView(start - 100, end);
        } else if (e.scrollTop + e.clientHeight == e.scrollHeight) {
            scroll = 0;
            updateView(start, end + 100);
        }
    }
}


function sely() {
    var y = document.getElementById('y').value;
    if (typeof dates[y] !== 'undefined') {
        var monthOptions = '<option>M</option>';
        for (var m in dates[y])
            monthOptions += '<option value="'+m+'">'+m+'</option>';
        document.getElementById('m').innerHTML = monthOptions;
    }
    document.getElementById('d').innerHTML = '<option>D</option>';
}


function selm() {
    var y = document.getElementById('y').value;
    var m = document.getElementById('m').value;
    if (typeof dates[y][m] !== 'undefined') {
        var dayOptions = '<option>D</option>';
        for (var d in dates[y][m])
            dayOptions += '<option value="'+d+'">'+d+'</option>';
        document.getElementById('d').innerHTML = dayOptions;
    }
}


function seld() {
    var y = document.getElementById('y').value;
    var m = document.getElementById('m').value;
    var d = document.getElementById('d').value;
    if (typeof dates[y][m][d] !== 'undefined') {
        scroll = -1;
        date = parseInt(dates[y][m][d]);
        updateView(date, date + 100);
    }
}


function imgClk(id) {
    if (selecting) {
        if (document.getElementById('img_'+id).className == 'selected') {
            delete selection[id];
            document.getElementById('img_'+id).className = '';
        } else {
            if (album === null) {
                selection[id] = library[id];
            } else {
                selection[id] = albums[album][id];
            }
            document.getElementById('img_'+id).className = 'selected';
        }
    } else {
        selected = id;
        document.getElementById('slideshow').src = 'slideshow.html';
        document.getElementById('slideshow').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}


function closeSlideshow() {
    document.getElementById('slideshow').style.display = 'none';
    document.body.style.overflow = 'visible';
}


function select(state) {

    if (state) {

        document.getElementById('cancel').style.display = 'inline-block';
        document.getElementById('download').style.display = 'inline-block';
        document.getElementById('select').style.display = 'none';
        selecting = true;

        if (share == true) {
            document.getElementById('all').style.display = 'inline-block';
        } else if (album === null) {
            document.getElementById('name').style.display = 'inline-block';
            document.getElementById('add').style.display = 'inline-block';
        } else {
            document.getElementById('remove').style.display = 'inline-block';
            document.getElementById('all').style.display = 'inline-block';
        }

    } else {

        for (var id in selection)
            document.getElementById('img_'+id).className = '';
        selection = {};

        document.getElementById('cancel').style.display = 'none';
        document.getElementById('name').style.display = 'none';
        document.getElementById('add').style.display = 'none';
        document.getElementById('remove').style.display = 'none';
        document.getElementById('all').style.display = 'none';
        document.getElementById('download').style.display = 'none';
        document.getElementById('select').style.display = 'inline-block';
        selecting = false;
    }
}


function selectAll() {
    if (selecting) {
        if (album == null) {
            for (var id in library) {
                selection[id] = library[id];
                document.getElementById('img_'+id).className = 'selected';
            }
        } else {
            for (var id in albums[album]) {
                selection[id] = albums[album][id];
                document.getElementById('img_'+id).className = 'selected';
            }
        }
    }
}


function add() {

    var a = document.getElementById('name').value;
    if (typeof albums[a] === 'undefined')
        albums[a] = [];
    var add = true;

    for (var i in selection) {
        add = true;

        for (var j = 0; j < albums[a].length; j++) {
            if (albums[a][j].lsrc == selection[i].lsrc) {
                add = false;
                break
            }
        }

        if (add) {
            albums[a].push(selection[i])
        }
    }

    albums[a].sort(function(a, b) {
        return a.date.localeCompare(b.date);
    })

    saveAlbum(a);
}


function remove() {
    for (var i in selection) {
        for (var j = 0; j < albums[album].length; j++) {
            if (albums[album][j].lsrc == selection[i].lsrc)
                albums[album].splice(j, 1);
        }
    }
    saveAlbum(album);
}


function saveAlbum(a) {
    var name = encodeURIComponent(a);
    var str = encodeURIComponent(JSON.stringify(albums[a]));
    var xhttp = new XMLHttpRequest();
    
    xhttp.open('POST', 'save.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('name=albums/'+name+'&str='+str);
    select(false);
}


function download() {
    var str = JSON.stringify(selection);

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "download.php");
    form.setAttribute("target", "_blank");

    var hiddenField = document.createElement("input"); 
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "str");
    hiddenField.setAttribute("value", str);

    form.appendChild(hiddenField);
    document.body.appendChild(form);
    form.submit();
}


function togglemenu() {
    if (document.getElementById('menu').style.display == 'none') {
        document.getElementById('menu').style.display = 'block';
    } else {
        document.getElementById('menu').style.display = 'none';
    }
}


function settouch() {
    touch = document.getElementById('touch').checked;
}