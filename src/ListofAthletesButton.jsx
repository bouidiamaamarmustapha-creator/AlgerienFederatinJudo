import { useNavigate } from "react-router-dom";

export default function ListofAthletesButton({ club, member, state }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="primary-btn"
      onClick={() => {
        if (club && member) {
          console.log("➡️ Navigating to /AthletePage with state:", {
            club_id: club.id,
            club_name: club.name_club,
            league_id: state?.league_id,
            member_id: member.id, // ✅ on envoie l'id du membre logué
            first_name: member.first_name,
            last_name: member.last_name,
            role: member.role,
          });

          navigate("/AthletePage", {
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
      List of Athletes
    </button>
  );
}
