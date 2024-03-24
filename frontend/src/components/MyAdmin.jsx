import React, { useState } from 'react';
import '../Dashboard.css';
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ApiRoute from '../config/ApiSettings';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const schedule = () => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/schedule`);
  };

  const transactionReport = () => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/transaction-report`);
  };

  const manageMenu = () => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/menu`);
  };

  const manageUsers = () => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/users`);
  };

  return (
    <div className="dashboard">
     
      <div className="content">
        <div className="card-container">
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Schedule</Card.Title>
              <Card.Text>
                Create work roster.
              </Card.Text>
              <Button variant="primary" onClick={schedule}>Schedule</Button>
            </Card.Body>
          </Card>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Transaction History</Card.Title>
              <Card.Text>
                View Report.
              </Card.Text>
              <Button variant="success" onClick={transactionReport}>Transaction Report</Button>
            </Card.Body>
          </Card>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Manage Menu</Card.Title>
              <Card.Text>
                Add, edit, or remove menu items.
              </Card.Text>
              <Button variant="warning" onClick={manageMenu}>Manage Menu</Button>
            </Card.Body>
          </Card>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Manage Users</Card.Title>
              <Card.Text>
                Manage users and permissions.
              </Card.Text>
              <Button variant="info" onClick={manageUsers}>Manage Users</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
