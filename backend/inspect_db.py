import sqlite3

try:
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # Check department_filiere
    print("--- department_filiere ---")
    cursor.execute("PRAGMA table_info(department_filiere)")
    cols = [c[1] for c in cursor.fetchall()]
    print(f"Columns: {cols}")
    
    cursor.execute("SELECT * FROM department_filiere")
    rows = cursor.fetchall()
    print(f"Rows count: {len(rows)}")
    for row in rows:
        print(row)

    # Check department_departement (to see if we have departments to link to)
    print("\n--- department_departement ---")
    try:
        cursor.execute("SELECT * FROM department_departement")
        deps = cursor.fetchall()
        print(f"Departments count: {len(deps)}")
        for dep in deps:
            print(dep)
    except Exception as e:
        print(f"Error reading departments: {e}")

except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        conn.close()
