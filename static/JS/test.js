const form = document.getElementById("upload-file");
const fileinput = document.getElementById("file-input");
const summaryBox = document.getElementById("summary-box");
const chatBox = document.getElementById("chat-box");
const spinner = document.getElementById("spinner");
const transcriptBox = document.getElementById("transcript-box");
const aiForm = document.getElementById("ai-form");
const aiInput = document.getElementById("ai-input");

// Uploading file
form.addEventListener("submit", async (event) => {
    // Stop the page from reloading after submitting
    event.preventDefault();

    // Ensure that file is present
    const file = fileinput.files[0];
    if (!file) return alert("Please upload an audio file.");

    // Show loading spinner
    spinner.style.display = "block";

    // Sends the file to the backend
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/upload_audio", {
        method: "POST",
        body: formData
    });
    const data = await response.json();

    // Hide loading spinner
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
});

// AI Chatbox
aiForm.addEventListener("submit", async (event) => {
    // Stop the page from reloading after submitting
    event.preventDefault();

    // Gets the text from the input field
    const text = aiInput.value.trim();
    if (!text) return;

    // Displays user text
    const u = document.createElement("div");
    let user = marked.parse("<strong>You: </strong>" + text);
    user = DOMPurify.sanitize(user);
    u.innerHTML = user;
    chatBox.appendChild(u);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clears the input field after submitting
    aiInput.value = "";

    // Show loading spinner
    spinner.style.display = "block";

    // Sends the input to the backend
    const response = await fetch("/send_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
    });
    const data = await response.json();

    // Hides loading spinner
    spinner.style.display = "none";

    // Displays AI text
    const ai = document.createElement("div");
    let html = marked.parse("<strong>AI: </strong>" + data.ai_response);
    html = DOMPurify.sanitize(html);
    ai.innerHTML = html;
    chatBox.appendChild(ai);

    chatBox.scrollTop = chatBox.scrollHeight;
})