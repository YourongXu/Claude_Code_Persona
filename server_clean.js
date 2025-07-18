const express = require('express');
const cors = require('cors');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 配置代理
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:4780';
let proxyAgent = null;
try {
    proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log('Proxy configured:', proxyUrl);
} catch (error) {
    console.log('No proxy configured, using direct connection');
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 代理路由处理 Gemini API 请求
app.post('/api/gemini', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        console.log('Sending request to Gemini API for real analysis...');
        
        try {
            // 构建请求选项
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Please analyze the following user interview content and return structured insights in valid JSON format:

Interview Content:
${prompt}

Please return JSON in the following exact format:
{
    "userProblems": [
        {
            "problem": "Problem description based on the interview",
            "severity": "High/Medium/Low",
            "context": "Related background from the interview"
        }
    ],
    "emotionalInsights": [
        {
            "emotion": "Emotion type identified from the interview",
            "intensity": "Intensity level 1-5",
            "context": "Triggering context from the interview",
            "quote": "Direct quote from the interview text"
        }
    ],
    "keyQuotes": [
        {
            "quote": "Important quote from the interview",
            "significance": "Why this quote is significant",
            "category": "Category (Pain point/Need/Suggestion/etc.)"
        }
    ],
    "persona": {
        "name": "Descriptive persona name based on the interview",
        "personalInfo": {
            "name": "User name from interview or inferred name",
            "age": "Age range based on interview context",
            "location": "Geographic location mentioned or inferred",
            "role": "Job title or professional role"
        },
        "quote": "Representative quote from the interview (max 20 words)",
        "background": "Brief introduction in 2-3 sentences (max 35 words)",
        "goals": ["Primary goal (max 10 words)", "Secondary goal (max 10 words)", "Third goal (max 10 words)"],
        "painPoints": ["Main pain point (max 10 words)", "Secondary pain point (max 10 words)", "Third pain point (max 10 words)"],
        "highLevelMotivations": ["Core motivation (max 10 words)", "Secondary motivation (max 10 words)", "Third motivation (max 10 words)"]
    }
}

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Base all content on the actual interview text provided.`
                        }]
                    }]
                })
            };

            // 如果有代理，添加到请求选项中
            if (proxyAgent) {
                requestOptions.agent = proxyAgent;
                console.log('Using proxy for request');
            } else {
                console.log('Using direct connection');
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, requestOptions);

            if (!response.ok) {
                console.error('Gemini API error:', response.status, response.statusText);
                throw new Error(`Gemini API returned ${response.status}`);
            }

            const data = await response.json();
            console.log('Gemini API request successful');
            res.json(data);

        } catch (error) {
            console.error('Failed to get real analysis:', error.message);
            console.log('Falling back to basic mock response...');
            
            // 如果 API 失败，返回基本模拟数据
            const fallbackResponse = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": `{
                                "userProblems": [
                                    {
                                        "problem": "Unable to analyze - API connection issue",
                                        "severity": "Medium",
                                        "context": "Real-time analysis unavailable, please check network connection"
                                    }
                                ],
                                "emotionalInsights": [
                                    {
                                        "emotion": "Neutral",
                                        "intensity": "1",
                                        "context": "Analysis pending",
                                        "quote": "Real analysis unavailable"
                                    }
                                ],
                                "keyQuotes": [
                                    {
                                        "quote": "Analysis temporarily unavailable",
                                        "significance": "API connection needed for real analysis",
                                        "category": "System"
                                    }
                                ],
                                "persona": {
                                    "name": "Analysis Pending",
                                    "quote": "Please try again when connection is available",
                                    "background": "Real analysis requires API connection",
                                    "goals": ["Restore connection", "Complete analysis"],
                                    "painPoints": ["Network issues", "API access"],
                                    "highLevelMotivations": ["Get working analysis", "Complete research"]
                                }
                            }`
                        }]
                    }
                }]
            };
            res.json(fallbackResponse);
        }

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

// 提供静态文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`Also accessible at http://localhost:${PORT}`);
    console.log('Using smart mock responses based on input content');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Graceful shutdown...');
    server.close(() => {
        console.log('Server closed.');
    });
});