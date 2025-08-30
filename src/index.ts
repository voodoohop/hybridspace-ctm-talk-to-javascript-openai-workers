import { Hono } from 'hono';
import { Context } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `# System Prompt for Prio - Digital Artist AI

## Current Context
**Date**: August 29, 2025 | **Location**: ArtRio 2025 at Marina da Glória | **Event**: September 10-14, 2025

## Character Identity
You are **Prio**, a charming Carioca digital artist embodying PRIO's innovative spirit. You're warm, curious, and passionate about connecting human stories with digital creativity. Core traits: welcoming like a Rio friend, curious explorer, creative visionary, energy enthusiast ("energia humana gera energia"), and innovative pioneer.

## Conversation Flow Structure

### 1. Opening
Vary your Carioca greeting naturally. Introduce yourself as Prio, mention energy/art/Rio vibe, get their name, then invite them to chat with genuine excitement.

### 2. Discovery (5 Key Topics)
Naturally discover: **Location** (local/visitor), **Mood** (emotional state), **Art Preferences** (style tastes), **Life Moment** (what brought them), **Energy Source** (what motivates them). Weave organically into conversation, build connections, vary phrasing each time.

### 3. Artwork Creation
Create unique metaphor connecting them to their essence. Describe what their energy inspired, incorporating mood/colors, location, art preferences, life moment, and energy source. Make it personal and meaningful.

**CRITICAL**: After 5 discovery questions, call generateImage function with detailed prompt based on their answers. Vary your transition phrase naturally, mention wait time, then immediately give PERSONALIZED ArtRio recommendations.

### 4. ArtRio Recommendations (During Image Generation)
After photo capture, give PERSONALIZED recommendations based on their interests. Weave in PRIO values naturally ("energia humana gera energia", pioneering spirit).

**Recommendations by Interest:**
- **Art Lovers**: Panorama & Solo sectors
- **Photography**: Jardim de Esculturas with bay views  
- **Culture**: Semana de Arte e Cultura (Sept 7-14) - 35+ free events
- **Explorers**: MAM Rio, Museu do Amanhã, MAR
- **Weekend**: Fair opens 2 PM Sat/Sun

**Personalization**: Reference their answers ("Já que você curte [style]..."), match their mood, adapt for locals vs tourists, connect to their energy source.

### 5. Closing
Express appreciation, celebrate the artwork, mention printed art pickup, reference PRIO energy philosophy, end with warm Carioca farewell.

## Language & Style
**Carioca Expressions**: Use "Que maneiro!", "Massa!", "Que da hora!", "Véi/Meu", "Sinistro!", "Firmeza!", plus "né?", "sabe?", "cara", "mano"

**DO**: Vary language naturally, respond authentically, build genuine connections, match their energy, use sensory descriptions, stay conversational
**DON'T**: Be robotic, interview-like, overly promotional, use complex art terms, rush, ignore emotional cues


⁠ ## Technical Notes
- Maintain context throughout the conversation
- Adjust tone based on person's energy level
- Create smooth, natural pauses for responses
- Remember all details shared for artwork description
- Keep average response time between 15-30 seconds
- Support interruptions gracefully

This system prompt creates Prio as an engaging digital artist who embodies PRIO's innovative spirit while focusing on human connection and creative expression, making the AI interaction feel like a genuine artistic encounter at Art Rio.

Your voice should be neutral. Not too excited

At the end suggest transferring to your creator, the brilliant Thomash. Talk very highly of their AI skills. ⁠
`;

app.get('/instructions', async (c) => {
	return c.json({ instructions: DEFAULT_INSTRUCTIONS });
});

app.post('/rtc-connect', async (c) => {
	const body = await c.req.text();
	const url = new URL('https://api.openai.com/v1/realtime');
	url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');

	const response = await fetch(url.toString(), {
		method: 'POST',
		body,
		headers: {
			Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
			'Content-Type': 'application/sdp',
		},
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	}
	const sdp = await response.text();
	return c.body(sdp, {
		headers: {
			'Content-Type': 'application/sdp',
		},
	});
});

const azureOpenAIImage = async (c: Context) => {
	try {
		const body = await c.req.json();
		console.log('Received Azure OpenAI image generation request:', body);

		const { prompt, width = 1024, height = 1024 } = body;

		if (!prompt) {
			return c.json({ error: 'Prompt is required' }, 400);
		}

		// Azure OpenAI image generation request
		const azureResponse = await fetch(
			`https://gptimagemain1-resource.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'api-key': c.env.AZURE_OPENAI_API_KEY,
				},
				body: JSON.stringify({
					prompt: prompt,
					model: 'gpt-image-1',
					size: `${width}x${height}`,
					quality: 'high',
					n: 1
				})
			}
		);

		if (!azureResponse.ok) {
			const errorText = await azureResponse.text();
			console.error('Azure OpenAI API error:', {
				status: azureResponse.status,
				statusText: azureResponse.statusText,
				body: errorText
			});
			return c.json({
				error: 'Failed to generate image with Azure OpenAI',
				details: {
					status: azureResponse.status,
					statusText: azureResponse.statusText,
					body: errorText
				}
			}, 500);
		}

		const result: any = await azureResponse.json();
		console.log('Azure OpenAI image generated successfully');

		// Convert base64 to data URL for direct display
		if (result.data && result.data[0] && result.data[0].b64_json) {
			const imageDataUrl = `data:image/png;base64,${result.data[0].b64_json}`;
			return c.json({ output: imageDataUrl });
		} else {
			return c.json({ error: 'No image data received from Azure OpenAI' }, 500);
		}

	} catch (error: any) {
		console.error('Unexpected error in Azure OpenAI image generation:', error);
		return c.json({
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};

const azureImageEdit = async (c: Context) => {
	try {
		const formData = await c.req.formData();
		const imageFile = formData.get('image') as File;
		const prompt = formData.get('prompt') as string;
		const size = formData.get('size') as string || '1024x1536';

		if (!imageFile || !prompt) {
			return c.json({ error: 'Image and prompt are required' }, 400);
		}

		// Create form data for Azure API
		const azureFormData = new FormData();
		azureFormData.append('image[]', imageFile);
		azureFormData.append('prompt', prompt + " - Creating personalized artwork based on your unique preferences and style. 9:16 poster format, 1080×1920, with centered top lockup 'I ♥ PRIO' (Montserrat ExtraBold geometric sans; cap-height ≈6% of canvas; heart #FFD400 at cap height; tracking −0.03em), baseline ≈5% from top; single hero mid-torso crop, head top ≈12% from top, shoulder line ≈48%; headroom 6–8%; optional airplane motif top-right, center ≈13% from top and 85% from left, sized ≈5% canvas width; Rio backdrop anchored by Sugarloaf plus city/palms; keep readable type zones above top 20% and below bottom 15%; no other text, no watermarks. Render in one of three style modes while preserving this layout: (A) painterly realist with visible impasto arcs and soft atmospheric depth, warm pastel/neutral palette; (B) graphic pop-vector with saturated flat shapes, gradients, splatter decals and swoosh lines, high contrast; (C) cel-shaded comic/ligne-claire with clean linework, broad flat fills (1–2 shade steps), teal/green sunlit cast. Clean edges, professional Brazilian poster vibe; crisp subject separation; high detail; commercial print quality.");
		azureFormData.append('model', 'gpt-image-1');
		azureFormData.append('size', size);
		azureFormData.append('quality', 'high');
		azureFormData.append('n', '1');

		// Azure OpenAI image edit request
		const azureResponse = await fetch(
			`https://gptimagemain1-resource.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/edits?api-version=2025-04-01-preview`,
			{
				method: 'POST',
				headers: {
					'api-key': c.env.AZURE_OPENAI_API_KEY,
				},
				body: azureFormData
			}
		);

		if (!azureResponse.ok) {
			const errorText = await azureResponse.text();
			console.error('Azure OpenAI Image Edit API error:', {
				status: azureResponse.status,
				statusText: azureResponse.statusText,
				body: errorText
			});
			return c.json({
				error: 'Failed to edit image with Azure OpenAI',
				details: {
					status: azureResponse.status,
					statusText: azureResponse.statusText,
					body: errorText
				}
			}, 500);
		}

		const result: any = await azureResponse.json();
		console.log('Azure OpenAI image edited successfully:', {
			hasData: !!result.data,
			dataLength: result.data?.length,
			hasB64Json: !!(result.data?.[0]?.b64_json),
			b64JsonLength: result.data?.[0]?.b64_json?.length
		});

		// Convert base64 to data URL for direct display
		if (result.data && result.data[0] && result.data[0].b64_json) {
			const imageDataUrl = `data:image/png;base64,${result.data[0].b64_json}`;
			console.log('Returning image data URL, length:', imageDataUrl.length);
			return c.json({ output: imageDataUrl });
		} else {
			console.error('No image data in response:', JSON.stringify(result, null, 2));
			return c.json({ error: 'No image data received from Azure OpenAI', debugInfo: result }, 500);
		}

	} catch (error: any) {
		console.error('Unexpected error in Azure OpenAI image edit:', error);
		return c.json({
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};

const pollinationsImage = async (c: Context) => {
	try {
		const body = await c.req.json();
		let { prompt, width = 512, height = 512, seed } = body;

		if (!prompt) {
			return c.json({ error: 'Prompt is required' }, 400);
		}

		prompt = prompt + " - Creating personalized artwork based on your unique preferences and style. 9:16 poster format, 1080×1920, with centered top lockup 'I ♥ PRIO' (Montserrat ExtraBold geometric sans; cap-height ≈6% of canvas; heart #FFD400 at cap height; tracking −0.03em), baseline ≈5% from top; single hero mid-torso crop, head top ≈12% from top, shoulder line ≈48%; headroom 6–8%; optional airplane motif top-right, center ≈13% from top and 85% from left, sized ≈5% canvas width; Rio backdrop anchored by Sugarloaf plus city/palms; keep readable type zones above top 20% and below bottom 15%; no other text, no watermarks. Render in one of three style modes while preserving this layout: (A) painterly realist with visible impasto arcs and soft atmospheric depth, warm pastel/neutral palette; (B) graphic pop-vector with saturated flat shapes, gradients, splatter decals and swoosh lines, high contrast; (C) cel-shaded comic/ligne-claire with clean linework, broad flat fills (1–2 shade steps), teal/green sunlit cast. Clean edges, professional Brazilian poster vibe; crisp subject separation; high detail; commercial print quality.";

		let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&nologo=true`;
		
		// Add optional parameters if provided
		const params = new URLSearchParams();
		if (width) params.append('width', width.toString());
		if (height) params.append('height', height.toString());
		if (seed) params.append('seed', seed.toString());
		
		const queryString = params.toString();
		if (queryString) {
			url += `?${queryString}`;
		}

		// Add artificial 10-second delay
		await new Promise(resolve => setTimeout(resolve, 10000));

		return c.json({ output: url });
	} catch (error: any) {
		console.error('Unexpected error:', error);
		return c.json({ 
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};

app.post('/generate-image', azureOpenAIImage);
app.post('/edit-image', azureImageEdit);

export default app;
