from flask import Flask, render_template, jsonify, request, session
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

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    input=[
        {"role": "system", "content": "You are a summarization assistant. Your job is to take long transcripts and produce a clear, structured summary."},
        {"role": "user", "content": transcript.text}
        ]
    )
    session["transcript"] = transcript.text
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

    # Allows for stateful conversations
    previous_id = session.get("previous_response_id")

    transcript = session.get("transcript", "")

    # Get GPT response
    response = client.responses.create(
    model="gpt-4.1",
    previous_response_id = previous_id,
    input=[
        {"role": "system", "content": "You are now a helpful assistant that answers questions that the user asks"},
        {"role": "user", "content": user_message}
        ]
    )

    session["previous_response_id"] = response.id

    # Return information to frontend
    return jsonify({
        "ai_response": response.output_text
    })
