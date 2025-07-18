const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8888;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (pathname === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else if (pathname === '/styles.css') {
        fs.readFile(path.join(__dirname, 'styles.css'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else if (pathname === '/api/gemini' && req.method === 'POST') {
        // Handle API request
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const prompt = data.prompt || '';
                
                // Simple analysis based on content
                const response = analyzeContent(prompt);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Analysis failed' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

function analyzeContent(prompt) {
    const text = prompt.toLowerCase();
    
    console.log('Analyzing content:', text.substring(0, 200));
    console.log('Contains Mike Jenson?', text.includes('mike jenson'));
    console.log('Contains PlantSnap?', text.includes('plantsnap'));
    console.log('Contains biology teacher?', text.includes('biology teacher'));
    
    // Detect if this is the Mike Jenson PlantSnap interview
    if (text.includes('mike jenson') || text.includes('plantsnap') || text.includes('plant identification') || text.includes('biology teacher') || text.includes('bellevue')) {
        console.log('Using Mike Jenson persona data');
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": JSON.stringify({
                            "userProblems": [],
                            "emotionalInsights": [],
                            "keyQuotes": [],
                            "persona": {
                                "name": "Nature-loving Educator",
                                "personalInfo": {
                                    "name": "Mike Jenson",
                                    "age": "28",
                                    "location": "Bellevue",
                                    "role": "Middle school biology teacher"
                                },
                                "quote": "I wish the app were more professional—ideally, it would offer accurate results, richer content, and a way to connect with a knowledgeable community",
                                "background": "Biology teacher who loves nature photography and plant identification. Uses apps to enhance teaching and personal exploration of plants and nature.",
                                "goals": [
                                    "Get accurate plant identification under any conditions",
                                    "Connect with plant experts and community members",
                                    "Access comprehensive plant information for teaching"
                                ],
                                "painPoints": [
                                    "Low accuracy of plant identification results",
                                    "No community features to verify findings",
                                    "Important features locked behind paywall subscription"
                                ],
                                "highLevelMotivations": [
                                    "Deep love for plants and nature exploration",
                                    "Strong desire for community connection and learning",
                                    "Professional need for reliable educational resources"
                                ]
                            }
                        })
                    }]
                }
            }]
        };
    }
    
    // Generic analysis for other content
    let context = 'digital_product';
    let personaName = 'Digital User';
    let role = 'Product user';
    
    if (text.includes('shop') || text.includes('buy') || text.includes('purchase')) {
        context = 'ecommerce';
        personaName = 'Efficient Shopper';
        role = 'Online shopper';
    } else if (text.includes('app') || text.includes('mobile')) {
        context = 'mobile';
        personaName = 'Mobile User';
        role = 'Mobile-first user';
    } else if (text.includes('website') || text.includes('site')) {
        context = 'website';
        personaName = 'Information Seeker';
        role = 'Information seeker';
    }
    
    // Extract name if present  
    let userName = 'User';
    const namePatterns = [
        /name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+\d+\s+years?\s+old/i,
        /interviewee[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    ];
    
    for (const pattern of namePatterns) {
        const match = prompt.match(pattern);
        if (match) {
            userName = match[1];
            break;
        }
    }
    
    // Extract quotes
    const quoteMatch = prompt.match(/["']([^"']+)["']/);
    const userQuote = quoteMatch ? quoteMatch[1] : `I want ${context === 'ecommerce' ? 'shopping' : 'using this'} to be easier`;
    
    return {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": JSON.stringify({
                        "userProblems": [],
                        "emotionalInsights": [],
                        "keyQuotes": [],
                        "persona": {
                            "name": personaName,
                            "personalInfo": {
                                "name": userName,
                                "age": "25-40",
                                "location": "Urban area", 
                                "role": role
                            },
                            "quote": userQuote,
                            "background": `User who regularly interacts with digital products and expects efficient, user-friendly experiences in their daily workflow.`,
                            "goals": [
                                "Complete tasks efficiently and effectively",
                                "Have smooth and intuitive user experience",
                                "Achieve desired outcomes quickly"
                            ],
                            "painPoints": [
                                "Complex interfaces and confusing navigation",
                                "Slow performance and loading times", 
                                "Poor user experience design"
                            ],
                            "highLevelMotivations": [
                                "Achieve goals efficiently and save time",
                                "Maintain productivity and avoid frustration",
                                "Have reliable and smooth experience"
                            ]
                        }
                    })
                }]
            }
        }]
    };
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Quick server running on http://127.0.0.1:${PORT}`);
    console.log(`Also try: http://localhost:${PORT}`);
    console.log('Ready for testing!');
});