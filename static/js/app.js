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

  fetch("/save_audio", {
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

      // Add speaker icon (replace with your actual speaker icon URL)
      var speakerIcon = document.createElement("img");
      speakerIcon.src = speakerIconUrl;
      speakerIcon.className = "speaker-icon";
      botMessage.appendChild(speakerIcon);

      // Click event listener for speaker icon
      speakerIcon.addEventListener("click", function () {
        fetch("/speak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: data.message }),
        })
          .then((response) => response.json())
          .then((speakData) => {
            var audio = new Audio("data:audio/wav;base64," + speakData.audio);
            audio.play();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });

      // Adjust gauge needle rotation
      document.getElementById(
        "gauge-needle"
      ).style.transform = `rotate(${data.angle}deg)`;

      // Clear input and scroll to bottom
      document.getElementById("user-input").value = "";
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
      console.error("Error while sending message to chat:", error);
    });
}

// Handle send button click
document.getElementById("send-button").onclick = function () {
  var userInput = document.getElementById("user-input").value;
  sendMessageToChat(userInput);
};

// Handle Enter key press in user input
document
  .getElementById("user-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("send-button").click();
    }
  });
