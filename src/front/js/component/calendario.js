import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendario.css";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2

export const Calendario = () => {
  const [fecha, setFecha] = useState(new Date());
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const location = useLocation();

  const horas = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00"
  ];

  const manejarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
    const diaSeleccionado = nuevaFecha.getDate();
    if (diaSeleccionado % 2 === 0) {
      setHorasDisponibles(horas.slice(0, 5));  // Horas de 08:00 a 12:00 en días pares
    } else {
      setHorasDisponibles(horas.slice(5));  // Horas de 13:00 a 17:00 en días impares
    }
  };

  const manejarCheckboxChange = (e) => {
    const { value, checked } = e.target;

    // Aquí llamamos a la función SweetAlert cuando el usuario marca un checkbox
    if (checked) {
      Swal.fire({
        title: `¿Quieres reservar para las ${value}?`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sí",
        denyButtonText: "No",
        customClass: {
          container: 'swal-container', // Ajusta el estilo del contenedor
          title: 'swal-title',  // Ajusta el título
          confirmButton: 'swal-confirm-btn', // Ajusta el botón de confirmación
          denyButton: 'swal-deny-btn', // Ajusta el botón de negación
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("¡Reserva confirmada!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Reserva cancelada", "", "info");
        }
      });
    }
  };

  const origen = location.state?.from || "Desconocido";

  return (
    <div className="calendario-container">
      <h2>{origen}</h2>
      <Calendar onChange={manejarFecha} value={fecha} />
      <p>Fecha seleccionada: {fecha.toDateString()}</p>

      {horasDisponibles.length > 0 && (
        <div className="horas-disponibles">
          <h3>Horas disponibles:</h3>
          {horasDisponibles.map((hora) => (
            <label key={hora} className="hora-checkbox">
              <input
                type="checkbox"
                value={hora}
                onChange={manejarCheckboxChange}
              />
              {hora}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
