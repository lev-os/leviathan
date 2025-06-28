#!/bin/bash
# Daily Research Collection for TimeTravel
# Run this daily via cron: 0 9 * * * /path/to/daily-research.sh

# Set up paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/outputs/daily/$(date +%Y%m%d)"
TIMESTAMP=$(date +%Y-%m-%d)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🚀 TimeTravel Daily Research Collection - $TIMESTAMP"
echo "================================================"

# 1. Fetch AI/ML Papers from arXiv
echo "📚 Fetching arXiv papers..."
cat >"$OUTPUT_DIR/arxiv-query.json" <<EOF
{
  "categories": ["cs.AI", "cs.LG", "cs.CL", "stat.ML"],
  "max_results": 50,
  "sort_by": "submittedDate",
  "sort_order": "descending"
}
EOF

# Use Simple Arxiv MCP (when installed)
# smithery run simple-arxiv --config "$OUTPUT_DIR/arxiv-query.json" > "$OUTPUT_DIR/arxiv-papers.json"

# For now, use direct API
curl -s "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending" >"$OUTPUT_DIR/arxiv-raw.xml"

# 2. Medical AI Research from PubMed
echo "🏥 Fetching medical AI research..."
PUBMED_QUERY="artificial intelligence[Title/Abstract] AND (clinical[Title/Abstract] OR medical[Title/Abstract]) AND (\"last 1 days\"[PDat])"

# When BioMCP is configured:
# smithery run biomcp --query "$PUBMED_QUERY" > "$OUTPUT_DIR/pubmed-papers.json"

# For now, use direct API
curl -s "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=$PUBMED_QUERY&retmode=json&retmax=20" >"$OUTPUT_DIR/pubmed-ids.json"

# 3. GitHub Trending AI Projects
echo "💻 Fetching GitHub trending..."
# When GitHub MCP is configured:
# smithery run github --trending --language python --since daily > "$OUTPUT_DIR/github-trending.json"

# For now, use cb3 when available or curl
# ~/cb3 scrape "https://github.com/trending/python?since=daily&spoken_language_code=en" > "$OUTPUT_DIR/github-trending.html"

# 4. Use Perplexity for Deep Dive on Top Papers
echo "🔍 Running Perplexity deep dive..."
# Extract top 3 papers and research with Perplexity
# This would use your existing Perplexity integration

# 5. Aggregate all findings
echo "📊 Aggregating findings..."
python3 <<'EOF'
import json
import xml.etree.ElementTree as ET
from datetime import datetime

output_dir = "$OUTPUT_DIR"
report = {
    "date": "$TIMESTAMP",
    "sources": {
        "arxiv": {"count": 0, "papers": []},
        "pubmed": {"count": 0, "papers": []},
        "github": {"count": 0, "projects": []},
        "trends": []
    }
}

# Process arXiv data
try:
    tree = ET.parse(f"{output_dir}/arxiv-raw.xml")
    root = tree.getroot()
    
    for entry in root.findall('.//{http://www.w3.org/2005/Atom}entry'):
        title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
        summary = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()
        authors = [author.find('{http://www.w3.org/2005/Atom}name').text 
                  for author in entry.findall('.//{http://www.w3.org/2005/Atom}author')]
        
        report["sources"]["arxiv"]["papers"].append({
            "title": title,
            "authors": authors,
            "summary": summary[:200] + "..."
        })
    
    report["sources"]["arxiv"]["count"] = len(report["sources"]["arxiv"]["papers"])
except Exception as e:
    print(f"Error processing arXiv: {e}")

# Save aggregated report
with open(f"{output_dir}/daily-report.json", "w") as f:
    json.dump(report, f, indent=2)

# Generate markdown summary
with open(f"{output_dir}/daily-summary.md", "w") as f:
    f.write(f"# Research Intelligence Report - {report['date']}\n\n")
    f.write(f"## 📚 arXiv Papers ({report['sources']['arxiv']['count']} new)\n\n")
    
    for i, paper in enumerate(report['sources']['arxiv']['papers'][:5], 1):
        f.write(f"{i}. **{paper['title']}**\n")
        f.write(f"   - Authors: {', '.join(paper['authors'][:3])}\n")
        f.write(f"   - Summary: {paper['summary']}\n\n")

print(f"Report saved to {output_dir}/daily-summary.md")
EOF

# 6. Update trends file
echo "📈 Updating trends..."
cat >>"$PROJECT_ROOT/_trends.md" <<EOF

## Daily Update - $TIMESTAMP

### 🔍 Research Collection Summary
- arXiv papers analyzed: $(grep -c "<entry>" "$OUTPUT_DIR/arxiv-raw.xml" || echo "0")
- Medical AI papers found: $(jq '.esearchresult.count // 0' "$OUTPUT_DIR/pubmed-ids.json" 2>/dev/null || echo "0")
- GitHub trending projects: Pending cb3 integration

### 📊 Key Findings
$(head -20 "$OUTPUT_DIR/daily-summary.md" | tail -15)

EOF

echo "✅ Daily research collection complete!"
echo "📁 Results saved to: $OUTPUT_DIR"
echo "📄 Summary available at: $OUTPUT_DIR/daily-summary.md"
echo ""
echo "🎯 Next steps:"
echo "1. Review $OUTPUT_DIR/daily-summary.md"
echo "2. Run deep dive with Perplexity on interesting papers"
echo "3. Update competition tracking"
