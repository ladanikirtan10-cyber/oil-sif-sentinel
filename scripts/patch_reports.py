with open('backend/app/api/v1/endpoints/reports.py', 'r', encoding='utf-8') as f:
    code = f.read()

old_id_gen = """    # 1. Generate unique UID
    count = db.query(Report).count() + 1000
    report_uid = f"OIL-2026-{count}\""""

new_id_gen = """    # 1. Generate unique UID
    from sqlalchemy import func
    max_id = db.query(func.max(Report.id)).scalar() or 0
    report_uid = f"OIL-2026-{1000 + max_id + 1}\""""

code = code.replace(old_id_gen, new_id_gen)

with open('backend/app/api/v1/endpoints/reports.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Updated reports.py unique UID generation')
