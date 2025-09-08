import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import logo from "./assets/logo.png";
import { supabase } from "./supabaseClient";
import Navigation from "./Navigation";
import BackHomeButton from "./BackHomeButton";

export default function AddMemberClub() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [pob, setPob] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [bloodType, setBloodType] = useState("");
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedClubId, setSelectedClubId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [leagues, setLeagues] = useState([]);

  const [logoFile, setLogoFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [federationLogo, setFederationLogo] = useState(null);
  const [federationName, setFederationName] = useState("Algerian Judo Federation");

  const navigate = useNavigate();
  const federationLogoPlaceholder = logo;

  // ✅ fetch roles (clubrole)
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("clubrole").select("id, club_role");
      if (!error && data) setRoles(data);
    };
    fetchRoles();
  }, []);

  // ✅ fetch clubs
  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase.from("nameclub").select("id, name_club");
      if (!error && data) setClubs(data);
    };
    fetchClubs();
  }, []);

  // ✅ fetch leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      const { data, error } = await supabase.from("nameleague").select("id, name_league");
      if (!error && data) setLeagues(data);
    };
    fetchLeagues();
  }, []);

  // ✅ fetch federation logo
  useEffect(() => {
    const fetchLatestLogo = async () => {
      const { data, error } = await supabase
        .from("logo")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!error && data.length > 0) setFederationLogo(data[0].logo_url);
    };
    fetchLatestLogo();
  }, []);

  // ✅ upload logo to storage and return public URL
  const handleLogoUpload = async () => {
    if (!logoFile) return null;
    const fileExt = logoFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, logoFile);
    if (uploadError) {
      setError(`❌ Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(filePath);
    return urlData?.publicUrl ?? null;
  };

  // ✅ form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !pob ||
      !roleId ||
      !selectedClubId ||
      !selectedLeagueId ||
      !password ||
      !confirmPassword
    ) {
      setError("❌ Please fill in all required fields.");
      return;
    }
    if (nid.length !== 18) {
      setError("❌ National ID must be exactly 18 digits.");
      return;
    }
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      const uploadedLogoUrl = await handleLogoUpload();

      const newMember = {
        last_name: lastName,
        first_name: firstName,
        date_of_birth: dob,
        place_of_birth: pob,
        role: roles.find((r) => r.id === parseInt(roleId))?.club_role || "",
        blood_type: bloodType,
        national_id_number: nid,
        password,
        license_number: "LIC-" + Date.now(),
        registration_date: new Date().toISOString().split("T")[0],
        logo_url: uploadedLogoUrl,
        club_id: selectedClubId,
        league_id: selectedLeagueId,
      };

      const { error: insertError } = await supabase.from("club_members").insert([newMember]);
      if (insertError) {
        setError(`❌ Failed to save member: ${insertError.message}`);
        return;
      }

      if (uploadedLogoUrl && selectedClubId) {
        await supabase.from("nameclub").update({ logo_url: uploadedLogoUrl }).eq("id", selectedClubId);
      }

      setSuccess(`✅ Member "${firstName} ${lastName}" added successfully!`);
      setLastName("");
      setFirstName("");
      setDob("");
      setPob("");
      setNid("");
      setPassword("");
      setConfirmPassword("");
      setRoleId("");
      setBloodType("");
      setSelectedClubId("");
      setSelectedLeagueId("");
      setLogoFile(null);

      navigate("/");
    } catch (err) {
      setError(`❌ Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="content-box">
        {/* Federation Header */}
        <header className="bg-white text-gray-800 p-6 shadow-lg border-b-4 border-red-500">
          <div className="container mx-auto">
            <div className="federation-header">
              {federationLogo ? (
                <img src={federationLogo} alt="Federation Logo" className="federation-logo" />
              ) : (
                <Shield className="w-16 h-16 text-green-700" />
              )}
              <h1 className="federation-title">{federationName}</h1>
            </div>
          </div>
        </header>

        <h2 className="form-title">Add Club Member</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Club Role
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.club_role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Club
            <select value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)} required>
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
            <select value={selectedLeagueId} onChange={(e) => setSelectedLeagueId(e.target.value)} required>
              <option value="">Select League</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name_league}
                </option>
              ))}
            </select>
          </label>

          <label>
            Blood Type
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
              <option value="">-- Select Blood Type --</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </label>

          <label>
            Last Name
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>

          <label>
            First Name
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>

          <label>
            Date of Birth
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>

          <label>
            Place of Birth
            <input type="text" value={pob} onChange={(e) => setPob(e.target.value)} />
          </label>

          <label>
            National Identity Number
            <input type="text" value={nid} onChange={(e) => setNid(e.target.value)} maxLength="18" minLength="18" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <label>
            Confirm Password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>

          <label>
            Upload Club Logo
            <input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
          </label>

          <div className="btn-row">
            <button type="submit" className="primary-btn">Save Member</button>
            <BackHomeButton />
            <button className="secondary-btn" onClick={() => navigate("/club-member-list")}>
                  The Member List Add
            </button>
          </div>
        </form>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <Navigation />
      </div>
    </div>
  );
}
