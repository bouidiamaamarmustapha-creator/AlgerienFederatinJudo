import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import "./index.css";
import BackHomeButton from "./BackHomeButton";
import logo from "./assets/logo.png";
import { Shield } from "lucide-react";

export default function MemberListClub() {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedMember, setEditedMember] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [federationLogo, setFederationLogo] = useState(null);
  const [federationName, setFederationName] =
    useState("Algerian Judo Federation");

  const navigate = useNavigate();

  // ✅ fetch club members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("club_members").select("*");
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
  }, []);

  // ✅ delete member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    const { error } = await supabase.from("club_members").delete().eq("id", id);
    if (error) console.error("Error deleting member:", error);
    else setMembers(members.filter((m) => m.id !== id));
  };

  // ✅ edit mode
  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditedMember({ ...member });
  };

  // ✅ save changes
  const handleSave = async (id) => {
    const { error } = await supabase
      .from("club_members")
      .update({
        last_name: editedMember.last_name,
        first_name: editedMember.first_name,
        date_of_birth: editedMember.date_of_birth,
        place_of_birth: editedMember.place_of_birth,
        role: editedMember.role,
        blood_type: editedMember.blood_type,
      })
      .eq("id", id);

    if (error) console.error("Error updating member:", error);
    else {
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

  if (loading) return <p>Loading club members...</p>;
  if (error) return <p>Error fetching members: {error.message}</p>;

  return (
    <div className="content">
      {/* HEADER */}
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

      {/* MAIN CONTENT */}
      <section className="content">
        <h2>Club Member List</h2>
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

      <Navigation />

      <footer className="footer" style={{ backgroundColor: "red" }}>
        <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
      </footer>
    </div>
  );
}
