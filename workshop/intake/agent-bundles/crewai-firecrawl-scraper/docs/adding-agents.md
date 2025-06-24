# Adding New Agents to CrewAI Firecrawl Scraper

## 🎯 Agent Expansion Strategy

The current system has **CEO + Crawler** agents. Here's how to add new specialist agents:

```ascii
Current:          Expanded:
CEO               CEO (Strategic Oversight)
 ├─ Crawler        ├─ Crawler (Web Scraping)
                   ├─ Analyzer (Content Analysis)  
                   ├─ Writer (Content Processing)
                   ├─ Validator (Quality Control)
                   └─ Reporter (Data Visualization)
```

## 🛠️ Step-by-Step Guide

### 1. Define New Agent Configuration

Add to `agents.py`:

```python
# New agent configs
ANALYZER_CONFIG = AgentConfig(
    role="Content Analyzer",
    goal="Analyze scraped content for insights, sentiment, and key information extraction",
    backstory=(
        "You are an expert content analyst with skills in NLP, sentiment analysis, "
        "and information extraction. You can identify key themes, entities, and "
        "insights from scraped web content."
    ),
    verbose=True,
    allow_delegation=False,
    max_iter=20
)

WRITER_CONFIG = AgentConfig(
    role="Content Writer", 
    goal="Transform raw scraped data into structured summaries and reports",
    backstory=(
        "You are a skilled technical writer who excels at transforming raw data "
        "into clear, structured content. You can create summaries, extract key "
        "points, and format information for different audiences."
    ),
    verbose=True,
    allow_delegation=False,
    max_iter=15
)
```

### 2. Create Agent Factory Functions

```python
def create_analyzer_agent() -> Agent:
    """Create content analysis agent."""
    return Agent(
        role=ANALYZER_CONFIG.role,
        goal=ANALYZER_CONFIG.goal,
        backstory=ANALYZER_CONFIG.backstory,
        verbose=ANALYZER_CONFIG.verbose,
        allow_delegation=ANALYZER_CONFIG.allow_delegation,
        max_iter=ANALYZER_CONFIG.max_iter,
        tools=[content_analysis_tool],  # Custom tools
        llm=None
    )

def create_writer_agent() -> Agent:
    """Create content writing agent."""
    return Agent(
        role=WRITER_CONFIG.role,
        goal=WRITER_CONFIG.goal,
        backstory=WRITER_CONFIG.backstory,
        verbose=WRITER_CONFIG.verbose,
        allow_delegation=WRITER_CONFIG.allow_delegation,
        max_iter=WRITER_CONFIG.max_iter,
        tools=[writing_tool, formatting_tool],
        llm=None
    )
```

### 3. Create Agent-Specific Tools

New file: `tools/analysis_tool.py`:

```python
class ContentAnalysisTool(BaseTool):
    name: str = "content_analyzer"
    description: str = "Analyze content for sentiment, entities, and key insights"
    
    def _run(self, content: str, analysis_type: str = "full") -> Dict[str, Any]:
        """Analyze scraped content."""
        try:
            # Sentiment analysis
            sentiment = self.analyze_sentiment(content)
            
            # Entity extraction
            entities = self.extract_entities(content)
            
            # Key themes
            themes = self.identify_themes(content)
            
            return {
                "sentiment": sentiment,
                "entities": entities,
                "themes": themes,
                "word_count": len(content.split()),
                "analysis_type": analysis_type
            }
        except Exception as e:
            return {"error": str(e)}
```

### 4. Define New Task Types

Add to `tasks.py`:

```python
def create_analysis_task(agent, scraped_content: str, url: str) -> Task:
    """Create content analysis task."""
    return Task(
        description=f"""
        Analyze the following scraped content from {url}:
        
        Content: {scraped_content[:500]}...
        
        Your analysis should include:
        1. Sentiment analysis (positive, negative, neutral)
        2. Key entity extraction (people, organizations, locations)
        3. Main themes and topics identification
        4. Content quality assessment
        5. Actionable insights
        
        Use the content_analyzer tool to perform deep analysis.
        """,
        agent=agent,
        expected_output="Comprehensive content analysis with sentiment, entities, themes, and insights"
    )

def create_writing_task(agent, analysis_data: dict) -> Task:
    """Create content writing task."""
    return Task(
        description=f"""
        Create a structured summary based on the analysis data:
        
        Analysis Data: {analysis_data}
        
        Your tasks:
        1. Write an executive summary (2-3 paragraphs)
        2. Create bullet points of key findings
        3. Identify actionable recommendations
        4. Format the output in markdown
        5. Include relevant statistics and insights
        
        Make the content clear, professional, and actionable.
        """,
        agent=agent,
        expected_output="Professional markdown-formatted summary with key findings and recommendations"
    )
```

### 5. Update the Main Crew Class

Modify `crew.py`:

```python
class EnhancedFirecrawlScrapingCrew:
    """Enhanced crew with multiple specialist agents."""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        
        # Initialize all agents
        self.ceo_agent = create_ceo_agent()
        self.crawler_agent = create_crawler_agent()
        self.analyzer_agent = create_analyzer_agent()  # NEW
        self.writer_agent = create_writer_agent()      # NEW
        
        self.scrape_results = []
        
    def enhanced_scrape_workflow(self, scrape_requests: List[ScrapeRequest]) -> EnhancedScrapingReport:
        """Enhanced workflow with analysis and writing phases."""
        
        print("🚀 Starting Enhanced Multi-Agent Workflow")
        print("=" * 60)
        
        # Phase 1: CEO Planning (same as before)
        planning_result = self._execute_planning_phase(scrape_requests)
        
        # Phase 2: Crawler Execution (same as before)  
        scraping_results = self._execute_scraping_phase(scrape_requests)
        
        # Phase 3: Content Analysis (NEW)
        analysis_results = self._execute_analysis_phase(scraping_results)
        
        # Phase 4: Content Writing (NEW)
        writing_results = self._execute_writing_phase(analysis_results)
        
        # Phase 5: CEO Final Review (enhanced)
        final_report = self._execute_review_phase(scraping_results, analysis_results, writing_results)
        
        return final_report
    
    def _execute_analysis_phase(self, scraping_results):
        """Execute content analysis phase."""
        print("\n🔍 Phase 3: Content Analysis (Analyzer Agent)")
        print("-" * 40)
        
        analysis_results = []
        
        for result in scraping_results:
            if result.success and result.content:
                print(f"🔬 Analyzing content from {result.request.url}")
                
                analysis_task = create_analysis_task(
                    self.analyzer_agent, 
                    result.content.content,
                    str(result.request.url)
                )
                
                analysis_crew = Crew(
                    agents=[self.analyzer_agent],
                    tasks=[analysis_task],
                    process=Process.sequential,
                    verbose=self.verbose
                )
                
                analysis_output = analysis_crew.kickoff()
                analysis_results.append({
                    "url": result.request.url,
                    "analysis": str(analysis_output)
                })
        
        return analysis_results
    
    def _execute_writing_phase(self, analysis_results):
        """Execute content writing phase."""
        print("\n✍️ Phase 4: Content Writing (Writer Agent)")
        print("-" * 40)
        
        writing_results = []
        
        for analysis in analysis_results:
            print(f"📝 Creating summary for {analysis['url']}")
            
            writing_task = create_writing_task(
                self.writer_agent,
                analysis
            )
            
            writing_crew = Crew(
                agents=[self.writer_agent],
                tasks=[writing_task], 
                process=Process.sequential,
                verbose=self.verbose
            )
            
            writing_output = writing_crew.kickoff()
            writing_results.append({
                "url": analysis["url"],
                "summary": str(writing_output)
            })
        
        return writing_results
```

## 🚀 Example: Adding a Validator Agent

### Step 1: Define the Agent

```python
VALIDATOR_CONFIG = AgentConfig(
    role="Quality Validator",
    goal="Validate scraped data quality and identify issues or gaps",
    backstory=(
        "You are a meticulous quality assurance specialist who ensures "
        "data integrity and completeness. You can identify missing information, "
        "validation errors, and data quality issues."
    ),
    verbose=True,
    allow_delegation=False,
    max_iter=10
)

def create_validator_agent() -> Agent:
    return Agent(
        role=VALIDATOR_CONFIG.role,
        goal=VALIDATOR_CONFIG.goal,
        backstory=VALIDATOR_CONFIG.backstory,
        tools=[validation_tool],
        verbose=True
    )
```

### Step 2: Create Validation Tool

```python
class ValidationTool(BaseTool):
    name: str = "data_validator"
    description: str = "Validate scraped data for quality and completeness"
    
    def _run(self, content: dict, requirements: dict) -> Dict[str, Any]:
        """Validate content against requirements."""
        issues = []
        score = 100
        
        # Check content length
        if len(content.get('content', '')) < requirements.get('min_length', 100):
            issues.append("Content too short")
            score -= 20
            
        # Check for title
        if not content.get('title'):
            issues.append("Missing title")
            score -= 15
            
        # Check for links if required
        if requirements.get('needs_links') and not content.get('links'):
            issues.append("No links found")
            score -= 10
            
        return {
            "quality_score": max(0, score),
            "issues": issues,
            "validation_passed": score >= 70,
            "recommendations": self._generate_recommendations(issues)
        }
```

### Step 3: Add to Workflow

```python
# Add validation phase after scraping
validation_results = self._execute_validation_phase(scraping_results)
```

## 🔧 Agent Communication Patterns

### 1. Sequential Processing
```python
# Agents work one after another
scraping → analysis → writing → validation → reporting
```

### 2. Parallel Processing  
```python
# Multiple agents work simultaneously
async def parallel_analysis():
    tasks = [
        analyzer_agent.process(content1),
        analyzer_agent.process(content2),
        analyzer_agent.process(content3)
    ]
    results = await asyncio.gather(*tasks)
```

### 3. Hierarchical Delegation
```python
# CEO delegates to specialists based on task type
if task_type == "analysis":
    delegate_to(analyzer_agent)
elif task_type == "writing":
    delegate_to(writer_agent)
elif task_type == "validation":
    delegate_to(validator_agent)
```

## 📊 Configuration Management

Update `config.yaml`:

```yaml
agents:
  ceo:
    # existing config...
    
  crawler:
    # existing config...
    
  analyzer:
    role: "Content Analyzer"
    goal: "Analyze scraped content for insights and patterns"
    max_iter: 20
    tools: ["content_analyzer"]
    
  writer:
    role: "Content Writer"  
    goal: "Create structured summaries and reports"
    max_iter: 15
    tools: ["writing_tool", "formatting_tool"]
    
  validator:
    role: "Quality Validator"
    goal: "Ensure data quality and completeness"
    max_iter: 10
    tools: ["validation_tool"]

workflows:
  enhanced:
    phases:
      - planning: [ceo]
      - scraping: [crawler]
      - analysis: [analyzer] 
      - writing: [writer]
      - validation: [validator]
      - reporting: [ceo]
```

## 🎯 Best Practices for New Agents

1. **Single Responsibility**: Each agent should have one clear purpose
2. **Specific Tools**: Equip agents only with tools they need
3. **Clear Backstory**: Define expertise and personality
4. **Error Handling**: Handle failures gracefully
5. **Output Standards**: Define expected output formats
6. **Testing**: Create tests for each new agent

## 🚀 Quick Start Template

```python
# 1. Define config
NEW_AGENT_CONFIG = AgentConfig(
    role="Your Agent Role",
    goal="What the agent should accomplish", 
    backstory="Agent's expertise and personality",
    tools=["list", "of", "tools"]
)

# 2. Create factory function
def create_new_agent() -> Agent:
    return Agent(**NEW_AGENT_CONFIG.dict())

# 3. Add to crew
self.new_agent = create_new_agent()

# 4. Create tasks
def create_new_task(agent, input_data):
    return Task(...)

# 5. Add to workflow
new_results = self._execute_new_phase(previous_results)
```

This modular approach lets you easily add **specialized agents** for any domain - SEO analysis, competitor research, data visualization, etc! 🚀