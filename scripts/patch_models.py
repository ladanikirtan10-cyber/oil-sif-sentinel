with open('backend/app/api/v1/endpoints/models.py', 'r', encoding='utf-8') as f:
    code = f.read()

old_tag = 'new_version_tag = f"sif-sentinel-v1.5-retrained"'
new_tag = '''count = db.query(ModelVersion).count() + 4
    new_version_tag = f"sif-sentinel-v1.{count}-retrained"'''

code = code.replace(old_tag, new_tag)

with open('backend/app/api/v1/endpoints/models.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Updated models.py version tag generation')
