function makeRow(col1, col2, col3) {
    return "<tr><td>" + col1 + "</td><td>" + col2 + "</td><td>" + col3 + "</td></tr>";
}

function makeTable(snapshots) {
    let table = '';

    snapshots.forEach(snapshot => {
        table += makeRow(snapshot.get('Name'), snapshot.get('Books'), snapshot.get('Rating') || 0);
    });

    return table;
}

function errorFunction(error) {
    console.log(error);

}


function makeAuthors() {


    getDatabase().doc('/stats/Author_Props').get()
        .then((snapshot) => {
            document.getElementById('Authors').innerHTML = snapshot.data().count || 0;
        }).catch(errorFunction);

    getDatabase().collection('/stats/Author_Props/Authors').orderBy('Books', 'desc').get()
        .then((snapshot) => {
            document.getElementById('authorTable').innerHTML = makeTable(snapshot);
        }).catch(errorFunction);
}

function makeCategories() {

    getDatabase().doc('/stats/Category_Props').get()
        .then((snapshot) => {
            document.getElementById('Categories').innerHTML = snapshot.data().count || 0;
        }).catch(errorFunction);

    getDatabase().collection('/stats/Category_Props/Categories').orderBy('Books', 'desc').get()
        .then((snapshot) => {
            document.getElementById('categoryTable').innerHTML = makeTable(snapshot);
        }).catch(errorFunction);
}

function loaded() {
    makeAuthors();
    makeCategories();
    getDatabase().doc('/stats/Book_Count').get()
        .then((snapshot) => {
            document.getElementById('Books').innerHTML = snapshot.data().count || 0;
        }).catch(errorFunction);
}

window.onloadend = loaded();