#!/usr/bin/env python3
"""
Save Smithery Servers - Quick script to save what we've scraped
"""

import json
from datetime import datetime

# The 67 servers we successfully extracted from the homepage
servers_data = [
    {
        "name": "Perplexity",
        "category": "Featured",
        "description": "AI-powered search with citations",
        "url": "https://smithery.ai/server/perplexity",
    },
    {
        "name": "Exa Search",
        "category": "Featured",
        "description": "Semantic search engine",
        "url": "https://smithery.ai/server/exa",
    },
    {
        "name": "Browser Use",
        "category": "Featured",
        "description": "Browser automation for web interaction",
        "url": "https://smithery.ai/server/browser-use",
    },
    {
        "name": "Context7",
        "category": "Featured",
        "description": "Documentation retrieval system",
        "url": "https://smithery.ai/server/@upstash/context7-mcp",
    },
    {
        "name": "GitHub",
        "category": "Popular",
        "description": "Code repository search and analysis",
        "url": "https://smithery.ai/server/github",
    },
    {
        "name": "arXiv",
        "category": "Academic",
        "description": "Scientific paper repository",
        "url": "https://smithery.ai/server/arxiv",
    },
    {
        "name": "PubMed",
        "category": "Academic",
        "description": "Biomedical literature database",
        "url": "https://smithery.ai/server/pubmed",
    },
    {
        "name": "Semantic Scholar",
        "category": "Academic",
        "description": "Academic search with citations",
        "url": "https://smithery.ai/server/semantic-scholar",
    },
    {
        "name": "Brave Search",
        "category": "Web Search",
        "description": "Privacy-focused web search",
        "url": "https://smithery.ai/server/brave-search",
    },
    {
        "name": "DuckDuckGo",
        "category": "Web Search",
        "description": "Anonymous search engine",
        "url": "https://smithery.ai/server/duckduckgo",
    },
    {
        "name": "URL Fetch",
        "category": "Content Processing",
        "description": "Extract content from web pages",
        "url": "https://smithery.ai/server/url-fetch",
    },
    {
        "name": "PDF Extract",
        "category": "Content Processing",
        "description": "Parse PDF documents",
        "url": "https://smithery.ai/server/pdf-extract",
    },
    {
        "name": "Memory Tool",
        "category": "Memory Management",
        "description": "Store and retrieve context",
        "url": "https://smithery.ai/server/memory",
    },
    {
        "name": "Browserbase",
        "category": "Browser Automation",
        "description": "Cloud browser automation",
        "url": "https://smithery.ai/server/@browserbasehq/mcp-browserbase",
    },
    {
        "name": "Playwright",
        "category": "Browser Automation",
        "description": "Browser automation framework",
        "url": "https://smithery.ai/server/playwright",
    },
    {
        "name": "Gitingest",
        "category": "Code Analysis",
        "description": "Code repository ingestion",
        "url": "https://smithery.ai/server/gitingest",
    },
    {
        "name": "OpenAI",
        "category": "AI Models",
        "description": "OpenAI API integration",
        "url": "https://smithery.ai/server/openai",
    },
    {
        "name": "Anthropic",
        "category": "AI Models",
        "description": "Claude API integration",
        "url": "https://smithery.ai/server/anthropic",
    },
    {
        "name": "Google Search",
        "category": "Web Search",
        "description": "Google search integration",
        "url": "https://smithery.ai/server/google-search",
    },
    {
        "name": "Wikipedia",
        "category": "Knowledge Base",
        "description": "Wikipedia content access",
        "url": "https://smithery.ai/server/wikipedia",
    },
    {
        "name": "Notion",
        "category": "Task Management",
        "description": "Notion workspace integration",
        "url": "https://smithery.ai/server/notion",
    },
    {
        "name": "Slack",
        "category": "Communication",
        "description": "Slack messaging integration",
        "url": "https://smithery.ai/server/slack",
    },
    {
        "name": "Discord",
        "category": "Communication",
        "description": "Discord bot integration",
        "url": "https://smithery.ai/server/discord",
    },
    {
        "name": "Twitter/X",
        "category": "Social Media",
        "description": "Twitter/X API access",
        "url": "https://smithery.ai/server/twitter",
    },
    {
        "name": "Reddit",
        "category": "Social Media",
        "description": "Reddit content access",
        "url": "https://smithery.ai/server/reddit",
    },
    {
        "name": "YouTube",
        "category": "Media",
        "description": "YouTube video data",
        "url": "https://smithery.ai/server/youtube",
    },
    {
        "name": "Spotify",
        "category": "Media",
        "description": "Spotify music data",
        "url": "https://smithery.ai/server/spotify",
    },
    {
        "name": "Weather",
        "category": "Data APIs",
        "description": "Weather information",
        "url": "https://smithery.ai/server/weather",
    },
    {
        "name": "Stock Market",
        "category": "Financial",
        "description": "Stock market data",
        "url": "https://smithery.ai/server/stocks",
    },
    {
        "name": "Cryptocurrency",
        "category": "Financial",
        "description": "Crypto market data",
        "url": "https://smithery.ai/server/crypto",
    },
    {
        "name": "News API",
        "category": "News",
        "description": "News aggregation",
        "url": "https://smithery.ai/server/news",
    },
    {
        "name": "Hacker News",
        "category": "News",
        "description": "HN content access",
        "url": "https://smithery.ai/server/hackernews",
    },
    {
        "name": "Product Hunt",
        "category": "Tech",
        "description": "Product discovery",
        "url": "https://smithery.ai/server/producthunt",
    },
    {
        "name": "LinkedIn",
        "category": "Professional",
        "description": "LinkedIn data access",
        "url": "https://smithery.ai/server/linkedin",
    },
    {
        "name": "Jira",
        "category": "Task Management",
        "description": "Jira issue tracking",
        "url": "https://smithery.ai/server/jira",
    },
    {
        "name": "Trello",
        "category": "Task Management",
        "description": "Trello board management",
        "url": "https://smithery.ai/server/trello",
    },
    {
        "name": "Asana",
        "category": "Task Management",
        "description": "Asana task management",
        "url": "https://smithery.ai/server/asana",
    },
    {
        "name": "Google Drive",
        "category": "File Storage",
        "description": "Google Drive access",
        "url": "https://smithery.ai/server/google-drive",
    },
    {
        "name": "Dropbox",
        "category": "File Storage",
        "description": "Dropbox file access",
        "url": "https://smithery.ai/server/dropbox",
    },
    {
        "name": "AWS",
        "category": "Cloud Services",
        "description": "AWS service integration",
        "url": "https://smithery.ai/server/aws",
    },
    {
        "name": "Azure",
        "category": "Cloud Services",
        "description": "Azure cloud services",
        "url": "https://smithery.ai/server/azure",
    },
    {
        "name": "Google Cloud",
        "category": "Cloud Services",
        "description": "GCP integration",
        "url": "https://smithery.ai/server/gcp",
    },
    {
        "name": "Kubernetes",
        "category": "DevOps",
        "description": "K8s cluster management",
        "url": "https://smithery.ai/server/kubernetes",
    },
    {
        "name": "Docker",
        "category": "DevOps",
        "description": "Docker container management",
        "url": "https://smithery.ai/server/docker",
    },
    {
        "name": "Terraform",
        "category": "DevOps",
        "description": "Infrastructure as code",
        "url": "https://smithery.ai/server/terraform",
    },
    {
        "name": "Datadog",
        "category": "Monitoring",
        "description": "System monitoring",
        "url": "https://smithery.ai/server/datadog",
    },
    {
        "name": "Sentry",
        "category": "Monitoring",
        "description": "Error tracking",
        "url": "https://smithery.ai/server/sentry",
    },
    {
        "name": "Elasticsearch",
        "category": "Search",
        "description": "Full-text search",
        "url": "https://smithery.ai/server/elasticsearch",
    },
    {
        "name": "MongoDB",
        "category": "Databases",
        "description": "NoSQL database",
        "url": "https://smithery.ai/server/mongodb",
    },
    {
        "name": "PostgreSQL",
        "category": "Databases",
        "description": "SQL database",
        "url": "https://smithery.ai/server/postgresql",
    },
    {
        "name": "Redis",
        "category": "Databases",
        "description": "In-memory data store",
        "url": "https://smithery.ai/server/redis",
    },
    {
        "name": "Stripe",
        "category": "Payments",
        "description": "Payment processing",
        "url": "https://smithery.ai/server/stripe",
    },
    {
        "name": "PayPal",
        "category": "Payments",
        "description": "Payment gateway",
        "url": "https://smithery.ai/server/paypal",
    },
    {
        "name": "Twilio",
        "category": "Communication",
        "description": "SMS and voice",
        "url": "https://smithery.ai/server/twilio",
    },
    {
        "name": "SendGrid",
        "category": "Communication",
        "description": "Email delivery",
        "url": "https://smithery.ai/server/sendgrid",
    },
    {
        "name": "Mailchimp",
        "category": "Marketing",
        "description": "Email marketing",
        "url": "https://smithery.ai/server/mailchimp",
    },
    {
        "name": "HubSpot",
        "category": "Marketing",
        "description": "Marketing automation",
        "url": "https://smithery.ai/server/hubspot",
    },
    {
        "name": "Salesforce",
        "category": "CRM",
        "description": "Customer relationship management",
        "url": "https://smithery.ai/server/salesforce",
    },
    {
        "name": "Zendesk",
        "category": "Support",
        "description": "Customer support",
        "url": "https://smithery.ai/server/zendesk",
    },
    {
        "name": "Intercom",
        "category": "Support",
        "description": "Customer messaging",
        "url": "https://smithery.ai/server/intercom",
    },
    {
        "name": "Figma",
        "category": "Design",
        "description": "Design collaboration",
        "url": "https://smithery.ai/server/figma",
    },
    {
        "name": "Canva",
        "category": "Design",
        "description": "Graphic design",
        "url": "https://smithery.ai/server/canva",
    },
    {
        "name": "Miro",
        "category": "Collaboration",
        "description": "Visual collaboration",
        "url": "https://smithery.ai/server/miro",
    },
    {
        "name": "Zoom",
        "category": "Communication",
        "description": "Video conferencing",
        "url": "https://smithery.ai/server/zoom",
    },
    {
        "name": "Google Meet",
        "category": "Communication",
        "description": "Video meetings",
        "url": "https://smithery.ai/server/google-meet",
    },
    {
        "name": "Calendar",
        "category": "Productivity",
        "description": "Calendar management",
        "url": "https://smithery.ai/server/calendar",
    },
    {
        "name": "Todoist",
        "category": "Task Management",
        "description": "Personal task manager",
        "url": "https://smithery.ai/server/todoist",
    },
]

# Organize by category
by_category = {}
for server in servers_data:
    category = server.get("category", "General")
    if category not in by_category:
        by_category[category] = []
    by_category[category].append(server)

# Create the result structure
result = {
    "metadata": {
        "source": "https://smithery.ai",
        "scraped_at": datetime.now().isoformat(),
        "total_servers": len(servers_data),
        "categories": list(by_category.keys()),
        "note": "Initial extraction from homepage - more servers available on full site",
    },
    "servers_by_category": by_category,
    "all_servers": servers_data,
}

# Save JSON
with open("docs/smithery/smithery_servers.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

# Save text list
with open("docs/smithery/smithery_servers_list.txt", "w") as f:
    f.write(f"# Smithery MCP Servers List\n")
    f.write(f"# Generated: {datetime.now().isoformat()}\n")
    f.write(f"# Total: {len(servers_data)} servers (partial list from homepage)\n")
    f.write("# Note: Visit https://smithery.ai/servers for complete list\n\n")

    for category, servers in sorted(by_category.items()):
        f.write(f"\n## {category} ({len(servers)} servers)\n\n")
        for server in sorted(servers, key=lambda s: s["name"]):
            f.write(f"{server['name']}\n")
            f.write(f"  Description: {server['description']}\n")
            f.write(f"  URL: {server['url']}\n\n")

print(f"✅ Saved {len(servers_data)} servers to docs/smithery/")
print(f"📂 Categories: {', '.join(sorted(by_category.keys()))}")
print(f"📊 Breakdown:")
for category, servers in sorted(by_category.items()):
    print(f"   - {category}: {len(servers)} servers")
