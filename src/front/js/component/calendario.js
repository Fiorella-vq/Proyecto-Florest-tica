import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendario.css";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export const Calendario = () => {
  const [fecha, setFecha] = useState(new Date());
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [numeroCliente, setNumeroCliente] = useState(""); 
  const location = useLocation();

  const horas = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const manejarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
    const diaSeleccionado = nuevaFecha.getDate();
    if (diaSeleccionado % 2 === 0) {
      setHorasDisponibles(horas.slice(0, 5)); 
    } else {
      setHorasDisponibles(horas.slice(5));    
    }
  };

  const manejarCheckboxChange = async (e) => {
    const { value, checked } = e.target;
    const origen = location.state?.from || "Servicio";

    if (checked) {
      if (!numeroCliente || numeroCliente.length < 10) {
        Swal.fire("Por favor ingresá un número válido de WhatsApp.", "", "warning");
        e.target.checked = false; 
        return;
      }

     
      let numeroFormateado = numeroCliente.replace(/\D/g, "");

    
      if (!numeroFormateado.startsWith("54")) {
        numeroFormateado = "54" + numeroFormateado;
      }

      
      if (numeroFormateado.length < 13) {
        Swal.fire("El número ingresado no es válido. Debe tener al menos 11 dígitos.", "", "warning");
        e.target.checked = false; 
        return;
      }

      Swal.fire({
        title: `¿Confirmás tu turno a las ${value}?`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        denyButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const mensaje = `¡Hola! Tu turno para *${origen}* fue confirmado para el *${fecha.toDateString()}* a las *${value}*. ¡Gracias por elegirnos!`;

          try {
            // Llamada al backend para enviar el mensaje de WhatsApp
            const response = await axios.post('http://localhost:3001/api/enviar-mensaje', {
              numero: numeroFormateado,
              mensaje: mensaje,
            });
            
            if (response.status === 200) {
              Swal.fire("¡Turno confirmado!", "Tu mensaje ha sido enviado con éxito.", "success");
            } else {
              Swal.fire("Error", "No se pudo enviar el mensaje", "error");
            }
          } catch (error) {
            Swal.fire("Error", "Hubo un problema al enviar el mensaje", "error");
          }
        } else if (result.isDenied) {
          Swal.fire("Reserva cancelada", "", "info");
          e.target.checked = false; 
        }
      });
    }
  };

  return (
    <div className="calendario-container">
      <h2>{location.state?.from || "Servicio"}</h2>
      <Calendar onChange={manejarFecha} value={fecha} />
      <p>Fecha seleccionada: {fecha.toDateString()}</p>

      <div className="numero-whatsapp">
        <label>Tu número de WhatsApp:</label>
        <input
          type="tel"
          placeholder="Ej: +9898111226"
          value={numeroCliente}
          onChange={(e) => setNumeroCliente(e.target.value)}
        />
      </div>

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