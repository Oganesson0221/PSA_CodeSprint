from flask import Flask, request, jsonify
import pandas as pd
from keras.models import load_model
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Load the original dataset
original_data = pd.read_csv('psacsv.csv')

# Fill missing values
original_data['Mental_Health_Condition'].fillna('None', inplace=True)
original_data['Physical_Activity'].fillna('Unknown', inplace=True)
original_data['Sleep_Quality'].fillna('Poor', inplace=True)

# Select only the necessary columns
data = original_data[['Mental_Health_Condition', 'Physical_Activity', 'Sleep_Quality']]

# Encode categorical variables for features
categorical_cols = ['Mental_Health_Condition', 'Physical_Activity', 'Sleep_Quality']
le_dict = {}

# Fit and save encoders
for col in categorical_cols:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    le_dict[col] = le  # Save the encoder for later use

# Save the label encoders
joblib.dump(le_dict['Mental_Health_Condition'], 'mental_health_encoder.pkl')
joblib.dump(le_dict['Physical_Activity'], 'physical_activity_encoder.pkl')
joblib.dump(le_dict['Sleep_Quality'], 'sleep_quality_encoder.pkl')

# Prepare features
X = data  # Use only these columns for scaling

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save the scaler
joblib.dump(scaler, 'scaler.pkl')

app = Flask(__name__)

# Load the model and scalers
model = load_model('model-final-2.h5')  # Adjust the path if necessary
scaler = joblib.load('scaler.pkl')

# Load encoders for categorical variables
mental_health_encoder = joblib.load('mental_health_encoder.pkl')
physical_activity_encoder = joblib.load('physical_activity_encoder.pkl')
sleep_quality_encoder = joblib.load('sleep_quality_encoder.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Received data:", data)

        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Prepare input data (removed Stress_Level)
        input_data = {
            "Mental_Health_Condition": data.get('Mental_Health_Condition', 'None'),
            "Physical_Activity": data.get('Physical_Activity', 'None'),
            "Sleep_Quality": data.get('Sleep_Quality', 'Poor'),
        }

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Debugging: Print the DataFrame
        print("Input DataFrame before encoding:", input_df)

        # Encode categorical variables
        input_df['Mental_Health_Condition'] = mental_health_encoder.transform(input_df['Mental_Health_Condition'])
        input_df['Physical_Activity'] = physical_activity_encoder.transform(input_df['Physical_Activity'])
        input_df['Sleep_Quality'] = sleep_quality_encoder.transform(input_df['Sleep_Quality'])

        # Scale the input
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
