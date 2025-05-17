from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime, date

db = SQLAlchemy()

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.String(5), nullable=False)
    servicio = db.Column(db.String(100), nullable=True)
    token = db.Column(db.String(50), unique=True, nullable=False)
    cancelada = db.Column(db.Boolean, default=False)

    def __init__(self, nombre, telefono, email, fecha, hora, servicio, token, cancelada=False):
        self.nombre = nombre
        self.telefono = telefono
        self.email = email
        self.fecha = fecha
        self.hora = hora
        self.servicio = servicio
        self.token = token
        self.cancelada = cancelada

