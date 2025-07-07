import os
# Reduce TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, render_template, request, jsonify
import base64
import re
import numpy as np
import cv2
import mediapipe as mp
from tensorflow.keras.models import load_model
import pickle

app = Flask(__name__)

# Load model and label encoder
model = load_model('model.h5')
with open('label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

# Initialize MediaPipe Hands (static image mode: True)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.5
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict_sign', methods=['POST'])
def predict_sign():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'prediction': 'No image received'}), 400

    # Decode base64 image
    image_data = re.sub('^data:image/.+;base64,', '', data['image'])
    image_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    landmark_list = []

    if results.multi_hand_landmarks:
        detected_hands = results.multi_hand_landmarks[:2]

        for hand_landmarks in detected_hands:
            hand = []
            for lm in hand_landmarks.landmark:
                hand.extend([lm.x, lm.y, lm.z])
            landmark_list.append(hand)

        if len(landmark_list) == 1:
            landmark_list.append([0.0]*63)

        landmark_array = np.array(landmark_list).flatten()

        if len(landmark_array) != 126:
            return jsonify({'prediction': 'Invalid landmark size'})

        sample = np.expand_dims(landmark_array, axis=0)
        pred = model.predict(sample)
        class_id = np.argmax(pred)
        class_name = label_encoder.inverse_transform([class_id])[0]
        confidence = pred[0][class_id]

        return jsonify({'prediction': f'{class_name} ({confidence*100:.2f}%)'})
    else:
        return jsonify({'prediction': 'No hands detected'})

if __name__ == '__main__':
    app.run(debug=True)
