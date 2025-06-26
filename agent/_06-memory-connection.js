import neo4j from 'neo4j-driver';
import { QdrantClient } from '@qdrant/js-client-rest';

// Qdrant Configuration
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantApiKey = process.env.QDRANT_API_KEY;

// Neo4j Configuration
const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const neo4jUsername = process.env.NEO4J_USERNAME || 'neo4j';
const neo4jPassword = process.env.NEO4J_PASSWORD || 'lev-mem123';

async function testMemoryConnection() {
  // Test Qdrant Connection
  try {
    const qdrantClient = new QdrantClient({ url: qdrantUrl, apiKey: qdrantApiKey });
    const result = await qdrantClient.getCollections();
    console.log('Qdrant connection successful:', result);
  } catch (error) {
    console.error('Qdrant connection failed:', error.message);
  }

  // Test Neo4j Connection
  let driver;
  try {
    driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUsername, neo4jPassword));
    const serverInfo = await driver.getServerInfo();
    console.log('Neo4j connection successful:', serverInfo);
  } catch (error) {
    console.error('Neo4j connection failed:', error.message);
  } finally {
    if (driver) {
      await driver.close();
    }
  }
}

testMemoryConnection();
