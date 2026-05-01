const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, LevelFormat, PageNumber, Header, Footer, TabStopType,
  TabStopPosition, NumberFormat
} = require('docx');
const fs = require('fs');

const COLORS = {
  primary: '1A3C5E',
  accent: 'E85D04',
  light: 'EBF4FF',
  lightAccent: 'FFF3E0',
  gray: 'F5F5F5',
  border: 'CCCCCC',
  white: 'FFFFFF',
  green: '2D6A4F',
  lightGreen: 'D8F3DC',
  purple: '5C4B99',
  lightPurple: 'EDE7F6',
  red: 'B71C1C',
  lightRed: 'FFEBEE',
};

const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: COLORS.primary, font: 'Arial' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: COLORS.primary, font: 'Arial' })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: COLORS.accent, font: 'Arial' })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, font: 'Arial', ...opts })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'numbers', level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function separator(color = COLORS.primary) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 1 } },
    spacing: { before: 200, after: 200 },
    children: []
  });
}

function infoBox(label, textLines, color = COLORS.light, borderColor = COLORS.primary) {
  const rows = [];
  // Header
  rows.push(new TableRow({
    children: [new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } },
      shading: { fill: borderColor, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: COLORS.white, font: 'Arial' })] })]
    })]
  }));
  // Content rows
  for (const line of textLines) {
    rows.push(new TableRow({
      children: [new TableCell({
        borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } },
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: line, size: 20, font: 'Arial' })] })]
      })]
    }));
  }
  // Bottom border row
  rows.push(new TableRow({
    children: [new TableCell({
      borders: { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, left: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } },
      shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 20, bottom: 20, left: 120, right: 120 },
      children: [new Paragraph({ children: [] })]
    })]
  }));

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows,
    margins: { top: 100, bottom: 100 }
  });
}

function codeBlock(lines) {
  const rows = lines.map(line => new TableRow({
    children: [new TableCell({
      borders: noBorders,
      shading: { fill: '1E1E1E', type: ShadingType.CLEAR },
      margins: { top: 40, bottom: 40, left: 160, right: 160 },
      children: [new Paragraph({
        children: [new TextRun({ text: line || ' ', size: 18, font: 'Courier New', color: '9CDCFE' })]
      })]
    })]
  }));
  // wrap in outer box
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      shading: { fill: '1E1E1E', type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 0, right: 0 },
      children: [new Table({ width: { size: 9160, type: WidthType.DXA }, columnWidths: [9160], rows })]
    })]})],
  });
}

function qaBox(question, answer, points = null) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({ children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.purple }, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.purple }, right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.purple } },
        shading: { fill: COLORS.lightPurple, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [
          new TextRun({ text: points ? `Q (${points} pts) — ` : 'Q — ', bold: true, size: 20, font: 'Arial', color: COLORS.purple }),
          new TextRun({ text: question, size: 20, font: 'Arial' })
        ]})]
      })]
      }),
      new TableRow({ children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.purple }, bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.green }, left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.purple }, right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.purple } },
        shading: { fill: COLORS.lightGreen, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [
          new TextRun({ text: '✓ ', bold: true, size: 20, font: 'Arial', color: COLORS.green }),
          new TextRun({ text: answer, size: 20, font: 'Arial' })
        ]})]
      })]
      })
    ]
  });
}

function twoColTable(headers, rows_data, widths = [3120, 3120, 3120]) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Arial', color: COLORS.white })] })]
    }))
  });
  const dataRows = rows_data.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      shading: { fill: ri % 2 === 0 ? COLORS.white : COLORS.gray, type: ShadingType.CLEAR },
      width: { size: widths[ci], type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: 'Arial' })] })]
    }))
  }));
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...dataRows] });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT 1: Programme Général + Présentation Projet
// ═══════════════════════════════════════════════════════════════
async function generateDoc1() {
  const doc = new Document({
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }, { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Arial', color: COLORS.accent }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        // COVER
        new Paragraph({ spacing: { before: 1440 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '⚛', size: 96, color: COLORS.accent, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FORMATION REACT INTENSIVE', bold: true, size: 52, color: COLORS.primary, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Programme Complet 3 Jours — Évaluation ERP Frontend', size: 28, color: COLORS.accent, font: 'Arial' })] }),
        separator(COLORS.accent),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Du Débutant Avancé au Développeur Frontend React Opérationnel', size: 22, color: '555555', font: 'Arial', italics: true })] }),
        new Paragraph({ spacing: { before: 600 }, children: [] }),

        // Vue d'ensemble
        h1('Vue d\'ensemble du Programme'),
        infoBox('OBJECTIF FINAL', [
          'À l\'issue de ces 3 jours, vous serez capable de créer une application frontend React',
          'complète qui se connecte à une API REST backend ERP existante, gère les données',
          'CRUD, authentifie les utilisateurs, et affiche des tableaux de bord professionnels.'
        ], COLORS.light, COLORS.primary),
        p(''),

        twoColTable(
          ['Jour', 'Thème Principal', 'Livrable'],
          [
            ['Jour 1', 'Fondations React + Hooks', 'Squelette app + pages de base'],
            ['Jour 2', 'API, State Global, Routing', 'CRUD complet connecté au backend'],
            ['Jour 3', 'Performance, Tests, Polish', 'App production-ready + évaluation'],
          ],
          [1500, 4500, 3360]
        ),
        p(''),

        h2('Structure Horaire Journalière'),
        twoColTable(
          ['Horaire', 'Activité'],
          [
            ['08h00 – 09h00', 'Révision du jour précédent + Quiz flash'],
            ['09h00 – 12h00', 'Théorie + démonstrations (blocs de 45 min)'],
            ['12h00 – 13h00', 'Pause déjeuner'],
            ['13h00 – 16h00', 'Pratique guidée sur le projet ERP'],
            ['16h00 – 17h30', 'Exercices autonomes + débogage'],
            ['17h30 – 18h00', 'Correction collective + récapitulatif'],
          ],
          [2200, 7160]
        ),
        p(''),

        separator(),
        h1('Présentation du Projet Fil Rouge : ERP-Connect'),
        infoBox('CONTEXTE PROJET', [
          'Une entreprise utilise un ERP backend (Node.js/Python/Java — peu importe).',
          'Ce backend expose une API REST documentée. Votre mission : créer le frontend React',
          'qui permet aux employés et managers de gérer les données métier via cette interface.'
        ], COLORS.lightAccent, COLORS.accent),
        p(''),
        h2('Modules Fonctionnels à Développer'),
        bullet('🔐 Authentification : Login / Logout / Protection des routes'),
        bullet('👥 Gestion des Employés : Liste, Création, Modification, Suppression'),
        bullet('📦 Gestion des Produits : Catalogue, Stock, Import CSV'),
        bullet('📊 Dashboard : KPIs, graphiques, statistiques en temps réel'),
        bullet('📋 Commandes : Liste des commandes, statuts, filtres'),
        bullet('⚙️ Paramètres : Profil utilisateur, préférences'),
        p(''),

        h2('Architecture Technique'),
        codeBlock([
          'erp-connect/                    ← Racine du projet',
          '├── public/',
          '├── src/',
          '│   ├── api/                    ← Appels API (axios instances)',
          '│   │   ├── auth.api.js',
          '│   │   ├── employees.api.js',
          '│   │   ├── products.api.js',
          '│   │   └── orders.api.js',
          '│   ├── components/             ← Composants réutilisables',
          '│   │   ├── ui/                 ← Button, Input, Modal, Table...',
          '│   │   └── layout/             ← Navbar, Sidebar, Layout',
          '│   ├── pages/                  ← Une page = une route',
          '│   │   ├── Login.jsx',
          '│   │   ├── Dashboard.jsx',
          '│   │   ├── Employees.jsx',
          '│   │   └── Products.jsx',
          '│   ├── hooks/                  ← Hooks personnalisés',
          '│   │   ├── useAuth.js',
          '│   │   ├── useApi.js',
          '│   │   └── useDebounce.js',
          '│   ├── store/                  ← État global (Zustand)',
          '│   │   ├── authStore.js',
          '│   │   └── appStore.js',
          '│   ├── utils/                  ← Helpers, formatters',
          '│   └── App.jsx                 ← Router principal',
          '└── package.json',
        ]),
        p(''),

        h2('APIs Backend Simulées (JSON Server)'),
        p('Pendant la formation, nous utilisons json-server pour simuler le backend ERP :'),
        codeBlock([
          '# Installation',
          'npm install -g json-server',
          '',
          '# Lancer le serveur mock',
          'json-server --watch db.json --port 3001',
          '',
          '# Endpoints disponibles :',
          'GET    /employees          → Liste des employés',
          'GET    /employees/:id      → Un employé',
          'POST   /employees          → Créer un employé',
          'PUT    /employees/:id      → Modifier un employé',
          'DELETE /employees/:id      → Supprimer un employé',
          '',
          'GET    /products           → Catalogue produits',
          'GET    /orders             → Commandes',
          'POST   /auth/login         → Authentification',
        ]),
        p(''),

        pageBreak(),
        // ─────── JOUR 1 ───────
        h1('JOUR 1 — Fondations React & Hooks Essentiels'),
        infoBox('OBJECTIFS DU JOUR 1', [
          '✓ Comprendre le paradigme React (composants, JSX, Virtual DOM)',
          '✓ Maîtriser useState, useEffect, useRef, useCallback, useMemo',
          '✓ Créer des composants réutilisables avec des props typées',
          '✓ Implémenter le formulaire de login et la structure de l\'app'
        ], COLORS.lightGreen, COLORS.green),
        p(''),

        h2('Bloc 1.1 — Le Paradigme React (09h00–09h45)'),
        h3('Concepts Clés'),
        bullet('React est une bibliothèque de rendu déclaratif basée sur des composants'),
        bullet('Le Virtual DOM optimise les mises à jour du DOM réel'),
        bullet('L\'état (state) déclenche le re-rendu des composants'),
        bullet('La donnée coule de parent → enfant (unidirectionnel)'),
        p(''),
        h3('JSX : JavaScript + XML'),
        codeBlock([
          '// JSX est du sucre syntaxique pour React.createElement()',
          'function Greeting({ name, role }) {',
          '  return (',
          '    <div className="greeting">',
          '      <h1>Bonjour, {name} !</h1>',
          '      {role === "admin" && <span className="badge">Admin</span>}',
          '      <p>Bienvenue dans ERP-Connect</p>',
          '    </div>',
          '  );',
          '}',
          '',
          '// Utilisation',
          '<Greeting name="Alice" role="admin" />',
        ]),
        p(''),
        infoBox('⚠ RÈGLES JSX À RETENIR', [
          '• className au lieu de class (class est réservé en JS)',
          '• Les expressions JS s\'écrivent entre accolades { }',
          '• Un composant = UNE seule racine (ou <> fragment <>)',
          '• Les composants commencent par une MAJUSCULE',
          '• Les attributs HTML suivent le camelCase (onClick, onChange)',
        ], COLORS.lightAccent, COLORS.accent),
        p(''),

        h2('Bloc 1.2 — Les Hooks Fondamentaux (09h45–11h00)'),
        h3('useState — L\'état local du composant'),
        codeBlock([
          'import { useState } from "react";',
          '',
          'function LoginForm() {',
          '  const [email, setEmail] = useState("");',
          '  const [password, setPassword] = useState("");',
          '  const [error, setError] = useState(null);',
          '  const [loading, setLoading] = useState(false);',
          '',
          '  const handleSubmit = async (e) => {',
          '    e.preventDefault();',
          '    setLoading(true);',
          '    setError(null);',
          '    try {',
          '      await login(email, password); // appel API',
          '    } catch (err) {',
          '      setError(err.message);',
          '    } finally {',
          '      setLoading(false);',
          '    }',
          '  };',
          '',
          '  return (',
          '    <form onSubmit={handleSubmit}>',
          '      <input value={email} onChange={e => setEmail(e.target.value)} />',
          '      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />',
          '      {error && <p className="error">{error}</p>}',
          '      <button disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>',
          '    </form>',
          '  );',
          '}',
        ]),
        p(''),
        h3('useEffect — Les effets de bord'),
        codeBlock([
          'import { useState, useEffect } from "react";',
          '',
          'function EmployeeList() {',
          '  const [employees, setEmployees] = useState([]);',
          '  const [loading, setLoading] = useState(true);',
          '',
          '  // Déclenché UNE FOIS au montage (tableau vide [])',
          '  useEffect(() => {',
          '    fetch("http://localhost:3001/employees")',
          '      .then(res => res.json())',
          '      .then(data => {',
          '        setEmployees(data);',
          '        setLoading(false);',
          '      });',
          '  }, []);  // ← dépendances vides = exécution au montage seulement',
          '',
          '  // Déclenché quand searchTerm change',
          '  useEffect(() => {',
          '    console.log("Recherche:", searchTerm);',
          '  }, [searchTerm]);',
          '',
          '  // Cleanup : exécuté au démontage',
          '  useEffect(() => {',
          '    const timer = setInterval(() => fetchData(), 5000);',
          '    return () => clearInterval(timer); // nettoyage !',
          '  }, []);',
          '}',
        ]),
        p(''),
        h3('useMemo & useCallback — Optimisation'),
        codeBlock([
          '// useMemo : mémoïse un calcul coûteux',
          'const filteredEmployees = useMemo(() => {',
          '  return employees.filter(emp =>',
          '    emp.name.toLowerCase().includes(searchTerm.toLowerCase())',
          '  );',
          '}, [employees, searchTerm]); // recalcul SEULEMENT si ces valeurs changent',
          '',
          '// useCallback : mémoïse une fonction (évite les re-créations)',
          'const handleDelete = useCallback((id) => {',
          '  deleteEmployee(id);',
          '}, []); // fonction stable entre les rendus',
        ]),
        p(''),

        h2('Bloc 1.3 — Composants & Props (11h00–12h00)'),
        h3('Composant Bouton Réutilisable'),
        codeBlock([
          '// components/ui/Button.jsx',
          'function Button({ children, variant = "primary", onClick, disabled, loading }) {',
          '  const variants = {',
          '    primary: "bg-blue-600 text-white hover:bg-blue-700",',
          '    danger:  "bg-red-600 text-white hover:bg-red-700",',
          '    outline: "border border-gray-300 hover:bg-gray-50",',
          '  };',
          '',
          '  return (',
          '    <button',
          '      onClick={onClick}',
          '      disabled={disabled || loading}',
          '      className={`px-4 py-2 rounded ${variants[variant]}`}',
          '    >',
          '      {loading ? <Spinner /> : children}',
          '    </button>',
          '  );',
          '}',
          '',
          '// Utilisation :',
          '<Button variant="danger" onClick={handleDelete}>Supprimer</Button>',
          '<Button loading={isSubmitting}>Enregistrer</Button>',
        ]),
        p(''),

        h2('Exercice Pratique Jour 1 (13h00–18h00)'),
        infoBox('🛠 TRAVAIL PRATIQUE', [
          '1. Créer le projet : npx create-react-app erp-connect (ou Vite)',
          '2. Installer les dépendances : axios, react-router-dom, zustand',
          '3. Créer la structure de dossiers définie dans l\'architecture',
          '4. Coder le composant LoginForm avec useState + validation',
          '5. Créer le composant Button, Input, Spinner réutilisables',
          '6. Intégrer json-server et tester le fetch des employés',
          '7. Créer la page EmployeeList avec useEffect + useMemo pour le filtre',
        ], COLORS.lightGreen, COLORS.green),

        pageBreak(),
        // ─────── JOUR 2 ───────
        h1('JOUR 2 — API, Routing, État Global'),
        infoBox('OBJECTIFS DU JOUR 2', [
          '✓ Maîtriser axios : instances, interceptors, gestion erreurs',
          '✓ Implémenter React Router v6 : routes imbriquées, navigation',
          '✓ Gérer l\'état global avec Zustand (auth, données partagées)',
          '✓ Créer des Custom Hooks réutilisables',
          '✓ CRUD complet connecté au backend',
        ], COLORS.lightAccent, COLORS.accent),
        p(''),

        h2('Bloc 2.1 — Axios & Gestion API (09h00–10h30)'),
        h3('Instance Axios Configurée'),
        codeBlock([
          '// api/axios.config.js',
          'import axios from "axios";',
          '',
          'const api = axios.create({',
          '  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",',
          '  timeout: 10000,',
          '  headers: { "Content-Type": "application/json" },',
          '});',
          '',
          '// Intercepteur REQUEST : ajouter le token JWT automatiquement',
          'api.interceptors.request.use((config) => {',
          '  const token = localStorage.getItem("token");',
          '  if (token) config.headers.Authorization = `Bearer ${token}`;',
          '  return config;',
          '});',
          '',
          '// Intercepteur RESPONSE : gestion globale des erreurs',
          'api.interceptors.response.use(',
          '  (response) => response,',
          '  (error) => {',
          '    if (error.response?.status === 401) {',
          '      localStorage.removeItem("token");',
          '      window.location.href = "/login";',
          '    }',
          '    return Promise.reject(error);',
          '  }',
          ');',
          '',
          'export default api;',
        ]),
        p(''),
        h3('Services API par Entité'),
        codeBlock([
          '// api/employees.api.js',
          'import api from "./axios.config";',
          '',
          'export const employeesApi = {',
          '  getAll: (params) => api.get("/employees", { params }),',
          '  getById: (id) => api.get(`/employees/${id}`),',
          '  create: (data) => api.post("/employees", data),',
          '  update: (id, data) => api.put(`/employees/${id}`, data),',
          '  remove: (id) => api.delete(`/employees/${id}`),',
          '  import: (file) => {',
          '    const form = new FormData();',
          '    form.append("file", file);',
          '    return api.post("/employees/import", form, {',
          '      headers: { "Content-Type": "multipart/form-data" }',
          '    });',
          '  }',
          '};',
        ]),
        p(''),

        h2('Bloc 2.2 — Custom Hooks (10h30–11h30)'),
        h3('Hook useApi : Fetch générique'),
        codeBlock([
          '// hooks/useApi.js',
          'import { useState, useEffect, useCallback } from "react";',
          '',
          'export function useApi(apiFunc, immediate = true) {',
          '  const [data, setData] = useState(null);',
          '  const [loading, setLoading] = useState(false);',
          '  const [error, setError] = useState(null);',
          '',
          '  const execute = useCallback(async (...args) => {',
          '    setLoading(true);',
          '    setError(null);',
          '    try {',
          '      const res = await apiFunc(...args);',
          '      setData(res.data);',
          '      return res.data;',
          '    } catch (err) {',
          '      setError(err.response?.data?.message || err.message);',
          '      throw err;',
          '    } finally {',
          '      setLoading(false);',
          '    }',
          '  }, [apiFunc]);',
          '',
          '  useEffect(() => {',
          '    if (immediate) execute();',
          '  }, []);',
          '',
          '  return { data, loading, error, execute };',
          '}',
          '',
          '// Utilisation dans un composant :',
          'const { data: employees, loading, error, execute: refetch }',
          '  = useApi(employeesApi.getAll);',
        ]),
        p(''),

        h2('Bloc 2.3 — React Router v6 (11h30–12h00)'),
        codeBlock([
          '// App.jsx',
          'import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";',
          '',
          'function App() {',
          '  const { isAuthenticated } = useAuthStore();',
          '',
          '  return (',
          '    <BrowserRouter>',
          '      <Routes>',
          '        <Route path="/login" element={<LoginPage />} />',
          '        {/* Routes protégées */}',
          '        <Route element={<ProtectedRoute />}>',
          '          <Route element={<MainLayout />}>',
          '            <Route path="/" element={<Navigate to="/dashboard" />} />',
          '            <Route path="/dashboard" element={<Dashboard />} />',
          '            <Route path="/employees" element={<Employees />} />',
          '            <Route path="/employees/:id" element={<EmployeeDetail />} />',
          '            <Route path="/products" element={<Products />} />',
          '          </Route>',
          '        </Route>',
          '      </Routes>',
          '    </BrowserRouter>',
          '  );',
          '}',
          '',
          '// Route protégée',
          'function ProtectedRoute() {',
          '  const { isAuthenticated } = useAuthStore();',
          '  return isAuthenticated',
          '    ? <Outlet />',
          '    : <Navigate to="/login" replace />;',
          '}',
        ]),
        p(''),

        h2('Bloc 2.4 — État Global avec Zustand (13h00–14h30)'),
        codeBlock([
          '// store/authStore.js',
          'import { create } from "zustand";',
          'import { persist } from "zustand/middleware";',
          '',
          'export const useAuthStore = create(',
          '  persist(',
          '    (set, get) => ({',
          '      user: null,',
          '      token: null,',
          '      isAuthenticated: false,',
          '',
          '      login: async (email, password) => {',
          '        const res = await authApi.login(email, password);',
          '        set({',
          '          user: res.data.user,',
          '          token: res.data.token,',
          '          isAuthenticated: true,',
          '        });',
          '        localStorage.setItem("token", res.data.token);',
          '      },',
          '',
          '      logout: () => {',
          '        set({ user: null, token: null, isAuthenticated: false });',
          '        localStorage.removeItem("token");',
          '      },',
          '    }),',
          '    { name: "auth-storage" } // persisté dans localStorage',
          '  )',
          ');',
        ]),
        p(''),

        h2('Exercice Pratique Jour 2 (14h30–18h00)'),
        infoBox('🛠 TRAVAIL PRATIQUE', [
          '1. Configurer l\'instance axios avec interceptors',
          '2. Créer tous les services API (employees, products, orders)',
          '3. Implémenter useApi hook et l\'utiliser dans 3 pages',
          '4. Mettre en place React Router avec routes protégées',
          '5. Créer le store Zustand pour l\'auth',
          '6. Implémenter le CRUD complet des Employés',
          '7. Ajouter la pagination et le filtre de recherche',
          '8. Créer le formulaire d\'import CSV',
        ], COLORS.lightAccent, COLORS.accent),

        pageBreak(),
        // ─────── JOUR 3 ───────
        h1('JOUR 3 — Performance, Tests & Finalisation'),
        infoBox('OBJECTIFS DU JOUR 3', [
          '✓ Optimiser les performances (lazy loading, code splitting)',
          '✓ Créer un Dashboard avec graphiques (recharts/chart.js)',
          '✓ Gérer les formulaires complexes (React Hook Form)',
          '✓ Notions de tests unitaires (Jest + React Testing Library)',
          '✓ Déploiement et bonnes pratiques',
        ], COLORS.lightPurple, COLORS.purple),
        p(''),

        h2('Bloc 3.1 — Performance React (09h00–10h00)'),
        h3('React.memo & Code Splitting'),
        codeBlock([
          '// Éviter les re-rendus inutiles',
          'const EmployeeRow = React.memo(({ employee, onDelete }) => {',
          '  return <tr>...</tr>;',
          '});',
          '',
          '// Lazy loading des pages (code splitting)',
          'const Dashboard = lazy(() => import("./pages/Dashboard"));',
          'const Employees = lazy(() => import("./pages/Employees"));',
          '',
          '<Suspense fallback={<LoadingSpinner />}>',
          '  <Routes>',
          '    <Route path="/dashboard" element={<Dashboard />} />',
          '  </Routes>',
          '</Suspense>',
        ]),
        p(''),

        h2('Bloc 3.2 — React Hook Form (10h00–11h00)'),
        codeBlock([
          '// npm install react-hook-form',
          'import { useForm } from "react-hook-form";',
          '',
          'function EmployeeForm({ onSubmit, defaultValues }) {',
          '  const { register, handleSubmit, formState: { errors } } = useForm({',
          '    defaultValues',',
          '  });',
          '',
          '  return (',
          '    <form onSubmit={handleSubmit(onSubmit)}>',
          '      <input',
          '        {...register("name", {',
          '          required: "Le nom est obligatoire",',
          '          minLength: { value: 2, message: "Min 2 caractères" }',
          '        })}',
          '      />',
          '      {errors.name && <span>{errors.name.message}</span>}',
          '',
          '      <input',
          '        type="email"',
          '        {...register("email", {',
          '          required: true,',
          '          pattern: { value: /^[^@]+@[^@]+$/, message: "Email invalide" }',
          '        })}',
          '      />',
          '      <button type="submit">Enregistrer</button>',
          '    </form>',
          '  );',
          '}',
        ]),
        p(''),

        h2('Bloc 3.3 — Tests (11h00–12h00)'),
        codeBlock([
          '// Button.test.jsx',
          'import { render, screen, fireEvent } from "@testing-library/react";',
          'import Button from "./Button";',
          '',
          'describe("Button", () => {',
          '  test("affiche le texte enfant", () => {',
          '    render(<Button>Cliquez</Button>);',
          '    expect(screen.getByText("Cliquez")).toBeInTheDocument();',
          '  });',
          '',
          '  test("appelle onClick au clic", () => {',
          '    const handleClick = jest.fn();',
          '    render(<Button onClick={handleClick}>Clic</Button>);',
          '    fireEvent.click(screen.getByText("Clic"));',
          '    expect(handleClick).toHaveBeenCalledTimes(1);',
          '  });',
          '',
          '  test("est désactivé en mode loading", () => {',
          '    render(<Button loading>Chargement</Button>);',
          '    expect(screen.getByRole("button")).toBeDisabled();',
          '  });',
          '});',
        ]),
        p(''),

        h2('Exercice Final Jour 3 (13h00–17h00)'),
        infoBox('🛠 LIVRABLE FINAL', [
          '1. Dashboard complet avec 4 KPI cards et un graphique barres (commandes/mois)',
          '2. Page Produits avec recherche, filtres, pagination',
          '3. Import CSV fonctionnel avec retour visuel de progression',
          '4. Formulaire Employé avec React Hook Form + validation complète',
          '5. Tests unitaires pour au moins 3 composants',
          '6. Application déployée sur Vercel/Netlify (bonus)',
        ], COLORS.lightPurple, COLORS.purple),
      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('/home/claude/react-training/docs/01_Programme_React_3Jours.docx', buf);
  console.log('Doc 1 created');
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT 2: Évaluation Théorique (QCM + Q&A)
// ═══════════════════════════════════════════════════════════════
async function generateDoc2() {
  const doc = new Document({
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'letters', levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: '%1)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Arial', color: COLORS.accent }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 1440 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '📝', size: 72, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ÉVALUATION THÉORIQUE REACT', bold: true, size: 48, color: COLORS.primary, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Questions & Réponses Corrigées — 60 Questions — 100 Points', size: 24, color: COLORS.accent, font: 'Arial' })] }),
        separator(COLORS.accent),
        infoBox('CONSIGNES D\'ÉVALUATION', [
          'Total : 100 points | Durée suggérée : 2h',
          'Section A — Questions conceptuelles : 40 points (20 questions × 2 pts)',
          'Section B — Lecture de code : 30 points (10 questions × 3 pts)',
          'Section C — Architecture & Bonnes Pratiques : 30 points (10 questions × 3 pts)',
          'Seuil de réussite : 70/100',
        ], COLORS.light, COLORS.primary),
        p(''),

        // ─── SECTION A ───
        h1('SECTION A — Questions Conceptuelles (40 pts)'),
        h2('Thème 1 : Fondations React'),

        qaBox(
          'Quelle est la différence entre React et un framework comme Angular ?',
          'React est une BIBLIOTHÈQUE de rendu UI (pas un framework complet). Il gère uniquement la couche View. Angular est un framework complet avec routing, forms, HTTP intégrés. React laisse le choix des outils pour le routing (React Router), l\'état global (Zustand/Redux), etc.',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce que le Virtual DOM et pourquoi est-il utile ?',
          'Le Virtual DOM est une représentation JavaScript légère du DOM réel. React compare l\'ancien et le nouveau Virtual DOM (diffing/reconciliation) et ne met à jour que les éléments réellement modifiés dans le DOM réel. Cela évite des opérations DOM coûteuses et améliore les performances.',
          2
        ),
        p(''),
        qaBox(
          'Quelle est la règle fondamentale des Hooks React ?',
          'Les Hooks ne peuvent être appelés qu\'au NIVEAU SUPÉRIEUR d\'un composant (pas dans des conditions, boucles, ou fonctions imbriquées). Ils ne peuvent être utilisés que dans des composants fonctionnels React ou des Custom Hooks. Cette règle permet à React de maintenir l\'ordre des Hooks entre les rendus.',
          2
        ),
        p(''),
        qaBox(
          'Quelle est la différence entre un composant contrôlé et non-contrôlé ?',
          'Composant CONTRÔLÉ : la valeur est gérée par le state React (value + onChange). C\'est la méthode recommandée car React est la "source de vérité". Composant NON-CONTRÔLÉ : la valeur est gérée par le DOM via une ref (useRef). Utilisé pour des intégrations avec des bibliothèques non-React ou l\'upload de fichiers.',
          2
        ),
        p(''),
        qaBox(
          'À quoi sert le paramètre "key" dans les listes React ?',
          'La prop "key" aide React à identifier quel élément a changé, été ajouté ou supprimé dans une liste. Elle doit être UNIQUE parmi les frères. React l\'utilise pour optimiser le re-rendu en réutilisant les éléments existants. Ne jamais utiliser l\'index du tableau comme key si la liste peut être réordonnée — utiliser l\'ID de la donnée.',
          2
        ),
        p(''),

        h2('Thème 2 : Hooks'),
        qaBox(
          'Quelle est la différence entre useEffect avec [], [dep], et sans tableau ?',
          '• useEffect(fn, []) → s\'exécute UNE FOIS au montage du composant (équivalent componentDidMount)\n• useEffect(fn, [dep]) → s\'exécute au montage ET chaque fois que "dep" change\n• useEffect(fn) → s\'exécute après CHAQUE rendu (dangereux, peut créer des boucles infinies)\n• La fonction de retour = cleanup (démontage ou avant le prochain effet)',
          2
        ),
        p(''),
        qaBox(
          'Quand doit-on utiliser useMemo vs useCallback ?',
          'useMemo : mémoïse le RÉSULTAT d\'un calcul (valeur). Ex: filtrer 10 000 employés.\nuseCallback : mémoïse une RÉFÉRENCE de fonction (pour éviter de recréer la fonction à chaque rendu). Ex: une fonction passée en prop à un composant enfant React.memo.\nRègle : n\'utiliser que si la performance est réellement impactée (mesurer avant d\'optimiser).',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce qu\'un Custom Hook et quelles sont ses conventions de nommage ?',
          'Un Custom Hook est une fonction JavaScript qui utilise des Hooks React (useState, useEffect...) et encapsule de la logique réutilisable. Convention : DOIT commencer par "use" (useAuth, useApi, useDebounce). Permet de séparer la logique de l\'UI et de la partager entre composants sans répétition de code.',
          2
        ),
        p(''),
        qaBox(
          'Comment éviter une fuite mémoire dans useEffect lors d\'un fetch ?',
          'Utiliser un AbortController ou un flag isMounted. Exemple :\nconst controller = new AbortController();\nfetch(url, { signal: controller.signal });\nreturn () => controller.abort(); // cleanup\nSans nettoyage, si le composant est démonté avant la fin du fetch, setState sur un composant démonté provoque un warning (et potentiellement une fuite).',
          2
        ),
        p(''),
        qaBox(
          'Quelle est la différence entre useState et useReducer ?',
          'useState : pour un état simple (booléen, string, nombre). Adapté quand les transitions d\'état sont simples.\nuseReducer : pour un état complexe avec plusieurs sous-valeurs liées, ou quand la prochaine valeur dépend de la précédente selon une logique conditionnelle. Pattern similaire à Redux. useReducer(reducer, initialState) → [state, dispatch].',
          2
        ),
        p(''),

        h2('Thème 3 : Architecture & Patterns'),
        qaBox(
          'Qu\'est-ce que le "prop drilling" et comment le résoudre ?',
          'Le prop drilling = passer des props à travers plusieurs niveaux de composants intermédiaires qui n\'en ont pas besoin. Problème : couplage fort, maintenance difficile.\nSolutions : (1) Context API (useContext) pour un état partagé léger, (2) État global (Zustand, Redux) pour un état complexe partagé, (3) Restructurer les composants (composition).',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce que la composition de composants en React ?',
          'La composition = construire des composants complexes en combinant des composants simples. Pattern principal avec la prop "children". Ex : <Modal><EmployeeForm /></Modal>. Préférer la composition à l\'héritage (React recommande cela explicitement). Permet la flexibilité et la réutilisabilité sans couplage.',
          2
        ),
        p(''),
        qaBox(
          'Quelle est la différence entre Context API et Zustand pour l\'état global ?',
          'Context API : natif React, pas de dépendance. Inconvénient : tous les consommateurs re-rendent quand le contexte change (même si leur partie n\'a pas changé). Adapté pour données peu changeantes (thème, langue, user).\nZustand : bibliothèque légère, granularité fine (sélecteurs), ne re-rend que les composants qui utilisent la partie modifiée. Adapté pour état applicatif fréquemment mis à jour.',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce que React.memo et dans quel cas l\'utiliser ?',
          'React.memo est un Higher-Order Component qui mémoïse le résultat du rendu d\'un composant. Il ne re-rend le composant que si ses props ont changé (comparaison superficielle). Utile pour les composants enfants coûteux qui reçoivent les mêmes props fréquemment. Attention : n\'apporte un bénéfice que si le composant re-rend souvent avec les mêmes props.',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce que le lazy loading de composants et comment l\'implémenter ?',
          'Le lazy loading = charger le code d\'un composant à la demande (pas au chargement initial). Implémentation : const Dashboard = lazy(() => import("./Dashboard")). Requis avec Suspense pour afficher un fallback pendant le chargement. Réduit le bundle initial (code splitting automatique par Webpack/Vite).',
          2
        ),
        p(''),

        h2('Thème 4 : Écosystème React'),
        qaBox(
          'Qu\'est-ce que React Router v6 et comment fonctionnent les routes imbriquées ?',
          'React Router v6 est la bibliothèque standard de routing côté client. Routes imbriquées : les routes enfants sont définies dans une Route parente. Le composant parent utilise <Outlet /> pour rendre le composant enfant correspondant à l\'URL. Ex : /employees affiche la liste, /employees/5 affiche le détail, les deux partagent le même layout parent.',
          2
        ),
        p(''),
        qaBox(
          'Quels sont les avantages d\'axios par rapport à fetch natif ?',
          '1. Intercepteurs (request/response) pour ajouter des headers, gérer les 401 globalement\n2. Transformation automatique JSON (pas besoin de .json())\n3. Annulation de requêtes avec CancelToken\n4. Support des timeout natif\n5. Meilleure gestion des erreurs HTTP (fetch ne rejette pas pour les 4xx/5xx)\n6. baseURL configurable\n7. Mocking facile pour les tests',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce que React Hook Form et pourquoi l\'utiliser ?',
          'Bibliothèque de gestion de formulaires qui minimise les re-rendus en utilisant des refs plutôt que du state. Avantages : performances supérieures (pas de re-render à chaque frappe), validation intégrée (native HTML + custom + Yup/Zod), gestion simple des erreurs, intégration facile avec des composants UI tiers. Méthodes clés : register, handleSubmit, formState, watch, reset.',
          2
        ),
        p(''),
        qaBox(
          'Comment React gère-t-il le rendu côté serveur (SSR) et quel est son intérêt ?',
          'Le SSR (Server-Side Rendering) = générer le HTML de la page sur le serveur avant de l\'envoyer au client. Avec Next.js (basé sur React), le rendu initial arrive en HTML complet. Avantages : meilleur SEO (les robots voient le contenu), Time To First Contentful Paint plus rapide, performances perçues améliorées. Hydratation = React prend ensuite le contrôle côté client.',
          2
        ),
        p(''),
        qaBox(
          'Qu\'est-ce qu\'un Higher-Order Component (HOC) ?',
          'Un HOC est une fonction qui prend un composant en entrée et retourne un nouveau composant amélioré. Pattern hérité de React class components, moins utilisé avec les Hooks. Ex : const withAuth = (Component) => (props) => isAuth ? <Component {...props} /> : <Redirect />. Aujourd\'hui, les Custom Hooks remplacent avantageusement la plupart des HOCs.',
          2
        ),
        p(''),
        qaBox(
          'Quelle est la différence entre useLayoutEffect et useEffect ?',
          'useEffect : s\'exécute de manière ASYNCHRONE après que le navigateur ait peint l\'écran. Adapté pour la majorité des cas (fetch data, abonnements).\nuseLayoutEffect : s\'exécute de manière SYNCHRONE après les mutations DOM mais AVANT que le navigateur peigne. Adapté pour mesurer des éléments DOM ou effectuer des mutations DOM qui doivent être invisibles à l\'utilisateur.',
          2
        ),
        p(''),

        pageBreak(),
        // ─── SECTION B ───
        h1('SECTION B — Lecture de Code (30 pts)'),
        infoBox('INSTRUCTIONS', [
          'Pour chaque extrait de code, identifiez le problème, expliquez pourquoi, et proposez la correction.'
        ], COLORS.lightAccent, COLORS.accent),
        p(''),

        h3('Question B1 (3 pts) — Identifiez le bug :'),
        codeBlock([
          'function ProductList() {',
          '  const [products, setProducts] = useState([]);',
          '',
          '  useEffect(() => {',
          '    fetch("/api/products")',
          '      .then(res => res.json())',
          '      .then(data => setProducts(data));',
          '  }); // ← pas de tableau de dépendances',
          '',
          '  return <ul>{products.map(p => <li>{p.name}</li>)}</ul>;',
          '}',
        ]),
        qaBox(
          'Quel est le problème dans ce code ?',
          'PROBLÈME 1 : useEffect sans tableau de dépendances → s\'exécute après CHAQUE rendu. setProducts déclenche un re-rendu → nouvelle exécution du useEffect → boucle infinie de requêtes réseau !\nPROBLÈME 2 : La liste n\'a pas de prop "key" → warning React, performances dégradées.\nCORRECTION : useEffect(() => { ... }, []) et <li key={p.id}>{p.name}</li>',
          3
        ),
        p(''),

        h3('Question B2 (3 pts) — Identifiez le bug :'),
        codeBlock([
          'function Counter() {',
          '  const [count, setCount] = useState(0);',
          '',
          '  const handleClick = () => {',
          '    setCount(count + 1);',
          '    setCount(count + 1);',
          '    setCount(count + 1);',
          '  };',
          '',
          '  return <button onClick={handleClick}>{count}</button>;',
          '}',
        ]),
        qaBox(
          'Combien vaut count après le clic et pourquoi ?',
          'RÉPONSE : count augmente de 1, pas de 3. Le problème : les 3 appels à setCount utilisent la même valeur stale de "count" (ex: 0). Chaque appel calcule 0+1=1. React batche les 3 mises à jour et applique count=1.\nCORRECTION : utiliser la forme fonctionnelle : setCount(prev => prev + 1). Ainsi chaque appel reçoit la valeur précédente à jour → count augmente bien de 3.',
          3
        ),
        p(''),

        h3('Question B3 (3 pts) — Analysez ce Custom Hook :'),
        codeBlock([
          'function useLocalStorage(key, initialValue) {',
          '  const [storedValue, setStoredValue] = useState(() => {',
          '    try {',
          '      const item = window.localStorage.getItem(key);',
          '      return item ? JSON.parse(item) : initialValue;',
          '    } catch (error) {',
          '      return initialValue;',
          '    }',
          '  });',
          '',
          '  const setValue = (value) => {',
          '    try {',
          '      setStoredValue(value);',
          '      window.localStorage.setItem(key, JSON.stringify(value));',
          '    } catch (error) {',
          '      console.error(error);',
          '    }',
          '  };',
          '',
          '  return [storedValue, setValue];',
          '}',
        ]),
        qaBox(
          'Expliquez ce que fait ce Hook et identifiez une limitation.',
          'Ce Hook synchronise une valeur de state React avec localStorage. Il utilise l\'initialisation lazy de useState (fonction) pour lire localStorage une seule fois. Il retourne [valeur, setter] comme useState.\nLIMITATION : Si la clé "key" change entre les rendus, le Hook ne se re-synchronise pas (pas de useEffect sur [key]). Autre limitation : les changements faits dans un autre onglet ne sont pas reflétés (il faudrait écouter l\'événement "storage").',
          3
        ),
        p(''),

        h3('Question B4 (3 pts) — Optimisation nécessaire ?'),
        codeBlock([
          'function EmployeeList({ employees, onDelete }) {',
          '  const sorted = employees.sort((a, b) =>',
          '    a.name.localeCompare(b.name)',
          '  );',
          '',
          '  return (',
          '    <ul>',
          '      {sorted.map(emp => (',
          '        <EmployeeRow key={emp.id} employee={emp} onDelete={onDelete} />',
          '      ))}',
          '    </ul>',
          '  );',
          '}',
        ]),
        qaBox(
          'Identifiez 2 problèmes de performance et proposez les corrections.',
          'PROBLÈME 1 : .sort() MUTE le tableau original (employees). Correction : [...employees].sort(...) ou employees.slice().sort(...).\nPROBLÈME 2 : Le tri est recalculé à CHAQUE rendu même si employees n\'a pas changé. Correction : encapsuler dans useMemo.\nconst sorted = useMemo(() => [...employees].sort((a,b) => a.name.localeCompare(b.name)), [employees]);\nPROBLÈME BONUS : Si EmployeeRow n\'est pas mémoïsé avec React.memo, il re-rend à chaque fois que onDelete change de référence. Utiliser useCallback pour onDelete dans le parent.',
          3
        ),
        p(''),

        h3('Question B5 (3 pts) — Context API :'),
        codeBlock([
          'const ThemeContext = createContext("light");',
          '',
          'function App() {',
          '  const [theme, setTheme] = useState("light");',
          '',
          '  return (',
          '    <ThemeContext.Provider value={theme}>',
          '      <Button onClick={() => setTheme("dark")}>Mode sombre</Button>',
          '      <MainContent />',
          '    </ThemeContext.Provider>',
          '  );',
          '}',
          '',
          'function ThemedDiv() {',
          '  const theme = useContext(ThemeContext);',
          '  return <div className={theme}>Contenu</div>;',
          '}',
        ]),
        qaBox(
          'Ce code fonctionne-t-il ? Quelle amélioration apporter ?',
          'Le code fonctionne mais a une limitation : le Provider ne fournit que la valeur du thème, pas la fonction pour le modifier. Les enfants ne peuvent pas changer le thème eux-mêmes.\nAMÉLIORATION : Passer un objet { theme, setTheme } comme value, ou mieux, créer un contexte avec la valeur ET le setter : value={{ theme, toggleTheme }}. Créer un hook useTheme() personnalisé qui vérifie que le contexte existe avant de l\'utiliser.',
          3
        ),
        p(''),

        h3('Questions B6-B10 (3 pts chacune)'),
        qaBox(
          'B6 : Qu\'est-ce que le "Stale Closure" dans un useEffect et comment l\'éviter ?',
          'Un stale closure = une closure (fermeture) qui capture une ancienne valeur d\'une variable d\'état. Ex : un setInterval dans useEffect[] capture count=0 et ne voit jamais les mises à jour. Solutions : (1) Passer la variable dans le tableau de dépendances pour re-créer l\'effet, (2) Utiliser useRef pour stocker la valeur mutable, (3) Utiliser la forme fonctionnelle du setter setState(prev => prev + 1).',
          3
        ),
        p(''),
        qaBox(
          'B7 : Expliquez l\'ordre d\'exécution React quand un state change.',
          '1. setState() est appelé → React planifie un re-rendu (batching possible)\n2. React appelle la fonction du composant (re-render)\n3. React compare le nouveau Virtual DOM avec l\'ancien (reconciliation/diffing)\n4. React applique les changements minimaux au DOM réel (commit)\n5. Le navigateur peint\n6. useLayoutEffect s\'exécute (synchrone, avant peinture)\n7. useEffect s\'exécute (asynchrone, après peinture)',
          3
        ),
        p(''),
        qaBox(
          'B8 : Quelle est la différence entre un appel API dans le composant vs dans le store Zustand ?',
          'Dans le composant : logique couplée à l\'UI, difficile à tester et réutiliser. Si le composant est démonté, on peut avoir des setState sur composant démonté.\nDans le store : logique séparée de l\'UI, facilement testable, partageable entre composants, centralisée. Le store gère les états loading/error/data. Meilleure pratique : actions async dans le store, composant n\'appelle que store.fetchEmployees() et lit store.employees.',
          3
        ),
        p(''),
        qaBox(
          'B9 : Comment implémenter un debounce sur une recherche en React ?',
          'Approche 1 — Custom Hook useDebounce :\nconst debouncedSearch = useDebounce(searchTerm, 500);\nuseEffect(() => { if (debouncedSearch) fetchResults(debouncedSearch); }, [debouncedSearch]);\nLe hook useDebounce utilise useEffect + setTimeout + clearTimeout pour ne retourner la valeur que si elle est stable depuis 500ms.\nApproche 2 — useRef avec clearTimeout directement dans le onChange handler.',
          3
        ),
        p(''),
        qaBox(
          'B10 : Comment gérer l\'upload de fichier CSV et afficher la progression ?',
          'Utiliser axios avec la config onUploadProgress :\naxios.post("/import", formData, {\n  onUploadProgress: (progressEvent) => {\n    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);\n    setProgress(percent);\n  }\n});\nAfficher une barre de progression avec la valeur "progress". Pour un import en deux temps (upload puis traitement), utiliser un polling sur le statut ou des WebSockets.',
          3
        ),
        p(''),

        pageBreak(),
        // ─── SECTION C ───
        h1('SECTION C — Architecture & Bonnes Pratiques (30 pts)'),

        qaBox(
          'C1 (3 pts) : Structurez le store Zustand pour une app ERP avec auth, employees et UI state.',
          'Créer des stores SÉPARÉS (séparation des responsabilités) :\n1. useAuthStore : { user, token, isAuthenticated, login(), logout() }\n2. useEmployeesStore : { employees, loading, error, fetchAll(), create(), update(), remove() }\n3. useUIStore : { sidebarOpen, theme, notifications[], addNotification(), clearAll() }\nAvantage : les composants ne s\'abonnent qu\'au store dont ils ont besoin. Avec Zustand, utiliser des sélecteurs : const user = useAuthStore(state => state.user) pour éviter les re-rendus inutiles.',
          3
        ),
        p(''),
        qaBox(
          'C2 (3 pts) : Comment protéger les routes et gérer les rôles (admin/user) ?',
          'Créer un composant ProtectedRoute qui vérifie isAuthenticated et le rôle :\nfunction RoleRoute({ allowedRoles, children }) {\n  const { user } = useAuthStore();\n  if (!user) return <Navigate to="/login" />;\n  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;\n  return children;\n}\nUtilisation : <RoleRoute allowedRoles={["admin"]}><AdminPanel /></RoleRoute>.\nLe rôle vient du JWT décodé ou du profil utilisateur stocké dans le store.',
          3
        ),
        p(''),
        qaBox(
          'C3 (3 pts) : Comment gérer les erreurs API de manière centralisée ?',
          '1. Intercepteur Axios response : capture les erreurs réseau et HTTP globalement\n2. Error Boundary React : composant qui catch les erreurs de rendu (componentDidCatch)\n3. Toast/Notification store : useUIStore avec addNotification() appelé depuis les interceptors\n4. Codes d\'erreur standardisés : 401 → redirect login, 403 → unauthorized page, 404 → not found, 500 → erreur serveur avec message générique\nNe jamais afficher les messages d\'erreur techniques aux utilisateurs en production.',
          3
        ),
        p(''),
        qaBox(
          'C4 (3 pts) : Comment implémenter la pagination côté serveur avec React ?',
          'État : const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(0);\nAPI : employeesApi.getAll({ page, limit: 20, search: debouncedSearch })\nLe backend retourne { data: [], total: 150, page: 1, totalPages: 8 }\nuseEffect sur [page, debouncedSearch] pour refetch.\nComposant Pagination : reçoit { page, totalPages, onPageChange }.\nBonus : garder les données précédentes en mémoire (keepPreviousData) pour éviter le flash de contenu vide.',
          3
        ),
        p(''),
        qaBox(
          'C5 (3 pts) : Quelles sont les bonnes pratiques de nommage et d\'organisation des fichiers React ?',
          'Composants : PascalCase (EmployeeForm.jsx)\nHooks : camelCase préfixé use (useEmployees.js)\nStores : camelCase suffixé Store (authStore.js)\nUtils : camelCase (formatDate.js)\nAPI : camelCase suffixé Api (employeesApi.js)\nConvention de fichiers : un composant = un fichier. Si un composant a un test et des styles, créer un dossier : /EmployeeForm/index.jsx, EmployeeForm.test.jsx.\nRegrouper par FONCTIONNALITÉ (feature folders) plutôt que par type pour les grandes apps.',
          3
        ),
        p(''),
        qaBox(
          'C6 (3 pts) : Comment tester un composant qui fait des appels API ?',
          'Mocker l\'API avec jest.mock() ou msw (Mock Service Worker) :\n1. jest.mock("../api/employees") puis jest.fn().mockResolvedValue({ data: [...] })\n2. Avec MSW : définir des handlers qui interceptent les vraies requêtes HTTP en test\nUtiliser renderWithProviders() qui wrappe avec BrowserRouter et les stores.\nTester le comportement utilisateur, pas l\'implémentation (ce que voit l\'utilisateur).\nExemple : render(<EmployeeList />); await waitFor(() => screen.getByText("Alice"));',
          3
        ),
        p(''),
        qaBox(
          'C7 (3 pts) : Comment optimiser une liste de 10 000 éléments en React ?',
          'VIRTUALISATION : n\'afficher que les éléments visibles à l\'écran. Bibliothèques : react-window ou react-virtual. FixedSizeList de react-window ne monte que ~20 lignes dans le DOM même pour 10 000 éléments.\nAutres optimisations : pagination (éviter le problème à la source), React.memo sur les lignes, useCallback pour les handlers de chaque ligne, éviter les re-rendus du parent inutiles.',
          3
        ),
        p(''),
        qaBox(
          'C8 (3 pts) : Qu\'est-ce que l\'accessibilité (a11y) dans le contexte React ?',
          'L\'accessibilité = rendre l\'app utilisable par tous (personnes en situation de handicap, lecteurs d\'écran).\nBonnes pratiques React : utiliser des éléments HTML sémantiques (<button> pas <div onClick>), attributs ARIA (aria-label, role, aria-live), gestion du focus (useRef + .focus() après une modal), contraste des couleurs suffisant, navigation clavier complète.\nOutils : axe-core, react-axe (développement), Lighthouse (audit), eslint-plugin-jsx-a11y.',
          3
        ),
        p(''),
        qaBox(
          'C9 (3 pts) : Comment gérer les variables d\'environnement dans une app React ?',
          'Create React App : .env → préfixe OBLIGATOIRE REACT_APP_. Ex : REACT_APP_API_URL=http://localhost:3001\nVite : .env → préfixe VITE_. Ex : VITE_API_URL=http://localhost:3001\nAccessibles dans le code : process.env.REACT_APP_API_URL (CRA) ou import.meta.env.VITE_API_URL (Vite)\nFichiers : .env (tous), .env.local (ignoré Git), .env.production (prod), .env.development (dev)\nNE JAMAIS mettre de secrets (clés API privées) dans une app React front (tout est visible côté client).',
          3
        ),
        p(''),
        qaBox(
          'C10 (3 pts) : Citez 5 bonnes pratiques pour une app React en production.',
          '1. Code splitting + lazy loading : bundles initiaux < 300KB\n2. Error Boundaries sur les sections critiques pour éviter le crash total\n3. Variables d\'environnement pour toutes les URLs/configs\n4. HTTPS uniquement + token JWT dans httpOnly cookies (pas localStorage pour les données sensibles)\n5. Loading/Error states sur TOUTES les opérations async (jamais d\'écran blanc)\nBonus : React Query ou SWR pour le cache et la synchronisation des données, tests automatisés (>70% coverage), monitoring (Sentry).',
          3
        ),

        pageBreak(),
        h1('GRILLE D\'ÉVALUATION'),
        twoColTable(
          ['Score', 'Mention', 'Appréciation'],
          [
            ['90 – 100', 'Excellent', 'Maîtrise complète — prêt pour la production'],
            ['80 – 89', 'Très Bien', 'Solide — quelques nuances à approfondir'],
            ['70 – 79', 'Bien', 'Bases maîtrisées — continuer la pratique'],
            ['60 – 69', 'Passable', 'Lacunes importantes — révision nécessaire'],
            ['< 60', 'Insuffisant', 'Formation à reprendre — manque de fondamentaux'],
          ],
          [2000, 2000, 5360]
        ),
      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('/home/claude/react-training/docs/02_Evaluation_Theorique_QA.docx', buf);
  console.log('Doc 2 created');
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT 3: Guide Projet Pratique
// ═══════════════════════════════════════════════════════════════
async function generateDoc3() {
  const doc = new Document({
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: 'Arial', color: COLORS.primary }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Arial', color: COLORS.accent }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 1440 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '🛠', size: 72, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GUIDE PROJET PRATIQUE', bold: true, size: 48, color: COLORS.primary, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ERP-Connect — Instructions & Évaluation Pratique', size: 24, color: COLORS.accent, font: 'Arial' })] }),
        separator(COLORS.accent),
        p(''),

        h1('ÉTAPE 1 — Initialisation du Projet'),
        h2('Commandes de démarrage'),
        codeBlock([
          '# 1. Créer le projet React avec Vite (recommandé)',
          'npm create vite@latest erp-connect -- --template react',
          'cd erp-connect',
          '',
          '# 2. Installer les dépendances',
          'npm install axios react-router-dom zustand',
          'npm install react-hook-form recharts',
          'npm install -D json-server concurrently',
          '',
          '# 3. Lancer le projet',
          'npm run dev',
          '',
          '# Dans un autre terminal : lancer le backend mock',
          'npx json-server --watch db.json --port 3001',
        ]),
        p(''),

        h2('Base de données mock (db.json)'),
        p('Créer le fichier db.json à la racine du projet :'),
        codeBlock([
          '{',
          '  "employees": [',
          '    { "id": 1, "name": "Alice Martin", "email": "alice@erp.com", "department": "RH", "role": "Manager", "salary": 55000, "status": "active" },',
          '    { "id": 2, "name": "Bob Dupont", "email": "bob@erp.com", "department": "IT", "role": "Developer", "salary": 48000, "status": "active" },',
          '    { "id": 3, "name": "Carol Simon", "email": "carol@erp.com", "department": "Finance", "role": "Analyst", "salary": 52000, "status": "inactive" }',
          '  ],',
          '  "products": [',
          '    { "id": 1, "name": "Ordinateur Dell", "sku": "PC-001", "price": 899.99, "stock": 25, "category": "Informatique" },',
          '    { "id": 2, "name": "Chaise Ergonomique", "sku": "MB-002", "price": 349.99, "stock": 8, "category": "Mobilier" }',
          '  ],',
          '  "orders": [',
          '    { "id": 1, "reference": "CMD-2024-001", "employeeId": 1, "total": 1249.98, "status": "delivered", "date": "2024-01-15" },',
          '    { "id": 2, "reference": "CMD-2024-002", "employeeId": 2, "total": 349.99, "status": "pending", "date": "2024-01-20" }',
          '  ],',
          '  "users": [',
          '    { "id": 1, "email": "admin@erp.com", "password": "admin123", "role": "admin", "name": "Admin ERP" }',
          '  ]',
          '}',
        ]),
        p(''),

        pageBreak(),
        h1('ÉTAPE 2 — Structure de Code à Implémenter'),

        h2('2.1 Configuration Axios (src/api/axios.config.js)'),
        codeBlock([
          'import axios from "axios";',
          '',
          'const api = axios.create({',
          '  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",',
          '  timeout: 10000,',
          '});',
          '',
          'api.interceptors.request.use((config) => {',
          '  const token = localStorage.getItem("erp_token");',
          '  if (token) config.headers.Authorization = `Bearer ${token}`;',
          '  return config;',
          '});',
          '',
          'api.interceptors.response.use(',
          '  (res) => res,',
          '  (err) => {',
          '    if (err.response?.status === 401) {',
          '      localStorage.removeItem("erp_token");',
          '      window.location.href = "/login";',
          '    }',
          '    return Promise.reject(err);',
          '  }',
          ');',
          '',
          'export default api;',
        ]),
        p(''),

        h2('2.2 Store Auth Zustand (src/store/authStore.js)'),
        codeBlock([
          'import { create } from "zustand";',
          'import { persist } from "zustand/middleware";',
          'import api from "../api/axios.config";',
          '',
          'export const useAuthStore = create(',
          '  persist(',
          '    (set) => ({',
          '      user: null,',
          '      isAuthenticated: false,',
          '',
          '      login: async (email, password) => {',
          '        // json-server ne gère pas auth, on simule',
          '        const res = await api.get(`/users?email=${email}&password=${password}`);',
          '        if (res.data.length === 0) throw new Error("Identifiants incorrects");',
          '        const user = res.data[0];',
          '        localStorage.setItem("erp_token", "mock-jwt-token");',
          '        set({ user, isAuthenticated: true });',
          '        return user;',
          '      },',
          '',
          '      logout: () => {',
          '        localStorage.removeItem("erp_token");',
          '        set({ user: null, isAuthenticated: false });',
          '      },',
          '    }),',
          '    { name: "erp-auth" }',
          '  )',
          ');',
        ]),
        p(''),

        h2('2.3 Hook useEmployees (src/hooks/useEmployees.js)'),
        codeBlock([
          'import { useState, useEffect, useCallback, useMemo } from "react";',
          'import api from "../api/axios.config";',
          '',
          'export function useEmployees() {',
          '  const [employees, setEmployees] = useState([]);',
          '  const [loading, setLoading] = useState(true);',
          '  const [error, setError] = useState(null);',
          '  const [search, setSearch] = useState("");',
          '',
          '  const fetchAll = useCallback(async () => {',
          '    setLoading(true);',
          '    try {',
          '      const res = await api.get("/employees");',
          '      setEmployees(res.data);',
          '    } catch (e) {',
          '      setError(e.message);',
          '    } finally {',
          '      setLoading(false);',
          '    }',
          '  }, []);',
          '',
          '  useEffect(() => { fetchAll(); }, [fetchAll]);',
          '',
          '  const filtered = useMemo(() =>',
          '    employees.filter(e =>',
          '      e.name.toLowerCase().includes(search.toLowerCase()) ||',
          '      e.department.toLowerCase().includes(search.toLowerCase())',
          '    ), [employees, search]',
          '  );',
          '',
          '  const create = async (data) => {',
          '    await api.post("/employees", data);',
          '    await fetchAll();',
          '  };',
          '',
          '  const remove = async (id) => {',
          '    await api.delete(`/employees/${id}`);',
          '    setEmployees(prev => prev.filter(e => e.id !== id));',
          '  };',
          '',
          '  return { employees: filtered, loading, error, search, setSearch, create, remove, refetch: fetchAll };',
          '}',
        ]),
        p(''),

        pageBreak(),
        h1('ÉVALUATION PRATIQUE — Critères de Notation'),
        infoBox('BARÈME TOTAL : 100 POINTS', [
          'Fonctionnalités : 50 pts | Code Quality : 30 pts | UI/UX : 20 pts'
        ], COLORS.light, COLORS.primary),
        p(''),

        h2('Module 1 : Authentification (15 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['Formulaire Login fonctionnel', '5', 'Connexion avec email/password, gestion erreurs'],
            ['Store Zustand auth', '5', 'user, isAuthenticated, login(), logout()'],
            ['Routes protégées', '5', 'Redirection vers /login si non authentifié'],
          ],
          [4500, 1000, 3860]
        ),
        p(''),

        h2('Module 2 : Gestion des Employés (20 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['Liste avec données réelles', '4', 'Fetch API + affichage tableau'],
            ['Recherche/filtre temps réel', '4', 'useMemo ou debounce'],
            ['Création d\'employé', '4', 'Formulaire + POST API + refresh liste'],
            ['Suppression avec confirmation', '4', 'DELETE API + modal confirmation'],
            ['Gestion loading/error states', '4', 'Spinner, message d\'erreur, état vide'],
          ],
          [4000, 1000, 4360]
        ),
        p(''),

        h2('Module 3 : Dashboard (10 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['4 cartes KPI', '4', 'Total employés, produits, commandes, CA'],
            ['Graphique (recharts)', '6', 'BarChart ou LineChart avec données réelles'],
          ],
          [4000, 1000, 4360]
        ),
        p(''),

        h2('Module 4 : Routing & Navigation (5 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['React Router v6 configuré', '2', 'Routes imbriquées, layout partagé'],
            ['Sidebar/Nav fonctionnelle', '3', 'Liens actifs, navigation correcte'],
          ],
          [4000, 1000, 4360]
        ),
        p(''),

        h2('Qualité du Code (30 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['Séparation responsabilités', '8', 'api/, hooks/, store/, components/, pages/'],
            ['Custom Hook useApi ou similaire', '7', 'Logique réutilisable extraite'],
            ['Pas de prop drilling', '5', 'Zustand ou Context pour données partagées'],
            ['Gestion erreurs cohérente', '5', 'Try/catch partout, messages explicites'],
            ['Code lisible et commenté', '5', 'Nommage clair, pas de code mort'],
          ],
          [4500, 1000, 3860]
        ),
        p(''),

        h2('UI/UX (20 pts)'),
        twoColTable(
          ['Critère', 'Points', 'Détails'],
          [
            ['Design cohérent', '8', 'Palette, typographie, espacements'],
            ['Responsive (mobile)', '6', 'Lisible sur 375px et 1200px'],
            ['Feedback utilisateur', '6', 'Loading spinners, toasts, confirmations'],
          ],
          [4000, 1000, 4360]
        ),
        p(''),

        pageBreak(),
        h1('CHECKLIST FINALE — Avant de Soumettre'),
        infoBox('VÉRIFICATIONS OBLIGATOIRES', [
          '□ npm run dev lance l\'app sans erreurs',
          '□ json-server est lancé sur le port 3001',
          '□ Le login fonctionne avec admin@erp.com / admin123',
          '□ La liste des employés s\'affiche avec données réelles',
          '□ La recherche filtre en temps réel',
          '□ On peut ajouter et supprimer un employé',
          '□ Le dashboard affiche au moins 2 KPIs et un graphique',
          '□ La déconnexion redirige vers /login',
          '□ Aucun console.error dans la console du navigateur',
          '□ L\'app est responsive (tester sur mobile)',
        ], COLORS.lightGreen, COLORS.green),
        p(''),

        h1('RESSOURCES & DOCUMENTATION'),
        twoColTable(
          ['Ressource', 'URL'],
          [
            ['React Docs Officiel', 'https://react.dev'],
            ['React Router v6', 'https://reactrouter.com/en/main'],
            ['Zustand', 'https://zustand-demo.pmnd.rs'],
            ['Axios', 'https://axios-http.com/docs/intro'],
            ['React Hook Form', 'https://react-hook-form.com'],
            ['Recharts', 'https://recharts.org'],
            ['JSON Server', 'https://github.com/typicode/json-server'],
            ['Tailwind CSS', 'https://tailwindcss.com/docs'],
          ],
          [3000, 6360]
        ),
      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('/home/claude/react-training/docs/03_Guide_Projet_Pratique.docx', buf);
  console.log('Doc 3 created');
}

// Run all
(async () => {
  await generateDoc1();
  await generateDoc2();
  await generateDoc3();
  console.log('All documents generated!');
})();