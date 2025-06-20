# Recorded Future's Browser Extension

## Description
Recorded Future's Browser Extension is a powerful threat intelligence tool that brings real-time cyber threat intelligence directly into your web browser. It automatically identifies and provides context about security-relevant entities such as IP addresses, domains, hashes, vulnerabilities, and threat actors as you browse the web.

## Key Features
- **Automatic Entity Recognition**: Highlights IPs, domains, hashes, CVEs on any webpage
- **Instant Intelligence Cards**: Hover over entities for quick intelligence summary
- **Risk Scoring**: See real-time risk scores for all detected entities
- **Threat Context**: Understand why entities are risky or malicious
- **Related Intelligence**: Discover connected threats and campaigns
- **One-click Pivoting**: Deep dive into full intelligence reports
- **Browser Integration**: Works seamlessly with Chrome and Firefox
- **Customizable Highlighting**: Configure which entity types to highlight
- **Export Capabilities**: Save intelligence data for reporting

## Use Cases
- **Security Research**: Enrich articles and reports with threat context
- **Incident Response**: Quickly assess indicators during investigations
- **Threat Hunting**: Identify malicious infrastructure while browsing
- **Intelligence Analysis**: Validate and enrich threat intelligence
- **SOC Operations**: Speed up alert triage and investigation
- **Vulnerability Research**: Get instant context on CVEs and exploits
- **OSINT Investigations**: Enhance open source research with threat data
- **Training and Education**: Learn about threats in real-time context

## Entity Types Detected
```
Network Indicators:
- IP addresses (IPv4 and IPv6)
- Domain names
- URLs
- Email addresses

File Indicators:
- MD5 hashes
- SHA1 hashes
- SHA256 hashes

Vulnerabilities:
- CVE identifiers
- Software versions
- Exploit names

Threat Intelligence:
- Threat actor names
- Malware families
- Campaign names
- Attack techniques
```

## How to Get Started
1. Have an active Recorded Future account
2. Install extension from Chrome Web Store or Firefox Add-ons
3. Log in with your Recorded Future credentials
4. Configure highlighting preferences in extension settings
5. Browse normally - entities will be automatically highlighted
6. Hover over highlighted entities for intelligence cards
7. Click through to full reports when needed
8. Use keyboard shortcuts for quick actions

## Intelligence Card Information
- **Risk Score**: Numeric score (0-100) indicating threat level
- **Evidence**: Key reasons for the risk assessment
- **Last Seen**: Most recent malicious activity
- **Related Entities**: Connected IPs, domains, or actors
- **Intel Sources**: Number of sources reporting on entity
- **Classifications**: Malware type, threat category
- **Quick Actions**: Copy IoC, open full report, add to list

## Configuration Options
```javascript
// Extension Settings
{
  "highlighting": {
    "ip_addresses": true,
    "domains": true,
    "hashes": true,
    "cves": true,
    "email_addresses": false
  },
  "display": {
    "show_risk_scores": true,
    "show_evidence_count": true,
    "auto_expand_cards": false,
    "highlight_color": "yellow"
  },
  "advanced": {
    "api_timeout": 5000,
    "cache_duration": 3600,
    "max_entities_per_page": 100
  }
}
```

## Keyboard Shortcuts
- `Alt+R`: Toggle extension on/off
- `Alt+H`: Toggle highlighting
- `Alt+S`: Open settings
- `Alt+Click`: Open entity in new tab
- `Esc`: Close intelligence card

## Relevant Links and Resources
- **Chrome Extension**: Available in Chrome Web Store
- **Firefox Add-on**: Available in Firefox Add-ons
- **User Guide**: Available in Recorded Future platform
- **Video Tutorials**: Training resources for users
- **Support**: Through Recorded Future support portal
- **Release Notes**: Updated with each version
- **Community Forum**: User discussions and tips

## Privacy and Security
- All queries are encrypted in transit
- No browsing history is stored
- Entity detection happens locally
- API calls only for highlighted entities
- Configurable privacy settings
- Works with private browsing modes
- No tracking or analytics

## Best Practices
- Configure entity types based on your role
- Use keyboard shortcuts for efficiency
- Export findings for documentation
- Combine with other OSINT tools
- Regularly update the extension
- Review privacy settings
- Train team members on usage
- Create custom entity lists for monitoring