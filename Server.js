const http = require('http');
const url = require('url');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.argv[2] });

const server = http.createServer((req, res) => {
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Parse URL and query parameters
    const parsedUrl = url.parse(req.url, true);

    // Handle different routes
    if (parsedUrl.pathname === '/api/question')
        callTriviaAI(req, res, parsedUrl.query.category);
    else if (parsedUrl.pathname === '/api/guess')
         callGuessAI(req, res,parsedUrl.query.guess,parsedUrl.query.answer);
    else 
        handleUnknownRoute(req, res);
});

async function callTriviaAI(req, res, category) {
    console.log("Category: "+category);
    const completion = await openai.chat.completions.create({
        messages: [

            {
                role: "user",
                content:`
                We are playing a game.
                First you pick a random ${category}.
                Then pick 7 emojis that best represent that ${category} along with a reason why you picked that emoji.
                `
            },
            {
                role: "system",
                content: `
                The response you give will be in json. 
                The emojis and your reasons should be an array of objects called 'clues'. An obejct will look like this: {emoji: '😀', reason: 'This ${category} is usually happy.'}
                The name of the random ${category} you chose should be a string called 'answer' that live as it own key at the root of the object.
                Here is the structure of the object {clues:[{emoji:'',reason:''}],answer:''}
                `,
            }
            
        ],
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" }
    });
    

    console.log(completion.choices[0].message.content);
    res.statusCode = 200;
    res.end(JSON.stringify(completion.choices[0].message.content));
    
}


async function callGuessAI(req, res, guess,answer) {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `
                You are the trivia master for a game we are playing.
                I will give you a players guess and then the correct answer (split by a colon).
                If the guess is the same as the answer, you should tell them how smart they are in a clever and cheerful way.
                If the guess is not the same as the answer, you should tell them how stupid they are in a spiteful and mean way.
                `
            },
            {
                role: "user",
                content: guess.toLowerCase()+":"+answer.toLowerCase()
            }
        ],
        model: "gpt-3.5-turbo-0125"
    });
    console.log(completion.choices[0].message.content);
    res.statusCode = 200;
    res.end(JSON.stringify(completion.choices[0].message.content));
}


function handleUnknownRoute(req, res) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
}

const port = 8080;
server.listen(port, () => {console.log(`Server is running on port ${port}`);});
