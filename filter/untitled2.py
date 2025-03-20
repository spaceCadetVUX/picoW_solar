import firebase_admin
from firebase_admin import credentials, db
import time

# Initialize Firebase only if it hasn't been initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(r"C:/Users/vusu3/Downloads/schooldatabase-63900-firebase-adminsdk-6ztht-c2b838ee97.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://schooldatabase-63900-default-rtdb.firebaseio.com/'  # Replace with your DB URL
    })

# Reference to the "main" node
teachers_ref = db.reference('main')

# Corrected variable name
main = "86gQQY9K1Xc3CqQaQ6MUO9nu5472"

# Data structure
data = {
    main: {
        "ID": 1,
        "User":{
            "userAvt":"https://i.pinimg.com/474x/f0/1e/b7/f01eb737b4d16d25c8362c58d55ade1c.jpg"  
        },
        "rom1":{
            "buttons":{
                "automatic":False,
                "button2":False,
                },
            "scollers":{
                "X-axis":0,
                "y-axis":0,
                "sensitivity":1,
                },
            "co-ordinate":{
                "c1":0,
                "c2":0,
                },
            "light_parameter":{
                "S1":0,
                "S2":0,
                "S3":0,
                "S4":0,
                }
            }
    }
}

# Push data to Firebase
teachers_ref.update(data)
print("Data uploaded successfully!")
