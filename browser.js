//browser.js

var library  = [];
var dates    = [];
var max      = 200;
var total    = 0;
var loaded   = 0;
var first    = true;
var tmp      = document.createElement('tmp');
var scroll   = 0;
var start    = 0;
var end      = 0;
var selected = -1;

function initBrowser() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            library = JSON.parse(this.responseText);
            getAvailableDates();
            updateView(total - 101, total - 1);
        }
    };
    xhttp.open("POST", "loadlib.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}


function getAvailableDates() {
    var y, m, d;
    for (var id in library) {
        total++;
        y = parseInt(library[id].date.substr(0,4));
        m = parseInt(library[id].date.substr(5,2));
        d = parseInt(library[id].date.substr(8,2));
        if (typeof dates[y] === 'undefined')
            dates[y] = [];
        if (typeof dates[y][m] === 'undefined')
            dates[y][m] = [];
        if (typeof dates[y][m][d] === 'undefined')
            dates[y][m][d] = id;
    }

    var yearOptions = '<option></option>';
    for (var year in dates)
        yearOptions += '<option value="'+year+'">'+year+'</option>';
    document.getElementById('y').innerHTML = yearOptions;
}


function updateView(newStart, newEnd) {

    start = newStart > 0 ? newStart : 0;
    end = newEnd > total - 1 ? total - 1: newEnd;

    var date;

    date = library[start].date.substr(0,10);
    while (start > 0 && date == library[start - 1].date.substr(0,10))
        start--;

    date = library[end].date.substr(0,10);
    while (end < total - 1 && date == library[end + 1].date.substr(0,10))
        end++;

    /*if (end - start > max) {
        if (height > 0) {
            date = library[end + 1].date.substr(0,10);
            while (start <= end && date == library[end].date.substr(0,10))
                end--;
        } else {
            date = library[start - 1].date.substr(0,10);
            while (start <= end && date == library[start].date.substr(0,10))
                start++;
        }
    }*/

    date = '';
    var content = '';
    for (var id = start; id <= end; id++) {
        if (date != library[id].date.substr(0,10)) {
            date = library[id].date.substr(0,10);
            content += '<p>'+date+'</p>';
        }
        content += '<a href="javascript:void(0)" onclick="startSlideshow('+id+')">';
        content += '<img src="dispthumb.php?img='+library[id].lsrc+'" onload="countLoads()"></a> ';
    }

    tmp.innerHTML = content;
}


function countLoads() {
    loaded++;
    if (loaded == end - start + 1) {
        loaded = 0;
        var e = document.documentElement;
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
        }
    }
}


function scrolled() {
    var e = document.documentElement;
    if (e.scrollTop == 0) {
        scroll = e.scrollHeight;
        updateView(start - 100, end);
    } else if (e.scrollTop + e.clientHeight == e.scrollHeight) {
        scroll = 0;
        updateView(start, end + 100);
    }
}


function sely() {
    var y = document.getElementById('y').value;
    if (typeof dates[y] !== 'undefined') {
        var monthOptions = '<option></option>';
        for (var m in dates[y])
            monthOptions += '<option value="'+m+'">'+m+'</option>';
        document.getElementById('m').innerHTML = monthOptions;
    }
    document.getElementById('d').innerHTML = '<option></option>';
}


function selm() {
    var y = document.getElementById('y').value;
    var m = document.getElementById('m').value;
    if (typeof dates[y][m] !== 'undefined') {
        var dayOptions = '<option></option>';
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


function startSlideshow(id) {
    var slideWindow = window.open('slideshow.html', 'thjmedia_slideshow', 'width=1024,height=768');
    selected = id;
    slideWindow.moveTo(0,0);
    slideWindow.resizeTo(screen.width, screen.height);
    slideWindow.focus();
}
