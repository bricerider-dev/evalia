def test_import(name):
    try:
        __import__(name)
        print(f"OK: {name}")
    except ImportError as e:
        print(f"FAIL: {name} - {e}")
    except Exception as e:
        print(f"ERROR: {name}")
        import traceback
        traceback.print_exc()

test_import('django')
test_import('rest_framework')
test_import('drf_yasg')
test_import('corsheaders')
test_import('django_filters')
test_import('xhtml2pdf')
test_import('reportlab')
