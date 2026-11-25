
import { Outlet } from "react-router-dom";
import MenuLateral from "./MenuLateral";

function ExplorarLayout() {
    return (
        <>
            <MenuLateral />
            <Outlet />
        </>
    );
}

export default ExplorarLayout;
