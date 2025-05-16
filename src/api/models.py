from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.String(50), nullable=False)
    hora = db.Column(db.String(5), nullable=False)
    servicio = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<Reserva {self.nombre} {self.fecha} {self.hora} {self.servicio}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "telefono": self.telefono,
            "fecha": self.fecha,
            "hora": self.hora,
            "servicio": self.servicio
        }
