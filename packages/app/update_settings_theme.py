
import re
import os

file_path = r'c:\Users\Surya\Downloads\MAYA-master\MAYA-master\packages\app\src\app\pages\settings.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bg-gray-2/30 and bg-gray-2/50 with dark:bg-black appended if not already present
# The regex looks for bg-gray-2/30 or 50, followed by NOT (space + dark:bg-black)
new_content = re.sub(r'(bg-gray-2/(30|50))(?!\s+dark:bg-black)', r'\1 dark:bg-black', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced instances.")
