import chalk from 'chalk'
import inquirer from 'inquirer'
import { PersonalityManager } from '@api/personalities/manager'
import { PersonalityConfig, PersonalityPrompts, PersonalityWeights } from '@shared/personality-types'

export async function PersonalityCommand(options: {
  list?: boolean
  create?: boolean
  edit?: string
  test?: string
  delete?: string
}) {
  const manager = new PersonalityManager()
  await manager.initialize()

  if (options.list) {
    await listPersonalities(manager)
  } else if (options.create) {
    await createPersonality(manager)
  } else if (options.edit) {
    await editPersonality(manager, options.edit)
  } else if (options.test) {
    await testPersonality(manager, options.test)
  } else if (options.delete) {
    await deletePersonality(manager, options.delete)
  } else {
    console.log(chalk.yellow('Please specify an option: --list, --create, --edit, --test, or --delete'))
  }
}

async function listPersonalities(manager: PersonalityManager) {
  const personalities = await manager.getAll()

  console.log(chalk.blue('📋 Available Personality Modes:\n'))

  personalities.forEach((personality) => {
    const status = personality.enabled ? chalk.green('✅') : chalk.red('❌')
    const type = personality.custom ? chalk.yellow('[CUSTOM]') : chalk.blue('[CORE]')

    console.log(`${status} ${type} ${chalk.bold(personality.name)}`)
    console.log(`   ID: ${personality.id}`)
    console.log(`   Focus: ${personality.focus.join(', ')}`)
    console.log('')
  })
}

async function createPersonality(manager: PersonalityManager) {
  console.log(chalk.blue('🧠 Create New Personality Mode\n'))

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Personality ID (lowercase, underscores):',
      validate: (input: string) => {
        if (!input) return 'ID is required'
        if (!/^[a-z_]+$/.test(input)) return 'ID must be lowercase with underscores only'
        return true
      },
    },
    {
      type: 'input',
      name: 'name',
      message: 'Display Name:',
      validate: (input: string) => input.length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input: string) => input.length > 0 || 'Description is required',
    },
    {
      type: 'input',
      name: 'focus',
      message: 'Focus areas (comma-separated):',
      filter: (input: string) => input.split(',').map((s) => s.trim()),
    },
  ])

  // Create personality with defaults
  const personality: PersonalityConfig = {
    ...answers,
    filters: [],
    prompts: generateDefaultPrompts(answers.name),
    weights: getDefaultWeights(),
    examples: [],
    enabled: true,
    custom: true,
  }

  await manager.save(personality)
  console.log(chalk.green(`✅ Created personality: ${personality.name}`))
}

async function editPersonality(manager: PersonalityManager, id: string) {
  console.log(chalk.yellow(`Edit personality functionality not yet implemented for: ${id}`))
  // TODO: Implement personality editing
}

async function testPersonality(manager: PersonalityManager, id: string) {
  console.log(chalk.yellow(`Test personality functionality not yet implemented for: ${id}`))
  // TODO: Implement personality testing
}

async function deletePersonality(manager: PersonalityManager, id: string) {
  console.log(chalk.yellow(`Delete personality functionality not yet implemented for: ${id}`))
  // TODO: Implement personality deletion
}

function generateDefaultPrompts(name: string): PersonalityPrompts {
  return {
    analysis: `As ${name}, analyze this topic with your unique perspective...`,
    synthesis: `Synthesize these findings through the lens of ${name}...`,
    critique: `Critique these conclusions from ${name}'s viewpoint...`,
    recommendation: `Provide recommendations based on ${name}'s expertise...`,
  }
}

function getDefaultWeights(): PersonalityWeights {
  return {
    technical_depth: 0.7,
    practical_application: 0.8,
    novelty: 0.5,
    risk_assessment: 0.6,
    opportunity_identification: 0.7,
    implementation_feasibility: 0.8,
    competitive_advantage: 0.6,
    user_impact: 0.7,
  }
}
