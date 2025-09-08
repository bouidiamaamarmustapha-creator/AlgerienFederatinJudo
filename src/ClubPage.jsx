import React from "react";
    import { Link } from "react-router-dom";

    const ClubPage = () => {
      return (
        <div className="app-container">
          {/* HEADER */}
          <header
            className="header-content"
            style={{ backgroundColor: "green", borderBottom: "5px solid red" }}
          >
            <h1>Algerian Judo Federation</h1>
          </header>

          {/* MAIN CONTENT */}
          <section className="content">
            <h2>Welcome to the Amateur Sport Club Account</h2>
            <p>This is the Amateur Sport Club Account page.</p>
          </section>

          {/* NAVIGATION */}
          <nav className="navigation">
            <ul>
              <li>
                <Link
                  to="/"
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    border: "1px solid red",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/federation"
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    border: "1px solid red",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                  }}
                >
                  Federation Account
                </Link>
              </li>
              <li>
                <Link
                  to="/league"
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    border: "1px solid red",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                  }}
                >
                  League Account
                </Link>
              </li>
              <li>
                <Link
                  to="/athlete"
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    border: "1px solid red",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                  }}
                >
                  Athlete Account
                </Link>
              </li>
            </ul>
          </nav>

          {/* FOOTER */}
          <footer className="footer" style={{ backgroundColor: "red" }}>
            <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
          </footer>
        </div>
      );
    };

    export default ClubPage;
