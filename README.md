# Scrollable Timeline Site

Open `index.html` to view the timeline.

## Edit Events

Timeline cards are generated from:

```text
assets/timeline-data.js
```

Add, remove, reorder, or edit objects in `window.timelineEvents`. Each object has:

- `year`: date label shown on the card
- `kicker`: small category label
- `title`: card title and active timeline title
- `summary`: card description
- `page`: link to the event HTML page
- `accent`: event color
- `imageClass`: optional CSS visual style

## Edit Event Pages

Each event page lives in:

```text
events/
```

Duplicate one of those HTML files to make a new event page, then add a matching
object to `assets/timeline-data.js`.

## Upload

Upload the whole `outputs` folder contents together so these paths stay intact:

```text
index.html
assets/
events/
```
