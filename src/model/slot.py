import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Load your dataset (replace 'your_dataset.csv' with the actual path to your dataset)
dataset_path = 'generated_data.csv'
df = pd.read_csv(dataset_path)

# Filter the dataset based on the selected treatment type ('Dental fillings' in this example)
selected_treatment = 'Dental fillings'
filtered_df = df[df['Service'] == selected_treatment]

# Extract relevant features and target variable
X = filtered_df[['Duration']]  # Feature: Duration
y = filtered_df['Appointment Time']  # Target: Appointment Time

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Linear Regression model
linear_model = LinearRegression()
linear_model.fit(X_train_scaled, y_train)

# Evaluate the model on the test set
linear_model_score = linear_model.score(X_test_scaled, y_test)
print(f'Linear Regression Model Score: {linear_model_score}')

# Neural Network model using Keras
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    layers.Dense(1)
])

model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X_train_scaled, y_train, epochs=50, batch_size=32, validation_split=0.2)

# Evaluate the model on the test set
neural_network_model_score = model.evaluate(X_test_scaled, y_test)
print(f'Neural Network Model Score: {neural_network_model_score}')

# Use the trained models to make predictions
# Replace 'your_selected_duration' with the duration you want to predict
your_selected_duration = 10  # Example duration
scaled_duration = scaler.transform([[your_selected_duration]])

# Linear Regression prediction
linear_regression_prediction = linear_model.predict(scaled_duration)
print(f'Linear Regression Prediction: {linear_regression_prediction}')

# Neural Network prediction
neural_network_prediction = model.predict(scaled_duration)
print(f'Neural Network Prediction: {neural_network_prediction}')
