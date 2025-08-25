
// const slackWebhookUrl = "https://hooks.slack.com/services/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";

// coding=utf-8

// Axios library for HTTP requests.
const axios = require('axios');

// TODO: Insert your Slack Webhook URL here.
const slackWebhookUrl = "https://hooks.slack.com/services/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";


// Canvas AI API setup
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`;
// TODO: When running the code on a local machine, add your API key here.
// In the Canvas environment, leave it blank.
const API_KEY = "AIzaSyB_x8VWKB6iuXu-QITmM3wdMxXB2UmMxeE";


// Async function to generate a motivational thought from the AI
async function getAIText(prompt, retries = 3, delay = 1000) {
    // Handle API key for local and Canvas environments.
    const apiKey = typeof __API_KEY !== 'undefined' ? __API_KEY : API_KEY;
    const apiUrlWithKey = `${API_URL}?key=${apiKey}`;

    for (let i = 0; i < retries; i++) {
        try {
            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            const response = await fetch(apiUrlWithKey, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                return text.trim(); // Trim whitespace
            } else {
                throw new Error(`API call failed with status ${response.status}`);
            }
        } catch (error) {
            if (i < retries - 1) {
                console.warn(`API call failed. Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.error("Error generating text from AI:", error.message);
                throw error;
            }
        }
    }
    return "Aaj ka din ek naye mauke ki tarah hai! ✨"; // Fallback thought
}

// Main function that sends the daily motivation to Slack
async function sendDailyMotivation() {
    console.log("Generating motivational thought from AI...");
    
    try {
        // Request a motivational thought from the AI
        const prompt = "Write one powerful 1-line motivational quote in the style of a famous programmer or tech leader, like Bill Gates or Linus Torvalds. It should inspire coders to keep learning, solving problems, and growing in coding. Add a new line with the author's name formatted as '— Author Name'.";
        const motivationalThought = await getAIText(prompt);

        // Check if the thought was successfully generated
        if (!motivationalThought) {
            throw new Error("Failed to generate motivational thought.");
        }

        // Slack message payload using Block Kit
        const slackPayload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Today's Motivational Thought 🚀",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `\`\`\`${motivationalThought}\`\`\``
                    }
                }
            ]
        };

        // Send the HTTP POST request using Axios
        const response = await axios.post(slackWebhookUrl, slackPayload, {
            headers: {'Content-Type': 'application/json'}
        });
        
        if (response.status === 200) {
            console.log("Motivational thought successfully sent to Slack!");
        } else {
            console.log(`Error sending message. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error("Error sending message to Slack:", error.message);
    }
}

// Run the function
sendDailyMotivation();