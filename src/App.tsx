import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Buckets from "./pages/Buckets";
import Keys from "./pages/Keys";
import Users from "./pages/Users";
import Groups from "./pages/Groups";
import Permissions from "./pages/Permissions";
import Members from "./pages/Members";
import { OrganizationProvider } from "./context/OrganizationContext";


export default function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <OrganizationProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/buckets" element={<Buckets />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/keys" element={<Keys />} />
              <Route path="/users" element={<Users />} />
              <Route path="/members" element={<Members />} />
              <Route path="/permissions" element={<Permissions />} />
            </Routes>
          </Layout>
        </OrganizationProvider>
      </SignedIn>
    </>
  );
}

