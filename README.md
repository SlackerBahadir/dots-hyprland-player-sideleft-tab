# dots-hyprland-player-sideleft-tab 🎵

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

### New screenshots on the way! 🚛💨

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

### 1. Player tab works, but other tabs do not show up

**Cause:**  
The default tab modules (`apiwidgets.js` and `toolbox.js`) export plain objects instead of widget-returning functions. AGS expects modules to export *functions that return widgets*, not the widgets themselves.

**Solution:**  
You need to wrap your exports in arrow functions that return the widget. Here's how to fix it:

---

#### 🛠️ Fixing `toolbox.js`

**Replace this:**
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
            // ...Other widget elements you have
            Box({ vexpand: true }),
            Name(),
        ]
    })
});
````

**With this:**

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
                // ...Other widget elements you have
                Box({ vexpand: true }),
                Name(),
            ]
        })
    });
}
```

---

#### 🛠️ Fixing `apiwidgets.js`

**Replace this:**

```js
export default apiWidgets;
```

**With this:**

```js
export default () => {
    return Widget.Scrollable({
        hscroll: 'never',
        vscroll: 'automatic',
        child: Widget.Box({
            vertical: true,
            children: [
                apiWidgets,
                // ...Other widget elements you have
            ]
        })
    });
}
```

---

✅ Once you make these changes, the other tabs should render properly just like the Player tab.
