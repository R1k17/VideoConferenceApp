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

$('.button').on('click', function () {
  $('.home').hide();  
  $('.login-page').show();
  $('.navbar-fixed').show();
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
  $('#nav-logout').html(`Logout`);    
  $('.profile').html(`
    <script>
      $(document).ready(function(){
      $('.modal').modal();      
      });
    </script>
    <a href="#modal1" class="btn waves-effect modal-trigger">Update Email</a>
    <a href="#modal2" class="btn waves-effect red modal-trigger">Delete Account</a>
    <div id="modal1" class="modal teal lighten-2">
      <div class="modal-content">
        <h5>Update Email</h5>
        <form class="form register-form-new">      
          <input id="current-email" value="current email: ${data.userDisplay.email}" disabled />
          <input id="new-email" type="email" placeholder="new email" class="emailNewUpdate" required />      
          <button type="submit" class="update-profile">Update Email</button>            
        </form>
        <div id="change-email-message"></div>
      </div>
      <div class="modal-footer teal lighten-2">
        <a href="#!" class="modal-close waves-effect waves-green btn red">Close</a>
      </div>
    </div>
    <div id="modal2" class="modal teal lighten-2">
      <div class="modal-content">
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
  $('#btn-open-or-join-room').html(`Your roomID`);
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
  console.log(error);
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
  $('.new-user').html(`<div class="card-panel teal lighten-2">Check your username/password and try again!</div>`);  
}

function newUserError (error) {  
  $('.new-user').show();  
  $('.new-user').html(`<h2>${error.responseJSON.message}</h2>`);  
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