# CrewAI Firecrawl Scraper

A multi-agent scraping system using CrewAI with CEO and Crawler agents, powered by Firecrawl API.

## Architecture

```
CEO Agent (Strategic)
    ↓ Delegates tasks
Crawler Agent (Execution)
    ↓ Uses Firecrawl API
Structured Data Output
```

## Agents

### CEO Agent
- **Role**: Chief Executive Officer
- **Goal**: Oversee scraping operations and strategic data collection
- **Responsibilities**: Task delegation, result review, quality control

### Crawler Agent  
- **Role**: Web Scraping Specialist
- **Goal**: Execute scraping tasks using Firecrawl API
- **Responsibilities**: Data extraction, content processing, structured output

## Setup

1. Install dependencies:
```bash
pip install crewai firecrawl-py python-dotenv pydantic
```

2. Set environment variables:
```bash
export FIRECRAWL_API_KEY="your_firecrawl_api_key"
export OPENAI_API_KEY="your_openai_api_key"
```

3. Run the scraper:
```bash
python main.py
```

## Usage

The system accepts URLs and scraping parameters, then:
1. CEO agent analyzes the request and creates scraping tasks
2. Crawler agent executes tasks using Firecrawl
3. Results are structured and validated
4. CEO agent reviews and finalizes output

## Output

Structured JSON data with:
- URL metadata
- Extracted content
- Scraping statistics
- Quality metrics