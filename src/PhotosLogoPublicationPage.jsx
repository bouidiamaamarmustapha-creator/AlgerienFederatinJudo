import React, { useState, useEffect } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import Navigation from "./Navigation";
    import BackHomeButton from "./BackHomeButton";
    import { Shield } from "lucide-react";
    import { supabase } from "./supabaseClient";
    import logo from "./assets/logo.png";
    import PhotosLogoPublication from "./PhotosLogoPublication";

    export default function FederationDashboard() {
      // ------------------- STATE -------------------
      const [logoFile, setLogoFile] = useState(null);
      const [logoUrl, setLogoUrl] = useState(null);

      const [photos, setPhotos] = useState([]);
      const [publications, setPublications] = useState([]);
      const [publica, setPublica] = useState([]);

      // Form states
      const [photoFile, setPhotoFile] = useState(null);
      const [publicationFile, setPublicationFile] = useState(null);
      const [publicaFile, setPublicaFile] = useState(null);

      const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");

      const [publicaTitle, setPublicaTitle] = useState("");
      const [publicaDescription, setPublicaDescription] = useState("");

      const [publicationsTitle, setPublicationsTitle] = useState("");
      const [publicationsDescription, setPublicationsDescription] =
        useState("");

      const [logos, setLogos] = useState([]);

      const [showLogin, setShowLogin] = useState(false);
      const [name, setName] = useState("");
      const [key, setKey] = useState("");
      const [error, setError] = useState("");

      const [currentIndex, setCurrentIndex] = useState(0);
      const [federationLogo, setFederationLogo] = useState(null);
      const [federationName] = useState("Algerian Judo Federation");
      const [isGreen] = useState(true); // State to toggle border color

      const navigate = useNavigate();

      const federationLogoPlaceholder = logo; // reuse your logo import

      // ✅ fetch publications from Supabase
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

      useEffect(() => {
        const fetchLatestLogo = async () => {
          const { data, error } = await supabase
            .from("logo") // ✅ using the "logo" table we created
            .select("logo_url")
            .order("created_at", { ascending: false })
            .limit(1);

          if (!error && data.length > 0) {
            setFederationLogo(data[0].logo_url);
          }
        };

        fetchLatestLogo();
      }, []);

      // ✅ Fetch existing photos from DB
      const fetchPhotos = async () => {
        const { data, error } = await supabase
          .from("pub")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error) setPhotos(data);
      };

      // ✅ Delete photo
      const handleDeletePhoto = async (id) => {
        const { error } = await supabase.from("pub").delete().eq("id", id);
        if (!error) fetchPhotos();
      };

      // ✅ Load photos on page mount
      useEffect(() => {
        fetchPhotos();
      }, []);

      // ✅ FETCH PUBLICATIONS
      const fetchPublications = async () => {
        const { data, error } = await supabase
          .from("publications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error) setPublications(data);
      };

      // ✅ FETCH PUBLICA
      const fetchPublica = async () => {
        const { data, error } = await supabase
          .from("publica")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error) setPublica(data);
      };

      // Fetch all logos
      const fetchLogos = async () => {
        const { data, error } = await supabase
          .from("logo")
          .select("*")
          .order("id", { ascending: false });
        if (!error) setLogos(data);
      };

      // Upload logo
      const handleLogoUpload = async () => {
        if (!logoFile) {
          alert("Please select a logo first.");
          return;
        }

        const fileName = `logo-${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("publications")
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          alert("Upload failed: " + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("logo")
          .insert([{ logo_url: urlData.publicUrl }]);
        if (insertError) {
          alert("Failed to save to DB: " + insertError.message);
          return;
        }

        setLogoFile(null);
        fetchLogos(); // refresh table
      };

      // Delete logo
      const handleDeleteLogo = async (id) => {
        const { error } = await supabase.from("logo").delete().eq("id", id);
        if (error) alert("Error deleting logo: " + error.message);
        else fetchLogos();
      };

      // Make sure to call fetchLogos in useEffect
      useEffect(() => {
        fetchLogos();
      }, []);

      // ✅ Save Publication (to publications table)
      const handleSavePublication = async () => {
        if (!publicationFile) {
          alert("Please choose a publication image.");
          return;
        }
        const fileName = `publication-${Date.now()}-${publicationFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("publications")
          .upload(fileName, publicationFile, { upsert: true });

        if (uploadError) {
          alert("❌ Publication upload failed: " + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("publications")
          .insert([
            {
              title: publicationsTitle,
              description: publicationsDescription,
              photo_url: urlData.publicUrl,
            },
          ]);

        if (insertError) {
          alert("❌ Insert failed: " + insertError.message);
          return;
        }

        setPublicationFile(null);
        setTitle("");
        setDescription("");
        fetchPublications();
      };

      // ✅ Save Publica (to publica table)
      const handleSavePublica = async () => {
        if (!publicaFile) {
          alert("Please choose an image for publica.");
          return;
        }
        const fileName = `publica-${Date.now()}-${publicaFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("publications")
          .upload(fileName, publicaFile, { upsert: true });

        if (uploadError) {
          alert("❌ Publica upload failed: " + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from("publica").insert([
          {
            title: publicaTitle,
            description: publicaDescription,
            photo_url: urlData.publicUrl,
          },
        ]);

        if (insertError) {
          alert("❌ Insert failed: " + insertError.message);
          return;
        }

        setPublicaFile(null);
        setPublicaTitle("");
        setPublicaDescription("");
        fetchPublica();
      };

      // ✅ Delete Publication
      const handleDeletePublication = async (id) => {
        const { error } = await supabase
          .from("publications")
          .delete()
          .eq("id", id);
        if (!error) fetchPublications();
      };

      // ✅ Delete Publica
      const handleDeletePublica = async (id) => {
        const { error } = await supabase.from("publica").delete().eq("id", id);
        if (!error) fetchPublica();
      };

      useEffect(() => {
        fetchPhotos();
        fetchPublications();
        fetchPublica();
      }, []);
      return (
        <>
          <section className="content">
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
              <h2>Welcome to the Federation Account</h2>
              <p>This is the Federation Account page.</p>
              <BackHomeButton />
              <PhotosLogoPublication />
							 <button className="primary-btn" onClick={() => navigate("/MemberListPageP")}>
                  The Member List Federation
                </button>
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logos.length > 0 ? (
                    logos.map((l) => (
                      <tr key={l.id}>
                        <td>
                          {l.logo_url ? (
                            <img src={l.logo_url} alt="Logo" width="80" />
                          ) : (
                            "No logo"
                          )}
                        </td>
                        <td>
                          <button
                            className="primary-btn"
                            onClick={() => handleDeleteLogo(l.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No logos found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="form-grid">
                <input
                  type="file"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
                <button className="primary-btn" onClick={handleLogoUpload}>
                  Upload Logo
                </button>
              </div>
              {/* Publications Table */}
              <h2>Update Federation Publication</h2>
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.length > 0 ? (
                    publications.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.title} width="80" />
                          ) : (
                            "No photo"
                          )}
                        </td>
                        <td>{p.title}</td>
                        <td>{p.description}</td>
                        <td>{new Date(p.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="primary-btn"
                            onClick={() => handleDeletePublication(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No publications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Form to add new publication */}
              <div className="form-grid" style={{ marginTop: "1rem" }}>
                <input
                  type="file"
                  onChange={(e) => setPublicationFile(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={publicationsTitle}
                  onChange={(e) => setPublicationsTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={publicationsDescription}
                  onChange={(e) =>
                    setPublicationsDescription(e.target.value)
                  }
                />
                <button className="primary-btn" onClick={handleSavePublication}>
                  Save Publication
                </button>
              </div>
              <h2>Federation Photos</h2>
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.length > 0 ? (
                    photos.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt="photo" width="80" />
                          ) : (
                            "No photo"
                          )}
                        </td>
                        <td>{new Date(p.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="primary-btn"
                            onClick={() => handleDeletePhoto(p.id, p.photo_url)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No photos found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="form-grid">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setPhotoFile(e.target.files[0]);
                      console.log("✅ File selected:", e.target.files[0].name);
                    }
                  }}
                />
                <button
                  className="primary-btn"
                  onClick={async () => {
                    if (!photoFile) {
                      alert("⚠️ Please select a photo first.");
                      return;
                    }

                    console.log("📤 Uploading file:", photoFile.name);

                    const fileName = `photos/pub-${Date.now()}-${photoFile.name}`;

                    const { error: uploadError } = await supabase.storage
                      .from("publications")
                      .upload(fileName, photoFile, {
                        upsert: true,
                      });

                    if (uploadError) {
                      alert("❌ Upload failed: " + uploadError.message);
                      return;
                    }

                    const { data: urlData } = supabase.storage
                      .from("publications")
                      .getPublicUrl(fileName);

                    const { error: insertError } = await supabase
                      .from("pub")
                      .insert([{ photo_url: urlData.publicUrl }]);

                    if (insertError) {
                      alert("❌ Failed to save to DB: " + insertError.message);
                      return;
                    }

                    alert("✅ Photo uploaded successfully!");
                    setPhotoFile(null);
                    fetchPhotos();
                  }}
                >
                  Save Photo
                </button>
              </div>
              <h2>PUBLICA UPLOAD (Add New Publication)</h2>
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publica.length > 0 ? (
                    publica.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.title} width="80" />
                          ) : (
                            "No photo"
                          )}
                        </td>
                        <td>{p.title}</td>
                        <td>{p.description}</td>
                        <td>{new Date(p.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="primary-btn"
                            onClick={() => handleDeletePublica(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No publica entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="form-grid">
                <input
                  type="file"
                  onChange={(e) => setPublicaFile(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={publicaTitle}
                  onChange={(e) => setPublicaTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={publicaDescription}
                  onChange={(e) => setPublicaDescription(e.target.value)}
                />
                <button className="primary-btn" onClick={handleSavePublica}>
                  Save Publica
                </button>
              </div>
            </section>
          </section>
          {/* NAVIGATION */}
          <Navigation />
          {/* FOOTER */}
          <footer className="footer">
            <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
          </footer>
        </>
      );
    }
