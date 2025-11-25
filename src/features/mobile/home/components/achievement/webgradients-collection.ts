/**
 * WebGradients Collection
 *
 * A curated set of 23 beautiful gradients from webgradients.com
 * Selected by the user for motivation cards
 *
 * Source: https://github.com/itmeo/webgradients
 * License: Free for commercial and personal use
 */

export interface GradientDefinition {
	id: string;
	name: string;
	/** Tailwind-compatible gradient string */
	tailwind: string;
	/** Original CSS hex colors */
	colors: string[];
}

export const WEB_GRADIENTS: GradientDefinition[] = [
	{
		id: '002',
		name: 'Night Fade',
		tailwind: 'from-[#a18cd1] to-[#fbc2eb]',
		colors: ['#a18cd1', '#fbc2eb'],
	},
	{
		id: '005',
		name: 'Young Passion',
		tailwind: 'from-[#ff8177] via-[#cf556c] to-[#b12a5b]',
		colors: ['#ff8177', '#ff867a', '#ff8c7f', '#f99185', '#cf556c', '#b12a5b'],
	},
	{
		id: '007',
		name: 'Sunny Morning',
		tailwind: 'from-[#f6d365] to-[#fda085]',
		colors: ['#f6d365', '#fda085'],
	},
	{
		id: '008',
		name: 'Rainy Ashville',
		tailwind: 'from-[#fbc2eb] to-[#a6c1ee]',
		colors: ['#fbc2eb', '#a6c1ee'],
	},
	{
		id: '011',
		name: 'Dusty Grass',
		tailwind: 'from-[#d4fc79] to-[#96e6a1]',
		colors: ['#d4fc79', '#96e6a1'],
	},
	{
		id: '012',
		name: 'Tempting Azure',
		tailwind: 'from-[#84fab0] to-[#8fd3f4]',
		colors: ['#84fab0', '#8fd3f4'],
	},
	{
		id: '014',
		name: 'Amy Crisp',
		tailwind: 'from-[#a6c0fe] to-[#f68084]',
		colors: ['#a6c0fe', '#f68084'],
	},
	{
		id: '016',
		name: 'Deep Blue',
		tailwind: 'from-[#e0c3fc] to-[#8ec5fc]',
		colors: ['#e0c3fc', '#8ec5fc'],
	},
	{
		id: '022',
		name: 'Morpheus Den',
		tailwind: 'from-[#30cfd0] to-[#330867]',
		colors: ['#30cfd0', '#330867'],
	},
	{
		id: '028',
		name: 'Plum Plate',
		tailwind: 'from-[#667eea] to-[#764ba2]',
		colors: ['#667eea', '#764ba2'],
	},
	{
		id: '052',
		name: 'Kind Steel',
		tailwind: 'from-[#e9defa] to-[#fbfcdb]',
		colors: ['#e9defa', '#fbfcdb'],
	},
	{
		id: '056',
		name: 'Shady Water',
		tailwind: 'from-[#74ebd5] to-[#9face6]',
		colors: ['#74ebd5', '#9face6'],
	},
	{
		id: '064',
		name: 'Red Salvation',
		tailwind: 'from-[#f43b47] to-[#453a94]',
		colors: ['#f43b47', '#453a94'],
	},
	{
		id: '070',
		name: 'Aqua Splash',
		tailwind: 'from-[#13547a] to-[#80d0c7]',
		colors: ['#13547a', '#80d0c7'],
	},
	{
		id: '072',
		name: 'Spiky Naga',
		tailwind: 'from-[#505285] via-[#7e7ebb] to-[#b5aee4]',
		colors: [
			'#505285',
			'#585e92',
			'#65689f',
			'#7474b0',
			'#7e7ebb',
			'#8389c7',
			'#9795d4',
			'#a2a1dc',
			'#b5aee4',
		],
	},
	{
		id: '077',
		name: 'Cold Evening',
		tailwind: 'from-[#0c3483] to-[#a2b6df]',
		colors: ['#0c3483', '#a2b6df', '#6b8cce', '#a2b6df'],
	},
	{
		id: '083',
		name: 'Jungle Day',
		tailwind: 'from-[#8baaaa] to-[#ae8b9c]',
		colors: ['#8baaaa', '#ae8b9c'],
	},
	{
		id: '086',
		name: 'Faraway River',
		tailwind: 'from-[#6e45e2] to-[#88d3ce]',
		colors: ['#6e45e2', '#88d3ce'],
	},
	{
		id: '091',
		name: 'Eternal Constance',
		tailwind: 'from-[#09203f] to-[#537895]',
		colors: ['#09203f', '#537895'],
	},
	{
		id: '093',
		name: 'Smiling Rain',
		tailwind: 'from-[#dcb0ed] to-[#99c99c]',
		colors: ['#dcb0ed', '#99c99c'],
	},
	{
		id: '095',
		name: 'Big Mango',
		tailwind: 'from-[#c71d6f] to-[#d09693]',
		colors: ['#c71d6f', '#d09693'],
	},
	{
		id: '099',
		name: 'Strong Stick',
		tailwind: 'from-[#a8caba] to-[#5d4157]',
		colors: ['#a8caba', '#5d4157'],
	},
	{
		id: '103',
		name: 'Midnight Bloom',
		tailwind: 'from-[#2b5876] to-[#4e4376]',
		colors: ['#2b5876', '#4e4376'],
	},
];

/**
 * Simple hash function for string to number conversion
 * Uses Java's String.hashCode() algorithm
 */
function simpleHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

/**
 * Gets a stable gradient for a given card ID
 *
 * @param cardId - The unique ID of the card
 * @returns CSS linear-gradient string
 *
 * @example
 * getGradientFromId('card_123') // Returns a stable CSS gradient for this ID
 */
export function getGradientFromId(cardId: string): string {
	const hash = simpleHash(cardId);
	const index = hash % WEB_GRADIENTS.length;
	const gradient = WEB_GRADIENTS[index];

	// Convert Tailwind gradient to CSS linear-gradient
	return convertToCSS(gradient);
}

/**
 * Converts a WebGradient definition to CSS linear-gradient
 */
function convertToCSS(gradient: GradientDefinition): string {
	const colors = gradient.colors;

	// Simple gradients with 2 colors
	if (colors.length === 2) {
		return `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`;
	}

	// Complex gradients with multiple stops
	return `linear-gradient(to bottom right, ${colors.join(', ')})`;
}

/**
 * Gets a random gradient from the collection
 * Useful for preview or testing purposes
 */
export function getRandomGradient(): string {
	const index = Math.floor(Math.random() * WEB_GRADIENTS.length);
	return convertToCSS(WEB_GRADIENTS[index]);
}
