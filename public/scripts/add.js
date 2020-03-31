const preview = document.getElementById("preview");
const progress = document.getElementById("progressBar");
const submit = document.getElementById("done");
const name = document.getElementById("name");
const author = document.getElementById("author");
const price = document.getElementById("price");
const category = document.getElementById("category");

const photos = "/coverPhotos/";
const defaultPreview = "images/cover1.jpg";

var authorList = [];
var catList = [];
var authOptions = '';
var catOptions = '';

var file;

function add() {
    submit.disabled = true;
    var date = new Date();
    date = date.toUTCString();
    if (file) upload(file, name.value + author.value + date + file.name, false);
    else save();
    return false;
}

function save(url, ref) {

    db = getDatabase().collection("Books");

    var book = {
        Name: format(name.value),
        Author: format(author.value),
        Price: price.value || 0,
        Category: format(category.value),
        Photo: url || false,
        PhotoRef: ref || null,
        SavedOn: new Date()
    };

    progress.value = 70;

    db.add(book)
        .then((docRef) => {
            progress.value = 0;
            preview.src = defaultPreview;
            name.value = "";
            price.value = "";
            author.value = "";
            category.value = "";
            file = undefined;
            submit.disabled = false;
            document.getElementById('bookList').innerHTML = "";
        })
        .catch((error) => {
            submit.disabled = false;
            window.alert("Oops something went wrong.");
        });

    if (authorList.indexOf(format(author.value)) < 0) {
        authorList.push(format(author.value));
        authOptions += '<option value = "' + format(author.value) + '" />';
        document.getElementById('authorList').innerHTML = authOptions;
    }

    if (catList.indexOf(format(author.value)) < 0) {
        catList.push(format(category.value));
        catOptions += '<option value = "' + format(category.value) + '" />';
        document.getElementById('catList').innerHTML = catOptions;
    }

    return false;
}

function upload(File, name, temp) {
    const storageRef = firebase.storage().ref(temp ? photos : "/temp/").child(name);
    const uploadTask = storageRef.put(File);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            if (!temp) progress.value = -5 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
        },
        (error) => {

            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/unauthorized':
                    window.open("index.html", "_self");
                    break;

                case 'storage/canceled':
                    window.alert("Upload Canceled.");
                    break;
                case 'storage/unknown':
                    window.alert("Something Went Wrong. Could't Upload File.");
                    break;
            }
        },
        () => {
            // Upload completed successfully, now we can get the download URL

            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                if (temp) getText(downloadURL);
                else {
                    progress.value = 50;
                    save(downloadURL, uploadTask.snapshot.ref.fullPath);
                }
            });
        });
}

function loadOptions() {
    getDatabase().collection('stats').doc('Book_Props').get().then((stats) => {

        if (!stats.exists) return;

        var authors = '';

        authorList = stats.data().Authors;
        catList = stats.data().Categories;

        for (var author of authorList) {
            authors += '<option value = "' + author + '" />';
        }

        authOptions = authors;

        document.getElementById('authorList').innerHTML = authOptions;

        authors = '';

        for (var category of catList) {
            authors += '<option value = "' + category + '" />';
        }

        catOptions = authors;

        document.getElementById('catList').innerHTML = catOptions;
    });
}

document.getElementById("file-input")
    .addEventListener('change', (evt) => {
        if (evt.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = function () {
                preview.src = reader.result;
            };
            reader.readAsDataURL(evt.target.files[0]);
            upload(evt.target.files[0], new Date().toUTCString + "-" + Math.random(), true);
            $("#myModal").modal("hide");
            $("#loading").modal("show");
        } else {
            file = undefined;
            preview.src = defaultPreview;
        }
    });


function format(str) {

    if (!str) return str;

    var pieces = str.split(" ");
    for (var i = 0; i < pieces.length; i++) {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1).toLowerCase();
    }
    return pieces.join(" ");
}

function getText(file) {


    $.post("/vision", {
        File: file,
        Filter: true
    }, (result) => {
        $("#loading").modal("hide");
        if (result == "NO_IMAGE_FILE_PROVIDED" || result == "NO_TEXT_FOUND" || !result)
            window.alert("The photo you uploaded dosenot contain any text.");
        else gotResult(result);
    }).fail(function (response) {
        $("#loading").modal("hide");
        alert('Error: ' + response.responseText);
    });
}

function gotResult(result) {
    console.log(result);
    if (result.Author) new Promise((resolve, reject) => {
        var conformed = [];
        var newOptions = "";
        result.Author.forEach(author => {
            if (authorList.indexOf(author) > 0) {
                if (result.Filtered.Author.indexOf(author) > 0) conformed.unshift(author);
                else conformed.push(author);
            } else newOptions += '<option value = "' + author + '" />';
        });
        if (conformed.length > 0) author.value = conformed[0];
        else if (result.Filtered.Author[0]) author.value = result.Filtered.Author[0];
        else author.value = result.Author[0];
        resolve(newOptions + authOptions);
    }).then(list => document.getElementById('authorList').innerHTML = list);
    if (result.Book) new Promise((resolve, reject) => {
        var conformed = [];
        var newOptions = "";
        result.Book.forEach(book => {
            if (bookList.indexOf(book) > 0) {
                if (result.Filtered.Book.indexOf(book) > 0) conformed.unshift(book);
                else conformed.push(book);
            } else {
                bookList.push(book);
                newOptions += '<option value = "' + book + '" />';
            }
        });
        if (conformed.length > 0) book.value = conformed[0];
        else if (result.Filtered.Book[0]) name.value = result.Filtered.Book[0];
        else name.value = result.Book[0];
        resolve(newOptions);
    }).then(list => document.getElementById('bookList').innerHTML = list);

}

var video = document.querySelector("#vid");
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;

$("#myModal").on('show.bs.modal', () => startVideo());
$("#myModal").on('hide.bs.modal', () => {
    if (localMediaStream) localMediaStream.getTracks().forEach(track => track.stop());
});

function snapshot() {
    if (localMediaStream) {
        $("#myModal").modal("hide");
        $("#loading").modal("show");

        canvas.setAttribute("width", video.videoWidth);
        canvas.setAttribute("height", video.videoHeight);
        ctx.drawImage(video, 0, 0);
        preview.src = canvas.toDataURL();
        fetch(canvas.toDataURL())
            .then(res => res.blob())
            .then(blob => upload(blob, new Date().toUTCString + "-" + Math.random(), true));
    }
}


function startVideo() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia({
        video: true
    }, (stream) => {
        video.srcObject = stream;
        localMediaStream = stream;
    }, () => {});

}

loadOptions();