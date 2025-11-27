from flask import Flask, flash, redirect, render_template, jsonify, request, session
from openai import OpenAI
from dotenv import load_dotenv
import os

# Reads the .env file which contains the key values
load_dotenv()
app = Flask(__name__)

# Setup the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Setup the session data
app.secret_key = os.getenv("SECRET_KEY")

# Loads the main page
@app.route("/")
def index():
    session.pop("previous_response_id", None)
    return render_template("index.html")

# Loads the record page
@app.route("/record")
def record():
    return render_template("record.html")

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    # Ensure that file is present
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    # Ensure that file is not empty
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    # Transcribe file with Whisper
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=(file.filename, file.stream, file.content_type)
    )
    
    # Internal testing
    print("💬 Transcribed text:", transcript.text)

    # Allows for stateful conversations
    previous_id = session.get("previous_response_id")

    # Internal testing
    print("🔢 Previous id:", previous_id)

   # Transcript Prompt
    transcript_prompt = """
You are an expert summarizer for videos, lectures, long-form speech, and audio recordings. 
Your job is to create a high-quality, structured summary of the transcript provided.

Follow this exact format using Markdown:

### 1. Short Summary (3-5 sentences)
A brief overview of the main topic and purpose.

### 2. Key Points
- Bullet-point list of the main ideas
- Break down the lecture logically
- Preserve the speaker's intent

### 3. Important Details
Include essential:
- Examples
- Facts
- Definitions
- Explanations
- References (if mentioned)

### 4. Key Takeaways
3-6 of the most important things the user should remember.

### 5. Action Items (if any)
Steps, advice, or instructions given by the speaker.

### 6. Unanswered Questions / Ambiguities
Mention anything unclear, incomplete, or not explained well.

### 7. Beginner-Friendly Explanation
A simple explanation of the topic that a new learner can understand.

Rules:
- Do NOT add information that does not exist in the transcript.
- Keep the structure clean.
- Preserve the meaning and tone of the speaker.
- If the audio is unclear or incomplete, state it politely.
"""

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    previous_response_id = previous_id,
    input=[
        {"role": "system", "content": transcript_prompt},
        {"role": "user", "content": transcript.text}
        ]
    )

    # Internal testing
    print("🤖 AI Response:", response.output_text)

    session["summary"] = response.output_text

    session["previous_response_id"] = None

    # Return information to frontend
    return jsonify({
        "transcript": transcript.text,
        "ai_response": response.output_text,
    })

@app.route("/send_text", methods=["POST"])
def send_text():
    data = request.get_json()
    user_message = data["message"]

    # Internal testing
    print("👱 User Response:", user_message)

    # Allows for stateful conversations
    previous_id = session.get("previous_response_id")

    # Internal testing
    print("🔢 Previous id:", previous_id)

    chat_prompt = f"""
You are now in normal conversational mode. 
The user may ask questions about the uploaded transcript, or may ask unrelated questions.

Use the summary below as helpful context when needed, but do NOT summarize anything unless the user explicitly asks.

--- SUMMARY CONTEXT ---
{session.get('summary', 'No summary available yet.')}
--- END SUMMARY ---

Your behavior:
- Answer questions clearly and naturally.
- Refer to the summary if the user asks about the lecture/video.
- If the question is unrelated, respond normally.
- Keep responses concise unless the user asks for detail.
- If the user asks for deeper analysis, provide it.
"""

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    previous_response_id = previous_id,
    input=[
        {"role": "system", "content": chat_prompt},
        {"role": "user", "content": user_message}
        ]
    )

    # Internal testing
    print("🤖 AI Response:", response.output_text)

    session["previous_response_id"] = None

    # Return information to frontend
    return jsonify({
        "ai_response": response.output_text
    })
