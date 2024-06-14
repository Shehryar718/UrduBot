// URL = window.URL || window.webkitURL;

// var gumStream; // stream from getUserMedia()
// var rec; // Recorder.js object
// var input; // MediaStreamAudioSourceNode we'll be recording

// var recordStopButton = document.getElementById("recordStopButton");

// recordStopButton.addEventListener("click", toggleRecording);

// function toggleRecording() {
//   if (!rec) {
//     startRecording();
//   } else {
//     stopRecording();
//   }
// }

// function startRecording() {
//   var constraints = { audio: true, video: false };

//   recordStopButton.disabled = true;

//   navigator.mediaDevices
//     .getUserMedia(constraints)
//     .then(function (stream) {
//       audioContext = new AudioContext();
//       gumStream = stream;
//       input = audioContext.createMediaStreamSource(stream);
//       rec = new Recorder(input, { numChannels: 1 });
//       rec.record();

//       recordStopButton.disabled = false;
//       recordStopButton.classList.remove("notRec");
//       recordStopButton.classList.add("Rec");
//     })
//     .catch(function (err) {
//       recordStopButton.disabled = false;
//     });
// }

// function stopRecording() {
//   recordStopButton.disabled = true;

//   rec.stop();
//   gumStream.getAudioTracks()[0].stop();

//   rec.exportWAV(function (blob) {
//     createDownloadLink(blob);
//     sendAudioData(blob);
//   });

//   recordStopButton.disabled = false;
//   recordStopButton.classList.remove("Rec");
//   recordStopButton.classList.add("notRec");
//   rec = null;
// }

// function createDownloadLink(blob) {
//   var url = URL.createObjectURL(blob);
//   var au = document.createElement("audio");
//   var li = document.createElement("li");
//   var link = document.createElement("a");

//   var filename = new Date().toISOString();

//   au.controls = true;
//   au.src = url;

//   link.href = url;
//   link.download = filename + ".wav";
//   link.innerHTML = "Save to disk";

//   li.appendChild(au);
//   li.appendChild(document.createTextNode(filename + ".wav "));
//   li.appendChild(link);

//   var recordingsList = document.getElementById("recordingsList");
//   recordingsList.appendChild(li);
// }

// function sendAudioData(blob) {
//   var xhr = new XMLHttpRequest();
//   var fd = new FormData();
//   fd.append("audio_data", blob, "audio.wav");
//   xhr.open("POST", "/save_audio/", true);
//   xhr.onload = function () {
//     var response = JSON.parse(xhr.responseText);
//     if (response.status && response.transcription) {
//       displayTranscription(response.transcription);
//     }
//   };
//   xhr.send(fd);
// }

URL = window.URL || window.webkitURL;

var gumStream; // stream from getUserMedia()
var rec; // Recorder.js object
var input; // MediaStreamAudioSourceNode we'll be recording

var recordStopButton = document.getElementById("recordStopButton");

recordStopButton.addEventListener("click", toggleRecording);

function toggleRecording() {
  if (!rec) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  var constraints = { audio: true, video: false };

  recordStopButton.disabled = true;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      audioContext = new AudioContext();
      gumStream = stream;
      input = audioContext.createMediaStreamSource(stream);
      rec = new Recorder(input, { numChannels: 1 });
      rec.record();

      recordStopButton.disabled = false;
      recordStopButton.classList.remove("notRec");
      recordStopButton.classList.add("Rec");
    })
    .catch(function (err) {
      console.error("Error accessing media devices.", err);
      recordStopButton.disabled = false;
    });
}

function stopRecording() {
  recordStopButton.disabled = true;

  rec.stop();
  gumStream.getAudioTracks()[0].stop();
  console.log("stop recording");

  rec.exportWAV(function (blob) {
    sendAudioData(blob);
  });
  console.log("stop recording");

  recordStopButton.disabled = false;
  recordStopButton.classList.remove("Rec");
  recordStopButton.classList.add("notRec");
  rec = null;
}

// function sendAudioData(blob) {
//   var xhr = new XMLHttpRequest();
//   var fd = new FormData();
//   fd.append("audio_data", blob, "audio.wav");

//   xhr.open("POST", "/save_audio/", true);
//   xhr.onload = function () {
//     if (xhr.status === 200) {
//       var response = JSON.parse(xhr.responseText);
//       if (response.status && response.transcription) {
//         displayTranscription(response.transcription);
//       } else {
//         console.error("Failed to transcribe audio");
//       }
//     } else {
//       console.error("Error in server response", xhr.status, xhr.statusText);
//     }
//   };
//   xhr.onerror = function () {
//     console.error("Network error while sending audio data.");
//   };
//   xhr.send(fd);
// }

// function sendAudioData(blob) {
//   var xhr = new XMLHttpRequest();
//   var fd = new FormData();
//   fd.append("audio_data", blob, "audio.wav");
//   xhr.open("POST", "/save_audio/", true);
//   xhr.onload = function () {
//     var response = JSON.parse(xhr.responseText);
//     if (response.status && response.transcription) {
//       fd = new FormData();
//       fd.append("message", response.transcription);
//       xhr.open("POST", "/chat", true);
//       xhr.send(fd);
//       //   displayTranscription(response.transcription);
//     }
//   };
//   xhr.send(fd);
// }

// function displayTranscription(transcription) {
//   var chatBox = document.getElementById("chat-box");
//   var botMessage = document.createElement("div");
//   botMessage.className = "bot-message";
//   botMessage.innerText = transcription;
//   chatBox.appendChild(botMessage);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// function sendAudioData(blob) {
//   var xhr = new XMLHttpRequest();
//   var fd = new FormData();
//   fd.append("audio_data", blob, "audio.wav");

//   xhr.open("POST", "/save_audio/", true);
//   xhr.onload = function () {
//     if (xhr.status === 200) {
//       var response = JSON.parse(xhr.responseText);
//       if (response.status && response.transcription) {
//         sendMessageToChat(response.transcription);
//       } else {
//         console.error("Failed to transcribe audio");
//       }
//     } else {
//       console.error("Error in server response", xhr.status, xhr.statusText);
//     }
//   };
//   xhr.onerror = function () {
//     console.error("Network error while sending audio data.");
//   };
//   xhr.send(fd);
// }

// function sendMessageToChat(transcription) {
//   fetch("/chat", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ message: transcription }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       var chatBox = document.getElementById("chat-box");
//       var userMessage = document.createElement("div");
//       userMessage.className = "user-message";
//       userMessage.innerText = userInput;
//       chatBox.appendChild(userMessage);

//       var botMessage = document.createElement("div");
//       botMessage.className = "bot-message";
//       botMessage.innerText = data.message;
//       chatBox.appendChild(botMessage);

//       document.getElementById("user-input").value = "";
//       chatBox.scrollTop = chatBox.scrollHeight;
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });

//   //   var xhr = new XMLHttpRequest();
//   //   xhr.open("POST", "/chat", true);
//   //   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

//   //   xhr.onload = function () {
//   //     if (xhr.status === 200) {
//   //       var response = JSON.parse(xhr.responseText);
//   //       if (response.message) {
//   //         displayTranscription(response.message);
//   //       } else {
//   //         console.error("Failed to receive chat response");
//   //       }
//   //     } else {
//   //       console.error("Error in server response", xhr.status, xhr.statusText);
//   //     }
//   //   };

//   //   xhr.onerror = function () {
//   //     console.error("Network error while sending message to chat.");
//   //   };

//   //   var data = JSON.stringify({ message: transcription });
//   //   xhr.send(data);
// }

function sendAudioData(blob) {
  var fd = new FormData();
  fd.append("audio_data", blob, "audio.wav");

  fetch("/save_audio/", {
    method: "POST",
    body: fd,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.status && data.transcription) {
        sendMessageToChat(data.transcription);
      } else {
        console.error("Failed to transcribe audio");
      }
    })
    .catch((error) => {
      console.error("Error while sending audio data:", error);
    });
}

function sendMessageToChat(transcription) {
  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: transcription }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      var chatBox = document.getElementById("chat-box");

      // Append user message
      var userMessage = document.createElement("div");
      userMessage.className = "user-message";
      userMessage.innerText = transcription; // assuming transcription is the user's input
      chatBox.appendChild(userMessage);

      // Append bot message
      var botMessage = document.createElement("div");
      botMessage.className = "bot-message";
      botMessage.innerText = data.message;
      chatBox.appendChild(botMessage);

      // Clear input and scroll to bottom
      document.getElementById("user-input").value = "";
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
      console.error("Error while sending message to chat:", error);
    });
}
