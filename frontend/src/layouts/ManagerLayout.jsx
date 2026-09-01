import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../components/ui/manager/ManagerSidebar';
import Topbar from '../components/ui/Topbar'; // We can reuse the admin topbar as it pulls from AuthContext

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <ManagerSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="admin-main">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
