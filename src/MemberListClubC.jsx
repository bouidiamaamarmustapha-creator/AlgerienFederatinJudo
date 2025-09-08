import { useEffect, useState } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import { supabase } from "./supabaseClient";
    import Navigation from "./Navigation";
    import BackHomeButton from "./BackHomeButton";
    import { Shield } from "lucide-react";
    import "./index.css";
    import ListofAthletesButton from "./ListofAthletesButton.jsx";

    export default function MemberListClubC() {
      const { state } = useLocation();
      const navigate = useNavigate();

      const [members, setMembers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const [club, setClub] = useState(null);
      const [member, setMember] = useState(null); // ✅ membre logué
      const [editingId, setEditingId] = useState(null);
      const [editedMember, setEditedMember] = useState({});

      // Header data
      const [federationLogo, setFederationLogo] = useState(null);
      const [leagueLogo, setLeagueLogo] = useState(null);
      const [leagueName, setLeagueName] = useState("");
      const [clubLogo, setClubLogo] = useState(null);
      const [clubName, setClubName] = useState("");

      const federationName = "Algerian Judo Federation";
      const STORAGE_URL =
        "https://aolsbxfulbvpiobqqsao.supabase.co/storage/v1/object/public/logos/";

      // ✅ Fonction pour corriger les chemins de logos
      const getLogoUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${STORAGE_URL}${path}`;
      };

      // ✅ Fetch Data
      const fetchData = async () => {
        try {
          setLoading(true);

          // ✅ Federation logo
          const { data: fedLogoData } = await supabase
            .from("logo")
            .select("logo_url")
            .order("created_at", { ascending: false })
            .limit(1);

          if (fedLogoData?.length > 0) {
            setFederationLogo(getLogoUrl(fedLogoData[0].logo_url));
          }

          // ✅ League name
          if (state?.league_id) {
            const { data: leagueNameRow } = await supabase
              .from("nameleague")
              .select("name_league")
              .eq("id", state.league_id)
              .single();

            if (leagueNameRow) setLeagueName(leagueNameRow.name_league);

            // ✅ League logo
            const { data: leagueLogoRow } = await supabase
              .from("league_members")
              .select("logo_url")
              .eq("league_id", state.league_id)
              .order("id", { ascending: false })
              .limit(1);

            if (leagueLogoRow?.length > 0 && leagueLogoRow[0].logo_url) {
              setLeagueLogo(getLogoUrl(leagueLogoRow[0].logo_url));
            }
          }

          // ✅ Club name + logo
          if (state?.club_id) {
            const { data: clubNameRow } = await supabase
              .from("nameclub")
              .select("name_club, id")
              .eq("id", state.club_id)
              .single();

            if (clubNameRow) {
              setClubName(clubNameRow.name_club);
              setClub(clubNameRow);
            }

            const { data: clubLogoRow } = await supabase
              .from("club_members")
              .select("logo_url")
              .eq("club_id", state.club_id)
              .order("id", { ascending: false })
              .limit(1);

            if (clubLogoRow?.length > 0 && clubLogoRow[0].logo_url) {
              setClubLogo(getLogoUrl(clubLogoRow[0].logo_url));
            }
          }

          // ✅ Fetch logged member
          if (state?.member_id) {
            const { data: memberData } = await supabase
              .from("club_members")
              .select("*")
              .eq("id", state.member_id)
              .single();

            if (memberData) setMember(memberData);
          }

          // ✅ Fetch all members of the club
          if (state?.club_id) {
            const { data: membersData, error: membersError } = await supabase
              .from("club_members")
              .select("*")
              .eq("club_id", state.club_id);

            if (membersError) throw membersError;
            setMembers(membersData || []);
          }
        } catch (err) {
          setError(err);
          console.error("❌ Error fetching club data:", err.message);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchData();
      }, [state]);

      // ✅ Table Actions
      const handleEdit = (m) => {
        setEditingId(m.id);
        setEditedMember(m);
      };

      const handleChange = (e, field) => {
        setEditedMember({
          ...editedMember,
          [field]: e.target.value,
        });
      };

      const handleSave = async (id) => {
        try {
          const { error } = await supabase
            .from("club_members")
            .update(editedMember)
            .eq("id", id);

          if (error) throw error;

          setEditingId(null);
          setEditedMember({});
          fetchData(); // refresh after save
        } catch (err) {
          setError(err);
        }
      };

      const handleDelete = async (id) => {
        try {
          const { error } = await supabase.from("club_members").delete().eq("id", id);
          if (error) throw error;
          fetchData();
        } catch (err) {
          setError(err);
        }
      };

      if (loading) return <p>Loading club members...</p>;
      if (error) return <p>Error: {error.message}</p>;

      return (
        <div className="content">
          {/* HEADER Fédération + League + Club */}
          <header>
            <div className="federation-header">
              {/* Federation row */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {federationLogo ? (
                  <img src={federationLogo} alt="Federation Logo" className="federation-logo" />
                ) : (
                  <Shield className="federation-logo" />
                )}
                <h1 className="federation-title">{federationName}</h1>
              </div>

              {/* League row */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {leagueLogo ? (
                  <img src={leagueLogo} alt="League Logo" className="member-logo" />
                ) : (
                  <p>No league logo</p>
                )}
                <h2 className="federation-title" style={{ fontSize: "1.5rem" }}>
                  {leagueName || "League Name"}
                </h2>
              </div>

              {/* Club row */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {clubLogo ? (
                  <img src={clubLogo} alt="Club Logo" className="member-logo" />
                ) : (
                  <p>No club logo</p>
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
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (club && member) {
                  navigate("/AthletePage", {
                    state: {
                      club_id: club.id,
                      club_name: club.name_club,
                      league_id: state?.league_id,
                      member_id: member.id,
                      first_name: member.first_name,
                      last_name: member.last_name,
                      role: member.role,
                    },
                    state: { ...state, club: club, member: member },
                  });
                } else {
                  console.log("❌ No club or member found, cannot navigate.");
                }
              }}
            >
              List of Athletes
            </button>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Last Name</th>
                  <th>First Name</th>
                  <th>Role</th>
                  <th>Club Role</th>
                  <th>Blood Type</th>
                  <th>Date of Birth</th>
                  <th>Place of Birth</th>
                  <th>License Number</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {editingId === m.id ? (
                        <input
                          value={editedMember.last_name || ""}
                          onChange={(e) => handleChange(e, "last_name")}
                        />
                      ) : (
                        m.last_name
                      )}
                    </td>
                    <td>
                      {editingId === m.id ? (
                        <input
                          value={editedMember.first_name || ""}
                          onChange={(e) => handleChange(e, "first_name")}
                        />
                      ) : (
                        m.first_name
                      )}
                    </td>
                    <td>{m.role}</td>
                    <td>{m.club_role}</td>
                    <td>{m.blood_type}</td>
                    <td>{m.date_of_birth}</td>
                    <td>{m.place_of_birth}</td>
                    <td>{m.license_number}</td>
                    <td>{m.registration_date}</td>
                    <td>
                      {editingId === m.id ? (
                        <button className="primary-btn" onClick={() => handleSave(m.id)}>
                          Save
                        </button>
                      ) : (
                        <>
                          <button className="primary-btn" onClick={() => handleEdit(m)}>
                            Modify
                          </button>
                          <button className="secondary-btn" onClick={() => handleDelete(m.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <BackHomeButton />
          </section>

          <Navigation />

          <footer className="footer bg-red-600 text-white p-4 mt-6">
            <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
          </footer>
        </div>
      );
    }
