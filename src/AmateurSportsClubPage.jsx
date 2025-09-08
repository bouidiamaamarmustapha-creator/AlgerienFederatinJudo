import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import BackHomeButton from "./BackHomeButton";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png"; // federation placeholder
import ListofAthletesButton from "./ListofAthletesButton.jsx";

export default function AmateurSportsClubPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [federationLogo, setFederationLogo] = useState(null);
  const [federationName, setFederationName] = useState("Algerian Judo Federation");

  const [leagueName, setLeagueName] = useState("");
  const [leagueLogo, setLeagueLogo] = useState(null);

  const [clubName, setClubName] = useState("");
  const [clubLogo, setClubLogo] = useState(null);

  const [member, setMember] = useState(null); // ✅ membre logué
  const [club, setClub] = useState(null);     // ✅ données du club

  const federationLogoPlaceholder = logo;

  // ✅ Federation logo
  useEffect(() => {
    const fetchLatestLogo = async () => {
      const { data, error } = await supabase
        .from("logo")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setFederationLogo(data[0].logo_url);
      }
    };
    fetchLatestLogo();
  }, []);

  // ✅ League name + logo
  useEffect(() => {
    if (!state?.league_id) return;

    const fetchLeague = async () => {
      // name
      const { data: nameRow } = await supabase
        .from("nameleague")
        .select("name_league")
        .eq("id", state.league_id)
        .single();
      if (nameRow) setLeagueName(nameRow.name_league);

      // logo
      const { data: logoRows } = await supabase
        .from("league_members")
        .select("logo_url")
        .eq("league_id", state.league_id)
        .order("id", { ascending: false })
        .limit(1);

      if (logoRows && logoRows.length > 0 && logoRows[0].logo_url) {
        setLeagueLogo(logoRows[0].logo_url);
      }
    };
    fetchLeague();
  }, [state?.league_id]);

  // ✅ Club name + logo
  useEffect(() => {
    if (!state?.club_id) return;

    const fetchClub = async () => {
      // name
      const { data: nameRow } = await supabase
        .from("nameclub")
        .select("name_club")
        .eq("id", state.club_id)
        .single();
      if (nameRow) setClubName(nameRow.name_club);

      // logo
      const { data: logoRows } = await supabase
        .from("club_members")
        .select("logo_url")
        .eq("club_id", state.club_id)
        .order("id", { ascending: false })
        .limit(1);
      if (logoRows && logoRows.length > 0 && logoRows[0].logo_url) {
        setClubLogo(logoRows[0].logo_url);
      }

      // fetch full club row
      const { data: clubData } = await supabase
        .from("nameclub")
        .select("*")
        .eq("id", state.club_id)
        .single();
      if (clubData) setClub(clubData);
    };
    fetchClub();
  }, [state?.club_id]);

  // ✅ Fetch only the logged-in member
  useEffect(() => {
    if (
      !state?.club_id ||
      !state?.league_id ||
      !state?.first_name ||
      !state?.last_name ||
      !state?.password
    ) return;

    const fetchLoggedInMember = async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("*")
        .eq("club_id", state.club_id)
        .eq("league_id", state.league_id)
        .eq("first_name", state.first_name)
        .eq("last_name", state.last_name)
        .eq("password", state.password)
        .single();

      if (!error && data) {
        setMember(data);
      }
    };
    fetchLoggedInMember();
  }, [state]);

  if (!state) return <p>No account data found.</p>;

  return (
    <div className="container">
      {/* HEADER Fédération + League + Club */}
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
            {leagueLogo && (
              <img src={leagueLogo} alt="League Logo" className="member-logo" />
            )}
            <h2 className="federation-title" style={{ fontSize: "1.5rem" }}>
              {leagueName || "League Name"}
            </h2>
          </div>

          {/* Club row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {clubLogo && (
              <img src={clubLogo} alt="Club Logo" className="member-logo" />
            )}
            <h3 className="federation-title" style={{ fontSize: "1.2rem" }}>
              {clubName || "Club Name"}
            </h3>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="content">
        <h2>Club Member</h2>
        {member ? (
          <p>
            {member.first_name} {member.last_name} —{" "}
            <strong>{member.role || member.club_role || "No role"}</strong>
          </p>
        ) : (
          <p>No member found with these credentials.</p>
        )}

        <BackHomeButton />
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            if (club && member) {
              console.log("➡️ Navigating to /club-member-listC with state:", {
                club_id: club.id,
                club_name: club.name_club,
                league_id: state?.league_id,
                member_id: member.id, // ✅ on envoie l'id du membre logué
                first_name: member.first_name,
                last_name: member.last_name,
                role: member.role,
              });

              navigate("/club-member-listC", {
                state: {
                  club_id: club.id,
                  club_name: club.name_club,
                  league_id: state?.league_id,
                  member_id: member.id, // ✅
                  first_name: member.first_name,
                  last_name: member.last_name,
                  role: member.role,
                },
              });
            } else {
              console.log("❌ No club or member found, cannot navigate.");
            }
          }}
        >
          The Club Member List
        </button>
        <ListofAthletesButton club={club} member={member} state={state} />
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
