
import glob
import re
import os

files = glob.glob(r'c:\Users\Surya\Downloads\MAYA-master\MAYA-master\packages\app\src\app\pages\*.tsx')

patterns = [
    # Main cards (bg-gray-2/30 ...)
    (r'bg-gray-2/30\s+dark:bg-black\s+border\s+border-gray-[0-9/]+\s+rounded-2xl', 'card-glass'),
    (r'bg-gray-2/30\s+border\s+border-gray-[0-9/]+\s+rounded-2xl', 'card-glass'),
    
    # Generic cards with bg-gray-X and border-gray-X and rounded-2xl
    # We use non-greedy match .*? for potential classes in between if needed, but simple is better
    (r'bg-gray-[0-9/]+\s+border\s+border-gray-[0-9/]+\s+rounded-2xl\s+p-[0-9]', 'card-glass p-5'), 
    # Note: p-[0-9] catches p-5, p-4 etc. We replace with card-glass p-5 (or maybe we should keep the padding?)
    # Let's use a function for replacement to preserve padding if possible, or just be specific.
    (r'bg-gray-[0-9/]+\s+border\s+border-gray-[0-9/]+\s+rounded-2xl\s+p-5', 'card-glass p-5'),
    (r'bg-gray-[0-9/]+\s+border\s+border-gray-[0-9/]+\s+rounded-2xl\s+p-4', 'card-glass p-4'),

    # Smaller panels (bg-gray-1 ...)
    (r'bg-gray-1\s+p-3\s+rounded-xl\s+border\s+border-gray-6', 'glass-panel p-3 rounded-xl'),
    (r'bg-gray-1\s+p-4\s+rounded-xl\s+border\s+border-gray-6', 'glass-panel p-4 rounded-xl'),
    
    # Reverse order (border ... bg-gray-1)
    (r'border\s+border-gray-[0-9/]+\s+bg-gray-1', 'glass-panel'),
    # StatusPill in identities.tsx: border border-gray-4 bg-gray-1
    # We want to keep rounded-lg and px/py if they are outside the match
    # Original: rounded-lg border border-gray-4 bg-gray-1 px-3.5 py-2.5
    # Matched: border border-gray-4 bg-gray-1
    # Replacement: glass-panel
    # Result: rounded-lg glass-panel px-3.5 py-2.5
]

for file_path in files:
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Done updating files.")
