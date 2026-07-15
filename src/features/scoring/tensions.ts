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
      label: 'Forte excitation, validation lente',
      severity: 'high',
    })
  }

  if (idea.personalAlignment >= HIGH && idea.scalabilityFit < LOW) {
    tensions.push({
      id: 'alignment-vs-scale',
      label: 'Fort alignement, faible scalability',
      severity: 'medium',
    })
  }

  if (idea.revenuePotential >= HIGH && idea.complexityLevel >= HIGH) {
    tensions.push({
      id: 'revenue-vs-complexity',
      label: 'Fort potentiel revenu, haute complexité',
      severity: 'high',
    })
  }

  if (idea.excitementLevel >= HIGH && idea.personalAlignment < LOW) {
    tensions.push({
      id: 'excitement-vs-alignment',
      label: 'Séduisant mais faible fit personnel',
      severity: 'medium',
    })
  }

  if (idea.revenuePotential >= HIGH && idea.freedomFit < LOW) {
    tensions.push({
      id: 'revenue-vs-freedom',
      label: 'Fort upside, faible freedom fit',
      severity: 'medium',
    })
  }

  if (idea.scalabilityFit >= HIGH && idea.speedToValidation < LOW) {
    tensions.push({
      id: 'scale-vs-speed',
      label: 'Actif scalable, validation lente',
      severity: 'medium',
    })
  }

  return tensions
}

export function detectStrengths(idea: Idea): string[] {
  const strengths: string[] = []
  if (idea.personalAlignment >= HIGH) strengths.push('Fort alignement personnel')
  if (idea.freedomFit >= HIGH) strengths.push('Fort potentiel de freedom')
  if (idea.speedToValidation >= HIGH) strengths.push('Validation rapide')
  if (idea.scalabilityFit >= HIGH) strengths.push('Structure scalable')
  if (idea.complexityLevel <= 3) strengths.push('Faible complexité')
  if (idea.capitalIntensity <= 3) strengths.push('Peu de capital requis')
  return strengths.slice(0, 4)
}

export function detectConstraints(idea: Idea): string[] {
  const constraints: string[] = []
  if (idea.complexityLevel >= HIGH) constraints.push('Complexité opérationnelle élevée')
  if (idea.capitalIntensity >= HIGH) constraints.push('Capital intensif')
  if (idea.speedToValidation < LOW) constraints.push('Chemin de validation lent')
  if (idea.remoteFit < LOW) constraints.push('Compatibilité remote limitée')
  if (idea.scalabilityFit < LOW) constraints.push('Scalability limitée')
  return constraints.slice(0, 4)
}
