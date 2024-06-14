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
      userMessage.innerText = transcription;
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
