$(document).ready(function() {
  let database = firebase.database();
  let USER_ID = window.location.search.match(/\?id=(.*)/)[1];
  let storage = firebase.storage().ref("photos");
  database.ref("users/" + USER_ID).once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const childData = childSnapshot.val();

        if (childData.photo === "image/profile.png") {
          $("#img-profile").attr("src", "image/profile.png");
        } else {
          storage.child(USER_ID).getDownloadURL().then(url => {
            $("#img-profile").attr("src", url);
          });
        }

        $("#name").val(childData.name);
        $("#years").val(childData.years);
        $("#city").val(childData.city);
        $("#state").val(childData.state);
        $("#status").val(childData.status);
        $("#kids").val(childData.kids);
        $("#about").val(childData.about);

        $("#photo").change(function(event) {
          $("#save").prop("disabled", true);
          $("#back").prop("disabled", true);
          let arquivo = event.target.files[0];
          storage.child(USER_ID).put(arquivo).then(snapshot => {
            $("#save").prop("disabled", false);
            $("#back").prop("disabled", false);
          });
        });
      });

      $("#save").prop("disabled", false);
      $("#back").prop("disabled", false);
    })
    .catch(function(error) {
      $("#back").prop("disabled", false);
      alert("Erro no carregamento das informações.");
    });

  $("#save").click(function() {
    const users = database.ref("users/" + USER_ID);
    users.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          const childData = childSnapshot.val();
          let photo;
          if ($("#photo").val() === "") {
            photo = childData.photo;
          } else {
            photo = $("#photo").val();
          }

          const key = childSnapshot.key;
          database.ref("users/" + USER_ID + "/" + key).update({
            about: $("#about").val(),
            city: $("#city").val(),
            kids: $("#kids").val(),
            name: $("#name").val(),
            photo: photo,
            state: $("#state").val(),
            status: $("#status").val(),
            years: $("#years").val()
          });
        });
      });
    alert("Dados salvos com sucesso!");
    window.location = "profile.html?id=" + USER_ID;
  });
  $("#back").click(function() {
    window.location = "profile.html?id=" + USER_ID;
  });
  $("#home").click(function() {
    window.location = "timeline.html?id=" + USER_ID;
  });
  $("#profile").click(function() {
    window.location = "profile.html?id=" + USER_ID;
  });
});