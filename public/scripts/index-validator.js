function signin() {

  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  signIn(email, password)
    .then((UserCredential) => {
      var user = UserCredential.user;

      document.cookie = 'User_Token=';

      if (!user.emailVerified) return window.open("verify.html", "_self");
      return window.open("home.html", "_self");

    })
    .catch(e => {
      var message = (e.code == 'auth/wrong-password' || e.code == 'auth/invalid-email' ||
        e.code == 'auth/user-not-found') ? "Invalid Email or Password" : e.message;
      document.getElementById('message').innerHTML = message;
    });

  return false;
}

function signup() {

  var name = document.getElementById('name').value;
  var email = document.getElementById('emailNew').value;
  var password = document.getElementById('passwordNew').value;
  var passwordRep = document.getElementById('passwordRep').value;

  var message;

  if (!name) message = "User Name is required.";
  else if (!email) message = "Email is required.";
  else if (password != passwordRep) message = "Both passwords don't match.";

  if (message) {
    document.getElementById('messageNew').innerHTML = message;
    return false;
  }

  return true;
}