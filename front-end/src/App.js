import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import Dashboard from './Dashboard';
import DashboardUserKpi from './DashboardUserKpi';
import DashboardProjectKPI from './DashboardProjectKPI';
import ProjectSelector from './components/ProjectSelector';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { parse } from 'date-fns';

const drawerWidth = 240;

function App() {
  const [selectedPage, setSelectedPage] = useState('Dashboard');
  const [projects, setProjects] = useState([
    { key: 'YUIM', name: 'Yuime' },
    { key: 'STU', name: 'SD - Time Utilization ' },
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
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'User KPI', icon: <PeopleIcon /> },
    { text: 'Project KPI', icon: <BusinessIcon /> },
  ];
  const defaultStartDate = parse('2025-01-01', 'yyyy-MM-dd', new Date());
  const defaultEndDate = new Date();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [chartData, setChartData] = useState(null);

  const handleSearch = () => {
    if (!selectedProjects.length || !startDate || !endDate) {
      alert('Please select projects, start date, and end date before searching.');
      return;
    }

    // Dispatch event to notify Dashboards to fetch data
    window.dispatchEvent(
      new CustomEvent('dashboardSearch', {
        detail: { selectedProjects, startDate, endDate },
      })
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1201 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map(({ text, icon }) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  setSelectedPage(text);
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 3, md: 4 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />

        <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
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

          <Grid container spacing={3}>
            <Grid item xs={12}>
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
    </Box>
  );
}

export default App;
