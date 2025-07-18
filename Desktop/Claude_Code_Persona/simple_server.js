const express = require('express');
const path = require('path');

const app = express();
const PORT = 9999;

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// 提供静态文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
    const nameMatches = text.match(/\b[A-Z][a-z]+\b/g) || [];
    return nameMatches.filter(name => 
        !['Interview', 'User', 'During', 'Sarah', 'John', 'The', 'This'].includes(name)
    );
}

function detectEmotions(text) {
    const emotions = [];
    if (text.includes('frustrat') || text.includes('annoyed')) emotions.push({type: 'Frustration', intensity: 4});
    if (text.includes('confused') || text.includes('confusing')) emotions.push({type: 'Confusion', intensity: 3});
    if (text.includes('stressed') || text.includes('overwhelmed')) emotions.push({type: 'Stress', intensity: 4});
    if (text.includes('disappointed')) emotions.push({type: 'Disappointment', intensity: 3});
    if (text.includes('angry')) emotions.push({type: 'Anger', intensity: 5});
    if (text.includes('happy') || text.includes('satisfied')) emotions.push({type: 'Satisfaction', intensity: 2});
    
    return emotions.length > 0 ? emotions : [{type: 'Neutral', intensity: 2}];
}

function detectProblems(text) {
    const problems = [];
    if (text.includes('checkout') || text.includes('purchase') || text.includes('buy')) {
        problems.push({
            area: 'checkout',
            severity: text.includes('frustrat') ? 'High' : 'Medium',
            description: 'Checkout process complexity'
        });
    }
    if (text.includes('navigation') || text.includes('find') || text.includes('menu')) {
        problems.push({
            area: 'navigation',
            severity: text.includes('never find') ? 'High' : 'Medium',
            description: 'Navigation and findability issues'
        });
    }
    if (text.includes('slow') || text.includes('load') || text.includes('performance')) {
        problems.push({
            area: 'performance',
            severity: 'Medium',
            description: 'Performance and loading issues'
        });
    }
    
    return problems.length > 0 ? problems : [{area: 'usability', severity: 'Medium', description: 'General usability concerns'}];
}

function detectContext(text) {
    if (text.includes('shop') || text.includes('buy') || text.includes('purchase') || text.includes('cart')) {
        return 'ecommerce';
    }
    if (text.includes('app') || text.includes('mobile')) {
        return 'mobile_app';
    }
    if (text.includes('website') || text.includes('site')) {
        return 'website';
    }
    return 'digital_product';
}

function extractQuotes(text) {
    const quotes = [];
    const quotMatches = text.match(/'([^']+)'/g) || text.match(/\"([^\"]+)\"/g) || [];
    quotMatches.forEach(quote => {
        quotes.push(quote.replace(/['\"]/g, ''));
    });
    return quotes;
}

function generatePersonalizedResponse(keywords, originalText) {
    const mainEmotion = keywords.emotions[0];
    const mainProblem = keywords.problems[0];
    const userName = keywords.names[0] || 'User';
    const context = keywords.context;
    const quotes = keywords.quotes;
    
    // 生成个性化的角色名称
    const personaName = generatePersonaName(mainProblem.area, mainEmotion.type, context);
    
    // 生成背景信息
    const background = generateBackground(context, mainProblem.area);
    
    // 生成目标、痛点、动机
    const goals = generateGoals(context, mainProblem.area);
    const painPoints = generatePainPoints(keywords.problems, mainEmotion);
    const motivations = generateMotivations(context, mainEmotion);
    
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
                                "age": generateAge(context),
                                "location": "Urban area",
                                "role": generateRole(context)
                            },
                            "quote": quotes[0] || `I need ${context === 'ecommerce' ? 'shopping' : 'using this product'} to be simpler and more efficient`,
                            "background": background,
                            "goals": goals,
                            "painPoints": painPoints,
                            "highLevelMotivations": motivations
                        }
                    })
                }]
            }
        }]
    };
}

function generatePersonaName(problemArea, emotion, context) {
    const descriptors = {
        'checkout': ['Efficient Shopper', 'Goal-Oriented Buyer', 'Time-Conscious Customer'],
        'navigation': ['Information Seeker', 'Task-Focused User', 'Efficiency-Driven Navigator'],
        'performance': ['Performance-Sensitive User', 'Impatient Digital User', 'Speed-Expecting User'],
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
        'digital_product': '25-45'
    };
    return ageRanges[context] || '25-45';
}

function generateRole(context) {
    const roles = {
        'ecommerce': 'Online shopper',
        'mobile_app': 'Mobile-first user',
        'website': 'Information seeker',
        'digital_product': 'Product user'
    };
    return roles[context] || 'Digital product user';
}

function generateBackground(context, problemArea) {
    const backgrounds = {
        'ecommerce': 'Regular online shopper who values efficiency and seamless purchasing experiences. Uses digital platforms frequently for personal and professional needs.',
        'mobile_app': 'Mobile-first user who relies on apps for daily tasks. Expects intuitive design and quick access to features.',
        'website': 'Web user who visits sites to accomplish specific goals efficiently. Values clear information architecture and task completion.',
        'digital_product': 'User who interacts with digital products regularly and expects reliability. Seeks user-friendly interfaces in daily workflow.'
    };
    return backgrounds[context] || backgrounds['digital_product'];
}

function generateGoals(context, problemArea) {
    const goalSets = {
        'ecommerce': ['Complete purchases quickly and efficiently', 'Find products that meet specific needs', 'Have smooth checkout experience'],
        'navigation': ['Find information quickly and accurately', 'Navigate intuitively without confusion', 'Complete tasks without obstacles'],
        'performance': ['Access content instantly without delays', 'Have responsive and smooth interactions', 'Maintain productive workflow'],
        'usability': ['Use product effectively and efficiently', 'Accomplish goals easily and quickly', 'Have pleasant user experience']
    };
    return goalSets[problemArea] || goalSets['usability'];
}

function generatePainPoints(problems, emotion) {
    const painPointSets = {
        'checkout': ['Complex checkout process with multiple steps', 'Confusing payment options and forms', 'Lack of progress indicators during purchase'],
        'navigation': ['Difficult navigation and confusing menu structure', 'Poor search functionality and results', 'Unclear information architecture and layout'],
        'performance': ['Slow loading times and poor performance', 'Unresponsive interface and lag issues', 'Frequent crashes or technical errors'],
        'usability': ['Poor user experience and interface design', 'Confusing workflows and unclear instructions', 'Lack of helpful feedback and guidance']
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
        'digital_product': ['Use technology effectively and efficiently', 'Achieve desired outcomes and goals', 'Maintain productivity and avoid delays']
    };
    return motivationSets[context] || motivationSets['digital_product'];
}

// API路由 - 根据输入内容生成个性化分析
app.post('/api/gemini', (req, res) => {
    try {
        console.log('Received analysis request');
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        console.log('Analyzing interview content:', prompt.substring(0, 100) + '...');
        const result = analyzeInterview(prompt);
        
        console.log('Generated personalized analysis based on input content');
        res.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.message 
        });
    }
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Simple server running on http://127.0.0.1:${PORT}`);
    console.log('No proxy configuration - direct connection only');
});