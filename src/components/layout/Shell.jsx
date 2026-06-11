import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

export default function Shell() {
  return (
    <div className="app-shell">
      {/* Particle background */}
      <div className="particle-bg" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        <TopBar />
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
