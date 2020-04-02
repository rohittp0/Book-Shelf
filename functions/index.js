const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const functions = require('firebase-functions');
const admin = require("firebase-admin");

const verifyFile = path.join(__dirname, "/content/", 'verify.html');
const homeFile = path.join(__dirname, "/content/", 'home.html');
const homeHtml = path.join(__dirname, "/content/", 'book.html');
const options = {
    root: path.join(__dirname, "/content/")
};
const classes = [
    'class="bk-book book-3 bk-bookdefault"',
    'class="bk-book book-2 bk-bookdefault"',
    'class="bk-book book-1 bk-bookdefault"'
];

var verifyRaw = "Please Login from main page.";
var homeHtmlRaw = "<h1>Please Refresh the page.</h1>";
var homeFileRaw;
var homeHtmls = "<h1>No Books Avalable.</h1>";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://book-shelf-be347.firebaseio.com"
});

const db = admin.firestore();

app.use(express.json());


console.log("initalised");


function readFile(response) {
    var promises = [];
    if (!homeFileRaw) promises.push(new Promise((resolve, reject) => fs.readFile(homeHtml, {
        encoding: 'utf-8'
    }, (err, data) => {
        if (err) reject(err);
        else homeHtmlRaw = data;
        resolve();
    })));
    if (!homeFileRaw) promises.push(new Promise((resolve, reject) => fs.readFile(homeFile, {
        encoding: 'utf-8'
    }, (err, data) => {
        if (err) reject(err);
        else homeFileRaw = data;
        resolve();
    })));

    return Promise.all(promises);

}

function renderHome() {
    return db.collection('Books').limit(10).orderBy('SavedOn').get()
        .then((snapshot) => {
            var promises = [];
            snapshot.forEach((doc) => {
                promises.push(
                    new Promise((resolve, reject) => {
                        var homeHtml = homeHtmlRaw;

                        var name = doc.get('Name');
                        var author = doc.get('Author');
                        var category = doc.get('Category');
                        var price = doc.get('Price');
                        var photo = doc.get('Photo');

                        if (photo) {
                            var style = "style = 'background-image: url(" + photo + ");'";
                            homeHtml = homeHtml.replace("@Book_Photo", style)
                                .replace("<!--Author_Name_Cover-->", "")
                                .replace("<!--Book_Name_Cover-->", "");
                        } else {
                            homeHtml = homeHtml.replace("@Book_Photo", "")
                                .replace("<!--Author_Name_Cover-->", author)
                                .replace("<!--Book_Name_Cover-->", name)
                                .replace("<!--Book_ID-->", doc.id);
                        }
                        homeHtml = homeHtml.replace("<!--Book_Price-->", price)
                            .replace("<!--Book_Category-->", category)
                            .replace(/<!--Book_Name-->/g, name)
                            .replace(/<!--Author_Name-->/g, author)

                            .replace("@Book_Class", classes[Math.floor(Math.random() * 3)]);

                        resolve(homeHtml);
                    }));
            });
            return Promise.all(promises);
        }).then((homeHtmls) => {
            var content;
            homeHtmls.forEach((html) => content += html);
            return homeFileRaw.replace("<!--BOOK_LIST-->", content || " ");
        });

}

function renderBook(book) {

    const name = book.Name.replace(/^\s+|\s+$/gm, '').replace(/\s/g, '+');
    const author = book.Author.replace(/^\s+|\s+$/gm, '').replace(/\s/g, '+inauthor:');

    const getURL = "https://www.googleapis.com/books/v1/volumes?q=" +
        name + "+inauthor:" + author +
        "&key=AIzaSyCvp63hYyDpYGysa_-7xnVbTcY_Ed4fPGU" +
        "&callback=handleResponse";

    var html = "<h1>" + name + author + "</h1>";
    return html;
}

app.post('/signup', (request, response) => {

    var email = request.body.email;
    var password = request.body.password;
    var name = request.body.name;

    if (!verifyRaw) fs.readFile(verifyFile, {
        encoding: 'utf-8'
    }, (err, data) => {
        if (!err) {
            verifyRaw = data;
        } else {
            verifyRaw = err.message;
        }
    });

    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: name,
        disabled: false
    })
        .then((userRecord) => {
            return admin.auth().createCustomToken(userRecord.uid);
        }).then((token) => {
            var file = verifyRaw.replace('//<PASSED_VALUE-001>', "= '" + token + "';");
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.write(file);
            return response.end();
        })
        .catch((error) => onError(error, response));
});

app.get('/home.html', (request, response) => {
    readFile()
        .then(() => {
            return renderHome();
        })
        .then((content) => {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.write(content);
            return response.end();
        }).catch((error) => onError(error, response));
});

app.get('/verify.html', (request, response) => response.sendFile('verify.html', options));

app.get('/view', (request, response) => {
    var docRef = db.collection("Books").doc(request.param("ID", null));

    if (!docRef) {
        response.sendFile('404.html', options);
        return response.end();
    }

    return docRef.get().then((doc) => {
        if (doc.exists) {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.write(renderBook(doc.data()));
        } else {
            response.sendFile('404.html', options);
        }
        return response.end();
    }).catch((error) => onError(error, response));
});

function getText(file, filter) {
    if (!file) response.end("NO_IMAGE_FILE_PROVIDED");


    const subscriptionKey = '1f3dc4cf9e364775bce9d06e5f36d1d3';

    // You must use the same location in your REST call as you used to get your
    // subscription keys. For example, if you got your subscription keys from
    // westus, replace "westcentralus" in the URL below with "westus".
    const uriBase =
        'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/ocr';

    const options = {
        method: "POST",
        qs: {
            'language': 'en',
            'detectOrientation': 'true',
        },
        body: '{"url": ' + '"' + file + '"}',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    };
    const fetch = require("node-fetch");

    return fetch(uriBase, options).then((response) => {
        return response.json();
    }).then((ocr) => {
        var text = "";
        console.log(ocr);
        if (!ocr.regions[0]) return "NO_TEXT_FOUND"
        ocr.regions.forEach(region => region.lines.forEach(line => {
            line.words.forEach(word => text += (word.text + " "));
        }));
        return text.trim();
    }).then((text) => {
        return text;
    });
    /* return new Promise((reslove, reject) => {
        request.post(options, (error, response, body) => {
            if (error) {
                console.error(error);
                return "NO_TEXT_FOUND";
            }
            let json = JSON.parse(body);
            let lines = [];
            json.regions.forEach(region => region.lines.forEach(line => {
                var Line = [];
                line.words.forEach(word => Line.push(word.text));
                lines.push(Line);
            }));
            reslove(lines);
        });
        console.log("-----------API called-----------");

    }).then(lines => {
        console.table(lines);
        return classifyText(lines);
    }).then(result => {
        console.log("-----------Classification Compleate-----------");
        console.log("Result ->");
        console.table(result);

        return filter ? filterText(result) : result;
    }); */
}

function classifyText(lines) {

    console.log("````````` Classifying ```````````");

    const author = [];
    const book = [];
    const promises = [];

    //Import check word
    const checkWord = require('check-word');
    const words = checkWord('en');

    lines.forEach(line => {
        if (line) promises.push(
            new Promise((reslove, reject) => {
                if (line.words) {
                    var word = true;
                    var text = "";
                    line.forEach(block => {
                        if (block) {
                            word = (words.check(block.toLowerCase().trim()) ||
                                !isNaN(block.trim()));
                            text += word;
                        }
                    });

                    if (word) book.push(text);
                    else author.push(text);

                }
                reslove("Done");
            }));
    });

    return Promise.all(promises)
        .then(() => {
            console.log("````````` Classification Compleate ```````````");

            return {
                Book: book,
                Author: author
            };
        });
}

function filterText(json) {
    console.log("````````` Filtering Text ```````````");

    const getURL = "https://www.googleapis.com/books/v1/volumes?q=";
    const key = "&key=AIzaSyCvp63hYyDpYGysa_-7xnVbTcY_Ed4fPGU";
    const fetch = require("node-fetch");
    const books = [];
    const authors = [];
    const promises = [];

    json.Book.forEach((bookTest) => {
        if (bookTest) promises.push(new Promise((reslove, reject) => {
            console.log("````````` For each bookTest ```````````");

            var query = getURL + bookTest.trim().replace(/\s/g, '+') + key;
            fetch(query)
                .then(response => {
                    return response.json();
                }).then(book => {
                    console.log("````````` Query Arrived ```````````");
                    var bookPromise = [];
                    if (book.items) book.items.forEach(item => {
                        console.log("````````` For each Item ```````````");
                        var itemPromises = [];
                        if (item.volumeInfo.authors) bookPromise.push(new Promise((resolve, reject) => {
                            item.volumeInfo.authors
                                .forEach(author => {
                                    console.log("`````````For each Author ```````````");

                                    author = author.toLowerCase().trim();
                                    itemPromises.push(new Promise((resolve, reject) => {
                                        json.Author.forEach(authorTest => {
                                            if (authors.indexOf(authorTest) < 0)
                                                if (authorTest === author) {
                                                    authors.push(authorTest);
                                                    books.push(bookTest);
                                                }
                                        });
                                        reslove("Done");
                                    }));
                                });
                            // eslint-disable-next-line promise/no-nesting
                            Promise.all(itemPromises).then(() => reslove("Done"))
                                .catch((error) => reject(error));
                        }));
                    });
                    return Promise.all(bookPromise);
                }).then(() => reslove("Done"))
                .catch(error => console.error(error));
        }));
    });
    return Promise.all(promises)
        .then(() => {
            console.log("`````````Filtering compleate ```````````");

            return ({
                Author: json.Author,
                Book: json.Book,
                Filtered: {
                    Author: authors,
                    Book: books
                }
            });
        });
}

function Format(str) {

    if (!str) return str;

    var pieces = str.split(" ");
    for (var i = 0; i < pieces.length; i++) {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1).toLowerCase();
    }
    return pieces.join(" ");
}

app.post('/vision', (request, response) => {
    return getText(request.body.File, request.body.Filter)
        .then((json) => response.json(json))
        .catch(error => onError(error));
});

app.get('*', (request, response) => {
    response.sendFile('error-404.html', options);
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // Cashes for 5 minutes in brouser and 10 in server
});


exports.created = functions.firestore.document('Books/{bookID}')
    .onCreate((snapshot, context) => {
        console.log("~~~~~~~~ @ Function created ~~~~~~~~~~" + context.params);
        var batch = db.batch();
        var FieldValue = admin.firestore.FieldValue;
        var stats = db.collection("stats");
        var promise = [];

        promise[0] = batch.update(snapshot.ref, {
            "SelfRef": snapshot.ref
        });

        promise[1] = batch.update(stats.doc("Book_Count"), {
            "count": FieldValue.increment(1)
        });
        promise[2] = batch.update(stats.doc("Book_Props"), {
            "Authors": FieldValue.arrayUnion(Format(snapshot.data().Author))
        });
        promise[3] = batch.update(stats.doc("Book_Props"), {
            "Categories": FieldValue.arrayUnion(Format(snapshot.data().Category))
        });

        promise[4] = db.collection("/stats/Author_Props/Authors").where("Name", "==", Format(snapshot.data().Author))
            .get().then((snapshots) => {
                if (snapshots.empty || !snapshots.docs[0].exists) {
                    batch.update(stats.doc("Author_Props"), {
                        count: FieldValue.increment(1)
                    });
                    return batch.update(db.collection("/stats/Author_Props/Authors").doc(), {
                        Name: Format(snapshot.data().Author),
                        Books: 1,
                        Rating: snapshot.data().Price || 0
                    });
                } else return batch.update(snapshots.docs[0].ref, {
                    Books: FieldValue.increment(1),
                    Rating: FieldValue.increment(snapshot.data().Price || 0)
                });

            });

        promise[5] = db.collection("/stats/Category_Props/Categories").where("Name", "==", Format(snapshot.data().Category))
            .get().then((snapshots) => {
                if (snapshots.empty || !snapshots.docs[0].exists) {
                    batch.update((db.collection("/stats/Category_Props/Categories").doc(), {
                        Name: Format(snapshot.data().Category),
                        Books: 1,
                        Rating: snapshot.data().Price || 0
                    }));
                    return batch.update(stats.doc("Category_Props"), {
                        count: FieldValue.increment(1)
                    });
                } else return batch.update(snapshots.docs[0].ref, {
                    Books: FieldValue.increment(1),
                    Rating: FieldValue.increment(snapshot.data().Price || 0)
                });
            });

        return Promise.all(promise).then(() => batch.commit());
    });

exports.deleted = functions.firestore.document('Books/{bookID}')
    .onDelete((snapshot, context) => {
        var batch = db.batch();

        var stats = db.collection("stats");
        var FieldValue = admin.firestore.FieldValue;
        var promise = [];

        promise[0] = batch.update(stats.doc("Book_Count"), {
            count: FieldValue.increment(-1)
        });

        promise[1] = db.collection("/stats/Author_Props/Authors").where("Name", "==", Format(snapshot.data().Author))
            .get().then((snapshots) => {
                return snapshots.docs[0] && snapshots.docs[0].exist ? batch.update(snapshots.docs[0].ref, {
                    Books: FieldValue.increment(-1),
                    Rating: FieldValue.increment(-snapshot.data().Price || 0)
                }) : null;
            });

        promise[2] = db.collection("/stats/Category_Props/Categories").where("Name", "==", Format(snapshot.data().Category))
            .get().then((snapshots) => {
                return snapshots.docs[0] && snapshots.docs[0].exists ? batch.update(snapshots.docs[0].ref, {
                    Books: FieldValue.increment(-1),
                    Rating: FieldValue.increment(-snapshot.data().Price || 0)
                }) : null;
            });

        promise[3] = batch.update(stats.doc("Author_Props"), {
            count: FieldValue.increment(-1)
        });
        promise[4] = batch.update(stats.doc("Category_Props"), {
            count: FieldValue.increment(-1)
        });

        if (snapshot.data().PhotoRef)
            promise[5] = admin.storage().bucket('gs://book-shelf-be347.appspot.com')
                .file(snapshot.data().PhotoRef).delete();

        return Promise.all(promise).then(() => batch.commit());

    });
exports.app = functions.https.onRequest(app);

function onError(error, response) {
    console.error(error);
    response.sendFile('error-500.html', options);
    response.end();
}