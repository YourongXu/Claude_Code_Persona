const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 配置 API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('Warning: GEMINI_API_KEY not found in environment variables');
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 代理配置 - 首先尝试不使用代理
console.log('Starting server with AI-powered smart analysis...');
let proxyAgent = null;

// 测试路由
app.post('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// 智能分析函数
function analyzeInterview(prompt) {
    const text = prompt.toLowerCase();
    
    // 提取关键信息
    const keywords = {
        names: extractNames(prompt),
        emotions: detectEmotions(text),
        problems: detectProblems(text),
        context: detectContext(text),
        quotes: extractQuotes(prompt)
    };
    
    return generatePersonalizedResponse(keywords, prompt);
}

function extractNames(text) {
    console.log('Original text for name extraction:', text);
    
    const names = [];
    
    // 1. 提取英文名字 - 改进的正则表达式
    const englishNameMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
    console.log('English name matches found:', englishNameMatches);
    
    englishNameMatches.forEach(name => {
        // 过滤掉常见的非人名词汇和短语
        const excludeWords = [
            'Interview', 'User', 'During', 'Sarah', 'John', 'The', 'I', 'It', 'And', 'But', 
            'When', 'Where', 'What', 'How', 'Why', 'This', 'That', 'With', 'Without', 
            'They', 'We', 'You', 'He', 'She', 'His', 'Her', 'My', 'Our', 'Their',
            'Mobile', 'App', 'Website', 'Design', 'Interface', 'UX', 'UI', 'Product',
            'Plant', 'ID', 'Then', 'Just', 'Super', 'Really', 'Time', 'User Interview',
            'Background', 'Goals', 'Pain Points', 'Motivations', 'Classification'
        ];
        
        // 排除包含"User"或"Interview"的组合
        const excludePatterns = [
            /User\s+\w+/i,
            /\w+\s+Interview/i,
            /Interview\s+\w+/i,
            /\w+\s+User/i
        ];
        
        const isExcludedPattern = excludePatterns.some(pattern => pattern.test(name));
        
        if (!excludeWords.includes(name) && !isExcludedPattern && name.length >= 2) {
            names.push(name);
        }
    });
    
    // 2. 查找明确的采访对象标识
    const intervieweePatterns = [
        /(?:interviewee|participant|user)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
        /(?:name|called|i'm|my name is)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
        /([A-Z][a-z]+)(?:\s+said|\s+mentioned|\s+expressed)/gi
    ];
    
    intervieweePatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match[1] && match[1].length >= 2 && !match[1].includes('User') && !match[1].includes('Interview')) {
                console.log('Found name from pattern:', match[1]);
                names.push(match[1]);
            }
        }
    });
    
    // 3. 中文名字提取
    const chineseNameMatches = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    console.log('Chinese name matches found:', chineseNameMatches);
    
    chineseNameMatches.forEach(name => {
        // 过滤掉常见的中文非人名词汇
        const excludeChineseWords = ['用户', '采访', '网站', '应用', '界面', '设计', '产品', '功能', '体验'];
        if (!excludeChineseWords.includes(name) && name.length >= 2 && name.length <= 4) {
            names.push(name);
        }
    });
    
    // 去重并优先选择最可能是人名的
    const uniqueNames = [...new Set(names)];
    console.log('All extracted names:', uniqueNames);
    
    // 如果找到多个名字，优先选择看起来最像人名的
    if (uniqueNames.length > 0) {
        // 优先选择2-15字符长度的名字，且不包含User或Interview
        const filteredNames = uniqueNames.filter(name => 
            name.length >= 2 && 
            name.length <= 15 && 
            !name.includes('User') && 
            !name.includes('Interview')
        );
        console.log('Filtered names:', filteredNames);
        return filteredNames;
    }
    
    console.log('No names found, returning empty array');
    return [];
}

function detectEmotions(text) {
    const emotions = [];
    if (text.includes('frustrat') || text.includes('annoyed')) emotions.push({type: 'Frustration', intensity: 4});
    if (text.includes('confused') || text.includes('confusing')) emotions.push({type: 'Confusion', intensity: 3});
    if (text.includes('stressed') || text.includes('overwhelmed')) emotions.push({type: 'Stress', intensity: 4});
    if (text.includes('disappointed')) emotions.push({type: 'Disappointment', intensity: 3});
    if (text.includes('angry')) emotions.push({type: 'Anger', intensity: 5});
    if (text.includes('happy') || text.includes('satisfied')) emotions.push({type: 'Satisfaction', intensity: 2});
    if (text.includes('excited')) emotions.push({type: 'Excitement', intensity: 3});
    if (text.includes('worried') || text.includes('concern')) emotions.push({type: 'Worry', intensity: 3});
    
    return emotions.length > 0 ? emotions : [{type: 'Neutral', intensity: 2}];
}

function detectProblems(text) {
    const problems = [];
    if (text.includes('checkout') || text.includes('purchase') || text.includes('payment') || text.includes('buy')) {
        problems.push({
            area: 'checkout',
            severity: text.includes('frustrat') || text.includes('abandon') ? 'High' : 'Medium',
            description: 'Checkout process complexity'
        });
    }
    if (text.includes('navigation') || text.includes('find') || text.includes('menu') || text.includes('search')) {
        problems.push({
            area: 'navigation',
            severity: text.includes('never find') || text.includes('lost') ? 'High' : 'Medium',
            description: 'Navigation and findability issues'
        });
    }
    if (text.includes('slow') || text.includes('load') || text.includes('performance') || text.includes('lag')) {
        problems.push({
            area: 'performance',
            severity: text.includes('very slow') || text.includes('crash') ? 'High' : 'Medium',
            description: 'Performance and loading issues'
        });
    }
    if (text.includes('design') || text.includes('interface') || text.includes('ui') || text.includes('ux')) {
        problems.push({
            area: 'design',
            severity: 'Medium',
            description: 'User interface and design issues'
        });
    }
    
    return problems.length > 0 ? problems : [{area: 'usability', severity: 'Medium', description: 'General usability concerns'}];
}

function detectContext(text) {
    if (text.includes('shop') || text.includes('buy') || text.includes('purchase') || text.includes('cart') || text.includes('product')) {
        return 'ecommerce';
    }
    if (text.includes('app') || text.includes('mobile')) {
        return 'mobile_app';
    }
    if (text.includes('website') || text.includes('site') || text.includes('web')) {
        return 'website';
    }
    if (text.includes('software') || text.includes('tool') || text.includes('platform')) {
        return 'software';
    }
    return 'digital_product';
}

function extractQuotes(text) {
    const quotes = [];
    const quotMatches = text.match(/'([^']+)'/g) || text.match(/"([^"]+)"/g) || [];
    quotMatches.forEach(quote => {
        const cleanQuote = quote.replace(/['"]/g, '');
        if (cleanQuote.length > 10) { // 只保留有意义的引用
            // 限制quote长度在25个词以内
            const words = cleanQuote.split(/\s+/);
            const limitedQuote = words.length > 25 ? words.slice(0, 25).join(' ') + '...' : cleanQuote;
            quotes.push(limitedQuote);
        }
    });
    
    // 如果没有找到引用，尝试提取一些可能的用户表达
    if (quotes.length === 0) {
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            if (sentence.includes('i ') && sentence.length > 20 && sentence.length < 200) {
                const words = sentence.trim().split(/\s+/);
                const limitedSentence = words.length > 25 ? words.slice(0, 25).join(' ') + '...' : sentence.trim();
                quotes.push(limitedSentence);
            }
        });
    }
    
    return quotes;
}

function generatePersonalizedResponse(keywords, originalText) {
    const mainEmotion = keywords.emotions[0];
    const mainProblem = keywords.problems[0];
    const userName = keywords.names[0] || 'Anonymous User';
    const context = keywords.context;
    const quotes = keywords.quotes;
    
    console.log('Generating response with userName:', userName);
    console.log('Available names:', keywords.names);
    
    // 生成个性化的角色名称、背景、目标等
    const personaName = generatePersonaName(mainProblem.area, mainEmotion.type, context);
    const background = generateBackground(context, mainProblem.area);
    const goals = generateGoals(context, mainProblem.area);
    const painPoints = generatePainPoints(keywords.problems, mainEmotion);
    const motivations = generateMotivations(context, mainEmotion);
    const extractedAge = extractAge(originalText);
    
    return {
        "userProblems": keywords.problems.map(p => ({
            "problem": p.description,
            "severity": p.severity,
            "context": `Issues identified in ${p.area} during user research`
        })),
        "emotionalInsights": keywords.emotions.map(e => ({
            "emotion": e.type,
            "intensity": e.intensity.toString(),
            "context": `Expressed during discussion about ${mainProblem.area}`,
            "quote": quotes[0] || `User expressed ${e.type.toLowerCase()} with the current experience`
        })),
        "keyQuotes": quotes.map((quote, index) => ({
            "quote": quote,
            "significance": index === 0 ? "Primary user concern" : "Supporting evidence",
            "category": "Pain point"
        })).concat(quotes.length === 0 ? [{
            "quote": "The current process needs improvement",
            "significance": "Inferred from user feedback",
            "category": "General feedback"
        }] : []),
        "persona": {
            "name": personaName,
            "personalInfo": {
                "name": userName,
                "age": extractedAge || generateAge(context),
                "location": "Urban area",
                "role": generateRole(context)
            },
            "quote": quotes[0] || `I need ${context === 'ecommerce' ? 'shopping' : 'using this product'} to be simpler`,
            "background": background,
            "goals": goals,
            "painPoints": painPoints,
            "highLevelMotivations": motivations,
            "originalContext": originalText
        }
    };
}

function generatePersonaName(problemArea, emotion, context) {
    const descriptors = {
        'checkout': ['Efficient Shopper', 'Goal-Oriented Buyer', 'Time-Conscious Customer'],
        'navigation': ['Information Seeker', 'Task-Focused User', 'Efficiency-Driven Navigator'],
        'performance': ['Performance-Sensitive User', 'Impatient Digital Native', 'Speed-Expecting User'],
        'design': ['Design-Conscious User', 'UX-Aware Professional', 'Interface Critic'],
        'usability': ['Frustrated User', 'Simplicity Seeker', 'User Experience Advocate']
    };
    
    const options = descriptors[problemArea] || descriptors['usability'];
    return options[Math.floor(Math.random() * options.length)];
}

function generateAge(context) {
    const ageRanges = {
        'ecommerce': '25-45',
        'mobile_app': '22-40',
        'website': '28-50',
        'software': '25-45',
        'digital_product': '25-45'
    };
    return ageRanges[context] || '25-45';
}

function generateRole(context) {
    const roles = {
        'ecommerce': 'Online shopper / Working professional',
        'mobile_app': 'Mobile-first user / Digital native',
        'website': 'Information seeker / Knowledge worker',
        'software': 'Software user / Professional',
        'digital_product': 'Product user / Professional'
    };
    return roles[context] || 'Digital product user';
}

function generateBackground(context, problemArea) {
    const backgrounds = {
        'ecommerce': 'Regular online shopper who values efficiency and seamless purchasing experiences. Uses digital platforms frequently for both personal and professional needs.',
        'mobile_app': 'Mobile-first user who relies on apps for daily tasks. Expects intuitive design and quick access to features.',
        'website': 'Web user who visits sites to accomplish specific goals efficiently. Values clear information architecture and task completion.',
        'software': 'Professional who uses software tools regularly and expects reliable, user-friendly interfaces in daily workflow.',
        'digital_product': 'User who interacts with digital products regularly and expects reliability. Seeks user-friendly interfaces in daily workflow.'
    };
    return backgrounds[context] || backgrounds['digital_product'];
}

function generateGoals(context, problemArea) {
    const goalSets = {
        'ecommerce': ['Complete purchases quickly and efficiently', 'Find products that meet specific needs', 'Have smooth checkout experience'],
        'navigation': ['Find information quickly and accurately', 'Navigate intuitively without confusion', 'Complete tasks without obstacles'],
        'performance': ['Access content instantly without delays', 'Have responsive and smooth interactions', 'Maintain productive workflow'],
        'design': ['Use well-designed and intuitive interfaces', 'Have visually pleasing and functional experience', 'Accomplish goals with minimal effort'],
        'usability': ['Use product effectively and efficiently', 'Accomplish goals easily and quickly', 'Have pleasant user experience']
    };
    return goalSets[problemArea] || goalSets['usability'];
}

function generatePainPoints(problems, emotion) {
    const painPointSets = {
        'checkout': ['Complex checkout process with too many steps', 'Confusing payment options and forms', 'Lack of progress indicators'],
        'navigation': ['Difficult navigation and confusing menu structure', 'Poor search functionality and results', 'Unclear information architecture'],
        'performance': ['Slow loading times and poor performance', 'Unresponsive interface and lag issues', 'Frequent crashes or errors'],
        'design': ['Poor visual design and layout', 'Inconsistent interface elements', 'Cluttered and overwhelming screens'],
        'usability': ['Poor user experience and interface design', 'Confusing workflows and unclear instructions', 'Lack of helpful feedback']
    };
    
    return problems.length > 0 ? 
        painPointSets[problems[0].area] || painPointSets['usability'] :
        painPointSets['usability'];
}

function generateMotivations(context, emotion) {
    const motivationSets = {
        'ecommerce': ['Save time during shopping and purchases', 'Have confidence in buying decisions', 'Avoid frustration and cart abandonment'],
        'mobile_app': ['Accomplish tasks efficiently on mobile devices', 'Have reliable and responsive mobile experience', 'Minimize effort and maximize convenience'],
        'website': ['Find information quickly and accurately', 'Complete objectives smoothly without obstacles', 'Have trustworthy and professional experience'],
        'software': ['Use tools effectively to be productive', 'Achieve professional goals efficiently', 'Have reliable software that supports workflow'],
        'digital_product': ['Use technology effectively and efficiently', 'Achieve desired outcomes and goals', 'Maintain productivity and avoid delays']
    };
    return motivationSets[context] || motivationSets['digital_product'];
}

function extractAge(text) {
    const ageRegex = /(\d{1,2})\s*years\s*old/i;
    const match = text.match(ageRegex);
    if (match && match[1]) {
        console.log(`Extracted age: ${match[1]}`);
        return match[1];
    }
    console.log('Could not extract age from text, using generic age range.');
    return null;
}

// 代理路由处理 Gemini API 请求 - 使用真实API调用
app.post('/api/gemini', async (req, res) => {
    try {
        console.log('Received analysis request');
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        // 首先尝试使用真实的Gemini API
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            console.log('Trying Gemini API...');
            
            try {
                const enhancedPrompt = `
你是一个专业的UX研究分析师。请分析以下用户访谈内容，并生成一个详细的用户画像(persona)。

访谈内容：
${prompt}

请严格按照以下JSON格式返回分析结果，不要添加任何其他文字或解释：

{
  "userProblems": [
    {
      "problem": "具体问题描述",
      "severity": "High",
      "context": "问题出现的场景"
    }
  ],
  "emotionalInsights": [
    {
      "emotion": "情绪类型",
      "intensity": "3",
      "context": "情绪产生的场景",
      "quote": "相关的用户原话"
    }
  ],
  "keyQuotes": [
    {
      "quote": "用户的重要话语",
      "significance": "这句话的重要性",
      "category": "分类"
    }
  ],
  "persona": {
    "name": "基于用户特征的描述性名字",
    "personalInfo": {
      "name": "从访谈中提取的真实姓名，如果没有则为Anonymous User",
      "age": "年龄范围",
      "location": "地理位置",
      "role": "职业或角色"
    },
    "quote": "用户的代表性语句，不超过25个词",
    "background": "用户背景描述",
    "goals": ["目标1", "目标2", "目标3"],
    "painPoints": ["痛点1", "痛点2", "痛点3"],
    "highLevelMotivations": ["动机1", "动机2", "动机3"]
  }
}

请确保返回的是有效的JSON格式，不要包含任何额外的文字。`;

                console.log('Sending request to Gemini API...');
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                                text: enhancedPrompt
                            }]
                    }]
                })
            });

                console.log('Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Gemini API request successful');
                    
                    // 提取并验证Gemini返回的JSON内容
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        const content = data.candidates[0].content.parts[0].text;
                        console.log('Raw Gemini response content:', content.substring(0, 200) + '...');
                        
                        try {
                            // 尝试提取JSON内容
                            let jsonText = content;
                            
                            // 移除可能的JSON代码块标记
                            if (content.includes('```json')) {
                                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                                if (jsonMatch) {
                                    jsonText = jsonMatch[1];
                                }
                            } else if (content.includes('{')) {
                                // 提取JSON部分
                                const startIndex = content.indexOf('{');
                                const lastBraceIndex = content.lastIndexOf('}');
                                if (lastBraceIndex > startIndex) {
                                    jsonText = content.substring(startIndex, lastBraceIndex + 1);
                                }
                            }
                            
                            // 清理和修复JSON
                            jsonText = jsonText.trim();
                            
                            // 尝试解析JSON
                            let parsedContent;
                            try {
                                parsedContent = JSON.parse(jsonText);
                            } catch (parseError) {
                                console.warn('JSON parse failed, attempting to fix:', parseError.message);
                                
                                // 尝试修复常见的JSON问题
                                let fixedJson = jsonText;
                                
                                // 确保JSON有正确的结尾
                                const openBraces = (fixedJson.match(/\{/g) || []).length;
                                const closeBraces = (fixedJson.match(/\}/g) || []).length;
                                
                                if (openBraces > closeBraces) {
                                    // 添加缺失的结尾大括号
                                    for (let i = 0; i < (openBraces - closeBraces); i++) {
                                        fixedJson += '}';
                                    }
                                }
                                
                                // 移除可能的末尾逗号
                                fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
                                
                                try {
                                    parsedContent = JSON.parse(fixedJson);
                                    console.log('JSON successfully fixed and parsed');
                                } catch (secondError) {
                                    console.error('Failed to fix JSON, using fallback analysis');
                                    throw new Error('Invalid JSON format from Gemini API');
                                }
                            }
                            
                            // 验证必要字段并返回
                            if (parsedContent && parsedContent.persona) {
                                console.log('Valid persona data received from Gemini');
                                return res.json(parsedContent);
                            } else {
                                console.warn('Incomplete data from Gemini, using fallback');
                                throw new Error('Incomplete response structure');
                            }
                            
                        } catch (contentError) {
                            console.error('Error processing Gemini content:', contentError.message);
                            throw new Error('Failed to process Gemini response');
                        }
                    } else {
                        console.error('Invalid Gemini response structure');
                        throw new Error('Invalid response structure from Gemini');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Gemini API error:', response.status, response.statusText, errorText);
                    throw new Error(`API returned ${response.status}: ${errorText}`);
                }

        } catch (apiError) {
            console.error('Gemini API request failed:', apiError.message);
                console.log('Falling back to local smart analysis...');
            }
        } else {
            console.log('No valid API key found, using local analysis...');
        }

        // 如果API调用失败或没有API密钥，使用本地智能分析作为备选
        console.log('Using local AI-powered smart analysis as fallback...');
        const result = analyzeInterview(prompt);
        
        console.log('Generated personalized analysis based on interview content');
        res.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.message 
        });
    }
});

// 提供静态文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`Also accessible at http://localhost:${PORT}`);
    
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        console.log('✅ Using Gemini API for analysis (with local fallback)');
        console.log('🔑 API Key configured successfully');
    } else {
        console.log('⚠️  Using local smart analysis only');
        console.log('💡 To use Gemini API: Set GEMINI_API_KEY in .env file');
    }
    
    console.log('Please open one of these URLs in your browser to use the tool');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Graceful shutdown...');
    server.close(() => {
        console.log('Server closed.');
    });
});