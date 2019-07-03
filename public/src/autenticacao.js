//Login e-mail e senha
$(document).ready(function () {
    let database = firebase.database();
    let storage = firebase.storage().ref("photos");
    $("#authLogin").click(function (event) {
        event.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function (response) {
                window.location = 'timeline.html?id=' + response.user.uid;
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                alert(errorMessage);
            });
    })

    //Login com Gmail    

    $("#authGmail").click(function (event) {
        event.preventDefault();
        let provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function (response) {
                let userId = response.user
                console.log(userId.uid)
                database.ref("users/" + userId.uid).push({
                    name: userId.displayName,
                    photo: "imagem/perfil.png",
                    years: "",
                    city: "",
                    state: "",
                    status: "",
                    kids: "",
                    about: "",
                    email: userId.email
                })
                // window.location = 'timeline.html?id=' + userId.uid
                database.ref("users/").once('value')
                    .then(function (snapshot) {
                        let snapshotVal = snapshot.val()
                        console.log(snapshotVal)
                    })
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                let email = error.email;
                let credential = error.credential;
                alert(errorMessage)
            })
    })

    //Criar nova conta
    $("#newAccount").click(function (event) {
        event.preventDefault();
        window.location = "cadastro.html";
    });
})