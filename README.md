# Project Summarize

#### Video Demo:  https://youtu.be/-rQ0dDqqZQo

#### Description:

![Project Summarise](/static/image.png)

## **What is my project?**

In short, Project Summarize is a web app that allows users to upload audio or video files or record audio directly. The app converts the audio into text using OpenAI’s Whisper, summarizes the transcript using GPT, and lets the user continue chatting with the AI while the system remembers the previous context.

***

## **How to run the app**

1. Install the required dependencies: **pip install -r requirements.txt**
2. Create a .env file in the project directory.
3. Add your API keys to the .env file.
4. Set your OpenAI API key: **OPENAI\_API\_KEY=""**
5. Add any value you want for the session key: **SECRET\_KEY=""**
6. Start the Flask server: **flask run**
7. Open your browser and visit the local server link provided in the terminal.

***

## **Why did I build it?**

This idea started when I was in university. I had many lectures, and most of them were very long. I did not want to manually replay entire recordings just to find the important parts, because this usually took too much time and included a lot of unnecessary content. This made me wonder if AI could help summarize everything for me.

At first, I used separate online tools to transcribe audio and then passed the text into another AI tool to summarize it. However, I quickly ran into problems. Many transcription sites only allow a limited file size before requiring payment or an account. It was also inconvenient to copy the transcript from one site, paste it into another, and type in a prompt every time. Because of that, I wanted to combine everything into one simple website that could handle transcription, summarization, and follow-up questions in the same place.

***

## **What each file does**

Project Summarize is a web app with both a frontend and backend system. The frontend consists of three HTML files, one CSS file, and one JavaScript file, while the backend consists of a single Python file built with Flask.

## **HTML files (3 files)**

### **base.html**

This file acts as the template for the rest of the pages. Since Flask and Jinja are used, base.html allows all pages to share the same general structure.

It contains the head section, which includes a dynamic title that changes depending on the page, as well as links to fonts, Bootstrap, and the CSS file.

It also includes the navigation bar that appears across the site, with the active page highlighted. The main body section is left empty as a placeholder for page-specific content. Finally, the footer contains the text: © 2025 Project Summarize.

### **index.html & record.html**

These two pages allow users to upload an audio file or record audio directly. Both pages include a transcript box, which displays the generated transcript, followed by the AI chat area where users can view the summary and ask further questions.

Below that is the input box that lets users type messages to the chatbot. The only real difference between the two files is the method of input. index.html supports file uploads, while record.html contains the interface for audio recording.

***

## **CSS file (1 file)**

### **styles.css**

This file contains the custom styles used throughout the project. Although Bootstrap handles most of the overall layout and styling, styles. CSS includes adjustments for specific elements, especially the chat bubbles displayed in the transcript and chat sections.

I aimed for a minimalist look with mostly black and white elements, similar to the style used by OpenAI.

***

## **JavaScript file (1 file)**

### **index.js**

This file handles most of the interaction on the frontend. It includes the functions for uploading files, recording audio, and sending messages to the AI chatbot.

It manages the recording controls, sends recorded audio to the backend, and updates the page whenever a user action takes place.

In addition, it controls the copy transcript button and is responsible for rendering messages in both the chat and transcript boxes.

***

## **Python file (1 file)**

### **app.py**

This file is the core of the project and contains all of the backend logic. It includes the routes for navigating between different pages as well as handling the transcription process using OpenAI’s Whisper model.

After receiving the file, Whisper transcribes the audio, and the transcript is passed back to the frontend. The same transcript is also sent to a GPT model to generate a summary, which is also displayed to the user. Afterwards, the user can ask questions to the AI chatbot to ask follow-up questions and to understand the content in greater detail.

***

## **Design choices**

I chose Flask because it provides a framework for rapid prototyping and integrates cleanly with HTML templates. For UI design, I used Bootstrap to create the layout quickly without writing too much custom CSS.

For the AI chatbot, I chose to use a stateful approach instead of a stateless one because I wanted the AI to remember what the user had asked earlier. To achieve this, I store the response ID generated by the model inside the session. This allows the chatbot to keep track of the conversation until the page is refreshed. Although this approach required more setup, it was necessary for the experience I wanted to create.

***

## **Current limitations and future plans**

The app supports two main features, which are uploading audio or video files and recording audio directly.

Currently the app does not store transcripts permanently. When the user refreshes the page, all context is cleared. The system also does not handle very large files well, and the remainder is minimal. Since the conversation uses a single session-based memory chain, the app is not yet able to support multiple users at the same time without further development.

In the future, I plan to integrate a YouTube transcriber and summarizer so that users can process online content more easily. I also hope to add more use cases over time to improve the usefulness of the program. The design is still quite barebones, so I intend to improve the interface design with additional Bootstrap components to create a more polished appearance.