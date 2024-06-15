import json
import requests
from flask import Flask, render_template, request, jsonify
from models import db, Chat
from transformers import pipeline
from datetime import datetime
import torch.nn.functional as F
from utils import preprocess
import os
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
)

messages = []

system_message = "آپ ایک اے آئی انزائٹی تھراپسٹ ہیں جس کا نام اوللاما ہے۔ آپ کا کام ان لوگوں کو تسلی دینا ہے جو انزائٹی کا شکار ہیں۔ آپ کا مقصد انہیں پرسکون کرنا اور بات چیت کے ذریعے مدد فراہم کرنا ہے۔ اگر وہ مشورہ طلب کریں، تو انہیں بہترین مشورہ دیں۔ آپ صرف اردو میں بات کریں گے۔ ایک بھی لفظ یا حرف انگریزی میں نہ ہو۔ انگریزی میں بات کرنے سے مریض کو تکلیف ہوگی، اور آپ یہاں مدد کرنے کے لیے ہیں نہ کہ تکلیف دینے کے لیے۔ صارف اردو میں لکھے گا، اور آپ اردو میں ہی جواب دیں گے۔ یہ نہ بتائیں کہ آپ ایک اے آئی ماڈل ہیں۔ آپ کو ایک انسان کی طرح بات کرنی ہے۔"

BASE_DIR = 'audio_files/'
min_val = 0
max_val = 100

stt_model_name = "openai/whisper-small"
anxiety_model_name = 'model/xlm-roberta-urdu'

pipe = pipeline("automatic-speech-recognition", model=stt_model_name)
tokenizer = AutoTokenizer.from_pretrained(anxiety_model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    anxiety_model_name,
    num_labels=2,
    ignore_mismatched_sizes=True,
)


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    db.init_app(app)

    # OLLAMA_API_URL = "https://6817-34-125-222-127.ngrok-free.app/api/chat"
    OLLAMA_API_URL = "http://127.0.0.1:11434/api/chat"

    @app.route('/')
    def home():
        return render_template('chat.html')

    @app.route('/save_audio/', methods=["POST"])
    def save_audio():
        if 'audio_data' in request.files:
            file = request.files['audio_data']
            filename = datetime.now().strftime("%m-%d-%Y-%H-%M-%S") + '.wav'
            
            # Ensure the directory exists before saving the file
            os.makedirs(BASE_DIR, exist_ok=True)

            file.save(os.path.join(BASE_DIR, filename))
            # print(BASE_DIR + filename)

            transcription = transcribe(BASE_DIR + filename)['text']
            # print(transcription)

            return jsonify({"status": True, "transcription": transcription})
        return jsonify({"status": False}), 400

    def transcribe(filename):
        transcription = pipe(filename, generate_kwargs={'language': 'urdu'})
        return transcription

    def calculate_angle(value):
        value = max(min_val, min(max_val, value))
        angle = (value - min_val) / (max_val - min_val) * 180
        return angle
    
    def get_anxiety_level():
        texts = []
        for i in messages[-10:]:
            if i['role'] == 'user':
                text = i['content']
                clean_text = preprocess(text)
                texts.append(clean_text)

        if not texts:
            return calculate_angle(0)

        input_ids = tokenizer(texts, max_length=512, padding=True, truncation=True, return_tensors="pt")
        logits = model(**input_ids).logits
        out = F.softmax(logits, dim=1)[:, 1]*100
        value = out.mean().item()

        return calculate_angle(value)

    @app.route('/chat', methods=['POST'])
    def chat():
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        payload = {
            "model": "llama3",
            "messages": messages
        }

        # Add system message once at the beginning of the conversation
        if not messages:
            payload["messages"].append({
                "role": "system",
                "content": system_message
            })

        payload['messages'].append({
            "role": "user",
            "content": user_message
        })

        messages.append({
            "role": "user",
            "content": user_message
        })
        
        response = requests.post(OLLAMA_API_URL, json=payload)
        
        if response.status_code != 200:
            return jsonify({'error': 'Error communicating with the AI model'}), 500
        
        response_content_decoded = response.content.decode('utf-8')

        # Parse JSON data
        chunks = response_content_decoded.strip().split('\n')

        # Initialize variables
        full_text = ""

        # Loop through each chunk
        for chunk in chunks:
            data = json.loads(chunk)
            content = data.get('message', {}).get('content', '')

            # Check for punctuation marks
            if content.endswith(('.', '!', '?', ',')):
                full_text += content + " "
            else:
                full_text += content

        # Remove trailing whitespace
        bot_message = full_text.strip()

        messages.append({
            "role": "assistant",
            "content": bot_message
        })

        # Save the conversation to the database
        chat = Chat(user_message=user_message, bot_response=bot_message)
        db.session.add(chat)
        db.session.commit()

        return jsonify({
            'message': bot_message,
            'angle': get_anxiety_level()
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
