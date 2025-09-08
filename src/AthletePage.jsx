// AthletePage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Navigation from "./Navigation";
import BackHomeButton from "./BackHomeButton";
import { Shield } from "lucide-react";
import "./index.css";
import ListofAthletesButton from "./ListofAthletesButton.jsx";

export default function AthletePage() {
  const { state } = useLocation(); // optional: { club_id, league_id, member_id, ... }
  const navigate = useNavigate();

  // lists & header
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [federationLogo, setFederationLogo] = useState(null);
  const [leagueLogo, setLeagueLogo] = useState(null);
  const [leagueName, setLeagueName] = useState("");
  const [clubLogo, setClubLogo] = useState(null);
  const [clubName, setClubName] = useState("");
  const federationName = "Algerian Judo Federation";
  const STORAGE_URL =
    "https://aolsbxfulbvpiobqqsao.supabase.co/storage/v1/object/public/logos/";

  // logged member (optional)
  const [member, setMember] = useState(null);

  // form (add athlete)
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [pob, setPob] = useState("");
  const [role, setRole] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nationality, setNationality] = useState("");
  const [grade, setGrade] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  // corrected: genres, categories, weight, weights
  const [genres, setGenres] = useState("");
  const [categories, setCategories] = useState("");
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState([]);

  // selects source (only needed if user wants to change club/league from page)
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);

  // selected club/league (prefill from state if present)
  const [clubId, setClubId] = useState(state?.club_id ?? "");
  const [leagueId, setLeagueId] = useState(state?.league_id ?? "");

  // edit state for table rows
  const [editingId, setEditingId] = useState(null);
  const [editedAthlete, setEditedAthlete] = useState({});

  // helper: build full storage url if path is stored
  const getLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${STORAGE_URL}${path}`;
  };

  // fetch federations, club/league names & logos, member, athletes
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // federation logo
      const { data: fedData } = await supabase
        .from("logo")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1);
      if (fedData?.length) setFederationLogo(getLogoUrl(fedData[0].logo_url));

      // league name + logo (logo from league_members via league_id)
      if (leagueId) {
        const { data: ln } = await supabase
          .from("nameleague")
          .select("name_league")
          .eq("id", leagueId)
          .single();
        if (ln) setLeagueName(ln.name_league);

        const { data: llogoRows } = await supabase
          .from("league_members")
          .select("logo_url")
          .eq("league_id", leagueId)
          .order("id", { ascending: false })
          .limit(1);
        if (llogoRows?.length) setLeagueLogo(getLogoUrl(llogoRows[0].logo_url));
      }

      // club name + logo (logo from club_members via club_id)
      if (clubId) {
        const { data: cn } = await supabase
          .from("nameclub")
          .select("name_club, id")
          .eq("id", clubId)
          .single();
        if (cn) {
          setClubName(cn.name_club);
        }

        const { data: clogoRows } = await supabase
          .from("club_members")
          .select("logo_url")
          .eq("club_id", clubId)
          .order("id", { ascending: false })
          .limit(1);
        if (clogoRows?.length) setClubLogo(getLogoUrl(clogoRows[0].logo_url));
      }

      // logged in member if provided (state.member_id)
      if (state?.member_id) {
        const { data: m } = await supabase
          .from("club_members")
          .select("*")
          .eq("id", state.member_id)
          .single();
        if (m) setMember(m);
      }

      // load athletes for same club_id & league_id
      if (clubId && leagueId) {
        const { data: aRows } = await supabase
          .from("athletes")
          .select("*")
          .eq("club_id", clubId)
          .eq("league_id", leagueId)
          .order("id", { ascending: true });
        setAthletes(aRows || []);
      } else {
        setAthletes([]);
      }

      // load clubs / leagues lists for form if needed
      const [{ data: clubsData }, { data: leaguesData }] = await Promise.all([
        supabase.from("nameclub").select("id, name_club"),
        supabase.from("nameleague").select("id, name_league"),
      ]);
      if (clubsData) setClubs(clubsData);
      if (leaguesData) setLeagues(leaguesData);
    } catch (err) {
      console.error("fetchData error", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // if page state defines club/league, ensure form values follow it
    if (state?.club_id) setClubId(state.club_id);
    if (state?.league_id) setLeagueId(state.league_id);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, clubId, leagueId]);

  // --- Charger les poids quand genres + categories changent ---
  useEffect(() => {
    const fetchWeights = async () => {
      if (!genres || !categories) return;

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("weight")
          .eq("genres", genres) // ex: "Men"
          .eq("categories", categories); // ex: "Benjamins"

        if (error) {
          console.error("Erreur récupération poids:", error.message);
        } else {
          setWeights(data.map((row) => row.weight));
        }
      } catch (err) {
        console.error("Erreur inconnue:", err);
      }
    };

    fetchWeights();
  }, [genres, categories]);

  // helper: compute renewal number (count existing matching NID + club + league) + 1
  const getNextRenewal = async (nidVal, clubIdVal, leagueIdVal) => {
    try {
      const { count, error } = await supabase
        .from("athletes")
        .select("*", { count: "exact", head: true })
        .eq("national_id_number", nidVal)
        .eq("club_id", clubIdVal)
        .eq("league_id", leagueIdVal);
      if (error) {
        console.error("getNextRenewal count error", error);
        return 1;
      }
      return (count || 0) + 1;
    } catch (err) {
      console.error("getNextRenewal unexpected", err);
      return 1;
    }
  };

  // upload photo helper -> returns publicUrl or null
  const handlePhotoUpload = async () => {
    if (!photoFile) return null;
    const ext = photoFile.name.split(".").pop();
    const fileName = `athlete-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(fileName, photoFile);
    if (error) {
      console.error("upload error", error);
      return null;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    return data?.publicUrl ?? null;
  };

  // Add athlete
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!/^\d{18}$/.test(nid)) {
      alert("National ID Number must be exactly 18 digits (numbers only).");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!clubId || !leagueId) {
      alert("Club and League must be set.");
      return;
    }

    try {
      setLoading(true);
      const photoUrl = await handlePhotoUpload();
      const renewalNumber = await getNextRenewal(nid, clubId, leagueId);
      const currentYear = new Date().getFullYear();
      const startYear = currentYear + (renewalNumber - 1);
      const year = `${startYear}/${startYear + 1}`;

      const newAthlete = {
        last_name: lastName,
        first_name: firstName,
        date_of_birth: dob,
        place_of_birth: pob,
        role,
        blood_type: bloodType,
        national_id_number: nid,
        password,
        license_number: `ATH-${startYear}-${Date.now()}`, // dynamic license
        registration_date: new Date().toISOString().split("T")[0],
        photos_url: photoUrl,
        nationality,
        grade,
        renewal: renewalNumber,
        confirmation: false,
        genres,
        category: categories,
        weight,
        club_id: clubId,
        league_id: leagueId,
        year,
      };

      const { error } = await supabase.from("athletes").insert([newAthlete]);
      if (error) {
        console.error("insert athlete error", error);
        alert("Error saving athlete: " + error.message);
      } else {
        // clear form (keep club/league context)
        setLastName("");
        setFirstName("");
        setDob("");
        setPob("");
        setRole("");
        setBloodType("");
        setNid("");
        setPassword("");
        setConfirmPassword("");
        setNationality("");
        setGrade("");
        setGenres("");
        setCategories("");
        setWeight("");
        setPhotoFile(null);

        // refresh athletes table
        await fetchData();
      }
    } catch (err) {
      console.error("handleSubmit error", err);
      alert("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // inline edit handlers
  const startEdit = (a) => {
    setEditingId(a.id);
    setEditedAthlete({ ...a });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditedAthlete({});
  };
  const saveEdit = async (id) => {
    try {
      setLoading(true);
      // if changing NID and need to recalc renewal/year you may add logic here.
      const { error } = await supabase.from("athletes").update(editedAthlete).eq("id", id);
      if (error) throw error;
      setEditingId(null);
      setEditedAthlete({});
      await fetchData();
    } catch (err) {
      console.error("saveEdit error", err);
      alert("Error updating athlete: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // delete only same day allowed
  const deleteAthlete = async (a) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (a.registration_date !== today) {
      alert("You can only delete athletes the same day they were added.");
      return;
    }
    if (!window.confirm("Delete this athlete?")) return;
    try {
      const { error } = await supabase.from("athletes").delete().eq("id", a.id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("deleteAthlete error", err);
      alert("Error deleting athlete: " + err.message);
    }
  };

  // helper render for action buttons in row
  const ActionsCell = ({ a }) => {
    const today = new Date().toISOString().split("T")[0];
    const canDelete = a.registration_date === today;
    if (editingId === a.id) {
      return (
        <>
          <button className="primary-btn" onClick={() => saveEdit(a.id)}>
            Save
          </button>
          <button className="secondary-btn" onClick={cancelEdit}>
            Cancel
          </button>
        </>
      );
    }
    return (
      <>
        <button className="primary-btn" onClick={() => startEdit(a)}>
          Modify
        </button>
        <button
          className="secondary-btn"
          onClick={() => deleteAthlete(a)}
          disabled={!canDelete}
          title={!canDelete ? "Delete allowed only on the day of registration" : "Delete"}
        >
          Delete
        </button>
      </>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message || String(error)}</p>;

  return (
    <div className="content">
      {/* HEADER Fédération + League + Club */}
      <header>
        <div className="federation-header">
          {/* Federation */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {federationLogo ? (
              <img src={federationLogo} alt="Federation Logo" className="federation-logo" />
            ) : (
              <Shield className="federation-logo" />
            )}
            <h1 className="federation-title">{federationName}</h1>
          </div>

          {/* League */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {leagueLogo ? <img src={leagueLogo} alt="League Logo" className="member-logo" /> : <p>No league logo</p>}
            <h2 className="federation-title" style={{ fontSize: "1.5rem" }}>
              {leagueName || "League Name"}
            </h2>
          </div>

          {/* Club */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {clubLogo ? <img src={clubLogo} alt="Club Logo" className="member-logo" /> : <p>No club logo</p>}
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
            {member.first_name} {member.last_name} — <strong>{member.role || member.club_role || "No role"}</strong>
          </p>
        ) : (
          <p>No member found.</p>
        )}

        <BackHomeButton />

        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            if (clubId && member) {
              navigate("/club-member-listC", {
                state: {
                  club_id: clubId,
                  club_name: clubName,
                  league_id: leagueId,
                  member_id: member?.id,
                  first_name: member?.first_name,
                  last_name: member?.last_name,
                  role: member?.role,
                },
              });
            } else {
              alert("Club or member not loaded yet.");
            }
          }}
        >
          The Club Member List
        </button>

        <ListofAthletesButton />

        {/* Athlete Form */}
        <h2 className="form-title">Add Athlete</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Last Name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>

          <label>
            First Name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>

          <label>
            Date of Birth
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          </label>

          <label>
            Place of Birth
            <input value={pob} onChange={(e) => setPob(e.target.value)} required />
          </label>

          <label>
            Nationality
            <select value={nationality} onChange={(e) => setNationality(e.target.value)}>
              <option value="">-- Select --</option>
              <option>Algerian</option>
              <option>Tunisian</option>
            </select>
          </label>

          <label>
            Grade
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">-- Select --</option>
              <option>brown belt</option>
              <option>black belt</option>
            </select>
          </label>

          <label>
            Genres
            <select value={genres} onChange={(e) => setGenres(e.target.value)} required>
              <option value="">-- Select --</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </label>

          <label>
            Categories
            <select value={categories} onChange={(e) => setCategories(e.target.value)} required>
              <option value="">-- Select --</option>
              <option value="Benjamins">Benjamins</option>
              <option value="Minimes">Minimes</option>
              <option value="Cadets">Cadets</option>
              <option value="Juniors">Juniors</option>
              <option value="Hopefuls">Hopefuls</option>
              <option value="Seniors">Seniors</option>
              <option value="Veterans">Veterans</option>
            </select>
          </label>

          <label>
            Weight
            <select value={weight} onChange={(e) => setWeight(e.target.value)} required>
              <option value="">-- Select --</option>
              {weights.map((w, i) => (
                <option key={i} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>

          <label>
            National ID Number
            <input value={nid} onChange={(e) => setNid(e.target.value.replace(/\D/g, ""))} maxLength={18} required />
            <small>18 digits required</small>
          </label>

          <label>
            Blood Type
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
              <option value="">-- Select --</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <label>
            Confirm Password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>

          {/* club/league selects: prefilled from state if present (disabled) */}
          <label>
            Club
            <select value={clubId} onChange={(e) => setClubId(e.target.value)} required disabled={!!state?.club_id}>
              <option value="">Select Club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_club}
                </option>
              ))}
            </select>
          </label>

          <label>
            League
            <select value={leagueId} onChange={(e) => setLeagueId(e.target.value)} required disabled={!!state?.league_id}>
              <option value="">Select League</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name_league}
                </option>
              ))}
            </select>
          </label>

          <label>
            Upload Athlete Photo
            <input type="file" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </label>

          <div className="btn-row">
            <button type="submit" className="primary-btn">
              Save Athlete
            </button>
            <BackHomeButton />
          </div>
        </form>

        {/* Athletes Table */}
        <h2>Athletes of {clubName} ({leagueName})</h2>
        <table className="athlete-table">
          <thead>
            <tr>
              <th>Last</th>
              <th>First</th>
              <th>Role</th>
              <th>Blood</th>
              <th>NID</th>
              <th>Renewal</th>
              <th>Year</th>
              <th>Category</th>
              <th>Weight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {athletes.length === 0 ? (
              <tr>
                <td colSpan={10}>No athletes found for this club/league.</td>
              </tr>
            ) : (
              athletes.map((a) => (
                <tr key={a.id}>
                  <td>
                    {editingId === a.id ? (
                      <input value={editedAthlete.last_name || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, last_name: e.target.value })} />
                    ) : (
                      a.last_name
                    )}
                  </td>
                  <td>
                    {editingId === a.id ? (
                      <input value={editedAthlete.first_name || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, first_name: e.target.value })} />
                    ) : (
                      a.first_name
                    )}
                  </td>
                  <td>
                    {editingId === a.id ? (
                      <input value={editedAthlete.role || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, role: e.target.value })} />
                    ) : (
                      a.role
                    )}
                  </td>
                  <td>
                    {editingId === a.id ? (
                      <select value={editedAthlete.blood_type || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, blood_type: e.target.value })}>
                        <option value="">--</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    ) : (
                      a.blood_type
                    )}
                  </td>
                  <td>{a.national_id_number}</td>
                  <td>{a.renewal}</td>
                  <td>{a.year}</td>
                  <td>
                    {editingId === a.id ? (
                      <input value={editedAthlete.category || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, category: e.target.value })} />
                    ) : (
                      a.category
                    )}
                  </td>
                  <td>
                    {editingId === a.id ? (
                      <input value={editedAthlete.weight || ""} onChange={(e) => setEditedAthlete({ ...editedAthlete, weight: e.target.value })} />
                    ) : (
                      a.weight
                    )}
                  </td>
                  <td>
                    <ActionsCell a={a} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Navigation />

      <footer className="footer bg-red-600 text-white p-4 mt-6">
        <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
      </footer>
    </div>
  );
}
