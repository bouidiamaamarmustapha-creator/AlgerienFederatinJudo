import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import BackHomeButton from "./BackHomeButton";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png"; // ✅ federation placeholder

export default function LeaguePage() {
  const { state } = useLocation();
  const navigate = useNavigate(); // ✅ Get the navigate function

  const [leagueName, setLeagueName] = useState("");
  const [federationLogo, setFederationLogo] = useState(null);
  const [federationName, setFederationName] = useState("Algerian Judo Federation");
  const [league, setLeague] = useState(null);

  const federationLogoPlaceholder = logo;

  // ✅ fetch federation logo
  useEffect(() => {
    const fetchLatestLogo = async () => {
      const { data, error } = await supabase
        .from("logo")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        setFederationLogo(data[0].logo_url);
      }
    };

    fetchLatestLogo();
  }, []);

  // ✅ fetch league info
  const fetchLeagueInfo = async (leagueId) => {
    const { data, error } = await supabase
      .from("nameleague")
      .select("*")
      .eq("id", leagueId)
      .single();

    if (!error && data) {
      return data;
    } else {
      console.error("Error fetching league info:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!state) return;

    const getLeagueInfo = async () => {
      const { data, error } = await supabase
        .from("nameleague")
        .select("*")
        .eq("id", state.league_id)
        .single();

      if (!error && data) {
        setLeagueName(data.name_league);
        setLeague(data);
      }
    };

    getLeagueInfo();
  }, [state]);

  if (!state) return <p>No account data found.</p>;

  return (
    <div className="container">
      {/* HEADER Fédération + League */}
      <header>
        <div className="federation-header">
          {/* Federation row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {federationLogo ? (
              <img
                src={federationLogo}
                alt="Federation Logo"
                className="federation-logo"
              />
            ) : (
              <img
                src={federationLogoPlaceholder}
                alt="Default Federation Logo"
                className="federation-logo"
              />
            )}
            <h1 className="federation-title">
              {federationName || "Algerian Judo Federation"}
            </h1>
          </div>

          {/* League row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {state.logo_url ? (
              <img
                src={state.logo_url}
                alt="League Logo"
                className="member-logo"
              />
            ) : null}
            <h2 className="federation-title" style={{ fontSize: "1.5rem" }}>
              {leagueName || "League Name"}
            </h2>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="content">
        <h2>
          Welcome {state.first_name} {state.last_name}
        </h2>
        <p>
          <strong>Role:</strong> {state.role}
        </p>
        <BackHomeButton />
        <button
          className="primary-btn"
          onClick={async () => {
            if (!league) {
              alert("League data not loaded yet.");
              return;
            }

            navigate("/member-list-l", {
              state: {
                ...state, // ✅ Spread the existing state
                league_id: league?.id,
                league_name: league?.name_league,
                league_logo: league?.logo_url,
              },
            });
          }}
        >
          The Member List League
        </button>
      </section>

      {/* NAVIGATION */}
      <Navigation />

      {/* FOOTER */}
      <footer className="footer" style={{ backgroundColor: "red" }}>
        <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
      </footer>
    </div>
  );
}
