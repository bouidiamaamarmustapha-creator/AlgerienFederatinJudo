import { useState, useEffect } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { Shield } from "lucide-react";
    import logo from "./assets/logo.png";
    import { supabase } from "./supabaseClient";
    import Navigation from "./Navigation";
    import BackHomeButton from "./BackHomeButton";

    export default function AddMemberPage() {
      const [role, setRole] = useState("");
      const [bloodType, setBloodType] = useState("");
      const [lastName, setLastName] = useState("");
      const [firstName, setFirstName] = useState("");
      const [dob, setDob] = useState("");
      const [pob, setPob] = useState("");
      const [nid, setNid] = useState("");
      const [password, setPassword] = useState("");
      const [confirmPassword, setConfirmPassword] = useState("");
      const [error, setError] = useState(""); // only one error state
      const [success, setSuccess] = useState("");
      const [publications, setPublications] = useState([]);
      const [federationLogo, setFederationLogo] = useState(null);
      const [federationName, setFederationName] = useState("Algerian Judo Federation");
      const [selectedFederationRole, setSelectedFederationRole] = useState(""); // [ADDED]
      const [federationRoles, setFederationRoles] = useState([]); // [ADDED]

      const navigate = useNavigate();
      const federationLogoPlaceholder = logo;

      // ✅ fetch publications
      useEffect(() => {
        const fetchPublications = async () => {
          const { data, error } = await supabase
            .from("publications")
            .select("id, title, description, photo_url, created_at")
            .order("created_at", { ascending: false });

          if (!error && data) {
            setPublications(data);
          }
        };

        fetchPublications();
      }, []);

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

      // ✅ fetch federation roles
      useEffect(() => {
        const fetchFederationRoles = async () => {
          const { data, error } = await supabase
            .from("federationrole")
            .select("federation_role")
            .order("federation_role", { ascending: true });

          if (!error && data) {
            setFederationRoles(data);
          }
        };

        fetchFederationRoles();
      }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
          !role ||
          !bloodType ||
          !lastName ||
          !firstName ||
          !dob ||
          !pob ||
          !nid ||
          !password ||
          !confirmPassword
        ) {
          setError("❌ All fields are required.");
          return;
        }

        if (nid.length !== 18) {
          setError("❌ National Identity Number must be exactly 18 digits.");
          return;
        }

        if (password !== confirmPassword) {
          setError("❌ Passwords do not match.");
          return;
        }

        const newMember = {
          last_name: lastName,
          first_name: firstName,
          date_of_birth: dob,
          place_of_birth: pob,
          role,
          blood_type: bloodType,
          national_id_number: nid,
          password,
          license_number: "LIC-" + Date.now(),
          registration_date: new Date().toISOString().split("T")[0],
        };

        try {
          const { error } = await supabase.from("members").insert([newMember]);

          if (error) {
            setError(`❌ Failed to add member: ${error.message}`);
          } else {
            setSuccess(`✅ Member "${firstName} ${lastName}" added successfully!`);
            setLastName("");
            setFirstName("");
            setDob("");
            setPob("");
            setNid("");
            setPassword("");
            setConfirmPassword("");
            setRole("");
            setBloodType("");
          }
        } catch (err) {
          setError(`❌ An unexpected error occurred: ${err.message}`);
        }
      };

      return (
        <div className="page-container">
          <div className="content-box">
            {/* Header */}
            <header className="bg-white text-gray-800 p-6 shadow-lg border-b-4 border-red-500">
              <div className="container mx-auto">
                <div className="federation-header">
                  {federationLogo ? (
                    <img
                      src={federationLogo}
                      alt="Logo Fédération"
                      className="federation-logo"
                    />
                  ) : (
                    <Shield className="w-16 h-16 text-green-700" />
                  )}
                  <h1 className="federation-title">
                    {federationName || "Algerian Judo Federation"}
                  </h1>
                </div>
              </div>
            </header>

            <h2 className="form-title">Add a New Member</h2>

            <form onSubmit={handleSubmit} className="form-grid">
              {/* Role */}
              <label>
                Federation Role
                <select
                  value={selectedFederationRole}
                  onChange={(e) => setSelectedFederationRole(e.target.value)}
                >
                  <option value="">Select Federation Role</option>
                  {federationRoles.map((role) => (
                    <option key={role.federation_role} value={role.federation_role}>
                      {role.federation_role}
                    </option>
                  ))}
                </select>
              </label>

              {/* Blood type */}
              <label>
                Blood Type
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="">-- Select Blood Type --</option>
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

              {/* Text inputs */}
              <label>
                Last Name
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>

              <label>
                First Name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              <label>
                Date of Birth
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </label>

              <label>
                Place of Birth
                <input
                  type="text"
                  value={pob}
                  onChange={(e) => setPob(e.target.value)}
                />
              </label>

              <label>
                National Identity Number
                <input
                  type="text"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  maxLength="18"
                  minLength="18"
                />
              </label>

              {/* Passwords */}
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label>
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              {/* Buttons */}
              <div className="btn-row">
                <button type="submit" className="primary-btn">
                  Add Member
                </button>
                <button className="secondary-btn" onClick={() => navigate("/MemberListPage")}>
                  The Member List Add
                </button>
                <BackHomeButton />
              </div>
            </form>

            {/* Messages */}
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            {/* NAVIGATION */}
            <Navigation />
          </div>
        </div>
      );
    }
