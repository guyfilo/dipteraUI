import os
import subprocess
while True:
    name = input("Enter component name: ")
    path = f"src/components/{name}"
    os.makedirs(path, exist_ok=True)
    with open(f"{path}/index.js", "w+") as f:
        f.write(f'export {{{name}}} from "./{name}";')
    subprocess.run([f"gedit",f"{path}/{name}.jsx"])
    subprocess.run([f"gedit", f"{path}/style.css"])