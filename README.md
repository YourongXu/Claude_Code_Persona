# Claude Code Persona - UX Interview Analysis Tool

An intelligent UX research analysis tool that automatically transforms user interview content into structured insights and comprehensive user personas. This tool leverages AI-powered analysis to help UX researchers, designers, and product managers quickly extract key information from user interviews.

## Features

- 🤖 **AI-Powered Analysis**: Utilizes Google Gemini API for intelligent text analysis with local fallback
- 📊 **Persona Generation**: Creates comprehensive user personas with demographic info, goals, and pain points
- 🎯 **Problem Identification**: Automatically extracts and categorizes user problems by severity

## Project Architecture

### Core Components

1. **Frontend (Client-Side)**
   - `index.html`: Main application interface
   - `styles.css`: Responsive styling and visual design
   - `script.js`: Client-side logic and UI interactions

2. **Backend (Server-Side)**
   - `server.js`: Express.js server with API endpoints
   - AI integration with Google Gemini API
   - Local intelligent analysis as fallback

3. **Analysis Logic**
   - Name extraction from interview content
   - Emotion detection and intensity mapping
   - Problem categorization by context and severity
   - Persona generation with contextual details

## Installation & Usage

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Google Gemini API key (optional but recommended)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourongXu/Claude_Code_Persona.git
   cd Claude_Code_Persona
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key (Optional)**
   - Create a `.env` file in the project root
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the tool**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will be ready to use

### How to Use

1. **Input Interview Content**
   - Upload a text file containing interview transcripts, or
   - Paste interview content directly into the text area

2. **Start Analysis**
   - Click "Start Analysis" to process the content
   - Wait for the AI analysis to complete

3. **Review Results**
   - Examine the generated user persona with visual representation
   - Review identified problems, emotions, and key quotes
   - Use insights for UX research and design decisions

4. **Export Results**
   - Click "Export Results" to download analysis as JSON
   - Use exported data for further research or documentation

## Technical Implementation

### AI Analysis Pipeline

1. **Text Processing**
   - Extracts names, emotions, and contextual information
   - Identifies problem areas and severity levels
   - Categorizes content by domain (e-commerce, mobile app, etc.)

2. **Persona Generation**
   - Creates realistic user personas based on interview data
   - Generates appropriate demographic information
   - Provides contextual goals, pain points, and motivations

3. **Visual Enhancement**
   - Uses AI image generation for persona portraits
   - Creates contextually appropriate visual representations
   - Enhances persona relatability and memorability

### Fallback Strategy

The tool implements a sophisticated fallback system:
- **Primary**: Google Gemini API for advanced analysis
- **Secondary**: Local intelligent analysis using pattern recognition
- **Guaranteed**: Always provides useful results regardless of API availability

## File Structure

```
├── index.html              # Main application interface
├── styles.css              # Responsive styling
├── script.js               # Client-side logic
├── server.js               # Express.js server
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── .env                    # Environment variables (not in repo)
└── README.md              # Project documentation
```

## API Endpoints

- `POST /api/gemini` - Main analysis endpoint
- `POST /api/test` - Server health check
- `GET /` - Serve main application

## Important Notes

### Security Considerations

- **API Key Protection**: Store your Gemini API key in `.env` file (excluded from version control)
- **Data Privacy**: Interview content is processed by Google Gemini API when available
- **Local Processing**: Fallback analysis runs locally without external API calls

### Performance Optimization

- **Dual Analysis**: Both AI and local analysis for reliability
- **Responsive Design**: Optimized for various screen sizes
- **Error Handling**: Comprehensive error handling and user feedback

### Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: Responsive design for mobile devices
- **JavaScript**: Requires ES6+ support

## Usage Recommendations

1. **Interview Preparation**
   - Ensure interview transcripts are complete and clear
   - Include participant names and demographic information when available

2. **Content Quality**
   - Longer, more detailed interviews produce better personas
   - Include emotional expressions and direct quotes for richer analysis

3. **Result Validation**
   - AI analysis provides insights and suggestions
   - Always validate results with actual user research context
   - Use generated personas as starting points for further refinement

## Development

### Running in Development Mode

```bash
npm run dev
```

### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key for AI analysis
- `PORT`: Server port (defaults to 3000)

## Contributing

This project is designed as a UX research tool for educational and professional use. Feel free to fork and adapt for your specific needs.

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section in this README
- Review console logs for error messages
- Ensure API key is correctly configured
- Verify network connectivity for API calls

---

*This tool represents the intersection of AI technology and UX research, helping bridge the gap between raw interview data and actionable user insights.*
