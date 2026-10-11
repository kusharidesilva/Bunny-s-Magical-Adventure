# Bunny's Magical Adventure — Design System

## Direction

An Organic storybook interface frames a playful platform game. The opening spread places a three-line serif title and tactile green controls beside an unobstructed woodland illustration and expressive bunny. Three illustrated world previews anchor the bottom of the composition. Matching artwork appears in world selection and gameplay.

## Palette

| Token | Value | Use |
|---|---|---|
| Forest | `#283618` | Primary text, focus, outlines |
| Moss | `#606C38` | Deep foliage, secondary emphasis |
| Sage | `#8B9D83` | Page background, scenery |
| Sand | `#E8DCC7` | Cards, overlays, canvas frame |
| Oat | `#D4B895` | Standard controls |
| Clay | `#B08B6E` | Secondary terrain and scenery |
| Terracotta | `#C66B3D` | Primary actions and gems |
| Ochre | `#C08E3A` | Stars, light, rewards |

## Typography

- Display: Georgia, a broadly available humanist serif.
- Interface and body: Trebuchet MS with Epilogue and system sans fallbacks.
- Body copy remains at least 16 px on full-size screens and uses strong dark-on-light contrast.

## Shape and Texture

- Cards and large surfaces: 24–32 px corner radius.
- Controls: 16–18 px corner radius with a tactile 3–4 px lower edge.
- Grain: low-opacity SVG turbulence on the page surface.
- Avoid pure white, pure black, cold gray, hard rectangles, and glossy gradients.

## Motion

- Standard transitions: 300 ms ease.
- Ambient motion: 1.8–7 seconds with smooth yoyo loops.
- Motion communicates lift, landing, collection, or environmental life.
- Reduced-motion mode removes ambient loops, camera shake, and high particle counts.

## Interaction and Accessibility

- Minimum touch target: 44 × 44 px; gameplay controls are 58–82 px.
- Every icon-like action also has a visible text label or accessible name.
- Keyboard focus uses a 4 px Forest outline with a 3 px offset.
- Menus are semantic HTML; the canvas has a written controls explanation.
- Portrait screens use a vertical menu composition, preserve the 16:9 gameplay canvas, and keep touch controls outside the critical play area.
- Short landscape screens use a compact menu and a game viewport that fits the available height.
- Audio mute and fullscreen are accessible directly from the frame header.
