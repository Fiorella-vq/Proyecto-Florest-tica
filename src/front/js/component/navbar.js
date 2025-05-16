import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import Loto from "../../img/loto.png";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm">
      <div className="container">
        <img
          src={Loto}
          alt="Logo Flor Estética Integral"
          className="navbar-logo"
        />
        <h2>Flor Estética Integral</h2>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/sobre-mi" className="nav-link" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
  Sobre mí
</Link>

            </li>
            <li className="nav-item">
              <Link to="/informacion-adicional" className="nav-link">
                Información adicional
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cuponeras" className="nav-link">
                Cuponeras
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/horarios-disponibilidad" className="nav-link">
                Horarios y disponibilidad
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/testimonios" className="nav-link">
                Testimonios
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
