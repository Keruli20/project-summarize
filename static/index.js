document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("upload-file");
    const fileinput = document.getElementById("file-input");
    const aiForm = document.getElementById("ai-form");
    const aiInput = document.getElementById("ai-input");
    const startButton = document.getElementById("start-button");
    const stopButton = document.getElementById("stop-button");
    const transcriptBox = document.getElementById("transcript-box");
    const chatBox = document.getElementById("chat-box");
    const spinnerTop = document.getElementById("spinner-top");
    const spinnerBottom = document.getElementById("spinner-bottom");
    const downloadButton = document.getElementById("download-button");
    const copyButton = document.getElementById("copy-transcript");

    let mediaRecorder;
    let audioChunks = [];

    // Functions

    // Renders the text inside the transcript box
    function renderTranscript(text, box) {
        const div = document.createElement("div");
        let html = DOMPurify.sanitize(marked.parse(text));
        div.innerHTML = html;
        box.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Renders the text inside the chatbox
    function renderChat(isUser, text) {
        const div = document.createElement("div");

        if (isUser) {
            div.className = "chat-bubble";
        }

        let html = marked.parse(text);
        div.innerHTML = DOMPurify.sanitize(html);
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Shows and hides the download Button
    function showDownloadButton() {
        downloadButton.style.display = "inline-block";
    }
    function hideDownloadButton() {
        downloadButton.style.display = "none";
    }

    // Change download & copy button to success state
    function changeToSuccess(button, text) {
        button.classList.remove("btn-outline-dark");
        button.classList.add("btn-success");
        button.textContent = text;
    }

    function clearAllOutputs() {
        transcriptBox.innerHTML = "";
        chatBox.innerHTML = "";
        aiInput.value = "";
    }

    // File Upload Section
    if (form) {
        form.addEventListener("submit", async (event) => {
            // Stop the page from reloading after submitting
            event.preventDefault();

            clearAllOutputs();

            // Ensure that file is present
            const file = fileinput.files[0];
            if (!file) return alert("Please upload an audio file.");

            const formData = new FormData();
            formData.append("file", file);

            spinnerTop.style.display = "block";

            const response = await fetch("/upload_audio", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            spinnerTop.style.display = "none";

            renderTranscript(data.transcript, transcriptBox)
            renderChat(false, data.ai_response)
        });
    }

    // Recording Section
    if (startButton) {
        startButton.onclick = async () => {

            clearAllOutputs();
            hideDownloadButton();

            // Ask to use the microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            startButton.classList.remove("btn-dark");
            startButton.classList.add("btn-danger");
            startButton.textContent = "Recording...";

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

                spinnerTop.style.display = "block";

                const url = URL.createObjectURL(audioBlob);
                downloadButton.href = url;
                downloadButton.download = "recording.wav";
                showDownloadButton();

                const response = await fetch("/upload_audio", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                spinnerTop.style.display = "none";

                renderTranscript(data.transcript, transcriptBox)
                renderChat(false, data.ai_response)
            };
            startButton.disabled = true;
            stopButton.disabled = false;
            mediaRecorder.start();
        };
    }

    // Stops the recording
    if (stopButton) {
        stopButton.onclick = () => {
            mediaRecorder.stop();
            startButton.disabled = false;
            stopButton.disabled = true;
            startButton.classList.remove("btn-danger");
            startButton.classList.add("btn-dark");
            startButton.textContent = "Start Recording";
        };
        
        downloadButton.addEventListener("click", () => {
            // Change to success button
            changeToSuccess(downloadButton, "Copied!")

            // Change back to original button
            setTimeout(() => {
                downloadButton.classList.remove("btn-success");
                downloadButton.classList.add("btn-outline-dark");
                downloadButton.textContent = "Download Audio";
            }, 1200);
        });
    }

    // Type to the AI chatbot
    aiForm.addEventListener("submit", async (event) => {
        // Stop the page from reloading after submitting
        event.preventDefault();

        // Gets the text from the input field
        const text = aiInput.value.trim();
        if (!text) return;

        // Render user message
        renderChat(true, text)

        // Clears the input field after submitting
        aiInput.value = "";

        spinnerBottom.style.display = "block";

        // Sends the input to the backend
        const response = await fetch("/send_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();

        spinnerBottom.style.display = "none";

        // Render AI response
        renderChat(false, data.ai_response)
    });

    // TODO: Explain this
    aiInput.addEventListener("input", () => {
        aiInput.style.height = "auto";

        const maxHeight = 120;
        const height = aiInput.scrollHeight;

        if (height < maxHeight) {
            aiInput.style.height = height + "px";
            aiInput.style.overflowY = "hidden";
        } else {
            aiInput.style.height = maxHeight + "px";
            aiInput.style.overflowY = "auto";
        }

        if (height <= 50) {
            aiInput.style.borderRadius = "9999px";
        } else {
            aiInput.style.borderRadius = "24px";
        }
    });

    // Copies the text in the transcript box
    copyButton.addEventListener("click", () => {
        const text = transcriptBox.innerText;
        navigator.clipboard.writeText(text)

        // Change to success button
        changeToSuccess(copyButton, "Copied!")

        // Change back to original button
        setTimeout(() => {
            copyButton.classList.remove("btn-success");
            copyButton.classList.add("btn-outline-dark");
            copyButton.textContent = "Copy";
        }, 1200);
    });
});

