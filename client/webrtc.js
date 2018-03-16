var hasTwoCameras;
var localVideo;
var localVideo2;
var localStream;
var localStream2;
var remoteVideo;
var remoteVideo2;
var peerConnection;
var uuid;
var serverConnection;
var startButton;
var stopButton;
var ringButton;

var peerConnectionConfig = {
  'iceServers': [
//    {'urls': 'stun.stunprotocol.org:3478'},
//    {'urls': 'stun:stun.l.google.com:19302'},
//{
//	urls: 'turn:numb.viagenie.ca',
//	credential: 'muazkh',
//	username: 'webrtc@live.com'
//},
{
	urls: 'turn:e2.xirsys.com:80?transport=udp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},
{
	urls: 'turn:e2.xirsys.com:3478?transport=udp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},
{
	urls: 'turn:e2.xirsys.com:80?transport=tcp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},
{
	urls: 'turn:e2.xirsys.com:3478?transport=tcp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},
{
	urls: 'turns:e2.xirsys.com:443?transport=tcp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},
{
	urls: 'turns:e2.xirsys.com:5349?transport=tcp',
	credential: 'ddd0e568-2779-11e8-9791-09c386c85a7a',
	username: 'ddd0e4e6-2779-11e8-9944-0f93708d672c'
},

{'urls': 'stun:stunserver.org:3478'},
{'urls':'stun:stun.l.google.com:19302'},
{urls:'stun:stun1.l.google.com:19302'},
{urls:'stun:stun2.l.google.com:19302'},
{urls:'stun:stun3.l.google.com:19302'},
{urls:'stun:stun4.l.google.com:19302'},
/*{
    urls: 'turn:turn.bistri.com:80',
    credential: 'homeo',
    username: 'homeo'
 },
 {
    urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
    credential: 'webrtc',
    username: 'webrtc'
}*/
/*{
	urls: 'turn:192.158.29.39:3478?transport=udp',
	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	username: '28224511:1379330808'
},
{
	urls: 'turn:192.158.29.39:3478?transport=tcp',
	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	username: '28224511:1379330808'
}*/
  ]
};

var sound = new Howl({
  src: ['ring.mp3'],
  loop: true,
  volume: 0.5,
});

var cams;
var camIds;

function getCameraIDs()
{
  navigator.mediaDevices.enumerateDevices().then(function(devices)
  {
    cams =  _.filter(devices, function(e){ //only return video elements
      return e.kind === 'videoinput'; });
    camIds = _.map(cams, function (e) { // return only ids
      return e.deviceId;
    });
  hasTwoCameras = false;
  if (camIds.length > 1)
  { hasTwoCameras = true };

  });
 }

function pageReady() {
  uuid = createUUID();

  getCameraIDs();
  localVideo = document.getElementById('localVideo');
  localVideo2 = document.getElementById('localVideo2');
  remoteVideo = document.getElementById('remoteVideo');
  remoteVideo2 = document.getElementById('remoteVideo2');
  startButton = document.getElementById('start');
  stopButton = document.getElementById('stop');
  ringButton = document.getElementById('ring');
  startButton.style.display = 'none';
  stopButton.style.display = 'none';
  ringButton.style.display = 'block';
  serverConnection = new WebSocket('wss://' + window.location.hostname + ':443');
  serverConnection.onmessage = gotMessageFromServer;

  var constraints = {
    /*video: {
      deviceId: camIds[0]
	},*/
    video: true,
    audio: true,
  };


  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
  } else {
    alert('Your browser does not support getUserMedia API');
  }

}

function getUserMediaSuccess(stream) {
  localStream = stream;
  localVideo.srcObject = stream;

  addCamera();
}

function addCamera(){

  var constraints = {
    video: {
      deviceId: { exact: camIds[1] }},
      audio: false,
  };
 
  if(hasTwoCameras){
  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess2).catch(errorHandler);
  } else {
	alert('GetUserMedia2 failed');
 }
 }
}

function getUserMediaSuccess2(stream) {
	localStream2 = stream;
	localVideo2.srcObject = stream;
}

function startRing() {
  if(ringButton.value == "Call")
  {
    serverConnection.send(JSON.stringify({'turnly': 'startCall', 'uuid': uuid}));
    ringButton.value = "Stop";
  } else {
    serverConnection.send(JSON.stringify({'turnly': 'stopCall', 'uuid': uuid}));
    ringButton.value = "Call";
  }
}


function startCall() {
  start(true);	  
  startButton.style.display = 'none';
}

function stopCall() {
  serverConnection.send(JSON.stringify({'turnly': 'stopCall', 'uuid': uuid}));
  sound.stop();
  ringButton.value = "Call";
  ringButton.style.display = 'block';
  startButton.style.display = 'none';
  stopButton.style.display = 'none';
}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ontrack = gotRemoteStream;
  peerConnection.addStream(localStream);
  if(hasTwoCameras){
  	peerConnection.addTrack(localStream2, localStream);
  }
  if(isCaller) {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
  }
}

function gotMessageFromServer(message) {
  if(!peerConnection) start(false);

  var signal = JSON.parse(message.data);

  // Ignore messages from ourself
  if(signal.uuid == uuid) return;

  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
      // Only create answers in response to offers
      if(signal.sdp.type == 'offer') {
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
      }
    }).catch(errorHandler);
  } else if(signal.ice) {
    console.log("Adding ICE candidate");
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
  } else if(signal.turnly == 'startCall') {
	console.log("received start call message");
	sound.play();
    ringButton.style.display = 'none';
    startButton.style.display = 'block';
    stopButton.style.display = 'block';
  } else if(signal.turnly == 'stopCall') {
	console.log("received stop call message");
	sound.stop();
    ringButton.value = "Call";
    ringButton.style.display = 'block';
    startButton.style.display = 'none';
    stopButton.style.display = 'none';
  }
}

function gotIceCandidate(event) {
  if(event.candidate != null) {
    console.log("gotIceCandidate");
    serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
  }
}

function createdDescription(description) {
  console.log('got description');

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
  }).catch(errorHandler);
}

var videoStreamCount = 0;

function gotRemoteStream(event) {
  console.log('got remote stream');
  if(videoStreamCount === 0)
    {
     console.log('remote stream 1');
     remoteVideo.srcObject = event.streams[0];
     videoStreamCount += 1;
    }
  else if (videoStreamCount === 1)
    {
     console.log('remote stream 2');
     remoteVideo2.srcObject = event.streams[0];
     videoStreamCount += 1;
    }
}

function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
