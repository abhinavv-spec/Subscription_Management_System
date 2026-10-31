import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ShieldCheck,
  Menu,
  LogOut,
} from "lucide-react";

import "./index.css";

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Products & Plans", icon: Package },
  { name: "Staff Management", icon: Users },
  { name: "Customers", icon: Building2 },
  { name: "Subscriptions", icon: CreditCard },
  { name: "Invoices", icon: FileText },
  { name: "Reports", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("brightloop_user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("brightloop_token");
    localStorage.removeItem("brightloop_user");
    window.location.reload();
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "₹0",
      change: "Revenue overview",
      icon: BarChart3,
    },
    {
      title: "Active Subscriptions",
      value: "0",
      change: "Currently active",
      icon: CreditCard,
    },
    {
      title: "Total Customers",
      value: "0",
      change: "Registered accounts",
      icon: Building2,
    },
    {
      title: "Total Products",
      value: "0",
      change: "Available products",
      icon: Package,
    },
  ];

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={23} />
          </div>

          {sidebarOpen && (
            <div>
              <h2>Brightloop</h2>
              <span>ADMIN CONSOLE</span>
            </div>
          )}
        </div>

        <div className="nav-label">
          {sidebarOpen && "WORKSPACE"}
        </div>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
                title={item.name}
              >
                <Icon size={19} />

                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-status">
            <ShieldCheck size={18} />
            {sidebarOpen && (
              <div>
                <strong>System Secure</strong>
                <span>All systems operational</span>
              </div>
            )}
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              <span>Brightloop Admin</span>
              <span>/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="security-badge">
              <ShieldCheck size={15} />
              Root Access
            </div>

            <button className="icon-button">
              <Search size={19} />
            </button>

            <button className="icon-button notification-button">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile">
              <div className="avatar">A</div>
              <div className="admin-details">
                <strong>{user.name || "Administrator"}</strong>
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="page-content">

          <div className="welcome-section">
            <div>
              <p className="eyebrow">CONSOLE OVERVIEW</p>
              <h1>{activePage}</h1>
              <p className="welcome-text">
                Manage your subscription business from one place.
              </p>
            </div>

            <div className="quick-actions">
              <button className="secondary-button">
                <Plus size={17} />
                Add Staff
              </button>

              <button className="primary-button">
                <Plus size={17} />
                Add Product
              </button>
            </div>
          </div>

          {activePage === "Overview" ? (
            <>
              {/* Statistics */}
              <section className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="stat-card" key={stat.title}>
                      <div className="stat-top">
                        <span>{stat.title}</span>
                        <div className="stat-icon">
                          <Icon size={20} />
                        </div>
                      </div>

                      <h2>{stat.value}</h2>
                      <p>{stat.change}</p>
                    </div>
                  );
                })}
              </section>

              {/* Dashboard sections */}
              <section className="dashboard-grid">
                <div className="panel revenue-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Revenue Overview</h3>
                      <p>Subscription revenue performance</p>
                    </div>

                    <select defaultValue="30">
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </div>

                  <div className="empty-state">
                    <BarChart3 size={38} />
                    <h3>No revenue data yet</h3>
                    <p>
                      Revenue information will appear here
                      when customers make payments.
                    </p>
                  </div>
                </div>

                <div className="panel activity-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Recent Activity</h3>
                      <p>Latest platform activities</p>
                    </div>
                  </div>

                  <div className="empty-state">
                    <FileText size={34} />
                    <h3>No recent activity</h3>
                    <p>New activities will appear here.</p>
                  </div>
                </div>
              </section>

              {/* Quick access */}
              <section className="panel quick-access">
                <div className="panel-header">
                  <div>
                    <h3>Quick Access</h3>
                    <p>Manage your platform resources</p>
                  </div>
                </div>

                <div className="quick-access-grid">
                  {[
                    ["Products & Plans", Package],
                    ["Staff Management", Users],
                    ["Customers", Building2],
                    ["Subscriptions", CreditCard],
                  ].map(([name, Icon]) => (
                    <button
                      className="quick-access-item"
                      key={name}
                      onClick={() => setActivePage(name)}
                    >
                      <Icon size={21} />
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="panel placeholder-panel">
              <Package size={38} />
              <h3>{activePage}</h3>
              <p>
                This module will be implemented and connected
                to the backend in the next steps.
              </p>
            </section>
          )}

          <footer className="footer">
            Brightloop Subscriptions · Admin Console
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;