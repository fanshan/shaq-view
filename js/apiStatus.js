function status429() {
  $("#InformationModal").modal('hide');
  $("#QuestionModal").modal('hide');
  $('#CenterPage').hide();
  $('#not-found-message-text').html('You have reached your limit... <br>Upgrade your plan or Wait a minute...<br>');
  $('#not-found-message').removeClass('hide');
}

function status401() {
  window.location.replace("/error401.html");
}

function status403() {
  window.location.replace("/error403.html");
}

function status404() {
  window.location.replace("/error404.html");
}

function status406() {
  informShow("Oops... Something Wrong happen !", false);
}

function status500() {
  window.location.replace("/error500.html");
}
