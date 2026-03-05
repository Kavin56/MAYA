import os
import re

src_dir = 'packages/app/src'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = content
            # Safe text replacements inside tags or quotes
            new_content = re.sub(r'>( ?)(OpenWork|Openwork|openwork)( ?)<', r'>\1MAYA\3<', new_content)
            
            # Quoted terms
            new_content = re.sub(r'"OpenWork', '"MAYA', new_content)
            new_content = re.sub(r'OpenWork"', 'MAYA"', new_content)
            new_content = re.sub(r'\'OpenWork', '\'MAYA', new_content)
            new_content = re.sub(r'OpenWork\'', 'MAYA\'', new_content)
            
            # Replaces inside text nodes or comments
            new_content = re.sub(r'(?<=\s)OpenWork(?=[\s.,!])', 'MAYA', new_content)
            new_content = re.sub(r'(?<=\s)Openwork(?=[\s.,!])', 'MAYA', new_content)
            
            # Start of sentences like "OpenWork is..."
            new_content = re.sub(r'^OpenWork(?=[\s.,!])', 'MAYA', new_content, flags=re.MULTILINE)
            
            if new_content != content:
                print(f'Updated {path}')
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
