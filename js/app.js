window.id = uuidv4();

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function notificationInit() {
  window.notificationCenterId = [];
  window.notificationCenterTitle = [];
  window.notificationCenterType = [];
  window.notificationCenterMessage = [];
  $('#navbar-badge-notification').text("0");
  $("#navbar-badge-notification").removeClass("text-warning");
  $('.label').removeClass("text-success");
  $('.badge').removeClass("badge-success");
}

function notificationCreate(id, msg, title, type) {
  window.notificationCenterId.push(id)
  window.notificationCenterMessage.push(msg);
  window.notificationCenterTitle.push(title);
  window.notificationCenterType.push("text-" + type);
  $('#navbar-badge-notification').addClass(type);
  $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
}

function notificationTmpl(notif) {
  return ({
    delay: 1000,
    timer: 1000,
    offset: {
      y: 50,
      x: 20
    },
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    type: window.notificationCenterType[notif],
    placement: {
      from: 'top',
      align: 'left'
    },
    template: NotifyTemplate
  });
}

function notificationDown(socket) {
  if (socket.status === "down") return;
  $('#navbar-badge-notification').removeClass('text-success').addClass('text-danger');
  notificationCreate(uuidv4(), "Lost Connection to Server ", 'System: ', 'danger');
  socket.status = "down";
}

function informShow(msg, close = true) {
  $("#InformationModalText").html(msg);
  $("#InformationModal").modal("show");
  $("#InformationModalCloseBtn").attr("disabled", close);
  if (close) setTimeout(function() {
    $("#InformationModal").modal('hide');
  }, 1500);
}

function questionShow(msg, btnmsg) {
  $("#QuestionModalYesBtn").attr('disabled', false);
  $("#QuestionModalYesBtn").unbind("click");
  $("#QuestionModalYesBtn").text(btnmsg);
  $("#QuestionModalText").html(msg);
  $("#QuestionModal").modal("show");
}

console.log("%cClose the console and shaq !", "color: blue; font-size: 28px");
notificationInit();
if (localSettings.themeSettings !== "Default") {
  $('#theme-css').attr('href', auth.app.css.substr(0, auth.app.css.lastIndexOf("/")) + '/' + localSettings.themeSettings + '.css');
} else {
  $('#theme-css').attr('href', auth.app.css + 'default.css');
}

$('#alert-target').on('click', function() {
  if (notificationCenterMessage.length < 20) {
    for (var notification in notificationCenterMessage) {
      $.notify({
        icon: 'glyphicon glyphicon-' + window.notificationCenterType[notification] + '-sign',
        title: window.notificationCenterTitle[notification],
        message: window.notificationCenterMessage[notification]
      }, notificationTmpl(notification));
    }
  } else {
    $.notify({
      icon: 'glyphicon glyphicon-warning-sign',
      title: "Oops : ",
      message: "Messages can not been displayed."
    }, notificationTmpl(notification));
  }
  notificationInit();
  socket.emit('notification', {
    "type": "notification",
    "user": auth.auth.username,
    "action": "clear"
  });
});

socket.on('connect', function(msg) {
  socket.status = "up";
  $('#navbar-badge-notification').removeClass('text-danger').addClass('text-success');
  notificationCreate(uuidv4(), "Connection to Server is Ok", 'System: ', 'success');
});

socket.on('disconnected', function() {
  notificationDown(socket);
});

socket.on('connect_error', function() {
  notificationDown(socket);
});

socket.on(auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  let statusMessage = "";
  switch (msg.type) {
    case "config":
      notificationCreate(msg.action, "New config loaded", 'Config: ', 'warning');
      break;
    case "notification":
      switch (msg.action) {
        case "clear":
          notificationInit();
          break;
        case "archive":
          break;
        case "mailsupport":
          break;
        case "discordTest":
          break;
        default:
          if (!window.notificationCenterId.includes(msg.id)) notificationCreate(msg.id, msg.message, 'Notification for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank"> : ' + msg.key + ' </a>: ', 'info');
          break;
      }
      break;
    case "message":
      if (!window.notificationCenterId.includes(msg.id)) notificationCreate(msg.id, msg.message, 'Message for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank"> : ' + msg.key + ' </a>: ', 'info');
      break;
    case "bid":
      switch (msg.status) {
        case "created":
        case "running":
          statusMessage = 'Bid created for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
          break;
        case "cancelled":
          statusMessage = 'Bid cancelled for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
          break;
        case "declined":
          statusMessage = 'Bid declined for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
          break;
        case "accepted":
          statusMessage = 'Bid accepted for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
          break;
        case "expired":
          statusMessage = 'Bid expired for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
          break;
        default:
          break;
      }
      notificationCreate(uuidv4(), statusMessage, 'Bid: ', 'info');
      $('span[data-id=' + msg.key + ']').addClass('label-success');
      break;
    case "auction":
      switch (msg.status) {
        case "running":
          if (!msg.bestbid || msg.bestbid == "") statusMessage = 'Auction created for <a href="/' + auth.usercode + '/display/' + msg.key + '" target="_blank">' + msg.name + '</a>';
          break;
        case "expired":
          statusMessage = "Auction expired for " + msg.name;
          break;
        case "completed":
          statusMessage = "Auction completed for " + msg.name;
          break;
        default:
          break;
      }
      if (statusMessage !== "") notificationCreate(uuidv4(), statusMessage, 'Auction: ', 'success');
      break;
    case "transport":
      switch (msg.status) {
        case "planned":
          statusMessage = 'Transort created for <a href="/' + auth.usercode + '/track?key=' + msg.key + '" target="_blank">' + msg.name + '</a>';
          break;
        case "expired":
          statusMessage = "Transort expired for " + msg.key;
          break;
        case "arrived":
          statusMessage = "Transort arrived for " + msg.key;
          break;
        default:
          break;
      }
      if (statusMessage !== "") notificationCreate(uuidv4(), statusMessage, 'Auction: ', 'success');
      break;
    default:
      break;
  }
  if (localSettings.autoNotify && window.notificationCenterMessage.length > 0) $('#alert-target').click();
});
