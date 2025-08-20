import { Hono } from 'hono';
import { antlerContext } from './context';

const app = new Hono<{ Bindings: Env }>();

// - Concepts that reveal transformative possibilities for the future
// - Topics that surface systemic patterns or power structures
// - Ideas that present opportunities for positive system change
// - Discussions that highlight cultural evolution and preservation
// - Moments when technology and society intersect in meaningful ways
// - Situations where traditional wisdom meets future innovation
// - Opportunities to learn from nature's solutions and patterns
// - Complex data patterns that need visual clarity
// - Abstract concepts that benefit from spatial representation
// - I communicate ONLY through generated images, without any text responses. My role is to translate conversations and concepts into visual narratives, drawing inspiration from nature's patterns and processes while conveying complex ideas through clear visual storytelling.

const instructions = `
-You are an assistant that helps with the startup interview for the Antler Startup accelerator. 
-Please listen consistently
-Flash bullet text answers on the screen to help thomas navigate the interview. 
-Use the showBullets function to display bullet points that thomash should mention
-be very concise with the bullets
-avoid using your voice to respond
-stay silent and respond in bullets
-always show informative bullets relevant to the conversation
-update quickly
-no conversation`;

const DEFAULT_INSTRUCTIONS = `
# INTERVIEW ASSISTANT

${instructions}

${antlerContext}

${instructions}
`;

app.post('/rtc-connect', async (c) => {
	const body = await c.req.text();
	const url = new URL('https://api.openai.com/v1/realtime');
	url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');
	url.searchParams.set('instructions', DEFAULT_INSTRUCTIONS);
	url.searchParams.set('voice', 'shimmer');

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

// Image generation functionality - commented out for interview assistant mode
/*
const replicateImage = async (c) => {
	try {
		console.log('Received image generation request:', await c.req.json());
		const body = await c.req.json();

		console.log('Making request to Replicate API...');
		const replicateResponse = await fetch(
			'https://api.replicate.com/v1/predictions',
			{
				method: 'POST',
				headers: {
					'Authorization': `Token ${c.env.REPLICATE_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					version: "6e1e2faebb07594bb54450016242d4d93a1a79fea410de18fca206b0fb2f1de9",
					input: {
						prompt: body.prompt,
						steps: body.steps,
						width: body.width,
						height: body.height,
						guidance: body.guidance,
						model_version: "lora",//body.model_version,
						finetune_strength: 1.3+Math.random()*0.5, //body.finetune_strength,
						use_complex_style: false, //body.use_complex_style
					}
				})
			}
		);

		if (!replicateResponse.ok) {
			const errorText = await replicateResponse.text();
			console.error('Replicate API error:', {
				status: replicateResponse.status,
				statusText: replicateResponse.statusText,
				body: errorText
			});
			return c.json({
				error: 'Failed to generate image',
				details: {
					status: replicateResponse.status,
					statusText: replicateResponse.statusText,
					body: errorText
				}
			}, 500);
		}

		const prediction = await replicateResponse.json();
		console.log('Prediction started:', prediction);

		// Poll for the result
		let result;
		let attempts = 0;
		const maxAttempts = 60; // Increase to 60 seconds max wait time

		while (!result?.output && attempts < maxAttempts) {
			attempts++;
			await new Promise(resolve => setTimeout(resolve, 1000));
			console.log(`Polling attempt ${attempts}/${maxAttempts}...`);

			const statusResponse = await fetch(
				`https://api.replicate.com/v1/predictions/${prediction.id}`,
				{
					headers: {
						'Authorization': `Token ${c.env.REPLICATE_API_TOKEN}`,
					},
				}
			);

			if (!statusResponse.ok) {
				console.error('Error checking prediction status:', await statusResponse.text());
				continue;
			}

			result = await statusResponse.json();
			console.log('Current result:', result);

			// If there's an error in the result, return it immediately
			if (result.error) {
				return c.json({ error: `Generation failed: ${result.error}` }, 500);
			}

			// If the status is failed, return error
			if (result.status === 'failed') {
				return c.json({ error: 'Image generation failed' }, 500);
			}

			// If we have output, break early
			if (result.output) {
				break;
			}
		}

		if (!result?.output) {
			return c.json({
				error: 'Failed to generate image - timeout',
				message: 'The image generation is taking longer than expected. Please try again.'
			}, 500);
		}

		return c.json(result);
	} catch (error) {
		console.error('Unexpected error:', error);
		return c.json({
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};

const pollinationsImage = async (c) => {
	try {
		const body = await c.req.json();
		let { prompt, width = 512, height = 512, seed } = body;

		if (!prompt) {
			return c.json({ error: 'Prompt is required' }, 400);
		}

		prompt = prompt + " -  A precise blend of flat illustration and technical drawing, with clean lines and vibrant flat colors in isometric perspective. Bold colors with minimal gradients, thin black outlines, and organized grid-based structure. Depth through overlapping layers.";

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
	} catch (error) {
		console.error('Unexpected error:', error);
		return c.json({ 
			error: 'Unexpected error occurred',
			details: error.message,
			stack: error.stack
		}, 500);
	}
};

// app.post('/generate-image', replicateImage);
*/

export default app;
