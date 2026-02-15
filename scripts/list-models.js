const https = require('https');

const apiKey = process.argv[2];
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('Error:', json.error.message);
            } else {
                console.log('Available Models:');
                if (json.models) {
                    json.models.forEach(model => {
                        console.log(`- ${model.name} (${model.displayName})`);
                    });
                } else {
                    console.log('No models found (or unexpected response format).');
                    console.log(JSON.stringify(json, null, 2));
                }
            }
        } catch (e) {
            console.error('Failed to parse response:', e.message);
            console.log('Raw response:', data);
        }
    });

}).on('error', (err) => {
    console.error('Request failed:', err.message);
});
