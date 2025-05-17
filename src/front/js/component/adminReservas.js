import React, { useState, useEffect } from "react";

export const AdminReservas = () => {
  const [fecha, setFecha] = useState("");
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claveIngresada, setClaveIngresada] = useState("");
  const [claveError, setClaveError] = useState("");
  const [accesoPermitido, setAccesoPermitido] = useState(false);

  const CLAVE_SECRETA = "Florencia";

  // Para resetear el acceso cada vez que se monta
  useEffect(() => {
    setAccesoPermitido(false);
    setClaveIngresada("");
    setClaveError("");
    setFecha("");
    setReservas([]);
  }, []);

  const handleSubmitClave = (e) => {
    e.preventDefault();
    if (claveIngresada === CLAVE_SECRETA) {
      setAccesoPermitido(true);
      setClaveError("");
    } else {
      setClaveError("Clave incorrecta");
    }
  };

  useEffect(() => {
    if (!fecha || !accesoPermitido) return;

    async function fetchReservas() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/reservas?fecha=${fecha}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error cargando reservas");
          setReservas([]);
        } else {
          setReservas(data.reservas || []);
        }
      } catch (e) {
        setError("Error de conexión");
        setReservas([]);
      }
      setLoading(false);
    }

    fetchReservas();
  }, [fecha, accesoPermitido]);

  if (!accesoPermitido) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Acceso solo para administradores</h2>
        <form onSubmit={handleSubmitClave}>
          <label>
            Ingresá la clave:
            <input
              type="password"
              value={claveIngresada}
              onChange={(e) => setClaveIngresada(e.target.value)}
              style={{ marginLeft: "10px" }}
            />
          </label>
          <button type="submit" style={{ marginLeft: "10px" }}>
            Ingresar
          </button>
          {claveError && <p style={{ color: "red" }}>{claveError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Reservas por Fecha</h2>
      <label>
        Selecciona fecha:
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </label>

      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && reservas.length === 0 && fecha && (
        <p>No hay reservas para esta fecha.</p>
      )}

      {!loading && reservas.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Servicio</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.email}</td>
                <td>{r.telefono}</td>
                <td>{r.fecha}</td>
                <td>{r.hora}</td>
                <td>{r.servicio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
