# My Personal Assistant

A React TypeScript application built with Vite.

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Running the Application

1. **Install dependencies** (only needed once):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and go to:
   - http://localhost:5173

The application will automatically reload when you make changes to the code.

### Other Commands

- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## Environment Variables

Create a `.env` file in the root directory to store your API keys and other configuration:

```bash
# Required for AI features
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional app configuration
VITE_APP_NAME=My Personal Assistant
VITE_ENABLE_DEBUG=true

# Other API configuration (optional)
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_other_api_key_here
```

**Note**: Only variables prefixed with `VITE_` will be available in your React application.

### Getting an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

**Cost Control**: The app uses `gpt-4o-mini` model to keep costs low (~$2-5/month for personal use).

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `dist/` - Build output (generated)
- `.env` - Environment variables (create this file)
- `.prettierrc.json` - Code formatting rules
- `.gitlab-ci.yml` - GitLab CI/CD configuration
