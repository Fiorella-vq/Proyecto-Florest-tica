const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            reservations: [],
            demo: [
                { title: "FIRST", background: "white", initial: "white" },
                { title: "SECOND", background: "white", initial: "white" }
            ]
        },
        actions: {
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },

            getReservations: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/reservas", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setStore({ reservations: data });
                        return data;
                    } else {
                        console.error("Error al obtener las reservas:", response.status);
                        return false;
                    }
                } catch (error) {
                    console.error("Error al obtener las reservas:", error);
                    return false;
                }
            },

            deleteReservation: async (id) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/reservas", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ reserva_id: id })
                    });
                    if (response.ok) {
                        console.log("Reserva borrada exitosamente");
                        return true;
                    } else {
                        console.error("Error al borrar la reserva:", response.statusText);
                        return false;
                    }
                } catch (error) {
                    console.error("Error al borrar la reserva:", error);
                    return false;
                }
            },

            submitReservations: async (selectedReservations) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/reservas", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(selectedReservations)
                    });
                    if (!response.ok) {
                        throw new Error(`Error al guardar las reservas: ${response.statusText}`);
                    }
                    return true;
                } catch (error) {
                    console.log("Error al guardar las reservas:", error);
                    return false;
                }
            }
        }
    };
};

export default getState;
