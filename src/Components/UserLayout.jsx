import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function UserLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-[#F8F6F1]">
            <Header />
            <main className="flex-1 pb-12">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default UserLayout;