#!/bin/bash

# THIS SCRIPT IS NOT PERFECT. DO NOT USE IT. OR IT WILL BE REMVOE YOUR PRECIOUS CONFIG FILES.

CONFIG_DIR="$HOME/.config/ags"
MODULE_DIR="$CONFIG_DIR/modules"
SIDELEFT_DIR="$MODULE_DIR/sideleft"
TOOLS_DIR="$SIDELEFT_DIR/tools"

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

echo -e "${GREEN}[*] Starting AGS module installer...${NC}"

if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "${YELLOW}[!] '$CONFIG_DIR' does not exist. Creating it...${NC}"
    mkdir -p "$CONFIG_DIR"
else
    echo -e "${GREEN}[✓] '$CONFIG_DIR' exists.${NC}"
fi

for dir in "$MODULE_DIR" "$SIDELEFT_DIR" "$TOOLS_DIR"; do
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}[!] '$dir' not found. Creating it...${NC}"
        mkdir -p "$dir"
    else
        echo -e "${GREEN}[✓] '$dir' exists.${NC}"
    fi
done

SIDELEFT_JS_PATH="$SIDELEFT_DIR/sideleft.js"
if [ -f "$SIDELEFT_JS_PATH" ]; then
    echo -e "${YELLOW}[-] Existing 'sideleft.js' found. Removing...${NC}"
    rm "$SIDELEFT_JS_PATH"
fi
cp "./ags/sideleft.js" "$SIDELEFT_JS_PATH"
echo -e "${GREEN}[+] 'sideleft.js' installed.${NC}"

PLAYER_JS_PATH="$SIDELEFT_DIR/player.js"
if [ -f "$PLAYER_JS_PATH" ]; then
    echo -e "${YELLOW}[-] Existing 'player.js' found. Removing...${NC}"
    rm "$PLAYER_JS_PATH"
fi
cp "./ags/player.js" "$PLAYER_JS_PATH"
echo -e "${GREEN}[+] 'player.js' installed.${NC}"

BADICO_JS_PATH="$TOOLS_DIR/badico.js"
if [ -f "$BADICO_JS_PATH" ]; then
    echo -e "${YELLOW}[-] Existing 'badico.js' found. Removing...${NC}"
    rm "$BADICO_JS_PATH"
fi
cp "./ags/badico.js" "$BADICO_JS_PATH"
echo -e "${GREEN}[+] 'badico.js' installed.${NC}"

if command -v ags &> /dev/null; then
    echo -e "${GREEN}[✓] Restarting AGS...${NC}"
    ags -r
else
    echo -e "${YELLOW}[!] 'ags' command not found. Trying fallback...${NC}"
    killall agsv1 2>/dev/null
    sleep 1
    agsv1 & disown
    echo -e "${GREEN}[✓] Restarted agsv1.${NC}"
fi

echo -e "${GREEN}✔ Installation complete.${NC}"
