const socket = io();

const myFace = document.querySelector("#myFace"); // 사이드 화면들
const myFace2 = document.querySelector("#myFace2"); // 가운데 큰 화면
const muteBtn = document.querySelector("#mute");
const muteIcon = muteBtn.querySelector(".muteIcon");
const unMuteIcon = muteBtn.querySelector(".unMuteIcon");
const cameraBtn = document.querySelector("#camera");
const cameraIcon = cameraBtn.querySelector(".cameraIcon");
const unCameraIcon = cameraBtn.querySelector(".unCameraIcon");
const camerasSelect = document.querySelector("#cameras");
const screenBtn = document.querySelector("#screen");
const screenIcon = document.querySelector(".screenIcon");
const unScreenIcon = document.querySelector(".unScreenIcon");

const call = document.querySelector("#call");
const welcome = document.querySelector("#welcome");

const HIDDEN_CN = "hidden";

var globalDivId = new Array()

let myStream;
let muted = true;
unMuteIcon.classList.add(HIDDEN_CN);
let cameraOff = false;
unCameraIcon.classList.add(HIDDEN_CN);
//
let screenShareGreen = true;
unScreenIcon.classList.add(HIDDEN_CN);

let roomName = "";
let nickname = "";
let peopleInRoom = 1;

let pcObj = {
  // remoteSocketId: pc
};

// screen공유 관련 추가 작성
let shared = true;


async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks();
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      if (currentCamera.label == camera.label) {
        option.selected = true;
      }

      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}


async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );

    // stream을 mute하는 것이 아니라 HTML video element를 mute한다.
    myFace.srcObject = myStream;
    myFace.muted = true
	//

    if (!deviceId) {
      // mute default
      myStream //
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));

      await getCameras();
		
    }
  } catch (error) {
    console.log(error);
  }
}

/*
// 화면 공유
async function getMedia(deviceId) {
	const shareScreen = () => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: { cursor: 'always' },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      .then((stream) => {
        myVideo.current.srcObject = stream; // 내 비디오 공유 화면으로 변경
        const videoTrack = stream.getVideoTracks()[0];
        connectionRef.current
          .getSenders()
          .find((sender) => sender.track.kind === videoTrack.kind)
          .replaceTrack(videoTrack);
        videoTrack.onended = function () {
          const screenTrack = userStream.current.getVideoTracks()[0];
          connectionRef.current
            .getSenders()
            .find((sender) => sender.track.kind === screenTrack.kind)
            .replaceTrack(screenTrack);
          stream.getTracks().forEach((track) => track.stop());
          myVideo.current.srcObject = userStream.current; // 내 비디오로 변경
        };
      });
  };
}
*/

function handleMuteClick() {
  myStream //
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (muted) {
    unMuteIcon.classList.remove(HIDDEN_CN);
    muteIcon.classList.add(HIDDEN_CN);
    muted = false;
  } else {
    muteIcon.classList.remove(HIDDEN_CN);
    unMuteIcon.classList.add(HIDDEN_CN);
    muted = true;
  }
}

function handleCameraClick() {
  myStream //
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraIcon.classList.remove(HIDDEN_CN);
    unCameraIcon.classList.add(HIDDEN_CN);
    cameraOff = false;
  } else {
    unCameraIcon.classList.remove(HIDDEN_CN);
    cameraIcon.classList.add(HIDDEN_CN);
    cameraOff = true;
  }
}

async function handleCameraChange() {
  try {
    await getMedia(camerasSelect.value);
    if (peerConnectionObjArr.length > 0) {
      const newVideoTrack = myStream.getVideoTracks()[0];
      peerConnectionObjArr.forEach((peerConnectionObj) => {
        const peerConnection = peerConnectionObj.connection;
        const peerVideoSender = peerConnection
          .getSenders()
          .find((sender) => sender.track.kind == "video");
        peerVideoSender.replaceTrack(newVideoTrack);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
screenBtn.addEventListener("click", startCapture);


// 화면 공유~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Screen Sharing

let captureStream = null;
async function startCapture() {

	if (screenShareGreen) {
		unScreenIcon.classList.remove(HIDDEN_CN);
		screenIcon.classList.add(HIDDEN_CN);
		screenShareGreen = false;
		try {
			myScreen = await navigator.mediaDevices.getDisplayMedia({ // myStream
				video: true,
				audio: true,
			});
			myFace.srcObject = myScreen;
			if (pcObj) {
				const newVideoTrack = myScreen.getVideoTracks()[0];
				for (var key in pcObj) {
				  //console.log(pcObj[key]);
				  const peerConnection = pcObj[key];
				  const peerVideoSender = peerConnection
				  .getSenders()
				  .find((sender) => sender.track.kind == "video");
				peerVideoSender.replaceTrack(newVideoTrack);
				}
			}
		} catch (error) {
			console.error(error);
		}
	} else {
		screenIcon.classList.remove(HIDDEN_CN);
		unScreenIcon.classList.add(HIDDEN_CN);
		screenShareGreen = true;
		try {
			const screenTrack = myStream.getVideoTracks()[0];
			for (var key in pcObj) {
				const userConnection = pcObj[key];
				const peerVideoSender = userConnection
					.getSenders()
					.find((sender) => sender.track.kind == "video");
				peerVideoSender.replaceTrack(screenTrack);
				myScreen.getTracks().forEach((track) => track.stop());
				myFace.srcObject = myStream; // 내 비디오로 변경
			}
		} catch (error) {
			console.error(error);
		}
	} 
} 

// 전체화면 코드
const FullBtn = document.querySelector("#fullScreen");

FullBtn.addEventListener("click", toggleFullScreen);

function toggleFullScreen() {
  if (!myFace2.fullscreenElement) {
    myFace2.requestFullscreen(); // myFace2.documentElement.requestFullscreen();
  } else {
    if (myFace2.exitFullscreen) {
      myFace2.exitFullscreen();
    }
  }
}
	

// Welcome Form (choose room)

call.classList.add(HIDDEN_CN);
// welcome.hidden = true;

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.classList.remove(HIDDEN_CN);
  await getMedia();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();

  if (socket.disconnected) {
    socket.connect();
  }

  const welcomeRoomName = welcomeForm.querySelector("#roomName");
  const welcomeNickname = welcomeForm.querySelector("#nickname");
  const nicknameContainer = document.querySelector("#userNickname");
  roomName = welcomeRoomName.value;
  welcomeRoomName.value = "";
  nickname = welcomeNickname.value;
  welcomeNickname.value = "";
  nicknameContainer.innerText = nickname;
  socket.emit("join_room", roomName, nickname);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Chat Form

const chatForm = document.querySelector("#chatForm");
const chatBox = document.querySelector("#chatBox");

const MYCHAT_CN = "myChat";
const NOTICE_CN = "noticeChat";

chatForm.addEventListener("submit", handleChatSubmit);

function handleChatSubmit(event) {
  event.preventDefault();
  const chatInput = chatForm.querySelector("input");
  const message = chatInput.value;
  chatInput.value = "";
  socket.emit("chat", `${nickname}: ${message}`, roomName);
  writeChat(`You: ${message}`, MYCHAT_CN);
}

function writeChat(message, className = null) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.innerText = message;
  li.appendChild(span);
  li.classList.add(className);
  chatBox.prepend(li);
}

// Leave Room

const leaveBtn = document.querySelector("#leave");

function leaveRoom() {
  socket.disconnect();
  //alert(globalDivId[0]); // // //
  call.classList.add(HIDDEN_CN);
  welcome.hidden = false;
  //
  

  peerConnectionObjArr = [];
  peopleInRoom = 1;
  nickname = "";

  myStream.getTracks().forEach((track) => track.stop());
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";

  myFace.srcObject = null;
  clearAllVideos();
  clearAllChat();
}

function removeVideo(leavedSocketId) {
  const streams = document.querySelector("#videoList");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id === leavedSocketId) {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllVideos() {
  const streams = document.querySelector("#videoList");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id != "myStream") {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllChat() {
  const chatArr = chatBox.querySelectorAll("li");
  chatArr.forEach((chat) => chatBox.removeChild(chat));
}

leaveBtn.addEventListener("click", leaveRoom);

// Modal code

const modal = document.querySelector(".modal");
const modalText = modal.querySelector(".modal__text");
const modalBtn = modal.querySelector(".modal__btn");

function paintModal(text) {
  modalText.innerText = text;
  modal.classList.remove(HIDDEN_CN);

  modal.addEventListener("click", removeModal);
  modalBtn.addEventListener("click", removeModal);
  document.addEventListener("keydown", handleKeydown);
}

function removeModal() {
  modal.classList.add(HIDDEN_CN);
  modalText.innerText = "";
}

function handleKeydown(event) {
  if (event.code === "Escape" || event.code === "Enter") {
    removeModal();
  }
}

// Socket code

socket.on("reject_join", () => {
  // Paint modal
  paintModal("Sorry, The room is already full.");

  // Erase names
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";
  roomName = "";
  nickname = "";
});

socket.on("accept_join", async (userObjArr) => {
  await initCall();

  const length = userObjArr.length;
  if (length === 1) {
    return;
  }

  writeChat("Notice!", NOTICE_CN);
  for (let i = 0; i < length - 1; ++i) {
    try {
      const newPC = createConnection(
        userObjArr[i].socketId,
        userObjArr[i].nickname
      );
      const offer = await newPC.createOffer();
      await newPC.setLocalDescription(offer);
      socket.emit("offer", offer, userObjArr[i].socketId, nickname);
      writeChat(`__${userObjArr[i].nickname}__`, NOTICE_CN);
    } catch (err) {
      console.error(err);
    }
  }
  writeChat("is in the room.", NOTICE_CN);
});

socket.on("offer", async (offer, remoteSocketId, remoteNickname) => {
  try {
    const newPC = createConnection(remoteSocketId, remoteNickname);
    await newPC.setRemoteDescription(offer);
    const answer = await newPC.createAnswer();
    await newPC.setLocalDescription(answer);
    socket.emit("answer", answer, remoteSocketId);
    writeChat(`notice! __${remoteNickname}__ joined the room`, NOTICE_CN);
  } catch (err) {
    console.error(err);
  }
});

socket.on("answer", async (answer, remoteSocketId) => {
  await pcObj[remoteSocketId].setRemoteDescription(answer);
});

socket.on("ice", async (ice, remoteSocketId) => {
  await pcObj[remoteSocketId].addIceCandidate(ice);
});

socket.on("chat", (message) => {
  writeChat(message);
});

socket.on("leave_room", (leavedSocketId, nickname) => {
  removeVideo(leavedSocketId);
  writeChat(`notice! ${nickname} leaved the room.`, NOTICE_CN);
  --peopleInRoom;
  sortStreams();
});

// RTC code

function createConnection(remoteSocketId, remoteNickname) {
  const myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", (event) => {
    handleIce(event, remoteSocketId);
  });
  myPeerConnection.addEventListener("addstream", (event) => {
    handleAddStream(event, remoteSocketId, remoteNickname);
  });
  // myPeerConnection.addEventListener(
  //   "iceconnectionstatechange",
  //   handleConnectionStateChange
  // );
  myStream //
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));

  pcObj[remoteSocketId] = myPeerConnection;

  ++peopleInRoom;
  sortStreams();
  return myPeerConnection;
}

function handleIce(event, remoteSocketId) {
  if (event.candidate) {
    socket.emit("ice", event.candidate, remoteSocketId);
  }
}

function handleAddStream(event, remoteSocketId, remoteNickname) {
  const peerStream = event.stream;
  paintPeerFace(peerStream, remoteSocketId, remoteNickname);
}

function paintPeerFace(peerStream, id, remoteNickname) {
  const streams = document.querySelector("#videoList");
  const div = document.createElement("div");
  div.id = id;
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.width = "200";
  video.height = "200";
  video.srcObject = peerStream;
  const nicknameContainer = document.createElement("h3");
  nicknameContainer.id = "userNickname";
  nicknameContainer.innerText = remoteNickname;
  div.appendChild(video);
  globalDivId.push(div.id);
  div.appendChild(nicknameContainer);
  streams.appendChild(div);
  div.addEventListener("click", () => userCameraClick(peerStream, remoteNickname));
  sortStreams();
}

function userCameraClick(stream, nickName) {
  myFace2.srcObject = stream
  const nicknameContainer = document.createElement("h3");
  userNickname.innerText = nickName;
}

/*
function userCameraClick(id) {
  const streams = document.querySelector("#videoList");
  const streamArr = streams.querySelectorAll("div");
  const clickDivId = id
  streamArr.forEach((streamElement) => {
    if (streamElement.id === clickDivId) {
		//myFace2.srcObject 
		console.log(streamElement.querySelector("video"))
    }
  });
}
*/

function sortStreams() {
  const streams = document.querySelector("#videoList");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((stream) => (stream.className = `people${peopleInRoom}`));
}
/*
function handleConnectionStateChange(event) {
  console.log(`${pcObjArr.length - 1} CS: ${event.target.connectionState}`);
  console.log(`${pcObjArr.length - 1} ICS: ${event.target.iceConnectionState}`);

  if (event.target.iceConnectionState === "disconnected") {
  }
}
*/
