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
import {Depilaser} from "./component/depiLaser";
import {PerfiladoPestañas} from "./component/pestañas";
// import {Hifu} from "./component/hifu";
// import {Criolipolisis} from "./component/criolipolisis";
// import {Cejas} from "./component/cejas";
// import {Masajes} from "./component/masajes";
// import {Reductores} from "./component/reductores";
// import {Cuponeras} from "./component/cuponeras";    

//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<Depilaser />} path="/depiLaser" />
                        <Route element={<PerfiladoPestañas />} path="/pestañas" />   
                        {/* <Route element={<Hifu />} path="/hifu" /> */}
                        {/* <Route element={<Criolipolisis />} path="/criolipolisis" /> */}
                        {/* <Route element={<Cejas />} path="/cejas" /> */}
                        {/* <Route element={<Masajes />} path="/masajes" /> */}
                        {/* <Route element={<Reductores />} path="/reductores" /> */}
                        {/* <Route element={<Cuponeras />} path="/cuponeras" /> */}     
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
