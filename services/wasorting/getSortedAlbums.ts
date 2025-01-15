import fs from 'fs/promises';
import * as fsv from 'fs';
import { OpenAIClient } from "@azure/openai";
import { AzureKeyCredential } from '@azure/core-auth';
import { config } from 'dotenv';
import type { ImageAnalysisClient } from '@azure-rest/ai-vision-image-analysis';

import { getImageByWARefId } from '../images.services.js';

import pkg from '@azure-rest/ai-vision-image-analysis';

const { isUnexpected } = pkg;
const createClient = pkg.default;

// Load environment variables
config();
const azureApiKey = process.env['AZURE_OPENAI_API_KEY'] || 'your_azure_api_key';
const azureEndpoint = process.env['AZURE_OPENAI_ENDPOINT'] || 'your_azure_endpoint';
const deploymentName = 'gpt-35-turbo-16k'; // replace with your deployment name

const azureApiKey_4 = process.env['AZURE_OPENAI_API_KEY_4'] || 'your_azure_api_key';
const azureEndpoint_4 = process.env['AZURE_OPENAI_ENDPOINT_4'] || 'your_azure_endpoint';
const deploymentName_4 = 'gpt_4_vision'; // replace with your deployment name

const visionEndpoint = process.env['VISION_ENDPOINT'] || '<your_endpoint>';
const visionKey = process.env['VISION_KEY'] || '<your_key>';

const client = new OpenAIClient(azureEndpoint, new AzureKeyCredential(azureApiKey));
const client_4 = new OpenAIClient(azureEndpoint_4, new AzureKeyCredential(azureApiKey_4));
const clientVision: ImageAnalysisClient = createClient(visionEndpoint, new AzureKeyCredential(visionKey));

const features: string[] = ['Caption'];

// Define interfaces for Message and chatResponseObject
interface Message {
    id: number;
    timestamp: Date;
    sender: string;
    content: string;
    photo: boolean;
}

export interface ChatResponseObject {
    [key: string]: string[];
    [Symbol.iterator](): Iterator<{ key: string, value: string[] }>;
}

// Configurable parameters for date filtering
const currentDate = new Date();
const currentDay = currentDate.getDate().toString().padStart(2, '0');
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const currentYear = (currentDate.getFullYear() - 1).toString();
const oneYearAgo = `${currentDay}/${currentMonth}/${currentYear}`;

/**
 * Helper function to handle errors of type unknown.
 * @param error - The error of type unknown
 * @returns Error message
 */
function handleUnknownError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else {
        return JSON.stringify(error);
    }
}

/**
 * Analyze images to extract captions.
 * @param imagePaths - Paths of images to analyze
 * @returns Promise resolving to an array of captions
 */
async function analyzeImage(imageUrl: string): Promise<string> {

    try {
        const result = await clientVision.path('/imageanalysis:analyze').post({
            body: { url: imageUrl},
            queryParameters: { features: features, 'language': 'en' },
            contentType: 'application/json'
        });

        if (isUnexpected(result)) {
            throw new Error(result.body.error.message || 'Unexpected error during image analysis');
        }

        if (result.body.captionResult && result.body.captionResult.text) {
            const caption: string = result.body.captionResult.text;
            return caption;
        } else {
            console.warn(`No caption found for image ${imageUrl}`);
            return '';
        }
    } catch (error) {
        console.error(`Error analyzing image ${imageUrl}: ${handleUnknownError(error)}`);
        const caption: string = 'Error analyzing image';
        return caption;
    }
}

/**
 * Analyze groups of photos and get captions for each group.
 * @param messages - List of messages
 * @param photoGroups - List of photo groups
 * @returns Promise resolving to an array of captions for each group
 */
async function analyzePhotoGroups(messages: Message[], photoGroups: number[][], wachatId: string): Promise<string[][]> {
    const allGroupCaptions: string[][] = [];

    const filenamesForGroups = extractFilenamesFromGroups(messages, photoGroups);

    for (const filenames of filenamesForGroups) {
        
        const captions: string[] = [];
        for (const filename of filenames){
            

            try {
                const response = await getImageByWARefId(filename, wachatId);
                const imageUrl = response.presignedUrl;

                if (imageUrl) {
                    const caption = await analyzeImage(imageUrl);
                    captions.push(caption);
                }

            } catch (error) {
                console.error(`Error analyzing photo group: ${handleUnknownError(error)}`);
                allGroupCaptions.push([]); // Ensure we have a fallback empty array
            }

        }

        allGroupCaptions.push(captions);
            
    }

    return allGroupCaptions;
}

/**
 * Extract the filename from message content.
 * @param content - Message content containing the filename
 * @returns Extracted filename
 */
function imageFilename(content: string): string {
    try {
        if (/< pièce jointe :/.test(content)) {
            return content.split(":")[1].trim().split(' ')[0];
        } else if (/fichier joint/.test(content)) {
            return content.split(' ')[0];
        }
    } catch (error) {
        console.error(`Error extracting filename from content: ${handleUnknownError(error)}`);
    }
    console.warn(`Unknown format for content: ${content}`);
    return "Unknown format";
}

/**
 * Extract filenames for each group of photos.
 * @param messages - List of messages
 * @param photoGroups - List of photo groups
 * @returns List of lists of filenames
 */
function extractFilenamesFromGroups(messages: Message[], photoGroups: number[][]): string[][] {
    const filenamesForGroups: string[][] = [];

    try {
        photoGroups.forEach(group => {
            const filenames = group
                .map(id => messages.find(msg => msg.id === id)?.content)
                .filter((content): content is string => content !== undefined)
                .map(extractFilename);

            filenamesForGroups.push(filenames);
        });
    } catch (error) {
        console.error(`Error extracting filenames from groups: ${handleUnknownError(error)}`);
    }

    return filenamesForGroups;
}

/**
 * Extract chat data from raw chat text.
 * @param chat - Raw chat text
 * @param day - Date for filtering messages
 * @returns Extracted messages
 */
function extractChat(chat: string, day: string): Message[] {
    const messages: Message[] = [];

    try {
        const dayDt = new Date(day.split('/').reverse().join('-'));
        const lines = chat.split('\n');

        const iphonePattern = /\[(\d{2}\/\d{2}\/\d{4}),? (\d{1,2}:\d{2}(:\d{2})? ?([APap][Mm])?)\] ([^:]+): (.+)/;
        const androidPattern = /(\d{2}\/\d{2}\/\d{4}),? (\d{1,2}:\d{2}(:\d{2})? ?([APap][Mm])?) - ([^:]+): (.+)/;
        const universalPattern = /(\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4}),? (\d{1,2}:\d{2}(:\d{2})? ?([APap][Mm])?) ?[-\]] ([^:]+): (.+)/;

        let id = 0;
        let concatenatedChat = '';
        let patternUsed: RegExp | null = null;

        // Detect the pattern used in the chat
        for (const line of lines.slice(0, 10)) {
            if (iphonePattern.test(line)) {
                patternUsed = iphonePattern;
                break;
            } else if (androidPattern.test(line)) {
                patternUsed = androidPattern;
                break;
            } else if (universalPattern.test(line)) {
                patternUsed = universalPattern;
                break;
            }
        }

        if (!patternUsed) throw new Error('Unsupported chat format');

        // Patterns for specific lines to ignore
        const newNumberPattern = /a ajouté\s+\+?(\d+)/i;
        const encryptionMessagePattern = /chiffrés de bout en bout/i;
        const groupCreationPattern = /a créé le groupe/i;

        const attachmentPatterns = [
            /\.jpg/i,
        ];

        for (const line of lines) {
            // Skip specific lines
            if (encryptionMessagePattern.test(line) || groupCreationPattern.test(line) || newNumberPattern.test(line)) {
                continue;
            }

            if (patternUsed.test(line)) {
                if (concatenatedChat) {
                    const [_, date, time, , , sender, ...contentParts] = patternUsed.exec(concatenatedChat) as RegExpExecArray;
                    const content = contentParts.join(' ').trim();
                    const photo = attachmentPatterns.some(pattern => pattern.test(content));
                    const timestamp = new Date(`${date.split('/').reverse().join('-')} ${time}`);
                    if (timestamp > dayDt) {
                        messages.push({ id, timestamp, sender, content: content.trim(), photo });
                        id++;
                    }
                }
                concatenatedChat = line;
            } else {
                concatenatedChat += '\n' + line;
            }
        }

        // Add the last message
        if (concatenatedChat) {
            const [_, date, time, , , sender, ...contentParts] = patternUsed.exec(concatenatedChat) as RegExpExecArray;
            const content = contentParts.join(' ').trim();
            const photo = attachmentPatterns.some(pattern => pattern.test(content));
            const timestamp = new Date(`${date.split('/').reverse().join('-')} ${time}`);
            if (timestamp > dayDt) {
                messages.push({ id, timestamp, sender, content: content.trim(), photo });
                id++;
            }
        }
    } catch (error) {
        console.error(`An error occurred while extracting the chat: ${handleUnknownError(error)}`);
    }

    return messages;
}

/**
 * Find groups of photos sent by the same person within 20 seconds.
 * @param messages - List of messages
 * @returns Array of photo groups
 */
function findPhotoGroups(messages: Message[]): number[][] {
    const photoGroups: number[][] = [];

    try {
        let currentGroup: number[] = [];
        let currentSender: string | null = null;

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.photo) {
                if (currentSender === msg.sender) {
                    if ((msg.timestamp.getTime() - messages[i - 1].timestamp.getTime()) <= 20000) {
                        currentGroup.push(msg.id);
                    } else {
                        if (currentGroup.length > 1) photoGroups.push(currentGroup);
                        currentGroup = [msg.id];
                    }
                } else {
                    if (currentGroup.length > 1) photoGroups.push(currentGroup);
                    currentGroup = [msg.id];
                    currentSender = msg.sender;
                }
            } else {
                if (currentGroup.length > 1) photoGroups.push(currentGroup);
                currentGroup = [];
                currentSender = null;
            }
        }

        if (currentGroup.length > 1) photoGroups.push(currentGroup);
    } catch (error) {
        console.error(`An error occurred while finding photo groups: ${handleUnknownError(error)}`);
    }

    return photoGroups;
}

/**
 * Find related messages within a specific time interval.
 * @param messages - List of messages
 * @param photoGroups - List of photo groups
 * @param timeInterval - Time interval in hours
 * @returns Array of related messages
 */
function findRelatedMessages(messages: Message[], photoGroups: number[][], timeInterval: number): number[][] {
    const relatedMessages: number[][] = [];
    const interval = timeInterval * 60 * 60 * 1000;

    try {
        for (const group of photoGroups) {
            const groupTimestamps = group.map(id => messages.find(msg => msg.id === id)?.timestamp).filter(Boolean) as Date[];
            const startTime = new Date(Math.min(...groupTimestamps.map(ts => ts.getTime())) - interval);
            const endTime = new Date(Math.max(...groupTimestamps.map(ts => ts.getTime())) + interval);

            const groupRelatedMessages = messages
                .filter(msg => startTime <= msg.timestamp && msg.timestamp <= endTime)
                .map(msg => msg.id);

            relatedMessages.push(groupRelatedMessages);
        }
    } catch (error) {
        console.error(`An error occurred while finding related messages: ${handleUnknownError(error)}`);
    }

    return relatedMessages;
}

/**
 * Generate prompts for Azure OpenAI based on related messages.
 * @param messages - List of messages
 * @param relatedMessages - List of related messages
 * @returns Array of prompts
 */
function generatePrompts(messages: Message[], relatedMessages: number[][]): string[] {
    const prompts: string[] = [];

    try {
        relatedMessages.forEach((relatedGroup) => {
            const relatedMessages_1h = relatedGroup
                .map(msgId => {
                    const msg = messages.find(m => m.id === msgId);
                    return `${msg?.timestamp.toISOString()}: ${msg?.sender}: ${msg?.content}`;
                })
                .join('\n');

            const prompt = `
Voici une liste de messages pouvant potentiellement décrire une collection de photos que nous ne pouvons pas voir.
Il faut noter qu'il s'agit des messages envoyés dans la même heure que les photos. Les voici :
${relatedMessages_1h}

À partir de ces messages, l'objectif est d'inférer un unique titre pour toute la collection d'images, mais si et seulement si l'on est sûr de ce qu'elle représente.
Il faut donc inférer un titre si et seulement si le message fait référence à un évènement en particulier (un lieu, un anniversaire, un voyage...).
Prend aussi en compte le moment où le message a été envoyé (si l'intervalle de temps entre le message et les photos est trop important cela signifie qu'il est moins probable que le message décrit les photos),
et la personne qui a envoyé le message (si le message a été envoyé par une personne différente de celle qui a envoyé les photos, cela signifie qu'il est moins probable que le message décrive les photos).

Si tu as trop peu d'informations, écris null à la place du titre. Attention tu ne dois pas écrire Null ou "null" ou "Null".
Le format doit être une phrase courte de quelques mots entourée par des ".
Il est très important : les titres ne doivent pas contenir d'expression dans le type "Colletion de photos ..." ou "Colletion d'images ...". C'est formellement interdit!
Des exemples typiques seraient "Vacances au ski d'Albin" ou "Journée piscine de Capucine".
Tu ne dois me donner qu'un titre!
Le titre doit être en français.
Tu ne dois pas halluciner.
Essaie d'éviter d'utiliser les termes "Collection" ou "Album".
            `;

            prompts.push(prompt);
        });
    } catch (error) {
        console.error(`An error occurred while generating prompts: ${handleUnknownError(error)}`);
    }

    return prompts;
}

/**
 * Get titles from Azure OpenAI based on generated prompts.
 * @param prompts - Array of prompts
 * @returns Promise resolving to an array of titles
 */
async function getTitlesFromAzureGpt(prompts: string[]): Promise<string[]> {
    const responses: string[] = [];
    let i = 1;

    for (const prompt of prompts) {
        try {
            const response = await client.getChatCompletions(deploymentName, [
                { role: 'user', content: prompt }
            ]);

            const content = response.choices[0].message?.content?.trim();
            let title: string;

            if (!content) {
                title = `Album sans titre ${i}`;
                i++;
            } else {
                title = content.trim().replace(/"/g, ''); // Remove quotes
                if (["null", "Null", "\"Null\"", "\"null\""].includes(title)) {
                    title = `Album sans titre ${i}`;
                    i++;
                }
            }

            responses.push(title);
        } catch (error) {
            console.error(`An error occurred while getting a response from Azure OpenAI: ${handleUnknownError(error)}`);
            responses.push(`Album sans titre ${i}`);
            i++;
        }
    }

    return responses;
}

/**
 * Extract filename from message content.
 * @param content - Message content containing the filename
 * @returns Extracted filename
 */
function extractFilename(content: string): string {
    try {
        if (/< pièce jointe :/.test(content)) {
            return content.split(":")[1].trim().split('-')[0];
        } else if (/fichier joint/.test(content)) {
            const parts = content.split(' ')[0].split('.');
            const nameParts = parts[0].split('-');
            if (nameParts.length >= 3) {
                return `${nameParts[1]}-${nameParts[2]}`;
            }
        }
    } catch (error) {
        console.error(`Error extracting filename from content: ${handleUnknownError(error)}`);
    }
    console.warn(`Unknown format for content: ${content}`);
    return "Unknown format";
}

/**
 * Convert messages and titles into a chatResponseObject.
 * @param messages - List of messages
 * @param photoGroups - List of photo groups
 * @param titles - List of titles
 * @param filenamesForGroups - List of filenames for each group
 * @returns Converted chatResponseObject
 */
function convertToChatResponseObject(messages: Message[], photoGroups: number[][], titles: string[], filenamesForGroups: string[][]): ChatResponseObject {
    const sortedAlbums: ChatResponseObject = {
        [Symbol.iterator](): Iterator<{ key: string, value: string[] }> {
            let entries = Object.entries(this);
            let index = 0;
            return {
                next() {
                    if (index < entries.length) {
                        return { value: { key: entries[index][0], value: entries[index++][1] }, done: false };
                    } else {
                        return { done: true, value: null };
                    }
                }
            };
        }
    };

    try {
        photoGroups.forEach((group, index) => {
            const title = titles[index];
            const photos = filenamesForGroups[index];
            sortedAlbums[title] = photos;
        });
    } catch (error) {
        console.error(`Error converting to chatResponseObject: ${handleUnknownError(error)}`);
    }

    return sortedAlbums;
}

/**
 * Log related messages for debugging.
 * @param messages - List of messages
 * @param relatedMessages - List of related messages
 */
function logRelatedMessages(messages: Message[], relatedMessages: number[][]): void {
    try {
        relatedMessages.forEach((relatedGroup, index) => {
            console.log(`Related messages for photo group ${index + 1}:`);
            relatedGroup.forEach(msgId => {
                const msg = messages.find(m => m.id === msgId);
                if (msg) {
                    console.log(`[${msg.timestamp.toISOString()}] ${msg.sender}: ${msg.content}`);
                }
            });
        });
    } catch (error) {
        console.error(`Error logging related messages: ${handleUnknownError(error)}`);
    }
}

/**
 * Add captions to photo messages.
 * @param messages - List of messages
 * @param photoGroups - List of photo groups
 * @param captionsForGroups - List of captions for each group
 */
function addCaptionsToMessages(messages: Message[], photoGroups: number[][], captionsForGroups: string[][]): void {
    try {
        photoGroups.forEach((group, index) => {
            const captions = captionsForGroups[index];
            group.forEach((msgId, captionIndex) => {
                const msg = messages.find(m => m.id === msgId);
                if (msg && captions[captionIndex]) {
                    msg.content += `\nLégende : ${captions[captionIndex]}`;
                }
            });
        });
    } catch (error) {
        console.error(`Error adding captions to messages: ${handleUnknownError(error)}`);
    }
}

/**
 * Generate a unique prompt to get the grouping suggestions from GPT.
 * @param messages - List of messages
 * @param relatedMessages - List of related messages
 * @returns Generated prompt string
 */
function generateGroupingPrompt(messages: Message[], relatedMessages: number[][]): string {
    const groupsText = relatedMessages.map((relatedGroup, index) => {
        const groupMessages = relatedGroup
            .map(msgId => {
                const msg = messages.find(m => m.id === msgId);
                return `${msg?.timestamp.toISOString()}: ${msg?.sender}: ${msg?.content}`;
            })
            .join('\n');
        return `Groupe ${index + 1}:\n${groupMessages}`;
    }).join('\n\n');

    return `
Voici une liste de groupes de messages pouvant potentiellement décrire des collections de photos.
Il s'agit des messages envoyés dans l'heure avant ou après l'envoi de photos. Les voici :
${groupsText}

À partir de ces groupes de messages, l'objectif est d'inférer quels groupes peuvent être combinés car ils se rapportent au même événement ou sujet.
Prends en compte le sender, le timestamp et le contexte.
Retourne les numéros des groupes qui peuvent être regroupés sous forme de liste de numéros de groupe.
Les groupes ne doivent être fusionnés que si l'on est certain qu'ils se rapportent au même événement ou sujet.
Le format de retour doit absolument être: [1, 2, 4], [3, 5], [6]. Tu ne dois écrire que ça et rien d'autre.
    `;
}

/**
 * Get grouping suggestions from Azure OpenAI based on the generated prompt.
 * @param prompt - The generated prompt
 * @returns List of grouping suggestions
 */
async function getGroupingSuggestionsFromAzureGpt(prompt: string): Promise<number[][]> {
    try {
        const response = await client_4.getChatCompletions(deploymentName_4, [
            { role: 'user', content: prompt }
        ]);

        const content = response.choices[0].message?.content?.trim();
        let groupingSuggestions: number[][] = [];

        if (content) {
            // Regular expression to find all groups in the format [1, 2, 3]
            const regex = /\[([0-9,\s]+)\]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const group = match[1].split(',').map(num => parseInt(num.trim()));
                groupingSuggestions.push(group);
            }
        }
        return groupingSuggestions;
    } catch (error) {
        console.error(`An error occurred while getting grouping suggestions from Azure OpenAI: ${handleUnknownError(error)}`);
        return [];
    }
}

/**
 * Merge groups based on grouping suggestions from GPT.
 * @param photoGroups - List of photo groups
 * @param filenamesForGroups - List of filenames for each group
 * @param relatedMessages - List of related messages
 * @param groupingSuggestions - Grouping suggestions from GPT (1-based index)
 * @returns Merged photo groups, filenames, and related messages in order
 */
function mergeGroups(
    photoGroups: number[][],
    filenamesForGroups: string[][],
    relatedMessages: number[][],
    groupingSuggestions: number[][]
): { mergedPhotoGroups: number[][], mergedFilenamesForGroups: string[][], mergedRelatedMessages: number[][] } {
    const mergedPhotoGroups: number[][] = [];
    const mergedFilenamesForGroups: string[][] = [];
    const mergedRelatedMessages: number[][] = [];

    // Set to keep track of merged indices
    const mergedIndices = new Set<number>();

    // Process the grouping suggestions and merge groups
    groupingSuggestions.forEach((groupIndexes) => {
        const mergedPhotoGroup: Set<number> = new Set();
        const mergedFilenamesGroup: Set<string> = new Set();
        const mergedRelatedGroup: Set<number> = new Set();

        // Adjust 1-based indices to 0-based and merge
        groupIndexes.forEach(index => {
            const adjustedIndex = index - 1; // Convert to 0-based index
            if (adjustedIndex >= 0 && adjustedIndex < photoGroups.length) {
                mergedIndices.add(adjustedIndex);  // Mark this index as merged
                photoGroups[adjustedIndex].forEach(id => mergedPhotoGroup.add(id));
                filenamesForGroups[adjustedIndex].forEach(filename => mergedFilenamesGroup.add(filename));
                relatedMessages[adjustedIndex].forEach(id => mergedRelatedGroup.add(id));
            }
        });

        // Convert Sets to Arrays and add to merged lists
        mergedPhotoGroups.push(Array.from(mergedPhotoGroup));
        mergedFilenamesForGroups.push(Array.from(mergedFilenamesGroup));
        mergedRelatedMessages.push(Array.from(mergedRelatedGroup));
    });

    // Add non-merged groups in order
    photoGroups.forEach((group, index) => {
        if (!mergedIndices.has(index)) {
            mergedPhotoGroups.push(group);
            mergedFilenamesForGroups.push(filenamesForGroups[index]);
            mergedRelatedMessages.push(relatedMessages[index]);
        }
    });

    // Sort the merged result to keep the order of original groups
    const indexMap = new Map<number, number>();
    mergedPhotoGroups.forEach((group, i) => {
        indexMap.set(group[0], i); // Using the first element of the group to map the index
    });

    const sortedIndices = Array.from(indexMap.keys()).sort((a, b) => a - b);

    const sortedMergedPhotoGroups = sortedIndices.map(index => mergedPhotoGroups[indexMap.get(index)!]);
    const sortedMergedFilenamesForGroups = sortedIndices.map(index => mergedFilenamesForGroups[indexMap.get(index)!]);
    const sortedMergedRelatedMessages = sortedIndices.map(index => mergedRelatedMessages[indexMap.get(index)!]);

    return { mergedPhotoGroups: sortedMergedPhotoGroups, mergedFilenamesForGroups: sortedMergedFilenamesForGroups, mergedRelatedMessages: sortedMergedRelatedMessages };
}

export async function getSortedAlbums(chat: string, wachatId: string): Promise<ChatResponseObject | null> {
    try {
        chat = chat.replace("‎", "");

        const messages = extractChat(chat, oneYearAgo);

        if (!messages.length) {
            console.warn("No messages found for the given date range.");
            return null;
        }

        const photoGroups = findPhotoGroups(messages);

        if (!photoGroups.length) {
            console.warn("No photo groups found.");
            return null;
        }

        const filenamesForGroups = extractFilenamesFromGroups(messages, photoGroups);

        const captionsForGroups = await analyzePhotoGroups(messages, photoGroups, wachatId);

        captionsForGroups.forEach((captions, index) => {
            console.log(`Captions for photo ${index + 1}: ${captions.join(', ')}`);
        });

        addCaptionsToMessages(messages, photoGroups, captionsForGroups);

        const relatedMessages_1h = findRelatedMessages(messages, photoGroups, 1);
        console.log(relatedMessages_1h);

        const groupingPrompt = generateGroupingPrompt(messages, relatedMessages_1h);
        const groupingSuggestions = await getGroupingSuggestionsFromAzureGpt(groupingPrompt);
        const { mergedPhotoGroups, mergedFilenamesForGroups, mergedRelatedMessages } = mergeGroups(photoGroups, filenamesForGroups, relatedMessages_1h, groupingSuggestions);

        console.log(mergedRelatedMessages);
        const prompts = generatePrompts(messages,  mergedRelatedMessages);

        const titles = await getTitlesFromAzureGpt(prompts);

        const sortedAlbums = convertToChatResponseObject(messages, mergedPhotoGroups, titles, mergedFilenamesForGroups);
        console.log(JSON.stringify(sortedAlbums, null, 2));
        return sortedAlbums;
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return null;
    }
    
};