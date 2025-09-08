import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import "./index.css";
import BackHomeButton from "./BackHomeButton";
import logo from "./assets/logo.png"; // fallback federation logo

export default function MemberListLeagueL() {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedMember, setEditedMember] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [federationLogo, setFederationLogo] = useState(null);
  const [federationName] = useState("Algerian Judo Federation");

  const [leagueName, setLeagueName] = useState("");
  const [leagueLogo, setLeagueLogo] = useState(null);

  const navigate = useNavigate();
  const federationLogoPlaceholder = logo;
  const { state } = useLocation();

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

  // ✅ fetch league name
  useEffect(() => {
    if (!state?.league_id) return;

    const getLeagueInfo = async () => {
      const { data, error } = await supabase
        .from("nameleague")
        .select("name_league")
        .eq("id", state.league_id)
        .single();

      if (!error && data) {
        setLeagueName(data.name_league);
      }
    };
    getLeagueInfo();
  }, [state?.league_id]);

  // ✅ fetch league logo
  useEffect(() => {
    if (!state?.league_id) return;

    const fetchLeagueLogo = async () => {
      const { data, error } = await supabase
        .from("league_members")
        .select("logo_url")
        .eq("league_id", state.league_id)
        .not("logo_url", "is", null)
        .limit(1);

      if (!error && data.length > 0) {
        setLeagueLogo(data[0].logo_url);
      }
    };
    fetchLeagueLogo();
  }, [state?.league_id]);

  // ✅ fetch only members with same league_id
  const fetchMembers = async () => {
    if (!state?.league_id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("league_members")
        .select("*")
        .eq("league_id", state.league_id); // ⚡ filtrage par league_id

      if (error) {
        setError(error);
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [state?.league_id]);

  // ✅ delete member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    const { error } = await supabase.from("league_members").delete().eq("id", id);
    if (!error) setMembers(members.filter((m) => m.id !== id));
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditedMember({ ...member });
  };

  const handleSave = async (id) => {
    const { error } = await supabase
      .from("league_members")
      .update({
        last_name: editedMember.last_name,
        first_name: editedMember.first_name,
        date_of_birth: editedMember.date_of_birth,
        place_of_birth: editedMember.place_of_birth,
        role: editedMember.role,
        blood_type: editedMember.blood_type,
      })
      .eq("id", id);

    if (!error) {
      setMembers(members.map((m) => (m.id === id ? editedMember : m)));
      setEditingId(null);
    }
  };

  const handleChange = (e, field) => {
    setEditedMember({ ...editedMember, [field]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!state) return <p>No account data found.</p>;
  if (loading) return <p>Loading league members...</p>;
  if (error) return <p>Error fetching members: {error.message}</p>;

  return (
    <div className="content">
      {/* HEADER Fédération + League */}
      <header>
        <div className="federation-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src={federationLogo || federationLogoPlaceholder}
              alt="Federation Logo"
              className="federation-logo"
            />
            <h1 className="federation-title">{federationName}</h1>
          </div>

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
          onClick={() => {
            navigate("/member-list-l", { state });
          }}
        >
          The Member List League
        </button>

        <table className="member-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Blood Type</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Date of Birth</th>
              <th>Place of Birth</th>
              <th>National ID Number</th>
              <th>License Number</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  {editingId === member.id ? (
                    <input
                      value={editedMember.role || ""}
                      onChange={(e) => handleChange(e, "role")}
                    />
                  ) : (
                    member.role
                  )}
                </td>
                <td>
                  {editingId === member.id ? (
                    <input
                      value={editedMember.blood_type || ""}
                      onChange={(e) => handleChange(e, "blood_type")}
                    />
                  ) : (
                    member.blood_type
                  )}
                </td>
                <td>
                  {editingId === member.id ? (
                    <input
                      value={editedMember.last_name || ""}
                      onChange={(e) => handleChange(e, "last_name")}
                    />
                  ) : (
                    member.last_name
                  )}
                </td>
                <td>
                  {editingId === member.id ? (
                    <input
                      value={editedMember.first_name || ""}
                      onChange={(e) => handleChange(e, "first_name")}
                    />
                  ) : (
                    member.first_name
                  )}
                </td>
                <td>
                  {editingId === member.id ? (
                    <input
                      type="date"
                      value={editedMember.date_of_birth || ""}
                      onChange={(e) => handleChange(e, "date_of_birth")}
                    />
                  ) : (
                    member.date_of_birth
                  )}
                </td>
                <td>
                  {editingId === member.id ? (
                    <input
                      value={editedMember.place_of_birth || ""}
                      onChange={(e) => handleChange(e, "place_of_birth")}
                    />
                  ) : (
                    member.place_of_birth
                  )}
                </td>
                <td>{member.national_id_number}</td>
                <td>{member.license_number}</td>
                <td>{member.registration_date}</td>
                <td>
                  {editingId === member.id ? (
                    <button
                      className="primary-btn"
                      onClick={() => handleSave(member.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="primary-btn"
                        onClick={() => handleEdit(member)}
                      >
                        Modify
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => handleDelete(member.id)}
                      >
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
        <button className="primary-btn" onClick={handlePrint}>
          Print List
        </button>
      </section>

      {/* NAVIGATION */}
      <Navigation />

      <footer className="footer" style={{ backgroundColor: "red" }}>
        <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
      </footer>
    </div>
  );
}
