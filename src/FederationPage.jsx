import React, { useState, useEffect } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import Navigation from "./Navigation";
    import BackHomeButton from "./BackHomeButton";
    import { Shield } from "lucide-react";
    import { supabase } from "./supabaseClient";
    import logo from "./assets/logo.png";
    import PhotosLogoPublication from "./PhotosLogoPublication";

    export default function FederationPage() {
      const [showLogin, setShowLogin] = useState(false);
      const [name, setName] = useState("");
      const [key, setKey] = useState("");
      const [error, setError] = useState("");
      const [publications, setPublications] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [federationLogo, setFederationLogo] = useState(null);
      const [federationName, setFederationName] =
        useState("Algerian Judo Federation");
      const [isGreen, setIsGreen] = useState(true); // State to toggle border color

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
      return (
        <div className="app-container">
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
                  The Member List Add
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
