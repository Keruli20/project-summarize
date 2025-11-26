document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("upload-file");
    const fileinput = document.getElementById("file-input");
    const aiForm = document.getElementById("ai-form");
    const aiInput = document.getElementById("ai-input");

    const startButton = document.getElementById("start-button");
    const stopButton = document.getElementById("stop-button");

    const transcriptBox = document.getElementById("transcript-box");
    const summaryBox = document.getElementById("summary-box");
    const chatBox = document.getElementById("chat-box");
    const spinner = document.getElementById("spinner");

    let mediaRecorder;
    let audioChunks = [];

    // Functions
    function startSpinner() {
        spinner.style.display = "block";
    }

    function stopSpinner() {
        spinner.style.display = "none";
    }

    function renderTranscriptResponse(text, box) {
        const t = document.createElement("div");
        let html = DOMPurify.sanitize(marked.parse(text));
        t.innerHTML = html;
        box.appendChild(t);
        chatBox.scrollTop = chatBox.scrollHeight;

    }

    // function renderChat(role, text) {
    //     const t = document.createElement("div");
    //     let html = marked.parse(`<strong>${role}: </strong>${text}`);
    //     html = DOMPurify.sanitize(html);
    //     t.innerHTML = html;
    //     chatBox.appendChild(t);
    //     chatBox.scrollTop = chatBox.scrollHeight;
    // }

    function renderChat(role, text) {
        const block = document.createElement("div");

        if (role === "You") {
            // User bubble (right side)
            block.className = "chat-bubble user";
        } else {
            // AI message – no bubble, plain block like ChatGPT
            block.className = "ai-message";
        }

        let html = marked.parse(text);
        block.innerHTML = DOMPurify.sanitize(html);

        chatBox.appendChild(block);
        chatBox.scrollTop = chatBox.scrollHeight;
    }



    function clearAllOutputs() {
        transcriptBox.innerHTML = "";
        summaryBox.innerHTML = "";
        chatBox.innerHTML = "";
    }

    // File Upload
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

            startSpinner();

            const response = await fetch("/upload_audio", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            stopSpinner();

            renderTranscriptResponse(data.transcript, transcriptBox)

            renderTranscriptResponse(data.ai_response, summaryBox)
        });
    }

    // Recording
    if (startButton) {
        startButton.onclick = async () => {

            clearAllOutputs();

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

                startSpinner();

                const url = URL.createObjectURL(audioBlob);
                const link = document.getElementById("download");
                link.href = url;
                link.download = "recording.wav";
                link.style.display = "inline-block";

                const response = await fetch("/upload_audio", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                stopSpinner();

                renderTranscriptResponse(data.transcript, transcriptBox)
                renderTranscriptResponse(data.ai_response, summaryBox)
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
    }

    aiForm.addEventListener("submit", async (event) => {
        // Stop the page from reloading after submitting
        event.preventDefault();

        // Gets the text from the input field
        const text = aiInput.value.trim();
        if (!text) return;

        renderChat("You", text)

        // Clears the input field after submitting
        aiInput.value = "";

        startSpinner();

        // Sends the input to the backend
        const response = await fetch("/send_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();

        stopSpinner();

        renderChat("AI", data.ai_response)
    });
});

