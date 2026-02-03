import os

apps = [
    "users", "department", "academic", "grade", "notifications", "core"
]

for app in apps:
    os.system(f"python manage.py startapp {app}")
    print(f"App {app} created successfully")