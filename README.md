# dots-hyprland-player-sideleft-tab 🎵

A sleek and customizable music player widget for [Aylur's GTK Shell (AGS)](https://github.com/Aylur/ags), designed for Hyprland and other Wayland-based environments. This module allows you to monitor and control music playback from multiple sources — all within your AGS sidebar.

## ❗ **NOTE**: This configration files only tested for [dots-hyprland](https://github.com/end-4/dots-hyprland) dot files. Don't expect install.sh script will magically make thing work.

---

## ✨ Features

- 🎧 Displays currently playing track from multiple backends:
  - Firefox (via MPRIS)
  - Spotify
  - ncspot (Spotify TUI client)
  - Plasma browser integration
  - And more!
- ⏯ Playback controls: play, pause, skip
- 💬 Metadata display: track title, artist, duration
- 🎨 Easy to customize and extend

---

## 📸 Screenshot

> The player integrates seamlessly into the sidebar layout:

![screenshot]()

---

## ⚙️ Requirements

- [dots-hyprland](https://github.com/end-4/dots-hyprland) dot files. (You can customize this code to your dots files if you want to!)
- AGS (Aylur's GTK Shell)
- Wayland compositor (Hyprland recommended)
- `playerctl` (for extended media control)
- Media players that support [MPRIS](https://specifications.freedesktop.org/mpris-spec/latest/)

---

## 🚀 Installation

```bash
git clone https://github.com/SlackerBahadir/dots-hyprland-player-sideleft-tab.git
cd dots-hyprland-player-sideleft-tab
chmod +x install.sh
./install.sh
```
