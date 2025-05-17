import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { Depilaser } from "./component/depiLaser";
import { PerfiladoPestanas } from "./component/pestanas";
import { Hifu } from "./component/hifu";
import { Criolipolisis } from "./component/criolipolisis";
import { PerfiladoCejas } from "./component/cejas";
import { MasajesDescontracturantes } from "./component/masajes";
import { Reductores } from "./component/reductores";
import { Cuponeras } from "./component/cuponeras";
import { Calendario } from "./component/calendario";
import { AdminReservas } from "./component/adminReservas";

const Layout = () => {
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/demo" element={<Demo />} />
                        <Route path="/single/:theid" element={<Single />} />
                        <Route path="/depiLaser" element={<Depilaser />} />
                        <Route path="/pestanas" element={<PerfiladoPestanas />} />
                        <Route path="/hifu" element={<Hifu />} />
                        <Route path="/criolipolisis" element={<Criolipolisis />} />
                        <Route path="/cejas" element={<PerfiladoCejas />} />
                        <Route path="/masajes" element={<MasajesDescontracturantes />} />
                        <Route path="/reductores" element={<Reductores />} />
                        <Route path="/cuponeras" element={<Cuponeras />} />
                        <Route path="/calendario" element={<Calendario />} />
                        <Route path="/adminReservas" element={<AdminReservas />} />
                        <Route path="*" element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
