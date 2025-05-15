from flask import Flask, render_template, jsonify, request
from model import predict_image
import utils
from markupsafe import Markup
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        try:
            file = request.files['file']
            img = file.read()
            prediction = predict_image(img)
            print(prediction)
            res = Markup(utils.disease_dic[prediction])
            return render_template('display.html', status=200, result=res)
        except:
            pass
    return render_template('index.html', status=500, res="Internal Server Error")

@app.route('/api/predict', methods=['POST'])
def predict_api():
    if request.method == 'POST':
        try:
            # Check if the request has the image in JSON format
            if request.is_json:
                data = request.get_json()
                if 'image' not in data:
                    return jsonify({
                        'error': 'No image data provided',
                        'status': 400
                    }), 400
                
                # Decode base64 image
                try:
                    image_data = base64.b64decode(data['image'])
                except:
                    return jsonify({
                        'error': 'Invalid image encoding',
                        'status': 400
                    }), 400
            
            # Check if the request has file upload
            elif 'file' in request.files:
                file = request.files['file']
                image_data = file.read()
            else:
                return jsonify({
                    'error': 'No image provided',
                    'status': 400
                }), 400

            # Make prediction
            prediction = predict_image(image_data)
            
            return jsonify({
                'status': 200,
                'prediction': prediction,
                'disease_details': utils.disease_dic[prediction]
            })

        except Exception as e:
            return jsonify({
                'error': str(e),
                'status': 500
            }), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
