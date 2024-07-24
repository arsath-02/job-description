from flask import Flask, request, jsonify
import PyPDF2
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from pyngrok import ngrok
import threading

app = Flask(__name__)

# Load your model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen-VL-Chat", trust_remote_code=True)
llm_model = AutoModelForCausalLM.from_pretrained("sanjay-29-29/GreenAI", trust_remote_code=True, device_map='auto')

@app.route('/generate_cover_letter', methods=['POST'])
def generate_cover_letter():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    text = ""
    if file and file.filename.endswith('.pdf'):
        reader = PyPDF2.PdfReader(file)
        number_of_pages = len(reader.pages)
        for i in range(number_of_pages):
            page = reader.pages[i]
            text += page.extract_text()
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

    query = "generate a detailed, professional and instantly hirable cover letter using the details given " + text
    inputs = tokenizer(query, return_tensors='pt').to('cuda')
    outputs = llm_model.generate(**inputs, max_length=500)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return jsonify({'coverLetter': response}), 200

# Function to run Flask app
def run_flask_app():
    app.run(port=5000, host='0.0.0.0')

# Run Flask app in a separate thread
threading.Thread(target=run_flask_app).start()

# Start ngrok tunnel
ngrok.set_auth_token("2a1iGE4Q5SDAF4mhdAVXeNptwJd_2GBcW2ACMaj2JoAJy8Gtt")
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")
