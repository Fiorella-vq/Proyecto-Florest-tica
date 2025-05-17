import click
from api.models import db, Reserva

def setup_commands(app):
    @app.cli.command("insert-test-reservas")
    @click.argument("count")
    def insert_test_reservas(count):
        print("Creando reservas de prueba...")
        for x in range(1, int(count) + 1):
            reserva = Reserva(
                nombre=f"Cliente {x}",
                telefono="123456789",
                fecha="2025-05-20",
                hora="10:00",
                servicio="Depilaciíon",
            )
            db.session.add(reserva)
        db.session.commit()
        print(f"{count} reservas creadas.")

    @app.cli.command("delete-all-reservas")
    def delete_all_reservas():
        print("Eliminando todas las reservas...")
        deleted = Reserva.query.delete()
        db.session.commit()
        print(f"{deleted} reservas eliminadas.")
