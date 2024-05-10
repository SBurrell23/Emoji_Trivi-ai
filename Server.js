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
                The emojis and your reasons should be an array of objects called 'clues'. An object will look like this: {emoji: '😀', reason: 'This ${category} is usually happy.'}
                The name of the random ${category} you chose should be a key value pair where the key is 'answer' and the value is the name of the ${category}.
                Here is the entire structure of the object not including values {clues:[{emoji:'',reason:''}],answer:['']}
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
    console.log("Guess: "+guess);
    console.log("Answer: "+answer);

    var correctAnswer = areStringsSimilar(guess,answer);
    var prompt;
    if(correctAnswer)
        prompt = "Tell me how smart and am and say that i guessed the right answer!";
    else
        prompt = "Insult my intelligence and tell me how stupid i am for guessing the wrong answer!";
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: prompt
            },
        ],
        model: "gpt-3.5-turbo-0125"
    });
    console.log(completion.choices[0].message.content);
    res.statusCode = 200;
    res.end(JSON.stringify(completion.choices[0].message.content));
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function areStringsSimilar(a, b, threshold = 0.6) {
  const distance = levenshteinDistance(a, b);
  const longestLength = Math.max(a.length, b.length);
  const similarity = (longestLength - distance) / longestLength;
  return similarity >= threshold;
}

function handleUnknownRoute(req, res) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
}

const port = 8080;
server.listen(port, () => {console.log(`Server is running on port ${port}`);});
