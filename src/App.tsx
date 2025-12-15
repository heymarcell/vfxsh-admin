import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Buckets from "./pages/Buckets";
import Keys from "./pages/Keys";
import Users from "./pages/Users";
import Groups from "./pages/Groups";
import Permissions from "./pages/Permissions";
import Members from "./pages/Members";
import CliAuth from "./pages/CliAuth";
import { OrganizationProvider } from "./context/OrganizationContext";

// Platform (Super Admin) Pages
import PlatformProviders from "./pages/platform/Providers";
import PlatformBuckets from "./pages/platform/Buckets";
import PlatformOrganizations from "./pages/platform/Organizations";
import PlatformUsers from "./pages/platform/Users";
import PlatformAudit from "./pages/platform/AuditLog";
import Files from "./pages/platform/Files";
import PlatformLocks from "./pages/platform/Locks";


export default function App() {
  return (
    <Routes>
      {/* CLI Auth route - accessible without SignedIn check (handles its own auth) */}
      <Route path="/cli-auth" element={<CliAuth />} />
      
      {/* Main app routes */}
      <Route path="/*" element={
        <>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <OrganizationProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  {/* Legacy routes (redirects to platform for super admin) */}
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/buckets" element={<Buckets />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/keys" element={<Keys />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/permissions" element={<Permissions />} />
                  
                  {/* Platform (Super Admin) Routes */}
                  <Route path="/platform/providers" element={<PlatformProviders />} />
                  <Route path="/platform/files" element={<Files />} />
                  <Route path="/platform/locks" element={<PlatformLocks />} />
                  <Route path="/platform/buckets" element={<PlatformBuckets />} />
                  <Route path="/platform/organizations" element={<PlatformOrganizations />} />
                  <Route path="/platform/users" element={<PlatformUsers />} />
                  <Route path="/platform/audit" element={<PlatformAudit />} />
                </Routes>
              </Layout>
            </OrganizationProvider>
          </SignedIn>
        </>
      } />
    </Routes>
  );
}
