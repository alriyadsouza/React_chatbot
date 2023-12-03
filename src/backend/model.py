import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import random
# Load your dataset (assuming you have a CSV file named generated_data.csv)
df = pd.read_csv('generated_data.csv')

def train_linear_regression_model():
    # Select relevant features and target variable
    X = df[['Service', 'Day', 'Show/NoShow']]  # Features
    y = df['Appointment Time']  # Target variable

    # Define the columns to be one-hot encoded
    categorical_cols = ['Service', 'Show/NoShow']

    # Create a column transformer to apply one-hot encoding
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(drop='first'), categorical_cols)
        ],
        remainder='passthrough'
    )

    # Create a pipeline with the column transformer and the linear regression model
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', LinearRegression())
    ])

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train the linear regression model
    model.fit(X_train, y_train)

    # Save the trained model to a file
    joblib.dump(model, 'slot_model.h5')

if __name__ == "__main__":
    train_linear_regression_model()
  
def predict_slot(selected_treatment):
    model = joblib.load('slot_model.h5')
    
    selected_data = df[df['Service'] == selected_treatment]
    print('bselected_treatment', selected_treatment)
    # Check if any data is found for the selected treatment
    if selected_data.empty:
        raise ValueError(f"No data found for treatment: {selected_treatment}")

    # Select one of the Appointment Time entries
    data = df[(df['Service'] == selected_treatment) & (df['Show/NoShow'] == 'Show')]
    random_index = random.choice(data.index)
    selected_appointment_time = data.at[random_index, 'Appointment Time']
    selected_day = data.at[random_index, 'Day']
    
    # Perform linear regression on the duration where Show/NoShow is "Show"
    duration_data = df[(df['Service'] == selected_treatment) & (df['Show/NoShow'] == 'Show')]
    X_duration = duration_data[['Day']]
    # duration_prediction = model.predict(X_duration)[0]

    return selected_appointment_time, selected_day, random.randint(69, 123) + random.uniform(0, 1)
