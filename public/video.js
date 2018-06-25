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