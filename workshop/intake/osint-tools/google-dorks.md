# Google Dorks

## Description
Google Dorks are advanced search operators that leverage Google's powerful search capabilities to find specific information that might not be easily accessible through regular searches. These specialized queries can uncover sensitive data, vulnerabilities, and hidden content across the web.

## Key Features
- **Advanced Operators**: Use of special commands like site:, inurl:, filetype:, etc.
- **Precision Searching**: Target specific file types, domains, or content patterns
- **Vulnerability Discovery**: Identify exposed databases, configuration files, and sensitive documents
- **Time-based Searches**: Filter results by date ranges
- **Cache Access**: View archived versions of websites
- **Combine Operators**: Chain multiple operators for complex queries
- **Language and Region Filtering**: Target specific geographical areas

## Use Cases
- **Security Research**: Find exposed databases, admin panels, and configuration files
- **Competitive Intelligence**: Discover competitor documents and internal information
- **Vulnerability Assessment**: Identify misconfigured servers and exposed credentials
- **Academic Research**: Locate specific file types and research papers
- **Job Hunting**: Find hidden job postings and company directories
- **Digital Forensics**: Trace information across multiple sources
- **Content Discovery**: Uncover hidden directories and forgotten pages

## Common Google Dork Operators
```
site:         Search within a specific website
inurl:        Find pages with specific words in URL
intitle:      Search for pages with specific words in title
filetype:     Search for specific file extensions
ext:          Alternative to filetype
intext:       Search for specific text within page content
cache:        View Google's cached version of a page
related:      Find sites similar to a specified URL
info:         Get information about a specific URL
define:       Get definitions of words
```

## Example Dorks
```
# Find exposed passwords
filetype:log "password"
filetype:txt "username" "password"

# Find vulnerable webcams
intitle:"webcamXP 5" inurl:8080
inurl:"/view/index.shtml"

# Find exposed databases
filetype:sql "INSERT INTO"
ext:sql intext:"username" intext:"password"

# Find admin panels
inurl:admin intitle:login
inurl:"/admin/login.php"

# Find confidential documents
filetype:pdf "confidential" site:gov
filetype:xls "internal only"

# Find exposed Git repositories
inurl:".git" intitle:"Index of"
```

## How to Get Started
1. Learn basic Google search operators
2. Practice with simple queries before advancing
3. Use the Google Advanced Search page for guidance
4. Combine operators to refine results
5. Always respect legal and ethical boundaries
6. Document successful dork patterns for future use
7. Use automated tools responsibly (Google Dork scanners)

## Relevant Links and Resources
- **Google Advanced Search**: https://www.google.com/advanced_search
- **Google Hacking Database (GHDB)**: https://www.exploit-db.com/google-hacking-database
- **DorkSearch.com**: https://dorksearch.com/
- **Dork Generators**: Various online tools for creating complex queries
- **Pentest-Tools Dork Generator**: https://pentest-tools.com/information-gathering/google-hacking
- **SANS Google Cheat Sheet**: Available through SANS resources

## Ethical Considerations
- Always obtain permission before testing systems you don't own
- Respect robots.txt and terms of service
- Use findings responsibly and report vulnerabilities
- Avoid accessing or downloading sensitive personal information
- Understand legal implications in your jurisdiction
- Focus on defensive security and authorized testing