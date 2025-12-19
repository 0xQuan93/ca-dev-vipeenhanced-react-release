import fs from 'fs';
import path from 'path';

async function checkModels() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey && fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
      if (match) {
        apiKey = match[1].trim();
      }
    }

    if (!apiKey) {
      console.error('No API Key found in .env');
      return;
    }

    console.log('Using API Key ending in:', apiKey.slice(-4));

    // Use REST API to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.error(`Failed to list models: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }

    const data = await response.json();
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
           console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkModels();

