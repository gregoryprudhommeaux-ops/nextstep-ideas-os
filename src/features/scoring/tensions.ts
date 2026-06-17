import type { Idea } from '../../types/domain'

export type Tension = {
  id: string
  label: string
  severity: 'medium' | 'high'
}

const HIGH = 7
const LOW = 5

export function detectTensions(idea: Idea): Tension[] {
  const tensions: Tension[] = []

  if (idea.excitementLevel >= HIGH && idea.speedToValidation < LOW) {
    tensions.push({
      id: 'excitement-vs-speed',
      label: 'High excitement, slow validation',
      severity: 'high',
    })
  }

  if (idea.personalAlignment >= HIGH && idea.scalabilityFit < LOW) {
    tensions.push({
      id: 'alignment-vs-scale',
      label: 'High alignment, low scalability',
      severity: 'medium',
    })
  }

  if (idea.revenuePotential >= HIGH && idea.complexityLevel >= HIGH) {
    tensions.push({
      id: 'revenue-vs-complexity',
      label: 'High revenue potential, high complexity',
      severity: 'high',
    })
  }

  if (idea.excitementLevel >= HIGH && idea.personalAlignment < LOW) {
    tensions.push({
      id: 'excitement-vs-alignment',
      label: 'Attractive but weak personal fit',
      severity: 'medium',
    })
  }

  if (idea.revenuePotential >= HIGH && idea.freedomFit < LOW) {
    tensions.push({
      id: 'revenue-vs-freedom',
      label: 'Strong upside, weak freedom fit',
      severity: 'medium',
    })
  }

  if (idea.scalabilityFit >= HIGH && idea.speedToValidation < LOW) {
    tensions.push({
      id: 'scale-vs-speed',
      label: 'Scalable asset, slow to validate',
      severity: 'medium',
    })
  }

  return tensions
}

export function detectStrengths(idea: Idea): string[] {
  const strengths: string[] = []
  if (idea.personalAlignment >= HIGH) strengths.push('Strong personal alignment')
  if (idea.freedomFit >= HIGH) strengths.push('High freedom potential')
  if (idea.speedToValidation >= HIGH) strengths.push('Fast to validate')
  if (idea.scalabilityFit >= HIGH) strengths.push('Scalable structure')
  if (idea.complexityLevel <= 3) strengths.push('Low complexity')
  if (idea.capitalIntensity <= 3) strengths.push('Low capital requirement')
  return strengths.slice(0, 4)
}

export function detectConstraints(idea: Idea): string[] {
  const constraints: string[] = []
  if (idea.complexityLevel >= HIGH) constraints.push('High operational complexity')
  if (idea.capitalIntensity >= HIGH) constraints.push('Capital intensive')
  if (idea.speedToValidation < LOW) constraints.push('Slow validation path')
  if (idea.remoteFit < LOW) constraints.push('Limited remote compatibility')
  if (idea.scalabilityFit < LOW) constraints.push('Limited scalability')
  return constraints.slice(0, 4)
}
