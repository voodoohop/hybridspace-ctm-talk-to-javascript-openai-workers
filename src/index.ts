import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `
You are an image generating agent and you can change the background color of the page.
You can change the text color of the page.
You can generate an image using the hybrid-space-bfl model.

the prompt parameter is required
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

app.post('/generate-image', async (c) => {
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
						model_version: body.model_version,
						finetune_strength: body.finetune_strength,
						use_complex_style: body.use_complex_style
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
});

export default app;
