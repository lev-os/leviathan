"""Test script for the CrewAI Firecrawl scraper."""

import os
import sys
import asyncio
from dotenv import load_dotenv

from models import ScrapeRequest
from crew import FirecrawlScrapingCrew

def test_basic_scraping():
    """Test basic scraping functionality."""
    
    print("🧪 Testing Basic Scraping Functionality")
    print("=" * 50)
    
    # Simple test requests
    test_requests = [
        ScrapeRequest(
            url="https://httpbin.org/html",
            priority=5,
            extract_links=False,
            include_markdown=True,
            include_html=False
        ),
        ScrapeRequest(
            url="https://example.com",
            priority=3,
            extract_links=True,
            include_markdown=True,
            include_html=False
        )
    ]
    
    try:
        # Initialize crew
        crew = FirecrawlScrapingCrew(verbose=True)
        
        # Execute test scraping
        report = crew.scrape_urls(test_requests)
        
        # Validate results
        assert report.total_tasks == len(test_requests), f"Expected {len(test_requests)} tasks, got {report.total_tasks}"
        
        print(f"\n✅ Test completed successfully!")
        print(f"📊 Results: {report.successful}/{report.total_tasks} successful")
        
        if report.successful > 0:
            print("✅ At least one URL was scraped successfully")
        else:
            print("⚠️  No URLs were scraped successfully - check your API keys and network")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_environment_setup():
    """Test environment configuration."""
    
    print("🔧 Testing Environment Setup")
    print("=" * 30)
    
    required_vars = ['FIRECRAWL_API_KEY', 'OPENAI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
            print(f"❌ Missing: {var}")
        else:
            # Show first 8 chars for verification
            masked_value = value[:8] + "..." if len(value) > 8 else value
            print(f"✅ Found: {var} = {masked_value}")
    
    if missing_vars:
        print(f"\n❌ Missing {len(missing_vars)} required environment variables")
        print("Please check your .env file or environment settings")
        return False
    
    print("\n✅ Environment setup is correct")
    return True

def test_firecrawl_tool():
    """Test Firecrawl tool directly."""
    
    print("\n🔥 Testing Firecrawl Tool")
    print("=" * 30)
    
    try:
        from tools.firecrawl_tool import firecrawl_tool
        
        # Test basic tool functionality
        result = firecrawl_tool._run(
            url="https://example.com",
            include_links=False,
            include_markdown=True
        )
        
        if result.get('success'):
            print("✅ Firecrawl tool working correctly")
            print(f"📊 Content length: {len(result.get('content', {}).get('content', ''))}")
            return True
        else:
            print(f"❌ Firecrawl tool failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Firecrawl tool test failed: {e}")
        return False

def main():
    """Run all tests."""
    
    # Load environment
    load_dotenv()
    
    print("🚀 CrewAI Firecrawl Scraper Test Suite")
    print("=" * 60)
    
    tests = [
        ("Environment Setup", test_environment_setup),
        ("Firecrawl Tool", test_firecrawl_tool),
        ("Basic Scraping", test_basic_scraping),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\n📊 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! The scraper is ready to use.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        sys.exit(1)

if __name__ == "__main__":
    main()