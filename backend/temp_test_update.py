import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User, Enseignant
from users.serializer import EnseignantSerializer
from rest_framework.exceptions import ValidationError

def test_update():
    print("Starting verification test...")
    
    # Check if test user exists, otherwise create
    username = "test_teacher_unique"
    email = "test@example.com"
    
    User.objects.filter(username=username).delete()
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password="oldpassword",
        first_name="Old",
        last_name="Name"
    )
    
    enseignant = Enseignant.objects.create(
        user=user,
        grade="ASS",
        statut="actif"
    )
    
    print(f"Created test enseignant: {enseignant}")
    
    # Simulate a PUT request with the same username/email
    data = {
        "user": {
            "username": username,
            "email": email,
            "firstName": "New",
            "lastName": "Name"
        },
        "grade": "MC",
        "status": "actif"
    }
    
    serializer = EnseignantSerializer(instance=enseignant, data=data, partial=False)
    
    try:
        if serializer.is_valid():
            print("Validation successful (No uniqueness error)!")
            updated_instance = serializer.save()
            print(f"Update successful! New name: {updated_instance.user.first_name} {updated_instance.user.last_name}")
            print(f"New grade: {updated_instance.grade}")
            
            # Additional check: update metadata without password should work now
            assert updated_instance.user.first_name == "New"
            assert updated_instance.grade == "MC"
        else:
            print("Validation failed:")
            print(serializer.errors)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Cleanup
        User.objects.filter(username=username).delete()
        print("Test cleanup finished.")

if __name__ == "__main__":
    test_update()
