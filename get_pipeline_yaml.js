
const https = require('https');

const accountIdentifier = process.env.HARNESS_ACCOUNT_ID;
const orgIdentifier = process.env.HARNESS_ORG_ID;
const projectIdentifier = process.env.HARNESS_PROJECT_ID;
const apiKey = process.env.HARNESS_API_KEY;
// The pipeline identifier found in the previous step
const pipelineIdentifier = 'Build_abhid1234_Developer_1767752195812';

if (!accountIdentifier || !orgIdentifier || !projectIdentifier || !apiKey) {
    console.error('Please set HARNESS_ACCOUNT_ID, HARNESS_ORG_ID, HARNESS_PROJECT_ID, and HARNESS_API_KEY environment variables.');
    process.exit(1);
}

const options = {
    hostname: 'app.harness.io',
    path: `/gateway/pipeline/api/pipelines/${pipelineIdentifier}?accountIdentifier=${accountIdentifier}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                console.error('Error parsing response:', e);
                console.log('Raw response:', data);
            }
        } else {
            console.error(`Request failed with status: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
