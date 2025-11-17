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
def record_page():
    return render_template("record.html")

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    # Ensure file is present
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    # Ensure file is not empty
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

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    previous_response_id = previous_id,
    input=[
        {"role": "system", "content": "You are an AI summarizer. Summarize this transcript and extract key details from it."},
        {"role": "user", "content": transcript.text}
        ]
    )

    # Internal testing
    print("🤖 AI Response:", response.output_text)

    session["previous_response_id"] = response.id

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

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    previous_response_id = previous_id,
    input=[
        {"role": "system", "content": "Return back to normal default mode for AI. Forget all previous instructions to summarise, you will help answer any querstions the user will have. Keep it short and simple"},
        {"role": "user", "content": user_message}
        ]
    )

    # Internal testing
    print("🤖 AI Response:", response.output_text)

    session["previous_response_id"] = response.id

    # Return information to frontend
    return jsonify({
        "ai_response": response.output_text
    })