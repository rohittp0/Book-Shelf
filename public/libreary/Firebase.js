var auth;
var database;

var config = {
  apiKey: "AIzaSyCvp63hYyDpYGysa_-7xnVbTcY_Ed4fPGU",
  authDomain: "book-shelf-be347.firebaseapp.com",
  databaseURL: "https://book-shelf-be347.firebaseio.com",
  projectId: "book-shelf-be347",
  storageBucket: "book-shelf-be347.appspot.com",
  messagingSenderId: "753979292689"
};
firebase.initializeApp(config);
auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    //window.open('index.html', '_self');
  }
});

function getDatabase() {
  if (!database) database = firebase.firestore();
  return database;
}

function signInWithToken(token) {
  return auth.signInWithCustomToken(token);
}

function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function getUser() {
  return firebase.auth().currentUser;
}

function verifyUser() {
  var user = firebase.auth().currentUser;
  if (!user) return "No Users";
  if (user.emailVerified) return "Verified";
  return user.sendEmailVerification();
}

function signOut() {
  return auth.signOut();
}


//<script src="https://www.gstatic.com/firebasejs/5.8.2/firebase.js"></script>