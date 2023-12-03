from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict_slot

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Hello from the backend"}

@app.route("/predict_slot", methods=['POST'])
def predict_slot_route():
    try:
        selected_treatment = request.get_data(as_text=True).strip()
        print('selected_treatment', selected_treatment)

        
        selected_appointment_time, selected_day, duration_prediction = predict_slot(selected_treatment)
                
        # Display the suggested Appointment Time and Day in the chatbot
        prompt_message = f"How about {selected_appointment_time} on {selected_day}? (Yes/No)"

        return jsonify({
            "prompt_message": prompt_message,
            "selected_appointment_time": selected_appointment_time,
            "selected_day": selected_day,
            "duration_prediction": duration_prediction
        })
        
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5000)
