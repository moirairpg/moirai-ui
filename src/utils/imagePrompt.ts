const GENERATION_INSTRUCTION = 'Generate an image based on information provided about the world. Make it epic, fitting for fantasy. Make in the style of a painting. Do not include any text in the image, simply generate the image based on the information provided below.';

export function buildImagePrompt(params: {
  name: string;
  description: string;
  adventureStart?: string | null;
}): string {
  let prompt = `${GENERATION_INSTRUCTION}\nName: ${params.name}\nDescription: ${params.description}`;
  if (params.adventureStart) {
    prompt += `\nAdventure Start: ${params.adventureStart}`;
  }
  return prompt;
}
