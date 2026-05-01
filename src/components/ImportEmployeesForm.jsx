import { useState } from "react";
import { employeesApi } from "../api/employees.api";
import { parseCSV, validateEmployee } from "../utils/csvParser";
import Button from "./ui/Button";
import "../styles/import-form.css";

function ImportEmployeesForm({ onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const requiredColumns = ['name', 'email', 'department', 'role', 'salary', 'status'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    setError(null);
    setValidationErrors([]);
    setFile(selectedFile);

    // Lire et parser le fichier
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const { data, errors: parseErrors } = parseCSV(csv, requiredColumns);

        if (parseErrors.length > 0) {
          setError(parseErrors[0]);
          setPreview(null);
          return;
        }

        // Valider chaque ligne
        const validationResults = [];
        let hasErrors = false;

        const validatedData = data.map((row, index) => {
          const { isValid, errors } = validateEmployee(row);

          if (!isValid) {
            hasErrors = true;
            validationResults.push({
              row: index + 2, // +2 car index 0 est l'en-tête, +1 pour numéro de ligne
              name: row.name,
              errors
            });
          }

          return {
            ...row,
            isValid,
            errors
          };
        });

        if (hasErrors) {
          setValidationErrors(validationResults);
        }

        setPreview({
          total: data.length,
          valid: data.filter(d => validateEmployee(d).isValid).length,
          data: validatedData.slice(0, 5) // Afficher les 5 premiers pour l'aperçu
        });
      } catch (err) {
        setError(`Erreur lors de la lecture du fichier: ${err.message}`);
        setPreview(null);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Lire le contenu du fichier et parser les données
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target.result;
          const { data, errors: parseErrors } = parseCSV(csv, requiredColumns);

          if (parseErrors.length > 0) {
            setError(parseErrors[0]);
            setLoading(false);
            return;
          }

          // Transformer les données pour l'API
          const employeesToImport = data.map(row => ({
            name: row.name,
            email: row.email,
            department: row.department,
            role: row.role,
            salary: parseInt(row.salary, 10),
            status: row.status?.toLowerCase() || 'active'
          }));

          // Importer chaque employé
          let imported = 0;
          for (const employee of employeesToImport) {
            try {
              await employeesApi.create(employee);
              imported++;
            } catch (err) {
              console.error(`Erreur lors de l'import de ${employee.name}:`, err);
            }
          }

          setFile(null);
          setPreview(null);
          setValidationErrors([]);

          onSuccess?.({ imported, total: employeesToImport.length });
        } catch (err) {
          setError(`Erreur lors du traitement du fichier: ${err.message}`);
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'import des employés");
      setLoading(false);
    }
  };

  return (
    <div className="import-form-container">
      <h2>Importer des employés (CSV)</h2>

      {error && (
        <div className="import-error">
          ✗ {error}
        </div>
      )}

      <div className="import-info">
        <p>Colonnes requises: <strong>{requiredColumns.join(', ')}</strong></p>
        <p>Format CSV accepté: </p>
        <p style={{ marginLeft: "20px", fontFamily: "monospace" }}>name,email,department,role,salary,status</p>
        <p style={{ marginLeft: "20px", fontFamily: "monospace" }}>OU: name;email;department;role;salary;status</p>
      </div>

      <div className="file-input-group">
        <label htmlFor="csv-file">Sélectionner un fichier CSV</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className="file-input"
        />
      </div>

      {preview && (
        <div className="import-preview">
          <h3>Aperçu de l'import</h3>
          <div className="preview-stats">
            <div className="stat">
              <span className="label">Total</span>
              <span className="value">{preview.total}</span>
            </div>
            <div className="stat">
              <span className="label">Valides</span>
              <span className="value valid">{preview.valid}</span>
            </div>
            <div className="stat">
              <span className="label">Invalides</span>
              <span className="value invalid">{preview.total - preview.valid}</span>
            </div>
          </div>

          {preview.data.length > 0 && (
            <div className="preview-table">
              <h4>Premières entrées:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Département</th>
                    <th>Poste</th>
                    <th>Salaire</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.data.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? '' : 'invalid-row'}>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.department}</td>
                      <td>{row.role}</td>
                      <td>{row.salary}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="validation-errors">
              <h4>Erreurs de validation:</h4>
              <ul>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>
                    <strong>Ligne {err.row} ({err.name}):</strong> {err.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="import-actions">
            <Button
              variant={preview.valid === preview.total ? "primary" : "outline"}
              onClick={handleImport}
              disabled={loading || preview.valid === 0}
            >
              {loading ? "Import en cours..." : `Importer ${preview.valid} employé(s)`}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {!preview && (
        <div className="import-actions">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImportEmployeesForm;
