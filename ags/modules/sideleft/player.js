import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import { MaterialIcon } from '../.commonwidgets/materialicon.js';
import { setupCursorHover } from '../.widgetutils/cursorhover.js';
import { hasPlasmaIntegration } from '../.miscutils/system.js';
import BadiCo from './tools/badico.js';

const { Box, Button, Label, Slider, Scrollable, Revealer, Icon } = Widget;
const { execAsync, exec } = Utils;

// Player state for multiple players
let players = [];
let currentVolume = 50;
let playersContainer;

// Filter function to remove unnecessary browser buses when plasma integration is enabled
function isRealPlayer(playerName) {
    return (
        // Remove unnecessary native buses from browsers if there's plasma integration
        !(hasPlasmaIntegration && playerName.includes('firefox')) &&
        !(hasPlasmaIntegration && playerName.includes('chromium')) &&
        // playerctld just copies other buses and we don't need duplicates
        !playerName.includes('playerctld') &&
        // Non-instance mpd bus
        !(playerName.endsWith('.mpd') && !playerName.endsWith('MediaPlayer2.mpd'))
    );
}

// Clean up player name for display
const cleanPlayerName = (playerName) => {
    // Remove .instance... suffix
    let cleanName = playerName.replace(/\.instance\d+$/, '');
    
    // Remove common prefixes that aren't needed for display
    cleanName = cleanName.replace(/^org\.mpris\.MediaPlayer2\./, '');
    
    // Handle specific cases for better display names
    const nameMap = {
        'spotify': 'Spotify',
        'firefox': 'Firefox',
        'chromium': 'Chromium',
        'vlc': 'VLC',
        'mpv': 'MPV',
        'rhythmbox': 'Rhythmbox',
        'clementine': 'Clementine',
        'amarok': 'Amarok',
        'audacious': 'Audacious',
        'banshee': 'Banshee',
        'deadbeef': 'DeaDBeeF',
        'gmusicbrowser': 'GMusicBrowser',
        'guayadeque': 'Guayadeque',
        'juk': 'JuK',
        'lollypop': 'Lollypop',
        'museeks': 'Museeks',
        'nuclear': 'Nuclear',
        'olivia': 'Olivia',
        'parlatype': 'Parlatype',
        'pragha': 'Pragha',
        'quodlibet': 'Quod Libet',
        'rhythmbox3': 'Rhythmbox',
        'sayonara': 'Sayonara',
        'strawberry': 'Strawberry',
        'tomahawk': 'Tomahawk',
        'yarock': 'Yarock',
        'ncspot': 'Ncspot',
        'cmus': 'cmus',
        'moc': 'MOC',
        'mpd': 'MPD'
    };
    
    // Convert to lowercase for lookup, but preserve original case if not found
    const lowerName = cleanName.toLowerCase();
    const displayName = nameMap[lowerName] || cleanName;
    
    // Capitalize first letter if it's not already a known name
    if (!nameMap[lowerName] && displayName.length > 0) {
        return displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }
    
    return displayName;
};

// Create player data structure
const createPlayerData = (playerName) => ({
    name: playerName,
    displayName: cleanPlayerName(playerName),
    isPlaying: false,
    currentTrack: { title: 'No track playing', artist: '', album: '', artUrl: '' },
    isShuffled: false,
    repeatMode: 'None',
    position: 0,
    duration: 0,
    interval: null, // Store interval ID for cleanup
});

const volumeSlider = Slider({
    className: 'sidebar-slider volume-slider',
    hexpand: true,
    drawValue: false,
    min: 0,
    max: 100,
    step: 5,
    value: currentVolume,
    onChange: ({ value }) => {
        currentVolume = Math.round(value);
        execAsync(['pactl', 'set-sink-volume', '@DEFAULT_SINK@', `${currentVolume}%`]).catch(() => {
            console.log('Failed to set volume');
        });
        volumeLabel.label = `${currentVolume}%`;
    },
});

const volumeLabel = Label({
    className: 'txt-smallie txt-subtext',
    label: `${currentVolume}%`,
});

// Download and cache album art
const downloadAlbumArt = async (url, trackId) => {
    if (!url || url === '') return null;
    
    try {
        const cacheDir = `${Utils.HOME}/.cache/ags/media/`;
        const fileName = `${trackId.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        const filePath = `${cacheDir}${fileName}`;
        
        await execAsync(['mkdir', '-p', cacheDir]);
        
        try {
            await execAsync(['test', '-f', filePath]);
            return filePath;
        } catch {
            await execAsync(['curl', '-s', '-o', filePath, url]);
            return filePath;
        }
    } catch (error) {
        console.log('Failed to download album art:', error);
        return null;
    }
};

// Utility functions for time formatting
const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Check if player is actually running and has media
const isPlayerActive = async (playerName) => {
    try {
        // Check if player exists and has a track
        const status = await execAsync(['playerctl', '-p', playerName, 'status']);
        const metadata = await execAsync(['playerctl', '-p', playerName, 'metadata', '--format', '{{ title }}']);
        
        // Player is active if it has a status and some metadata
        return status.trim() !== '' && metadata.trim() !== '' && metadata.trim() !== 'No track playing';
    } catch {
        return false;
    }
};

// Remove player widget and clean up
const removePlayer = (playerName) => {
    const playerIndex = players.findIndex(p => p.name === playerName);
    if (playerIndex !== -1) {
        const playerData = players[playerIndex];
        
        // Clear the update interval
        if (playerData.interval) {
            clearInterval(playerData.interval);
        }
        
        // Remove from players array
        players.splice(playerIndex, 1);
        
        // Update the container children
        updatePlayersContainer();
        
        console.log(`Removed inactive player: ${playerName}`);
    }
};

// Update players container with current active players
const updatePlayersContainer = () => {
    if (playersContainer) {
        playersContainer.children = players.map(p => p.widget);
    }
};

// Create player widget for each player
const createPlayerWidget = (playerName) => {
    const playerData = createPlayerData(playerName);
    
    // Album art container with rounded styling - Enhanced with better rounded corners
    const albumArtContainer = Box({
        className: 'sidebar-albumart-container',
        css: `
            border-radius: 16px; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%);
            border: 1px solid rgba(255,255,255,0.1);
        `,
        child: Icon({
            className: 'sidebar-albumart',
            size: 72,
            icon: 'audio-x-generic-symbolic',
            css: `
                border-radius: 16px;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            `,
        }),
    });
    
    // Reference to the actual icon for updates
    const albumArt = albumArtContainer.child;

    // Track info labels
    const trackTitle = Label({
        className: 'txt txt-large margin-bottom-5',
        label: playerData.currentTrack.title,
        hexpand: true,
        truncate: 'end',
        xalign: 0,
        wrap: true,
    });

    const trackArtist = Label({
        className: 'txt-subtext txt-norm',
        label: playerData.currentTrack.artist,
        hexpand: true,
        truncate: 'end',
        xalign: 0,
    });

    const trackAlbum = Label({
        className: 'txt-subtext txt-smallie margin-top-5',
        label: playerData.currentTrack.album,
        hexpand: true,
        truncate: 'end',
        xalign: 0,
    });

    // Now its really fixed.
    const positionSlider = Slider({
        className: 'sidebar-slider position-slider',
        hexpand: true,
        drawValue: false,
        min: 0,
        max: 100,
        step: 1,
        value: 0,
        onChange: ({ value }) => {
            if (playerData.duration > 0) {
                const position = (value / 100) * playerData.duration;
                execAsync(['playerctl', '-p', playerName, 'position', position.toString()]).catch(() => {
                    console.log('Failed to set position');
                });
            }
        },
    });

    const timeLabel = Label({
        className: 'txt-smallie txt-subtext margin-top-5',
        label: '0:00 / 0:00',
        xalign: 0,
    });

    // Control buttons
    const playPauseIcon = MaterialIcon('play_arrow', 'large');
    const playPauseButton = Button({
        className: 'sidebar-controlbtnr',
        child: playPauseIcon,
        tooltipText: 'Play/Pause',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'play-pause']).catch(() => {
                console.log('No player available');
            });
        },
        setup: setupCursorHover,
    });

    const prevButton = Button({
        className: 'sidebar-controlbtn',
        child: MaterialIcon('skip_previous', 'large'),
        tooltipText: 'Previous track',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'previous']).catch(() => {
                console.log('No player available');
            });
        },
        setup: setupCursorHover,
    });

    const nextButton = Button({
        className: 'sidebar-controlbtn',
        child: MaterialIcon('skip_next', 'large'),
        tooltipText: 'Next track',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'next']).catch(() => {
                console.log('No player available');
            });
        },
        setup: setupCursorHover,
    });

    // Quick action buttons
    const repeatButton = Button({
        className: 'sidebar-controlbtn txt-smallie',
        child: MaterialIcon('repeat', 'norm'),
        tooltipText: 'Toggle repeat',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'loop']).then(currentLoop => {
                let nextLoop;
                switch(currentLoop.trim()) {
                    case 'None':
                        nextLoop = 'Playlist';
                        break;
                    case 'Playlist':
                        nextLoop = 'Track';
                        break;
                    case 'Track':
                        nextLoop = 'None';
                        break;
                    default:
                        nextLoop = 'Playlist';
                }
                execAsync(['playerctl', '-p', playerName, 'loop', nextLoop]).then(() => {
                    setTimeout(() => updateRepeatState(), 100);
                });
            }).catch(() => {
                console.log('Loop control not supported');
            });
        },
        setup: setupCursorHover,
    });

    const favoriteButton = Button({
        className: 'sidebar-controlbtn txt-smallie',
        child: MaterialIcon('favorite_border', 'norm'),
        tooltipText: 'Add to favorites',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'metadata', '--format', '{{ title }} - {{ artist }}']).then(track => {
                execAsync(['sh', '-c', `echo "${track}" >> ~/.config/music-favorites.txt`]).then(() => {
                    console.log(`Added to favorites: ${track}`);
                    if (favoriteButton.child && favoriteButton.child.label !== undefined) {
                        const originalIcon = favoriteButton.child.label;
                        favoriteButton.child.label = 'favorite';
                        setTimeout(() => {
                            favoriteButton.child.label = originalIcon;
                        }, 2000);
                    }
                }).catch(err => {
                    console.log('Could not save to favorites file:', err);
                });
            }).catch(() => {
                console.log('Could not get track info for favorites');
            });
        },
        setup: setupCursorHover,
    });

    const shuffleButton = Button({
        className: 'sidebar-controlbtn txt-smallie',
        child: MaterialIcon('shuffle', 'norm'),
        tooltipText: 'Toggle shuffle',
        onClicked: () => {
            execAsync(['playerctl', '-p', playerName, 'shuffle']).then(shuffleStatus => {
                const nextShuffle = shuffleStatus.trim() === 'On' ? 'Off' : 'On';
                execAsync(['playerctl', '-p', playerName, 'shuffle', nextShuffle]).then(() => {
                    setTimeout(() => updateShuffleState(), 100);
                });
            }).catch(() => {
                console.log('Shuffle control not supported');
            });
        },
        setup: setupCursorHover,
    });

    // Player name label - Now uses the cleaned display name
    const playerNameLabel = Label({
        className: 'txt-subtext txt-smallie',
        label: playerData.displayName,
        xalign: 0,
    });

    // Update functions for this specific player
    const updateRepeatState = () => {
        execAsync(['playerctl', '-p', playerName, 'loop'])
            .then(status => {
                const currentLoop = status.trim();
                playerData.repeatMode = currentLoop;
                
                let iconName, isEnabled;
                switch(currentLoop) {
                    case 'Track':
                        iconName = 'repeat_one';
                        isEnabled = true;
                        break;
                    case 'Playlist':
                        iconName = 'repeat';
                        isEnabled = true;
                        break;
                    case 'None':
                    default:
                        iconName = 'repeat';
                        isEnabled = false;
                        break;
                }
                
                if (repeatButton.child && repeatButton.child.label !== undefined) {
                    repeatButton.child.label = iconName;
                }
                repeatButton.toggleClassName('sidebar-controlbtn-enabled', isEnabled);
            })
            .catch(() => {
                if (repeatButton.child && repeatButton.child.label !== undefined) {
                    repeatButton.child.label = 'repeat';
                }
                repeatButton.toggleClassName('sidebar-controlbtn-enabled', false);
            });
    };

    const updateShuffleState = () => {
        execAsync(['playerctl', '-p', playerName, 'shuffle'])
            .then(status => {
                const isShuffled = status.trim() === 'On';
                playerData.isShuffled = isShuffled;
                shuffleButton.toggleClassName('sidebar-controlbtn-enabled', isShuffled);
            })
            .catch(() => {
                shuffleButton.toggleClassName('sidebar-controlbtn-enabled', false);
            });
    };

    const updatePlayerInfo = async () => {
        // Check if player is still active first
        const isActive = await isPlayerActive(playerName);
        if (!isActive) {
            // Player is no longer active, remove it
            removePlayer(playerName);
            return;
        }

        // Update track info and album art
        execAsync(['playerctl', '-p', playerName, 'metadata', '--format', '{{ title }}||{{ artist }}||{{ album }}||{{ mpris:artUrl }}'])
            .then(output => {
                const [title, artist, album, artUrl] = output.split('||');
                playerData.currentTrack = {
                    title: title || 'Unknown track',
                    artist: artist || 'Unknown artist',
                    album: album || '',
                    artUrl: artUrl || ''
                };
                
                trackTitle.label = playerData.currentTrack.title;
                trackArtist.label = playerData.currentTrack.artist;
                trackAlbum.label = playerData.currentTrack.album;
                
                // Update album art with rounded corners
                if (playerData.currentTrack.artUrl) {
                    downloadAlbumArt(playerData.currentTrack.artUrl, playerData.currentTrack.title)
                        .then(fileName => {
                            if (fileName) {
                                // Use CSS background-image for better rounded corner support
                                albumArt.css = `
                                    border-radius: 16px;
                                    background-image: url('${fileName}');
                                    background-size: cover;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    min-width: 72px;
                                    min-height: 72px;
                                `;
                                albumArt.icon = ''; // Clear the icon to show background image
                            } else {
                                albumArt.css = `
                                    border-radius: 16px;
                                    background-size: cover;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                `;
                                albumArt.icon = 'audio-x-generic-symbolic';
                            }
                        })
                        .catch(() => {
                            albumArt.css = `
                                border-radius: 16px;
                                background-size: cover;
                                background-position: center;
                                background-repeat: no-repeat;
                            `;
                            albumArt.icon = 'audio-x-generic-symbolic';
                        });
                } else {
                    albumArt.css = `
                        border-radius: 16px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                    `;
                    albumArt.icon = 'audio-x-generic-symbolic';
                }
            })
            .catch(() => {
                // Player might be inactive, this will be caught by isPlayerActive check
                console.log(`Failed to get metadata for ${playerName}`);
            });

        // Update play/pause button
        execAsync(['playerctl', '-p', playerName, 'status'])
            .then(status => {
                playerData.isPlaying = status.trim() === 'Playing';
                const newIcon = playerData.isPlaying ? 'pause' : 'play_arrow';
                
                // Update the icon label if it has a label property
                if (playPauseIcon && playPauseIcon.label !== undefined) {
                    playPauseIcon.label = newIcon;
                }
                // Alternative method: recreate the child
                else {
                    playPauseButton.child = MaterialIcon(newIcon, 'large');
                }
                
                playPauseButton.toggleClassName('sidebar-controlbtn-enabled', playerData.isPlaying);
            })
            .catch(() => {
                // Reset to play icon on error
                if (playPauseIcon && playPauseIcon.label !== undefined) {
                    playPauseIcon.label = 'play_arrow';
                } else {
                    playPauseButton.child = MaterialIcon('play_arrow', 'large');
                }
                playPauseButton.toggleClassName('sidebar-controlbtn-enabled', false);
            });

        // Update position and duration
        Promise.all([
            execAsync(['playerctl', '-p', playerName, 'position']).catch(() => '0'),
            execAsync(['playerctl', '-p', playerName, 'metadata', 'mpris:length']).catch(() => '0')
        ]).then(([positionStr, durationStr]) => {
            const position = parseFloat(positionStr) || 0;
            const duration = parseFloat(durationStr) / 1000000 || 0; // Convert from microseconds
            
            playerData.position = position;
            playerData.duration = duration;
            
            if (duration > 0) {
                const percentage = Math.min(100, Math.max(0, (position / duration) * 100));
                positionSlider.value = percentage;
                timeLabel.label = `${formatTime(position)} / ${formatTime(duration)}`;
            } else {
                positionSlider.value = 0;
                timeLabel.label = '0:00 / 0:00';
            }
        });

        // Update shuffle and repeat states
        updateRepeatState();
        updateShuffleState();
    };

    // Start updating this player and store interval ID
    playerData.interval = setInterval(updatePlayerInfo, 1000);
    updatePlayerInfo(); // Initial update

    const playerWidget = Box({
        vertical: true,
        className: 'sidebar-group spacing-v-10',
        children: [
            // Player name and track info
            Box({
                vertical: true,
                className: 'spacing-v-5',
                children: [
                    playerNameLabel,
                    Box({
                        className: 'spacing-h-10',
                        children: [
                            albumArtContainer,
                            Box({
                                vertical: true,
                                hexpand: true,
                                className: 'spacing-v-5',
                                children: [
                                    trackTitle,
                                    trackArtist,
                                    trackAlbum,
                                ],
                            }),
                        ],
                    }),
                ],
            }),

            // Position slider and time
            Box({
                vertical: true,
                className: 'spacing-v-5',
                children: [
                    positionSlider,
                    timeLabel,
                ],
            }),

            // Control buttons
            Box({
                className: 'spacing-h-10',
                homogeneous: true,
                children: [
                    prevButton,
                    playPauseButton,
                    nextButton,
                ],
            }),

            // Quick actions
            Box({
                className: 'spacing-h-5',
                homogeneous: true,
                children: [
                    repeatButton,
                    shuffleButton,
                    favoriteButton,
                ],
            }),
        ],
    });

    // Store the widget reference in player data
    playerData.widget = playerWidget;
    
    return playerWidget;
};

// Get available players and create widgets - Now with plasma integration filtering
const getAvailablePlayers = () => {
    return execAsync(['playerctl', '-l'])
        .then(output => {
            const allPlayers = output.trim().split('\n').filter(player => player.length > 0);
            // Filter players based on plasma integration
            return allPlayers.filter(player => isRealPlayer(player));
        })
        .catch(() => []);
};

// Update system volume
const updateSystemVolume = () => {
    execAsync(['pactl', 'get-sink-volume', '@DEFAULT_SINK@'])
        .then(output => {
            const match = output.match(/(\d+)%/);
            if (match) {
                const newVolume = parseInt(match[1]);
                if (newVolume !== currentVolume) {
                    currentVolume = newVolume;
                    volumeSlider.value = Math.min(100, Math.max(0, currentVolume));
                    volumeLabel.label = `${currentVolume}%`;
                }
            }
        })
        .catch(() => {
            console.log('Failed to get volume');
        });
};

// Update volume every 1 seconds
setInterval(updateSystemVolume, 1000);
updateSystemVolume(); // Initial update

const playerWidget = () => {
    console.log('Creating enhanced player widget with multiple player support and plasma integration filtering (AGS v1)');
    
    playersContainer = Box({
        vertical: true,
        className: 'spacing-v-15',
    });

    // Update players list periodically
    const updatePlayers = async () => {
        try {
            const availablePlayers = await getAvailablePlayers();
            const currentPlayerNames = players.map(p => p.name);
            
            // Add new players
            for (const playerName of availablePlayers) {
                if (!currentPlayerNames.includes(playerName)) {
                    const isActive = await isPlayerActive(playerName);
                    if (isActive) {
                        console.log(`Adding new active player: ${playerName}`);
                        const playerWidget = createPlayerWidget(playerName);
                        players.push({ 
                            name: playerName, 
                            widget: playerWidget,
                            interval: null
                        });
                        updatePlayersContainer();
                    }
                }
            }

            // Check existing players for activity
            for (let i = players.length - 1; i >= 0; i--) {
                const player = players[i];
                const isActive = await isPlayerActive(player.name);
                if (!isActive) {
                    console.log(`Removing inactive player: ${player.name}`);
                    removePlayer(player.name);
                }
            }
        } catch (error) {
            console.log('Error updating players:', error);
        }
    };

    // Update players list every 1 seconds (more frequent for better responsiveness)
    setInterval(updatePlayers, 1000);
    updatePlayers(); // Initial update

    return Box({
        vertical: true,
        vexpand: true,
        children: [
            // Main scrollable content area
            Scrollable({
                vexpand: true,
                hscroll: 'never',
                vscroll: 'automatic',
                child: Box({
                    vertical: true,
                    className: 'spacing-v-15',
                    children: [
                        // Header
                        Box({
                            className: 'sidebar-group-invisible spacing-v-5',
                            vertical: true,
                            children: [
                                Label({
                                    className: 'txt txt-title-small',
                                    label: '🎵 Music Player',
                                    xalign: 0,
                                }),
                            ],
                        }),

                        // Volume control at the top
                        Box({
                            className: 'sidebar-group',
                            vertical: true,
                            children: [
                                Label({
                                    className: 'txt-subtext txt-smallie margin-bottom-10',
                                    label: 'System Volume',
                                    xalign: 0,
                                }),
                                Box({
                                    className: 'spacing-h-10',
                                    children: [
                                        MaterialIcon('volume_up', 'norm'),
                                        volumeSlider,
                                        volumeLabel,
                                    ],
                                }),
                            ],
                        }),

                        // Players container
                        playersContainer,
                    ],
                }),
            }),
            Box({
                className: 'sidebar-group',
                vertical: true,
                children: [
                    BadiCo(),
                ],
            }),
        ],
    });
};

// It's work tho. 🤔
export default playerWidget;
