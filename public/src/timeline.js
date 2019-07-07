let database = firebase.database();
let USER_ID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function () {
  database.ref("tasks/" + USER_ID).once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        creatPost(childData.text, childData.likes, childData.filter, childData.date, childKey);
      });
    });

  $("#filter-public").click(filterPublic);

  $("#filter-private").click(filterPrivate);

  $("#filter-friends").click(filterFriends);

  $("#filter-total").click(filterTotal);

  $("#public").keyup(disableBtn);

  $("#btnpost").click(newPost);

  $("#signout").click(signOut);

  $("#home").click(returnHome);

  $("#profile").click(returnProfile);
});

function filter(userOne, userTwo, userThree) {
  $("#post-total-filter").empty();
  database.ref("tasks/" + USER_ID).on("child_added", snapshot => {
    const filterSnapshot = snapshot.val();
    if (filterSnapshot.filter === userOne || userTwo || userThree) {
      filterPosts(filterSnapshot.text, filterSnapshot.likes, filterSnapshot.filter, filterSnapshot.date, snapshot.key);
    }
  });
}

function filterPublic(event) {
  event.preventDefault();
  filter("Público", "", "");
}

function filterFriends(event) {
  event.preventDefault();
  filter("Amigos", "", "");
}

function filterPrivate(event) {
  event.preventDefault();
  filter("Privado", "", "");
}

function filterTotal(event) {
  event.preventDefault();
  filter("Privado", "Amigos", "Público");
}

function posts(post, likes, filterPost, datePost, key) {
  $("#post-total-filter").prepend(`
    <article class="form-group">
     <div id="post" class="list-group-item well">
      <p class="text-justify text" id="text-post" data-text-id=${key}>${post}</p>
       <div class="row align-items-end">
        <div class="col-xs-6">
         <p class="text-muted text-min" data-date-id=${key}>${datePost}</p>
         <p class="text-muted text-min" data-filter-id=${key}>Post ${filterPost}</p>
       </div>
      </div>
     </div>
     <button type="button" class="btn btn-primary edit" data-edit-id=${key} data-toggle="modal" data-target="#myModal"><i class="far fa-edit"></i></button>
     <button type="button" class="btn btn-primary " data-delete-id=${key} data-toggle="modal" data-target="#myModal-delete"><i class="far fa-trash-alt"></i></button>
     <button type="button" class="btn btn-primary" data-like-id=${key}><i class="far fa-thumbs-up"></i> <span data-like-id=${key} id="likes">${likes}</span> </button>
    </article>
`);
}

function filterPosts(post, likes, filterPost, datePost, key) {
  $("#post-total, #container-post").empty();
  posts(post, likes, filterPost, datePost, key);
  const oldText = $("#text-post").text();
  likePost(key);
  editPost(key, oldText);
  postDelete(key);
}

function creatPost(post, likes, filterPost, datePost, key) {
  posts(post, likes, filterPost, datePost, key);
  const oldText = $(`p[data-text-id=${key}]`).text();
  likePost(key);
  editPost(key, oldText);
  postDelete(key);
}

function likePost(key) {
  let count = 0;
  $(`button[data-like-id=${key}]`).click(function (event) {
    event.preventDefault();
    count += 1;
    let newLike = parseInt($(`span[data-like-id=${key}]`).text()) + 1;
    $(`span[data-like-id=${key}]`).text(newLike);
    database.ref("tasks/" + USER_ID + "/" + key).update({
      likes: newLike
    });
  });
}

function editPost(key, oldText) {
  $(`button[data-edit-id=${key}]`).click(function (event) {
    event.preventDefault();
    $("#myModal").html(`
        <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Edite seu post</h4>
                <button type="button" class="close" data-dismiss="modal">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                <textarea class="form-control" id="text-edit">${oldText}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="btn-edit" class="btn btn-primary" data-dismiss="modal">OK</button>
            </div>

        </div>
       </div>
        `);
    $("#btn-edit").click(function (event) {
      event.preventDefault();
      const newText = $("#text-edit").val();
      const newDate = time();
      $(`p[data-text-id=${key}]`).text(newText);
      $(`p[data-date-id=${key}]`).text(newDate);
      database.ref("tasks/" + USER_ID + "/" + key).update({
        text: newText,
        date: newDate
      });
    });
  });
}

function postDelete(key) {
  $(`button[data-delete-id=${key}]`).click(function (event) {
    event.preventDefault();
    $("#btn-delete").click(function (event) {
      event.preventDefault();
      $(`button[data-delete-id=${key}]`).parent().remove();
      database.ref("tasks/" + USER_ID + "/" + key).remove();
    });
  });
}

function disableBtn() {
  if ($("#public").val().length <= 0) {
    $("#btnpost").prop("disabled", true);
  } else {
    $("#btnpost").prop("disabled", false);
  }
}

function newPost(event) {
  event.preventDefault();
  const post = $("#public").val();
  const postLikes = 0;
  const datePost = time();
  const selectPost = $("#select-post option:selected").text();
  const newPost = database.ref("tasks/" + USER_ID).push({
    comments: "",
    text: post,
    likes: 0,
    filter: selectPost,
    date: time()
  });
  creatPost(post, postLikes, selectPost, datePost, newPost.key);
  $("#btnpost").prop("disabled", true);
  $("form")[0].reset();
}

function signOut(event) {
  event.preventDefault();
  firebase.auth().signOut()
    .then(function () {
      window.location = "index.html";
    }).catch(function (error) {
      alert(error.message);
    });
}

function returnHome(event) {
  event.preventDefault();
  window.location = "timeline.html?id=" + USER_ID;
}

function returnProfile(event) {
  event.preventDefault();
  window.location = "profile.html?id=" + USER_ID;
}

function time() {
  const today = new Date();
  const year = today.getFullYear();
  const day = today.getDate();
  const month = today.getMonth();
  const timeToday = " " + day + "/" + (month + 1) + "/" + year;
  return timeToday;
}

