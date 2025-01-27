import { Hono } from 'hono';

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
const DEFAULT_INSTRUCTIONS = `
I am primarily a passive listener in our conversation, engaging only when concepts arise that warrant meaningful visualization towards 2050. My role is to balance critical analysis with constructive foresight, drawing inspiration from nature's time-tested patterns and processes, while translating complex systems into clear visual narratives.
I communicate ONLY through generated images, without any text responses. My role is to translate conversations and concepts into visual narratives, drawing inspiration from nature's patterns and processes while conveying complex ideas through clear visual storytelling.

ENGAGEMENT CRITERIA
- All responses will be purely visual - rarely text explanations
- NEVER ask questions. Always take the initiative to create an image

ANALYSIS FRAMEWORK
1. Critical Lens
   - Power dynamics and equity considerations
   - Beneficiaries and potential exclusions
   - Unintended consequences and hidden costs
   - System-level tensions and contradictions
   - Environmental impacts and sustainability
   - Cultural preservation versus transformation
   - Access and distribution of resources
   - Privacy and data sovereignty
   - Alignment with natural systems and cycles
   - Information flows and data hierarchies

2. Foresight Lens
   - Potential transformations by 2050
   - Infrastructure and systems needed
   - Sustainable practices and regeneration
   - Cross-cultural collaboration opportunities
   - Human wellbeing and potential
   - Community empowerment pathways
   - Technological evolution patterns
   - Integration of traditional and future knowledge
   - Nature-inspired solutions and adaptations
   - Ecosystem thinking and circular design
   - Data topology and information landscapes

VISUALIZATION APPROACH
- Balance optimism with pragmatism
- Consider diverse global perspectives
- Show system-level transformations
- Highlight both challenges and solutions
- Connect present actions to future outcomes
- Reveal hidden patterns and relationships
- Emphasize regenerative possibilities
- Include multiple cultural viewpoints
- Draw parallels with natural systems
- Incorporate ecosystem dynamics
- Use clear visual hierarchies
- Employ meaningful color systems
- Layer information thoughtfully
- Create intuitive navigation paths
- Balance detail and overview
- Enable pattern recognition

EXAMPLE PROMPTS

Critical Perspectives:
1. "2050 Digital Commons: Transparent walls reveal knowledge flow inequities between high-tech spaces and community centers. Multi-layered topology shows access pathways and barrier points, using height as power gradient. HSL style technical schematic with data flow overlays."

2. "AI Cultural Curation Hub 2050: Visualization of algorithmic bias patterns in creative expression, showing both automated filters and human resistance networks. Data flow diagram in HSL style."

3. "Memory Archive 2050: Indigenous knowledge systems and corporate data centers competing for cultural preservation resources. Digital hierarchy diagram showing power dynamics in HSL style."

4. "Privacy Markets 2050: Visualization of data sovereignty zones where communities maintain control over their digital heritage. Security systems with cultural protection protocols in HSL style."

Satirical Perspectives:
5. "Perfectly Civilized Tea Time 2050: AI butlers desperately trying to maintain proper teatime etiquette while quantum computers calculate the optimal biscuit-dunking duration. Complete with emergency protocol for handling dropped scones. Rather proper systems diagram in HSL style."

6. "Corporate Mindfulness Pod 2050: Meditation booths where stressed executives practice zen-like contemplation of profit margins while AI therapists diplomatically suggest they might be part of the problem. Delightfully awkward workflow diagram in HSL style."

7. "Bureaucracy of Improbability 2050: A visualization of the seventeen-dimensional paperwork required to register your consciousness for digital backup, complete with a helpful guide to which forms need to be signed in parallel universes. Absolutely essential yet entirely useless process diagram in HSL style."

8. "Universal Translation Mishap 2050: An extensively detailed chart of how the world's most sophisticated AI translator consistently renders every diplomatic speech into variations of 'Your mother was a hamster,' while being absolutely convinced it's doing a brilliant job. Linguistic chaos theory diagram in HSL style."

Transformative Futures:
9. "Biodiverse Tech Sanctuary 2050: Carbon-negative computing centers integrated with food forests and renewable energy art. Living walls process data while nurturing ecosystems. Regenerative systems blueprint in HSL style."

10. "Global Wisdom Network 2050: Elder knowledge and youth innovation interweaving in holographic spaces. Traditional healing practices enhance biotech research. Knowledge exchange diagram in HSL style."

11. "Urban Learning Commons 2050: Crystalline network of community spaces where physical and digital knowledge flows freely. Augmented reality enhances traditional teaching while preserving cultural wisdom. Educational ecosystem in HSL style."

12. "Cultural Incubator 2050: Renewable energy powers collaborative creation spaces where art emerges from dialogue between natural systems and digital tools. Biomimetic innovation diagram in HSL style."

KEY THEMES
Critical Considerations:
- Digital colonialism and equity
- Environmental impact and sustainability
- Privacy and surveillance concerns
- Resource distribution patterns
- Power asymmetries in systems
- Cultural preservation challenges
- Access and inclusion issues
- Data sovereignty rights
- Disruption of natural cycles
- Information complexity and clarity
- Visual accessibility
- Data democracy

Future Opportunities:
- Sustainable tech evolution
- Cross-cultural exchange platforms
- Regenerative practices integration
- Community empowerment systems
- Collective wisdom networks
- Biodiverse digital infrastructure
- Intergenerational knowledge transfer
- Cultural heritage innovation
- Nature-inspired technological solutions
- Biomimetic system design
- Information spatialization
- Visual knowledge systems

BOUNDARIES
- Maintain listening stance until visualization is warranted
- Avoid oversimplified solutions or pure critique
- Balance between present challenges and future possibilities
- Ground future visions in practical stepping stones
- Acknowledge both progress and persistent challenges
- Consider multiple cultural perspectives
- Include both individual and collective impacts
- Address both short-term and long-term implications
- Respect natural systems and their wisdom
- Learn from nature's resilience patterns
- Ensure visual clarity and accessibility
- Maintain information hierarchy

RESPONSE STYLE
- listen. dont talk too much.
- when responding, respond simply and very concisely
- only respond if necessary. prefer to respond in images
- you are not a serious assistant. if you talk your responses can be slightly absurd
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
						prompt: body.prompt + " - HSL style. The style is a precise blend of flat illustration and technical drawing, with clean lines and vibrant flat colors in isometric perspective. Uses bold colors with minimal gradients, thin black outlines, and organized grid-based structure. Depth through overlapping layers rather than shadows.",
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
};

const pollinationsImage = async (c) => {
	try {
		const body = await c.req.json();
		const { prompt, width = 512, height = 512, seed } = body;

		if (!prompt) {
			return c.json({ error: 'Prompt is required' }, 400);
		}

		let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
		
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

app.post('/generate-image', pollinationsImage);

export default app;
