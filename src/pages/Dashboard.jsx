import { useState, useEffect } from "react";
import api from "../api/axios.config";
import "../styles/Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    employees: [],
    products: [],
    orders: [],
    totalEmployees: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    lowStockProducts: 0,
    departmentDistribution: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, productsRes, ordersRes] = await Promise.all([
        api.get("/employees"),
        api.get("/products"),
        api.get("/orders")
      ]);

      const employees = employeesRes.data;
      const products = productsRes.data;
      const orders = ordersRes.data;

      // Calculer les statistiques
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(e => e.status === "active").length;
      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.stock < 10).length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      // Distribution par département
      const deptMap = {};
      employees.forEach(emp => {
        deptMap[emp.department] = (deptMap[emp.department] || 0) + 1;
      });
      const departmentDistribution = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
      
      // Calcul du max pour les barres de progression
      const maxDept = Math.max(...departmentDistribution.map(d => d.value), 1);

      // Revenus mensuels
      const monthlyMap = {};
      orders.forEach(order => {
        const month = new Date(order.date).toLocaleString('fr', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + order.total;
      });
      const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));
      const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

      setStats({
        employees,
        products,
        orders,
        totalEmployees,
        totalProducts,
        totalOrders,
        totalRevenue,
        activeEmployees,
        lowStockProducts,
        departmentDistribution,
        monthlyRevenue,
        maxDept,
        maxRevenue
      });
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement du dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>📊 Tableau de Bord ERP Connect</h1>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalEmployees}</h3>
            <p>Employés</p>
            <small>{stats.activeEmployees} actifs</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Produits</p>
            <small>{stats.lowStockProducts} stock bas</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Commandes</p>
            <small>Total commandes</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.totalRevenue.toLocaleString()} €</h3>
            <p>Chiffre d'affaires</p>
            <small>Total des commandes</small>
          </div>
        </div>
      </div>

      {/* Graphiques avec CSS pur */}
      <div className="charts-grid">
        {/* Distribution par département - Barres horizontales */}
        <div className="chart-card">
          <h3>📊 Employés par département</h3>
          <div className="bar-chart">
            {stats.departmentDistribution.map((dept, idx) => (
              <div key={idx} className="bar-item">
                <div className="bar-label">{dept.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(dept.value / stats.maxDept) * 100}%`,
                      backgroundColor: `hsl(${idx * 90}, 70%, 50%)`
                    }}
                  >
                    <span className="bar-value">{dept.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenus mensuels - Barres verticales */}
        <div className="chart-card">
          <h3>📈 Revenus mensuels</h3>
          <div className="vertical-bar-chart">
            {stats.monthlyRevenue.map((month, idx) => (
              <div key={idx} className="vertical-bar-item">
                <div className="vertical-bar-container">
                  <div 
                    className="vertical-bar-fill"
                    style={{ 
                      height: `${(month.revenue / stats.maxRevenue) * 200}px`,
                      backgroundColor: '#8884d8'
                    }}
                  >
                    <span className="vertical-bar-value">{month.revenue.toLocaleString()}€</span>
                  </div>
                </div>
                <div className="vertical-bar-label">{month.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Statut des employés */}
        <div className="chart-card">
          <h3>🔄 Statut des employés</h3>
          <div className="donut-chart">
            <div className="donut-container">
              <div className="donut-segment">
                <div className="donut-label">
                  <span className="donut-percent">
                    {Math.round((stats.employees.filter(e => e.status === 'active').length / stats.totalEmployees) * 100)}%
                  </span>
                  <span className="donut-text">Actifs</span>
                </div>
              </div>
              <div className="progress-ring">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#00C49F"
                    strokeWidth="15"
                    strokeDasharray={`${(stats.employees.filter(e => e.status === 'active').length / stats.totalEmployees) * 314} 314`}
                    transform="rotate(-90 60 60)"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#FF8042"
                    strokeWidth="15"
                    strokeDasharray={`${(stats.employees.filter(e => e.status === 'inactive').length / stats.totalEmployees) * 314} 314`}
                    strokeDashoffset={`-${(stats.employees.filter(e => e.status === 'active').length / stats.totalEmployees) * 314}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>
            </div>
            <div className="donut-legend">
              <span><span className="legend-color active"></span> Actifs: {stats.employees.filter(e => e.status === 'active').length}</span>
              <span><span className="legend-color inactive"></span> Inactifs: {stats.employees.filter(e => e.status === 'inactive').length}</span>
            </div>
          </div>
        </div>

        {/* Masse salariale */}
        <div className="chart-card">
          <h3>💰 Masse salariale par département</h3>
          <div className="bar-chart">
            {stats.departmentDistribution.map((dept, idx) => {
              const totalSalary = stats.employees
                .filter(e => e.department === dept.name)
                .reduce((sum, e) => sum + e.salary, 0);
              const maxSalary = Math.max(...stats.departmentDistribution.map(d => 
                stats.employees.filter(e => e.department === d.name).reduce((s, e) => s + e.salary, 0)
              ), 1);
              return (
                <div key={idx} className="bar-item">
                  <div className="bar-label">{dept.name}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill salary-bar"
                      style={{ 
                        width: `${(totalSalary / maxSalary) * 100}%`,
                        backgroundColor: '#82ca9d'
                      }}
                    >
                      <span className="bar-value">{totalSalary.toLocaleString()}€</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tableaux récents */}
      <div className="recent-grid">
        <div className="recent-card">
          <h3>👥 Derniers employés</h3>
          <table className="recent-table">
            <thead>
              <tr><th>Nom</th><th>Département</th><th>Poste</th><th>Salaire</th></tr>
            </thead>
            <tbody>
              {stats.employees.slice(-5).reverse().map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.role}</td>
                  <td>{emp.salary.toLocaleString()} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="recent-card">
          <h3>🛒 Dernières commandes</h3>
          <table className="recent-table">
            <thead>
              <tr><th>Référence</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {stats.orders.slice(-5).reverse().map(order => (
                <tr key={order.id}>
                  <td>{order.reference}</td>
                  <td>{order.total.toLocaleString()} €</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === 'delivered' ? 'Livrée' : 'En attente'}
                    </span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes stock */}
      {stats.lowStockProducts > 0 && (
        <div className="alert-card">
          <h3>⚠️ Alertes stock ({stats.lowStockProducts})</h3>
          <div className="alert-items">
            {stats.products.filter(p => p.stock < 10).map(product => (
              <div key={product.id} className="alert-item">
                <span>{product.name}</span>
                <span className="stock-low">Stock: {product.stock} unités</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;