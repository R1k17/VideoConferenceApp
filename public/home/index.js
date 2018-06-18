//var authToken;
//var username;
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
});

$('#btn-open-or-join-room').on('click', function (event) {
  event.preventDefault();
  $('.profile').hide();
  $('.share-room').hide();
  $('.edit-profile').hide();
  $('.login-page').hide();
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
    error: error
  };
  $.ajax(settings);
}

function error () {  
  $('.results').show();
  $('.results').html(`<h2>Check your username/password and try again!</h2>`);  
}

function displayVideoRoom(data, authToken) {
  $('.video-room').show();
  $('.profile').html(`
    <h3>Welcome ${data.userDisplay.username}</h3>    
    <button class="button edit-profile">Update Email</button>
    <button type="submit" class="button delete-profile">Delete Account</button>    
    `
    );
  $('.edit-profile').on('click', function (event) {
    event.preventDefault();    
    $('.profile-new').toggle(function () {
      $('.profile-new').html(`    
    <form class="form register-form-new">      
      <input type="email" value="current email: ${data.userDisplay.email}" disabled />
      <input type="email" placeholder="new email" class="emailNewUpdate" required />      
      <button type="submit" class="update-profile">Update Email</button>            
    </form>
    `)

   $('.update-profile').on('click', function(){
      const username = data.userDisplay.username      
      const email = $('.emailNewUpdate').val();      
      updateProfile(username, email, authToken, displayUpdatedProfile);
   })     
    })
  });
}

function displayUpdatedProfile(data) {
  $('.profile-new').html(`Your new email is ${data.email}`)
}

function updateProfile(username, email, authToken, callback) {
 const settings = {
    url: '/api/protected',
    data: {      
      username: `${username}`,      
      email: `${email}`,
    headers: {      
      authorization: `Bearer ${authToken}`
    }, 
   },
    dataType: 'json',
    type: 'PUT',
    success: callback,
    error: error
  };
  $.ajax(settings); 
}

function displayApiData(data){
  var authToken = `${data.authToken}`
  $('.login-page').hide();
  displayVideoRoom(data, authToken);
  
  //accessProtectedRoute(authToken, displaySecretData);
  //$('.results').html(authToken);
}

function displaySecretData (data) {  
  $('.protected').html(`${data.data}`);
}

function accessProtectedRoute(authToken, callback) {
  const settings = {
    url: '/api/protected/',
    headers: {      
      authorization: `Bearer ${authToken}`
    },
    dataType: 'json',
    type: 'get',
    success: callback,
    error: error
  };
  $.ajax(settings);
}



function displayNewUserData(data){
  $('.new-user').html(`${data.username} is registered! You can now login`);
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
    error: error
  };
  $.ajax(settings);
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
    $('.results').hide();
    const username = $('.username').val();
    const password = $('.password').val();
    $('.username').val('');
    $('.password').val('');
    getTokenFromApi(username, password, displayApiData);    
  });
}
watchSubmit();
watchSignUp(); 