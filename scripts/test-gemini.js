const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.argv[2];

async function testModel(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`PASS: ${modelName}`);
    } catch (error) {
        console.log(`FAIL: ${modelName}`);
        console.log(error.message);
        if (error.response) {
            console.log(JSON.stringify(error.response, null, 2));
        }
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
}

run();
