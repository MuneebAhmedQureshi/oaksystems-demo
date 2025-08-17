import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiClipboard, 
  FiList, 
  FiFileText, 
  FiCpu,
  FiPlus 
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/assessment/new', icon: FiPlus, label: 'New Assessment' },
    { path: '/processes', icon: FiList, label: 'All Processes' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
    { path: '/ai-features', icon: FiCpu, label: 'AI Features' },
  ];

  return (
    <div className="sidebar">
      <nav className="nav flex-column">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon className="me-2" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
