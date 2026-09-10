from app.database.models import Report

def bootstrap_database(db):
    count = db.query(Report).count()
    if count == 0:
        print("Empty database detected. Bootstrapping with initial realistic safety records...")
        from scripts.generate_demo_data import generate_reports
        generate_reports(count=120)
