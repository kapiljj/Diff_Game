# Spot the Difference Game

A web-based "Spot the Difference" game that loads game configuration from a JSON file.

## Features

- Two images displayed side by side
- Click to identify differences
- Score tracking
- Timer
- Responsive design
- JSON-based configuration

## How to Run

1. Clone this repository
2. Place your image pairs in the `images` folder
3. Configure the differences in `config.json`
4. Serve the files using a web server (e.g., using Live Server in VS Code)

## Important Notes

- You must run a local server to play the game, as browsers block fetch requests to local files. You can use VS Code's Live Server extension, Python's `http.server`, or any static server.
- Place a `found.mp3` sound file in the project root for the found-difference sound effect.

## JSON Configuration

The game uses a JSON file (`config.json`) to configure:
- Game title
- Image paths
- Difference coordinates and dimensions

Example configuration:
```json
{
    "gameTitle": "Spot the Difference - Animals",
    "images": {
        "image1": "images/image1.jpg",
        "image2": "images/image2.jpg"
    },
    "differences": [
        {
            "x": 100,
            "y": 200,
            "width": 50,
            "height": 50
        }
    ]
}