import React from "react";
import "../../styles/services.css";
import Pesta from "../../img/Pestañas.webp";

export const PerfiladoPestanas = () => {
  return (
    <div className="card2">
      <div className="image-container">
        <img src={Pesta} className="service-img2" alt="pestañas" />
      </div>
      <div className="card-body">
        <h5 className="card-title2">
          <u>Perfilado de Pestañas</u>
        </h5>
        <p>
          <strong>Descripción:</strong> Lifting y extensión de pestañas para una mirada más intensa y definida. Realza tu mirada con un efecto natural o dramático, según tu estilo.
        </p>
        <p>
          <strong>Duración aproximada:</strong> 45 a 90 minutos.
        </p>
        <p>
          <strong>Precio:</strong> $800.
        </p>
        <p>
          <strong>¿Está en promoción?:</strong> No.
        </p>
        <p>
          <strong>Zonas que incluye:</strong> Ojos.
        </p>
      </div>
      <div className="btn-container">
        <button
          className="btn"
        //   onClick={handleButtonClick}  // Llama a la función handleButtonClick cuando se hace clic
        >
       Agendate!
        </button>
      </div>
    </div>
  );
};
