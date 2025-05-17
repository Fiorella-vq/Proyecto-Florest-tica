import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendario.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Calendario = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fecha, setFecha] = useState(new Date());
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  const horas = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const formatearHora = (hora) => {
    const [h, m] = hora.split(":");
    return h.padStart(2, "0") + ":" + (m ? m.padStart(2, "0") : "00");
  };

  const cargarHorasDisponibles = async (nuevaFecha) => {
    try {
      const dia = nuevaFecha.getDate();
      const fechaISO = nuevaFecha.toISOString().slice(0, 10);

      const response = await fetch(
        `http://localhost:3001/api/reservas?fecha=${fechaISO}`
      );
      if (!response.ok) throw new Error("Error al obtener reservas");

      const data = await response.json();
      const reservasDelDia = data.reservas;

      const horasOcupadas = reservasDelDia.map((r) => formatearHora(r.hora));

      // Si el día es par, mostrar las primeras 5 horas; si es impar, las últimas 5
      const horasDia = dia % 2 === 0 ? horas.slice(0, 5) : horas.slice(5);
      const horasDiaFormateadas = horasDia.map(formatearHora);

      const libres = horasDiaFormateadas.filter(
        (hora) => !horasOcupadas.includes(hora)
      );

      setHorasDisponibles(libres);

      // Si la hora seleccionada ya no está disponible, la borramos
      if (!libres.includes(horaSeleccionada)) {
        setHoraSeleccionada(null);
      }
    } catch {
      Swal.fire(
        "Error",
        "No se pudieron cargar las horas disponibles.",
        "error"
      );
      setHorasDisponibles([]);
      setHoraSeleccionada(null);
    }
  };

  useEffect(() => {
    cargarHorasDisponibles(fecha);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const manejarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
  };

  const manejarRadioChange = (e) => {
    setHoraSeleccionada(e.target.value);
  };

  const confirmarReserva = async () => {
    if (
      !nombre.trim() ||
      !telefono.trim() ||
      !emailCliente.trim() ||
      !horaSeleccionada
    ) {
      Swal.fire(
        "Atención",
        "Por favor completá todos los campos y seleccioná una hora.",
        "warning"
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailCliente)) {
      Swal.fire(
        "Atención",
        "Por favor ingresá un correo electrónico válido.",
        "warning"
      );
      return;
    }

    const servicio = location.state?.from || "Servicio";

    const result = await Swal.fire({
      title: `¿Confirmás tu turno para ${servicio} a las ${horaSeleccionada}?`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      denyButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        const fechaISO = fecha.toISOString().slice(0, 10);

        const crearResponse = await fetch(
          "http://localhost:3001/api/reservas",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fecha: fechaISO,
              hora: horaSeleccionada,
              nombre,
              telefono,
              email: emailCliente,
              servicio,
            }),
          }
        );

        if (!crearResponse.ok) {
          const errorData = await crearResponse.json();
          throw new Error(errorData.error || "No se pudo crear la reserva");
        }

        await crearResponse.json();

        Swal.fire(
          "¡Turno confirmado!",
          "Tu reserva fue creada con éxito.",
          "success"
        );

        
        setNombre("");
        setTelefono("");
        setEmailCliente("");
        setHoraSeleccionada(null);

       
        cargarHorasDisponibles(fecha);

        navigate("/");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    } else if (result.isDenied) {
      Swal.fire("Reserva cancelada", "", "info");
    }
  };

  const deshabilitarDiasPasados = ({ date, view }) => {
    if (view === "month") {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return date < hoy;
    }
    return false;
  };

  const asignarClaseCalendario = ({ date, view }) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (view === "month" && date < hoy) {
      return "dia-pasado";
    }
    return null;
  };

  return (
    <div className="calendario-container">
      <h2>{location.state?.from || "Servicio"}</h2>
      <Calendar
        onChange={manejarFecha}
        value={fecha}
        tileDisabled={deshabilitarDiasPasados}
        tileClassName={asignarClaseCalendario}
        locale="es-ES"
      />
      <p>
        Fecha seleccionada:{" "}
        {fecha
          .toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          .replace(/^\w/, (c) => c.toUpperCase())}
      </p>

      <div className="datos-cliente">
        <label>Nombre:</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <label>Teléfono:</label>
        <input
          type="tel"
          placeholder="Tu teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <label>Correo electrónico:</label>
        <input
          type="email"
          placeholder="usuario@ejemplo.com"
          value={emailCliente}
          onChange={(e) => setEmailCliente(e.target.value)}
        />
      </div>

      {horasDisponibles.length > 0 ? (
        <>
          <h3>Horas disponibles:</h3>
          {horasDisponibles.map((hora) => (
            <label key={hora}>
              <input
                type="radio"
                name="hora"
                value={hora}
                checked={horaSeleccionada === hora}
                onChange={manejarRadioChange}
              />
              {hora}
            </label>
          ))}
          <button onClick={confirmarReserva} disabled={!horaSeleccionada}>
            Confirmar turno
          </button>
        </>
      ) : (
        <p>No hay horas disponibles para esta fecha.</p>
      )}
    </div>
  );
};
