import sys
try:
    import django
    import rest_framework
    import drf_yasg
    import corsheaders
    import django_filters
    from xhtml2pdf import pisa
    print("All imports successful")
except ImportError as e:
    print(f"Failed to import: {e}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
