import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./HomePage";
import FederationPage from "./FederationPage";
import LeaguePage from "./LeaguePage";
import AmateurSportsClubPage from "./AmateurSportsClubPage";
import AthletePage from "./AthletePage";
import MemberListPage from "./MemberListPage";

// Add member pages
import AddMemberPage from "./AddMemberPage";
import AddMemberLeague from "./AddMemberLeague";
import AddMemberClub from "./AddMemberClub";

import "./index.css";
import logo from "./assets/logo.png";

import PhotosLogoPublicationPage from "./PhotosLogoPublicationPage";
import MemberListLeague from "./MemberListLeague";
import MemberListClub from "./MemberListClub";
import MemberListPageP from "./MemberListPageP";
import MemberListLeagueL from "./MemberListLeagueL";
import MemberListClubC from "./MemberListClubC";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Main account pages */}
        <Route path="/FederationPage" element={<FederationPage />} />
        <Route path="/LeaguePage" element={<LeaguePage />} />
        <Route path="/AmateurSportsClubPage" element={<AmateurSportsClubPage />} />

        {/* Add member pages */}
        <Route path="/AddMemberPage" element={<AddMemberPage />} />
        <Route path="/AddMemberLeague" element={<AddMemberLeague />} />
        <Route path="/AddMemberClub" element={<AddMemberClub />} />

        {/* Other pages */}
        <Route path="/AthletePage" element={<AthletePage />} />
        <Route path="/MemberListPage" element={<MemberListPage />} />
        <Route path="/member-list" element={<MemberListLeague />} />
        <Route path="/club-member-list" element={<MemberListClub />} />
				<Route path="/MemberListPageP" element={<MemberListPageP />} />
        <Route path="/member-list-l" element={<MemberListLeagueL />} />
        <Route path="/club-member-listC" element={<MemberListClubC />} />

        {/* Photos + Logo + Publications */}
        <Route path="/photos-logo-publication" element={<PhotosLogoPublicationPage />} />
      </Routes>
    </Router>
  );
}
