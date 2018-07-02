var connection = new RTCMultiConnection();

connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.session = {
    audio: true,
    video: true
};

connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true,
};

var localVideosContainer = document.getElementById('local-video-container');
var remoteVideosContainer = document.getElementById('remote-video-container'); 

connection.onstream = function(event) {
  var video = event.mediaElement;

  if(event.type === 'local') {
    localVideosContainer.appendChild( video );
  }

  if(event.type === 'remote') {
    remoteVideosContainer.appendChild( video );
  }
};

var roomid = document.getElementById('txt-roomid');

roomid.value = connection.token();

document.getElementById('btn-open-or-join-room').onclick = function () {
  this.disabled = true;

  connection.openOrJoin(roomid.value || 'predefined-roomid');
};

$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

$('#download-button').on('click', function () {
  $('#index-banner').hide();
  $('.home-hide').hide();
  $('.page-footer').hide();  
  $('.login-page').show();
});

function getTokenFromApi(username, password, callback) {
  const settings = {
    url: '/api/auth/login',
    data: {      
      username: `${username}`,
      password: `${password}`
    },
    dataType: 'json',
    type: 'POST',
    success: callback,
    error: loginError
  };
  $.ajax(settings);
}

function displayVideoRoom(data) {
  $('.video-room').show();  
  $('#nav-username').html(`Howdy ${data.userDisplay.username}!`);
  $('#sidenav-username').html(`Howdy ${data.userDisplay.username}!`);
  $('#nav-logout').html(`Logout`);
  $('#sidenav-logout').html(`Logout`);    
  $('.profile').html(`
    <script>
      $(document).ready(function(){
      $('.modal').modal();
      $('.sidenav').sidenav();      
      });
    </script>
    <a href="#modal1" class="btn waves-effect modal-trigger">Update Email</a>
    <a href="#modal2" class="btn waves-effect red modal-trigger">Delete Account</a>
    <div id="modal1" class="modal teal lighten-2">
      <div class="modal-content">
        <h5 id="change-email-message">Update Email</h5>
        <form class="form register-form-new">      
          <input id="current-email" value="current email: ${data.userDisplay.email}" disabled />
          <input id="new-email" type="email" placeholder="new email" class="emailNewUpdate" required />      
          <button type="submit" class="update-profile">Update Email</button>            
        </form>
      </div>
      <div class="modal-footer teal lighten-2">
        <a href="#!" class="modal-close waves-effect waves-green btn red">Close</a>
      </div>
    </div>
    <div id="modal2" class="modal teal lighten-2">
      <div class="modal-content">
        <div id="delete-error"></div>
        <h4>Your account will be deleted!</h4>
        <button type="submit" class="btn red" id="delete-profile">Delete Account</button>
      </div>
      <div class="modal-footer teal lighten-2">
        <a href="#!" class="modal-close waves-effect teal darken-4 btn">Close</a>
      </div>
    </div>
  `);
   $('.register-form-new').submit(function(event){
      event.preventDefault();
      const authToken = data.authToken;
      const username = data.userDisplay.username;      
      const email = $('.emailNewUpdate').val();      
      updateProfile(username, email, authToken, displayUpdatedProfile);
   });
  $('#delete-profile').on('click', function (event){
    event.preventDefault();
    const authToken = data.authToken;
    const username = data.userDisplay.username;
    deleteProfile(username, authToken, displayDeletedProfile);
  });  
  $('#btn-open-or-join-room').on('click', function (event) {
  event.preventDefault();
  $('.profile').hide();
  $('.share-room').hide();
  $('.edit-profile').hide();
  $('.login-page').hide();
  $('#close-room-btn').show();
  $('#btn-open-or-join-room').html(`Your roomID`);
      $('#close-room-btn').on('click', function(){
        connection.attachStreams.forEach(function(localStream) {
        localStream.stop();
      });
    connection.close();
    $('.profile').show();
    $('.share-room').show();
    $('.login-page').hide();
    $('#btn-open-or-join-room').prop('disabled', false);
    $('#btn-open-or-join-room').html(`Open Or Join Room`);
    $('#close-room-btn').hide();
  });
});
 $('#nav-logout').on('click', function(){
    connection.attachStreams.forEach(function(localStream) {
    localStream.stop();
  });
    connection.close();
    $('.profile').show();
    $('.share-room').show();
    $('.login-page').hide();
    $('#btn-open-or-join-room').prop('disabled', false);
    $('#btn-open-or-join-room').html(`Open Or Join Room`);
    $('#close-room-btn').hide();
    
    $('.video-room').hide();  
    $('.login-page').show();
    $('#nav-username').html('');
    $('#sidenav-username').html('');
    $('#nav-logout').html('');
    $('#sidenav-logout').html('');
    $('.new-user').html('');
   });
 $('#sidenav-logout').on('click', function(){
    connection.attachStreams.forEach(function(localStream) {
    localStream.stop();
  });
    connection.close();

    $('.profile').show();
    $('.share-room').show();
    $('.login-page').hide();
    $('#btn-open-or-join-room').prop('disabled', false);
    $('#btn-open-or-join-room').html(`Open Or Join Room`);
    $('#close-room-btn').hide();

    $('.video-room').hide();
    $('.login-page').show();
    $('#nav-username').html('');
    $('#sidenav-username').html('');
    $('#nav-logout').html('');
    $('#sidenav-logout').html('');
    $('.new-user').html('');
   });
}

function displayDeletedProfile(data) {  
  location.reload();
}

function displayUpdatedProfile(data) {   
  const email = $('#new-email').val();  
  $('#new-email').val('');
  $('#change-email-message').html(`Your email has been updated to ${email}`);
  $('#current-email').val(`current email: ${email}`);
}

function deleteProfile(username, authToken, callback) {
 const settings = {
    url: '/api/protected/',
    data: {      
      username: `${username}`
    },
    headers: {      
      authorization: `Bearer ${authToken}`     
   },
    dataType: 'json',
    type: 'DELETE',
    success: callback,
    error: deleteError
  };
  $.ajax(settings); 
}

function deleteError(error) {
  $('#delete-error').html(`Something went wrong!`);
}

function updateProfile(username, email, authToken, callback) {
 const settings = {
    url: '/api/protected/',
    data: {      
      username: `${username}`,      
      email: `${email}`
    },
    headers: {      
      authorization: `Bearer ${authToken}`     
   },
    dataType: 'json',
    type: 'PUT',
    success: callback,
    error: updateProfileError
  };
  $.ajax(settings); 
}

function updateProfileError(error) {
  $('.register-form-new').html(`Something went wrong!`);    
}

function displayApiData(data){
  var authToken = `${data.authToken}`
  $('.login-page').hide();
  displayVideoRoom(data, authToken);
}

function displayNewUserData(data){
  $('.new-user').show();
  $('.new-user').html(`${data.username} is registered! You can now login`);
  $('.register-form').hide();
  $('.login-form').show();
}

function createNewUser(username, password, email, callback) {
  const settings = {
    url: '/api/users/',
    data: {      
      username: `${username}`,
      password: `${password}`,
      email:`${email}`
    },
    dataType: 'json',
    type: 'POST',
    success: callback,
    error: newUserError
  };
  $.ajax(settings);
}

function loginError (error) {  
  $('.new-user').show();  
  $('.new-user').html(`Check your username/password and try again!`);  
}

function newUserError (error) {  
  $('.new-user').show();  
  $('.new-user').html(`${error.responseJSON.message}`);  
}

function watchSignUp() {
  $('.register-form').on('submit', function(event) {
    event.preventDefault();
    var username = $('.usernameNew').val();
    const password = $('.passwordNew').val();
    var email = $('.emailNew').val();
    $('.usernameNew').val('');
    $('.passwordNew').val('');
    $('.emailNew').val('');
    createNewUser(username, password, email, displayNewUserData);
  });
}

function watchSubmit () {
  $('.login-form').on('submit', function (event){
    event.preventDefault();    
    const username = $('.username').val();
    const password = $('.password').val();
    $('.username').val('');
    $('.password').val('');
    getTokenFromApi(username, password, displayApiData);    
  });
}

watchSubmit();
watchSignUp(); 