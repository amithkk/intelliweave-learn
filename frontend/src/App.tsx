import {useEffect, useState} from 'react'
import './App.css'
import { NavbarSimple} from "./components/HeaderTabs/NavbarSimple.tsx";
import {AppShell, Burger, Group, MantineProvider, Text, Skeleton, Box} from "@mantine/core";
import '@mantine/core/styles.css';
import {Simulate} from "react-dom/test-utils";
import toggle = Simulate.toggle;
import {useDisclosure} from "@mantine/hooks";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";

function App() {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate('/lessons');
        }
    }, [location, navigate]);

  return (
    <MantineProvider>
        <AppShell
            header={{ height: 0, collapsed: true }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: false },
            }}
            padding="md"
        >

            <AppShell.Navbar  p="md"><NavbarSimple></NavbarSimple></AppShell.Navbar>

            <AppShell.Main bg={"gray.0"}><Outlet/></AppShell.Main>
        </AppShell>
    </MantineProvider>
  )
}

export default App
