# espn-nba

Get NBA scores, standings, and team schedules from ESPN.

## Voice Triggers

- "Hey Cal, What are the NBA scores today?"
- "Hey Cal, Where are the Lakers in the standings?"

## Required Services



## Setup

No environment variables required.

No credentials required.

## Installation

### Via CAAL Tools Panel (Recommended)

1. Open CAAL web interface
2. Click Tools panel (wrench icon)
3. Search for "espn-nba"
4. Click Install and follow prompts

### Via Command Line

```bash
curl -s https://raw.githubusercontent.com/CoreWorxLab/caal-tools/main/scripts/install.sh | bash -s espn-nba
```

## Usage

NBA data suite - scores, standings, and schedule. Parameters: action (required) - 'scores', 'standings', or 'schedule'; team (optional for scores, required for schedule) - team name like 'Lakers', 'Celtics', 'Warriors'; conference (optional for standings) - 'eastern' or 'western'. Examples: 'NBA scores', 'where are the Lakers in the standings', 'when do the Celtics play next'.

## Author

[@cmac86](https://github.com/cmac86)

## Category

sports

## Tags

sports
