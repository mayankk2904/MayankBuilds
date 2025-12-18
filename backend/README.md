# Portfolio RAG Backend

AI-powered Q&A system for Mayank Kulkarni's portfolio with hallucination prevention.

## API Endpoints
- `POST /chat` - Ask questions about the portfolio
- `GET /test` - Test education hard-lock
- `GET /health` - Health check
- `GET /` - API documentation

## Local Development
```bash
cd backend
pip install -r requirements.txt
python app.py