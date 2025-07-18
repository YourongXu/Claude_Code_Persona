class UXInterviewAnalyzer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.geminiApiKey = '';
    }

    initializeElements() {
        this.geminiKeyInput = document.getElementById('gemini-key');
        this.fileUpload = document.getElementById('file-upload');
        this.uploadBtn = document.getElementById('upload-btn');
        this.fileName = document.getElementById('file-name');
        this.interviewText = document.getElementById('interview-text');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.resultsSection = document.getElementById('results-section');
        this.loading = document.getElementById('loading');
        this.userProblems = document.getElementById('user-problems');
        this.emotionalInsights = document.getElementById('emotional-insights');
        this.keyQuotes = document.getElementById('key-quotes');
        this.persona = document.getElementById('persona');
        this.exportBtn = document.getElementById('export-btn');
        this.newAnalysisBtn = document.getElementById('new-analysis-btn');
    }

    setupEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.fileUpload.click());
        this.fileUpload.addEventListener('change', this.handleFileUpload.bind(this));
        // API Key 已配置在服务器端，无需前端输入
        this.interviewText.addEventListener('input', this.validateInputs.bind(this));
        this.analyzeBtn.addEventListener('click', this.analyzeInterview.bind(this));
        this.exportBtn.addEventListener('click', this.exportResults.bind(this));
        this.newAnalysisBtn.addEventListener('click', this.resetAnalysis.bind(this));
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.interviewText.value = e.target.result;
                this.validateInputs();
            };
            reader.readAsText(file);
        }
    }

    validateInputs() {
        const hasText = this.interviewText.value.trim() !== '';
        this.analyzeBtn.disabled = !hasText;
    }

    async analyzeInterview() {
        const text = this.interviewText.value.trim();

        if (!text) {
            alert('Please enter interview content');
            return;
        }

        this.showLoading();

        try {
            const insights = await this.callGeminiAPI(text);
            this.displayResults(insights);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed, please check your network connection');
        } finally {
            this.hideLoading();
        }
    }

    async callGeminiAPI(text) {
        console.log('Sending request to API...');
        
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: text
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `API request failed: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.error || 'Unknown error'}`;
                } catch (e) {
                    errorMessage += ` - ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Raw API response:', data);
            
            // 检查响应结构，兼容两种格式
            if (data.persona) {
                // 这是简化的本地分析响应
                console.log('Parsed data from local analysis:', data);
                return data;
            } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                // 这是完整的Gemini API响应
                const content = data.candidates[0].content.parts[0].text;
                console.log('AI Response content:', content);
                
                // 提取JSON内容
                let parsedData;
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        let jsonText = jsonMatch[1] || jsonMatch[0];
                        parsedData = JSON.parse(jsonText);
                    } catch (e) {
                        console.error('JSON parse error:', e);
                        throw new Error('Unable to parse JSON from AI response');
                    }
                } else {
                    throw new Error('No valid JSON found in AI response');
                }
                
                console.log('Parsed data from Gemini API:', parsedData);
                return parsedData;
                
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('Invalid response from AI service');
            }
            
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    displayResults(insights) {
        this.displayPersona(insights.persona);
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayUserProblems(problems) {
        const html = problems.map(problem => `
            <div class="problem-item">
                <h4>${problem.problem}</h4>
                <p><strong>Severity:</strong><span class="severity-${problem.severity.toLowerCase()}">${problem.severity}</span></p>
                <p><strong>Context:</strong>${problem.context}</p>
            </div>
        `).join('');
        this.userProblems.innerHTML = html;
    }

    displayEmotionalInsights(emotions) {
        const html = emotions.map(emotion => `
            <div class="emotion-item">
                <div class="emotion-header">
                    <span class="emotion-tag">${emotion.emotion}</span>
                    <span class="intensity">Intensity: ${emotion.intensity}/5</span>
                </div>
                <p><strong>Context:</strong>${emotion.context}</p>
                <div class="quote">"${emotion.quote}"</div>
            </div>
        `).join('');
        this.emotionalInsights.innerHTML = html;
    }

    displayKeyQuotes(quotes) {
        const html = quotes.map(quote => `
            <div class="quote-item">
                <div class="quote">"${quote.quote}"</div>
                <p><strong>Significance:</strong>${quote.significance}</p>
                <p><strong>Category:</strong><span class="category-tag">${quote.category}</span></p>
            </div>
        `).join('');
        this.keyQuotes.innerHTML = html;
    }

    displayPersona(persona) {
        // 生成基于人物特征的头像
        const portraitPrompt = this.generatePortraitPrompt(persona);
        const portraitUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(portraitPrompt)}?width=768&height=1024&nologo=true&enhance=true`;
        
        // 获取个人信息
        const personalInfo = persona.personalInfo || persona.demographics || {};
        const name = personalInfo.name || persona.name;
        const age = personalInfo.age || '25-45';
        const location = personalInfo.location || 'Urban area';
        const role = personalInfo.role || personalInfo.occupation || 'Professional';
        
        // 确保persona容器有专门的类名并清除旧样式
        this.persona.parentElement.classList.add('persona-card');
        this.persona.parentElement.style.cssText = 'grid-column: 1 / -1; background: #ffffff !important; border: 1px solid #e5e7eb !important; border-radius: 16px !important; padding: 0 !important; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;';
        
        const html = `
            <div class="persona-container" style="display: flex !important; min-height: 580px !important; width: 100% !important;">
                <div class="persona-left" style="width: 40% !important; background: #f4f9ff !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 12px !important;">
                    <img src="${portraitUrl}" alt="${name}" class="persona-portrait" 
                         style="width: 98% !important; height: 98% !important; max-height: 550px !important; border-radius: 16px !important; object-fit: cover !important; box-shadow: 0 8px 24px rgba(45, 127, 249, 0.15) !important; border: 2px solid #ffffff !important;"
                         onerror="console.log('Portrait failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         onload="console.log('Portrait loaded successfully:', this.src);">
                    <div class="persona-avatar" style="display: none !important; width: 95% !important; height: 95% !important; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border-radius: 16px !important; align-items: center !important; justify-content: center !important; font-size: 5rem !important; color: white !important;">👤</div>
                </div>
                <div class="persona-right" style="width: 60% !important; padding: 32px !important; display: flex !important; flex-direction: column !important;">
                    <div class="persona-header-new" style="margin-bottom: 20px !important; text-align: left !important;">
                        <h3 class="persona-name" style="font-size: 2rem !important; font-weight: 700 !important; color: #2D7FF9 !important; margin-bottom: 8px !important; line-height: 1.2 !important;">${name}</h3>
                        <div class="persona-info" style="font-size: 1rem !important; color: #6b7280 !important; font-weight: 500 !important; margin-bottom: 16px !important;">${age} • ${role} • ${location}</div>
                    </div>
                    
                    <div class="persona-quote-new" style="font-style: italic !important; color: #4b5563 !important; font-size: 1.125rem !important; line-height: 1.6 !important; margin-bottom: 20px !important; padding-left: 16px !important; border-left: 3px solid #2D7FF9 !important;">"${persona.quote}"</div>
                    
                    <div class="persona-background" style="margin-bottom: 20px !important;">
                        <h4 style="color: #2D7FF9 !important; font-weight: 600 !important; font-size: 0.875rem !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 8px !important;">Background</h4>
                        <p style="color: #374151 !important; line-height: 1.6 !important; font-size: 0.9375rem !important;">${persona.background || 'Professional user who values efficiency and user-friendly interfaces in their daily workflow'}</p>
                    </div>
                    
                    <div class="persona-info-boxes" style="display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; margin-top: auto !important;">
                        <div class="persona-info-box" style="background: #f4f9ff !important; padding: 16px 14px !important; border-radius: 12px !important; border: 1px solid #e1ecf7 !important;">
                            <h4 style="color: #2D7FF9 !important; font-weight: 600 !important; font-size: 0.875rem !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 10px !important;">Goals</h4>
                            <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">
                                ${(persona.goals || ['Complete tasks efficiently and effectively', 'Have smooth and intuitive user experience', 'Achieve desired outcomes quickly']).slice(0, 3).map(goal => `<li style="color: #374151 !important; font-size: 0.875rem !important; line-height: 1.4 !important; margin-bottom: 6px !important; position: relative !important; padding-left: 12px !important;"><span style="color: #2D7FF9 !important; font-weight: bold !important; position: absolute !important; left: 0 !important;">•</span>${goal}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="persona-info-box" style="background: #f4f9ff !important; padding: 16px 14px !important; border-radius: 12px !important; border: 1px solid #e1ecf7 !important;">
                            <h4 style="color: #2D7FF9 !important; font-weight: 600 !important; font-size: 0.875rem !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 10px !important;">Pain Points</h4>
                            <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">
                                ${(persona.painPoints || ['Complex interfaces and confusing navigation', 'Slow performance and loading times', 'Poor user experience design']).slice(0, 3).map(pain => `<li style="color: #374151 !important; font-size: 0.875rem !important; line-height: 1.4 !important; margin-bottom: 6px !important; position: relative !important; padding-left: 12px !important;"><span style="color: #2D7FF9 !important; font-weight: bold !important; position: absolute !important; left: 0 !important;">•</span>${pain}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="persona-info-box" style="background: #f4f9ff !important; padding: 16px 14px !important; border-radius: 12px !important; border: 1px solid #e1ecf7 !important;">
                            <h4 style="color: #2D7FF9 !important; font-weight: 600 !important; font-size: 0.875rem !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 10px !important;">Motivations</h4>
                            <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">
                                ${(persona.highLevelMotivations || persona.motivations || ['Achieve goals efficiently and save time', 'Maintain productivity and avoid frustration', 'Have reliable and smooth experience']).slice(0, 3).map(motivation => `<li style="color: #374151 !important; font-size: 0.875rem !important; line-height: 1.4 !important; margin-bottom: 6px !important; position: relative !important; padding-left: 12px !important;"><span style="color: #2D7FF9 !important; font-weight: bold !important; position: absolute !important; left: 0 !important;">•</span>${motivation}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.persona.innerHTML = html;
    }

    generatePortraitPrompt(persona) {
        const personalInfo = persona.personalInfo || persona.demographics || {};
        const name = personalInfo.name || persona.name;
        const age = personalInfo.age || '30-35';
        const role = personalInfo.role || personalInfo.occupation || 'professional';
        
        const fullText = [
            persona.quote, 
            persona.background, 
            persona.originalContext, 
            JSON.stringify(persona.goals), 
            JSON.stringify(persona.painPoints)
        ].join(' ').toLowerCase();

        console.log('Analyzing text for portrait context:', fullText.substring(0, 300));
        
        const malePronouns = (fullText.match(/\b(he|his|male|man|mr\.)\b/g) || []).length;
        const femalePronouns = (fullText.match(/\b(she|her|female|woman|ms\.|mrs\.)\b/g) || []).length;

        let gender = 'person';
        if (malePronouns > femalePronouns) {
            gender = 'man';
        } else if (femalePronouns > malePronouns) {
            gender = 'woman';
        }
        
        console.log(`Determined gender: ${gender} (male: ${malePronouns}, female: ${femalePronouns})`);

        let ageDesc = '30-year-old';
        if (age.includes('20')) ageDesc = '25-year-old';
        else if (age.includes('30')) ageDesc = '35-year-old';
        else if (age.includes('40')) ageDesc = '45-year-old';
        else if (age.includes('50')) ageDesc = '55-year-old';

        let sceneDesc = 'in a modern office';
        let activityDesc = 'looking confident';
        
        if (fullText.includes('plant') || fullText.includes('nature') || fullText.includes('garden') || fullText.includes('outdoor')) {
            sceneDesc = 'in a lush botanical garden';
            activityDesc = 'examining a plant with curiosity';
        } else if (fullText.includes('shop') || fullText.includes('buy') || fullText.includes('ecommerce')) {
            sceneDesc = 'in a bright, modern retail store';
            activityDesc = 'looking at a product thoughtfully';
        }

        const portraitPrompt = `cinematic photo, medium shot of a ${ageDesc} ${gender} ${role}, ${activityDesc}, ${sceneDesc}, detailed face, professional photography, soft natural lighting`;
        
        console.log('Generated Portrait Prompt:', portraitPrompt);
        return portraitPrompt;
    }

    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            userProblems: this.userProblems.innerHTML,
            emotionalInsights: this.emotionalInsights.innerHTML,
            keyQuotes: this.keyQuotes.innerHTML,
            persona: this.persona.innerHTML
        };

        const dataStr = JSON.stringify(results, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `ux-interview-analysis-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    resetAnalysis() {
        this.interviewText.value = '';
        this.fileName.textContent = '';
        this.fileUpload.value = '';
        this.resultsSection.style.display = 'none';
        this.validateInputs();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showLoading() {
        this.loading.style.display = 'flex';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new UXInterviewAnalyzer();
});