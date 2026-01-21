# notion-add-task

Adds a task to Notion with optional due date parsing (supports today, tomorrow, day names, and specific dates).

## Voice Triggers

- "Hey Cal, Add task buy groceries"
- "Hey Cal, Add task call mom due tomorrow"

## Required Services

notion

## Setup

### Environment Variables

- `NOTION_DATABASE_ID`: Your Notion task database ID
  - Example: `abc123def456789xyz`


### n8n Credentials

- **NOTIONAPI_CREDENTIAL** (`notionApi`)
  - n8n credential type: notionApi


## Installation

### Via CAAL Tools Panel (Recommended)

1. Open CAAL web interface
2. Click Tools panel (wrench icon)
3. Search for "notion-add-task"
4. Click Install and follow prompts

### Via Command Line

```bash
curl -s https://raw.githubusercontent.com/CoreWorxLab/caal-tools/main/scripts/install.sh | bash -s notion-add-task
```

## Usage

Add a task to Notion. Required parameter: task (the task name). Optional parameter: due (due date like 'tomorrow', 'Friday', '2024-01-15'). Examples: 'add task buy groceries', 'add task call mom due tomorrow', 'remind me to submit report by Friday'.

## Author

[@cmac86](https://github.com/cmac86)

## Category

productivity

## Tags

productivity, notion
