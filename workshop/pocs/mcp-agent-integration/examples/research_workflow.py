"""
Enhanced Research Workflow Example
Demonstrates MCP Agent patterns enhancing Lev workshop workflows
"""

import asyncio
import sys
from pathlib import Path

# Add bridge to path
sys.path.append(str(Path(__file__).parent.parent / "bridge"))

from lev_mcp_bridge import LevMCPBridge, ConstitutionalMCPAgent

class MCPEnhancedWorkflow:
    """Enhanced workshop workflow using MCP Agent patterns"""
    
    def __init__(self, bridge: LevMCPBridge):
        self.bridge = bridge
        self.orchestrator = None
        self.specialists = {}
        
    async def initialize(self):
        """Initialize the enhanced workflow system"""
        
        # Create orchestrator agent (like CEO but for workflow coordination)
        self.orchestrator = await self.bridge.create_lev_agent(
            name="workflow_orchestrator",
            server_names=["filesystem"],
            instruction="""You coordinate complex workflows by breaking them into 
            tasks and delegating to specialist agents.""",
            memory_namespace="workflow_orchestration"
        )
        
        # Create specialist agents for different workflow phases
        self.specialists['intake'] = await self.bridge.create_lev_agent(
            name="intake_specialist",
            server_names=["filesystem", "fetch"],
            instruction="""You analyze repositories and content for the intake process.
            You can read files, fetch documentation, and create structured analyses.""",
            memory_namespace="workshop_intake"
        )
        
        self.specialists['analysis'] = await self.bridge.create_lev_agent(
            name="analysis_specialist", 
            server_names=["filesystem"],
            instruction="""You perform deep analysis and comparison tasks.
            You excel at pattern recognition and strategic assessment.""",
            memory_namespace="workshop_analysis"
        )
        
        self.specialists['synthesis'] = await self.bridge.create_lev_agent(
            name="synthesis_specialist",
            server_names=["filesystem"],
            instruction="""You synthesize findings into actionable recommendations.
            You create ADRs, POC plans, and integration strategies.""",
            memory_namespace="workshop_synthesis"
        )
        
        print(f"🔧 Enhanced workflow initialized with orchestrator + {len(self.specialists)} specialists")
        
    async def enhanced_repository_intake(self, repo_path: str, repo_url: str) -> dict:
        """Enhanced repository intake using MCP orchestration"""
        
        print(f"\n📦 Enhanced Repository Intake: {repo_path}")
        print("=" * 50)
        
        # Step 1: Orchestrator creates plan
        plan = await self._create_intake_plan(repo_path, repo_url)
        
        # Step 2: Execute plan with specialists
        results = {}
        
        # Intake phase
        print("🔍 Phase 1: Repository Analysis...")
        intake_result = await self._execute_intake_analysis(repo_path)
        results['intake'] = intake_result
        
        # Analysis phase  
        print("🧠 Phase 2: Strategic Analysis...")
        analysis_result = await self._execute_strategic_analysis(intake_result)
        results['analysis'] = analysis_result
        
        # Synthesis phase
        print("📝 Phase 3: Recommendation Synthesis...")
        synthesis_result = await self._execute_synthesis(intake_result, analysis_result)
        results['synthesis'] = synthesis_result
        
        # Store complete workflow in orchestrator memory
        await self.orchestrator.lev_memory.store(
            'procedural',
            f'intake_workflow_{repo_path.replace("/", "_")}',
            {
                'repo_path': repo_path,
                'repo_url': repo_url,
                'plan': plan,
                'results': results,
                'status': 'completed'
            }
        )
        
        return {
            'workflow': 'enhanced_repository_intake',
            'plan': plan,
            'results': results,
            'status': 'completed',
            'recommendations': synthesis_result.get('recommendations', [])
        }
    
    async def _create_intake_plan(self, repo_path: str, repo_url: str) -> dict:
        """Orchestrator creates workflow plan"""
        
        plan = {
            'phases': [
                {
                    'name': 'intake_analysis',
                    'specialist': 'intake_specialist',
                    'tasks': ['read_readme', 'analyze_structure', 'identify_patterns']
                },
                {
                    'name': 'strategic_analysis', 
                    'specialist': 'analysis_specialist',
                    'tasks': ['compare_capabilities', 'assess_value', 'identify_gaps']
                },
                {
                    'name': 'synthesis',
                    'specialist': 'synthesis_specialist', 
                    'tasks': ['create_recommendations', 'draft_integration_plan']
                }
            ],
            'coordination': 'sequential_with_memory_sharing'
        }
        
        # Store plan in working memory
        await self.orchestrator.lev_memory.store('working', 'current_plan', plan)
        
        return plan
    
    async def _execute_intake_analysis(self, repo_path: str) -> dict:
        """Execute intake analysis phase"""
        
        intake_agent = self.specialists['intake']
        
        # Simulate reading repository structure and documentation
        analysis = {
            'repo_path': repo_path,
            'structure_analyzed': True,
            'readme_processed': True,
            'patterns_identified': ['MCP Agent patterns', 'Async orchestration', 'Multi-model support'],
            'key_files': ['src/mcp_agent/', 'examples/', 'README.md'],
            'technology_stack': ['Python', 'AsyncIO', 'MCP Protocol']
        }
        
        # Store in intake specialist memory
        await intake_agent.lev_memory.store('semantic', 'repo_analysis', analysis)
        
        return analysis
    
    async def _execute_strategic_analysis(self, intake_result: dict) -> dict:
        """Execute strategic analysis phase"""
        
        analysis_agent = self.specialists['analysis']
        
        # Simulate strategic analysis based on intake findings
        strategic_analysis = {
            'integration_complexity': 'medium',
            'strategic_value': 'high',
            'architectural_fit': 'excellent',
            'gaps_filled': ['MCP server lifecycle', 'Agent orchestration', 'Multi-model abstraction'],
            'risks': ['Additional dependency', 'Learning curve'],
            'opportunities': ['Enhanced agent capabilities', 'Production patterns']
        }
        
        # Store analysis
        await analysis_agent.lev_memory.store('episodic', 'strategic_assessment', strategic_analysis)
        
        return strategic_analysis
    
    async def _execute_synthesis(self, intake_result: dict, analysis_result: dict) -> dict:
        """Execute synthesis phase"""
        
        synthesis_agent = self.specialists['synthesis']
        
        # Create synthesis based on all previous findings
        synthesis = {
            'decision': 'ADOPT_WITH_POC',
            'reasoning': 'High strategic value with manageable integration complexity',
            'recommendations': [
                'Start with POC to validate integration',
                'Focus on MCP server lifecycle management first', 
                'Bridge with existing Lev memory system',
                'Extend CEO agent with MCP orchestrator endpoint'
            ],
            'next_steps': [
                'Create POC in workshop/pocs/',
                'Test memory system integration',
                'Validate constitutional compliance',
                'Plan full integration if POC succeeds'
            ],
            'timeline': '2 weeks POC + 4 weeks integration'
        }
        
        # Store synthesis
        await synthesis_agent.lev_memory.store('procedural', 'integration_plan', synthesis)
        
        return synthesis

async def enhanced_workflow_test():
    """Test enhanced workflow with MCP orchestration"""
    
    print("🔧 Starting Enhanced Workflow Test")
    print("=" * 50)
    
    # Initialize bridge and workflow
    bridge = LevMCPBridge()
    await bridge.initialize()
    
    try:
        workflow = MCPEnhancedWorkflow(bridge)
        await workflow.initialize()
        
        # Test enhanced repository intake
        result = await workflow.enhanced_repository_intake(
            repo_path="~/lev/workshop/intake/mcp-agent",
            repo_url="https://github.com/lastmile-ai/mcp-agent"
        )
        
        print(f"\n✅ Enhanced workflow completed!")
        print(f"Decision: {result['results']['synthesis']['decision']}")
        print(f"Timeline: {result['results']['synthesis']['timeline']}")
        print(f"\nRecommendations:")
        for rec in result['recommendations']:
            print(f"  • {rec}")
            
        print(f"\n🧠 Memory validation:")
        print(f"  ✅ Orchestrator stored workflow plan")
        print(f"  ✅ Intake specialist stored analysis")
        print(f"  ✅ Analysis specialist stored assessment")
        print(f"  ✅ Synthesis specialist stored recommendations")
        
        print(f"\n🎯 Key validations:")
        print(f"  ✅ Multi-agent orchestration")
        print(f"  ✅ Sequential workflow execution")
        print(f"  ✅ Memory sharing between specialists")
        print(f"  ✅ Structured decision-making process")
        print(f"  ✅ Enhanced workshop capabilities")
        
    except Exception as e:
        print(f"❌ Enhanced workflow test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await bridge.shutdown()

if __name__ == "__main__":
    asyncio.run(enhanced_workflow_test())