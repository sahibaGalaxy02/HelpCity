import "./App.css";
import { Link } from "react-router-dom";
import CountUp from "react-countup"

export default function HomePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1 className="hero-title">
            Improve Your City Together
          </h1>

          <p className="hero-subtitle">
            Report civic problems like garbage, potholes, water leaks and
            electricity issues. Help authorities fix them faster.
          </p>

          <Link to="/report" className="btn-primary hero-btn">
            🚀 Report an Issue
          </Link>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container">

        {/* HEADER */}
        <div className="header-row">
          <div>
            <h2>Civic Issues in Your City</h2>
            <p className="subtitle">0 issues reported by citizens</p>
          </div>

          <Link to="/report" className="btn-primary">
            Login to Report
          </Link>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="category-grid">
          <button className="category-btn">📋 All Issues</button>
          <button className="category-btn">🛣 Road</button>
          <button className="category-btn">🗑 Garbage</button>
          <button className="category-btn">💧 Water</button>
          <button className="category-btn">⚡ Electricity</button>
          <button className="category-btn">📌 Other</button>
        </div>

        {/* STATUS FILTER */}
        <div className="filter-bar">
          <button className="filter-chip active">All</button>
          <button className="filter-chip">Pending</button>
          <button className="filter-chip">In Progress</button>
          <button className="filter-chip">Resolved</button>
          <button className="filter-chip">Rejected</button>
        </div>

        {/* EMPTY STATE */}
        <div className="empty-state">
          <div className="empty-icon">📭</div>

          <h3>No issues found</h3>

          <p>
            Be the first citizen to report a civic problem in your city.
          </p>

          <Link to="/report" className="btn-primary">
            Report First Issue
          </Link>
        </div>

      </div>
    </>
  );
}