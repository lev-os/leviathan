# SecurityTrails API

## Description
SecurityTrails API provides comprehensive access to current and historical DNS data, domain intelligence, and internet asset information. It offers one of the world's largest repositories of historical DNS data, enabling deep investigations into domain infrastructure and ownership changes over time.

## Key Features
- **Historical DNS Records**: Access to years of historical DNS data
- **Domain Search**: Advanced filtering by registrant, nameserver, IP, and more
- **WHOIS History**: Track domain ownership changes over time
- **Subdomain Discovery**: Enumerate subdomains for any given domain
- **Reverse DNS/IP**: Find all domains hosted on specific IPs
- **SSL Certificate Data**: Information about SSL certificates and associations
- **Company Footprint**: Discover all assets belonging to an organization
- **RESTful API**: Easy integration with existing tools and workflows
- **Bulk Operations**: Process multiple queries efficiently

## Use Cases
- **Threat Intelligence**: Track malicious infrastructure and actor patterns
- **Brand Protection**: Monitor for typosquatting and phishing domains
- **Competitive Analysis**: Discover competitor's digital infrastructure
- **Security Assessments**: Map attack surface and identify exposed assets
- **Incident Response**: Investigate historical connections and infrastructure
- **Due Diligence**: Research domain history for M&A or partnerships
- **Law Enforcement**: Track criminal infrastructure over time
- **Academic Research**: Study internet infrastructure evolution

## API Endpoints
```
# Domain Details
GET /v1/domain/{hostname}

# Subdomain Discovery
GET /v1/domain/{hostname}/subdomains

# Domain Search
POST /v1/domains/list

# WHOIS History
GET /v1/history/{hostname}/whois

# DNS History
GET /v1/history/{hostname}/dns/{type}

# Reverse IP Lookup
GET /v1/ips/{ip}

# Company Discovery
GET /v1/company/{domain}
```

## How to Get Started
1. Sign up for a SecurityTrails account at https://securitytrails.com/
2. Access your API key from the account dashboard
3. Review API documentation and rate limits
4. Test basic queries using cURL or Postman
5. Integrate into your tools using official SDKs
6. Monitor your API usage to stay within limits
7. Consider upgrading plans for higher limits and advanced features

## Example API Calls
```bash
# Get domain information
curl --request GET \
  --url 'https://api.securitytrails.com/v1/domain/example.com' \
  --header 'apikey: YOUR_API_KEY'

# Find subdomains
curl --request GET \
  --url 'https://api.securitytrails.com/v1/domain/example.com/subdomains' \
  --header 'apikey: YOUR_API_KEY'

# Search for domains by keyword
curl --request POST \
  --url 'https://api.securitytrails.com/v1/domains/list' \
  --header 'apikey: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"filter":{"keyword":"security"}}'
```

## Relevant Links and Resources
- **Official Website**: https://securitytrails.com/
- **API Documentation**: https://docs.securitytrails.com/docs
- **API Explorer**: Interactive API testing interface
- **Python SDK**: https://github.com/SecurityTrails/securitytrails-python
- **Blog & Research**: https://securitytrails.com/blog
- **Free Tools**: https://securitytrails.com/dns-trails
- **Status Page**: https://status.securitytrails.com/

## Pricing Tiers
- **Free Tier**: 50 API queries/month, basic features
- **Starter**: 2,500 queries/month, historical data access
- **Professional**: 10,000+ queries/month, bulk operations
- **Enterprise**: Custom limits, dedicated support

## Best Practices
- Cache results to minimize API calls
- Use pagination for large result sets
- Implement exponential backoff for rate limiting
- Store historical data locally for trend analysis
- Combine with other OSINT tools for verification
- Respect privacy and legal requirements