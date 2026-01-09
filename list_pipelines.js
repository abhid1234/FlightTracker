
const https = require('https');

const accountIdentifier = process.env.HARNESS_ACCOUNT_ID;
const orgIdentifier = process.env.HARNESS_ORG_ID;
const projectIdentifier = process.env.HARNESS_PROJECT_ID;
const apiKey = process.env.HARNESS_API_KEY;

if (!accountIdentifier || !orgIdentifier || !projectIdentifier || !apiKey) {
    console.error('Please set HARNESS_ACCOUNT_ID, HARNESS_ORG_ID, HARNESS_PROJECT_ID, and HARNESS_API_KEY environment variables.');
    process.exit(1);
}

const postData = JSON.stringify({
    filterType: 'PipelineSetup'
});

const options = {
    hostname: 'app.harness.io',
    path: `/gateway/pipeline/api/pipelines/list?accountIdentifier=${accountIdentifier}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
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
                console.log('Pipelines:', JSON.stringify(json, null, 2));
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

req.write(postData);
req.end();
