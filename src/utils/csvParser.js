/**
 * Détecte le séparateur du CSV (virgule ou point-virgule)
 * @param {string} firstLine - Première ligne du CSV
 * @returns {string} Le séparateur détecté (',' ou ';')
 */
const detectSeparator = (firstLine) => {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  return semicolonCount > commaCount ? ';' : ',';
};

/**
 * Parse un contenu CSV en tableau d'objets
 * Détecte automatiquement le séparateur (virgule ou point-virgule)
 * @param {string} csv - Contenu du fichier CSV
 * @param {string[]} requiredColumns - Colonnes requises
 * @returns {object} { data: array, errors: array, separator: string }
 */
export const parseCSV = (csv, requiredColumns = []) => {
  const lines = csv.trim().split('\n');
  const data = [];
  const errors = [];

  if (lines.length < 2) {
    errors.push("Le fichier CSV doit contenir au moins une en-tête et une ligne de données");
    return { data, errors, separator: ',' };
  }

  // Détecter le séparateur
  const separator = detectSeparator(lines[0]);

  // Parser l'en-tête
  const headers = lines[0]
    .split(separator)
    .map(h => h.trim().toLowerCase())
    .map(h => h.replace(/^["']|["']$/g, '')); // Enlever les guillemets

  // Vérifier les colonnes requises
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Colonnes manquantes: ${missingColumns.join(', ')}`);
    return { data, errors, separator };
  }

  // Parser les données
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Ignorer les lignes vides

    const values = line
      .split(separator)
      .map(v => v.trim())
      .map(v => v.replace(/^["']|["']$/g, '')); // Enlever les guillemets

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return { data, errors, separator };
};

/**
 * Valide les données d'un employé
 * @param {object} employee - Données de l'employé
 * @returns {object} { isValid: boolean, errors: array }
 */
export const validateEmployee = (employee) => {
  const errors = [];

  if (!employee.name?.trim()) {
    errors.push('Le nom est requis');
  } else if (employee.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!employee.email?.trim()) {
    errors.push('L\'email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.push('Format d\'email invalide');
  }

  if (!employee.department?.trim()) {
    errors.push('Le département est requis');
  }

  if (!employee.role?.trim()) {
    errors.push('Le poste est requis');
  }

  if (!employee.salary) {
    errors.push('Le salaire est requis');
  } else if (isNaN(employee.salary) || parseFloat(employee.salary) < 0) {
    errors.push('Le salaire doit être un nombre positif');
  }

  const status = employee.status?.toLowerCase() || 'active';
  if (!['active', 'inactive'].includes(status)) {
    errors.push('Le statut doit être "active" ou "inactive"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
