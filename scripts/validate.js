#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const toolDir = process.argv[2];

if (!toolDir) {
  console.error('Usage: validate.js <tool-directory>');
  console.error('Example: validate.js tools/media/jellyseerr-search');
  process.exit(1);
}

const errors = [];
const warnings = [];

// Check required files exist
const requiredFiles = ['workflow.json', 'manifest.json', 'README.md'];
for (const file of requiredFiles) {
  const filePath = path.join(toolDir, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${file}`);
  }
}

if (errors.length > 0) {
  console.error(`\n Validation failed for ${toolDir}:\n`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

// Validate manifest
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(toolDir, 'manifest.json'), 'utf8'));
} catch (e) {
  errors.push(`Invalid JSON in manifest.json: ${e.message}`);
}

if (manifest) {
  const requiredFields = ['name', 'version', 'description', 'category', 'voice_triggers', 'author'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      errors.push(`Manifest missing required field: ${field}`);
    }
  }

  if (manifest.voice_triggers && manifest.voice_triggers.length < 1) {
    errors.push('Must include at least one voice trigger example');
  }

  if (manifest.voice_triggers && manifest.voice_triggers.length < 2) {
    warnings.push('Consider adding more voice trigger examples (at least 2 recommended)');
  }

  const validCategories = ['smart-home', 'media', 'homelab', 'productivity', 'utilities', 'social', 'other'];
  if (manifest.category && !validCategories.includes(manifest.category)) {
    errors.push(`Invalid category: ${manifest.category}. Must be one of: ${validCategories.join(', ')}`);
  }

  if (manifest.author && !manifest.author.github) {
    errors.push('Author must include github username');
  }

  // Validate folder path matches manifest
  const normalizedPath = toolDir.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/').filter(p => p);
  const folderName = pathParts[pathParts.length - 1];
  const folderCategory = pathParts[pathParts.length - 2];

  // Check folder name matches manifest name
  if (manifest.name && folderName !== manifest.name) {
    errors.push(`Folder name "${folderName}" doesn't match manifest name "${manifest.name}"`);
  }

  // Check folder is in correct category
  if (manifest.category && folderCategory !== manifest.category) {
    errors.push(`Folder category "${folderCategory}" doesn't match manifest category "${manifest.category}". Move to tools/${manifest.category}/${manifest.name}/`);
  }

  // Check name is kebab-case
  if (manifest.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(manifest.name)) {
    errors.push(`Tool name "${manifest.name}" must be kebab-case (lowercase letters, numbers, hyphens only)`);
  }
}

// Validate workflow
let workflow;
try {
  workflow = JSON.parse(fs.readFileSync(path.join(toolDir, 'workflow.json'), 'utf8'));
} catch (e) {
  errors.push(`Invalid JSON in workflow.json: ${e.message}`);
}

// Known credential types
const predefinedTypes = ['githubApi', 'slackApi', 'notionApi', 'googleApi', 'discordApi', 'spotifyApi', 'twilioApi', 'telegramApi', 'homeAssistantApi'];
const genericTypes = ['httpHeaderAuth', 'httpBasicAuth', 'httpDigestAuth', 'oAuth2Api', 'sshPassword', 'sshPrivateKey'];

if (workflow) {
  // Check for webhook trigger
  const webhookNode = workflow.nodes?.find(n =>
    n.type === 'n8n-nodes-base.webhook' ||
    n.type === '@n8n/n8n-nodes-langchain.webhook'
  );

  if (!webhookNode) {
    errors.push('Workflow must have a webhook trigger node');
  } else {
    // Check webhook has description in notes
    if (!webhookNode.notes || webhookNode.notes.trim().length < 20) {
      errors.push('Webhook node must have a meaningful description in the notes field');
    }
  }

  // Check for Respond to Webhook node
  const respondNode = workflow.nodes?.find(n =>
    n.type === 'n8n-nodes-base.respondToWebhook'
  );

  if (!respondNode) {
    warnings.push('Consider adding a "Respond to Webhook" node for proper voice responses');
  }

  // Check for availableInMCP setting
  if (!workflow.settings?.availableInMCP) {
    errors.push('Workflow must have settings.availableInMCP: true for MCP tool access');
  }

  // Check credential IDs are null (for portability)
  for (const node of workflow.nodes || []) {
    if (node.credentials) {
      for (const [credType, credInfo] of Object.entries(node.credentials)) {
        // Check ID is null
        if (credInfo.id !== null) {
          errors.push(`Credential ID must be null for portability (node: ${node.name}, type: ${credType})`);
        }
        // Check credential name exists
        if (!credInfo.name) {
          errors.push(`Credential must have a name (node: ${node.name}, type: ${credType})`);
        }
      }
    }
  }
}

// Validate manifest credentials match workflow
if (manifest && manifest.required_credentials) {
  for (const cred of manifest.required_credentials) {
    // Check auth_type is specified
    if (!cred.auth_type || !['predefined', 'generic'].includes(cred.auth_type)) {
      errors.push(`Credential "${cred.name}" must have auth_type: "predefined" or "generic"`);
    }
    // Check credential_type is specified
    if (!cred.credential_type) {
      errors.push(`Credential "${cred.name}" must have credential_type specified`);
    }
    // Validate auth_type matches credential_type
    if (cred.auth_type === 'predefined' && !predefinedTypes.includes(cred.credential_type)) {
      warnings.push(`Credential "${cred.name}" has auth_type "predefined" but credential_type "${cred.credential_type}" is not a known predefined type`);
    }
    if (cred.auth_type === 'generic' && !genericTypes.includes(cred.credential_type)) {
      warnings.push(`Credential "${cred.name}" has auth_type "generic" but credential_type "${cred.credential_type}" is not a known generic type`);
    }
  }
}

// Report results
if (errors.length > 0) {
  console.error(`\n Validation failed for ${toolDir}:\n`);
  errors.forEach(e => console.error(`  - ${e}`));
  if (warnings.length > 0) {
    console.warn(`\n Warnings:\n`);
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(`\n Warnings for ${toolDir}:\n`);
  warnings.forEach(w => console.warn(`  - ${w}`));
}

console.log(`\n ${toolDir} passed validation\n`);
