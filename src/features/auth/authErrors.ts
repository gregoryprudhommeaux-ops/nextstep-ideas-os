export function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      return 'Connexion annulée. Réessaie dans Chrome ou Safari.'
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Ce domaine n’est pas autorisé dans Firebase. Ajoute localhost aux domaines autorisés (Console Firebase → Authentication → Settings).'
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Connexion Google désactivée dans Firebase. Active le fournisseur Google dans Authentication.'
    }
    if (code === 'auth/network-request-failed') {
      return 'Erreur réseau pendant la connexion. Vérifie ta connexion et réessaie.'
    }
    if ('message' in error && typeof (error as { message: string }).message === 'string') {
      return (error as { message: string }).message
    }
  }
  return 'Échec de la connexion Google. Ouvre l’app dans Chrome ou Safari et réessaie.'
}
