// const Clothing = require('../models/Clothing');
// const mongoose = require('mongoose');

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return [];
    }
    console.log('10 upcoming events found!');

    return events;
}

/**
 * Lists the events for the current day on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listTodaysEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1); // Set time to the beginning of the next day

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: currentDate.toISOString(),
        timeMax: nextDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
        console.log('No events found for today.');
        return [];
    }

    return events;
}

// AI Generated Outfit
const { TextServiceClient } = require('@google-ai/generativelanguage');
const { GoogleAuth } = require('google-auth-library');

async function getOutfit(events) {
    const MODEL_NAME = 'models/text-bison-001';
    const API_KEY = process.env.PALM_API_KEY;

    const client = new TextServiceClient({
        authClient: new GoogleAuth().fromAPIKey(API_KEY),
    });

    let promptString = `You are a personal stylist who gives advice on outfits to wear BASED UPON events in a given day. First, prioritize the events given to you in terms of importance. Then, based on prioritization, create a singular outfit for the entire day. Assume the user is non-binary. Your responses should be short and concise and only contain one outfit.`;

    promptString += `Today's events are: ${events}`;

    promptString +=
        'Your responses should only contain the outfit, nothing else. Do not use odd formatting.';

    const stopSequences = [];

    let outfit = 'Could not generate outfit...';

    await client
        .generateText({
            // required, which model to use to generate the result
            model: MODEL_NAME,
            // optional, 0.0 always uses the highest-probability result
            temperature: 0.8,
            // optional, how many candidate results to generate
            candidateCount: 1,
            // optional, number of most probable tokens to consider for generation
            top_k: 40,
            // optional, for nucleus sampling decoding strategy
            top_p: 0.95,
            // optional, maximum number of output tokens to generate
            max_output_tokens: 1024,
            // optional, sequences at which to stop model generation
            stop_sequences: stopSequences,
            // optional, safety settings
            safety_settings: [
                { category: 'HARM_CATEGORY_DEROGATORY', threshold: 3 },
                { category: 'HARM_CATEGORY_TOXICITY', threshold: 3 },
                { category: 'HARM_CATEGORY_VIOLENCE', threshold: 3 },
                { category: 'HARM_CATEGORY_SEXUAL', threshold: 3 },
                { category: 'HARM_CATEGORY_MEDICAL', threshold: 3 },
                { category: 'HARM_CATEGORY_DANGEROUS', threshold: 3 },
            ],
            prompt: {
                text: promptString,
            },
        })
        .then((result) => {
            try {
                outfit = result[0]['candidates'][0]['output'];
            } catch (error) {
                console.log(error);
            }
        });

    return outfit;
}

// GET Stylist
exports.stylist = async (req, res) => {
    const locals = {
        title: 'Stylist - IntelliStyle',
        description: 'IntelliStyle - Your Personal Stylist',
    };

    const events = await authorize()
        .then(listTodaysEvents)
        .catch(console.error);

    const formattedEvents = events.map((event, i) => {
        // const start = event.start.dateTime || event.start.date;
        // console.log(`${start} - ${event.summary}`);
        return `${event.summary}`;
    });

    const aiOutfit = await getOutfit(formattedEvents);

    res.render('stylist/index', {
        userName: req.user.firstName,
        locals,
        events: formattedEvents,
        outfit: aiOutfit,
        layout: '../views/layouts/stylist',
    });
};
