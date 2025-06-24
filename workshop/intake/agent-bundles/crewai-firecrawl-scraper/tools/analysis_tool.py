"""Content analysis tool for CrewAI agents."""

import re
import json
from typing import Dict, Any, List
from collections import Counter
from crewai_tools import BaseTool
from pydantic import Field, BaseModel

class AnalysisInput(BaseModel):
    """Input schema for content analysis tool."""
    content: str = Field(..., description="Content to analyze")
    url: str = Field(..., description="Source URL of the content")
    analysis_type: str = Field(default="full", description="Type of analysis: full, sentiment, entities, themes")

class ContentAnalysisTool(BaseTool):
    """
    Content analysis tool for extracting insights from scraped content.
    
    This tool analyzes web content to extract:
    - Sentiment and tone
    - Key entities and topics
    - Content quality metrics
    - Readability scores
    - Key insights and themes
    """
    
    name: str = "content_analyzer"
    description: str = (
        "Analyze scraped content for sentiment, entities, themes, and insights. "
        "Provides comprehensive content analysis including quality metrics, "
        "key topics, and actionable insights from web content."
    )
    args_schema: type[BaseModel] = AnalysisInput
    
    def _run(self, **kwargs) -> Dict[str, Any]:
        """Execute content analysis."""
        try:
            content = kwargs.get('content', '')
            url = kwargs.get('url', '')
            analysis_type = kwargs.get('analysis_type', 'full')
            
            if not content:
                return {
                    "success": False,
                    "error": "No content provided for analysis",
                    "url": url
                }
            
            print(f"🔍 Analyzing content from: {url}")
            print(f"📊 Content length: {len(content)} characters")
            
            analysis_result = {
                "url": url,
                "content_length": len(content),
                "analysis_type": analysis_type,
                "timestamp": "2025-01-26T14:30:00Z"  # Would use datetime.now() in real implementation
            }
            
            # Perform different types of analysis based on request
            if analysis_type in ["full", "sentiment"]:
                analysis_result["sentiment"] = self._analyze_sentiment(content)
            
            if analysis_type in ["full", "entities"]:
                analysis_result["entities"] = self._extract_entities(content)
            
            if analysis_type in ["full", "themes"]:
                analysis_result["themes"] = self._identify_themes(content)
            
            if analysis_type in ["full", "quality"]:
                analysis_result["quality_metrics"] = self._assess_quality(content)
            
            if analysis_type == "full":
                analysis_result["insights"] = self._generate_insights(content, url)
                analysis_result["summary"] = self._create_summary(content)
            
            print(f"✅ Analysis completed for {url}")
            print(f"🎯 Found {len(analysis_result.get('themes', []))} main themes")
            print(f"🏷️ Identified {len(analysis_result.get('entities', []))} entities")
            
            return {
                "success": True,
                "analysis": analysis_result,
                "url": url
            }
            
        except Exception as e:
            error_msg = f"Content analysis failed: {str(e)}"
            print(f"❌ {error_msg}")
            
            return {
                "success": False,
                "error": error_msg,
                "url": kwargs.get('url', ''),
                "analysis": None
            }
    
    def _analyze_sentiment(self, content: str) -> Dict[str, Any]:
        """Analyze sentiment of the content."""
        # Simple sentiment analysis based on keyword matching
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'perfect', 'outstanding']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointing', 'poor', 'fail']
        
        content_lower = content.lower()
        
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        total_sentiment_words = positive_count + negative_count
        
        if total_sentiment_words == 0:
            sentiment = "neutral"
            confidence = 0.5
        elif positive_count > negative_count:
            sentiment = "positive"
            confidence = min(0.9, 0.5 + (positive_count - negative_count) / total_sentiment_words * 0.4)
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = min(0.9, 0.5 + (negative_count - positive_count) / total_sentiment_words * 0.4)
        else:
            sentiment = "neutral"
            confidence = 0.6
        
        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 2),
            "positive_indicators": positive_count,
            "negative_indicators": negative_count,
            "analysis_method": "keyword_based"
        }
    
    def _extract_entities(self, content: str) -> List[Dict[str, Any]]:
        """Extract key entities from content."""
        entities = []
        
        # Extract potential company names (capitalized words)
        company_pattern = r'\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b'
        companies = re.findall(company_pattern, content)
        company_counts = Counter(companies)
        
        # Filter out common words that aren't likely companies
        common_words = {'The', 'This', 'That', 'And', 'But', 'Or', 'For', 'In', 'On', 'At', 'To', 'From', 'By', 'With'}
        
        for company, count in company_counts.most_common(10):
            if company not in common_words and len(company) > 2:
                entities.append({
                    "text": company,
                    "type": "organization",
                    "frequency": count,
                    "relevance": min(1.0, count / len(content.split()) * 100)
                })
        
        # Extract URLs
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, content)
        for url in set(urls[:5]):  # Limit to 5 unique URLs
            entities.append({
                "text": url,
                "type": "url",
                "frequency": 1,
                "relevance": 0.7
            })
        
        # Extract email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, content)
        for email in set(emails):
            entities.append({
                "text": email,
                "type": "email",
                "frequency": 1,
                "relevance": 0.8
            })
        
        return entities
    
    def _identify_themes(self, content: str) -> List[Dict[str, Any]]:
        """Identify main themes and topics."""
        # Technology themes
        tech_keywords = {
            "AI/ML": ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network'],
            "Web Development": ['javascript', 'react', 'html', 'css', 'frontend', 'backend', 'api'],
            "Data Science": ['data', 'analytics', 'visualization', 'statistics', 'python', 'sql'],
            "Cloud Computing": ['cloud', 'aws', 'azure', 'docker', 'kubernetes', 'microservices'],
            "Cybersecurity": ['security', 'encryption', 'authentication', 'vulnerability', 'cyber'],
            "Business": ['startup', 'funding', 'revenue', 'growth', 'market', 'customer'],
            "Finance": ['investment', 'trading', 'crypto', 'blockchain', 'financial', 'money']
        }
        
        content_lower = content.lower()
        themes = []
        
        for theme_name, keywords in tech_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in content_lower)
            if matches > 0:
                relevance = min(1.0, matches / len(keywords))
                themes.append({
                    "theme": theme_name,
                    "relevance": round(relevance, 2),
                    "keyword_matches": matches,
                    "keywords_found": [kw for kw in keywords if kw in content_lower]
                })
        
        # Sort by relevance
        themes.sort(key=lambda x: x['relevance'], reverse=True)
        
        return themes[:5]  # Return top 5 themes
    
    def _assess_quality(self, content: str) -> Dict[str, Any]:
        """Assess content quality metrics."""
        words = content.split()
        sentences = content.split('.')
        
        # Basic metrics
        word_count = len(words)
        sentence_count = len([s for s in sentences if s.strip()])
        avg_words_per_sentence = word_count / max(1, sentence_count)
        
        # Readability score (simplified Flesch Reading Ease)
        avg_sentence_length = avg_words_per_sentence
        syllable_count = sum(self._count_syllables(word) for word in words)
        avg_syllables_per_word = syllable_count / max(1, word_count)
        
        readability_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        readability_score = max(0, min(100, readability_score))  # Clamp between 0-100
        
        # Quality assessment
        quality_score = 50  # Base score
        
        # Bonus for good length
        if 300 <= word_count <= 2000:
            quality_score += 20
        elif word_count > 100:
            quality_score += 10
        
        # Bonus for reasonable sentence length
        if 10 <= avg_words_per_sentence <= 25:
            quality_score += 15
        
        # Bonus for good readability
        if readability_score >= 60:
            quality_score += 15
        
        quality_score = min(100, quality_score)
        
        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_words_per_sentence": round(avg_words_per_sentence, 1),
            "readability_score": round(readability_score, 1),
            "quality_score": quality_score,
            "quality_level": self._get_quality_level(quality_score)
        }
    
    def _count_syllables(self, word: str) -> int:
        """Simple syllable counting."""
        word = word.lower()
        vowels = "aeiouy"
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            if char in vowels:
                if not prev_was_vowel:
                    syllable_count += 1
                prev_was_vowel = True
            else:
                prev_was_vowel = False
        
        if word.endswith('e'):
            syllable_count -= 1
        
        return max(1, syllable_count)
    
    def _get_quality_level(self, score: int) -> str:
        """Convert quality score to level."""
        if score >= 90:
            return "excellent"
        elif score >= 75:
            return "good"
        elif score >= 60:
            return "fair"
        else:
            return "poor"
    
    def _generate_insights(self, content: str, url: str) -> List[str]:
        """Generate actionable insights from content."""
        insights = []
        
        word_count = len(content.split())
        
        # Content length insights
        if word_count < 100:
            insights.append("Content is quite short - consider expanding for better SEO and user engagement")
        elif word_count > 2000:
            insights.append("Content is very long - consider breaking into sections or multiple pages")
        
        # URL insights
        if 'blog' in url.lower():
            insights.append("This appears to be blog content - focus on engagement and shareability")
        elif 'news' in url.lower():
            insights.append("News content detected - timeliness and accuracy are crucial")
        elif 'docs' in url.lower() or 'documentation' in url.lower():
            insights.append("Documentation content - ensure clarity and completeness")
        
        # Content structure insights
        if content.count('\n') < word_count / 100:
            insights.append("Content may benefit from better paragraph structure and spacing")
        
        # Technical content insights
        if any(tech_word in content.lower() for tech_word in ['api', 'code', 'programming', 'development']):
            insights.append("Technical content detected - ensure code examples are properly formatted")
        
        return insights[:5]  # Limit to 5 insights
    
    def _create_summary(self, content: str) -> str:
        """Create a brief summary of the content."""
        # Simple extractive summary - take first and key sentences
        sentences = [s.strip() for s in content.split('.') if s.strip()]
        
        if not sentences:
            return "No meaningful content to summarize"
        
        # Take first sentence and a few more based on content length
        summary_sentences = [sentences[0]]
        
        if len(sentences) > 3:
            # Add middle sentence
            summary_sentences.append(sentences[len(sentences)//2])
        
        if len(sentences) > 5:
            # Add a sentence from the end
            summary_sentences.append(sentences[-2] if len(sentences) > 1 else sentences[-1])
        
        summary = '. '.join(summary_sentences[:3])
        
        # Ensure summary isn't too long
        if len(summary) > 300:
            summary = summary[:300] + "..."
        
        return summary

# Create tool instance
content_analysis_tool = ContentAnalysisTool()