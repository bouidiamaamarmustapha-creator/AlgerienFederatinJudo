import { useNavigate } from "react-router-dom";

export default function PhotosLogoPublication() {
  const navigate = useNavigate();

  return (
    <button className="primary-btn" onClick={() => navigate("/photos-logo-publication")}>
      Photos, Logo & Publications
    </button>
  );
}
