import os

pkg_dirs = [
    "backend/app",
    "backend/app/core",
    "backend/app/database",
    "backend/app/ai",
    "backend/app/schemas",
    "backend/app/services",
    "backend/app/api",
    "backend/app/api/v1",
    "backend/app/api/v1/endpoints",
    "backend/tests"
]

for d in pkg_dirs:
    os.makedirs(d, exist_ok=True)
    init_file = os.path.join(d, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w", encoding="utf-8") as f:
            f.write("# Package init\n")

print("Created package directories and __init__.py files.")
