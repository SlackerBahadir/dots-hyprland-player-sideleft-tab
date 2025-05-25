# dots-hyprland-player-sideleft-tab 🎵

## UNDERDEVELOPMENT!
- This configration files in underdevelopment. There are some known bugs already and i try to solve them. But you can get the files and fix these if you want.
---

A sleek and customizable music player widget for [Aylur's GTK Shell (AGS)](https://github.com/Aylur/ags), designed for Hyprland and other Wayland-based environments. This module allows you to monitor and control music playback from multiple sources — all within your AGS sidebar.

### ❗ **NOTE**: This configration files only tested for [dots-hyprland](https://github.com/end-4/dots-hyprland) dot files. Don't expect install.sh script will magically make things work. But if you use dots-hyprland, feel free to use install.sh

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

![playertabonly](/assets/screenshots/playertabonly.png)
![multipleplayersopened](/assets/screenshots/multipleplayersopened.png)

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

---

## ❓ Troubleshooting

### 1. Player tab works but other tabs is not working.

**Because**: Default tabs codes returs plain objects, not widgets. You can fix them very easily tho.

**Solution**:

Remove these lines in the apiwidgets.js and toolbox.js files in the ~/.config/ags/modules/sideleft:

for *toolbox.js*

Remove these lines:

```js
export default Scrollable({
    hscroll: "never",
    vscroll: "automatic",
    child: Box({
        vertical: true,
        className: 'spacing-v-10',
        children: [
            QuickScripts(),
            Conversions(),
            ColorPicker(),
            Box({ vexpand: true }),
            Name(),
        ]
    })
});
```

and add these lines:

```js
export default () => {
    return Widget.Scrollable({
        hscroll: 'never',
        vscroll: 'automatic',
        child: Widget.Box({
            vertical: true,
            children: [
                QuickScripts(),
                Conversions(),
                ColorPicker(),
                Box({ vexpand: true }),
                Name(),
            ]
        })
    });
}
```

---

for *apiwidgets.js*

Remove this lines:

```js
export default apiWidgets;
```

and add these lines:

```js
export default () => {
    return Widget.Scrollable({
        hscroll: 'never',
        vscroll: 'automatic',
        child: Widget.Box({
            vertical: true,
            children: [
                apiWidgets,
            ]
        })
    });
}
```

With these, this should work!
