#!/usr/bin/env python3

import shutil
import os
from datetime import datetime
import sys

RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
NC = "\033[0m"

# SCRIPT RELATED PATHS
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SCRIPT_AGS_DIR = os.path.join(SCRIPT_DIR, "ags")
SCRIPT_MODULES_DIR = os.path.join(SCRIPT_AGS_DIR, "modules")
SCRIPT_SIDELEFT_DIR = os.path.join(SCRIPT_MODULES_DIR, "sideleft")
SCRIPT_TOOLS_DIR = os.path.join(SCRIPT_SIDELEFT_DIR, "tools")
SCRIPT_SCSS_DIR = os.path.join(SCRIPT_AGS_DIR, "scss")
SCRIPT_USER_OPTIONS_JSONC_FILE = os.path.join(SCRIPT_AGS_DIR, "user_options.jsonc")

# USER RELATED PATHS

BACKUP_DIR = os.path.join(SCRIPT_DIR, "backup")
os.makedirs(BACKUP_DIR, exist_ok=True)

CONFIG_DIR = os.path.expanduser("~/.config/ags")
MODULES_DIR = os.path.join(CONFIG_DIR, "modules")
SCSS_DIR = os.path.join(CONFIG_DIR, "scss")

## For sideleft installation
# there will be more content. I will add.

SIDELEFT_DIR = os.path.join(MODULES_DIR, "sideleft")
TOOLS_DIR = os.path.join(SIDELEFT_DIR, "tools")

SCRIPT_PLAYER_JS_FILE = os.path.join(SCRIPT_SIDELEFT_DIR, "player.js")
SCRIPT_SIDELEFT_JS_FILE = os.path.join(SCRIPT_SIDELEFT_DIR, "sideleft.js")
SCRIPT_FOOTER_JS_FILE = os.path.join(SCRIPT_TOOLS_DIR, "badico.js")
SCRIPT_SIDEBARS_SCSS_FILE = os.path.join(SCRIPT_SCSS_DIR, "_sidebars.scss")

print(f"{RED}[!] This installation executable is only suitable for the configuration of the dots-hyprland github repo.",
      f"If you do not know what you are doing, do not use this installation executable.{NC}")

choice = input(f"{YELLOW}Are you sure you want to continue? (y/n):{NC} ").strip().lower()

if choice != "y":
    print(f"{GREEN}[#] Exiting...{NC}")
    sys.exit(0)

timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
BACKUP_DIR_FOR_NOW = os.path.join(BACKUP_DIR, timestamp)

if os.path.isdir(CONFIG_DIR):
    print(f"{GREEN}[+] Backuping files from {CONFIG_DIR} to {BACKUP_DIR_FOR_NOW}...{NC}")

    shutil.copytree(CONFIG_DIR, BACKUP_DIR_FOR_NOW)
else:
    print(f"{RED}[!] AGS CONFIG DIRECTORY ({CONFIG_DIR}) NOT FOUND. Exiting...{NC}")
    raise FileNotFoundError(f"{CONFIG_DIR} not founded.")

if os.path.isdir(MODULES_DIR) and os.path.isdir(SIDELEFT_DIR) and os.path.isdir(TOOLS_DIR):
    SIDELEFT_COPYING_PATH = os.path.join(SIDELEFT_DIR, "sideleft.js")
    PLAYER_COPYING_PATH = os.path.join(SIDELEFT_DIR, "player.js")
    FOOTER_COPYING_PATH = os.path.join(TOOLS_DIR, "badico.js")
    SIDEBARS_SCSS_COPYING_PATH = os.path.join(SCSS_DIR, "_sidebars.scss")
    USER_OPTIONS_COPYING_FILE = os.path.join(CONFIG_DIR, "user_options.jsonc")

    files_to_copy = {
        SCRIPT_SIDELEFT_JS_FILE: SIDELEFT_COPYING_PATH,
        SCRIPT_PLAYER_JS_FILE: PLAYER_COPYING_PATH,
        SCRIPT_FOOTER_JS_FILE: FOOTER_COPYING_PATH,
        SCRIPT_SIDEBARS_SCSS_FILE: SIDEBARS_SCSS_COPYING_PATH,
        SCRIPT_USER_OPTIONS_JSONC_FILE: USER_OPTIONS_COPYING_FILE
    }

    for src, dst in files_to_copy.items():
        if src == SCRIPT_SIDEBARS_SCSS_FILE:
            with open(src, 'r') as code:
                code_content = code.read()

            try:
                with open(dst, 'a') as file:
                    file.write(f"\n{code_content}\n")
            except FileNotFoundError:
                print(f"{RED}[!] _sidebars.scss file is not exists. This file structure may be does not conform to the dots-hyprland structure.{NC}")
                print(f"{RED}[!] Not copied {src} to {dst}{NC}")

            continue

        if os.path.exists(dst):
            print(f"{RED}[!] {dst} exists. Removing...{NC}")

            os.remove(dst)

            print(f"{GREEN}[+] Copying {src} to {dst}...{NC}")

            shutil.copy(src, dst)
        else:
            print(f"{RED}[!] {dst} doesn't exists. This file structure may be does not conform to the dots-hyprland structure.{NC}")
            
            print(f"{GREEN}[+] Copying {src} to {dst}...{NC}")

            shutil.copy(src, dst)

else:
    print(f"{RED}[!] This {CONFIG_DIR} file structure does not match the dots-hyprland github repo. Exiting...")
    sys.exit(1)

print(f"{GREEN}[#] Installation completed. Please restart you AGS. Have fun! <3{NC}")
print("""
⠤⠤⠤⠤⠤⠤⢤⣄⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⠤⠶⠶⠶⠦⠤⠤⠤⠤⠤⢤⣤⣀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⠄⢂⣠⣭⣭⣕⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⠀⠀⠀⠤⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉
⠀⠀⢀⠜⣳⣾⡿⠛⣿⣿⣿⣦⡠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⣤⣤⣤⣤⣤⣤⣤⣤⣤⣍⣀⣦⠦⠄⣀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠠⣄⣽⣿⠋⠀⡰⢿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡿⠛⠛⡿⠿⣿⣿⣿⣿⣿⣿⣷⣶⣿⣁⣂⣤⡄⠀⠀⠀⠀⠀⠀
⢳⣶⣼⣿⠃⠀⢀⠧⠤⢜⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⠟⠁⠀⠀⠀⡇⠀⣀⡈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠁⠐⠀⣀⠀⠀
⠀⠙⠻⣿⠀⠀⠀⠀⠀⠀⢹⣿⣿⡝⢿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡿⠋⠀⠀⠀⠀⠠⠃⠁⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⡿⠋⠀⠀
⠀⠀⠀⠙⡄⠀⠀⠀⠀⠀⢸⣿⣿⡃⢼⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⡏⠉⠉⠻⣿⡿⠋⠀⠀⠀⠀
⠀⠀⠀⠀⢰⠀⠀⠰⡒⠊⠻⠿⠋⠐⡼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⠀⠀⠀⠀⣿⠇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠸⣇⡀⠀⠑⢄⠀⠀⠀⡠⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢖⠠⠤⠤⠔⠙⠻⠿⠋⠱⡑⢄⠀⢠⠟⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠉⠒⠒⠻⠶⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠡⢀⡵⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠦⣀⠀⠀⠀⠀⠀⢀⣤⡟⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠙⠛⠓⠒⠲⠿⢍⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
""")
