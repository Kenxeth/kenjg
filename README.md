# Portfolio Island

A responsive, Club Penguin-inspired portfolio built with HTML, CSS, and vanilla JavaScript. No build or dependencies required.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. You can also open `index.html` directly.

## Personalize

Edit `content.js` to update your biography, projects, experience entries, skills, or resume PDF URL. The content includes the Serverless Event Processing Pipeline, Mira, FamilyOS, Intuit Credit Karma, Google CodeNext, both Mastercard internships, and the technical stack supplied in the spec. The project counter shows the total number of projects. The GitHub dock link opens `https://github.com/Kenxeth` in a new tab.

The Resume button opens the supplied PDF at `assets/Kenneth-Gonzalez-Resume.pdf` in a new tab. Replace that file to update the resume, or change `resume` in `content.js` to another HTTPS URL or relative path.

The penguin is static, with no click or hover animation. The member badge and interface icons are inline SVG illustrations, and `assets/tech-icons.js` provides 22 local technology icons. The avatar viewport uses a wooden wall, floor, and arched doorway. Google Fonts has system font fallbacks.

## Background music

The supplied Pizza Parlor track is stored locally at `assets/pizza-parlor.mp3`. Sound starts off. Click **Sound off** to enable the looping music at 28% volume and the interface click sounds; click **Sound on** to pause both. Turning sound back on resumes the track. Playback starts in response to the button click so it works with browser autoplay restrictions. Playback failures restore the off state and are announced accessibly.

## Interactions

- Six navigation buttons, sliding desktop inventory, mobile drawer
- Projects, Experience, Skills, and About Me use 12-slot inventory grids
- Project tiles open native modal dialogs with descriptions and tech stacks; Escape closes the popup while keeping the inventory open
- All four experience entries have expandable role details, including the supplied team descriptions
- All 22 skills have matching icons, category details, and page controls
- Escape to close a drawer, restored trigger focus, mobile focus containment
- Player-card close button and a separate button to reopen the card
- Looping background music, optional interface sounds, and reduced-motion support
- External links use `noopener noreferrer`

Static hosting can serve this directory as-is. No deployment has been configured.
