import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function BarBoxButton() {
  const [activeBox, setActiveBox] = useState(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ This is only used for Federation page
  const federationLogo = "https://example.com/federation-logo.png";
  const federationName = "Algerian Judo Federation";

  // Login handler depending on type
  const handleSubmit = async (target, type) => {
    if (!name || !key) {
      setError("❌ Please enter both Name and Key before continuing.");
      return;
    }

    let tableName = "";
    let nameColumn = "";
    let keyColumn = "";
    if (type === "federation") {
      tableName = "members";
      nameColumn = "last_name"; 
      keyColumn = "password";
    } else if (type === "league") {
      tableName = "league_members";
      nameColumn = "last_name";
      keyColumn = "password";
    } else if (type === "club") {
      tableName = "club_members";
      nameColumn = "last_name";
      keyColumn = "password";
    }

    const { data, error: supaError } = await supabase
      .from(tableName)
      .select("*")
      .eq(nameColumn, name)
      .eq(keyColumn, key)
      .single();

    if (supaError || !data) {
      setError("❌ Invalid Name or Key. Please try again.");
      return;
    }

    setError("");

    // Pass extra info for Federation, League, Club pages
    let extraData = {};
    if (type === "federation") {
      extraData = { federationLogo, federationName };
    } else if (type === "league") {
      extraData = { league_id: data.league_id, logo_url: data.logo_url };
    } else if (type === "club") {
      // ✅ Now passing both club_id and league_id
      extraData = { 
        club_id: data.club_id, 
        league_id: data.league_id, 
        logo_url: data.logo_url 
      };
    }

    navigate(target, { state: { ...data, ...extraData } });
  };

  const handleAddMember = (target) => {
    navigate(target);
  };

  const resetBox = () => {
    setActiveBox(null);
    setName("");
    setKey("");
    setError("");
  };

  const renderBox = (type, label, addPath, btnClass = "secondary-btn") => (
    <div className="login-section">
      <button className={btnClass} onClick={() => setActiveBox(activeBox === type ? null : type)}>
        {label}
      </button>
      {activeBox === type && (
        <div className="login-box">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mb-2"
          />
          <input
            type="password"
            placeholder="Enter Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="input-field mb-2"
          />
          {error && <p className="error-text">{error}</p>}
          <div className="btn-row mt-2 flex gap-2">
            <button
              className="primary-btn"
              onClick={() =>
                handleSubmit(
                  `/${type === "federation" ? "FederationPage" : type === "league" ? "LeaguePage" : "AmateurSportsClubPage"}`,
                  type
                )
              }
            >
              Login
            </button>
            <button className="secondary-btn" onClick={() => handleAddMember(addPath)}>
              ➕ Add Member
            </button>
            <button className="secondary-btn" onClick={resetBox}>
              Back Home
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="center-block flex flex-col gap-4">
      {renderBox("federation", "Federation Account", "/AddMemberPage", "primary-btn")}
      {renderBox("league", "League Account", "/AddMemberLeague")}
      {renderBox("club", "Amateur Sports Club", "/AddMemberClub")}
    </div>
  );
}
