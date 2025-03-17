import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Container,
  Grid,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './Dashboard';
import DashboardUserKpi from './DashboardUserKpi';
import DashboardProjectKPI from './DashboardProjectKPI';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { parse } from 'date-fns';

const App = () => {
  const [selectedPage, setSelectedPage] = useState('Dashboard');
  const [projects, setProjects] = useState([
    { key: 'YUIM', name: 'Yuime' },
    { key: 'STU', name: 'SD - Time Utilization' },
    { key: 'DAICO', name: 'Daicolo' },
    { key: 'TOUC', name: 'TOUCH' },
    { key: 'TG', name: 'TOHO GAS' },
    { key: 'NKR2', name: 'NikkenRentacom_2' },
    { key: 'SG', name: 'SCOP-GO' },
    { key: 'BCP', name: 'Borderless City Project' },
    { key: 'SIP', name: 'SD Internal Project' },
    { key: 'IP', name: 'Internal PJ' },
    { key: 'HG', name: 'Hiruta GoDump' },
    { key: 'CF', name: 'Calbee-FfF' },
    { key: 'TIT', name: 'Titans' },
    { key: 'OOPS', name: 'Oops' },
    { key: 'JSR', name: 'Jitera Squad Raiders' },
    { key: 'RAG', name: 'RAG' },
    { key: 'ECHO', name: 'echo' },
    { key: 'SEK', name: 'Sekisuiheim' },
    { key: 'PMAX', name: 'PROMAX' },
    { key: 'MIT', name: 'Mitaden' },
    { key: 'IS', name: 'Ishibashi Gakki' },
    { key: 'KB', name: 'Kuribara' },
    { key: 'PDS', name: 'Product Design' },
  ]);

  const [selectedProjects, setSelectedProjects] = useState(() => {
    const savedProjects = localStorage.getItem('selectedProjects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedProjects', JSON.stringify(selectedProjects));
  }, [selectedProjects]);

  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const defaultStartDate = parse('2025-01-01', 'yyyy-MM-dd', new Date());
  const defaultEndDate = new Date();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (page) => {
    setSelectedPage(page);
    handleMenuClose();
  };

  const handleSearch = () => {
    if (!selectedProjects.length || !startDate || !endDate) {
      alert('Please select projects, start date, and end date before searching.');
      return;
    }

    window.dispatchEvent(
      new CustomEvent('dashboardSearch', {
        detail: { selectedProjects, startDate, endDate },
      })
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Top Navigation Bar */}
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jira Dashboard
          </Typography>
          {!isMobile ? (
            <>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => handleMenuClick('Dashboard')}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<PeopleIcon />}
                onClick={() => handleMenuClick('User KPI')}
              >
                User KPI
              </Button>
              <Button
                color="inherit"
                startIcon={<BusinessIcon />}
                onClick={() => handleMenuClick('Project KPI')}
              >
                Project KPI
              </Button>
            </>
          ) : (
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => handleMenuClick('Dashboard')}>Dashboard</MenuItem>
              <MenuItem onClick={() => handleMenuClick('User KPI')}>User KPI</MenuItem>
              <MenuItem onClick={() => handleMenuClick('Project KPI')}>Project KPI</MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} disableGutters sx={{ mt: 9, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Left Side (Project Selector) - 2/12 Width */}
          <Grid item xs={12} md={2} sx={{ p: 0, m: 0 }}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80, height: 'auto' }}>
              <ProjectSelector
                projects={projects}
                selectedProjects={selectedProjects}
                setSelectedProjects={setSelectedProjects}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onSearch={handleSearch}
              />
            </Paper>
          </Grid>

          {/* Main Dashboard - 10/12 Width */}
          <Grid item xs={12} md={10} sx={{ p: 0, m: 0 }}>
            {selectedPage === 'Dashboard' && (
              <Dashboard
                selectedProjects={selectedProjects}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            {selectedPage === 'User KPI' && (
              <DashboardUserKpi
                selectedProjects={selectedProjects}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            {selectedPage === 'Project KPI' && (
              <DashboardProjectKPI
                selectedProjects={selectedProjects}
                startDate={startDate}
                endDate={endDate}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default App;
