import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // ✅ load publications
import logo from "./assets/logo.png";
import Navigation from "./Navigation";
import { Shield } from "lucide-react";
import FederationPage from "./FederationPage";
import AthletePage from "./AthletePage";
import AmateurSportsClubPage from "./AmateurSportsClubPage";
import BarBoxButton from "./BarBoxButton";

export default function HomePage() {
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
  const [photos, setPhotos] = useState([]);
  const [publica, setPublica] = useState([]); // [ADDED] State for publica
  const autoRotateRef = useRef(null);

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

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("pub")
        .select("photo_url")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPhotos(data);
      }
    };

    fetchPhotos();
  }, []);

  // ✅ [ADDED] Fetch publica data
  useEffect(() => {
    const fetchPublicaData = async () => {
      const { data, error } = await supabase
        .from("publica")
        .select("title, description, photo_url")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPublica(data);
      }
    };

    fetchPublicaData();
  }, []);

   const nextSlide = () => {
  setCurrentIndex((prev) => (prev + 1) % Math.max(8, publications.length)); // 8 faces or publications length
};

const prevSlide = () => {
  setCurrentIndex((prev) => (prev - 1 + Math.max(8, publications.length)) % Math.max(8, publications.length)); // wrap around
};
      const startAutoRotate = () => {
        if (publications.length === 0) return;
        autoRotateRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % Math.max(8, publications.length));
        }, 5000);
      };

      useEffect(() => {
        startAutoRotate(); // Start auto-rotate when component mounts

        return () => clearInterval(autoRotateRef.current); // Clear interval on unmount
      }, [publications.length]);

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

          {/* SHOWCASE HERO */}
          <section
            id="showcase"
            style={{
              backgroundImage:
                photos.length > 0 ? `url(${photos[0].photo_url})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
              padding: "6rem 0",
              textAlign: "center",
              height: "300px",
            }}
          >
            <h1>Welcome to the Federation</h1>
            <p>Promoting Judo Excellence in Algeria</p>
          </section>
          <div style={{ height: "8rem" }}></div>
          {/* ✅ INFINITE LOOP 8-SIDED CAROUSEL */}
          {/* ✅ 3D Cube Slider */}
          <section
  className="cube-carousel"
  onMouseEnter={() => clearInterval(autoRotateRef.current)}
  onMouseLeave={startAutoRotate}
>
  <div
    className="cube-slider"
    style={{
      transform: `rotateY(${currentIndex * -45}deg)`,
    }}
  >
    {Array.from({ length: 8 }).map((_, i) => {
      const pub = publications[(i + currentIndex) % publications.length];
      return (
        <div
          key={i}
          className="cube-face"
          style={{
            transform: `rotateY(${i * 45}deg) translateZ(55vw)`, // bigger distance
          }}
        >
          {pub && (
            <>
              <img src={pub.photo_url} alt={pub.title} className="cube-image" />
              <div className="cube-caption">
                <h3>{pub.title}</h3>
                <p>{pub.description}</p>
              </div>
            </>
          )}
        </div>
      );
    })}
  </div>

<div className="cube-controls">
  <button onClick={prevSlide}>❮</button>
  <button onClick={nextSlide}>❯</button>
</div>
</section>

<div style={{ height: "8rem" }}></div>

					
          {/* MOVING IMAGE (Latest Publica) */}
          <div className="moving-image-container">
            {publica.length > 0 ? (
              publica.map((pub) => (
                <div key={pub.id} className="moving-image-card">
                  <img src={pub.photo_url} alt={pub.title} />
                  <div className="moving-image-overlay">
                    <h3>{pub.title}</h3>
                    <p>{pub.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="moving-image-card">
                <img
                  src="https://images.pexels.com/photos/163403/judo-fight-sport-competition-163403.jpeg"
                  alt="Judo athletes"
                />
                <div className="moving-image-overlay">
                  <h3>Welcome to the Federation</h3>
                  <p>Promoting Judo Excellence in Algeria</p>
                </div>
              </div>
            )}
          </div>
          <BarBoxButton />

          {/* NAVIGATION */}
          <Navigation />

          {/* FOOTER */}
          <footer className="footer">
            <p>&copy; 2025 Algerian Judo Federation. All rights reserved.</p>
          </footer>
        </div>
      );
    }
