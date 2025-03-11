import React, { useState } from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Container, Grid, Paper, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import Dashboard from './Dashboard';
import UserCapacityTable from './UserCapacityTable'; // Import the UserCapacityTable component
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

function App() {
    const [selectedPage, setSelectedPage] = useState("Dashboard");
    const [projects, setProjects] = useState(['DAICO', 'Project B', 'Project C']);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon /> },
        { text: "User KPI", icon: <PeopleIcon /> },
        { text: "Project KPI", icon: <BusinessIcon /> }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Mobile Menu Button */}
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

            {/* Left Sidebar (Responsive) */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
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
                            <ListItem button key={text} onClick={() => { setSelectedPage(text); setMobileOpen(false); }}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content Area (Responsive) */}
            <Box component="main" sx={{
                flexGrow: 1,
                p: { xs: 1, sm: 3, md: 4 },
                width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
            }}>
                <Toolbar />

                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {selectedPage === "Dashboard" && <Dashboard selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} projects={projects} />}
                            {selectedPage === "User KPI" && <UserCapacityTable />}
                            {selectedPage === "Project KPI" && <Typography variant="h4">Project KPI (Coming Soon...)</Typography>}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default App;
