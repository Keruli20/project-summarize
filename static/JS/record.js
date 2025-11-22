
let mediaRecorder;
let audioChunks = [];

const transcriptBox = document.getElementById("transcript-box");
const summaryBox = document.getElementById("summary-box");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const player = document.getElementById("audio-player");
const chatBox = document.getElementById("chat-box");
const spinner = document.getElementById("spinner");

// Starts the recording
startButton.onclick = async () => {
    // Ask to use the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Listens to live audio and records it
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    // Store chunks of audio as they arrive
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
        // Merge audio chunks full audio
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob, "input.wav");

        // Show spinner before sending
        spinner.style.display = "block";

        // Sends audio to Flask
        const response = await fetch("/upload_audio", {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        // Hide spinner after receiving response
        spinner.style.display = "none";

        // Display transcribed text
        const t = document.createElement("p");
        t.textContent = data.transcript
        transcriptBox.appendChild(t);

        // Display summarised text
        const c = document.createElement("div");
        let html = marked.parse(data.ai_response);
        html = DOMPurify.sanitize(html);
        c.innerHTML = html
        summaryBox.appendChild(c);

        summaryBox.scrollTop = summaryBox.scrollHeight;
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
};

// Stops the recording
stopButton.onclick = () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
};