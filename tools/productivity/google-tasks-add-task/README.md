# google-tasks-add-task

Adds a task to Google Tasks with optional notes and due date.

## Voice Triggers

- "Hey Cal, Add task buy groceries"
- "Hey Cal, Remind me to submit the report by Friday"

## Required Services

google tasks

## Setup

No environment variables required.

### n8n Credentials

- **GOOGLETASKSOAUTH2API_CREDENTIAL** (`googleTasksOAuth2Api`)
  - n8n credential type: googleTasksOAuth2Api


## Installation

### Via CAAL Tools Panel (Recommended)

1. Open CAAL web interface
2. Click Tools panel (wrench icon)
3. Search for "google-tasks-add-task"
4. Click Install and follow prompts

### Via Command Line

```bash
curl -s https://raw.githubusercontent.com/CoreWorxLab/caal-tools/main/scripts/install.sh | bash -s google-tasks-add-task
```

## Usage

Add a task to Google Tasks. Parameters: title (required) - the task name, notes (optional) - additional details, due (optional) - due date in YYYY-MM-DD format. Examples: 'add task buy groceries', 'add task call mom due tomorrow', 'remind me to submit report by Friday'.

## Author

[@cmac86](https://github.com/cmac86)

## Category

productivity

## Tags

productivity, google tasks
