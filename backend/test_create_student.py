import requests
import json

url = "http://localhost:8000/api/users/etudiants/"
headers = {"Content-Type": "application/json"}
data = {
    "user": {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@test.com",
        "username": "TEST001",
        "phone": "699999999",
        "password": "test1234",
        "role": "student",
        "is_active": True
    },
    "filiere": 1,
    "level": "L1",
    "cycle": "ING",
    "status": "active"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
