from flask import Flask, request, jsonify
import pandas as pd
from keras.models import load_model
import numpy as np
import joblib

app = Flask(__name__)

# Load the model
model = load_model('model-2.h5')  # Adjust the path if necessary

# Load the scaler
scaler = joblib.load('scaler.pkl')  # Load the previously saved scaler

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json  # Expecting a JSON payload
        print("Received data:", data)

        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Prepare the input data based on what your model expects
        input_data = {
            "Hours_Worked_Per_Week": data['workActivity']['hoursPerWeek'],
            "Number_of_Virtual_Meetings": data['workActivity']['numberOfVirtualMeetings'],
            "Work_Life_Balance_Rating": data['surveyResponses']['workLifeBalance'],
            "Mental_Health_Condition": data['surveyResponses']['mentalHealthCondition'],
            "Access_to_Mental_Health_Resources": data['wellBeingData']['accessToMentalHealthResources'],
            "Physical_Activity": data['wellBeingData']['physicalActivity'],
            "Sleep_Quality": data['wellBeingData']['sleepQuality']
            # Include other fields as required
        }
        
        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Handle categorical variables if necessary
        # input_df_encoded = pd.get_dummies(input_df, drop_first=True)
        
        # Ensure the input DataFrame is standardized
        input_scaled = scaler.transform(input_df)  # Use the loaded scaler

        # Make predictions
        predictions = model.predict(input_scaled)
        predicted_class = np.argmax(predictions, axis=1)  # Get the class with the highest probability
        
        # Map predicted class to a label
        class_labels = {0: "Low", 1: "Medium", 2: "High"}  # Modify as needed
        predicted_label = class_labels.get(predicted_class[0], "Unknown")

        return jsonify({
            "predicted_class": predicted_class.tolist(),
            "predicted_label": predicted_label
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5003)

# Save the scaler (This part should only run once when fitting the scaler)
# from sklearn.preprocessing import StandardScaler
# import joblib

# Assuming X_train is your training data
# scaler = StandardScaler()
# X_train_scaled = scaler.fit_transform(X_train)
# joblib.dump(scaler, 'scaler.pkl')  # Save the scaler
